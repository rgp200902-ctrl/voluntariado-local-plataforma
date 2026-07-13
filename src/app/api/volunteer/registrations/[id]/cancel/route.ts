import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

export async function POST(
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

    if (decoded.role !== 'voluntario') {
      return errorResponse('Acesso negado', 403);
    }

    const registration = await prisma.inscricao.findUnique({
      where: { id: params.id },
      include: { opportunity: true },
    });

    if (!registration) {
      return errorResponse('Inscrição não encontrada', 404);
    }

    if (registration.voluntario_id !== decoded.userId) {
      return errorResponse('Não tem permissão para cancelar esta inscrição', 403);
    }

    // Business Rule 8: Volunteer can cancel while opportunity is not completed
    if (registration.opportunity.estado === 'concluida') {
      return errorResponse('Não é possível cancelar inscrição em oportunidade concluída');
    }

    if (registration.estado !== 'submetida' && registration.estado !== 'aceite') {
      return errorResponse('Só é possível cancelar inscrições submetidas ou aceites');
    }

    const updated = await prisma.inscricao.update({
      where: { id: params.id },
      data: { estado: 'cancelada' },
    });

    // Create audit log
    await createAuditLog({
      acao: 'cancelar_inscricao',
      entidade: 'inscricao',
      entidade_id: params.id,
      utilizador_id: decoded.userId,
      detalhe: `Inscrição cancelada pelo voluntário`,
    });

    return successResponse(updated, 'Inscrição cancelada com sucesso');
  } catch (error) {
    console.error('Error canceling registration:', error);
    return errorResponse('Erro ao cancelar inscrição', 500);
  }
}
