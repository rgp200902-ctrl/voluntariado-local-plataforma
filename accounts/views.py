from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count
from django.core.paginator import Paginator
from django.utils import timezone
from django.core.cache import cache
from .decorators import perfil_requerido
from .services import NotificacaoService, PasswordResetService, RegistoAtividadeService
from .forms import LoginForm, VolunteerRegisterForm, InstitutionRegisterForm
from .models import User, Volunteer, Institution, Tag, VolunteerTag
from oportunidades.models import Inscricao, Oportunidade, Categoria
from core.models import RegistoAtividade, Notificacao, Certificado, Avaliacao

# --- Auth ---

def login_view(request):
    if request.user.is_authenticated:
        return redirect_to_dashboard(request.user)
    if request.method == 'POST':
        ip = request.META.get('REMOTE_ADDR', '')
        cache_key = f'login_attempts_{ip}'
        attempts = cache.get(cache_key, 0)
        if attempts >= 5:
            messages.error(request, 'Demasiadas tentativas. Tenta novamente dentro de 5 minutos.')
            return render(request, 'accounts/login.html', {'form': LoginForm()})
        form = LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(email=form.cleaned_data['email'], password=form.cleaned_data['password'])
            if user and user.is_active:
                cache.delete(cache_key)
                login(request, user)
                RegistoAtividadeService.registar(user, 'login', 'User', user.id)
                return redirect_to_dashboard(user)
            messages.error(request, 'Email ou palavra-passe inválidos.')
        cache.set(cache_key, attempts + 1, 300)
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form})

def redirect_to_dashboard(user):
    if user.perfil == 'administrador':
        return redirect('accounts:admin_dashboard')
    elif user.perfil == 'instituicao':
        return redirect('accounts:institution_dashboard')
    return redirect('accounts:volunteer_dashboard')

def logout_view(request):
    logout(request)
    messages.success(request, 'Sessão terminada com sucesso.')
    return redirect('core:home')

def register_volunteer(request):
    if request.method == 'POST':
        form = VolunteerRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Conta criada com sucesso!')
            return redirect('accounts:volunteer_dashboard')
    else:
        form = VolunteerRegisterForm()
    return render(request, 'accounts/register_volunteer.html', {'form': form})

def register_institution(request):
    if request.method == 'POST':
        form = InstitutionRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Conta criada com sucesso! A sua instituição será revista por um administrador.')
            return redirect('accounts:institution_dashboard')
    else:
        form = InstitutionRegisterForm()
    return render(request, 'accounts/register_institution.html', {'form': form})

def register(request):
    return render(request, 'accounts/register.html')

# --- Password Reset ---

def password_reset(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        user = User.objects.filter(email=email).first()
        if user:
            PasswordResetService.enviar_email_reset(request, user)
        messages.success(request, 'Se o email existir na plataforma, receberá um link de recuperação.')
        return redirect('accounts:login')
    return render(request, 'accounts/password_reset.html')

def password_reset_confirm(request, uidb64, token):
    if request.method == 'POST':
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')
        if not password or password != password_confirm:
            messages.error(request, 'As palavras-passe não coincidem.')
            return render(request, 'accounts/password_reset_confirm.html', {'validlink': True, 'uidb64': uidb64, 'token': token})
        if len(password) < 8:
            messages.error(request, 'A palavra-passe deve ter pelo menos 8 caracteres.')
            return render(request, 'accounts/password_reset_confirm.html', {'validlink': True, 'uidb64': uidb64, 'token': token})
        user = PasswordResetService.confirmar_reset(uidb64, token, password)
        if user is None:
            messages.error(request, 'O link de recuperação é inválido ou expirou.')
            return redirect('accounts:password_reset')
        messages.success(request, 'Palavra-passe redefinida com sucesso! Já podes entrar.')
        return redirect('accounts:login')
    user = PasswordResetService.confirmar_reset(uidb64, token, None)
    validlink = user is not None
    return render(request, 'accounts/password_reset_confirm.html', {
        'validlink': validlink, 'uidb64': uidb64, 'token': token,
    })

# --- Volunteer Dashboard ---

@perfil_requerido('voluntario')
def volunteer_dashboard(request):
    volunteer, _ = Volunteer.objects.get_or_create(user=request.user)
    inscricoes = Inscricao.objects.filter(voluntario=request.user).select_related('oportunidade')
    certificados = Certificado.objects.filter(voluntario=request.user).select_related('oportunidade', 'oportunidade__instituicao')
    stats = {
        'total': inscricoes.count(),
        'ativas': inscricoes.filter(estado__in=['submetida', 'aceite']).count(),
        'concluidas': inscricoes.filter(estado='concluida').count(),
        'certificados': certificados.count(),
    }
    atividades_recentes = RegistoAtividade.objects.filter(utilizador=request.user).order_by('-data_hora')[:5]
    from oportunidades.services import RecomendacaoService
    recomendadas = RecomendacaoService.get_recommended(request.user, limit=6)
    return render(request, 'dashboard/volunteer/dashboard.html', {
        'volunteer': volunteer, 'inscricoes': inscricoes, 'stats': stats,
        'atividades': atividades_recentes, 'certificados': certificados,
        'recomendadas': recomendadas,
    })

@perfil_requerido('voluntario')
def volunteer_profile(request):
    volunteer, _ = Volunteer.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        volunteer.telefone = request.POST.get('telefone', '')
        volunteer.localidade = request.POST.get('localidade', '')
        volunteer.faixa_etaria = request.POST.get('faixa_etaria', '')
        volunteer.disponibilidade = request.POST.get('disponibilidade', '')
        volunteer.interesses = request.POST.get('interesses', '')
        volunteer.competencias = request.POST.get('competencias', '')
        if request.POST.get('data_nascimento'):
            volunteer.data_nascimento = request.POST.get('data_nascimento')
        if request.FILES.get('avatar'):
            volunteer.avatar = request.FILES['avatar']
        volunteer.save()
        if request.POST.get('first_name'):
            request.user.first_name = request.POST.get('first_name')
            request.user.save()
        messages.success(request, 'Perfil atualizado com sucesso!')
        return redirect('accounts:volunteer_profile')
    return render(request, 'dashboard/volunteer/profile.html', {'volunteer': volunteer})

@perfil_requerido('voluntario')
def volunteer_registrations(request):
    inscricoes = Inscricao.objects.filter(voluntario=request.user).select_related(
        'oportunidade', 'oportunidade__instituicao'
    ).order_by('-data_inscricao')
    return render(request, 'dashboard/volunteer/registrations.html', {'inscricoes': inscricoes})

@perfil_requerido('voluntario')
def volunteer_history(request):
    atividades = RegistoAtividade.objects.filter(utilizador=request.user).order_by('-data_hora')
    return render(request, 'dashboard/volunteer/history.html', {'atividades': atividades})

# --- Institution Dashboard ---

@perfil_requerido('instituicao')
def institution_dashboard(request):
    institution = get_object_or_404(Institution, user=request.user)
    oportunidades = Oportunidade.objects.filter(instituicao=institution).annotate(num_inscricoes=Count('registrations'))
    stats = {
        'total': oportunidades.count(),
        'ativas': oportunidades.filter(estado__in=['aberta', 'publicada']).count(),
        'pendentes': oportunidades.filter(estado='pendente').count(),
        'inscricoes': Inscricao.objects.filter(oportunidade__instituicao=institution).count(),
    }
    return render(request, 'dashboard/institution/dashboard.html', {
        'institution': institution, 'oportunidades': oportunidades, 'stats': stats,
    })

@perfil_requerido('instituicao')
def institution_profile(request):
    institution = get_object_or_404(Institution, user=request.user)
    if request.method == 'POST':
        institution.nome = request.POST.get('nome', institution.nome)
        institution.nif = request.POST.get('nif', '')
        institution.tipo = request.POST.get('tipo', '')
        institution.morada = request.POST.get('morada', '')
        institution.telefone = request.POST.get('telefone', '')
        institution.pessoa_contacto = request.POST.get('pessoa_contacto', '')
        institution.descricao = request.POST.get('descricao', '')
        institution.website = request.POST.get('website', '')
        if request.FILES.get('logotipo'):
            institution.logotipo = request.FILES['logotipo']
        institution.save()
        messages.success(request, 'Perfil atualizado com sucesso!')
        return redirect('accounts:institution_profile')
    return render(request, 'dashboard/institution/profile.html', {'institution': institution})

# --- Admin Dashboard ---

@perfil_requerido('administrador')
def admin_dashboard(request):
    stats = {
        'utilizadores': User.objects.count(),
        'voluntarios': User.objects.filter(perfil='voluntario').count(),
        'instituicoes': User.objects.filter(perfil='instituicao').count(),
        'oportunidades': Oportunidade.objects.count(),
        'inscricoes': Inscricao.objects.count(),
        'instituicoes_pendentes': Institution.objects.filter(estado_validacao='pendente').count(),
        'oportunidades_pendentes': Oportunidade.objects.filter(estado='pendente').count(),
    }
    return render(request, 'dashboard/admin/dashboard.html', {'stats': stats})

@perfil_requerido('administrador')
def admin_users(request):
    users_list = User.objects.all().order_by('-data_criacao')
    paginator = Paginator(users_list, 25)
    page = request.GET.get('page')
    users = paginator.get_page(page)
    return render(request, 'dashboard/admin/users.html', {'users': users})

@perfil_requerido('administrador')
def admin_institutions(request):
    institutions_list = Institution.objects.all().order_by('-data_criacao')
    paginator = Paginator(institutions_list, 25)
    page = request.GET.get('page')
    institutions = paginator.get_page(page)
    if request.method == 'POST':
        inst_id = request.POST.get('institution_id')
        new_status = request.POST.get('status')
        inst = get_object_or_404(Institution, id=inst_id)
        inst.estado_validacao = new_status
        inst.save()
        if new_status == 'aprovada':
            inst.user.is_active = True
            inst.user.save()
            NotificacaoService.instituicao_aprovada(inst)
        elif new_status == 'recusada':
            NotificacaoService.instituicao_recusada(inst)
        messages.success(request, f'Instituição {inst.nome} atualizada para {inst.get_estado_validacao_display()}.')
        return redirect('accounts:admin_institutions')
    return render(request, 'dashboard/admin/institutions.html', {'institutions': institutions})

@perfil_requerido('administrador')
def admin_categories(request):
    categorias = Categoria.objects.all().order_by('nome')
    if request.method == 'POST':
        nome = request.POST.get('nome')
        descricao = request.POST.get('descricao', '')
        if nome:
            Categoria.objects.create(nome=nome, descricao=descricao)
            messages.success(request, f'Categoria "{nome}" criada.')
        return redirect('accounts:admin_categories')
    return render(request, 'dashboard/admin/categories.html', {'categorias': categorias})

@perfil_requerido('administrador')
def admin_reports(request):
    stats = {
        'total_utilizadores': User.objects.count(),
        'total_voluntarios': User.objects.filter(perfil='voluntario').count(),
        'total_instituicoes': Institution.objects.count(),
        'total_oportunidades': Oportunidade.objects.count(),
        'total_inscricoes': Inscricao.objects.count(),
        'inscricoes_por_estado': list(Inscricao.objects.values('estado').annotate(total=Count('id'))),
        'oportunidades_por_categoria': list(Oportunidade.objects.values('categoria__nome').annotate(total=Count('id'))),
    }
    return render(request, 'dashboard/admin/reports.html', {'stats': stats})

@perfil_requerido('administrador')
def admin_oportunidades(request):
    filtro = request.GET.get('filtro', 'pendentes')
    base_qs = Oportunidade.objects.select_related('instituicao', 'categoria')
    if filtro == 'pendentes':
        oportunidades_list = base_qs.filter(estado='pendente').order_by('-criada_em')
    elif filtro == 'aprovadas':
        oportunidades_list = base_qs.filter(estado__in=['publicada', 'aberta']).order_by('-criada_em')
    elif filtro == 'recusadas':
        oportunidades_list = base_qs.filter(estado='cancelada').order_by('-criada_em')
    else:
        oportunidades_list = base_qs.all().order_by('-criada_em')
    paginator = Paginator(oportunidades_list, 25)
    page = request.GET.get('page')
    oportunidades = paginator.get_page(page)
    pendentes_count = Oportunidade.objects.filter(estado='pendente').count()
    return render(request, 'dashboard/admin/oportunidades.html', {
        'oportunidades': oportunidades, 'filtro': filtro, 'pendentes_count': pendentes_count,
    })

@perfil_requerido('administrador')
def admin_aprovar_oportunidade(request, id):
    oportunidade = get_object_or_404(Oportunidade, id=id)
    if request.method == 'POST':
        acao = request.POST.get('acao')
        if acao == 'aprovar':
            oportunidade.estado = 'publicada'
            oportunidade.save()
            NotificacaoService.oportunidade_aprovada(oportunidade)
            messages.success(request, f'Oportunidade "{oportunidade.titulo}" aprovada com sucesso.')
        elif acao == 'recusar':
            oportunidade.estado = 'cancelada'
            oportunidade.save()
            motivo = request.POST.get("motivo", "Não especificado.")
            NotificacaoService.oportunidade_recusada(oportunidade, motivo)
            messages.warning(request, f'Oportunidade "{oportunidade.titulo}" recusada.')
        return redirect('accounts:admin_oportunidades')
    return render(request, 'dashboard/admin/detalhe_oportunidade.html', {'oportunidade': oportunidade})

# --- Institution Opportunity Management ---

@perfil_requerido('instituicao')
def criar_oportunidade(request):
    institution = get_object_or_404(Institution, user=request.user)
    categorias = Categoria.objects.filter(ativa=True)
    all_tags = Tag.objects.all()

    if request.method == 'POST':
        from oportunidades.services import OportunidadeService
        oportunidade = OportunidadeService.criar(institution, request.POST)
        tag_ids = request.POST.getlist('tags')
        if tag_ids:
            oportunidade.tags.set(Tag.objects.filter(id__in=tag_ids))
        NotificacaoService.oportunidade_submetida(oportunidade)
        messages.success(request, 'Oportunidade criada e enviada para aprovação!')
        return redirect('accounts:institution_dashboard')

    return render(request, 'dashboard/institution/create_opportunity.html', {'categorias': categorias, 'all_tags': all_tags})

@perfil_requerido('instituicao')
def editar_oportunidade(request, id):
    institution = get_object_or_404(Institution, user=request.user)
    oportunidade = get_object_or_404(Oportunidade, id=id, instituicao=institution)
    categorias = Categoria.objects.filter(ativa=True)
    all_tags = Tag.objects.all()
    tags_atuais = set(oportunidade.tags.values_list('id', flat=True))

    if request.method == 'POST':
        from oportunidades.services import OportunidadeService
        OportunidadeService.atualizar(oportunidade, request.POST)
        tag_ids = request.POST.getlist('tags')
        if tag_ids:
            oportunidade.tags.set(Tag.objects.filter(id__in=tag_ids))
        else:
            oportunidade.tags.clear()
        messages.success(request, 'Oportunidade atualizada com sucesso!')
        return redirect('accounts:institution_dashboard')

    return render(request, 'dashboard/institution/edit_opportunity.html', {
        'oportunidade': oportunidade, 'categorias': categorias, 'all_tags': all_tags,
        'tags_atuais': tags_atuais,
        'estado_choices': Oportunidade.ESTADO_CHOICES,
    })

@perfil_requerido('instituicao')
def apagar_oportunidade(request, id):
    institution = get_object_or_404(Institution, user=request.user)
    oportunidade = get_object_or_404(Oportunidade, id=id, instituicao=institution)
    if request.method == 'POST':
        titulo = oportunidade.titulo
        oportunidade.delete()
        messages.success(request, f'Oportunidade "{titulo}" apagada com sucesso.')
        return redirect('accounts:institution_dashboard')
    return render(request, 'dashboard/institution/confirm_delete.html', {'oportunidade': oportunidade})

@perfil_requerido('instituicao')
def gerir_inscricoes(request, id):
    institution = get_object_or_404(Institution, user=request.user)
    oportunidade = get_object_or_404(Oportunidade, id=id, instituicao=institution)
    inscricoes = Inscricao.objects.filter(oportunidade=oportunidade).select_related('voluntario').order_by('-data_inscricao')

    if request.method == 'POST':
        inscricao_id = request.POST.get('inscricao_id')
        novo_estado = request.POST.get('estado')
        inscricao = get_object_or_404(Inscricao, id=inscricao_id, oportunidade=oportunidade)
        inscricao.estado = novo_estado
        inscricao.data_decisao = timezone.now()
        inscricao.save()
        if novo_estado == 'aceite':
            NotificacaoService.inscricao_aceite(inscricao)
        elif novo_estado == 'recusada':
            NotificacaoService.inscricao_recusada(inscricao)
        elif novo_estado == 'concluida':
            NotificacaoService.inscricao_concluida(inscricao)
        messages.success(request, f'Inscrição atualizada para "{inscricao.get_estado_display()}".')
        return redirect('accounts:gerir_inscricoes', id=id)

    return render(request, 'dashboard/institution/manage_registrations.html', {
        'oportunidade': oportunidade, 'inscricoes': inscricoes,
    })

@perfil_requerido('instituicao')
def exportar_inscricoes(request, id):
    institution = get_object_or_404(Institution, user=request.user)
    oportunidade = get_object_or_404(Oportunidade, id=id, instituicao=institution)
    inscricoes = Inscricao.objects.filter(oportunidade=oportunidade).select_related('voluntario')

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="inscricoes-{oportunidade.titulo}.csv"'
    response.write('\ufeff')

    import csv
    writer = csv.writer(response)
    writer.writerow(['Nome', 'Email', 'Telefone', 'Localidade', 'Estado', 'Data Inscrição', 'Mensagem'])
    for i in inscricoes:
        writer.writerow([
            i.voluntario.get_full_name(),
            i.voluntario.email,
            getattr(getattr(i.voluntario, 'volunteer', None), 'telefone', ''),
            getattr(getattr(i.voluntario, 'volunteer', None), 'localidade', ''),
            i.get_estado_display(),
            i.data_inscricao.strftime('%d/%m/%Y'),
            i.mensagem or '',
        ])
    return response

# --- Notificações ---

@login_required
def notificacoes(request):
    notificacoes_list = Notificacao.objects.filter(utilizador=request.user)
    nao_lidas = notificacoes_list.filter(lida=False).count()
    return render(request, 'dashboard/notificacoes.html', {
        'notificacoes': notificacoes_list, 'nao_lidas': nao_lidas,
    })

@login_required
def marcar_notificacao_lida(request, id):
    notificacao = get_object_or_404(Notificacao, id=id, utilizador=request.user)
    notificacao.marcar_como_lida()
    if notificacao.link:
        return redirect(notificacao.link)
    return redirect('accounts:notificacoes')

@login_required
def marcar_todas_lidas(request):
    Notificacao.objects.filter(utilizador=request.user, lida=False).update(lida=True)
    messages.success(request, 'Todas as notificações foram marcadas como lidas.')
    return redirect('accounts:notificacoes')

# --- Certificados ---

@perfil_requerido('voluntario')
def gerar_certificado(request, oportunidade_id):
    inscricao = get_object_or_404(Inscricao, oportunidade_id=oportunidade_id, voluntario=request.user, estado='concluida')
    oportunidade = inscricao.oportunidade

    certificado, created = Certificado.objects.get_or_create(
        voluntario=request.user,
        oportunidade=oportunidade,
        defaults={
            'instituicao_nome': oportunidade.instituicao.nome,
            'horas_voluntariado': 8,
            'descricao_atividade': oportunidade.descricao[:200] if oportunidade.descricao else '',
        }
    )
    return render(request, 'dashboard/volunteer/certificado.html', {
        'certificado': certificado, 'oportunidade': oportunidade,
    })

@perfil_requerido('voluntario')
def download_certificado(request, oportunidade_id):
    inscricao = get_object_or_404(Inscricao, oportunidade_id=oportunidade_id, voluntario=request.user, estado='concluida')
    oportunidade = inscricao.oportunidade

    certificado, created = Certificado.objects.get_or_create(
        voluntario=request.user,
        oportunidade=oportunidade,
        defaults={
            'instituicao_nome': oportunidade.instituicao.nome,
            'horas_voluntariado': 8,
            'descricao_atividade': oportunidade.descricao[:200] if oportunidade.descricao else '',
        }
    )

    from core.pdf_utils import CertificadoPDF
    return CertificadoPDF(certificado, oportunidade).gerar()

# --- Relatório PDF ---

@perfil_requerido('administrador', 'instituicao')
def relatorio_pdf(request):
    if request.user.perfil == 'administrador':
        total_users = User.objects.count()
        total_voluntarios = User.objects.filter(perfil='voluntario').count()
        total_instituicoes = Institution.objects.count()
        total_oportunidades = Oportunidade.objects.count()
        total_inscricoes = Inscricao.objects.count()
        inscricoes_estado = list(Inscricao.objects.values('estado').annotate(total=Count('id')))
        ops_categoria = list(Oportunidade.objects.values('categoria__nome').annotate(total=Count('id')))
        titulo_relatorio = 'Relatório Geral da Plataforma'
        filename = 'relatorio-geral.pdf'
    else:
        institution = get_object_or_404(Institution, user=request.user)
        ops = Oportunidade.objects.filter(instituicao=institution)
        total_oportunidades = ops.count()
        total_inscricoes = Inscricao.objects.filter(oportunidade__instituicao=institution).count()
        total_voluntarios = Inscricao.objects.filter(oportunidade__instituicao=institution).values('voluntario').distinct().count()
        inscricoes_estado = list(Inscricao.objects.filter(oportunidade__instituicao=institution).values('estado').annotate(total=Count('id')))
        ops_categoria = list(ops.values('categoria__nome').annotate(total=Count('id')))
        titulo_relatorio = f'Relatório - {institution.nome}'
        filename = f'relatorio-{institution.nome}.pdf'
        total_users = total_voluntarios
        total_instituicoes = 1

    from core.pdf_utils import RelatorioPDF
    stats = {
        'resumo': [
            ('Total Utilizadores', str(total_users)),
            ('Voluntários', str(total_voluntarios)),
            ('Instituições', str(total_instituicoes)),
            ('Total Oportunidades', str(total_oportunidades)),
            ('Total Inscrições', str(total_inscricoes)),
        ],
        'inscricoes_estado': inscricoes_estado,
        'oportunidades_categoria': ops_categoria,
    }
    return RelatorioPDF(titulo_relatorio, filename, stats).gerar()

# --- Avaliações ---

@perfil_requerido('voluntario')
def avaliar_oportunidade(request, oportunidade_id):
    inscricao = get_object_or_404(Inscricao, oportunidade_id=oportunidade_id, voluntario=request.user, estado='concluida')
    oportunidade = inscricao.oportunidade

    if Avaliacao.objects.filter(autor=request.user, oportunidade=oportunidade).exists():
        messages.warning(request, 'Já avaliaste esta oportunidade.')
        return redirect('accounts:volunteer_dashboard')

    if request.method == 'POST':
        classificacao = int(request.POST.get('classificacao', 5))
        comentario = request.POST.get('comentario', '')
        instituicao_user = oportunidade.instituicao.user
        avaliacao = Avaliacao.objects.create(
            autor=request.user,
            destinatario=instituicao_user,
            oportunidade=oportunidade,
            classificacao=classificacao,
            comentario=comentario,
        )
        NotificacaoService.nova_avaliacao(avaliacao, instituicao_user)
        messages.success(request, 'Avaliação submetida com sucesso!')
        return redirect('accounts:volunteer_dashboard')

    return render(request, 'dashboard/volunteer/avaliar.html', {
        'oportunidade': oportunidade, 'inscricao': inscricao,
    })

def ver_avaliacoes(request, oportunidade_id):
    from django.db.models import Avg
    oportunidade = get_object_or_404(Oportunidade, id=oportunidade_id)
    avaliacoes = Avaliacao.objects.filter(oportunidade=oportunidade).select_related('autor')
    media = avaliacoes.aggregate(media=Avg('classificacao'))['media'] or 0
    return render(request, 'oportunidades/avaliacoes.html', {
        'oportunidade': oportunidade, 'avaliacoes': avaliacoes, 'media': round(media, 1),
    })

# --- Tags ---

@perfil_requerido('administrador')
def gerir_tags(request):
    tags = Tag.objects.annotate(
        total_voluntarios=Count('voluntarios'),
        total_oportunidades=Count('oportunidades')
    ).order_by('nome')
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

@perfil_requerido('voluntario')
def voluntario_tags(request):
    volunteer = get_object_or_404(Volunteer, user=request.user)
    todas_tags = Tag.objects.all()
    tags_atuais = set(VolunteerTag.objects.filter(voluntario=volunteer).values_list('tag_id', flat=True))
    if request.method == 'POST':
        selected = request.POST.getlist('tags')
        VolunteerTag.objects.filter(voluntario=volunteer).delete()
        for tag_id in selected:
            tag = get_object_or_404(Tag, id=tag_id)
            VolunteerTag.objects.create(voluntario=volunteer, tag=tag)
        messages.success(request, 'Tags atualizadas com sucesso!')
        return redirect('accounts:voluntario_tags')
    return render(request, 'dashboard/volunteer/tags.html', {
        'todas_tags': todas_tags, 'tags_atuais': tags_atuais,
    })


