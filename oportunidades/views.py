from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q
from .models import Oportunidade, Categoria, Inscricao, Favorito

def list_oportunidades(request):
    oportunidades = Oportunidade.objects.filter(estado__in=['aberta', 'publicada']).select_related('instituicao', 'categoria')
    categorias = Categoria.objects.filter(ativa=True)

    favoritos_ids = []
    if request.user.is_authenticated and request.user.perfil == 'voluntario':
        favoritos_ids = list(Favorito.objects.filter(voluntario=request.user).values_list('oportunidade_id', flat=True))

    cat = request.GET.get('categoria')
    if cat:
        oportunidades = oportunidades.filter(categoria_id=cat)

    q = request.GET.get('q')
    if q:
        oportunidades = opportunidades.filter(Q(titulo__icontains=q) | Q(descricao__icontains=q) | Q(local__icontains=q))

    local = request.GET.get('local')
    if local:
        oportunidades = oportunidades.filter(local__icontains=local)

    return render(request, 'oportunidades/list.html', {
        'oportunidades': oportunidades, 'categorias': categorias, 'favoritos_ids': favoritos_ids,
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
