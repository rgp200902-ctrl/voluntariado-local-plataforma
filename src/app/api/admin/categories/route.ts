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

    if (decoded.role !== 'administrador') {
      return errorResponse('Acesso negado', 403);
    }

    const categories = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { opportunities: true },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return successResponse(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return errorResponse('Erro ao buscar categorias', 500);
  }
}

export async function POST(request: NextRequest) {
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
    const { nome, descricao } = body;

    if (!nome) {
      return errorResponse('Nome é obrigatório');
    }

    const existing = await prisma.categoria.findUnique({
      where: { nome },
    });

    if (existing) {
      return errorResponse('Já existe uma categoria com este nome');
    }

    const category = await prisma.categoria.create({
      data: { nome, descricao },
    });

    return successResponse(category, 'Categoria criada com sucesso');
  } catch (error) {
    console.error('Error creating category:', error);
    return errorResponse('Erro ao criar categoria', 500);
  }
}
