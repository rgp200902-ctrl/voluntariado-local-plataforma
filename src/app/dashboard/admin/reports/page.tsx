'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReportData {
  summary: {
    totalUsers: number;
    totalInstitutions: number;
    totalVolunteers: number;
    totalOpportunities: number;
    totalRegistrations: number;
    newUsersThisPeriod: number;
    newOpportunitiesThisPeriod: number;
    newRegistrationsThisPeriod: number;
  };
  opportunitiesByCategory: { categoria_id: string; count: number }[];
  registrationsByStatus: { estado: string; count: number }[];
  topInstitutions: { id: string; nome: string; opportunitiesCount: number }[];
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reports?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setReport(data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard/admin" className="text-primary-600 hover:text-primary-700 text-sm mb-2 block">
              ← Voltar ao painel
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          </div>
          <div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="year">Último ano</option>
            </select>
          </div>
        </div>

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Total Utilizadores</div>
                <div className="mt-2 text-3xl font-bold text-primary-600">{report.summary.totalUsers}</div>
                <div className="text-xs text-green-600 mt-1">+{report.summary.newUsersThisPeriod} este período</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Instituições</div>
                <div className="mt-2 text-3xl font-bold text-primary-600">{report.summary.totalInstitutions}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Voluntários</div>
                <div className="mt-2 text-3xl font-bold text-primary-600">{report.summary.totalVolunteers}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Oportunidades</div>
                <div className="mt-2 text-3xl font-bold text-primary-600">{report.summary.totalOpportunities}</div>
                <div className="text-xs text-green-600 mt-1">+{report.summary.newOpportunitiesThisPeriod} este período</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Opportunities by Category */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Oportunidades por Categoria</h2>
                <div className="space-y-3">
                  {report.opportunitiesByCategory.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600">{item.categoria_id}</span>
                      <span className="font-medium text-primary-600">{item.count}</span>
                    </div>
                  ))}
                  {report.opportunitiesByCategory.length === 0 && (
                    <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
                  )}
                </div>
              </div>

              {/* Registrations by Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Inscrições por Estado</h2>
                <div className="space-y-3">
                  {report.registrationsByStatus.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {item.estado === 'submetida' && 'Submetida'}
                        {item.estado === 'aceite' && 'Aceite'}
                        {item.estado === 'recusada' && 'Rejeitada'}
                        {item.estado === 'cancelada' && 'Cancelada'}
                        {item.estado === 'concluida' && 'Concluída'}
                      </span>
                      <span className="font-medium text-primary-600">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Institutions */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Instituições Mais Ativas</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {report.topInstitutions.length === 0 ? (
                  <div className="px-6 py-4 text-gray-500">Sem dados disponíveis</div>
                ) : (
                  report.topInstitutions.map((inst, index) => (
                    <div key={inst.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 w-8">{index + 1}</span>
                        <span className="font-medium text-gray-900">{inst.nome}</span>
                      </div>
                      <span className="text-primary-600">{inst.opportunitiesCount} oportunidades</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const csvContent = [
                    'Relatório de Voluntariado',
                    `Período: ${period}`,
                    '',
                    'Resumo:',
                    `Total Utilizadores: ${report.summary.totalUsers}`,
                    `Instituições: ${report.summary.totalInstitutions}`,
                    `Voluntários: ${report.summary.totalVolunteers}`,
                    `Oportunidades: ${report.summary.totalOpportunities}`,
                    `Inscrições: ${report.summary.totalRegistrations}`,
                  ].join('\n');

                  const blob = new Blob([csvContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `relatorio-voluntariado-${period}.txt`;
                  a.click();
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Exportar Relatório
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
