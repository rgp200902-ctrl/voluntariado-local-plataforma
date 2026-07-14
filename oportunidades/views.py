from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q, Avg, Count
from .models import Oportunidade, Categoria, Inscricao, Favorito
from accounts.models import VolunteerTag, Tag

def list_oportunidades(request):
    oportunidades = Oportunidade.objects.filter(estado__in=['aberta', 'publicada']).select_related('instituicao', 'categoria')
    categorias = Categoria.objects.filter(ativa=True)

    favoritos_ids = []
    match_counts = {}
    if request.user.is_authenticated and request.user.perfil == 'voluntario':
        favoritos_ids = list(Favorito.objects.filter(voluntario=request.user).values_list('oportunidade_id', flat=True))
        volunteer_tags = VolunteerTag.objects.filter(voluntario__user=request.user).values_list('tag_id', flat=True)
        if volunteer_tags:
            inscritas_ids = Inscricao.objects.filter(voluntario=request.user).values_list('oportunidade_id', flat=True)
            for op in oportunidades.exclude(id__in=inscritas_ids):
                op_tags = set(op.tags.values_list('id', flat=True))
                matches = len(op_tags & set(volunteer_tags))
                if matches > 0:
                    match_counts[op.id] = matches

    recomendadas_filter = request.GET.get('recomendadas')
    tag_filter = request.GET.get('tag')
    if recomendadas_filter and match_counts:
        oportunidades = oportunidades.filter(id__in=match_counts.keys())

    if tag_filter:
        oportunidades = oportunidades.filter(tags__id=tag_filter)

    cat = request.GET.get('categoria')
    if cat:
        oportunidades = oportunidades.filter(categoria_id=cat)

    q = request.GET.get('q')
    if q:
        oportunidades = oportunidades.filter(Q(titulo__icontains=q) | Q(descricao__icontains=q) | Q(local__icontains=q))

    local = request.GET.get('local')
    if local:
        oportunidades = oportunidades.filter(local__icontains=local)

    if match_counts:
        from django.db.models import Case, When, IntegerField
        ordering = [Case(*[When(id=k, then=v) for k, v in match_counts.items()], output_field=IntegerField(), default=0)]
        oportunidades = oportunidades.annotate(match_score=Case(*[When(id=k, then=v) for k, v in match_counts.items()], output_field=IntegerField(), default=0)).order_by('-match_score', '-criada_em')

    all_tags = Tag.objects.annotate(op_count=Count('oportunidades')).filter(op_count__gt=0).order_by('nome')

    return render(request, 'oportunidades/list.html', {
        'oportunidades': oportunidades, 'categorias': categorias, 'favoritos_ids': favoritos_ids,
        'match_counts': match_counts, 'all_tags': all_tags,
        'is_recomendadas': bool(recomendadas_filter),
        'selected_tag': tag_filter,
    })

def detail_oportunidade(request, id):
    oportunidade = get_object_or_404(Oportunidade, id=id)
    inscrito = False
    favoritado = False
    if request.user.is_authenticated:
        inscrito = Inscricao.objects.filter(oportunidade=oportunidade, voluntario=request.user).exists()
        if request.user.perfil == 'voluntario':
            favoritado = Favorito.objects.filter(oportunidade=oportunidade, voluntario=request.user).exists()
    return render(request, 'oportunidades/detail.html', {
        'oportunidade': oportunidade, 'inscrito': inscrito, 'favoritado': favoritado,
    })

@login_required
def toggle_favorito(request, id):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Apenas voluntários podem favoritar.')
        return redirect('oportunidades:detail', id=id)
    oportunidade = get_object_or_404(Oportunidade, id=id)
    favorito, created = Favorito.objects.get_or_create(
        voluntario=request.user, oportunidade=oportunidade
    )
    if not created:
        favorito.delete()
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'removed', 'count': Favorito.objects.filter(oportunidade=oportunidade).count()})
        messages.success(request, 'Removido dos favoritos.')
    else:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'added', 'count': Favorito.objects.filter(oportunidade=oportunidade).count()})
        messages.success(request, 'Adicionado aos favoritos!')
    return redirect('oportunidades:detail', id=id)

@login_required
def favoritos(request):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    favoritos = Favorito.objects.filter(voluntario=request.user).select_related('oportunidade', 'oportunidade__instituicao', 'oportunidade__categoria').order_by('-data_criacao')
    return render(request, 'oportunidades/favoritos.html', {'favoritos': favoritos})

@login_required
def inscrever_oportunidade(request, id):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Apenas voluntários podem inscrever-se.')
        return redirect('core:home')
    oportunidade = get_object_or_404(Oportunidade, id=id, estado__in=['aberta', 'publicada'])
    if Inscricao.objects.filter(oportunidade=oportunidade, voluntario=request.user).exists():
        messages.warning(request, 'Já estás inscrito.')
    else:
        mensagem = request.POST.get('mensagem', '')
        Inscricao.objects.create(oportunidade=oportunidade, voluntario=request.user, mensagem=mensagem)
        messages.success(request, 'Inscrição realizada com sucesso!')
    return redirect('oportunidades:detail', id=id)

@login_required
def cancelar_inscricao(request, id):
    inscricao = get_object_or_404(Inscricao, id=id, voluntario=request.user)
    inscricao.estado = 'cancelada'
    inscricao.save()
    messages.success(request, 'Inscrição cancelada.')
    return redirect('accounts:volunteer_registrations')

def ver_avaliacoes(request, id):
    oportunidade = get_object_or_404(Oportunidade, id=id)
    from core.models import Avaliacao
    avaliacoes = Avaliacao.objects.filter(oportunidade=oportunidade).select_related('autor')
    media = avaliacoes.aggregate(media=Avg('classificacao'))['media'] or 0
    return render(request, 'oportunidades/avaliacoes.html', {
        'oportunidade': oportunidade, 'avaliacoes': avaliacoes, 'media': round(media, 1),
    })

def get_recommended_oportunidades(user, limit=6):
    if not user.is_authenticated or user.perfil != 'voluntario':
        return Oportunidade.objects.none()
    volunteer_tags = VolunteerTag.objects.filter(voluntario__user=user).values_list('tag_id', flat=True)
    if not volunteer_tags:
        return Oportunidade.objects.none()
    inscritas_ids = Inscricao.objects.filter(voluntario=user).values_list('oportunidade_id', flat=True)
    recomendadas = Oportunidade.objects.filter(
        estado__in=['aberta', 'publicada'],
        tags__in=volunteer_tags
    ).exclude(
        id__in=inscritas_ids
    ).annotate(
        match_count=Count('tags', filter=Q(tags__in=volunteer_tags))
    ).order_by('-match_count', '-criada_em').distinct()[:limit]
    return recomendadas
