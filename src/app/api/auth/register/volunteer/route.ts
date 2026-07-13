import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      address,
      parish,
      dateOfBirth,
      ageRange,
      skills,
      availability,
      areasOfInterest,
      motivation,
      consentData,
      acceptTerms,
    } = body;

    if (!name || !email || !password) {
      return errorResponse('Nome, email e palavra-passe são obrigatórios');
    }

    if (!consentData) {
      return errorResponse('O consentimento para tratamento de dados é obrigatório (RGPD)');
    }

    if (!acceptTerms) {
      return errorResponse('A aceitação dos termos de utilização é obrigatória');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('Já existe uma conta com este email');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        nome: name,
        email,
        password_hash: hashedPassword,
        perfil: 'voluntario',
        volunteer: {
          create: {
            telefone: phone,
            localidade: address || parish,
            data_nascimento: dateOfBirth ? new Date(dateOfBirth) : null,
            faixa_etaria: ageRange,
            disponibilidade: availability,
            interesses: areasOfInterest,
            competencias: skills,
            consentimento_rgpd: true,
            data_consentimento: new Date(),
          },
        },
      },
      include: {
        volunteer: true,
      },
    });

    // Create audit log
    await createAuditLog({
      acao: 'registo',
      entidade: 'voluntario',
      entidade_id: user.id,
      detalhe: `Voluntário registado: ${name}`,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.perfil,
      name: user.nome,
    });

    return successResponse({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        volunteer: user.volunteer,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Erro ao registar voluntário', 500);
  }
}
