from django.db import models
from propiedades.models import Propiedad
from django.utils import timezone

class Cliente(models.Model):
    nombre = models.CharField(max_length=200)
    telefono = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    tipo_documento = models.CharField(max_length=20, blank=True, null=True,
        choices=[
            ('cc', 'Cédula de Ciudadanía'),
            ('ce', 'Cédula de Extranjería'),
            ('pasaporte', 'Pasaporte'),
            ('nit', 'NIT'),
        ]
    )
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
    DESCUENTO_TIPOS = [
        ('porcentaje', 'Porcentaje'),
        ('valor',      'Valor fijo'),
    ]

    propiedad = models.ForeignKey(Propiedad, on_delete=models.PROTECT, related_name='reservas')
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='reservas')

    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    hora_entrada_estimada = models.TimeField(blank=True, null=True)
    hora_salida_estimada = models.TimeField(blank=True, null=True)
    hora_entrada_real = models.DateTimeField(blank=True, null=True)
    hora_salida_real = models.DateTimeField(blank=True, null=True)
    
    cant_asistentes = models.PositiveIntegerField(default=1)
    personas_cobradas = models.PositiveIntegerField(default=1, help_text="Personas que se cobran realmente (puede diferir en temporada alta)")
    cobrar_capacidad_total = models.BooleanField(default=False, help_text="En temporada alta: cobrar por capacidad máxima aunque asistan menos")
    
    temporada = models.CharField(max_length=10, choices=TEMPORADAS, blank=True, null=True)
    precio_base_usado = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True,help_text="Precio por persona por día usado en el cálculo")
    
    descuento_tipo  = models.CharField(max_length=15, choices=DESCUENTO_TIPOS, blank=True, null=True)
    descuento_valor = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Porcentaje o valor fijo del descuento")

    precio_calculado = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Precio que calculó el sistema")
    precio_total = models.DecimalField(max_digits=10, decimal_places=2, help_text="Precio final guardado (puede ser editado manualmente)")
    precio_modificado_manualmente = models.BooleanField(default=False, help_text="True si el usuario editó el precio final manualmente")

    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    notas = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"Reserva {self.id} - {self.cliente} ({self.fecha_inicio})"

    @property
    def dias(self):
        return (self.fecha_fin - self.fecha_inicio).days

    @property
    def total_pagado(self):
        return sum(
            p.monto if not p.es_devolucion else -p.monto
            for p in self.pagos.all()
        )

    @property
    def saldo_pendiente(self):
        return self.precio_total - self.total_pagado

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
    es_devolucion = models.BooleanField(default=False, help_text="True si este pago es una devolución por cancelación")
    notas = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"
        ordering = ['fecha_pago']

    def __str__(self):
        prefijo = "Devolución" if self.es_devolucion else "Pago"
        return f"{prefijo} ${self.monto} - Reserva {self.reserva.id}"

# Reemplaza el modelo anterior de RevisionInventario
class ChecklistItem(models.Model):
    ESTADOS_ITEM = [
        ('bien',       'En buen estado'),
        ('danado',     'Dañado'),
        ('perdido',    'Perdido'),
        ('incompleto', 'Incompleto'),
    ]

    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name='checklist')
    item = models.ForeignKey('inventario.ItemInventario', on_delete=models.PROTECT)

    # Check-in
    incluido_en_checkin = models.BooleanField(default=False)
    estado_entrada = models.CharField(max_length=15, choices=ESTADOS_ITEM, blank=True, null=True)
    cantidad_entregada = models.PositiveIntegerField(blank=True, null=True)
    notas_entrada = models.TextField(blank=True, null=True)
    fecha_checkin = models.DateTimeField(blank=True, null=True)

    # Check-out
    revisado_en_checkout  = models.BooleanField(default=False)
    estado_salida = models.CharField(max_length=15, choices=ESTADOS_ITEM, blank=True, null=True)
    cantidad_devuelta = models.PositiveIntegerField(blank=True, null=True)
    notas_salida = models.TextField(blank=True, null=True)
    fecha_checkout = models.DateTimeField(blank=True, null=True)

    # Daño
    tiene_costo = models.BooleanField(default=False)
    costo_unitario_ref = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Costo unitario del ítem como referencia")
    costo_a_cobrar = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Monto final a cobrar, editable por el usuario")

    class Meta:
        verbose_name = "Checklist de Reserva"
        verbose_name_plural = "Checklists de Reserva"
        unique_together = [['reserva', 'item']]

    def __str__(self):
        return f"Checklist {self.reserva.id} - {self.item.nombre}"


class CostoDanio(models.Model):
    reserva = models.OneToOneField(Reserva, on_delete=models.CASCADE, related_name='costo_danio')
    items_danados = models.PositiveIntegerField(default=0)
    items_perdidos = models.PositiveIntegerField(default=0)
    items_incompletos = models.PositiveIntegerField(default=0)
    total_calculado = models.DecimalField(max_digits=10, decimal_places=2)
    total_a_cobrar = models.DecimalField(max_digits=10, decimal_places=2, help_text="Puede diferir del calculado si la propietaria decide no cobrar todo")
    cobrado = models.BooleanField(default=False, help_text="Si el costo de daños fue incluido en un pago")
    notas = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Costo por Daño"
        verbose_name_plural = "Costos por Daño"

    def __str__(self):
        return f"Daños Reserva {self.reserva.id} — ${self.total_a_cobrar}"