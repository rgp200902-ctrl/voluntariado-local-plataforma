import Link from 'next/link';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { PhotoGallery } from '@/components/PhotoGallery';
import { ParticlesBackground } from '@/components/ParticlesBackground';

async function getStats() {
  return {
    activeOpportunities: 25,
    registeredInstitutions: 8,
    registeredVolunteers: 45,
    totalHours: 1200,
  };
}

async function getHighlightedOpportunities() {
  return [
    {
      id: '1',
      title: 'Ajuda no Centro Comunitário',
      institution: 'Associação Solidariedade',
      location: 'Lisboa',
      date: '2026-07-15',
      description: 'Procuramos voluntários para ajudar no centro comunitário local.',
      slots: 10,
      registrations: 4,
      category: 'Ação Social',
    },
    {
      id: '2',
      title: 'Campanha de Recolha de Alimentos',
      institution: 'IPSS Esperança',
      location: 'Porto',
      date: '2026-08-01',
      description: 'Ajude-nos na campanha anual de recolha de alimentos.',
      slots: 15,
      registrations: 8,
      category: 'Ação Social',
    },
    {
      id: '3',
      title: 'Limpeza da Praia de Carcavelos',
      institution: 'Associação Solidariedade',
      location: 'Oeiras',
      date: '2026-07-20',
      description: 'Organizamos limpezas mensais da praia para proteger o ecossistema marinho.',
      slots: 30,
      registrations: 12,
      category: 'Ambiente',
    },
  ];
}

const testimonials = [
  {
    name: 'Maria Santos',
    role: 'Voluntária há 2 anos',
    text: 'O voluntariado mudou a minha vida. Conheci pessoas incríveis e aprendi que pequenas ações podem transformar uma comunidade inteira.',
    avatar: '👩',
  },
  {
    name: 'Pedro Costa',
    role: 'Voluntário há 1 ano',
    text: 'Ajudar os outros dá uma satisfação enorme. Recomendo a todos que experimentem pelo menos uma vez na vida.',
    avatar: '👨',
  },
  {
    name: 'Ana Oliveira',
    role: 'Coordenadora de projetos',
    text: 'Através desta plataforma consegui reunir mais de 50 voluntários para o nosso projeto de re florestação. Incrível!',
    avatar: '👩‍🦱',
  },
];

export default async function HomePage() {
  const stats = await getStats();
  const opportunities = await getHighlightedOpportunities();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 relative overflow-hidden">
        <ParticlesBackground />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMTItNHYySDI0VjI0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Faz a Diferença na<br />
              <span className="text-primary-200">Tua Comunidade</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-3xl mx-auto">
              Conectamos instituições locais com voluntários dedicados para construir uma comunidade mais forte e solidária
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
            <Link
              href="/registro?role=volunteer"
              className="bg-white text-primary-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Quero Ser Voluntário
            </Link>
            <Link
              href="/registro?role=institution"
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Sou Instituição
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">O Nosso Impacto</h2>
          </ScrollAnimation>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center card-hover">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <div className="text-4xl font-extrabold text-primary-600 mb-2">
                  <AnimatedCounter end={stats.activeOpportunities} />
                </div>
                <div className="text-gray-600 font-medium">Oportunidades Ativas</div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.2}>
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center card-hover">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏛️</span>
                </div>
                <div className="text-4xl font-extrabold text-green-600 mb-2">
                  <AnimatedCounter end={stats.registeredInstitutions} />
                </div>
                <div className="text-gray-600 font-medium">Instituições</div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.3}>
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center card-hover">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="text-4xl font-extrabold text-purple-600 mb-2">
                  <AnimatedCounter end={stats.registeredVolunteers} />
                </div>
                <div className="text-gray-600 font-medium">Voluntários</div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.4}>
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center card-hover">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⏰</span>
                </div>
                <div className="text-4xl font-extrabold text-yellow-600 mb-2">
                  <AnimatedCounter end={stats.totalHours} suffix="h" />
                </div>
                <div className="text-gray-600 font-medium">Horas Voluntárias</div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Highlighted Opportunities Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">Oportunidades em Destaque</h2>
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {opportunities.map((opportunity, index) => (
              <ScrollAnimation key={opportunity.id} delay={index * 0.15}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover h-full flex flex-col">
                  <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-6xl">🤝</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{opportunity.title}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 whitespace-nowrap ml-2">
                        {opportunity.category}
                      </span>
                    </div>
                    <p className="text-primary-600 text-sm mb-2 font-medium">{opportunity.institution}</p>
                    <p className="text-gray-500 text-sm mb-3">
                      📍 {opportunity.location} • 📅 {new Date(opportunity.date).toLocaleDateString('pt-PT')}
                    </p>
                    <p className="text-gray-600 mb-4 flex-1">{opportunity.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{opportunity.registrations} inscritos</span>
                        <span>{opportunity.slots} vagas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(opportunity.registrations / opportunity.slots) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/oportunidades/${opportunity.id}`}
                      className="block w-full text-center bg-primary-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors"
                    >
                      Saber Mais
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
          <ScrollAnimation delay={0.3}>
            <div className="text-center mt-12">
              <Link
                href="/oportunidades"
                className="inline-block bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              >
                Ver Todas as Oportunidades
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white">Galeria de Atividades</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Momentos que marcaram a nossa comunidade</p>
          </ScrollAnimation>
          <ScrollAnimation delay={0.2}>
            <PhotoGallery />
          </ScrollAnimation>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">O Que Dizem os Nossos Voluntários</h2>
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollAnimation key={index} delay={index * 0.15}>
                <div className="bg-white rounded-2xl shadow-lg p-8 card-hover h-full flex flex-col">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-3xl mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-primary-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute -top-2 -left-2 text-6xl text-primary-100 font-serif">&ldquo;</span>
                    <p className="text-gray-600 italic relative z-10 leading-relaxed">
                      {testimonial.text}
                    </p>
                  </div>
                  <div className="flex mt-4 text-yellow-400">
                    {'★★★★★'}
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">Como Funciona</h2>
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-1 bg-primary-200 z-0" />
            {[
              { num: 1, icon: '📝', title: 'Registe-se', desc: 'Crie a sua conta gratuitamente como voluntário ou instituição' },
              { num: 2, icon: '🔍', title: 'Explore', desc: 'Veja as oportunidades disponíveis na sua área' },
              { num: 3, icon: '✋', title: 'Candidate-se', desc: 'Inscreva-se nas oportunidades que mais lhe interessam' },
              { num: 4, icon: '🎉', title: 'Colabore', desc: 'Participe ativamente e faça a diferença na comunidade' },
            ].map((step, index) => (
              <ScrollAnimation key={step.num} delay={index * 0.15}>
                <div className="text-center relative z-10">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h2 className="text-4xl font-bold mb-6">Pronto para Fazer a Diferença?</h2>
            <p className="text-xl mb-10 text-primary-100">
              Junte-se a dezenas de voluntários e instituições que já estão a transformar a nossa comunidade
            </p>
            <Link
              href="/registro"
              className="inline-block bg-white text-primary-700 px-12 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Comece Agora
            </Link>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
