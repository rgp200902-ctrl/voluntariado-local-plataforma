'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { ProgressBar } from '@/components/ProgressBar';
import { Skeleton } from '@/components/Skeleton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { CalendarExport } from '@/components/CalendarExport';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  date: string;
  endDate: string;
  slots: number;
  status: string;
  institution: {
    id: string;
    name: string;
    description: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  registrations: number;
  category: {
    id: string;
    nome: string;
    descricao?: string;
    ativa?: boolean;
    data_criacao?: string;
  } | null;
}

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOpportunity();
  }, [params.id]);

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${params.id}`);
      const data = await response.json();
      if (data.success) {
        // Transform database field names to match interface
        const transformed = {
          ...data.data,
          title: data.data.titulo,
          description: data.data.descricao,
          requirements: data.data.requisitos,
          location: data.data.local,
          date: data.data.data_inicio,
          endDate: data.data.data_fim,
          slots: data.data.vagas,
          status: data.data.estado,
          institution: {
            ...data.data.institution,
            name: data.data.institution.nome,
            description: data.data.institution.descricao,
            phone: data.data.institution.telefone,
            email: data.data.institution.email,
            website: data.data.institution.website,
          },
        };
        setOpportunity(transformed);
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      const response = await fetch('/api/volunteer/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oportunidade_id: params.id,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao inscrever-se');
      }

      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      fetchOpportunity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inscrever-se');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton type="button" className="mb-6 w-48" />
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="skeleton h-8 w-3/4 mb-4" />
            <div className="skeleton h-4 w-1/2 mb-6" />
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Skeleton type="card" />
              <Skeleton type="card" />
            </div>
            <Skeleton lines={5} />
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oportunidade não encontrada</h1>
          <Link href="/oportunidades" className="text-primary-600 hover:text-primary-700">
            Voltar às oportunidades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/oportunidades"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          ← Voltar às oportunidades
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
          <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
            <span className="text-7xl">🤝</span>
          </div>
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{opportunity.title}</h1>
              <div className="flex items-center gap-2">
                <FavoriteButton opportunityId={opportunity.id} opportunityTitle={opportunity.title} />
                <CalendarExport
                  title={opportunity.title}
                  description={opportunity.description}
                  location={opportunity.location}
                  startDate={opportunity.date}
                  endDate={opportunity.endDate}
                />
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    opportunity.status === 'publicada' || opportunity.status === 'aberta'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {opportunity.status === 'publicada' || opportunity.status === 'aberta' ? 'Ativa' : 'Fechada'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-gray-600 mb-6">
              <span className="flex items-center">
                <span className="mr-2">🏢</span>
                {opportunity.institution.name}
              </span>
              {opportunity.location && (
                <span className="flex items-center">
                  <span className="mr-2">📍</span>
                  {opportunity.location}
                </span>
              )}
              {opportunity.date && (
                <span className="flex items-center">
                  <span className="mr-2">📅</span>
                  {new Date(opportunity.date).toLocaleDateString('pt-PT')}
                </span>
              )}
            </div>

            {opportunity.category && (
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-primary-100 text-primary-800 mb-6">
                {opportunity.category.nome}
              </span>
            )}

            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Descrição</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{opportunity.description}</p>
            </div>

            {opportunity.requirements && (
              <div className="prose max-w-none mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Requisitos</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{opportunity.requirements}</p>
              </div>
            )}

            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">{opportunity.slots}</div>
                  <div className="text-sm text-gray-600">Vagas disponíveis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">{opportunity.registrations}</div>
                  <div className="text-sm text-gray-600">Inscritos</div>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar value={opportunity.registrations} max={opportunity.slots} size="md" />
              </div>
            </div>

            {/* Institution Info */}
            <div className="border-t pt-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre a Instituição</h2>
              <p className="text-gray-600 mb-4">{opportunity.institution.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {opportunity.institution.phone && (
                  <span>📞 {opportunity.institution.phone}</span>
                )}
                {opportunity.institution.email && (
                  <span>✉️ {opportunity.institution.email}</span>
                )}
                {opportunity.institution.website && (
                  <span>🌐 {opportunity.institution.website}</span>
                )}
              </div>
            </div>

            {/* Registration Form */}
            {(opportunity.status === 'publicada' || opportunity.status === 'aberta') && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Inscrever-se nesta oportunidade</h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Porquê que quer participar nesta oportunidade?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {registering ? 'A inscrever-se...' : 'Inscrever-se'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
