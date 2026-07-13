import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

export async function PUT(
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

    // Business Rule 4: Institution can only manage registrations for their own opportunities
    const registration = await prisma.inscricao.findUnique({
      where: { id: params.id },
      include: { opportunity: true },
    });

    if (!registration) {
      return errorResponse('Inscrição não encontrada', 404);
    }

    if (registration.opportunity.instituicao_id !== institution.id) {
      return errorResponse('Não tem permissão para gerir esta inscrição', 403);
    }

    const body = await request.json();
    const { estado, observacoes } = body;

    const validStatuses = ['aceite', 'recusada', 'concluida'];
    if (!validStatuses.includes(estado)) {
      return errorResponse('Estado inválido');
    }

    const updated = await prisma.inscricao.update({
      where: { id: params.id },
      data: {
        estado,
        data_decisao: new Date(),
        observacoes_instituicao: observacoes,
      },
    });

    // Business Rule 6: When accepted, notify that contact data is now visible
    let detalhe = `Inscrição ${estado}`;
    if (estado === 'aceite') {
      detalhe += ' - Dados de contacto do voluntário agora visíveis';
    }

    // Create audit log
    await createAuditLog({
      acao: `inscricao_${estado}`,
      entidade: 'inscricao',
      entidade_id: params.id,
      utilizador_id: decoded.userId,
      detalhe,
    });

    return successResponse(updated, 'Inscrição atualizada com sucesso');
  } catch (error) {
    console.error('Error updating registration:', error);
    return errorResponse('Erro ao atualizar inscrição', 500);
  }
}
