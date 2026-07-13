import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
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

    if (institution.estado_validacao !== 'aprovada') {
      return errorResponse('Apenas instituições aprovadas podem publicar oportunidades');
    }

    const body = await request.json();
    const { title, description, requirements, location, parish, date, endDate, schedule, slots, minAge, desiredSkills, category, status } = body;

    if (!title || !description) {
      return errorResponse('Título e descrição são obrigatórios');
    }

    const opportunity = await prisma.oportunidade.create({
      data: {
        titulo: title,
        descricao: description,
        requisitos: requirements,
        local: location,
        freguesia: parish,
        data_inicio: date ? new Date(date) : null,
        data_fim: endDate ? new Date(endDate) : null,
        horario: schedule,
        vagas: slots || 1,
        idade_minima: minAge,
        estado: status || 'rascunho',
        instituicao_id: institution.id,
        categoria_id: category || null,
        publicada_em: status === 'publicada' ? new Date() : null,
      },
    });

    // Create audit log
    await createAuditLog({
      acao: 'criar_oportunidade',
      entidade: 'oportunidade',
      entidade_id: opportunity.id,
      utilizador_id: decoded.userId,
      detalhe: `Oportunidade criada: ${title}`,
    });

    return successResponse(opportunity, 'Oportunidade criada com sucesso');
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Não autorizado', 401);
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return errorResponse('Acesso negado', 403);
    }
    console.error('Error creating opportunity:', error);
    return errorResponse('Erro ao criar oportunidade', 500);
  }
}
