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

    if (decoded.role !== 'administrador') {
      return errorResponse('Acesso negado', 403);
    }

    const body = await request.json();
    const { ativo } = body;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { ativo },
    });

    await createAuditLog({
      acao: ativo ? 'ativar_utilizador' : 'desativar_utilizador',
      entidade: 'utilizador',
      entidade_id: params.id,
      utilizador_id: decoded.userId,
      detalhe: `Utilizador ${user.nome} ${ativo ? 'ativado' : 'desativado'}`,
    });

    return successResponse(user, 'Utilizador atualizado com sucesso');
  } catch (error) {
    console.error('Error updating user:', error);
    return errorResponse('Erro ao atualizar utilizador', 500);
  }
}
