from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count
from django.utils import timezone
from .forms import LoginForm, VolunteerRegisterForm, InstitutionRegisterForm
from .models import User, Volunteer, Institution
from oportunidades.models import Inscricao, Oportunidade
from core.models import RegistoAtividade, Notificacao, Certificado

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
    certificados = Certificado.objects.filter(voluntario=request.user).select_related('oportunidade', 'oportunidade__instituicao')
    stats = {
        'total': inscricoes.count(),
        'ativas': inscricoes.filter(estado__in=['submetida', 'aceite']).count(),
        'concluidas': inscricoes.filter(estado='concluida').count(),
        'certificados': certificados.count(),
    }
    atividades_recentes = RegistoAtividade.objects.filter(utilizador=request.user).order_by('-data_hora')[:5]
    return render(request, 'dashboard/volunteer/dashboard.html', {
        'volunteer': volunteer, 'inscricoes': inscricoes, 'stats': stats,
        'atividades': atividades_recentes, 'certificados': certificados,
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
        if request.FILES.get('avatar'):
            volunteer.avatar = request.FILES['avatar']
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
        'pendentes': oportunidades.filter(estado='pendente').count(),
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
        if request.FILES.get('logotipo'):
            institution.logotipo = request.FILES['logotipo']
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
        'oportunidades_pendentes': Oportunidade.objects.filter(estado='pendente').count(),
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
            Notificacao.objects.create(
                utilizador=inst.user,
                titulo='Instituição Aprovada',
                mensagem=f'A tua instituição "{inst.nome}" foi aprovada. Já podes publicar oportunidades.',
                tipo='instituicao_aprovada',
                link='/dashboard/instituicao/',
            )
        elif new_status == 'recusada':
            Notificacao.objects.create(
                utilizador=inst.user,
                titulo='Instituição Recusada',
                mensagem=f'A tua instituição "{inst.nome}" não foi aprovada. Contacta o administrador para mais informações.',
                tipo='instituicao_recusada',
            )
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

@login_required
def admin_oportunidades(request):
    if request.user.perfil != 'administrador':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    from oportunidades.models import Oportunidade
    filtro = request.GET.get('filtro', 'pendentes')
    if filtro == 'pendentes':
        oportunidades = Oportunidade.objects.filter(estado='pendente').select_related('instituicao', 'categoria').order_by('-criada_em')
    elif filtro == 'aprovadas':
        oportunidades = Oportunidade.objects.filter(estado__in=['publicada', 'aberta']).select_related('instituicao', 'categoria').order_by('-criada_em')
    elif filtro == 'recusadas':
        oportunidades = Oportunidade.objects.filter(estado='cancelada').select_related('instituicao', 'categoria').order_by('-criada_em')
    else:
        oportunidades = Oportunidade.objects.all().select_related('instituicao', 'categoria').order_by('-criada_em')
    pendentes_count = Oportunidade.objects.filter(estado='pendente').count()
    return render(request, 'dashboard/admin/oportunidades.html', {
        'oportunidades': oportunidades, 'filtro': filtro, 'pendentes_count': pendentes_count,
    })

@login_required
def admin_aprovar_oportunidade(request, id):
    if request.user.perfil != 'administrador':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    from oportunidades.models import Oportunidade
    oportunidade = get_object_or_404(Oportunidade, id=id)
    if request.method == 'POST':
        acao = request.POST.get('acao')
        if acao == 'aprovar':
            oportunidade.estado = 'publicada'
            oportunidade.save()
            Notificacao.objects.create(
                utilizador=oportunidade.instituicao.user,
                titulo='Oportunidade Aprovada',
                mensagem=f'A tua oportunidade "{oportunidade.titulo}" foi aprovada e está agora pública.',
                tipo='nova_oportunidade',
                link=f'/oportunidades/{oportunidade.id}/',
            )
            messages.success(request, f'Oportunidade "{oportunidade.titulo}" aprovada com sucesso.')
        elif acao == 'recusar':
            oportunidade.estado = 'cancelada'
            oportunidade.save()
            Notificacao.objects.create(
                utilizador=oportunidade.instituicao.user,
                titulo='Oportunidade Recusada',
                mensagem=f'A tua oportunidade "{oportunidade.titulo}" não foi aprovada pelo administrador. Motivo: {request.POST.get("motivo", "Não especificado.")}',
                tipo='sistema',
            )
            messages.warning(request, f'Oportunidade "{oportunidade.titulo}" recusada.')
        return redirect('accounts:admin_oportunidades')
    return render(request, 'dashboard/admin/detalhe_oportunidade.html', {'oportunidade': oportunidade})

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
            estado='pendente',
        )
        Notificacao.objects.create(
            utilizador=institution.user,
            titulo='Oportunidade Submetida',
            mensagem=f'A tua oportunidade "{oportunidade.titulo}" foi submetida para aprovação pelo administrador.',
            tipo='sistema',
        )
        messages.success(request, 'Oportunidade criada e enviada para aprovação!')
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
def apagar_oportunidade(request, id):
    if request.user.perfil != 'instituicao':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    institution = get_object_or_404(Institution, user=request.user)
    oportunidade = get_object_or_404(Oportunidade, id=id, instituicao=institution)
    if request.method == 'POST':
        titulo = oportunidade.titulo
        oportunidade.delete()
        messages.success(request, f'Oportunidade "{titulo}" apagada com sucesso.')
        return redirect('accounts:institution_dashboard')
    return render(request, 'dashboard/institution/confirm_delete.html', {'oportunidade': oportunidade})

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
        inscricao.estado = novo_estado
        inscricao.data_decisao = timezone.now()
        inscricao.save()
        if novo_estado == 'aceite':
            Notificacao.objects.create(
                utilizador=inscricao.voluntario,
                titulo='Inscrição Aceite',
                mensagem=f'A tua inscrição na oportunidade "{oportunidade.titulo}" foi aceite pela instituição {oportunidade.instituicao.nome}.',
                tipo='inscricao_aceite',
                link=f'/oportunidades/{oportunidade.id}/',
            )
        elif novo_estado == 'recusada':
            Notificacao.objects.create(
                utilizador=inscricao.voluntario,
                titulo='Inscrição Recusada',
                mensagem=f'A tua inscrição na oportunidade "{oportunidade.titulo}" não foi aceite.',
                tipo='inscricao_recusada',
                link=f'/oportunidades/{oportunidade.id}/',
            )
        elif novo_estado == 'concluida':
            Notificacao.objects.create(
                utilizador=inscricao.voluntario,
                titulo='Oportunidade Concluída',
                mensagem=f'Parabéns! Completaste a oportunidade "{oportunidade.titulo}". Podes gerar o teu certificado.',
                tipo='inscricao_concluida',
                link=f'/certificados/{oportunidade.id}/gerar/',
            )
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

def password_reset(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        try:
            user = User.objects.get(email=email)
            import secrets
            nova_password = secrets.token_urlsafe(10)
            user.set_password(nova_password)
            user.save()
            messages.success(request, f'Nova palavra-passe gerada para {email}: <strong>{nova_password}</strong>. Guarda-a e altera-a após o login.')
        except User.DoesNotExist:
            messages.warning(request, 'Email não encontrado na plataforma.')
        return redirect('accounts:login')
    return render(request, 'accounts/password_reset.html')

# --- Notificações ---

@login_required
def notificacoes(request):
    notificacoes = Notificacao.objects.filter(utilizador=request.user)
    nao_lidas = notificacoes.filter(lida=False).count()
    return render(request, 'dashboard/notificacoes.html', {
        'notificacoes': notificacoes, 'nao_lidas': nao_lidas,
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

@login_required
def gerar_certificado(request, oportunidade_id):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
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

@login_required
def download_certificado(request, oportunidade_id):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
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

    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.pdfgen import canvas
    from reportlab.lib.utils import simpleSplit

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="certificado-{oportunidade.titulo}.pdf"'

    c = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    c.setFillColor(HexColor('#0d6efd'))
    c.rect(0, 0, width, height, fill=True)

    c.setFillColor(HexColor('#ffffff'))
    c.setStrokeColor(HexColor('#ffffff'))

    margin = 2 * cm
    inner_w = width - 2 * margin
    inner_h = height - 2 * margin
    c.roundRect(margin, margin, inner_w, inner_h, 15, fill=False, stroke=True)

    y = height - 3 * cm

    c.setFont('Helvetica-Bold', 32)
    c.drawCentredString(width / 2, y, 'Certificado de Voluntariado')

    y -= 1.5 * cm
    c.setFont('Helvetica', 14)
    c.drawCentredString(width / 2, y, 'Este certificado atesta a participação em atividade de voluntariado')

    y -= 2 * cm
    c.setFont('Helvetica-Bold', 20)
    nome_voluntario = certificado.voluntario.get_full_name() or certificado.voluntario.email
    c.drawCentredString(width / 2, y, nome_voluntario)

    y -= 1.5 * cm
    c.setFont('Helvetica', 13)
    c.drawCentredString(width / 2, y, f'participou na oportunidade')

    y -= 1.2 * cm
    c.setFont('Helvetica-Bold', 16)
    c.setFillColor(HexColor('#ffd700'))
    c.drawCentredString(width / 2, y, f'"{oportunidade.titulo}"')

    c.setFillColor(HexColor('#ffffff'))
    y -= 1.5 * cm
    c.setFont('Helvetica', 12)
    c.drawCentredString(width / 2, y, f'organizada por {certificado.instituicao_nome}')

    if certificado.horas_voluntariado:
        y -= 1 * cm
        c.setFont('Helvetica', 12)
        c.drawCentredString(width / 2, y, f'Duração: {certificado.horas_voluntariado} horas')

    y -= 2.5 * cm
    c.setFont('Helvetica', 10)
    c.drawCentredString(width / 2, y, f'Certificado emitido em {certificado.data_emissao.strftime("%d/%m/%Y")}')
    y -= 0.6 * cm
    c.setFont('Helvetica', 9)
    c.drawCentredString(width / 2, y, f'Código de verificação: {certificado.codigo_verificacao}')

    c.save()
    return response

@login_required
def minhas_notificacoes_count(request):
    if request.user.is_authenticated:
        return Notificacao.objects.filter(utilizador=request.user, lida=False).count()
    return 0

# --- Relatório PDF ---

@login_required
def relatorio_pdf(request):
    if request.user.perfil not in ['administrador', 'instituicao']:
        messages.error(request, 'Acesso negado.')
        return redirect('core:home')
    from oportunidades.models import Oportunidade, Inscricao, Categoria
    from django.db.models import Count
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.pdfgen import canvas

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

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    c = canvas.Canvas(response, pagesize=A4)
    width, height = A4
    y = height - 2 * cm

    c.setFillColor(HexColor('#0d6efd'))
    c.rect(0, height - 3 * cm, width, 3 * cm, fill=True)
    c.setFillColor(HexColor('#ffffff'))
    c.setFont('Helvetica-Bold', 20)
    c.drawCentredString(width / 2, height - 2 * cm, titulo_relatorio)
    c.setFont('Helvetica', 10)
    c.drawCentredString(width / 2, height - 2.7 * cm, 'Plataforma de Voluntariado Local')

    y = height - 4.5 * cm
    c.setFillColor(HexColor('#212529'))
    c.setFont('Helvetica-Bold', 14)
    c.drawString(2 * cm, y, 'Resumo Geral')
    y -= 0.8 * cm

    stats = [
        ('Total Utilizadores', str(total_users)),
        ('Voluntários', str(total_voluntarios)),
        ('Instituições', str(total_instituicoes)),
        ('Total Oportunidades', str(total_oportunidades)),
        ('Total Inscrições', str(total_inscricoes)),
    ]

    c.setFont('Helvetica', 11)
    for label, value in stats:
        c.setFillColor(HexColor('#6c757d'))
        c.drawString(2.5 * cm, y, f'{label}:')
        c.setFillColor(HexColor('#0d6efd'))
        c.setFont('Helvetica-Bold', 11)
        c.drawString(8 * cm, y, value)
        c.setFont('Helvetica', 11)
        y -= 0.6 * cm

    y -= 0.5 * cm
    c.setFillColor(HexColor('#212529'))
    c.setFont('Helvetica-Bold', 14)
    c.drawString(2 * cm, y, 'Inscrições por Estado')
    y -= 0.8 * cm

    c.setFont('Helvetica', 11)
    for item in inscricoes_estado:
        c.setFillColor(HexColor('#6c757d'))
        c.drawString(2.5 * cm, y, f'{item["estado"]}:')
        c.setFillColor(HexColor('#0d6efd'))
        c.setFont('Helvetica-Bold', 11)
        c.drawString(8 * cm, y, str(item['total']))
        c.setFont('Helvetica', 11)
        y -= 0.6 * cm

    y -= 0.5 * cm
    c.setFillColor(HexColor('#212529'))
    c.setFont('Helvetica-Bold', 14)
    c.drawString(2 * cm, y, 'Oportunidades por Categoria')
    y -= 0.8 * cm

    c.setFont('Helvetica', 11)
    for item in ops_categoria:
        cat = item['categoria__nome'] or 'Sem categoria'
        c.setFillColor(HexColor('#6c757d'))
        c.drawString(2.5 * cm, y, f'{cat}:')
        c.setFillColor(HexColor('#0d6efd'))
        c.setFont('Helvetica-Bold', 11)
        c.drawString(8 * cm, y, str(item['total']))
        c.setFont('Helvetica', 11)
        y -= 0.6 * cm

    y -= 1 * cm
    c.setFillColor(HexColor('#6c757d'))
    c.setFont('Helvetica', 9)
    c.drawCentredString(width / 2, 2 * cm, f'Relatório gerado em {timezone.now().strftime("%d/%m/%Y %H:%M")} | Plataforma de Voluntariado Local')

    c.save()
    return response

# --- Avaliações ---

@login_required
def avaliar_oportunidade(request, oportunidade_id):
    if request.user.perfil != 'voluntario':
        messages.error(request, 'Apenas voluntários podem avaliar.')
        return redirect('core:home')
    inscricao = get_object_or_404(Inscricao, oportunidade_id=oportunidade_id, voluntario=request.user, estado='concluida')
    oportunidade = inscricao.oportunidade
    from core.models import Avaliacao

    if Avaliacao.objects.filter(autor=request.user, oportunidade=oportunidade).exists():
        messages.warning(request, 'Já avaliaste esta oportunidade.')
        return redirect('accounts:volunteer_dashboard')

    if request.method == 'POST':
        classificacao = int(request.POST.get('classificacao', 5))
        comentario = request.POST.get('comentario', '')
        instituicao_user = oportunidade.instituicao.user
        Avaliacao.objects.create(
            autor=request.user,
            destinatario=instituicao_user,
            oportunidade=oportunidade,
            classificacao=classificacao,
            comentario=comentario,
        )
        Notificacao.objects.create(
            utilizador=instituicao_user,
            titulo='Nova Avaliação',
            mensagem=f'O voluntário {request.user.get_full_name() or request.user.email} avaliou a oportunidade "{oportunidade.titulo}" com {classificacao}/5 estrelas.',
            tipo='sistema',
            link=f'/oportunidades/{oportunidade.id}/',
        )
        messages.success(request, 'Avaliação submetida com sucesso!')
        return redirect('accounts:volunteer_dashboard')

    return render(request, 'dashboard/volunteer/avaliar.html', {
        'oportunidade': oportunidade, 'inscricao': inscricao,
    })

@login_required
def ver_avaliacoes(request, oportunidade_id):
    from core.models import Avaliacao
    oportunidade = get_object_or_404(Oportunidade, id=oportunidade_id)
    avaliacoes = Avaliacao.objects.filter(oportunidade=oportunidade).select_related('autor')
    from django.db.models import Avg
    media = avaliacoes.aggregate(media=Avg('classificacao'))['media'] or 0
    return render(request, 'oportunidades/avaliacoes.html', {
        'oportunidade': oportunidade, 'avaliacoes': avaliacoes, 'media': round(media, 1),
    })
