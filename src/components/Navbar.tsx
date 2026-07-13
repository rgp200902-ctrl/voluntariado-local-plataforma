'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  avatar?: string;
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser({
            id: parsed.id,
            nome: parsed.nome || parsed.name || '',
            email: parsed.email,
            perfil: parsed.perfil || parsed.role || '',
            avatar: parsed.avatar || '',
          });
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    };

    loadUser();
    window.addEventListener('avatarChanged', loadUser);
    window.addEventListener('userChanged', loadUser);
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('avatarChanged', loadUser);
      window.removeEventListener('userChanged', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('userChanged'));
    window.location.href = '/';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Voluntariado Local</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/oportunidades" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Oportunidades
            </Link>
            
            {user ? (
              <>
                <Link href={`/dashboard/${user.perfil === 'administrador' ? 'admin' : user.perfil === 'instituicao' ? 'institution' : user.perfil === 'voluntario' ? 'volunteer' : user.perfil}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Painel
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                    {user.avatar ? user.avatar : user.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Olá, {user.nome}</span>
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Entrar
                </Link>
                <Link href="/registro" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                  Registar
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/oportunidades" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Oportunidades
            </Link>
            {user ? (
              <>
                <div className="flex items-center px-3 py-2 space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                    {user.avatar ? user.avatar : user.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-base font-medium text-gray-700 dark:text-gray-300">{user.nome}</span>
                </div>
                <Link href={`/dashboard/${user.perfil === 'administrador' ? 'admin' : user.perfil === 'instituicao' ? 'institution' : user.perfil === 'voluntario' ? 'volunteer' : user.perfil}`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Painel
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Entrar
                </Link>
                <Link href="/registro" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  Registar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
