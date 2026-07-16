from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Volunteer, Institution

User = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.login_url = reverse('accounts:login')
        self.register_vol_url = reverse('accounts:register_volunteer')
        self.register_inst_url = reverse('accounts:register_institution')

    def test_login_page_loads(self):
        response = self.client.get(self.login_url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Entrar')

    def test_register_volunteer_page_loads(self):
        response = self.client.get(self.register_vol_url)
        self.assertEqual(response.status_code, 200)

    def test_register_institution_page_loads(self):
        response = self.client.get(self.register_inst_url)
        self.assertEqual(response.status_code, 200)

    def test_volunteer_registration_success(self):
        data = {
            'email': 'voluntario@teste.pt',
            'first_name': 'João Teste',
            'password1': 'teste12345!',
            'password2': 'teste12345!',
            'consentimento_rgpd': True,
        }
        response = self.client.post(self.register_vol_url, data, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(email='voluntario@teste.pt').exists())
        user = User.objects.get(email='voluntario@teste.pt')
        self.assertEqual(user.perfil, 'voluntario')
        self.assertTrue(Volunteer.objects.filter(user=user).exists())

    def test_institution_registration_success(self):
        data = {
            'email': 'inst@teste.pt',
            'first_name': 'Maria Teste',
            'password1': 'teste12345!',
            'password2': 'teste12345!',
            'nome': 'Associação Teste',
        }
        response = self.client.post(self.register_inst_url, data, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(email='inst@teste.pt').exists())
        user = User.objects.get(email='inst@teste.pt')
        self.assertEqual(user.perfil, 'instituicao')
        self.assertTrue(Institution.objects.filter(user=user).exists())

    def test_login_success(self):
        User.objects.create_user(
            email='teste@teste.pt', password='teste12345!', perfil='voluntario'
        )
        response = self.client.post(self.login_url, {
            'email': 'teste@teste.pt', 'password': 'teste12345!'
        }, follow=True)
        self.assertEqual(response.status_code, 200)

    def test_login_invalid_credentials(self):
        response = self.client.post(self.login_url, {
            'email': 'naoexiste@teste.pt', 'password': 'errada'
        }, follow=True)
        self.assertContains(response, 'Email ou palavra-passe inválidos.')

    def test_logout(self):
        User.objects.create_user(email='teste@teste.pt', password='teste12345!', perfil='voluntario')
        self.client.login(email='teste@teste.pt', password='teste12345!')
        response = self.client.get(reverse('accounts:logout'), follow=True)
        self.assertEqual(response.status_code, 200)


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='teste@teste.pt', password='teste12345!', perfil='voluntario'
        )
        self.reset_url = reverse('accounts:password_reset')

    def test_password_reset_page_loads(self):
        response = self.client.get(self.reset_url)
        self.assertEqual(response.status_code, 200)

    def test_password_reset_email_sent(self):
        response = self.client.post(self.reset_url, {'email': 'teste@teste.pt'}, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'receberá um link de recuperação')

    def test_password_reset_nonexistent_email(self):
        response = self.client.post(self.reset_url, {'email': 'naoexiste@teste.pt'}, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'receberá um link de recuperação')


class AuthorizationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_user(
            email='admin@teste.pt', password='teste12345!', perfil='administrador'
        )
        self.volunteer = User.objects.create_user(
            email='vol@teste.pt', password='teste12345!', perfil='voluntario'
        )
        self.institution = User.objects.create_user(
            email='inst@teste.pt', password='teste12345!', perfil='instituicao'
        )

    def test_volunteer_cannot_access_admin(self):
        self.client.login(email='vol@teste.pt', password='teste12345!')
        response = self.client.get(reverse('accounts:admin_dashboard'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Acesso negado.')

    def test_institution_cannot_access_admin(self):
        self.client.login(email='inst@teste.pt', password='teste12345!')
        response = self.client.get(reverse('accounts:admin_dashboard'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Acesso negado.')

    def test_admin_can_access_admin(self):
        self.client.login(email='admin@teste.pt', password='teste12345!')
        response = self.client.get(reverse('accounts:admin_dashboard'))
        self.assertEqual(response.status_code, 200)

    def test_volunteer_dashboard_requires_volunteer(self):
        self.client.login(email='admin@teste.pt', password='teste12345!')
        response = self.client.get(reverse('accounts:volunteer_dashboard'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Acesso negado.')

    def test_institution_dashboard_requires_institution(self):
        self.client.login(email='vol@teste.pt', password='teste12345!')
        response = self.client.get(reverse('accounts:institution_dashboard'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Acesso negado.')

    def test_unauthenticated_redirect_to_login(self):
        response = self.client.get(reverse('accounts:admin_dashboard'))
        self.assertRedirects(response, f'{reverse("accounts:login")}?next={reverse("accounts:admin_dashboard")}')


class NotificationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='teste@teste.pt', password='teste12345!', perfil='voluntario'
        )

    def test_notification_page_loads(self):
        self.client.login(email='teste@teste.pt', password='teste12345!')
        response = self.client.get(reverse('accounts:notificacoes'))
        self.assertEqual(response.status_code, 200)


class RateLimitTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.login_url = reverse('accounts:login')
        User.objects.create_user(email='teste@teste.pt', password='teste12345!', perfil='voluntario')

    def test_rate_limit_after_5_attempts(self):
        for i in range(5):
            self.client.post(self.login_url, {'email': 'teste@teste.pt', 'password': 'errada'})
        response = self.client.post(self.login_url, {'email': 'teste@teste.pt', 'password': 'errada'})
        self.assertContains(response, 'Demasiadas tentativas')


class PaginationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(email='admin@teste.pt', password='teste12345!')
        self.admin.perfil = 'administrador'
        self.admin.save()
        for i in range(30):
            User.objects.create_user(
                email=f'user{i}@teste.pt', password='teste12345!', perfil='voluntario'
            )

    def test_admin_users_pagination(self):
        self.client.login(email='admin@teste.pt', password='teste12345!')
        response = self.client.get(reverse('accounts:admin_users'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue('page_obj' in response.context or 'users' in response.context)
