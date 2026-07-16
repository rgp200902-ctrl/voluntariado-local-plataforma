from django.test import TestCase, Client, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from oportunidades.models import Categoria, Oportunidade
from accounts.models import Institution

User = get_user_model()


class CoreTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_home_page_loads(self):
        response = self.client.get(reverse('core:home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Faz a Diferença')

    def test_sobre_page_loads(self):
        response = self.client.get(reverse('core:sobre'))
        self.assertEqual(response.status_code, 200)

    def test_contacto_page_loads(self):
        response = self.client.get(reverse('core:contacto'))
        self.assertEqual(response.status_code, 200)

    def test_impacto_page_loads(self):
        response = self.client.get(reverse('core:impacto'))
        self.assertEqual(response.status_code, 200)

    def test_404_page(self):
        response = self.client.get('/pagina-que-nao-existe/')
        self.assertEqual(response.status_code, 404)

    @override_settings(DEBUG=False)
    def test_500_page(self):
        from django.urls import path
        client = Client(raise_request_exception=False)
        test_urlpatterns = [path('raise-error/', lambda r: 1 / 0)]
        with self.settings(ROOT_URLCONF=type('TestURLConf', (), {'urlpatterns': test_urlpatterns})()):
            with self.assertLogs('django.request', 'ERROR'):
                response = client.get('/raise-error/')
        self.assertEqual(response.status_code, 500)


class ProfilePublicoTests(TestCase):
    def setUp(self):
        self.client = Client()
        from accounts.models import Volunteer
        self.volunteer = User.objects.create_user(
            email='vol@teste.pt', password='teste12345!', perfil='voluntario',
            first_name='João', last_name='Silva'
        )
        Volunteer.objects.create(user=self.volunteer)
        inst_user = User.objects.create_user(
            email='inst@teste.pt', password='teste12345!', perfil='instituicao'
        )
        self.institution = Institution.objects.create(
            user=inst_user, nome='Inst Teste', estado_validacao='aprovada'
        )

    def test_volunteer_public_profile(self):
        response = self.client.get(reverse('core:perfil_publico', args=[self.volunteer.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'João Silva')

    def test_institution_public_profile(self):
        inst_user = User.objects.get(email='inst@teste.pt')
        response = self.client.get(reverse('core:perfil_publico', args=[inst_user.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Inst Teste')

    def test_nonexistent_profile_returns_404(self):
        response = self.client.get(reverse('core:perfil_publico', args=[99999]))
        self.assertEqual(response.status_code, 404)
