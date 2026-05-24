from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Cliente, Reserva, Pago, ChecklistItem, CostoDanio
from .serializers import (ClienteSerializer, ReservaSerializer, CrearReservaSerializer, PagoSerializer, ChecklistItemSerializer, CostoDanioSerializer, CancelarReservaSerializer,)
from inventario.models import ItemInventario

def tiene_permiso_cliente(usuario, accion):
    if usuario.rol == 'propietario':
        return True
    return getattr(usuario.permisos, f'clientes_{accion}', False)

def tiene_permiso_reserva(usuario, accion):
    if usuario.rol == 'propietario':
        return True
    return getattr(usuario.permisos, f'reservas_{accion}', False)

class ClienteListCreateView(generics.ListCreateAPIView):
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'email', 'numero_documento', 'telefono']

    def get_queryset(self):
        if not tiene_permiso_cliente(self.request.user, 'ver'):
            return Cliente.objects.none()
        return Cliente.objects.all().order_by('nombre')

    def perform_create(self, serializer):
        # Solo bloquear si no tiene permiso de clientes NI de reservas
        tiene_clientes = tiene_permiso_cliente(self.request.user, 'crear')
        tiene_reservas = tiene_permiso_reserva(self.request.user, 'crear')
        if not tiene_clientes and not tiene_reservas:
            raise PermissionDenied('No tienes permiso para crear clientes.')
        serializer.save()

class ClienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        if not tiene_permiso_cliente(request.user, 'editar'):
            raise PermissionDenied('No tienes permiso para editar clientes.')
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not tiene_permiso_cliente(request.user, 'eliminar'):
            raise PermissionDenied('No tienes permiso para eliminar clientes.')
        return super().destroy(request, *args, **kwargs)


class ReservaListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['cliente__nombre', 'propiedad__nombre', 'estado']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CrearReservaSerializer
        return ReservaSerializer

    def get_queryset(self):
        if not tiene_permiso_reserva(self.request.user, 'ver'):
            return Reserva.objects.none()
        return Reserva.objects.select_related(
            'cliente', 'propiedad'
        ).prefetch_related('pagos').all()

    def perform_create(self, serializer):
        if not tiene_permiso_reserva(self.request.user, 'crear'):
            raise PermissionDenied('No tienes permiso para crear reservas.')
        serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reserva = serializer.save()
        # Devuelve el detalle completo al crear
        return Response(
            ReservaSerializer(reserva).data,
            status=status.HTTP_201_CREATED
        )

class ReservaDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CrearReservaSerializer
        return ReservaSerializer

    def get_queryset(self):
        return Reserva.objects.select_related(
            'cliente', 'propiedad'
        ).prefetch_related(
            'pagos', 'checklist__item', 'costo_danio'
        ).all()

    def update(self, request, *args, **kwargs):
        if not tiene_permiso_reserva(request.user, 'editar'):
            raise PermissionDenied('No tienes permiso para editar reservas.')
        response = super().update(request, *args, **kwargs)
        # Devuelve el detalle completo al editar
        reserva = self.get_object()
        return Response(ReservaSerializer(reserva).data)

    def destroy(self, request, *args, **kwargs):
        if not tiene_permiso_reserva(request.user, 'eliminar'):
            raise PermissionDenied('No tienes permiso para eliminar reservas.')
        return super().destroy(request, *args, **kwargs)

# Disponibilidad de fechas
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verificar_disponibilidad(request):
    propiedad_id = request.query_params.get('propiedad_id')
    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin = request.query_params.get('fecha_fin')
    reserva_id = request.query_params.get('reserva_id')

    if not all([propiedad_id, fecha_inicio, fecha_fin]):
        return Response(
            {'error': 'Faltan parámetros.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    conflictos = Reserva.objects.filter(
        propiedad_id=propiedad_id,
        estado__in=['pendiente', 'en_curso'],
        fecha_inicio__lt=fecha_fin,
        fecha_fin__gt=fecha_inicio,
    )
    if reserva_id:
        conflictos = conflictos.exclude(id=reserva_id)

    # Buscar brechas con reservas adyacentes
    brechas = []
    reservas_adyacentes = Reserva.objects.filter(
        propiedad_id=propiedad_id,
        estado__in=['pendiente', 'en_curso'],
        fecha_inicio__lte=fecha_fin,
        fecha_fin__gte=fecha_inicio,
    ).exclude(id=reserva_id if reserva_id else 0)

    for r in reservas_adyacentes:
        if str(r.fecha_fin) == fecha_inicio and r.hora_salida_estimada:
            brechas.append({
                'tipo': 'mismo_dia',
                'reserva_id': r.id,
                'hora_salida': str(r.hora_salida_estimada),
                'mensaje': f'Hay una reserva que sale el mismo día a las {r.hora_salida_estimada}'
            })
        if str(r.fecha_inicio) == fecha_fin and r.hora_entrada_estimada:
            brechas.append({
                'tipo': 'dia_siguiente',
                'reserva_id': r.id,
                'hora_entrada': str(r.hora_entrada_estimada),
                'mensaje': f'Hay una reserva que entra el mismo día de salida a las {r.hora_entrada_estimada}'
            })

    return Response({
        'disponible': not conflictos.exists(),
        'conflictos': conflictos.count(),
        'brechas': brechas,
    })

# Cancelar
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancelar_reserva(request, pk):
    if not tiene_permiso_reserva(request.user, 'editar'):
        raise PermissionDenied('No tienes permiso para cancelar reservas.')

    reserva = get_object_or_404(Reserva, pk=pk)

    if reserva.estado == 'cancelada':
        return Response(
            {'error': 'Esta reserva ya está cancelada.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = CancelarReservaSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if data['opcion'] == 'cambio_fechas':
        reserva.fecha_inicio = data['nueva_fecha_inicio']
        reserva.fecha_fin    = data['nueva_fecha_fin']
        reserva.notas = (reserva.notas or '') + f"\nFechas cambiadas: {data.get('notas', '')}"
        reserva.save()
        return Response(ReservaSerializer(reserva).data)

    if data['opcion'] == 'con_devolucion':
        Pago.objects.create(
            reserva=reserva,
            monto=data['monto_devolucion'],
            metodo=data['metodo_devolucion'],
            es_devolucion=True,
            notas=data.get('notas', ''),
            fecha_pago=timezone.now(),
        )

    reserva.estado = 'cancelada'
    reserva.notas  = (reserva.notas or '') + f"\nCancelada: {data.get('notas', '')}"
    reserva.save()
    return Response(ReservaSerializer(reserva).data)

# Pagos
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agregar_pago(request, pk):
    if not tiene_permiso_reserva(request.user, 'editar'):
        raise PermissionDenied('No tienes permiso para registrar pagos.')

    reserva = get_object_or_404(Reserva, pk=pk)

    if reserva.estado == 'cancelada':
        return Response(
            {'error': 'No se pueden agregar pagos a una reserva cancelada.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = PagoSerializer(data={**request.data, 'reserva': reserva.id})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_pago(request, pk, pago_pk):
    if not tiene_permiso_reserva(request.user, 'editar'):
        raise PermissionDenied('No tienes permiso para eliminar pagos.')

    pago = get_object_or_404(Pago, pk=pago_pk, reserva_id=pk)
    pago.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# CHECK IN
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def iniciar_checkin(request, pk):
    if not tiene_permiso_reserva(request.user, 'editar'):
        raise PermissionDenied('No tienes permiso para realizar el check-in.')

    reserva = get_object_or_404(Reserva, pk=pk)

    if reserva.estado != 'pendiente':
        return Response(
            {'error': 'Solo se puede hacer check-in en reservas pendientes.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Crea un ChecklistItem por cada ítem disponible de la propiedad
    items = ItemInventario.objects.filter(
        propiedad=reserva.propiedad,
        estado='disponible'
    )
    for item in items:
        ChecklistItem.objects.get_or_create(
            reserva=reserva,
            item=item,
            defaults={
                'costo_unitario_ref': item.costo_unitario,
                'cantidad_entregada': item.cantidad_disponible,
            }
        )

    reserva.hora_entrada_real = request.data.get('hora_entrada_real', timezone.now())
    reserva.estado = 'en_curso'
    reserva.save()

    return Response(ReservaSerializer(reserva).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def actualizar_checklist_item(request, pk, item_pk):
    if not tiene_permiso_reserva(request.user, 'editar'):
        raise PermissionDenied('No tienes permiso.')

    checklist_item = get_object_or_404(ChecklistItem, pk=item_pk, reserva_id=pk)
    serializer = ChecklistItemSerializer(
        checklist_item, data=request.data, partial=True
    )
    serializer.is_valid(raise_exception=True)

    # Si se está marcando como incluido en checkin, registra la fecha
    if request.data.get('incluido_en_checkin') and not checklist_item.fecha_checkin:
        serializer.save(fecha_checkin=timezone.now())
    else:
        serializer.save()

    return Response(serializer.data)

# check out
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def iniciar_checkout(request, pk):
    if not tiene_permiso_reserva(request.user, 'editar'):
        raise PermissionDenied('No tienes permiso para realizar el check-out.')

    reserva = get_object_or_404(Reserva, pk=pk)

    if reserva.estado != 'en_curso':
        return Response(
            {'error': 'Solo se puede hacer check-out en reservas en curso.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    reserva.hora_salida_real = request.data.get('hora_salida_real', timezone.now())
    reserva.save()

    # Calcula resumen de daños sin cerrar la reserva
    items_checklist = reserva.checklist.filter(incluido_en_checkin=True)
    danados     = items_checklist.filter(estado_salida='danado').count()
    perdidos    = items_checklist.filter(estado_salida='perdido').count()
    incompletos = items_checklist.filter(estado_salida='incompleto').count()
    total_calculado = sum(
        float(item.costo_a_cobrar or 0)
        for item in items_checklist
        if item.tiene_costo
    )

    CostoDanio.objects.update_or_create(
        reserva=reserva,
        defaults={
            'items_danados':     danados,
            'items_perdidos':    perdidos,
            'items_incompletos': incompletos,
            'total_calculado':   total_calculado,
            'total_a_cobrar':    total_calculado,
        }
    )

    return Response(ReservaSerializer(reserva).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_completada(request, pk):
    if not tiene_permiso_reserva(request.user, 'editar'):
        raise PermissionDenied('No tienes permiso.')

    reserva = get_object_or_404(Reserva, pk=pk)

    if reserva.estado != 'en_curso':
        return Response(
            {'error': 'La reserva debe estar en curso para completarla.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    reserva.estado = 'completada'
    reserva.save()
    return Response(ReservaSerializer(reserva).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def actualizar_costo_danio(request, pk):
    if not tiene_permiso_reserva(request.user, 'editar'):
        raise PermissionDenied('No tienes permiso.')

    costo = get_object_or_404(CostoDanio, reserva_id=pk)
    serializer = CostoDanioSerializer(costo, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)