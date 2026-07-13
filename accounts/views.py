from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count
from .forms import LoginForm, VolunteerRegisterForm, InstitutionRegisterForm
from .models import User, Volunteer, Institution
from oportunidades.models import Inscricao, Oportunidade
from core.models import RegistoAtividade

def login_view(request):
    if request.user.is_authenticated:
        return redirect_to_dashboard(request.user)
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(email=form.cleaned_data['email'], password=form.cleaned_data['password'])
            if user and user.is_active:
                login(request, user)
                RegistoAtividade.objects.create(utilizador=user, acao='login', entidade='User', entidade_id=str(user.id))
                return redirect_to_dashboard(user)
            messages.error(request, 'Email ou palavra-passe inválidos.')
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form})

def redirect_to_dashboard(user):
    if user.perfil == 'administrador':
        return redirect('accounts:admin_dashboard')
    elif user.perfil == 'instituicao':
        return redirect('accounts:institution_dashboard')
    else:
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

# --- Volunteer Dashboard ---

@login_required
def volunteer_dashboard(request):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    volunteer, _ = Volunteer.objects.get_or_create(user=request.user)
    inscricoes = Inscricao.objects.filter(voluntario=request.user).select_related('oportunidade')
    stats = {
        'total': inscricoes.count(),
        'ativas': inscricoes.filter(estado__in=['submetida', 'aceite']).count(),
        'concluidas': inscricoes.filter(estado='concluida').count(),
        'favoritos': 0,
    }
    atividades_recentes = RegistoAtividade.objects.filter(utilizador=request.user).order_by('-data_hora')[:5]
    return render(request, 'dashboard/volunteer/dashboard.html', {
        'volunteer': volunteer, 'inscricoes': inscricoes, 'stats': stats, 'atividades': atividades_recentes,
    })

@login_required
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
        if request.POST.get('avatar'):
            volunteer.avatar = request.POST.get('avatar')
        volunteer.save()
        if request.POST.get('first_name'):
            request.user.first_name = request.POST.get('first_name')
            request.user.save()
        messages.success(request, 'Perfil atualizado com sucesso!')
        return redirect('accounts:volunteer_profile')
    return render(request, 'dashboard/volunteer/profile.html', {'volunteer': volunteer})

@login_required
def volunteer_registrations(request):
    inscricoes = Inscricao.objects.filter(voluntario=request.user).select_related('oportunidade', 'oportunidade__instituicao').order_by('-data_inscricao')
    return render(request, 'dashboard/volunteer/registrations.html', {'inscricoes': inscricoes})

@login_required
def volunteer_history(request):
    atividades = RegistoAtividade.objects.filter(utilizador=request.user).order_by('-data_hora')
    return render(request, 'dashboard/volunteer/history.html', {'atividades': atividades})

# --- Institution Dashboard ---

@login_required
def institution_dashboard(request):
    if request.user.perfil != 'instituicao':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    institution = get_object_or_404(Institution, user=request.user)
    oportunidades = Oportunidade.objects.filter(instituicao=institution).annotate(num_inscricoes=Count('registrations'))
    stats = {
        'total': oportunidades.count(),
        'ativas': oportunidades.filter(estado__in=['aberta', 'publicada']).count(),
        'inscricoes': Inscricao.objects.filter(oportunidade__instituicao=institution).count(),
    }
    return render(request, 'dashboard/institution/dashboard.html', {
        'institution': institution, 'oportunidades': oportunidades, 'stats': stats,
    })

@login_required
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
        institution.save()
        messages.success(request, 'Perfil atualizado com sucesso!')
        return redirect('accounts:institution_profile')
    return render(request, 'dashboard/institution/profile.html', {'institution': institution})

# --- Admin Dashboard ---

@login_required
def admin_dashboard(request):
    if request.user.perfil != 'administrador':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    stats = {
        'utilizadores': User.objects.count(),
        'voluntarios': User.objects.filter(perfil='voluntario').count(),
        'instituicoes': User.objects.filter(perfil='instituicao').count(),
        'oportunidades': Oportunidade.objects.count(),
        'inscricoes': Inscricao.objects.count(),
        'instituicoes_pendentes': Institution.objects.filter(estado_validacao='pendente').count(),
    }
    return render(request, 'dashboard/admin/dashboard.html', {'stats': stats})

@login_required
def admin_users(request):
    if request.user.perfil != 'administrador':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    users = User.objects.all().order_by('-data_criacao')
    return render(request, 'dashboard/admin/users.html', {'users': users})

@login_required
def admin_institutions(request):
    if request.user.perfil != 'administrador':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    institutions = Institution.objects.all().order_by('-data_criacao')
    if request.method == 'POST':
        inst_id = request.POST.get('institution_id')
        new_status = request.POST.get('status')
        inst = get_object_or_404(Institution, id=inst_id)
        inst.estado_validacao = new_status
        inst.save()
        if new_status == 'aprovada':
            inst.user.is_active = True
            inst.user.save()
        messages.success(request, f'Instituição {inst.nome} atualizada para {inst.get_estado_validacao_display()}.')
        return redirect('accounts:admin_institutions')
    return render(request, 'dashboard/admin/institutions.html', {'institutions': institutions})

@login_required
def admin_categories(request):
    if request.user.perfil != 'administrador':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    from oportunidades.models import Categoria
    categorias = Categoria.objects.all().order_by('nome')
    if request.method == 'POST':
        nome = request.POST.get('nome')
        descricao = request.POST.get('descricao', '')
        if nome:
            Categoria.objects.create(nome=nome, descricao=descricao)
            messages.success(request, f'Categoria "{nome}" criada.')
        return redirect('accounts:admin_categories')
    return render(request, 'dashboard/admin/categories.html', {'categorias': categorias})

@login_required
def admin_reports(request):
    if request.user.perfil != 'administrador':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    from django.db.models import Count
    from oportunidades.models import Oportunidade, Inscricao, Categoria
    stats = {
        'total_utilizadores': User.objects.count(),
        'total_voluntarios': User.objects.filter(perfil='voluntario').count(),
        'total_instituicoes': Institution.objects.count(),
        'total_oportunidades': Oportunidade.objects.count(),
        'total_inscricoes': Inscricao.objects.count(),
        'inscricoes_por_estado': Inscricao.objects.values('estado').annotate(total=Count('id')),
        'oportunidades_por_categoria': Oportunidade.objects.values('categoria__nome').annotate(total=Count('id')),
    }
    return render(request, 'dashboard/admin/reports.html', {'stats': stats})

# -- Institution Opportunity Management --

@login_required
def criar_oportunidade(request):
    if request.user.perfil != 'instituicao':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    institution = get_object_or_404(Institution, user=request.user)
    categorias = __import__('oportunidades.models', fromlist=['Categoria']).Categoria.objects.filter(ativa=True)

    if request.method == 'POST':
        oportunidade = Oportunidade.objects.create(
            instituicao=institution,
            categoria_id=request.POST.get('categoria') or None,
            titulo=request.POST['titulo'],
            descricao=request.POST['descricao'],
            local=request.POST.get('local', ''),
            freguesia=request.POST.get('freguesia', ''),
            data_inicio=request.POST.get('data_inicio') or None,
            data_fim=request.POST.get('data_fim') or None,
            horario=request.POST.get('horario', ''),
            vagas=request.POST.get('vagas', 1),
            requisitos=request.POST.get('requisitos', ''),
            idade_minima=request.POST.get('idade_minima') or None,
            estado='publicada',
        )
        messages.success(request, 'Oportunidade criada com sucesso!')
        return redirect('accounts:institution_dashboard')

    return render(request, 'dashboard/institution/create_opportunity.html', {'categorias': categorias})

@login_required
def editar_oportunidade(request, id):
    if request.user.perfil != 'instituicao':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    institution = get_object_or_404(Institution, user=request.user)
    oportunidade = get_object_or_404(Oportunidade, id=id, instituicao=institution)
    from oportunidades.models import Categoria
    categorias = Categoria.objects.filter(ativa=True)

    if request.method == 'POST':
        oportunidade.titulo = request.POST['titulo']
        oportunidade.descricao = request.POST['descricao']
        oportunidade.local = request.POST.get('local', '')
        oportunidade.freguesia = request.POST.get('freguesia', '')
        oportunidade.data_inicio = request.POST.get('data_inicio') or None
        oportunidade.data_fim = request.POST.get('data_fim') or None
        oportunidade.horario = request.POST.get('horario', '')
        oportunidade.vagas = request.POST.get('vagas', 1)
        oportunidade.requisitos = request.POST.get('requisitos', '')
        oportunidade.idade_minima = request.POST.get('idade_minima') or None
        oportunidade.categoria_id = request.POST.get('categoria') or None
        oportunidade.estado = request.POST.get('estado', 'publicada')
        oportunidade.save()
        messages.success(request, 'Oportunidade atualizada com sucesso!')
        return redirect('accounts:institution_dashboard')

    from oportunidades.models import Oportunidade as OpModel
    return render(request, 'dashboard/institution/edit_opportunity.html', {
        'oportunidade': oportunidade, 'categorias': categorias,
        'estado_choices': OpModel.ESTADO_CHOICES,
    })

@login_required
def gerir_inscricoes(request, id):
    if request.user.perfil != 'instituicao':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    institution = get_object_or_404(Institution, user=request.user)
    oportunidade = get_object_or_404(Oportunidade, id=id, instituicao=institution)
    inscricoes = Inscricao.objects.filter(oportunidade=oportunidade).select_related('voluntario').order_by('-data_inscricao')

    if request.method == 'POST':
        inscricao_id = request.POST.get('inscricao_id')
        novo_estado = request.POST.get('estado')
        inscricao = get_object_or_404(Inscricao, id=inscricao_id, oportunidade=oportunidade)
        from django.utils import timezone
        inscricao.estado = novo_estado
        inscricao.data_decisao = timezone.now()
        inscricao.save()
        messages.success(request, f'Inscrição atualizada para "{inscricao.get_estado_display()}".')
        return redirect('accounts:gerir_inscricoes', id=id)

    return render(request, 'dashboard/institution/manage_registrations.html', {
        'oportunidade': oportunidade, 'inscricoes': inscricoes,
    })

@login_required
def exportar_inscricoes(request, id):
    if request.user.perfil != 'instituicao':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
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
