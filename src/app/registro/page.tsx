'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'volunteer';

  const [activeTab, setActiveTab] = useState<'volunteer' | 'institution'>(initialRole as 'volunteer' | 'institution');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [volunteerData, setVolunteerData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    parish: '',
    dateOfBirth: '',
    ageRange: '',
    skills: '',
    availability: '',
    areasOfInterest: '',
    motivation: '',
    consentData: false,
    acceptTerms: false,
  });

  const [institutionData, setInstitutionData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institutionName: '',
    nif: '',
    type: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    contactPerson: '',
    category: '',
  });

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (volunteerData.password !== volunteerData.confirmPassword) {
      setError('As palavras-passe não coincidem');
      return;
    }

    if (!volunteerData.consentData) {
      setError('Deve dar consentimento para o tratamento de dados');
      return;
    }

    if (!volunteerData.acceptTerms) {
      setError('Deve aceitar os termos de utilização');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registar');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.dispatchEvent(new Event('userChanged'));

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => router.push('/dashboard/volunteer'), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registar');
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (institutionData.password !== institutionData.confirmPassword) {
      setError('As palavras-passe não coincidem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register/institution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(institutionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registar');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.dispatchEvent(new Event('userChanged'));

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => router.push('/dashboard/institution'), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Criar uma conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              entre na sua conta existente
            </Link>
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex rounded-lg bg-gray-200 p-1 mb-8">
          <button
            onClick={() => setActiveTab('volunteer')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'volunteer'
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sou Voluntário
          </button>
          <button
            onClick={() => setActiveTab('institution')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'institution'
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sou Instituição
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        {/* Volunteer Form */}
        {activeTab === 'volunteer' && (
          <form onSubmit={handleVolunteerSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={volunteerData.name}
                  onChange={(e) => setVolunteerData({ ...volunteerData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={volunteerData.email}
                  onChange={(e) => setVolunteerData({ ...volunteerData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={volunteerData.password}
                  onChange={(e) => setVolunteerData({ ...volunteerData, password: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Palavra-passe *</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={volunteerData.confirmPassword}
                  onChange={(e) => setVolunteerData({ ...volunteerData, confirmPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={volunteerData.phone}
                  onChange={(e) => setVolunteerData({ ...volunteerData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={volunteerData.dateOfBirth}
                  onChange={(e) => setVolunteerData({ ...volunteerData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Freguesia/Localidade</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={volunteerData.parish}
                onChange={(e) => setVolunteerData({ ...volunteerData, parish: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={volunteerData.address}
                onChange={(e) => setVolunteerData({ ...volunteerData, address: e.target.value })}
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 pt-4 border-t">Perfil de Voluntário</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Fins de semana, tardes de segunda a sexta..."
                value={volunteerData.availability}
                onChange={(e) => setVolunteerData({ ...volunteerData, availability: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Áreas de Interesse</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Educação, saúde, ambiente, cultura..."
                value={volunteerData.areasOfInterest}
                onChange={(e) => setVolunteerData({ ...volunteerData, areasOfInterest: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Competências Relevantes</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Trabalho comunitário, ensino, primeiros socorros..."
                value={volunteerData.skills}
                onChange={(e) => setVolunteerData({ ...volunteerData, skills: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivação</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Porquê que quer ser voluntário?"
                value={volunteerData.motivation}
                onChange={(e) => setVolunteerData({ ...volunteerData, motivation: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="consentData"
                  required
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  checked={volunteerData.consentData}
                  onChange={(e) => setVolunteerData({ ...volunteerData, consentData: e.target.checked })}
                />
                <label htmlFor="consentData" className="ml-2 text-sm text-gray-600">
                  Dou o meu consentimento para o tratamento dos meus dados pessoais nos termos da Política de Privacidade. *
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  required
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  checked={volunteerData.acceptTerms}
                  onChange={(e) => setVolunteerData({ ...volunteerData, acceptTerms: e.target.checked })}
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                  Li e aceito os Termos de Utilização da plataforma. *
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'A registar...' : 'Registar como Voluntário'}
            </button>
          </form>
        )}

        {/* Institution Form */}
        {activeTab === 'institution' && (
          <form onSubmit={handleInstitutionSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Responsável</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.name}
                  onChange={(e) => setInstitutionData({ ...institutionData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.email}
                  onChange={(e) => setInstitutionData({ ...institutionData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.password}
                  onChange={(e) => setInstitutionData({ ...institutionData, password: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Palavra-passe *</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.confirmPassword}
                  onChange={(e) => setInstitutionData({ ...institutionData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 pt-4 border-t">Dados da Instituição</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Instituição *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.institutionName}
                  onChange={(e) => setInstitutionData({ ...institutionData, institutionName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                <input
                  type="text"
                  pattern="[0-9]{9}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Número de 9 dígitos"
                  value={institutionData.nif}
                  onChange={(e) => setInstitutionData({ ...institutionData, nif: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Instituição *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.type}
                  onChange={(e) => setInstitutionData({ ...institutionData, type: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="ASSOCIACAO">Associação</option>
                  <option value="IPSS">IPSS</option>
                  <option value="ESCOLA">Escola</option>
                  <option value="JUNTA_FREGUESIA">Junta de Freguesia</option>
                  <option value="SERVICO_MUNICIPAL">Serviço Municipal</option>
                  <option value="CLUBE_DESPORTIVO">Clube Desportivo</option>
                  <option value="GRUPO_CULTURAL">Grupo Cultural</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa de Contacto *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.contactPerson}
                  onChange={(e) => setInstitutionData({ ...institutionData, contactPerson: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Instituição</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descreva a sua instituição e as suas atividades..."
                value={institutionData.description}
                onChange={(e) => setInstitutionData({ ...institutionData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.phone}
                  onChange={(e) => setInstitutionData({ ...institutionData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Institucional</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.email}
                  onChange={(e) => setInstitutionData({ ...institutionData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.website}
                  onChange={(e) => setInstitutionData({ ...institutionData, website: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={institutionData.category}
                  onChange={(e) => setInstitutionData({ ...institutionData, category: e.target.value })}
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="social">Ação Social</option>
                  <option value="educacao">Educação</option>
                  <option value="saude">Saúde</option>
                  <option value="ambiente">Ambiente</option>
                  <option value="cultura">Cultura</option>
                  <option value="desporto">Desporto</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={institutionData.address}
                onChange={(e) => setInstitutionData({ ...institutionData, address: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTermsInst"
                  required
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="acceptTermsInst" className="ml-2 text-sm text-gray-600">
                  Li e aceito os Termos de Utilização e a Política de Privacidade da plataforma. *
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'A registar...' : 'Registar Instituição'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              A sua instituição será revista por um administrador antes de ser ativada.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>A carregar...</p></div>}>
      <RegisterPageInner />
    </Suspense>
  );
}
