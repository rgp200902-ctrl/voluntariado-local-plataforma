'use client';

import { useState } from 'react';

interface MapOpportunity {
  id: string;
  titulo: string;
  local: string;
  freguesia: string;
  vagas: number;
  lat: number;
  lng: number;
}

const cityCoords: Record<string, { lat: number; lng: number }> = {
  'Lisboa': { lat: 38.7223, lng: -9.1393 },
  'Porto': { lat: 41.1579, lng: -8.6291 },
  'Braga': { lat: 41.5518, lng: -8.4229 },
  'Coimbra': { lat: 40.2033, lng: -8.4103 },
  'Faro': { lat: 37.0194, lng: -7.9304 },
  'Setúbal': { lat: 38.5244, lng: -8.8882 },
  'Leiria': { lat: 39.7437, lng: -8.8071 },
  'Viseu': { lat: 40.6566, lng: -7.9125 },
  'Guimarães': { lat: 41.4444, lng: -8.2962 },
  'Oeiras': { lat: 38.6910, lng: -9.3147 },
};

function getCoords(local: string) {
  const base = cityCoords[local] || cityCoords['Lisboa'];
  return {
    lat: base.lat + (Math.random() - 0.5) * 0.02,
    lng: base.lng + (Math.random() - 0.5) * 0.02,
  };
}

interface OpportunityMapProps {
  opportunities: MapOpportunity[];
}

export function OpportunityMap({ opportunities }: OpportunityMapProps) {
  const [selected, setSelected] = useState<MapOpportunity | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const enriched = opportunities.map(o => ({
    ...o,
    coords: getCoords(o.local),
  }));

  const minLat = Math.min(...enriched.map(e => e.coords.lat)) - 0.05;
  const maxLat = Math.max(...enriched.map(e => e.coords.lat)) + 0.05;
  const minLng = Math.min(...enriched.map(e => e.coords.lng)) - 0.05;
  const maxLng = Math.max(...enriched.map(e => e.coords.lng)) + 0.05;

  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
  const toY = (lat: number) => (1 - (lat - minLat) / (maxLat - minLat)) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🗺️</span> Mapa de Oportunidades
        </h3>
      </div>
      <div className="relative aspect-[16/10] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        {/* Simplified Portugal outline */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
          <path d="M45,5 L55,5 L60,15 L65,20 L70,35 L68,50 L65,60 L60,70 L55,80 L50,90 L45,95 L40,85 L35,75 L30,60 L32,45 L35,30 L40,15 Z" fill="currentColor" className="text-primary-300 dark:text-primary-700" />
        </svg>
        
        {enriched.map(opp => (
          <button
            key={opp.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10"
            style={{ left: `${toX(opp.coords.lng)}%`, top: `${toY(opp.coords.lat)}%` }}
            onClick={() => setSelected(selected?.id === opp.id ? null : opp)}
            onMouseEnter={() => setHovered(opp.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className={`w-6 h-6 rounded-full bg-primary-500 border-2 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-white text-xs font-bold transition-transform ${(selected?.id === opp.id || hovered === opp.id) ? 'scale-150' : 'hover:scale-125'}`}>
              {opp.vagas}
            </div>
          </button>
        ))}

        {selected && (
          <div
            className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 min-w-[200px] z-20 animate-fade-in"
            style={{
              left: `${toX(selected.coords.lng)}%`,
              top: `${toY(selected.coords.lat) - 5}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selected.titulo}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📍 {selected.local}{selected.freguesia ? `, ${selected.freguesia}` : ''}</p>
            <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">{selected.vagas} vagas disponíveis</p>
          </div>
        )}
      </div>
    </div>
  );
}
