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

    if (decoded.role !== 'voluntario') {
      return errorResponse('Acesso negado', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { volunteer: true },
    });

    if (!user || !user.volunteer) {
      return errorResponse('Voluntário não encontrado', 404);
    }

    return successResponse({
      ...user.volunteer,
      email: user.email,
      nome: user.nome,
    });
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

    if (decoded.role !== 'voluntario') {
      return errorResponse('Acesso negado', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { volunteer: true },
    });

    if (!user || !user.volunteer) {
      return errorResponse('Voluntário não encontrado', 404);
    }

    const body = await request.json();
    const { nome, telefone, localidade, data_nascimento, faixa_etaria, disponibilidade, interesses, competencias, avatar } = body;

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { nome },
    });

    const updated = await prisma.volunteer.update({
      where: { id: user.volunteer.id },
      data: {
        telefone,
        localidade,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        faixa_etaria,
        disponibilidade,
        interesses,
        competencias,
        avatar,
      },
    });

    return successResponse(updated, 'Perfil atualizado com sucesso');
  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse('Erro ao atualizar perfil', 500);
  }
}
