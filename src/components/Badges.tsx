'use client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  current: number;
}

export function getBadges(stats: {
  totalRegistrations: number;
  completedActivities: number;
  totalHours: number;
  consecutiveWeeks: number;
}): Badge[] {
  return [
    {
      id: 'first-step',
      name: 'Primeiro Passo',
      description: 'Inscreveu-se na primeira oportunidade',
      icon: '🎯',
      color: 'from-green-400 to-emerald-500',
      requirement: 1,
      current: stats.totalRegistrations,
    },
    {
      id: 'helper',
      name: 'Mão Amiga',
      description: 'Participou em 5 atividades',
      icon: '🤝',
      color: 'from-blue-400 to-cyan-500',
      requirement: 5,
      current: stats.completedActivities,
    },
    {
      id: 'dedicated',
      name: 'Voluntário Dedicado',
      description: 'Completou 10 atividades',
      icon: '⭐',
      color: 'from-yellow-400 to-orange-500',
      requirement: 10,
      current: stats.completedActivities,
    },
    {
      id: 'hero',
      name: 'Herói Comunitário',
      description: 'Completou 25 atividades',
      icon: '🦸',
      color: 'from-purple-400 to-pink-500',
      requirement: 25,
      current: stats.completedActivities,
    },
    {
      id: 'hundred-hours',
      name: '100 Horas',
      description: 'Acumulou 100 horas de voluntariado',
      icon: '⏰',
      color: 'from-red-400 to-rose-500',
      requirement: 100,
      current: stats.totalHours,
    },
    {
      id: 'streak',
      name: 'Em Chamas',
      description: '4 semanas consecutivas de voluntariado',
      icon: '🔥',
      color: 'from-orange-400 to-red-500',
      requirement: 4,
      current: stats.consecutiveWeeks,
    },
  ];
}

interface BadgeDisplayProps {
  badges: Badge[];
  compact?: boolean;
}

export function BadgeDisplay({ badges, compact = false }: BadgeDisplayProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {badges.map(badge => {
          const unlocked = badge.current >= badge.requirement;
          return (
            <div
              key={badge.id}
              className={`relative group ${unlocked ? '' : 'opacity-40 grayscale'}`}
              title={`${badge.name}: ${badge.description}`}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-xl shadow-md ${unlocked ? 'animate-bounce-slow' : ''}`}>
                {badge.icon}
              </div>
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {badges.map(badge => {
        const unlocked = badge.current >= badge.requirement;
        const progress = Math.min((badge.current / badge.requirement) * 100, 100);
        
        return (
          <div
            key={badge.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg transition-all duration-300 ${
              unlocked ? 'ring-2 ring-primary-500 dark:ring-primary-400' : 'opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl shadow-md ${unlocked ? 'animate-bounce-slow' : ''}`}>
                {badge.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{badge.name}</h4>
                {unlocked && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Desbloqueado!</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{badge.description}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full bg-gradient-to-r ${badge.color} transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {badge.current}/{badge.requirement}
            </p>
          </div>
        );
      })}
    </div>
  );
}
