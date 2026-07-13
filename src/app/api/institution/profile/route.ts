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

    if (decoded.role !== 'instituicao') {
      return errorResponse('Acesso negado', 403);
    }

    const institution = await prisma.institution.findFirst({
      where: { user_id: decoded.userId },
    });

    if (!institution) {
      return errorResponse('Instituição não encontrada', 404);
    }

    return successResponse(institution);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return errorResponse('Erro ao buscar perfil', 500);
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { nome, nif, tipo, morada, telefone, email, website, pessoa_contacto, descricao, categoria } = body;

    const updated = await prisma.institution.update({
      where: { id: institution.id },
      data: {
        nome,
        nif,
        tipo,
        morada,
        telefone,
        email,
        website,
        pessoa_contacto,
        descricao,
        categoria,
      },
    });

    return successResponse(updated, 'Perfil atualizado com sucesso');
  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse('Erro ao atualizar perfil', 500);
  }
}
