from django.db import models
from propiedades.models import Propiedad
from django.utils import timezone

class Cliente(models.Model):
    nombre = models.CharField(max_length=200)
    telefono = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    tipo_documento = models.CharField(max_length=20, blank=True, null=True)
    numero_documento = models.CharField(max_length=20, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Reserva(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_curso', 'En curso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]
    TEMPORADAS = [
        ('alta', 'Alta'),
        ('baja', 'Baja'),
    ]

    propiedad = models.ForeignKey(Propiedad, on_delete=models.CASCADE, related_name='reservas')
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='reservas')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    hora_entrada_estimada = models.TimeField(blank=True, null=True)
    hora_salida_estimada = models.TimeField(blank=True, null=True)
    hora_entrada_real = models.DateTimeField(blank=True, null=True)
    hora_salida_real = models.DateTimeField(blank=True, null=True)
    cant_asistentes = models.PositiveIntegerField(default=1)
    temporada = models.CharField(max_length=10, choices=TEMPORADAS, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    precio_total = models.DecimalField(max_digits=10, decimal_places=2)
    notas = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"Reserva {self.id} - {self.cliente} ({self.fecha_inicio})"


class Pago(models.Model):
    METODOS = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('tarjeta', 'Tarjeta'),
    ]

    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name='pagos')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(default=timezone.now)
    metodo = models.CharField(max_length=50, choices=METODOS)
    banco = models.CharField(max_length=100, blank=True, null=True)
    notas = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"

    def __str__(self):
        return f"Pago ${self.monto} - Reserva {self.reserva.id}"


class RevisionInventario(models.Model):
    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name='revisiones_inventario')
    item = models.ForeignKey('inventario.ItemInventario', on_delete=models.CASCADE)
    esta_danado = models.BooleanField(default=False)
    costo_reparacion = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    notas = models.TextField(blank=True, null=True)
    fecha_revision = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Revisión de Inventario"
        verbose_name_plural = "Revisiones de Inventario"

    def __str__(self):
        return f"Revisión {self.reserva.id} - {self.item.nombre}"