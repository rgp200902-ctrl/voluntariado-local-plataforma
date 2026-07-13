from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Volunteer, Institution

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'get_full_name', 'perfil', 'ativo', 'data_criacao')
    list_filter = ('perfil', 'ativo')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informação Pessoal', {'fields': ('first_name', 'last_name', 'perfil')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas', {'fields': ('last_login', 'ultimo_acesso', 'data_criacao')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'perfil', 'password1', 'password2'),
        }),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Volunteer)
admin.site.register(Institution)
