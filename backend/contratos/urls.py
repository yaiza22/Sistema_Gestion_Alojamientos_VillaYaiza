from django.urls import path
from . import views

urlpatterns = [
    # Autenticados
    path('reserva/<int:reserva_id>/generar/', views.generar_contrato,  name='generar-contrato'),
    path('reserva/<int:reserva_id>/',         views.ver_contrato,       name='ver-contrato'),
    path('reserva/<int:reserva_id>/pdf/',     views.descargar_pdf,      name='descargar-pdf'),
    # Público — sin login
    path('ver/<uuid:token>/',                 views.contrato_publico,   name='contrato-publico'),
]