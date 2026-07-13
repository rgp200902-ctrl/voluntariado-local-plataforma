import { prisma } from './prisma';

interface AuditLogParams {
  acao: string;
  entidade: string;
  entidade_id?: string;
  utilizador_id?: string;
  detalhe?: string;
}

export async function createAuditLog({
  acao,
  entidade,
  entidade_id,
  utilizador_id,
  detalhe,
}: AuditLogParams) {
  try {
    await prisma.registoAtividade.create({
      data: {
        acao,
        entidade,
        entidade_id,
        utilizador_id,
        detalhe,
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

export async function getAuditLogs(filters?: {
  entidade?: string;
  acao?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const where: any = {};

  if (filters?.entidade) {
    where.entidade = filters.entidade;
  }

  if (filters?.acao) {
    where.acao = filters.acao;
  }

  if (filters?.startDate || filters?.endDate) {
    where.data_hora = {};
    if (filters.startDate) {
      where.data_hora.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.data_hora.lte = filters.endDate;
    }
  }

  return prisma.registoAtividade.findMany({
    where,
    orderBy: { data_hora: 'desc' },
    take: filters?.limit || 100,
  });
}
