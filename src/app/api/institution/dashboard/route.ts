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

    if (decoded.role !== 'instituicao') {
      return errorResponse('Acesso negado', 403);
    }

    const institution = await prisma.institution.findFirst({
      where: { user_id: decoded.userId },
    });

    if (!institution) {
      return errorResponse('Instituição não encontrada', 404);
    }

    const [
      totalOpportunities,
      activeOpportunities,
      totalRegistrations,
      pendingRegistrations,
    ] = await Promise.all([
      prisma.oportunidade.count({
        where: { instituicao_id: institution.id },
      }),
      prisma.oportunidade.count({
        where: { instituicao_id: institution.id, estado: { in: ['publicada', 'aberta'] } },
      }),
      prisma.inscricao.count({
        where: { opportunity: { instituicao_id: institution.id } },
      }),
      prisma.inscricao.count({
        where: {
          opportunity: { instituicao_id: institution.id },
          estado: 'submetida',
        },
      }),
    ]);

    const opportunities = await prisma.oportunidade.findMany({
      where: { instituicao_id: institution.id },
      include: {
        category: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { criada_em: 'desc' },
    });

    return successResponse({
      stats: {
        totalOpportunities,
        activeOpportunities,
        totalRegistrations,
        pendingRegistrations,
      },
      opportunities: opportunities.map((opp) => ({
        ...opp,
        registrations: opp._count.registrations,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Não autorizado', 401);
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return errorResponse('Acesso negado', 403);
    }
    console.error('Error fetching institution dashboard:', error);
    return errorResponse('Erro ao buscar dados do painel', 500);
  }
}
