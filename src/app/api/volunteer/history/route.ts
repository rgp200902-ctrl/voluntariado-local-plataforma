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

    if (decoded.role !== 'voluntario') {
      return errorResponse('Acesso negado', 403);
    }

    const registrations = await prisma.inscricao.findMany({
      where: {
        voluntario_id: decoded.userId,
        estado: { in: ['aceite', 'concluida', 'recusada', 'cancelada'] },
      },
      include: {
        opportunity: {
          include: {
            institution: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: { data_inscricao: 'desc' },
    });

    return successResponse(registrations);
  } catch (error) {
    console.error('Error fetching history:', error);
    return errorResponse('Erro ao buscar histórico', 500);
  }
}
