'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Inscricao {
  id: string;
  oportunidade_id: string;
  voluntario_id: string;
  opportunity: {
    titulo: string;
    local: string;
    data_inicio: string;
    vagas: number;
    instituicao_id: string;
    institution: { nome: string };
  };
  estado: string;
  data_inscricao: string;
  mensagem?: string;
}

export default function VolunteerRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/volunteer/registrations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao carregar inscrições');

      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar inscrições');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId: string) => {
    if (!window.confirm('Tem a certeza que quer cancelar esta inscrição?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/volunteer/registrations/${registrationId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao cancelar inscrição');

      alert('Inscrição cancelada com sucesso!');
      fetchRegistrations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar inscrição');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceite':
        return 'bg-green-100 text-green-800';
      case 'recusada':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      case 'concluida':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submetida':
        return 'Aguardando decisão';
      case 'aceite':
        return 'Aceite';
      case 'recusada':
        return 'Recusada';
      case 'cancelada':
        return 'Cancelada';
      case 'concluida':
        return 'Concluída';
      default:
        return status;
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard/volunteer" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            ← Voltar ao painel
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Minhas Inscrições</h1>
          <p className="mt-2 text-gray-600">Gerencie suas inscrições em oportunidades de voluntariado</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {registrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma inscrição</h3>
            <p className="text-gray-600 mb-6">Você não tem inscrições em oportunidades</p>
            <Link
              href="/oportunidades"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
            >
              Explorar Oportunidades
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div key={registration.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {registration.opportunity.titulo}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>🏢 {registration.opportunity.institution.nome}</span>
                        <span>📍 {registration.opportunity.local}</span>
                        <span>📅 {new Date(registration.opportunity.data_inicio).toLocaleDateString('pt-PT')}</span>
                        <span>👥 {registration.opportunity.vagas} vagas</span>
                      </div>
                      {registration.mensagem && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Sua mensagem:</strong> {registration.mensagem}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.estado)}`}>
                        {getStatusLabel(registration.estado)}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        Inscrito em {new Date(registration.data_inscricao).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/oportunidades/${registration.oportunidade_id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver Detalhes
                    </Link>
                    {registration.estado === 'submetida' && (
                      <button
                        onClick={() => handleCancel(registration.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Cancelar Inscrição
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
