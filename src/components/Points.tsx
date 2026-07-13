'use client';

export function getPoints(stats: { totalRegistrations: number; completedActivities: number; totalHours: number; consecutiveWeeks: number }) {
  return {
    total: stats.totalRegistrations * 10 + stats.completedActivities * 50 + stats.totalHours * 5 + stats.consecutiveWeeks * 20,
    level: stats.totalRegistrations >= 25 ? 'Diamante' : stats.totalRegistrations >= 15 ? 'Ouro' : stats.totalRegistrations >= 8 ? 'Prata' : 'Bronze',
    levelColor: stats.totalRegistrations >= 25 ? 'from-cyan-400 to-blue-500' : stats.totalRegistrations >= 15 ? 'from-yellow-400 to-orange-500' : stats.totalRegistrations >= 8 ? 'from-gray-400 to-gray-500' : 'from-amber-600 to-yellow-700',
    breakdown: [
      { label: 'Inscrições', points: stats.totalRegistrations * 10, value: stats.totalRegistrations },
      { label: 'Atividades', points: stats.completedActivities * 50, value: stats.completedActivities },
      { label: 'Horas', points: stats.totalHours * 5, value: stats.totalHours },
      { label: 'Streak', points: stats.consecutiveWeeks * 20, value: stats.consecutiveWeeks },
    ],
    nextLevel: stats.totalRegistrations < 8 ? `Faltam ${8 - stats.totalRegistrations} inscrições para Prata` : stats.totalRegistrations < 15 ? `Faltam ${15 - stats.totalRegistrations} inscrições para Ouro` : stats.totalRegistrations < 25 ? `Faltam ${25 - stats.totalRegistrations} inscrições para Diamante` : 'Nível máximo!',
  };
}
