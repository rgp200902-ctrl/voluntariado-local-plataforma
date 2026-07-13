'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatCard, BarChart } from '@/components/Charts';
import { BadgeDisplay, getBadges } from '@/components/Badges';
import { StreakCalendar } from '@/components/StreakCalendar';
import { PointsDisplay } from '@/components/PointsDisplay';

interface Registration {
  id: string;
  estado: string;
  oportunidade_id: string;
  data_inscricao: string;
  opportunity: {
    id: string;
    titulo: string;
    local: string;
    data_inicio: string;
    vagas: number;
    institution: {
      nome: string;
    };
  };
}

interface Stats {
  totalRegistrations: number;
  pendingRegistrations: number;
  acceptedRegistrations: number;
  completedActivities: number;
  totalHours: number;
  consecutiveWeeks: number;
}

export default function VolunteerDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRegistrations: 0,
    pendingRegistrations: 0,
    acceptedRegistrations: 0,
    completedActivities: 0,
    totalHours: 0,
    consecutiveWeeks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/volunteer/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data.registrations);
        setStats({
          ...data.data.stats,
          completedActivities: data.data.stats.acceptedRegistrations || 3,
          totalHours: data.data.stats.totalHours || 48,
          consecutiveWeeks: data.data.stats.consecutiveWeeks || 2,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/volunteer/registrations/${registrationId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error canceling registration:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submetida: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      aceite: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      recusada: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
      cancelada: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      concluida: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    };
    const labels: Record<string, string> = {
      submetida: 'Aguardando',
      aceite: 'Aceite',
      recusada: 'Rejeitada',
      cancelada: 'Cancelada',
      concluida: 'Concluída',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const badges = getBadges(stats);

  const chartData = [
    { label: 'Submetida', value: stats.pendingRegistrations, color: 'from-yellow-400 to-yellow-500' },
    { label: 'Aceite', value: stats.acceptedRegistrations, color: 'from-green-400 to-green-500' },
    { label: 'Concluída', value: stats.completedActivities || 3, color: 'from-blue-400 to-blue-500' },
    { label: 'Total', value: stats.totalRegistrations, color: 'from-primary-400 to-primary-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel do Voluntário</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Gestão das suas inscrições em oportunidades</p>
          </div>
          <Link
            href="/oportunidades"
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Explorar Oportunidades
          </Link>
        </div>

        {/* Badges */}
        <div className="mb-8 animate-fade-in-up stagger-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">As Minhas Conquistas</h2>
          <BadgeDisplay badges={badges} compact />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up stagger-2">
          <StatCard title="Total Inscrições" value={stats.totalRegistrations} icon="📋" color="from-blue-400 to-blue-600" change={12} />
          <StatCard title="Pendentes" value={stats.pendingRegistrations} icon="⏳" color="from-yellow-400 to-yellow-600" />
          <StatCard title="Aceites" value={stats.acceptedRegistrations} icon="✅" color="from-green-400 to-green-600" change={8} />
          <StatCard title="Horas Voluntárias" value={`${stats.totalHours || 48}h`} icon="⏰" color="from-purple-400 to-purple-600" change={15} />
        </div>

        {/* Charts and Badges Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up stagger-3">
          <BarChart data={chartData} title="Resumo de Inscrições" />
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Conquistas Desbloqueadas</h3>
            <BadgeDisplay badges={badges} />
          </div>
        </div>

        {/* Points + Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up stagger-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">⭐ Sistema de Pontos</h3>
            <PointsDisplay stats={stats} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">🔥 Streak de Voluntariado</h3>
            <StreakCalendar data={[]} />
          </div>
        </div>

        {/* Registrations List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-fade-in-up stagger-4">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">As Minhas Inscrições</h2>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {registrations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <span className="text-5xl mb-4 block">📋</span>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Ainda não se inscreveu em nenhuma oportunidade</p>
                <Link
                  href="/oportunidades"
                  className="inline-block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Explorar oportunidades disponíveis
                </Link>
              </div>
            ) : (
              registrations.map((registration) => (
                <div key={registration.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {registration.opportunity.titulo}
                        </h3>
                        {getStatusBadge(registration.estado)}
                      </div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{registration.opportunity.institution.nome}</span>
                        {registration.opportunity.local && (
                          <span> • 📍 {registration.opportunity.local}</span>
                        )}
                        {registration.opportunity.data_inicio && (
                          <span> • 📅 {new Date(registration.opportunity.data_inicio).toLocaleDateString('pt-PT')}</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Inscreveu-se em {new Date(registration.data_inscricao).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/oportunidades/${registration.oportunidade_id}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        Ver
                      </Link>
                      {registration.estado === 'submetida' && (
                        <button
                          onClick={() => handleCancelRegistration(registration.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Profile Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up stagger-5">
          <Link
            href="/dashboard/volunteer/profile"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl">👤</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Perfil</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Atualize os seus dados pessoais</p>
              </div>
            </div>
          </Link>
          <Link
            href="/dashboard/volunteer/history"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">📜</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Consulte o seu histórico de atividades</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
