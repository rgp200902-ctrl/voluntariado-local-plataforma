'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Participation {
  id: string;
  estado: string;
  data_inscricao: string;
  data_decisao: string;
  opportunity: {
    id: string;
    titulo: string;
    local: string;
    data_inicio: string;
    data_fim: string;
    institution: {
      nome: string;
    };
  };
}

export default function HistoryPage() {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/volunteer/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setParticipations(data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      aceite: 'bg-green-100 text-green-800',
      concluida: 'bg-blue-100 text-blue-800',
      recusada: 'bg-red-100 text-red-800',
      cancelada: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      aceite: 'Aceite',
      concluida: 'Concluída',
      recusada: 'Rejeitada',
      cancelada: 'Cancelada',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/volunteer"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          ← Voltar ao painel
        </Link>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Histórico de Participações</h1>
            <p className="text-sm text-gray-500 mt-1">
              {participations.length} participação(ões) total(is)
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {participations.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Ainda não tem participações registadas
              </div>
            ) : (
              participations.map((participation) => (
                <div key={participation.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {participation.opportunity.titulo}
                        </h3>
                        {getStatusBadge(participation.estado)}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>🏢 {participation.opportunity.institution.nome}</p>
                        {participation.opportunity.local && (
                          <p>📍 {participation.opportunity.local}</p>
                        )}
                        {participation.opportunity.data_inicio && (
                          <p>📅 {new Date(participation.opportunity.data_inicio).toLocaleDateString('pt-PT')}</p>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Inscreveu-se em {new Date(participation.data_inscricao).toLocaleDateString('pt-PT')}
                        {participation.data_decisao && (
                          <> • Decidido em {new Date(participation.data_decisao).toLocaleDateString('pt-PT')}</>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/oportunidades/${participation.opportunity.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver Oportunidade
                    </Link>
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
