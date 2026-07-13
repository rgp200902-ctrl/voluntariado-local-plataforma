import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/Toast';
import { FavoritesProvider } from '@/components/Favorites';
import { BackToTop } from '@/components/BackToTop';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plataforma de Voluntariado Local',
  description: 'Plataforma que conecta instituições locais com voluntários disponíveis para ações de interesse comunitário',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Voluntariado',
  },
  icons: {
    apple: '/icon-192.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <FavoritesProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <BackToTop />
              </div>
            </FavoritesProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
