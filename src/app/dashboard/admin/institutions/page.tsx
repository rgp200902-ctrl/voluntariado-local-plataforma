'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Institution {
  id: string;
  nome: string;
  nif: string;
  tipo: string;
  email: string;
  telefone: string;
  pessoa_contacto: string;
  estado_validacao: string;
  data_criacao: string;
  user: {
    email: string;
  };
}

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInstitutions();
  }, [filter]);

  const fetchInstitutions = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' ? '/api/admin/institutions' : `/api/admin/institutions?estado=${filter}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setInstitutions(data.data);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (institutionId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = status === 'aprovada' ? 'approve' : 'block';
      await fetch(`/api/admin/institutions/${institutionId}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInstitutions();
    } catch (error) {
      console.error('Error updating institution:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aprovada: 'bg-green-100 text-green-800',
      recusada: 'bg-red-100 text-red-800',
      suspensa: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      aprovada: 'Aprovada',
      recusada: 'Recusada',
      suspensa: 'Suspensa',
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard/admin" className="text-primary-600 hover:text-primary-700 text-sm mb-2 block">
              ← Voltar ao painel
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Instituições</h1>
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovada">Aprovadas</option>
              <option value="recusada">Recusadas</option>
              <option value="suspensa">Suspensas</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registada em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {institutions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma instituição encontrada
                    </td>
                  </tr>
                ) : (
                  institutions.map((institution) => (
                    <tr key={institution.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{institution.nome}</div>
                        <div className="text-sm text-gray-500">{institution.pessoa_contacto}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {institution.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {institution.nif || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {institution.tipo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(institution.estado_validacao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(institution.data_criacao).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {institution.estado_validacao === 'pendente' && (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleStatusChange(institution.id, 'aprovada')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleStatusChange(institution.id, 'recusada')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                            >
                              Recusar
                            </button>
                          </div>
                        )}
                        {institution.estado_validacao === 'aprovada' && (
                          <button
                            onClick={() => handleStatusChange(institution.id, 'recusada')}
                            className="text-red-600 hover:text-red-700"
                          >
                            Bloquear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
