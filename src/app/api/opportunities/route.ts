import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const status = searchParams.get('status');

    const where: any = {
      estado: status || 'publicada',
    };

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoria_id = category;
    }

    if (location) {
      where.local = { contains: location, mode: 'insensitive' };
    }

    const opportunities = await prisma.oportunidade.findMany({
      where,
      include: {
        institution: {
          select: {
            id: true,
            nome: true,
          },
        },
        category: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { criada_em: 'desc' },
    });

    const result = opportunities.map((opp) => ({
      ...opp,
      registrations: opp._count.registrations,
    }));

    return successResponse(result);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return errorResponse('Erro ao buscar oportunidades', 500);
  }
}
