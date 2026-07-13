'use client';

import { getPoints } from './Points';

export function PointsDisplay({ stats }: { stats: { totalRegistrations: number; completedActivities: number; totalHours: number; consecutiveWeeks: number } }) {
  const points = getPoints(stats);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${points.levelColor} flex items-center justify-center text-2xl shadow-lg`}>
          {points.level === 'Diamante' ? '💎' : points.level === 'Ouro' ? '🥇' : points.level === 'Prata' ? '🥈' : '🥉'}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{points.total} pts</div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Nível {points.level}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-3">
        {['Bronze', 'Prata', 'Ouro', 'Diamante'].map((lvl, i) => (
          <div key={lvl} className={`flex-1 h-2 rounded-full ${points.level === lvl || (['Bronze', 'Prata', 'Ouro', 'Diamante'].indexOf(points.level) >= i) ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{points.nextLevel}</p>
      <div className="space-y-2">
        {points.breakdown.map((item) => (
          <div key={item.label} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className="font-medium text-gray-900 dark:text-white">{item.value} × {item.label === 'Inscrições' ? 10 : item.label === 'Atividades' ? 50 : item.label === 'Horas' ? 5 : 20} = {item.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
