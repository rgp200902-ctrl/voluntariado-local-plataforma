from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('sobre/', views.sobre, name='sobre'),
    path('contacto/', views.contacto, name='contacto'),
    path('impacto/', views.impacto, name='impacto'),
    path('perfil/<int:user_id>/', views.perfil_publico, name='perfil_publico'),
]
