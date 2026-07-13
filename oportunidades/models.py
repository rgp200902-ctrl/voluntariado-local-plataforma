from django.db import models
from accounts.models import Institution, User

class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)
    ativa = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'

    def __str__(self):
        return self.nome

class Oportunidade(models.Model):
    ESTADO_CHOICES = [
        ('rascunho', 'Rascunho'),
        ('aberta', 'Aberta'),
        ('publicada', 'Publicada'),
        ('inscricoes_encerradas', 'Inscrições Encerradas'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    ]
    instituicao = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='opportunities')
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='opportunities')
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    local = models.CharField(max_length=200, blank=True, null=True)
    freguesia = models.CharField(max_length=100, blank=True, null=True)
    data_inicio = models.DateTimeField(null=True, blank=True)
    data_fim = models.DateTimeField(null=True, blank=True)
    horario = models.CharField(max_length=200, blank=True, null=True)
    vagas = models.IntegerField(default=1)
    requisitos = models.TextField(blank=True, null=True)
    idade_minima = models.IntegerField(null=True, blank=True)
    estado = models.CharField(max_length=25, choices=ESTADO_CHOICES, default='rascunho')
    criada_em = models.DateTimeField(auto_now_add=True)
    publicada_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Oportunidade'
        verbose_name_plural = 'Oportunidades'
        ordering = ['-criada_em']

    def __str__(self):
        return self.titulo

class Inscricao(models.Model):
    ESTADO_CHOICES = [
        ('submetida', 'Submetida'),
        ('aceite', 'Aceite'),
        ('recusada', 'Recusada'),
        ('cancelada', 'Cancelada'),
        ('concluida', 'Concluída'),
    ]
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.CASCADE, related_name='registrations')
    voluntario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    mensagem = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='submetida')
    data_inscricao = models.DateTimeField(auto_now_add=True)
    data_decisao = models.DateTimeField(null=True, blank=True)
    observacoes_instituicao = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Inscrição'
        verbose_name_plural = 'Inscrições'
        unique_together = ['oportunidade', 'voluntario']

    def __str__(self):
        return f'{self.voluntario.get_full_name() or self.voluntario.email} -> {self.oportunidade.titulo}'
