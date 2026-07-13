from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Volunteer, Institution

class LoginForm(forms.Form):
    email = forms.EmailField(label='Email', widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'O teu email'}))
    password = forms.CharField(label='Palavra-passe', widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'A tua palavra-passe'}))

class VolunteerRegisterForm(UserCreationForm):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'O teu email'}))
    first_name = forms.CharField(label='Nome', max_length=100, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'O teu nome completo'}))
    password1 = forms.CharField(label='Palavra-passe', widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Cria uma palavra-passe'}))
    password2 = forms.CharField(label='Confirmar Palavra-passe', widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Repete a palavra-passe'}))

    telefone = forms.CharField(label='Telefone', max_length=20, required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Telemóvel'}))
    localidade = forms.CharField(label='Localidade', max_length=100, required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'A tua localidade'}))
    data_nascimento = forms.DateField(label='Data de Nascimento', required=False, widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}))
    faixa_etaria = forms.ChoiceField(label='Faixa Etária', required=False, choices=[
        ('', 'Seleciona...'), ('<18', 'Menos de 18'), ('18-25', '18-25 anos'),
        ('26-35', '26-35 anos'), ('36-50', '36-50 anos'), ('50+', 'Mais de 50'),
    ], widget=forms.Select(attrs={'class': 'form-select'}))
    disponibilidade = forms.CharField(label='Disponibilidade', required=False, widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Quando estás disponível?'}))
    interesses = forms.CharField(label='Áreas de Interesse', required=False, widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Quais as tuas áreas de interesse?'}))
    competencias = forms.CharField(label='Competências', required=False, widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Que competências tens?'}))
    consentimento_rgpd = forms.BooleanField(label='Consinto o tratamento dos meus dados pessoais conforme o RGPD', required=True, widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}))

    class Meta:
        model = User
        fields = ('email', 'first_name', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.perfil = 'voluntario'
        user.username = self.cleaned_data['email']
        if commit:
            user.save()
            Volunteer.objects.create(
                user=user,
                telefone=self.cleaned_data.get('telefone'),
                localidade=self.cleaned_data.get('localidade'),
                data_nascimento=self.cleaned_data.get('data_nascimento'),
                faixa_etaria=self.cleaned_data.get('faixa_etaria'),
                disponibilidade=self.cleaned_data.get('disponibilidade'),
                interesses=self.cleaned_data.get('interesses'),
                competencias=self.cleaned_data.get('competencias'),
                consentimento_rgpd=True,
            )
        return user

class InstitutionRegisterForm(UserCreationForm):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email da instituição'}))
    first_name = forms.CharField(label='Nome do Responsável', max_length=100, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nome da pessoa de contacto'}))
    password1 = forms.CharField(label='Palavra-passe', widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Cria uma palavra-passe'}))
    password2 = forms.CharField(label='Confirmar Palavra-passe', widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Repete a palavra-passe'}))

    nome = forms.CharField(label='Nome da Instituição', max_length=200, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nome da instituição'}))
    nif = forms.CharField(label='NIF', max_length=20, required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'NIF da instituição'}))
    tipo = forms.ChoiceField(label='Tipo', required=False, choices=[
        ('', 'Seleciona...'), ('ipss', 'IPSS'), ('ong', 'ONG'), ('associacao', 'Associação'),
        ('fundacao', 'Fundação'), ('outro', 'Outro'),
    ], widget=forms.Select(attrs={'class': 'form-select'}))
    descricao = forms.CharField(label='Descrição', required=False, widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Descreve a instituição'}))
    morada = forms.CharField(label='Morada', max_length=200, required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Morada'}))
    telefone = forms.CharField(label='Telefone', max_length=20, required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Telefone'}))
    website = forms.URLField(label='Website', required=False, widget=forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://...'}))

    class Meta:
        model = User
        fields = ('email', 'first_name', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.perfil = 'instituicao'
        user.username = self.cleaned_data['email']
        if commit:
            user.save()
            Institution.objects.create(
                user=user,
                nome=self.cleaned_data.get('nome'),
                nif=self.cleaned_data.get('nif'),
                tipo=self.cleaned_data.get('tipo'),
                descricao=self.cleaned_data.get('descricao'),
                morada=self.cleaned_data.get('morada'),
                telefone=self.cleaned_data.get('telefone'),
                website=self.cleaned_data.get('website'),
                pessoa_contacto=self.cleaned_data.get('first_name'),
                estado_validacao='pendente',
            )
        return user
