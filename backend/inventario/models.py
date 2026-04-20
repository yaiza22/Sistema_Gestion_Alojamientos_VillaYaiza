from django.db import models
from propiedades.models import Propiedad

class ItemInventario(models.Model):
    ESTADOS = [
        ('disponible', 'Disponible'),
        ('no_disponible', 'No disponible'),
        ('en_reparacion', 'En reparación'),
    ]

    propiedad = models.ForeignKey(Propiedad, on_delete=models.CASCADE, related_name='items')
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    cantidad = models.PositiveIntegerField(default=1)
    cantidad_disponible = models.PositiveIntegerField(default=1)
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    foto = models.ImageField(upload_to='inventario/', blank=True, null=True)
    esta_danado = models.BooleanField(default=False)
    notas_dano = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='disponible')
    notas = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ítem de Inventario"
        verbose_name_plural = "Ítems de Inventario"

    def __str__(self):
        return f"{self.nombre} - {self.propiedad.nombre} ({self.get_estado_display()})"