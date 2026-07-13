import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

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
    const { nome, descricao, ativa } = body;

    const category = await prisma.categoria.update({
      where: { id: params.id },
      data: {
        ...(nome && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(ativa !== undefined && { ativa }),
      },
    });

    return successResponse(category, 'Categoria atualizada com sucesso');
  } catch (error) {
    console.error('Error updating category:', error);
    return errorResponse('Erro ao atualizar categoria', 500);
  }
}

export async function DELETE(
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

    const category = await prisma.categoria.findUnique({
      where: { id: params.id },
      include: { _count: { select: { opportunities: true } } },
    });

    if (!category) {
      return errorResponse('Categoria não encontrada', 404);
    }

    if (category._count.opportunities > 0) {
      return errorResponse('Não é possível eliminar categorias com oportunidades associadas');
    }

    await prisma.categoria.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Categoria eliminada com sucesso');
  } catch (error) {
    console.error('Error deleting category:', error);
    return errorResponse('Erro ao eliminar categoria', 500);
  }
}
