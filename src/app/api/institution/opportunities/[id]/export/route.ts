import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Não autorizado', { status: 401 });
    }

    const jwt = require('jsonwebtoken');
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;

    if (decoded.role !== 'instituicao') {
      return new Response('Acesso negado', { status: 403 });
    }

    const institution = await prisma.institution.findFirst({
      where: { user_id: decoded.userId },
    });

    if (!institution) {
      return new Response('Instituição não encontrada', { status: 404 });
    }

    const opportunity = await prisma.oportunidade.findUnique({
      where: { id: params.id },
    });

    if (!opportunity) {
      return new Response('Oportunidade não encontrada', { status: 404 });
    }

    if (opportunity.instituicao_id !== institution.id) {
      return new Response('Não tem permissão', { status: 403 });
    }

    const registrations = await prisma.inscricao.findMany({
      where: { oportunidade_id: params.id },
      include: {
        volunteer: {
          include: {
            user: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { data_inscricao: 'desc' },
    });

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    if (format === 'csv') {
      const headers = ['Nome', 'Email', 'Telefone', 'Localidade', 'Estado', 'Data Inscrição', 'Competências', 'Disponibilidade'];
      const rows = registrations.map((reg) => [
        reg.volunteer.user.nome,
        reg.volunteer.user.email,
        reg.volunteer.telefone || '',
        reg.volunteer.localidade || '',
        reg.estado,
        new Date(reg.data_inscricao).toLocaleDateString('pt-PT'),
        reg.volunteer.competencias || '',
        reg.volunteer.disponibilidade || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inscricoes-${opportunity.titulo}.csv"`,
        },
      });
    }

    return new Response('Formato não suportado', { status: 400 });
  } catch (error) {
    console.error('Error exporting registrations:', error);
    return new Response('Erro ao exportar', { status: 500 });
  }
}
