from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    PERFIL_CHOICES = [
        ('administrador', 'Administrador'),
        ('instituicao', 'Instituição'),
        ('voluntario', 'Voluntário'),
    ]
    username = None
    email = models.EmailField(unique=True)
    perfil = models.CharField(max_length=20, choices=PERFIL_CHOICES, default='voluntario')
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    ultimo_acesso = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['perfil']

    class Meta:
        verbose_name = 'Utilizador'
        verbose_name_plural = 'Utilizadores'

    def __str__(self):
        return f'{self.get_full_name() or self.email} ({self.get_perfil_display()})'

class Volunteer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer')
    telefone = models.CharField(max_length=20, blank=True, null=True)
    localidade = models.CharField(max_length=100, blank=True, null=True)
    data_nascimento = models.DateField(null=True, blank=True)
    faixa_etaria = models.CharField(max_length=50, blank=True, null=True)
    disponibilidade = models.TextField(blank=True, null=True)
    interesses = models.TextField(blank=True, null=True)
    competencias = models.TextField(blank=True, null=True)
    consentimento_rgpd = models.BooleanField(default=False)
    data_consentimento = models.DateTimeField(null=True, blank=True)
    avatar = models.TextField(blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Voluntário'
        verbose_name_plural = 'Voluntários'

    def __str__(self):
        return f'Voluntário: {self.user.get_full_name() or self.user.email}'

class Institution(models.Model):
    VALIDACAO_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovada', 'Aprovada'),
        ('recusada', 'Recusada'),
        ('suspensa', 'Suspensa'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='institution')
    nome = models.CharField(max_length=200)
    nif = models.CharField(max_length=20, blank=True, null=True)
    tipo = models.CharField(max_length=100, blank=True, null=True)
    morada = models.TextField(blank=True, null=True)
    email_contacto = models.EmailField(blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    pessoa_contacto = models.CharField(max_length=200, blank=True, null=True)
    descricao = models.TextField(blank=True, null=True)
    estado_validacao = models.CharField(max_length=20, choices=VALIDACAO_CHOICES, default='pendente')
    logotipo = models.ImageField(upload_to='logos/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Instituição'
        verbose_name_plural = 'Instituições'

    def __str__(self):
        return self.nome
