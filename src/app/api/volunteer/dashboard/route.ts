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

    const volunteer = await prisma.volunteer.findFirst({
      where: { user_id: decoded.userId },
    });

    if (!volunteer) {
      return errorResponse('Voluntário não encontrado', 404);
    }

    const [
      totalRegistrations,
      pendingRegistrations,
      acceptedRegistrations,
    ] = await Promise.all([
      prisma.inscricao.count({
        where: { voluntario_id: decoded.userId },
      }),
      prisma.inscricao.count({
        where: { voluntario_id: decoded.userId, estado: 'submetida' },
      }),
      prisma.inscricao.count({
        where: { voluntario_id: decoded.userId, estado: 'aceite' },
      }),
    ]);

    const registrations = await prisma.inscricao.findMany({
      where: { voluntario_id: decoded.userId },
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

    return successResponse({
      stats: {
        totalRegistrations,
        pendingRegistrations,
        acceptedRegistrations,
      },
      registrations,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Não autorizado', 401);
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return errorResponse('Acesso negado', 403);
    }
    console.error('Error fetching volunteer dashboard:', error);
    return errorResponse('Erro ao buscar dados do painel', 500);
  }
}
