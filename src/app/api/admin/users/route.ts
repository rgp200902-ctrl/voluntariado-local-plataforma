import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Não autorizado', 401);
    }

    const jwt = require('jsonwebtoken');
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;

    if (decoded.role !== 'administrador') {
      return errorResponse('Acesso negado', 403);
    }

    const { searchParams } = new URL(request.url);
    const perfil = searchParams.get('perfil');

    const where: any = {};
    if (perfil) {
      where.perfil = perfil;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        data_criacao: true,
        ultimo_acesso: true,
      },
      orderBy: { data_criacao: 'desc' },
    });

    return successResponse(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse('Erro ao buscar utilizadores', 500);
  }
}
