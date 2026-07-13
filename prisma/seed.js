const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = [
    { nome: 'Ação Social', descricao: 'Atividades de apoio social e solidariedade' },
    { nome: 'Ambiente', descricao: 'Atividades de proteção e preservação ambiental' },
    { nome: 'Educação', descricao: 'Atividades educativas e de formação' },
    { nome: 'Cultura', descricao: 'Atividades culturais e artísticas' },
    { nome: 'Desporto', descricao: 'Atividades desportivas e recreativas' },
    { nome: 'Proteção Civil', descricao: 'Atividades de prevenção e auxílio em emergências' },
    { nome: 'Apoio a Idosos', descricao: 'Atividades de apoio e companhia a idosos' },
    { nome: 'Eventos', descricao: 'Apoio a organização de eventos' },
    { nome: 'Juventude', descricao: 'Atividades para e com jovens' },
    { nome: 'Saúde e Bem-estar', descricao: 'Atividades de promoção da saúde e bem-estar' },
  ];

  for (const cat of categories) {
    await prisma.categoria.upsert({
      where: { nome: cat.nome },
      update: {},
      create: cat,
    });
  }
  console.log('Categories created');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@voluntariado.pt' },
    update: {},
    create: {
      email: 'admin@voluntariado.pt',
      nome: 'Administrador',
      password_hash: adminPassword,
      perfil: 'administrador',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create test institution
  const instPassword = await bcrypt.hash('instituicao123', 12);
  const instUser = await prisma.user.upsert({
    where: { email: 'instituicao@exemplo.pt' },
    update: {},
    create: {
      email: 'instituicao@exemplo.pt',
      nome: 'Responsável Instituição',
      password_hash: instPassword,
      perfil: 'instituicao',
      institution: {
        create: {
          nome: 'Associação Solidariedade',
          descricao: 'Associação dedicada à ação social e apoio comunitário',
          morada: 'Rua da Solidariedade, 45 - Lisboa',
          telefone: '+351 912 345 678',
          email: 'geral@solidariedade.pt',
          website: 'https://solidariedade.pt',
          pessoa_contacto: 'Maria Santos',
          tipo: 'associação',
          categoria: 'Ação Social',
          estado_validacao: 'aprovada',
        },
      },
    },
    include: { institution: true },
  });
  console.log('Institution user created:', instUser.email);

  // Create test volunteer
  const volPassword = await bcrypt.hash('voluntario123', 12);
  const volUser = await prisma.user.upsert({
    where: { email: 'voluntario@exemplo.pt' },
    update: {},
    create: {
      email: 'voluntario@exemplo.pt',
      nome: 'João Silva',
      password_hash: volPassword,
      perfil: 'voluntario',
      volunteer: {
        create: {
          telefone: '+351 913 456 789',
          localidade: 'Porto',
          disponibilidade: 'Fins de semana, tardes de segunda a sexta',
          interesses: 'Educação, saúde, ambiente',
          competencias: 'Trabalho comunitário, ensino, primeiros socorros',
          consentimento_rgpd: true,
          data_consentimento: new Date(),
        },
      },
    },
    include: { volunteer: true },
  });
  console.log('Volunteer user created:', volUser.email);

  // Create opportunities
  const institution = instUser.institution;
  if (institution) {
    // Remove existing opportunities for this institution
    await prisma.inscricao.deleteMany({});
    await prisma.oportunidade.deleteMany({ where: { instituicao_id: institution.id } });

    const socialActionCategory = await prisma.categoria.findUnique({
      where: { nome: 'Ação Social' },
    });

    const opportunity1 = await prisma.oportunidade.create({
      data: {
        titulo: 'Ajuda no Centro Comunitário',
        descricao: 'Procuramos voluntários para ajudar no centro comunitário local. As atividades incluem apoio a idosos, atividades educativas para crianças e organização de eventos comunitários.',
        requisitos: 'Disponibilidade mínima de 4 horas por semana. Experiência anterior é valorizada mas não obrigatória.',
        local: 'Lisboa',
        freguesia: 'Ajuda',
        data_inicio: new Date('2026-07-01T09:00:00'),
        data_fim: new Date('2026-12-31T18:00:00'),
        horario: '9h-17h',
        vagas: 10,
        idade_minima: 16,
        estado: 'publicada',
        instituicao_id: institution.id,
        categoria_id: socialActionCategory?.id,
        publicada_em: new Date(),
      },
    });

    const opportunity2 = await prisma.oportunidade.create({
      data: {
        titulo: 'Campanha de Recolha de Alimentos',
        descricao: 'Ajude-nos na campanha anual de recolha de alimentos para famílias necessitadas.',
        requisitos: 'Capacidade de carregar caixas leves. Horário flexível.',
        local: 'Porto',
        freguesia: 'Cedofeita',
        data_inicio: new Date('2026-07-15T10:00:00'),
        data_fim: new Date('2026-10-31T18:00:00'),
        horario: '10h-18h',
        vagas: 15,
        estado: 'publicada',
        instituicao_id: institution.id,
        categoria_id: socialActionCategory?.id,
        publicada_em: new Date(),
      },
    });

    const opportunity3 = await prisma.oportunidade.create({
      data: {
        titulo: 'Atividades com Idosos',
        descricao: 'Procuremos voluntários para atividades recreativas com idosos em lar.',
        requisitos: 'Paciência e empatia. Experiência com idosos é um plus.',
        local: 'Braga',
        freguesia: 'Braga (Maximinos)',
        data_inicio: new Date('2026-08-01T14:00:00'),
        data_fim: new Date('2026-12-31T17:00:00'),
        horario: '14h-17h',
        vagas: 5,
        idade_minima: 18,
        estado: 'publicada',
        instituicao_id: institution.id,
        categoria_id: socialActionCategory?.id,
        publicada_em: new Date(),
      },
    });

    // Ação Social
    await prisma.oportunidade.create({
      data: {
        titulo: 'Apoio a Famílias Carenciadas',
        descricao: 'Precisamos de voluntários para entregar pacotes alimentares e roupa a famílias em situação de vulnerabilidade social na zona de Lisboa.',
        requisitos: 'Disponibilidade ao sábado de manhã. Respeito e discrição.',
        local: 'Lisboa', freguesia: 'Arroios',
        data_inicio: new Date('2026-07-15T09:00:00'), data_fim: new Date('2026-12-31T13:00:00'),
        horario: '9h-13h', vagas: 8, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: socialActionCategory?.id, publicada_em: new Date(),
      },
    });

    const ambienteCategory = await prisma.categoria.findUnique({ where: { nome: 'Ambiente' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Limpeza da Praia de Carcavelos',
        descricao: 'Organizamos limpezas mensais da praia de Carcavelos. Junte-se a nós para manter a nossa costa limpa e proteger o ecossistema marinho.',
        requisitos: 'Roupas adequadas para a praia. Protetor solar e água.',
        local: 'Oeiras', freguesia: 'Carcavelos',
        data_inicio: new Date('2026-07-20T08:00:00'), data_fim: new Date('2026-10-31T12:00:00'),
        horario: '8h-12h', vagas: 30, idade_minima: 12,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: ambienteCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Plantação de Árvores no Monsanto',
        descricao: 'Ajude-nos a reforestar o Parque Florestal do Monsanto. Vamos plantar 500 árvores nativas durante o outono.',
        requisitos: 'Capacidade física para trabalho manual ao ar livre. Vestuário adequado.',
        local: 'Lisboa', freguesia: 'Benfica',
        data_inicio: new Date('2026-10-01T09:00:00'), data_fim: new Date('2026-11-30T16:00:00'),
        horario: '9h-16h', vagas: 40, idade_minima: 16,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: ambienteCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Horta Comunitária Sustentável',
        descricao: 'Contribua para a horta comunitária urbana. Aprenda técnicas de agricultura sustentável e ajude a produzir alimentos para a comunidade.',
        requisitos: 'Interesse pela agricultura sustentável. Disponibilidade semanal.',
        local: 'Porto', freguesia: 'Paranhos',
        data_inicio: new Date('2026-07-01T08:00:00'), data_fim: new Date('2026-12-31T12:00:00'),
        horario: '8h-12h', vagas: 12, idade_minima: 14,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: ambienteCategory?.id, publicada_em: new Date(),
      },
    });

    const educacaoCategory = await prisma.categoria.findUnique({ where: { nome: 'Educação' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Explicação Gratuita para Estudantes',
        descricao: 'Dê aulas de explicação gratuitamente a estudantes do ensino básico e secundário com dificuldades financeiras.',
        requisitos: 'Conhecimentos numa ou mais disciplinas escolares. Paciência e dedicação.',
        local: 'Lisboa', freguesia: 'Areeiro',
        data_inicio: new Date('2026-09-15T17:00:00'), data_fim: new Date('2027-06-15T20:00:00'),
        horario: '17h-20h', vagas: 20, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: educacaoCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Alfabetização Digital para Idosos',
        descricao: 'Ensine idosos a utilizar smartphones, tablets e internet. Ajude-os a manter contacto familiar e aceder a serviços digitais.',
        requisitos: 'Paciência, didática e conhecimentos básicos de tecnologia.',
        local: 'Braga', freguesia: 'São Vítor',
        data_inicio: new Date('2026-08-01T10:00:00'), data_fim: new Date('2026-12-20T12:00:00'),
        horario: '10h-12h', vagas: 10, idade_minima: 16,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: educacaoCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Oficina de Leitura para Crianças',
        descricao: 'Promova o gosto pela leitura através de sessões de contação de histórias e atividades literárias para crianças de 3 a 10 anos.',
        requisitos: 'Gosto por crianças e pela leitura. Criatividade.',
        local: 'Coimbra', freguesia: 'Sé Nova',
        data_inicio: new Date('2026-09-01T15:00:00'), data_fim: new Date('2027-06-30T17:00:00'),
        horario: '15h-17h', vagas: 6, idade_minima: 16,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: educacaoCategory?.id, publicada_em: new Date(),
      },
    });

    const culturaCategory = await prisma.categoria.findUnique({ where: { nome: 'Cultura' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Guia Voluntário no Museu Nacional',
        descricao: 'Apoie a organização de visitas guiadas no Museu. Receba os visitantes, forneça informações e auxilie na coordenação de grupos.',
        requisitos: 'Interesse pela história e cultura. Boa comunicação verbal.',
        local: 'Lisboa', freguesia: 'Santa Maria Maior',
        data_inicio: new Date('2026-08-01T10:00:00'), data_fim: new Date('2026-12-31T17:00:00'),
        horario: '10h-17h', vagas: 8, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: culturaCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Festival de Música ao Ar Livre',
        descricao: 'Procurem-se voluntários para apoiar a organização do Festival de Música ao Ar Livre. Funções incluem informação ao público e apoio logístico.',
        requisitos: 'Disponibilidade durante os 3 dias do festival. Experiência em eventos é um plus.',
        local: 'Guimarães', freguesia: 'São Paio',
        data_inicio: new Date('2026-09-05T08:00:00'), data_fim: new Date('2026-09-07T23:00:00'),
        horario: '8h-23h', vagas: 25, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: culturaCategory?.id, publicada_em: new Date(),
      },
    });

    const desportoCategory = await prisma.categoria.findUnique({ where: { nome: 'Desporto' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Treinador Associativo de Futebol',
        descricao: 'Procuramos voluntários para treinar equipas de futebol juvenil nos fins de semana. Promova o desporto e a vida saudável entre os jovens.',
        requisitos: 'Conhecimentos de futebol. Capacidade de liderança. Formação desportiva é valorizada.',
        local: 'Setúbal', freguesia: 'Azeitão (São Lourenço)',
        data_inicio: new Date('2026-09-01T09:00:00'), data_fim: new Date('2027-06-30T12:00:00'),
        horario: '9h-12h (sábados e domingos)', vagas: 4, idade_minima: 21,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: desportoCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Corrida Solidária - Apoio ao Evento',
        descricao: 'Apoie a organização da Corrida Solidária anual. Montagem de circuito, registo de participantes e apoio nashidratação.',
        requisitos: 'Disponibilidade no dia do evento. Capacidade física.',
        local: 'Porto', freguesia: 'Cedofeita',
        data_inicio: new Date('2026-10-15T06:00:00'), data_fim: new Date('2026-10-15T15:00:00'),
        horario: '6h-15h', vagas: 20, idade_minima: 16,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: desportoCategory?.id, publicada_em: new Date(),
      },
    });

    const protecaoCategory = await prisma.categoria.findUnique({ where: { nome: 'Proteção Civil' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Formação em Primeiros Socorros',
        descricao: 'Torne-se voluntário de proteção civil. Receba formação gratuita em primeiros socorros, prevenção de riscos e apoio em emergências.',
        requisitos: 'Maior de 18 anos. Disponibilidade para formação e práticas.',
        local: 'Lisboa', freguesia: 'Alvalade',
        data_inicio: new Date('2026-09-10T18:00:00'), data_fim: new Date('2026-12-15T21:00:00'),
        horario: '18h-21h', vagas: 15, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: protecaoCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Campanha de Conscientização contra Incêndios',
        descricao: 'Ajude na distribuição de material informativo e na realização de palestras de prevenção de incêndios florestais.',
        requisitos: 'Boa capacidade de comunicação. Disponibilidade aos fins de semana.',
        local: 'Viseu', freguesia: 'São José',
        data_inicio: new Date('2026-07-01T09:00:00'), data_fim: new Date('2026-09-30T17:00:00'),
        horario: '9h-17h', vagas: 10, idade_minima: 16,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: protecaoCategory?.id, publicada_em: new Date(),
      },
    });

    const idososCategory = await prisma.categoria.findUnique({ where: { nome: 'Apoio a Idosos' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Companhia a Idosos em Lar',
        descricao: 'Visite idosos em lares para lhes fazer companhia, jogar cartas, conversar e alegrar o dia.',
        requisitos: 'Paciência, empatia e respeito pelos idosos. Disponibilidade semanal.',
        local: 'Faro', freguesia: 'Sé',
        data_inicio: new Date('2026-07-10T14:00:00'), data_fim: new Date('2026-12-31T17:00:00'),
        horario: '14h-17h', vagas: 12, idade_minima: 14,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: idososCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Apoio Doméstico a Idosos Isolados',
        descricao: 'Ajude idosos isolados com tarefas domésticas leves como compras, limpeza e acompanhamento a consultas médicas.',
        requisitos: 'Conduzir é um plus. Disponibilidade durante a semana.',
        local: 'Leiria', freguesia: 'Marvila',
        data_inicio: new Date('2026-08-01T09:00:00'), data_fim: new Date('2026-12-31T13:00:00'),
        horario: '9h-13h', vagas: 8, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: idososCategory?.id, publicada_em: new Date(),
      },
    });

    const eventosCategory = await prisma.categoria.findUnique({ where: { nome: 'Eventos' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Feira Solidária de Natal',
        descricao: 'Organize e apoie a Feira Solidária de Natal. Venda de artesanato, animação musical e apoio ao público.',
        requisitos: 'Disponibilidade durante os 4 dias da feira. Criatividade e simpatia.',
        local: 'Braga', freguesia: 'São João do Souto',
        data_inicio: new Date('2026-12-18T10:00:00'), data_fim: new Date('2026-12-22T21:00:00'),
        horario: '10h-21h', vagas: 30, idade_minima: 14,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: eventosCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Organização de Evento Desportivo Beneficente',
        descricao: 'Apoie a organização do torneio desportivo beneficente. Montagem de estádio, registo de equipas e receção ao público.',
        requisitos: 'Organização e trabalho em equipa. Disponibilidade ao fim de semana.',
        local: 'Coimbra', freguesia: 'Santa Clara',
        data_inicio: new Date('2026-11-01T08:00:00'), data_fim: new Date('2026-11-03T20:00:00'),
        horario: '8h-20h', vagas: 15, idade_minima: 16,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: eventosCategory?.id, publicada_em: new Date(),
      },
    });

    const juventudeCategory = await prisma.categoria.findUnique({ where: { nome: 'Juventude' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Mentoria para Jovens em Risco',
        descricao: 'Seja mentor de um jovem. Acompanhe-o semanalmente, ajude nos estudos e seja uma referência positiva na sua vida.',
        requisitos: 'Maior de 21 anos. Compromisso de mínimo 1 ano. Formação obrigatória.',
        local: 'Lisboa', freguesia: 'Marvila',
        data_inicio: new Date('2026-09-01T17:00:00'), data_fim: new Date('2027-08-31T19:00:00'),
        horario: '17h-19h', vagas: 10, idade_minima: 21,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: juventudeCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Ateliê de Criatividade para Jovens',
        descricao: 'Oficina de arte e criatividade para jovens entre 12 e 18 anos. Pintura, escultura, fotografia e expressão artística.',
        requisitos: 'Conhecimentos em artes visuais. Didática com adolescentes.',
        local: 'Porto', freguesia: 'Bonfim',
        data_inicio: new Date('2026-09-15T15:00:00'), data_fim: new Date('2027-06-15T18:00:00'),
        horario: '15h-18h', vagas: 8, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: juventudeCategory?.id, publicada_em: new Date(),
      },
    });

    const saudeCategory = await prisma.categoria.findUnique({ where: { nome: 'Saúde e Bem-estar' } });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Campanha de Doação de Sangue',
        descricao: 'Apoie as campanhas de doação de sangue. Informe o público, ajude no registo e forneça apoio pós-doação.',
        requisitos: 'Capacidade de comunicação. Formação básica fornecida.',
        local: 'Lisboa', freguesia: 'Avenidas Novas',
        data_inicio: new Date('2026-07-15T09:00:00'), data_fim: new Date('2026-12-31T18:00:00'),
        horario: '9h-18h', vagas: 6, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: saudeCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Aulas de Yoga Comunitário',
        descricao: 'Lecute aulas de yoga gratuitas ao ar livre para a comunidade. Promova a saúde física e mental de todos.',
        requisitos: 'Certificação em yoga. Experiência em lecionar grupos.',
        local: 'Setúbal', freguesia: 'Afonso de Albuquerque',
        data_inicio: new Date('2026-08-01T07:00:00'), data_fim: new Date('2026-10-31T09:00:00'),
        horario: '7h-9h', vagas: 1, idade_minima: 18,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: saudeCategory?.id, publicada_em: new Date(),
      },
    });

    await prisma.oportunidade.create({
      data: {
        titulo: 'Apoio Psicológico em Linha',
        descricao: 'Voluntários psicólogos para prestação de escuta ativa e apoio emocional em linha para pessoas em situação de vulnerabilidade.',
        requisitos: 'Licenciatura em Psicologia. Sensibilidade e empatia.',
        local: 'Remoto', freguesia: '',
        data_inicio: new Date('2026-07-01T09:00:00'), data_fim: new Date('2026-12-31T18:00:00'),
        horario: '9h-18h', vagas: 5, idade_minima: 23,
        estado: 'publicada', instituicao_id: institution.id, categoria_id: saudeCategory?.id, publicada_em: new Date(),
      },
    });

    console.log('Opportunities created');
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
