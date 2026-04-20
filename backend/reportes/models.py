from django.db import models

class Reporte(models.Model):
    """Historial de reportes generados"""
    titulo = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50, choices=[('ingresos', 'Ingresos'), ('ocupacion', 'Ocupación'), ('inventario', 'Inventario')])
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    filtros = models.JSONField(blank=True, null=True)

    class Meta:
        verbose_name = "Reporte"
        verbose_name_plural = "Reportes"

    def __str__(self):
        return f"{self.titulo} - {self.fecha_generacion.date()}"