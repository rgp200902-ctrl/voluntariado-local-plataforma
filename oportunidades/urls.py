from django.urls import path
from . import views

app_name = 'oportunidades'

urlpatterns = [
    path('', views.list_oportunidades, name='list'),
    path('favoritos/', views.favoritos, name='favoritos'),
    path('<int:id>/', views.detail_oportunidade, name='detail'),
    path('<int:id>/inscrever/', views.inscrever_oportunidade, name='inscrever'),
    path('<int:id>/favorito/', views.toggle_favorito, name='toggle_favorito'),
    path('<int:id>/avaliacoes/', views.ver_avaliacoes, name='avaliacoes'),
    path('<int:id>/cancelar-inscricao/', views.cancelar_inscricao, name='cancelar_inscricao'),
]
