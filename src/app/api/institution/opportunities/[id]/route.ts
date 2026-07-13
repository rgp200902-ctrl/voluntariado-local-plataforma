import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const opportunity = await prisma.oportunidade.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!opportunity) {
      return errorResponse('Oportunidade não encontrada', 404);
    }

    if (opportunity.instituicao_id !== institution.id) {
      return errorResponse('Não tem permissão para ver esta oportunidade', 403);
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
