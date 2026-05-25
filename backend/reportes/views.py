from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from datetime import date
from reservas.models import Reserva, Pago
from inventario.models import ItemInventario
from propiedades.models import Propiedad
from .models import Reporte
from .serializers import ReporteSerializer


def tiene_permiso_reporte(usuario):
    if usuario.rol == 'propietaria':
        return True
    return getattr(usuario.permisos, 'reportes_ver', False)


# ─── Reporte de ingresos ──────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_ingresos(request):
    if not tiene_permiso_reporte(request.user):
        raise PermissionDenied('No tienes permiso para ver reportes.')

    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin    = request.query_params.get('fecha_fin')
    propiedad_id = request.query_params.get('propiedad_id')

    pagos = Pago.objects.filter(es_devolucion=False)
    reservas = Reserva.objects.filter(estado__in=['completada', 'en_curso'])

    if fecha_inicio:
        pagos    = pagos.filter(fecha_pago__date__gte=fecha_inicio)
        reservas = reservas.filter(fecha_inicio__gte=fecha_inicio)
    if fecha_fin:
        pagos    = pagos.filter(fecha_pago__date__lte=fecha_fin)
        reservas = reservas.filter(fecha_fin__lte=fecha_fin)
    if propiedad_id:
        pagos    = pagos.filter(reserva__propiedad_id=propiedad_id)
        reservas = reservas.filter(propiedad_id=propiedad_id)

    # Total ingresos
    total_ingresos = pagos.aggregate(total=Sum('monto'))['total'] or 0

    # Ingresos por mes
    por_mes = (
        pagos
        .annotate(mes=TruncMonth('fecha_pago'))
        .values('mes')
        .annotate(total=Sum('monto'))
        .order_by('mes')
    )

    # Ingresos por propiedad
    por_propiedad = (
        reservas
        .values('propiedad__nombre')
        .annotate(total=Sum('precio_total'), cantidad=Count('id'))
        .order_by('-total')
    )

    # Ingresos por método de pago
    por_metodo = (
        pagos
        .values('metodo')
        .annotate(total=Sum('monto'))
        .order_by('-total')
    )

    # Guardar registro del reporte
    Reporte.objects.create(
        titulo=f"Reporte de ingresos",
        tipo='ingresos',
        filtros={'fecha_inicio': fecha_inicio, 'fecha_fin': fecha_fin, 'propiedad_id': propiedad_id},
        generado_por=request.user,
    )

    return Response({
        'total_ingresos': float(total_ingresos),
        'por_mes': [
            {'mes': item['mes'].strftime('%Y-%m'), 'total': float(item['total'])}
            for item in por_mes
        ],
        'por_propiedad': [
            {
                'propiedad': item['propiedad__nombre'],
                'total': float(item['total']),
                'reservas': item['cantidad'],
            }
            for item in por_propiedad
        ],
        'por_metodo': [
            {'metodo': item['metodo'], 'total': float(item['total'])}
            for item in por_metodo
        ],
    })


# ─── Reporte de ocupación ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_ocupacion(request):
    if not tiene_permiso_reporte(request.user):
        raise PermissionDenied('No tienes permiso para ver reportes.')

    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin    = request.query_params.get('fecha_fin')
    propiedad_id = request.query_params.get('propiedad_id')

    reservas = Reserva.objects.all()
    if fecha_inicio:
        reservas = reservas.filter(fecha_inicio__gte=fecha_inicio)
    if fecha_fin:
        reservas = reservas.filter(fecha_fin__lte=fecha_fin)
    if propiedad_id:
        reservas = reservas.filter(propiedad_id=propiedad_id)

    total          = reservas.count()
    completadas    = reservas.filter(estado='completada').count()
    canceladas     = reservas.filter(estado='cancelada').count()
    pendientes     = reservas.filter(estado='pendiente').count()
    en_curso       = reservas.filter(estado='en_curso').count()

    por_propiedad = (
        reservas
        .values('propiedad__nombre')
        .annotate(total=Count('id'))
        .order_by('-total')
    )

    por_temporada = (
        reservas
        .values('temporada')
        .annotate(total=Count('id'))
    )

    promedio_asistentes = reservas.aggregate(
        promedio=Sum('cant_asistentes')
    )['promedio'] or 0
    promedio_asistentes = round(promedio_asistentes / total, 1) if total > 0 else 0

    Reporte.objects.create(
        titulo="Reporte de ocupación",
        tipo='ocupacion',
        filtros={'fecha_inicio': fecha_inicio, 'fecha_fin': fecha_fin},
        generado_por=request.user,
    )

    return Response({
        'total_reservas':    total,
        'completadas':       completadas,
        'canceladas':        canceladas,
        'pendientes':        pendientes,
        'en_curso':          en_curso,
        'tasa_cancelacion':  round((canceladas / total * 100), 1) if total > 0 else 0,
        'promedio_asistentes': promedio_asistentes,
        'por_propiedad': [
            {'propiedad': i['propiedad__nombre'], 'total': i['total']}
            for i in por_propiedad
        ],
        'por_temporada': [
            {'temporada': i['temporada'] or 'Sin definir', 'total': i['total']}
            for i in por_temporada
        ],
    })


# ─── Reporte de inventario ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_inventario(request):
    if not tiene_permiso_reporte(request.user):
        raise PermissionDenied('No tienes permiso para ver reportes.')

    propiedad_id = request.query_params.get('propiedad_id')

    items = ItemInventario.objects.select_related('propiedad')
    if propiedad_id:
        items = items.filter(propiedad_id=propiedad_id)

    total_items     = items.count()
    disponibles     = items.filter(estado='disponible').count()
    no_disponibles  = items.filter(estado='no_disponible').count()
    en_reparacion   = items.filter(estado='en_reparacion').count()
    danados         = items.filter(esta_danado=True).count()

    por_categoria = (
        items
        .values('categoria')
        .annotate(total=Count('id'))
        .order_by('-total')
    )

    por_propiedad = (
        items
        .values('propiedad__nombre')
        .annotate(total=Count('id'), danados=Count('id', filter=Q(esta_danado=True)))
        .order_by('propiedad__nombre')
    )

    Reporte.objects.create(
        titulo="Reporte de inventario",
        tipo='inventario',
        filtros={'propiedad_id': propiedad_id},
        generado_por=request.user,
    )

    return Response({
        'total_items':    total_items,
        'disponibles':    disponibles,
        'no_disponibles': no_disponibles,
        'en_reparacion':  en_reparacion,
        'danados':        danados,
        'por_categoria': [
            {'categoria': i['categoria'], 'total': i['total']}
            for i in por_categoria
        ],
        'por_propiedad': [
            {
                'propiedad': i['propiedad__nombre'],
                'total':     i['total'],
                'danados':   i['danados'],
            }
            for i in por_propiedad
        ],
    })