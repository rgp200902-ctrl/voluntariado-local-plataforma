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
    const period = searchParams.get('period') || 'month';

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    const [
      totalUsers,
      totalInstitutions,
      totalVolunteers,
      totalOpportunities,
      totalRegistrations,
      newUsersThisPeriod,
      newOpportunitiesThisPeriod,
      newRegistrationsThisPeriod,
      opportunitiesByCategory,
      registrationsByStatus,
      topInstitutions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.institution.count(),
      prisma.volunteer.count(),
      prisma.oportunidade.count(),
      prisma.inscricao.count(),
      prisma.user.count({ where: { data_criacao: { gte: startDate } } }),
      prisma.oportunidade.count({ where: { criada_em: { gte: startDate } } }),
      prisma.inscricao.count({ where: { data_inscricao: { gte: startDate } } }),
      prisma.oportunidade.groupBy({
        by: ['categoria_id'],
        _count: true,
      }),
      prisma.inscricao.groupBy({
        by: ['estado'],
        _count: true,
      }),
      prisma.institution.findMany({
        where: { estado_validacao: 'aprovada' },
        select: {
          id: true,
          nome: true,
          _count: {
            select: { opportunities: true },
          },
        },
        orderBy: {
          opportunities: { _count: 'desc' },
        },
        take: 10,
      }),
    ]);

    return successResponse({
      summary: {
        totalUsers,
        totalInstitutions,
        totalVolunteers,
        totalOpportunities,
        totalRegistrations,
        newUsersThisPeriod,
        newOpportunitiesThisPeriod,
        newRegistrationsThisPeriod,
      },
      opportunitiesByCategory: opportunitiesByCategory.map((item) => ({
        categoria_id: item.categoria_id || 'Sem categoria',
        count: item._count,
      })),
      registrationsByStatus: registrationsByStatus.map((item) => ({
        estado: item.estado,
        count: item._count,
      })),
      topInstitutions: topInstitutions.map((inst) => ({
        id: inst.id,
        nome: inst.nome,
        opportunitiesCount: inst._count.opportunities,
      })),
      period,
      startDate,
      endDate: now,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return errorResponse('Erro ao gerar relatório', 500);
  }
}
