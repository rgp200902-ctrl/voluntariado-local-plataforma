'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalInstitutions: number;
  totalVolunteers: number;
  totalOpportunities: number;
  pendingInstitutions: number;
  activeOpportunities: number;
  totalRegistrations: number;
}

interface Institution {
  id: string;
  nome: string;
  estado_validacao: string;
  data_criacao: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingInstitutions, setPendingInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data.stats);
        setPendingInstitutions(data.data.pendingInstitutions);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveInstitution = async (institutionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/institutions/${institutionId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving institution:', error);
    }
  };

  const handleBlockInstitution = async (institutionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/institutions/${institutionId}/block`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error blocking institution:', error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
          <p className="mt-2 text-gray-600">Gestão da plataforma de voluntariado</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total de Utilizadores</div>
              <div className="mt-2 text-3xl font-bold text-primary-600">{stats.totalUsers}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Instituições</div>
              <div className="mt-2 text-3xl font-bold text-primary-600">{stats.totalInstitutions}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Voluntários</div>
              <div className="mt-2 text-3xl font-bold text-primary-600">{stats.totalVolunteers}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Oportunidades Ativas</div>
              <div className="mt-2 text-3xl font-bold text-primary-600">{stats.activeOpportunities}</div>
            </div>
          </div>
        )}

        {/* Pending Institutions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Instituições Pendentes de Aprovação</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingInstitutions.length === 0 ? (
              <div className="px-6 py-4 text-gray-500">Não há instituições pendentes</div>
            ) : (
              pendingInstitutions.map((institution) => (
                <div key={institution.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{institution.nome}</div>
                    <div className="text-sm text-gray-500">
                      Registada em {new Date(institution.data_criacao).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveInstitution(institution.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleBlockInstitution(institution.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                    >
                      Bloquear
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Utilizadores</h3>
            <p className="text-gray-600 text-sm">Gerir todos os utilizadores da plataforma</p>
          </Link>
          <Link
            href="/dashboard/admin/institutions"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Instituições</h3>
            <p className="text-gray-600 text-sm">Gerir todas as instituições registadas</p>
          </Link>
          <Link
            href="/dashboard/admin/reports"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h3>
            <p className="text-gray-600 text-sm">Consultar estatísticas e relatórios</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
