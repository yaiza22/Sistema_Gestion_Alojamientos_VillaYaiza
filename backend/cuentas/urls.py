from django.urls import path
from . import views

urlpatterns = [
    path('perfil/', views.mi_perfil, name='mi-perfil'),
    path('usuarios/', views.listar_crear_usuarios, name='usuarios'),
    path('usuarios/<int:pk>/', views.detalle_usuario, name='detalle-usuario'),
    path('usuarios/<int:pk>/password/', views.cambiar_password, name='cambiar-password'),
]