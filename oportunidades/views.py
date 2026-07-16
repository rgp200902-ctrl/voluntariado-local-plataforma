from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q, Avg, Count, Case, When, IntegerField, Prefetch
from .models import Oportunidade, Categoria, Inscricao, Favorito
from accounts.models import VolunteerTag, Tag
from .services import RecomendacaoService

def list_oportunidades(request):
    oportunidades = Oportunidade.objects.filter(
        estado__in=['aberta', 'publicada']
    ).select_related('instituicao', 'categoria').prefetch_related(
        Prefetch('tags', queryset=Tag.objects.only('id', 'nome', 'cor'))
    )
    categorias = Categoria.objects.filter(ativa=True)

    favoritos_ids = []
    match_counts = {}
    is_volunteer = request.user.is_authenticated and request.user.perfil == 'voluntario'

    if is_volunteer:
        favoritos_ids = list(Favorito.objects.filter(
            voluntario=request.user
        ).values_list('oportunidade_id', flat=True))

    recomendadas_filter = request.GET.get('recomendadas')
    if recomendadas_filter and is_volunteer:
        match_counts = RecomendacaoService.get_match_counts(request.user, oportunidades)
        if match_counts:
            oportunidades = oportunidades.filter(id__in=match_counts.keys())

    tag_filter = request.GET.get('tag')
    if tag_filter:
        oportunidades = oportunidades.filter(tags__id=tag_filter)

    cat = request.GET.get('categoria')
    if cat:
        oportunidades = oportunidades.filter(categoria_id=cat)

    q = request.GET.get('q')
    if q:
        oportunidades = oportunidades.filter(
            Q(titulo__icontains=q) | Q(descricao__icontains=q) | Q(local__icontains=q)
        )

    local = request.GET.get('local')
    if local:
        oportunidades = oportunidades.filter(local__icontains=local)

    if match_counts:
        ordering = [
            Case(*[When(id=k, then=v) for k, v in match_counts.items()],
                 output_field=IntegerField(), default=0)
        ]
        oportunidades = oportunidades.annotate(
            match_score=Case(*[When(id=k, then=v) for k, v in match_counts.items()],
                            output_field=IntegerField(), default=0)
        ).order_by('-match_score', '-criada_em')

    all_tags = Tag.objects.annotate(
        op_count=Count('oportunidades')
    ).filter(op_count__gt=0).order_by('nome')

    return render(request, 'oportunidades/list.html', {
        'oportunidades': oportunidades, 'categorias': categorias,
        'favoritos_ids': favoritos_ids, 'match_counts': match_counts,
        'all_tags': all_tags, 'is_recomendadas': bool(recomendadas_filter),
        'selected_tag': tag_filter,
    })

def detail_oportunidade(request, id):
    oportunidade = get_object_or_404(Oportunidade, id=id)
    inscrito = False
    favoritado = False
    from core.models import Reaction
    reaction_counts = Reaction.get_reactions_for(oportunidade)
    user_reactions = Reaction.user_reactions_for(request.user, oportunidade) if request.user.is_authenticated else set()
    if request.user.is_authenticated:
        inscrito = Inscricao.objects.filter(oportunidade=oportunidade, voluntario=request.user).exists()
        if request.user.perfil == 'voluntario':
            favoritado = Favorito.objects.filter(oportunidade=oportunidade, voluntario=request.user).exists()
    return render(request, 'oportunidades/detail.html', {
        'oportunidade': oportunidade, 'inscrito': inscrito, 'favoritado': favoritado,
        'reaction_counts': reaction_counts, 'user_reactions': user_reactions,
    })

@login_required
def toggle_favorito(request, id):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Apenas voluntários podem favoritar.')
        return redirect('oportunidades:detail', id=id)
    oportunidade = get_object_or_404(Oportunidade, id=id)
    from .services import FavoritoService
    action = FavoritoService.toggle(request.user, oportunidade)
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'status': action,
            'count': Favorito.objects.filter(oportunidade=oportunidade).count()
        })
    if action == 'added':
        messages.success(request, 'Adicionado aos favoritos!')
    else:
        messages.success(request, 'Removido dos favoritos.')
    return redirect('oportunidades:detail', id=id)

@login_required
def favoritos(request):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    favoritos = Favorito.objects.filter(voluntario=request.user).select_related(
        'oportunidade', 'oportunidade__instituicao', 'oportunidade__categoria'
    ).order_by('-data_criacao')
    return render(request, 'oportunidades/favoritos.html', {'favoritos': favoritos})

@login_required
def inscrever_oportunidade(request, id):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Apenas voluntários podem inscrever-se.')
        return redirect('core:home')
    oportunidade = get_object_or_404(Oportunidade, id=id, estado__in=['aberta', 'publicada'])
    mensagem = request.POST.get('mensagem', '')
    from .services import InscricaoService
    inscricao, msg = InscricaoService.inscrever(request.user, oportunidade, mensagem)
    if inscricao:
        messages.success(request, msg)
    else:
        messages.warning(request, msg)
    return redirect('oportunidades:detail', id=id)

@login_required
def cancelar_inscricao(request, id):
    inscricao = get_object_or_404(Inscricao, id=id, voluntario=request.user)
    inscricao.estado = 'cancelada'
    inscricao.save()
    messages.success(request, 'Inscrição cancelada.')
    return redirect('accounts:volunteer_registrations')

def ver_avaliacoes(request, id):
    from core.models import Avaliacao
    oportunidade = get_object_or_404(Oportunidade, id=id)
    avaliacoes = Avaliacao.objects.filter(oportunidade=oportunidade).select_related('autor')
    media = avaliacoes.aggregate(media=Avg('classificacao'))['media'] or 0
    return render(request, 'oportunidades/avaliacoes.html', {
        'oportunidade': oportunidade, 'avaliacoes': avaliacoes, 'media': round(media, 1),
    })

def get_recommended_oportunidades(user, limit=6):
    from .services import RecomendacaoService
    return RecomendacaoService.get_recommended(user, limit)
