'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Registration {
  id: string;
  estado: string;
  mensagem: string;
  data_inscricao: string;
  data_decisao: string;
  observacoes_instituicao: string;
  user: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    localidade: string;
  };
  volunteer: {
    competencias: string;
    disponibilidade: string;
    interesses: string;
  };
}

export default function RegistrationsPage({ params }: { params: { id: string } }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/institution/opportunities/${params.id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data.registrations);
        setOpportunity(data.data.opportunity);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (registrationId: string, estado: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/institution/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating registration:', error);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/institution/opportunities/${params.id}/export?format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscricoes-${opportunity?.titulo || 'oportunidade'}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const getStatusBadge = (estado: string) => {
    const styles: Record<string, string> = {
      submetida: 'bg-yellow-100 text-yellow-800',
      aceite: 'bg-green-100 text-green-800',
      recusada: 'bg-red-100 text-red-800',
      cancelada: 'bg-gray-100 text-gray-800',
      concluida: 'bg-blue-100 text-blue-800',
    };
    const labels: Record<string, string> = {
      submetida: 'Submetida',
      aceite: 'Aceite',
      recusada: 'Rejeitada',
      cancelada: 'Cancelada',
      concluida: 'Concluída',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>
        {labels[estado] || estado}
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/institution"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          ← Voltar ao painel
        </Link>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Inscrições - {opportunity?.titulo || 'Oportunidade'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {registrations.length} inscrição(ões) total(is)
              </p>
            </div>
            {registrations.length > 0 && (
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
              >
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {registrations.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Ainda não há inscrições nesta oportunidade
              </div>
            ) : (
              registrations.map((registration) => (
                <div key={registration.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {registration.user.nome}
                        </h3>
                        {getStatusBadge(registration.estado)}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>📧 {registration.user.email}</p>
                        {registration.user.telefone && <p>📞 {registration.user.telefone}</p>}
                      </div>
                      {registration.volunteer && (
                        <div className="mt-2 text-sm text-gray-600">
                          {registration.volunteer.competencias && (
                            <p><strong>Competências:</strong> {registration.volunteer.competencias}</p>
                          )}
                          {registration.volunteer.disponibilidade && (
                            <p><strong>Disponibilidade:</strong> {registration.volunteer.disponibilidade}</p>
                          )}
                          {registration.volunteer.interesses && (
                            <p><strong>Áreas de interesse:</strong> {registration.volunteer.interesses}</p>
                          )}
                        </div>
                      )}
                      {registration.mensagem && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                          <strong>Mensagem de motivação:</strong> {registration.mensagem}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Inscreveu-se em {new Date(registration.data_inscricao).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {registration.estado === 'submetida' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(registration.id, 'aceite')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                          >
                            Aceitar
                          </button>
                          <button
                            onClick={() => handleStatusChange(registration.id, 'recusada')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                      {registration.estado === 'aceite' && (
                        <button
                          onClick={() => handleStatusChange(registration.id, 'concluida')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/dashboard/institution/opportunities/${params.id}`}
            className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver Detalhes da Oportunidade
          </Link>
        </div>
      </div>
    </div>
  );
}
