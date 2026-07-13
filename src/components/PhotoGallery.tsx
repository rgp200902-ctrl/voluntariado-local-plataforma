'use client';

import { useState } from 'react';

interface GalleryPhoto {
  id: number;
  title: string;
  description: string;
  color: string;
  icon: string;
}

const photos: GalleryPhoto[] = [
  { id: 1, title: 'Limpeza da Praia', description: '30 voluntários limparam a praia de Carcavelos', color: 'from-blue-400 to-cyan-500', icon: '🏖️' },
  { id: 2, title: 'Recolha de Alimentos', description: 'Campanha anual com mais de 500 kg recolhidos', color: 'from-orange-400 to-red-500', icon: '📦' },
  { id: 3, title: 'Apoio a Idosos', description: 'Visitas semanais ao lar de idosos', color: 'from-purple-400 to-pink-500', icon: '👴' },
  { id: 4, title: 'Plantação de Árvores', description: '200 árvores plantadas no Monsanto', color: 'from-green-400 to-emerald-500', icon: '🌳' },
  { id: 5, title: 'Oficina de Arte', description: 'Crianças criaram obras de arte com reciclados', color: 'from-yellow-400 to-orange-500', icon: '🎨' },
  { id: 6, title: 'Corrida Solidária', description: '150 participantes na corrida beneficente', color: 'from-pink-400 to-rose-500', icon: '🏃' },
  { id: 7, title: 'Formação Primeiros Socorros', description: '20 novos certificados em primeiros socorros', color: 'from-red-400 to-pink-500', icon: '🏥' },
  { id: 8, title: 'Festival de Música', description: '3 dias de música e solidariedade', color: 'from-indigo-400 to-purple-500', icon: '🎵' },
  { id: 9, title: 'Horta Comunitária', description: 'Colheita semanal para famílias necessitadas', color: 'from-lime-400 to-green-500', icon: '🌱' },
];

export function PhotoGallery() {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelected(photo)}
            className={`relative aspect-square rounded-2xl bg-gradient-to-br ${photo.color} flex items-center justify-center text-6xl overflow-hidden group card-hover`}
          >
            <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">{photo.icon}</span>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className={`aspect-video bg-gradient-to-br ${selected.color} flex items-center justify-center text-8xl`}>
              {selected.icon}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selected.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{selected.description}</p>
              <button
                onClick={() => setSelected(null)}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
