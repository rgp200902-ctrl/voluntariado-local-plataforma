'use client';

import { useToast } from './Toast';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const { showToast } = useToast();
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const share = (rede: string, link: string) => {
    window.open(link, '_blank', 'width=600,height=400');
    showToast(`A partilhar no ${rede}...`, 'info');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">Partilhar:</span>
      <button
        onClick={() => share('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm hover:scale-110 transition-transform"
        title="Facebook"
      >f</button>
      <button
        onClick={() => share('WhatsApp', `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`)}
        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm hover:scale-110 transition-transform"
        title="WhatsApp"
      >📱</button>
      <button
        onClick={() => share('LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}
        className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm hover:scale-110 transition-transform"
        title="LinkedIn"
      >in</button>
      <button
        onClick={() => { navigator.clipboard.writeText(shareUrl); showToast('Link copiado!', 'success'); }}
        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm hover:scale-110 transition-transform"
        title="Copiar link"
      >🔗</button>
    </div>
  );
}
