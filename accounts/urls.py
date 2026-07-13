from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('registro/', views.register, name='register'),
    path('registro/voluntario/', views.register_volunteer, name='register_volunteer'),
    path('registro/instituicao/', views.register_institution, name='register_institution'),
    path('dashboard/voluntario/', views.volunteer_dashboard, name='volunteer_dashboard'),
    path('dashboard/voluntario/perfil/', views.volunteer_profile, name='volunteer_profile'),
    path('dashboard/voluntario/inscricoes/', views.volunteer_registrations, name='volunteer_registrations'),
    path('dashboard/voluntario/historico/', views.volunteer_history, name='volunteer_history'),
    path('dashboard/instituicao/', views.institution_dashboard, name='institution_dashboard'),
    path('dashboard/instituicao/perfil/', views.institution_profile, name='institution_profile'),
    path('dashboard/instituicao/oportunidades/nova/', views.criar_oportunidade, name='criar_oportunidade'),
    path('dashboard/instituicao/oportunidades/<int:id>/editar/', views.editar_oportunidade, name='editar_oportunidade'),
    path('dashboard/instituicao/oportunidades/<int:id>/inscricoes/', views.gerir_inscricoes, name='gerir_inscricoes'),
    path('dashboard/instituicao/oportunidades/<int:id>/inscricoes/exportar/', views.exportar_inscricoes, name='exportar_inscricoes'),
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/admin/utilizadores/', views.admin_users, name='admin_users'),
    path('dashboard/admin/instituicoes/', views.admin_institutions, name='admin_institutions'),
    path('dashboard/admin/categorias/', views.admin_categories, name='admin_categories'),
    path('dashboard/admin/relatorios/', views.admin_reports, name='admin_reports'),
]
