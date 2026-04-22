from django.db import models
from cuentas.models import UsuarioPersonalizado

class Reporte(models.Model):
    TIPOS = [
        ('ingresos', 'Ingresos'),
        ('ocupacion', 'Ocupación'),
        ('inventario', 'Inventario'),
    ]

    titulo = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50, choices=TIPOS)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    filtros = models.JSONField(blank=True, null=True)
    generado_por = models.ForeignKey(
        UsuarioPersonalizado,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reportes'
    )

    class Meta:
        verbose_name = "Reporte"
        verbose_name_plural = "Reportes"
        ordering = ['-fecha_generacion']

    def __str__(self):
        return f"{self.titulo} - {self.fecha_generacion.date()}"