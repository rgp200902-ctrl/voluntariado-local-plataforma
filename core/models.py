from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from accounts.models import User

class RegistoAtividade(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')
    acao = models.CharField(max_length=100)
    entidade = models.CharField(max_length=100)
    entidade_id = models.CharField(max_length=100, blank=True, null=True)
    data_hora = models.DateTimeField(auto_now_add=True)
    detalhe = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Registo de Atividade'
        verbose_name_plural = 'Registos de Atividades'
        ordering = ['-data_hora']

    def __str__(self):
        return f'{self.data_hora}: {self.acao} - {self.entidade}'

class Notificacao(models.Model):
    TIPO_CHOICES = [
        ('inscricao_recebida', 'Inscrição Recebida'),
        ('inscricao_aceite', 'Inscrição Aceite'),
        ('inscricao_recusada', 'Inscrição Recusada'),
        ('inscricao_concluida', 'Inscrição Concluída'),
        ('nova_oportunidade', 'Nova Oportunidade'),
        ('oportunidade_atualizada', 'Oportunidade Atualizada'),
        ('instituicao_aprovada', 'Instituição Aprovada'),
        ('instituicao_recusada', 'Instituição Recusada'),
        ('sistema', 'Notificação do Sistema'),
    ]
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificacoes')
    titulo = models.CharField(max_length=200)
    mensagem = models.TextField()
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES, default='sistema')
    lida = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        ordering = ['-data_criacao']

    def __str__(self):
        return f'{self.titulo} -> {self.utilizador.email}'

    def marcar_como_lida(self):
        self.lida = True
        self.save()

class Certificado(models.Model):
    voluntario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificados')
    oportunidade = models.ForeignKey('oportunidades.Oportunidade', on_delete=models.CASCADE, related_name='certificados')
    instituicao_nome = models.CharField(max_length=200)
    data_emissao = models.DateTimeField(auto_now_add=True)
    horas_voluntariado = models.IntegerField(default=0)
    descricao_atividade = models.TextField(blank=True, null=True)
    codigo_verificacao = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = 'Certificado'
        verbose_name_plural = 'Certificados'
        unique_together = ['voluntario', 'oportunidade']

    def __str__(self):
        return f'Certificado: {self.voluntario.get_full_name()} - {self.oportunidade.titulo}'

    def save(self, *args, **kwargs):
        if not self.codigo_verificacao:
            import secrets
            self.codigo_verificacao = secrets.token_urlsafe(10).upper()
        super().save(*args, **kwargs)

class Avaliacao(models.Model):
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='avaliacoes_dadas')
    destinatario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='avaliacoes_recebidas')
    oportunidade = models.ForeignKey('oportunidades.Oportunidade', on_delete=models.CASCADE, related_name='avaliacoes')
    classificacao = models.IntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')])
    comentario = models.TextField(blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Avaliação'
        verbose_name_plural = 'Avaliações'
        unique_together = ['autor', 'oportunidade']

    def __str__(self):
        return f'{self.autor.email} avaliou {self.destinatario.email} ({self.classificacao}/5)'

    @property
    def estrelas(self):
        return range(self.classificacao)

    @property
    def estrelas_vazias(self):
        return range(5 - self.classificacao)

class Reaction(models.Model):
    TIPO_CHOICES = [
        ('coracao', 'Coração'),
        ('aplauso', 'Aplauso'),
        ('fogo', 'Fogo'),
    ]
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reacoes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Reação'
        verbose_name_plural = 'Reações'
        unique_together = ['utilizador', 'tipo', 'content_type', 'object_id']

    def __str__(self):
        return f'{self.utilizador.email} reagiu {self.tipo} em {self.content_type.model} #{self.object_id}'

    @staticmethod
    def get_reactions_for(obj):
        ct = ContentType.objects.get_for_model(obj)
        reactions = Reaction.objects.filter(content_type=ct, object_id=obj.pk).values('tipo').annotate(total=models.Count('id'))
        return {r['tipo']: r['total'] for r in reactions}

    @staticmethod
    def user_reactions_for(user, obj):
        ct = ContentType.objects.get_for_model(obj)
        return set(Reaction.objects.filter(utilizador=user, content_type=ct, object_id=obj.pk).values_list('tipo', flat=True))
