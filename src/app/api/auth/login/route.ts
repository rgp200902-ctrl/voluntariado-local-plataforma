import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email e palavra-passe são obrigatórios');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        institution: true,
        volunteer: true,
      },
    });

    if (!user) {
      return errorResponse('Credenciais inválidas');
    }

    if (!user.ativo) {
      return errorResponse('Conta desativada. Contacte o administrador.');
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse('Credenciais inválidas');
    }

    // Update last access
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimo_acesso: new Date() },
    });

    // Create audit log
    await createAuditLog({
      acao: 'login',
      entidade: 'utilizador',
      entidade_id: user.id,
      detalhe: `Login efetuado com sucesso`,
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
        avatar: user.volunteer?.avatar || '',
        institution: user.institution,
        volunteer: user.volunteer,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}
