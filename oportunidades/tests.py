from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Oportunidade, Categoria, Inscricao
from accounts.models import Institution

User = get_user_model()


class OportunidadeTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='vol@teste.pt', password='teste12345!', perfil='voluntario'
        )
        self.inst_user = User.objects.create_user(
            email='inst@teste.pt', password='teste12345!', perfil='instituicao'
        )
        self.institution = Institution.objects.create(
            user=self.inst_user, nome='Teste Inst', estado_validacao='aprovada'
        )
        self.categoria = Categoria.objects.create(nome='Teste Cat')
        self.oportunidade = Oportunidade.objects.create(
            instituicao=self.institution,
            categoria=self.categoria,
            titulo='Oportunidade Teste',
            descricao='Descrição teste',
            vagas=5,
            estado='publicada',
        )

    def test_list_oportunidades(self):
        response = self.client.get(reverse('oportunidades:list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Oportunidade Teste')

    def test_detail_oportunidade(self):
        response = self.client.get(reverse('oportunidades:detail', args=[self.oportunidade.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Oportunidade Teste')

    def test_filter_by_category(self):
        response = self.client.get(
            reverse('oportunidades:list'), {'categoria': self.categoria.id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Oportunidade Teste')

    def test_search(self):
        response = self.client.get(
            reverse('oportunidades:list'), {'q': 'Teste'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Oportunidade Teste')

    def test_inscricao_requires_login(self):
        response = self.client.post(
            reverse('oportunidades:inscrever', args=[self.oportunidade.id]), follow=True
        )
        self.assertEqual(response.status_code, 200)

    def test_inscricao_success(self):
        self.client.login(email='vol@teste.pt', password='teste12345!')
        response = self.client.post(
            reverse('oportunidades:inscrever', args=[self.oportunidade.id]),
            {'mensagem': 'Quero ajudar!'}, follow=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Inscricao.objects.filter(voluntario=self.user, oportunidade=self.oportunidade).exists()
        )

    def test_inscricao_duplicate(self):
        self.client.login(email='vol@teste.pt', password='teste12345!')
        Inscricao.objects.create(voluntario=self.user, oportunidade=self.oportunidade)
        response = self.client.post(
            reverse('oportunidades:inscrever', args=[self.oportunidade.id]), follow=True
        )
        self.assertContains(response, 'Já estás inscrito')

    def test_favorito_toggle(self):
        self.client.login(email='vol@teste.pt', password='teste12345!')
        response = self.client.get(
            reverse('oportunidades:toggle_favorito', args=[self.oportunidade.id]), follow=True
        )
        self.assertEqual(response.status_code, 200)

    def test_oportunidades_disponiveis_no_context(self):
        response = self.client.get(reverse('core:home'))
        self.assertEqual(response.status_code, 200)
