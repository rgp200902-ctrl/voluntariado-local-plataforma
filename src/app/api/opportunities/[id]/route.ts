import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.oportunidade.findUnique({
      where: { id: params.id },
      include: {
        institution: true,
        category: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!opportunity) {
      return errorResponse('Oportunidade não encontrada', 404);
    }

    return successResponse({
      ...opportunity,
      registrations: opportunity._count.registrations,
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return errorResponse('Erro ao buscar oportunidade', 500);
  }
}
