'use client';

import { useFavorites } from './Favorites';
import { useToast } from './Toast';

interface FavoriteButtonProps {
  opportunityId: string;
  opportunityTitle: string;
}

export function FavoriteButton({ opportunityId, opportunityTitle }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const favorited = isFavorite(opportunityId);

  const handleClick = () => {
    toggleFavorite(opportunityId);
    showToast(
      favorited
        ? `${opportunityTitle} removida dos favoritos`
        : `${opportunityTitle} adicionada aos favoritos`,
      'success'
    );
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 ${
        favorited
          ? 'bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 scale-110'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500'
      }`}
      title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <svg
        className="w-5 h-5"
        fill={favorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
