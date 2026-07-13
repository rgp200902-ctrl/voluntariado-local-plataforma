'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Opportunity {
  id: string;
  titulo: string;
  descricao: string;
  estado: string;
  vagas: number;
  registrations: number;
  criada_em: string;
  instituicao_id: string;
  categoria_id: string;
  local: string;
  data_inicio: string;
  data_fim: string;
}

interface Stats {
  totalOpportunities: number;
  activeOpportunities: number;
  totalRegistrations: number;
  pendingRegistrations: number;
}

export default function InstitutionDashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/institution/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.data.opportunities);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta oportunidade?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/institution/opportunities/${opportunityId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
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
            <h1 className="text-3xl font-bold text-gray-900">Painel da Instituição</h1>
            <p className="mt-2 text-gray-600">Gestão de oportunidades de voluntariado</p>
          </div>
          <Link
            href="/dashboard/institution/opportunities/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700"
          >
            + Nova Oportunidade
          </Link>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total de Oportunidades</div>
              <div className="mt-2 text-3xl font-bold text-primary-600">{stats.totalOpportunities}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Oportunidades Ativas</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{stats.activeOpportunities}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total de Inscrições</div>
              <div className="mt-2 text-3xl font-bold text-primary-600">{stats.totalRegistrations}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Inscrições Pendentes</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600">{stats.pendingRegistrations}</div>
            </div>
          </div>
        )}

        {/* Opportunities List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">As Minhas Oportunidades</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {opportunities.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>Ainda não criou nenhuma oportunidade</p>
                <Link
                  href="/dashboard/institution/opportunities/new"
                  className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
                >
                  Criar primeira oportunidade
                </Link>
              </div>
            ) : (
              opportunities.map((opportunity) => (
                <div key={opportunity.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{opportunity.titulo}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            opportunity.estado === 'publicada' || opportunity.estado === 'aberta'
                              ? 'bg-green-100 text-green-800'
                              : opportunity.estado === 'inscricoes_encerradas' || opportunity.estado === 'cancelada'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {opportunity.estado === 'publicada' || opportunity.estado === 'aberta'
                            ? 'Ativa'
                            : opportunity.estado === 'inscricoes_encerradas'
                            ? 'Inscrições Encerradas'
                            : opportunity.estado === 'cancelada'
                            ? 'Cancelada'
                            : opportunity.estado === 'concluida'
                            ? 'Concluída'
                            : opportunity.estado === 'rascunho'
                            ? 'Rascunho'
                            : opportunity.estado}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{opportunity.descricao}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Vagas: {opportunity.vagas}</span>
                        <span>Inscritos: {opportunity.registrations}</span>
                        <span>Criada: {new Date(opportunity.criada_em).toLocaleDateString('pt-PT')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/dashboard/institution/opportunities/${opportunity.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Ver Detalhes
                      </Link>
                      <Link
                        href={`/dashboard/institution/opportunities/${opportunity.id}/registrations`}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        Inscrições
                      </Link>
                      <button
                        onClick={() => handleDeleteOpportunity(opportunity.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
