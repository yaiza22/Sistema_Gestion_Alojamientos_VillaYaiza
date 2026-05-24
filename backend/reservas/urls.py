from django.urls import path
from .views import (ClienteListCreateView, ClienteDetailView, ReservaListCreateView, ReservaDetailView, 
                    verificar_disponibilidad, cancelar_reserva, agregar_pago, eliminar_pago, iniciar_checkin, 
                    actualizar_checklist_item, iniciar_checkout, actualizar_costo_danio, confirmar_completada,)

urlpatterns = [
    # Clientes
    path('clientes/', ClienteListCreateView.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteDetailView.as_view(), name='cliente-detail'),

    # Reservas
    path('', ReservaListCreateView.as_view(), name='reserva-list-create'),
    path('<int:pk>/', ReservaDetailView.as_view(), name='reserva-detail'),
    path('<int:pk>/cancelar/', cancelar_reserva, name='cancelar-reserva'),
    path('disponibilidad/', verificar_disponibilidad, name='verificar-disponibilidad'),

    # Pagos
    path('<int:pk>/pagos/', agregar_pago, name='agregar-pago'),
    path('<int:pk>/pagos/<int:pago_pk>/', eliminar_pago, name='eliminar-pago'),

    # Check-in
    path('<int:pk>/checkin/', iniciar_checkin, name='iniciar-checkin'),
    path('<int:pk>/checklist/<int:item_pk>/', actualizar_checklist_item, name='actualizar-checklist'),

    # Check-out
    path('<int:pk>/checkout/', iniciar_checkout, name='iniciar-checkout'),
    path('<int:pk>/costo-danio/', actualizar_costo_danio, name='actualizar-costo-danio'),
    path('<int:pk>/completar/', confirmar_completada, name='confirmar-completada'),
]