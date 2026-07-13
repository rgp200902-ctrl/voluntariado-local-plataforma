'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  date: string;
  endDate: string;
  slots: number;
  status: string;
  category: string;
  registrations: number;
  createdAt: string;
}

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    date: '',
    endDate: '',
    slots: 1,
    status: '',
    category: '',
  });

  useEffect(() => {
    fetchOpportunity();
  }, [params.id]);

  const fetchOpportunity = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/institution/opportunities/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOpportunity(data.data);
        setFormData({
          title: data.data.titulo || '',
          description: data.data.descricao || '',
          requirements: data.data.requisitos || '',
          location: data.data.local || '',
          date: data.data.data_inicio ? new Date(data.data.data_inicio).toISOString().slice(0, 16) : '',
          endDate: data.data.data_fim ? new Date(data.data.data_fim).toISOString().slice(0, 16) : '',
          slots: data.data.vagas || 1,
          status: data.data.estado || '',
          category: data.data.categoria_id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/institution/opportunities/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setEditing(false);
        fetchOpportunity();
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja eliminar esta oportunidade?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/institution/opportunities/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/dashboard/institution');
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

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oportunidade não encontrada</h1>
          <Link href="/dashboard/institution" className="text-primary-600 hover:text-primary-700">
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/institution"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          ← Voltar ao painel
        </Link>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {editing ? 'Editar Oportunidade' : 'Detalhes da Oportunidade'}
            </h1>
            <div className="flex space-x-2">
              {!editing && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Editar
                  </button>
                  <Link
                    href={`/dashboard/institution/opportunities/${params.id}/registrations`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Ver Inscrições
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="educacao">Educação</option>
                      <option value="saude">Saúde</option>
                      <option value="ambiente">Ambiente</option>
                      <option value="cultura">Cultura</option>
                      <option value="desporto">Desporto</option>
                      <option value="social">Ação Social</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Vagas</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.slots}
                      onChange={(e) => setFormData({ ...formData, slots: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Ativa</option>
                    <option value="CLOSED">Fechada</option>
                    <option value="COMPLETED">Concluída</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Guardar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{opportunity.title}</h2>
                  <span
                    className={`mt-2 inline-block px-3 py-1 text-sm rounded-full ${
                      opportunity.status === 'publicada' || opportunity.status === 'aberta'
                        ? 'bg-green-100 text-green-800'
                        : opportunity.status === 'concluida'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {opportunity.status === 'publicada' || opportunity.status === 'aberta'
                      ? 'Ativa'
                      : opportunity.status === 'concluida'
                      ? 'Concluída'
                      : opportunity.status === 'inscricoes_encerradas'
                      ? 'Inscrições Encerradas'
                      : opportunity.status === 'cancelada'
                      ? 'Cancelada'
                      : opportunity.status === 'rascunho'
                      ? 'Rascunho'
                      : opportunity.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Vagas</div>
                    <div className="text-2xl font-bold text-primary-600">{opportunity.slots}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Inscritos</div>
                    <div className="text-2xl font-bold text-primary-600">{opportunity.registrations}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{opportunity.description}</p>
                </div>

                {opportunity.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Requisitos</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{opportunity.requirements}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {opportunity.location && (
                    <div>
                      <span className="text-gray-500">Localização:</span>
                      <p className="font-medium">{opportunity.location}</p>
                    </div>
                  )}
                  {opportunity.category && (
                    <div>
                      <span className="text-gray-500">Categoria:</span>
                      <p className="font-medium">{opportunity.category}</p>
                    </div>
                  )}
                  {opportunity.date && (
                    <div>
                      <span className="text-gray-500">Data de início:</span>
                      <p className="font-medium">{new Date(opportunity.date).toLocaleDateString('pt-PT')}</p>
                    </div>
                  )}
                  {opportunity.endDate && (
                    <div>
                      <span className="text-gray-500">Data de fim:</span>
                      <p className="font-medium">{new Date(opportunity.endDate).toLocaleDateString('pt-PT')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
