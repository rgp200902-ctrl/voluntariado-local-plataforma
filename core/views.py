from django.shortcuts import render
from django.db.models import Count, Sum
from oportunidades.models import Oportunidade, Categoria
from accounts.models import User, Institution

def home(request):
    stats = {
        'oportunidades_ativas': Oportunidade.objects.filter(estado__in=['aberta', 'publicada']).count(),
        'instituicoes': Institution.objects.filter(estado_validacao='aprovada').count(),
        'voluntarios': User.objects.filter(perfil='voluntario', is_active=True).count(),
        'inscricoes_total': 0,  # simplified for now
    }
    destaques = Oportunidade.objects.filter(estado__in=['aberta', 'publicada']).order_by('-criada_em')[:3]
    return render(request, 'index.html', {'stats': stats, 'destaques': destaques})

def sobre(request):
    return render(request, 'sobre.html')

def contacto(request):
    return render(request, 'contacto.html')
