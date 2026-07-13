'use client';

import { useState, useEffect } from 'react';

export function UrgencyLabel({ dataFim, vagas, vagasPreenchidas }: { dataFim: string; vagas: number; vagasPreenchidas: number }) {
  const vagasRestantes = vagas - vagasPreenchidas;
  const fim = new Date(dataFim);
  const agora = new Date();
  const diff = fim.getTime() - agora.getTime();
  const diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0 || vagasRestantes <= 0) return null;

  const urgente = diasRestantes <= 3 || vagasRestantes <= 3;

  if (vagasRestantes <= 3 && vagasRestantes > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium animate-pulse-slow">
        ⚡ Últimas {vagasRestantes} vagas!
      </span>
    );
  }

  if (diasRestantes <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium">
        ⏰ Termina em {diasRestantes} dias
      </span>
    );
  }

  return null;
}

export function CountdownTimer({ dataFim }: { dataFim: string }) {
  const [restante, setRestante] = useState('');

  useEffect(() => {
    const calc = () => {
      const fim = new Date(dataFim).getTime();
      const agora = Date.now();
      const diff = fim - agora;
      if (diff <= 0) { setRestante('Terminado'); return; }
      const d = Math.floor(diff / (1000*60*60*24));
      const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
      setRestante(`${d}d ${h}h`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [dataFim]);

  return (
    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{restante}</span>
  );
}
