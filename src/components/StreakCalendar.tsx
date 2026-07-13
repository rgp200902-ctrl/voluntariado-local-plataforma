'use client';

import { useMemo } from 'react';

interface StreakData {
  date: string;
  count: number;
}

interface StreakCalendarProps {
  data: StreakData[];
}

export function StreakCalendar({ data }: StreakCalendarProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const days: { date: string; count: number }[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const match = data.find(s => s.date === key);
      days.push({ date: key, count: match?.count || 0 });
    }
    const result: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900';
    if (count <= 5) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-600 dark:bg-green-500';
  };

  const totalDays = data.reduce((s, d) => s + (d.count > 0 ? 1 : 0), 0);
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const day = data.find(s => s.date === key);
      if (day && day.count > 0) streak++;
      else break;
    }
    return streak;
  }, [data]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">{totalDays}</span>
          <span className="text-gray-500 dark:text-gray-400">dias ativos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-green-600 dark:text-green-400">{currentStreak}</span>
          <span className="text-gray-500 dark:text-gray-400">dias consecutivos</span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(day => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                title={`${day.date}: ${day.count} atividades`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end text-xs text-gray-400">
        <span>Menos</span>
        {[0, 1, 3, 6].map(v => (
          <div key={v} className={`w-3 h-3 rounded-sm ${getColor(v)}`} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
}
