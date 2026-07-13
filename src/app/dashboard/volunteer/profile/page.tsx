'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VolunteerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const avatars = ['😀','😊','😎','🌟','🦸','❤️','🌻','🐶','🐱','🦉','🎨','📚','🎵','🌍','🏆','🌈'];

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    localidade: '',
    data_nascimento: '',
    competencias: '',
    disponibilidade: '',
    interesses: '',
    avatar: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await fetch('/api/volunteer/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setFormData({
          nome: data.data.nome || '',
          email: data.data.email || '',
          telefone: data.data.telefone || '',
          localidade: data.data.localidade || '',
          data_nascimento: data.data.data_nascimento
            ? new Date(data.data.data_nascimento).toISOString().split('T')[0]
            : '',
          competencias: data.data.competencias || '',
          disponibilidade: data.data.disponibilidade || '',
          interesses: data.data.interesses || '',
          avatar: data.data.avatar || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Erro ao carregar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/volunteer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Perfil atualizado com sucesso');
        // Update avatar in localStorage user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.avatar = formData.avatar;
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('userChanged'));
        }
        fetchProfile();
      } else {
        setError(data.error || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      setError('Erro ao atualizar perfil');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/volunteer"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          ← Voltar ao painel
        </Link>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Editar Perfil</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Avatar selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Escolher Avatar</label>
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-3xl">
                  {formData.avatar || '👤'}
                </div>
                <span className="text-sm text-gray-500">Ícone selecionado</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {avatars.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, avatar: emoji });
                      const storedUser = localStorage.getItem('user');
                      if (storedUser) {
                        const user = JSON.parse(storedUser);
                        user.avatar = emoji;
                        localStorage.setItem('user', JSON.stringify(user));
                        window.dispatchEvent(new Event('avatarChanged'));
                      }
                    }}
                    className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                      formData.avatar === emoji
                        ? 'ring-2 ring-primary-500 ring-offset-2 bg-primary-50 scale-110'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload de Foto Real</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                  {formData.avatar?.startsWith('data:') ? (
                    <img src={formData.avatar} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-400">📷</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/50"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                  value={formData.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localidade</label>
                <input
                  type="text"
                  placeholder="Ex: Lisboa, Porto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.localidade}
                  onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Competências</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Trabalho comunitário, ensino, primeiros socorros..."
                value={formData.competencias}
                onChange={(e) => setFormData({ ...formData, competencias: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.disponibilidade}
                onChange={(e) => setFormData({ ...formData, disponibilidade: e.target.value })}
              >
                <option value="">Selecione</option>
                <option value="fim-de-semana">Fim de semana</option>
                <option value="entre-semana">Entre semana</option>
                <option value="qualquer-altura">Qualquer altura</option>
                <option value="flexivel">Flexível</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Áreas de Interesse</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Educação, saúde, ambiente, cultura..."
                value={formData.interesses}
                onChange={(e) => setFormData({ ...formData, interesses: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
