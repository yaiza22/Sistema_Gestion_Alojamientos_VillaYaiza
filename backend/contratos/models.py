from django.db import models
from reservas.models import Reserva
import uuid

class Contrato(models.Model):
    reserva = models.OneToOneField(Reserva, on_delete=models.CASCADE, related_name='contrato')
    token_publico = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    fue_descargado = models.BooleanField(default=False)
    fecha_descarga = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Contrato"
        verbose_name_plural = "Contratos"

    def __str__(self):
        return f"Contrato - Reserva {self.reserva.id}"