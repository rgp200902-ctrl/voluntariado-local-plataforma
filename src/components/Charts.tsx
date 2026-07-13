'use client';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
  maxValue?: number;
}

export function BarChart({ data, title, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((item, i) => {
          const height = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{item.value}</span>
              <div
                className={`w-full rounded-t-lg bg-gradient-to-t ${item.color} transition-all duration-1000 ease-out`}
                style={{ height: `${height}%`, minHeight: item.value > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center leading-tight">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: ChartData[];
  title: string;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, title, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let accumulated = 0;

  const segments = data.map(item => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const start = accumulated;
    accumulated += percentage;
    return { ...item, start, percentage };
  });

  const createArc = (start: number, end: number) => {
    const r = 40;
    const cx = 50;
    const cy = 50;
    const startRad = (start / 100) * 2 * Math.PI - Math.PI / 2;
    const endRad = (end / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = end - start > 50 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg viewBox="0 0 100 100" className="w-32 h-32">
            {segments.map((seg, i) => (
              <path
                key={i}
                d={createArc(seg.start, seg.start + seg.percentage)}
                fill="none"
                stroke={`url(#grad-${i})`}
                strokeWidth="20"
              />
            ))}
            <defs>
              {segments.map((seg, i) => (
                <linearGradient key={i} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className="text-blue-400" stopColor="currentColor" />
                  <stop offset="100%" className="text-blue-600" stopColor="currentColor" />
                </linearGradient>
              ))}
            </defs>
          </svg>
          {centerValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{centerValue}</span>
              {centerLabel && <span className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

export function StatCard({ title, value, change, icon, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% este mês
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
