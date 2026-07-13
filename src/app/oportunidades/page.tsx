'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProgressBar } from '@/components/ProgressBar';
import { Skeleton } from '@/components/Skeleton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useFavorites } from '@/components/Favorites';
import { UrgencyLabel, CountdownTimer } from '@/components/Urgency';
import { ShareButtons } from '@/components/ShareButtons';

interface Opportunity {
  id: string;
  titulo: string;
  descricao: string;
  local: string;
  data_inicio: string;
  data_fim: string;
  vagas: number;
  registrations: number;
  institution: {
    nome: string;
  };
  categoria: {
    id: string;
    nome: string;
  } | null;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites } = useFavorites();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'educacao', label: 'Educação' },
    { value: 'saude', label: 'Saúde' },
    { value: 'ambiente', label: 'Ambiente' },
    { value: 'cultura', label: 'Cultura' },
    { value: 'desporto', label: 'Desporto' },
    { value: 'social', label: 'Ação Social' },
    { value: 'outro', label: 'Outro' },
  ];

  const filteredOpportunities = showFavoritesOnly
    ? opportunities.filter(o => favorites.includes(o.id))
    : opportunities;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Oportunidades de Voluntariado</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Encontre oportunidades para fazer a diferença na sua comunidade</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 animate-fade-in-up stagger-1">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesquisar</label>
              <input
                type="text"
                placeholder="Pesquisar oportunidades..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localização</label>
              <input
                type="text"
                placeholder="Ex: Lisboa, Porto..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">De</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Até</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Favoritos</label>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  showFavoritesOnly
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {showFavoritesOnly ? `❤️ ${favorites.length}` : '🤍 Favoritos'}
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setFilters({ search: '', category: '', location: '', dateFrom: '', dateTo: '' }); setShowFavoritesOnly(false); }}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} type="card" />
            ))}
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center animate-fade-in">
            <span className="text-6xl mb-4 block">{showFavoritesOnly ? '💔' : '🔍'}</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {showFavoritesOnly ? 'Nenhum favorito encontrado' : 'Nenhuma oportunidade encontrada'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {showFavoritesOnly ? 'Adicione oportunidades aos favoritos' : 'Tente ajustar os filtros ou volte mais tarde'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-5xl">🤝</span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{opportunity.titulo}</h3>
                    <div className="flex items-center gap-1">
                      {opportunity.categoria && (
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 whitespace-nowrap">
                          {opportunity.categoria.nome}
                        </span>
                      )}
                      <FavoriteButton opportunityId={opportunity.id} opportunityTitle={opportunity.titulo} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {opportunity.categoria && (
                      <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                        {opportunity.categoria.nome}
                      </span>
                    )}
                    <UrgencyLabel dataFim={opportunity.data_fim} vagas={opportunity.vagas} vagasPreenchidas={(opportunity as any).inscritos || 0} />
                    {opportunity.data_fim && <CountdownTimer dataFim={opportunity.data_fim} />}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-3 space-y-1">
                    {opportunity.local && (
                      <p>📍 {opportunity.local}</p>
                    )}
                    {opportunity.data_inicio && (
                      <p>📅 {new Date(opportunity.data_inicio).toLocaleDateString('pt-PT')}</p>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">{opportunity.descricao}</p>
                  <div className="mb-4">
                    <ProgressBar value={(opportunity as any).inscritos || 0} max={opportunity.vagas} size="sm" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <ShareButtons title={opportunity.titulo} />
                    <Link
                      href={`/oportunidades/${opportunity.id}`}
                      className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors"
                    >
                      Ver Detalhes
                    </Link>
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
