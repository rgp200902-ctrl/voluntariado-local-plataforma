import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  // Update volunteer with user_id - handled automatically by Prisma nested create
  console.log('Volunteer user created:', volUser.email);

  // Create opportunities
  const institution = instUser.institution;
  if (institution) {
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
        data_inicio: new Date('2024-03-01T09:00:00'),
        data_fim: new Date('2024-06-30T18:00:00'),
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
        descricao: 'Ajude-nos na campanha anual de recolha de alimentos para famílias necessitadas. Os voluntários irão ajudar na distribuição de panfletos, recolha de doações e organização do armazém.',
        requisitos: 'Capacidade de carregar caixas leves. Horário flexível.',
        local: 'Porto',
        freguesia: 'Cedofeita',
        data_inicio: new Date('2024-03-15T10:00:00'),
        data_fim: new Date('2024-03-31T18:00:00'),
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
        descricao: 'Procuremos voluntários para atividades recreativas com idosos em lar. As atividades incluem leitura, jogos, música e companhia.',
        requisitos: 'Paciência e empatia. Experiência com idosos é um plus.',
        local: 'Braga',
        freguesia: 'Braga (Maximinos)',
        data_inicio: new Date('2024-04-01T14:00:00'),
        data_fim: new Date('2024-04-30T17:00:00'),
        horario: '14h-17h',
        vagas: 5,
        idade_minima: 18,
        estado: 'publicada',
        instituicao_id: institution.id,
        categoria_id: socialActionCategory?.id,
        publicada_em: new Date(),
      },
    });

    console.log('Opportunities created:', opportunity1.titulo, opportunity2.titulo, opportunity3.titulo);
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
