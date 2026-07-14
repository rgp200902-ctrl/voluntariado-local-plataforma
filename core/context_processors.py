from core.models import Notificacao

def notification_count(request):
    if request.user.is_authenticated:
        return {'notificacoes_nao_lidas': Notificacao.objects.filter(utilizador=request.user, lida=False).count()}
    return {'notificacoes_nao_lidas': 0}
