from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from core.models import Notificacao


class NotificacaoService:
    @staticmethod
    def criar(titulo, mensagem, tipo, utilizador, link=None):
        return Notificacao.objects.create(
            titulo=titulo,
            mensagem=mensagem,
            tipo=tipo,
            utilizador=utilizador,
            link=link,
        )

    @staticmethod
    def inscricao_aceite(inscricao):
        return NotificacaoService.criar(
            titulo='Inscrição Aceite',
            mensagem=f'A tua inscrição na oportunidade "{inscricao.oportunidade.titulo}" foi aceite.',
            tipo='inscricao_aceite',
            utilizador=inscricao.voluntario,
            link=f'/oportunidades/{inscricao.oportunidade.id}/',
        )

    @staticmethod
    def inscricao_recusada(inscricao):
        return NotificacaoService.criar(
            titulo='Inscrição Recusada',
            mensagem=f'A tua inscrição na oportunidade "{inscricao.oportunidade.titulo}" não foi aceite.',
            tipo='inscricao_recusada',
            utilizador=inscricao.voluntario,
            link=f'/oportunidades/{inscricao.oportunidade.id}/',
        )

    @staticmethod
    def inscricao_concluida(inscricao):
        return NotificacaoService.criar(
            titulo='Oportunidade Concluída',
            mensagem=f'Parabéns! Completaste a oportunidade "{inscricao.oportunidade.titulo}".',
            tipo='inscricao_concluida',
            utilizador=inscricao.voluntario,
            link=f'/certificados/{inscricao.oportunidade.id}/gerar/',
        )

    @staticmethod
    def instituicao_aprovada(instituicao):
        return NotificacaoService.criar(
            titulo='Instituição Aprovada',
            mensagem=f'A tua instituição "{instituicao.nome}" foi aprovada.',
            tipo='instituicao_aprovada',
            utilizador=instituicao.user,
            link='/dashboard/instituicao/',
        )

    @staticmethod
    def instituicao_recusada(instituicao):
        return NotificacaoService.criar(
            titulo='Instituição Recusada',
            mensagem=f'A tua instituição "{instituicao.nome}" não foi aprovada.',
            tipo='instituicao_recusada',
            utilizador=instituicao.user,
        )

    @staticmethod
    def oportunidade_aprovada(oportunidade):
        return NotificacaoService.criar(
            titulo='Oportunidade Aprovada',
            mensagem=f'A tua oportunidade "{oportunidade.titulo}" foi aprovada.',
            tipo='nova_oportunidade',
            utilizador=oportunidade.instituicao.user,
            link=f'/oportunidades/{oportunidade.id}/',
        )

    @staticmethod
    def oportunidade_recusada(oportunidade, motivo='Não especificado.'):
        return NotificacaoService.criar(
            titulo='Oportunidade Recusada',
            mensagem=f'A tua oportunidade "{oportunidade.titulo}" não foi aprovada. Motivo: {motivo}',
            tipo='sistema',
            utilizador=oportunidade.instituicao.user,
        )

    @staticmethod
    def oportunidade_submetida(oportunidade):
        return NotificacaoService.criar(
            titulo='Oportunidade Submetida',
            mensagem=f'A tua oportunidade "{oportunidade.titulo}" foi submetida para aprovação.',
            tipo='sistema',
            utilizador=oportunidade.instituicao.user,
        )

    @staticmethod
    def nova_avaliacao(avaliacao, instituicao_user):
        return NotificacaoService.criar(
            titulo='Nova Avaliação',
            mensagem=f'O voluntário {avaliacao.autor.get_full_name() or avaliacao.autor.email} '
                     f'avaliou a oportunidade "{avaliacao.oportunidade.titulo}" '
                     f'com {avaliacao.classificacao}/5 estrelas.',
            tipo='sistema',
            utilizador=instituicao_user,
            link=f'/oportunidades/{avaliacao.oportunidade.id}/',
        )


class PasswordResetService:
    @staticmethod
    def gerar_link_reset(request, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        return request.build_absolute_uri(
            reverse('accounts:password_reset_confirm', args=[uid, token])
        )

    @staticmethod
    def enviar_email_reset(request, user):
        reset_url = PasswordResetService.gerar_link_reset(request, user)
        send_mail(
            subject='Recuperação de Palavra-passe - Plataforma de Voluntariado',
            message=(
                f'Olá {user.get_full_name() or user.email},\n\n'
                f'Recebemos um pedido de recuperação de palavra-passe.\n\n'
                f'Clique no link abaixo para redefinir a sua palavra-passe:\n{reset_url}\n\n'
                f'Se não foi você que pediu, ignore este email.\n\n'
                f'Plataforma de Voluntariado Local'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

    @staticmethod
    def confirmar_reset(uidb64, token, password):
        from accounts.models import User
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return None
        if not default_token_generator.check_token(user, token):
            return None
        user.set_password(password)
        user.save()
        return user


class RegistoAtividadeService:
    @staticmethod
    def registar(utilizador, acao, entidade='User', entidade_id=None, detalhe=None):
        from core.models import RegistoAtividade
        return RegistoAtividade.objects.create(
            utilizador=utilizador,
            acao=acao,
            entidade=entidade,
            entidade_id=str(entidade_id) if entidade_id else None,
            detalhe=detalhe,
        )
