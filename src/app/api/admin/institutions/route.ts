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
    const estado = searchParams.get('estado');

    const where: any = {};
    if (estado) {
      where.estado_validacao = estado;
    }

    const institutions = await prisma.institution.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { data_criacao: 'desc' },
    });

    return successResponse(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return errorResponse('Erro ao buscar instituições', 500);
  }
}
