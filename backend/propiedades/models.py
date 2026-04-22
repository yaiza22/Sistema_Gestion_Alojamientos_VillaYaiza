from django.db import models

class Propiedad(models.Model):
    TIPOS = [
        ('finca', 'Finca'),
        ('apartamento', 'Apartamento'),
        ('cabaña', 'Cabaña'),
    ]

    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    descripcion = models.TextField(blank=True)
    capacidad = models.PositiveIntegerField()
    ubicacion = models.CharField(max_length=200, blank=True, null=True)
    precio_base_por_dia = models.DecimalField(max_digits=10, decimal_places=2)
    precio_temporada_baja = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    precio_temporada_alta = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    esta_activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Propiedad"
        verbose_name_plural = "Propiedades"

    def __str__(self):
        return self.nombre