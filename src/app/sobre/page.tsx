import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sobre a Plataforma</h1>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">O que é?</h2>
          <p className="text-gray-600 mb-4">
            A Plataforma de Voluntariado Local é uma iniciativa que visa facilitar a conexão entre 
            instituições locais que necessitam de apoio voluntário e cidadões disponíveis para 
            colaborar em ações de interesse comunitário.
          </p>
          <p className="text-gray-600">
            Atualmente, muitas necessidades de voluntariado são divulgadas de forma dispersa, 
            através de contactos informais, redes sociais, cartazes, email ou comunicação direta 
            entre instituições e cidadãos. Esta dispersão dificulta a gestão das oportunidades, 
            o acompanhamento das inscrições e a criação de uma base organizada de voluntários 
            disponíveis para colaborar com a comunidade.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Objetivos</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              Registrar instituições locais
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              Registrar voluntários
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              Publicar oportunidades de voluntariado
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              Consultar oportunidades disponíveis
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              Permitir às instituições gerir inscrições recebidas
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              Permitir ao Município acompanhar a atividade global da plataforma
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              Promover a participação cívica e comunitária
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              Criar uma base organizada de voluntários locais
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Público-alvo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instituições</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Associações locais</li>
                <li>• IPSS</li>
                <li>• Escolas</li>
                <li>• Juntas de Freguesia</li>
                <li>• Serviços municipais</li>
                <li>• Clubes desportivos</li>
                <li>• Grupos culturais</li>
                <li>• Entidades organizadoras de eventos</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voluntários</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cidadãos em geral</li>
                <li>• Jovens</li>
                <li>• Estudantes</li>
                <li>• Reformados</li>
                <li>• Profissionais com disponibilidade pontual</li>
                <li>• Pessoas interessadas em causas sociais</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Município</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Validar instituições</li>
                <li>• Acompanhar utilização</li>
                <li>• Moderar conteúdos</li>
                <li>• Garantir boas práticas</li>
                <li>• Consultar relatórios</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/registro"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Comece Agora
          </Link>
        </div>
      </div>
    </div>
  );
}
