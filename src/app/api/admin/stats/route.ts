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

    const [
      totalUsers,
      totalInstitutions,
      totalVolunteers,
      totalOpportunities,
      pendingInstitutions,
      activeOpportunities,
      totalRegistrations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.institution.count(),
      prisma.volunteer.count(),
      prisma.oportunidade.count(),
      prisma.inscricao.count({ where: { estado: 'submetida' } }),
      prisma.oportunidade.count({ where: { estado: { in: ['publicada', 'aberta'] } } }),
      prisma.inscricao.count(),
    ]);

    const pendingInstitutionsList = await prisma.institution.findMany({
      where: { estado_validacao: 'pendente' },
      orderBy: { data_criacao: 'desc' },
      take: 10,
    });

    return successResponse({
      stats: {
        totalUsers,
        totalInstitutions,
        totalVolunteers,
        totalOpportunities,
        pendingInstitutions,
        activeOpportunities,
        totalRegistrations,
      },
      pendingInstitutions: pendingInstitutionsList,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Não autorizado', 401);
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return errorResponse('Acesso negado', 403);
    }
    console.error('Error fetching admin stats:', error);
    return errorResponse('Erro ao buscar estatísticas', 500);
  }
}
