from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

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

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

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
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
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

class Tag(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    cor = models.CharField(max_length=7, default='#0d6efd')
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        ordering = ['nome']

    def __str__(self):
        return self.nome

class VolunteerTag(models.Model):
    voluntario = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='voluntarios')
    nivel = models.IntegerField(default=1, choices=[(1, 'Básico'), (2, 'Intermédio'), (3, 'Avançado')])

    class Meta:
        verbose_name = 'Tag de Voluntário'
        verbose_name_plural = 'Tags de Voluntários'
        unique_together = ['voluntario', 'tag']

    def __str__(self):
        return f'{self.voluntario} - {self.tag} ({self.get_nivel_display()})'
