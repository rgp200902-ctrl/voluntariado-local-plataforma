from django.db.models import Count, Q
from .models import Oportunidade, Inscricao, Favorito
from accounts.models import VolunteerTag, Tag


class OportunidadeService:
    @staticmethod
    def criar(instituicao, dados, tag_ids=None):
        oportunidade = Oportunidade.objects.create(
            instituicao=instituicao,
            categoria_id=dados.get('categoria') or None,
            titulo=dados['titulo'],
            descricao=dados['descricao'],
            local=dados.get('local', ''),
            freguesia=dados.get('freguesia', ''),
            data_inicio=dados.get('data_inicio') or None,
            data_fim=dados.get('data_fim') or None,
            horario=dados.get('horario', ''),
            vagas=dados.get('vagas', 1),
            requisitos=dados.get('requisitos', ''),
            idade_minima=dados.get('idade_minima') or None,
            estado=dados.get('estado', 'pendente'),
        )
        if tag_ids:
            oportunidade.tags.set(Tag.objects.filter(id__in=tag_ids))
        return oportunidade

    @staticmethod
    def atualizar(oportunidade, dados, tag_ids=None):
        oportunidade.titulo = dados.get('titulo', oportunidade.titulo)
        oportunidade.descricao = dados.get('descricao', oportunidade.descricao)
        oportunidade.local = dados.get('local', '')
        oportunidade.freguesia = dados.get('freguesia', '')
        oportunidade.data_inicio = dados.get('data_inicio') or None
        oportunidade.data_fim = dados.get('data_fim') or None
        oportunidade.horario = dados.get('horario', '')
        oportunidade.vagas = dados.get('vagas', 1)
        oportunidade.requisitos = dados.get('requisitos', '')
        oportunidade.idade_minima = dados.get('idade_minima') or None
        oportunidade.categoria_id = dados.get('categoria') or None
        oportunidade.estado = dados.get('estado', oportunidade.estado)
        oportunidade.save()
        if tag_ids is not None:
            oportunidade.tags.set(Tag.objects.filter(id__in=tag_ids))
        return oportunidade


class RecomendacaoService:
    @staticmethod
    def get_match_counts(user, oportunidades):
        match_counts = {}
        volunteer_tags = VolunteerTag.objects.filter(
            voluntario__user=user
        ).values_list('tag_id', flat=True)
        if not volunteer_tags:
            return match_counts
        inscritas_ids = list(Inscricao.objects.filter(
            voluntario=user
        ).values_list('oportunidade_id', flat=True))
        for op in oportunidades.exclude(id__in=inscritas_ids):
            op_tags = set(op.tags.values_list('id', flat=True))
            matches = len(op_tags & set(volunteer_tags))
            if matches > 0:
                match_counts[op.id] = matches
        return match_counts

    @staticmethod
    def get_recommended(user, limit=6):
        if not user.is_authenticated or user.perfil != 'voluntario':
            return Oportunidade.objects.none()
        volunteer_tags = VolunteerTag.objects.filter(
            voluntario__user=user
        ).values_list('tag_id', flat=True)
        if not volunteer_tags:
            return Oportunidade.objects.none()
        inscritas_ids = list(Inscricao.objects.filter(
            voluntario=user
        ).values_list('oportunidade_id', flat=True))
        return Oportunidade.objects.filter(
            estado__in=['aberta', 'publicada'],
            tags__in=volunteer_tags
        ).exclude(
            id__in=inscritas_ids
        ).annotate(
            match_count=Count('tags', filter=Q(tags__in=volunteer_tags))
        ).order_by('-match_count', '-criada_em').distinct()[:limit]


class FavoritoService:
    @staticmethod
    def toggle(user, oportunidade):
        favorito, created = Favorito.objects.get_or_create(
            voluntario=user, oportunidade=oportunidade
        )
        if not created:
            favorito.delete()
            return 'removed'
        return 'added'


class InscricaoService:
    @staticmethod
    def inscrever(user, oportunidade, mensagem=''):
        if user.perfil != 'voluntario':
            return None, 'Apenas voluntários podem inscrever-se.'
        if oportunidade.estado not in ['aberta', 'publicada']:
            return None, 'Inscrições encerradas.'
        if Inscricao.objects.filter(oportunidade=oportunidade, voluntario=user).exists():
            return None, 'Já estás inscrito.'
        inscricao = Inscricao.objects.create(
            oportunidade=oportunidade,
            voluntario=user,
            mensagem=mensagem,
        )
        return inscricao, 'Inscrição realizada com sucesso!'
