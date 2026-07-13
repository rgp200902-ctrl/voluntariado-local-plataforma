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
