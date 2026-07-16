from io import BytesIO
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas


class CertificadoPDF:
    def __init__(self, certificado, oportunidade):
        self.certificado = certificado
        self.oportunidade = oportunidade

    def gerar(self):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificado-{self.oportunidade.titulo}.pdf"'

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
        nome = self.certificado.voluntario.get_full_name() or self.certificado.voluntario.email
        c.drawCentredString(width / 2, y, nome)
        y -= 1.5 * cm
        c.setFont('Helvetica', 13)
        c.drawCentredString(width / 2, y, 'participou na oportunidade')
        y -= 1.2 * cm
        c.setFont('Helvetica-Bold', 16)
        c.setFillColor(HexColor('#ffd700'))
        c.drawCentredString(width / 2, y, f'"{self.oportunidade.titulo}"')
        c.setFillColor(HexColor('#ffffff'))
        y -= 1.5 * cm
        c.setFont('Helvetica', 12)
        c.drawCentredString(width / 2, y, f'organizada por {self.certificado.instituicao_nome}')
        if self.certificado.horas_voluntariado:
            y -= 1 * cm
            c.setFont('Helvetica', 12)
            c.drawCentredString(width / 2, y, f'Duração: {self.certificado.horas_voluntariado} horas')
        y -= 2.5 * cm
        c.setFont('Helvetica', 10)
        c.drawCentredString(width / 2, y, f'Certificado emitido em {self.certificado.data_emissao.strftime("%d/%m/%Y")}')
        y -= 0.6 * cm
        c.setFont('Helvetica', 9)
        c.drawCentredString(width / 2, y, f'Código de verificação: {self.certificado.codigo_verificacao}')

        c.save()
        return response


class RelatorioPDF:
    def __init__(self, titulo, filename, stats):
        self.titulo = titulo
        self.filename = filename
        self.stats = stats

    def gerar(self):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{self.filename}"'

        c = canvas.Canvas(response, pagesize=A4)
        width, height = A4
        from django.utils import timezone

        c.setFillColor(HexColor('#0d6efd'))
        c.rect(0, height - 3 * cm, width, 3 * cm, fill=True)
        c.setFillColor(HexColor('#ffffff'))
        c.setFont('Helvetica-Bold', 20)
        c.drawCentredString(width / 2, height - 2 * cm, self.titulo)
        c.setFont('Helvetica', 10)
        c.drawCentredString(width / 2, height - 2.7 * cm, 'Plataforma de Voluntariado Local')

        y = height - 4.5 * cm

        if 'resumo' in self.stats:
            c.setFillColor(HexColor('#212529'))
            c.setFont('Helvetica-Bold', 14)
            c.drawString(2 * cm, y, 'Resumo Geral')
            y -= 0.8 * cm
            c.setFont('Helvetica', 11)
            for label, value in self.stats['resumo']:
                c.setFillColor(HexColor('#6c757d'))
                c.drawString(2.5 * cm, y, f'{label}:')
                c.setFillColor(HexColor('#0d6efd'))
                c.setFont('Helvetica-Bold', 11)
                c.drawString(8 * cm, y, str(value))
                c.setFont('Helvetica', 11)
                y -= 0.6 * cm

        for secao in ['inscricoes_estado', 'oportunidades_categoria']:
            dados = self.stats.get(secao)
            if dados:
                y -= 0.5 * cm
                label = 'Inscrições por Estado' if 'estado' in secao else 'Oportunidades por Categoria'
                c.setFillColor(HexColor('#212529'))
                c.setFont('Helvetica-Bold', 14)
                c.drawString(2 * cm, y, label)
                y -= 0.8 * cm
                c.setFont('Helvetica', 11)
                for item in dados:
                    nome = item.get('estado') or item.get('categoria__nome') or 'Sem categoria'
                    total = item['total']
                    c.setFillColor(HexColor('#6c757d'))
                    c.drawString(2.5 * cm, y, f'{nome}:')
                    c.setFillColor(HexColor('#0d6efd'))
                    c.setFont('Helvetica-Bold', 11)
                    c.drawString(8 * cm, y, str(total))
                    c.setFont('Helvetica', 11)
                    y -= 0.6 * cm

        y = max(y, 3 * cm)
        c.setFillColor(HexColor('#6c757d'))
        c.setFont('Helvetica', 9)
        c.drawCentredString(width / 2, 2 * cm,
            f'Relatório gerado em {timezone.now().strftime("%d/%m/%Y %H:%M")} | Plataforma de Voluntariado Local')

        c.save()
        return response
