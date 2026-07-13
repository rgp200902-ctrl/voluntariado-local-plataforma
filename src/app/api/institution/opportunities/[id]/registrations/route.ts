import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
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

    const opportunity = await prisma.oportunidade.findUnique({
      where: { id: params.id },
    });

    if (!opportunity) {
      return errorResponse('Oportunidade não encontrada', 404);
    }

    // Business Rule 4: Institution can only see registrations for their own opportunities
    if (opportunity.instituicao_id !== institution.id) {
      return errorResponse('Não tem permissão para ver estas inscrições', 403);
    }

    const registrations = await prisma.inscricao.findMany({
      where: { oportunidade_id: params.id },
      include: {
        volunteer: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { data_inscricao: 'desc' },
    });

    // Get volunteer profile data separately for each registration
    const registrationsWithProfile = await Promise.all(
      registrations.map(async (reg) => {
        const volunteerProfile = await prisma.volunteer.findFirst({
          where: { user_id: reg.voluntario_id },
        });

        // Business Rule 6: Only show contact data for accepted registrations
        const showContact = reg.estado === 'aceite' || reg.estado === 'concluida';

        return {
          id: reg.id,
          estado: reg.estado,
          mensagem: reg.mensagem,
          data_inscricao: reg.data_inscricao,
          data_decisao: reg.data_decisao,
          observacoes_instituicao: reg.observacoes_instituicao,
          user: {
            id: reg.volunteer.id,
            nome: reg.volunteer.nome,
            email: reg.volunteer.email,
            telefone: showContact ? volunteerProfile?.telefone || null : null,
            localidade: volunteerProfile?.localidade || null,
          },
          volunteer: {
            competencias: volunteerProfile?.competencias || null,
            disponibilidade: volunteerProfile?.disponibilidade || null,
            interesses: volunteerProfile?.interesses || null,
          },
        };
      })
    );

    return successResponse({
      opportunity,
      registrations: registrationsWithProfile,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return errorResponse('Erro ao buscar inscrições', 500);
  }
}
