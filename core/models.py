from django.db import models
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
            self.codigo_verificacao = secrets.token_hex(8).upper()
        super().save(*args, **kwargs)
