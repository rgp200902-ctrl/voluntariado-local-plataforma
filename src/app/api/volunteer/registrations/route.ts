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

    if (decoded.role !== 'voluntario') {
      return errorResponse('Apenas voluntários podem inscrever-se', 403);
    }

    const body = await request.json();
    const { oportunidade_id, mensagem } = body;

    if (!oportunidade_id) {
      return errorResponse('ID da oportunidade é obrigatório');
    }

    // Business Rule 7: Check if opportunity has available slots
    const opportunity = await prisma.oportunidade.findUnique({
      where: { id: oportunidade_id },
      include: { _count: { select: { registrations: true } } },
    });

    if (!opportunity) {
      return errorResponse('Oportunidade não encontrada', 404);
    }

    // Business Rule 2: Cancelled opportunities don't accept new registrations
    if (opportunity.estado === 'cancelada') {
      return errorResponse('Esta oportunidade foi cancelada');
    }

    if (opportunity.estado === 'concluida') {
      return errorResponse('Esta oportunidade já foi concluída');
    }

    if (opportunity.estado !== 'publicada' && opportunity.estado !== 'aberta') {
      return errorResponse('Esta oportunidade não está aceitar inscrições');
    }

    // Business Rule 7: Check if opportunity is full
    if (opportunity._count.registrations >= opportunity.vagas) {
      return errorResponse('Não há vagas disponíveis. A oportunidade está cheia.');
    }

    // Business Rule 3: Volunteer cannot register twice for the same opportunity
    const existingRegistration = await prisma.inscricao.findUnique({
      where: {
        oportunidade_id_voluntario_id: {
          oportunidade_id,
          voluntario_id: decoded.userId,
        },
      },
    });

    if (existingRegistration) {
      return errorResponse('Já está inscrito nesta oportunidade');
    }

    // Business Rule 10: Check RGPD consent
    const volunteer = await prisma.volunteer.findFirst({
      where: { user_id: decoded.userId },
    });

    if (!volunteer || !volunteer.consentimento_rgpd) {
      return errorResponse('É necessário dar consentimento RGPD para se inscrever');
    }

    const registration = await prisma.inscricao.create({
      data: {
        oportunidade_id,
        voluntario_id: decoded.userId,
        mensagem,
        estado: 'submetida',
      },
    });

    // Business Rule 7: Check if opportunity is now full and update status
    const updatedCount = await prisma.inscricao.count({
      where: { oportunidade_id, estado: { not: 'cancelada' } },
    });

    if (updatedCount >= opportunity.vagas) {
      await prisma.oportunidade.update({
        where: { id: oportunidade_id },
        data: { estado: 'inscricoes_encerradas' },
      });
    }

    // Create audit log
    await createAuditLog({
      acao: 'inscrever',
      entidade: 'inscricao',
      entidade_id: registration.id,
      utilizador_id: decoded.userId,
      detalhe: `Inscrição na oportunidade: ${opportunity.titulo}`,
    });

    return successResponse(registration, 'Inscrição realizada com sucesso');
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Não autorizado', 401);
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return errorResponse('Acesso negado', 403);
    }
    console.error('Error creating registration:', error);
    return errorResponse('Erro ao criar inscrição', 500);
  }
}
