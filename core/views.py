from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Sum, Avg, Q
from oportunidades.models import Oportunidade, Categoria, Inscricao
from accounts.models import User, Institution, Tag, Volunteer, VolunteerTag
from core.models import Certificado, Avaliacao

def home(request):
    from oportunidades.models import Oportunidade
    stats = {
        'oportunidades_ativas': Oportunidade.objects.filter(estado__in=['aberta', 'publicada']).count(),
        'instituicoes': Institution.objects.filter(estado_validacao='aprovada').count(),
        'voluntarios': User.objects.filter(perfil='voluntario', is_active=True).count(),
        'inscricoes_total': Inscricao.objects.count(),
    }
    destaques = Oportunidade.objects.filter(estado__in=['aberta', 'publicada']).order_by('-criada_em')[:3]
    return render(request, 'index.html', {'stats': stats, 'destaques': destaques})

def sobre(request):
    return render(request, 'sobre.html')

def contacto(request):
    return render(request, 'contacto.html')

def impacto(request):
    total_certificados = Certificado.objects.count()
    total_horas = Certificado.objects.aggregate(total=Sum('horas_voluntariado'))['total'] or 0
    total_inscricoes = Inscricao.objects.count()
    inscricoes_concluidas = Inscricao.objects.filter(estado='concluida').count()
    total_avaliacoes = Avaliacao.objects.count()
    media_avaliacao = Avaliacao.objects.aggregate(media=Avg('classificacao'))['media'] or 0
    total_voluntarios = User.objects.filter(perfil='voluntario').count()
    total_instituicoes = Institution.objects.filter(estado_validacao='aprovada').count()
    total_oportunidades = Oportunidade.objects.count()
    oportunidades_concluidas = Oportunidade.objects.filter(estado='concluida').count()
    localidades = Inscricao.objects.exclude(oportunidade__local__isnull=True).values('oportunidade__local').annotate(total=Count('id')).order_by('-total')[:10]
    categorias_top = Categoria.objects.annotate(total=Count('opportunities')).order_by('-total')[:5]
    voluntarios_ativos = User.objects.filter(perfil='voluntario').annotate(
        total_inscricoes=Count('registrations'),
        total_concluidas=Count('registrations', filter=Q(registrations__estado='concluida'))
    ).order_by('-total_inscricoes')[:5]
    stats_mensais = Inscricao.objects.extra(
        select={'mes': "strftime('%%Y-%%m', data_inscricao)"}
    ).values('mes').annotate(total=Count('id')).order_by('-mes')[:6]
    return render(request, 'impacto.html', {
        'total_certificados': total_certificados,
        'total_horas': total_horas,
        'total_inscricoes': total_inscricoes,
        'inscricoes_concluidas': inscricoes_concluidas,
        'total_avaliacoes': total_avaliacoes,
        'media_avaliacao': round(media_avaliacao, 1),
        'total_voluntarios': total_voluntarios,
        'total_instituicoes': total_instituicoes,
        'total_oportunidades': total_oportunidades,
        'oportunidades_concluidas': oportunidades_concluidas,
        'localidades': localidades,
        'categorias_top': categorias_top,
        'voluntarios_ativos': voluntarios_ativos,
        'stats_mensais': stats_mensais,
    })

@login_required
def gerir_tags(request):
    if request.user.perfil != 'administrador':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    tags = Tag.objects.annotate(total_voluntarios=Count('voluntarios'), total_oportunidades=Count('oportunidades')).order_by('nome')
    if request.method == 'POST':
        nome = request.POST.get('nome', '').strip()
        cor = request.POST.get('cor', '#0d6efd')
        if nome:
            tag, created = Tag.objects.get_or_create(nome=nome, defaults={'cor': cor})
            if created:
                messages.success(request, f'Tag "{nome}" criada.')
            else:
                messages.warning(request, f'Tag "{nome}" já existe.')
        return redirect('accounts:gerir_tags')
    return render(request, 'dashboard/admin/tags.html', {'tags': tags})

@login_required
def perfil_publico(request, user_id):
    user_profile = get_object_or_404(User, id=user_id)
    if user_profile.perfil == 'voluntario':
        volunteer = get_object_or_404(Volunteer, user=user_profile)
        tags = VolunteerTag.objects.filter(voluntario=volunteer).select_related('tag')
        certificados = Certificado.objects.filter(voluntario=user_profile).select_related('oportunidade')
        inscricoes_concluidas = Inscricao.objects.filter(voluntario=user_profile, estado='concluida').count()
        avaliacoes = Avaliacao.objects.filter(destinatario=user_profile).select_related('autor', 'oportunidade')
        media = avaliacoes.aggregate(media=Avg('classificacao'))['media'] or 0
        return render(request, 'perfil_publico.html', {
            'profile_user': user_profile, 'volunteer': volunteer, 'tags': tags,
            'certificados': certificados, 'inscricoes_concluidas': inscricoes_concluidas,
            'avaliacoes': avaliacoes, 'media': round(media, 1),
        })
    elif user_profile.perfil == 'instituicao':
        institution = get_object_or_404(Institution, user=user_profile)
        oportunidades = Oportunidade.objects.filter(instituicao=institution, estado__in=['publicada', 'aberta', 'concluida'])
        total_voluntarios = Inscricao.objects.filter(oportunidade__instituicao=institution).values('voluntario').distinct().count()
        avaliacoes = Avaliacao.objects.filter(destinatario=user_profile).select_related('autor', 'oportunidade')
        media = avaliacoes.aggregate(media=Avg('classificacao'))['media'] or 0
        return render(request, 'perfil_publico.html', {
            'profile_user': user_profile, 'institution': institution,
            'oportunidades': oportunidades, 'total_voluntarios': total_voluntarios,
            'avaliacoes': avaliacoes, 'media': round(media, 1),
        })
    messages.error(request, 'Perfil não encontrado.')
    return redirect('core:home')
