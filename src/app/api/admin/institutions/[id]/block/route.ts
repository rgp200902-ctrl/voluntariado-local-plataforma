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

    if (decoded.role !== 'administrador') {
      return errorResponse('Acesso negado', 403);
    }

    const institution = await prisma.institution.update({
      where: { id: params.id },
      data: { estado_validacao: 'recusada' },
    });

    // Create audit log
    await createAuditLog({
      acao: 'bloquear_instituicao',
      entidade: 'instituicao',
      entidade_id: params.id,
      utilizador_id: decoded.userId,
      detalhe: `Instituição bloqueada: ${institution.nome}`,
    });

    return successResponse(institution, 'Instituição bloqueada com sucesso');
  } catch (error) {
    console.error('Error blocking institution:', error);
    return errorResponse('Erro ao bloquear instituição', 500);
  }
}
