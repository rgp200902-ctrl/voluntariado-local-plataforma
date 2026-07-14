from django.core.management.base import BaseCommand
from accounts.models import User, Volunteer, Institution
from oportunidades.models import Categoria, Oportunidade
from django.utils import timezone
from datetime import datetime, timezone as tz


class Command(BaseCommand):
    help = 'Popula a base de dados com dados de teste'

    def handle(self, *args, **options):
        categorias_data = [
            ('Ação Social', 'Apoio a pessoas em situação de vulnerabilidade social'),
            ('Ambiente', 'Projetos de preservação ambiental e sustentabilidade'),
            ('Educação', 'Apoio educativo a crianças, jovens e adultos'),
            ('Cultura', 'Promoção de atividades culturais e artísticas'),
            ('Desporto', 'Atividades desportivas e recreativas'),
            ('Proteção Civil', 'Apoio em situações de emergência e proteção civil'),
            ('Apoio a Idosos', 'Companhia e apoio a pessoas idosas'),
            ('Eventos', 'Apoio na organização de eventos'),
            ('Juventude', 'Programas e atividades para jovens'),
            ('Saúde e Bem-estar', 'Promoção da saúde e bem-estar'),
        ]

        categorias = {}
        for nome, desc in categorias_data:
            cat, _ = Categoria.objects.get_or_create(nome=nome, defaults={'descricao': desc})
            categorias[nome] = cat
        self.stdout.write(f'{len(categorias)} categorias criadas.')

        admin_user, created = User.objects.get_or_create(
            email='admin@voluntariado.pt',
            defaults={'first_name': 'Admin', 'perfil': 'administrador', 'is_staff': True, 'is_superuser': True}
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Admin criado.'))

        vol_user, created = User.objects.get_or_create(
            email='voluntario@exemplo.pt',
            defaults={'first_name': 'João', 'last_name': 'Silva', 'perfil': 'voluntario'}
        )
        if created:
            vol_user.set_password('voluntario123')
            vol_user.save()
        Volunteer.objects.get_or_create(
            user=vol_user,
            defaults={'telefone': '912345678', 'localidade': 'Lisboa', 'consentimento_rgpd': True}
        )
        self.stdout.write(self.style.SUCCESS('Voluntário criado.'))

        inst_user, created = User.objects.get_or_create(
            email='instituicao@exemplo.pt',
            defaults={'first_name': 'Maria', 'last_name': 'Santos', 'perfil': 'instituicao'}
        )
        if created:
            inst_user.set_password('instituicao123')
            inst_user.save()
        inst, _ = Institution.objects.get_or_create(
            user=inst_user,
            defaults={
                'nome': 'Associação Solidariedade',
                'nif': '123456789',
                'tipo': 'ipss',
                'descricao': 'Associação de apoio social que atua na região de Lisboa.',
                'estado_validacao': 'aprovada',
                'telefone': '210000001',
            }
        )
        self.stdout.write(self.style.SUCCESS('Instituição criada.'))

        inst2_user, created = User.objects.get_or_create(
            email='instituicao2@exemplo.pt',
            defaults={'first_name': 'Pedro', 'last_name': 'Costa', 'perfil': 'instituicao'}
        )
        if created:
            inst2_user.set_password('instituicao123')
            inst2_user.save()
        inst2, _ = Institution.objects.get_or_create(
            user=inst2_user,
            defaults={
                'nome': 'IPSS Esperança',
                'nif': '987654321',
                'tipo': 'ipss',
                'descricao': 'Instituição particular de solidariedade social.',
                'estado_validacao': 'aprovada',
                'telefone': '210000002',
            }
        )

        oportunidades_data = [
            ('Ajuda no Centro Comunitário', inst, 'Ação Social', 'Lisboa', 'Apoio no centro comunitário com refeições e convívio.', 10, '2026-07-15'),
            ('Campanha de Recolha de Alimentos', inst, 'Ação Social', 'Porto', 'Campanha anual de recolha e distribuição de alimentos.', 15, '2026-08-01'),
            ('Limpeza da Praia', inst, 'Ambiente', 'Oeiras', 'Limpeza mensal da praia para proteger o ecossistema marinho.', 30, '2026-07-20'),
            ('Apoio Escolar', inst, 'Educação', 'Lisboa', 'Explicações e apoio ao estudo para crianças carenciadas.', 8, '2026-09-01'),
            ('Oficina de Teatro', inst2, 'Cultura', 'Porto', 'Oficina de teatro para jovens da comunidade.', 12, '2026-07-25'),
            ('Torneio Desportivo', inst2, 'Desporto', 'Braga', 'Torneio de futebol solidário.', 20, '2026-08-15'),
            ('Sessão de Sensibilização', inst, 'Proteção Civil', 'Lisboa', 'Sessão sobre primeiros socorros e proteção civil.', 25, '2026-07-30'),
            ('Visita a Lares', inst, 'Apoio a Idosos', 'Cascais', 'Visitas semanais a lares de idosos para companhia.', 6, '2026-08-05'),
            ('Apoio à Corrida Solidária', inst2, 'Eventos', 'Porto', 'Apoio na organização da corrida solidária anual.', 15, '2026-09-10'),
            ('Workshop de Empreendedorismo', inst, 'Juventude', 'Lisboa', 'Workshop para jovens sobre empreendedorismo social.', 20, '2026-08-20'),
            ('Rastreio de Saúde', inst2, 'Saúde e Bem-estar', 'Coimbra', 'Rastreio gratuito de diabetes e tensão arterial.', 10, '2026-07-28'),
            ('Jardinagem Comunitária', inst, 'Ambiente', 'Lisboa', 'Manutenção de jardins e hortas comunitárias.', 10, '2026-08-10'),
            ('Feira do Livro', inst2, 'Cultura', 'Porto', 'Apoio na organização da feira do livro local.', 8, '2026-09-05'),
            ('Atividades com Crianças', inst, 'Ação Social', 'Amadora', 'Atividades lúdico-pedagógicas para crianças em risco.', 12, '2026-08-12'),
            ('Aulas de Inglês', inst2, 'Educação', 'Lisboa', 'Aulas gratuitas de inglês para adultos.', 10, '2026-09-15'),
            ('Reflorestação', inst, 'Ambiente', 'Sintra', 'Plantação de árvores em área ardida.', 40, '2026-10-01'),
            ('Apoio Informático', inst, 'Juventude', 'Lisboa', 'Apoio informático para seniores.', 5, '2026-08-25'),
            ('Banco Alimentar', inst2, 'Ação Social', 'Porto', 'Campanha do banco alimentar contra a fome.', 20, '2026-11-01'),
            ('Ginástica Sénior', inst, 'Saúde e Bem-estar', 'Odivelas', 'Aulas de ginástica adaptada para seniores.', 15, '2026-09-20'),
            ('Pintura de Mural', inst2, 'Cultura', 'Almada', 'Pintura colaborativa de mural comunitário.', 8, '2026-08-30'),
            ('Apoio a Migrantes', inst, 'Ação Social', 'Lisboa', 'Apoio na integração de migrantes e refugiados.', 10, '2026-10-15'),
            ('Caminhada Solidária', inst2, 'Desporto', 'Cascais', 'Caminhada solidária pela saúde mental.', 50, '2026-09-25'),
            ('Dia da Criança', inst, 'Juventude', 'Lisboa', 'Organização do dia da criança no bairro.', 15, '2026-11-15'),
            ('Feira de Artesanato', inst2, 'Cultura', 'Évora', 'Apoio na feira de artesanato local.', 10, '2026-12-01'),
            ('Campanha de Vacinação', inst, 'Saúde e Bem-estar', 'Lisboa', 'Apoio logístico na campanha de vacinação sazonal.', 20, '2026-10-20'),
        ]

        count = 0
        pendente_count = 0
        for titulo, instituicao, cat_nome, local, descricao, vagas, data_str in oportunidades_data:
            estado = 'pendente' if pendente_count < 5 else 'publicada'
            op, created = Oportunidade.objects.get_or_create(
                titulo=titulo, instituicao=instituicao,
                defaults={
                    'categoria': categorias.get(cat_nome),
                    'descricao': descricao,
                    'local': local,
                    'vagas': vagas,
                    'data_inicio': datetime.strptime(data_str, '%Y-%m-%d').replace(tzinfo=tz.utc),
                    'estado': estado,
                }
            )
            if created:
                count += 1
                if estado == 'pendente':
                    pendente_count += 1

        self.stdout.write(self.style.SUCCESS(f'{count} oportunidades criadas ({pendente_count} pendentes de aprovação).'))
        self.stdout.write(self.style.SUCCESS('Seed completo!'))
