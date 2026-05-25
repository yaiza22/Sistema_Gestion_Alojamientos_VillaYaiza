from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.utils import timezone
from django.template.loader import render_to_string
from weasyprint import HTML
import tempfile
import os

from .models import Contrato
from .serializers import ContratoSerializer
from reservas.models import Reserva
from inventario.models import ItemInventario


def tiene_permiso_contrato(usuario, accion):
    if usuario.rol == 'propietario':
        return True
    return getattr(usuario.permisos, f'contratos_{accion}', False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generar_contrato(request, reserva_id):
    if not tiene_permiso_contrato(request.user, 'crear'):
        return Response(
            {'error': 'No tienes permiso para generar contratos.'},
            status=status.HTTP_403_FORBIDDEN
        )

    reserva = get_object_or_404(
        Reserva.objects.select_related('cliente', 'propiedad'),
        pk=reserva_id
    )

    # Si ya existe lo devuelve, si no lo crea
    contrato, creado = Contrato.objects.get_or_create(
        reserva=reserva,
        defaults={'notas_adicionales': request.data.get('notas_adicionales', '')}
    )

    if not creado and request.data.get('notas_adicionales') is not None:
        contrato.notas_adicionales = request.data.get('notas_adicionales')
        contrato.save()

    serializer = ContratoSerializer(contrato)
    return Response(serializer.data, status=status.HTTP_201_CREATED if creado else status.HTTP_200_OK)


# ─── Ver contrato (solo usuarios autenticados) ────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ver_contrato(request, reserva_id):
    if not tiene_permiso_contrato(request.user, 'ver'):
        return Response(
            {'error': 'No tienes permiso para ver contratos.'},
            status=status.HTTP_403_FORBIDDEN
        )
    contrato = get_object_or_404(Contrato, reserva_id=reserva_id)
    return Response(ContratoSerializer(contrato).data)


# ─── Descargar PDF (usuarios autenticados) ────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def descargar_pdf(request, reserva_id):
    if not tiene_permiso_contrato(request.user, 'ver'):
        return Response(
            {'error': 'No tienes permiso.'},
            status=status.HTTP_403_FORBIDDEN
        )

    contrato = get_object_or_404(
        Contrato.objects.select_related(
            'reserva__cliente', 'reserva__propiedad'
        ),
        reserva_id=reserva_id
    )

    pdf = _generar_pdf(contrato)
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="contrato_reserva_{reserva_id}.pdf"'
    return response


# ─── URL pública — acceso sin login ──────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def contrato_publico(request, token):
    contrato = get_object_or_404(
        Contrato.objects.select_related(
            'reserva__cliente', 'reserva__propiedad'
        ),
        token_publico=token
    )

    # Marca descarga automáticamente
    if not contrato.fue_descargado:
        contrato.fue_descargado = True
        contrato.fecha_descarga = timezone.now()
        contrato.save()

    pdf = _generar_pdf(contrato)
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="contrato_{contrato.token_publico}.pdf"'
    return response


# ─── Helper: generar PDF con WeasyPrint ──────────────────────────────────────
def _generar_pdf(contrato):
    reserva   = contrato.reserva
    propiedad = reserva.propiedad
    cliente   = reserva.cliente

    # Ítems de inventario disponibles de la propiedad
    items_inventario = ItemInventario.objects.filter(
        propiedad=propiedad,
        estado='disponible'
    ).order_by('categoria', 'nombre')

    contexto = {
        'contrato':          contrato,
        'reserva':           reserva,
        'propiedad':         propiedad,
        'cliente':           cliente,
        'items_inventario':  items_inventario,
        'dias':              reserva.dias,
    }

    html_string = render_to_string('contratos/contrato.html', contexto)
    pdf = HTML(string=html_string).write_pdf()
    return pdf
