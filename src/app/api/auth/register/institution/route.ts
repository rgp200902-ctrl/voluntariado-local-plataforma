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
      institutionName,
      nif,
      type,
      description,
      address,
      phone,
      website,
      contactPerson,
      category,
    } = body;

    if (!name || !email || !password || !institutionName) {
      return errorResponse('Nome, email, palavra-passe e nome da instituição são obrigatórios');
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
        perfil: 'instituicao',
        institution: {
          create: {
            nome: institutionName,
            descricao: description,
            morada: address,
            telefone: phone,
            email,
            nif,
            tipo: type,
            pessoa_contacto: contactPerson,
            website,
            categoria: category,
            estado_validacao: 'pendente',
          },
        },
      },
      include: {
        institution: true,
      },
    });

    // Create audit log
    await createAuditLog({
      acao: 'registo',
      entidade: 'instituicao',
      entidade_id: user.id,
      detalhe: `Instituição registada: ${institutionName}`,
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
        institution: user.institution,
      },
    });
  } catch (error) {
    console.error('Institution registration error:', error);
    return errorResponse('Erro ao registar instituição', 500);
  }
}
