from django.contrib.auth.models import AbstractUser
from django.db import models

class UsuarioPersonalizado(AbstractUser):
    ROLES = [
        ('admin', 'Administrador'),
        ('asistente', 'Asistente'),
        ('empleado', 'Empleado'),
    ]

    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    tipo_documento = models.CharField(max_length=20, blank=True, null=True)
    numero_documento = models.CharField(max_length=20, blank=True, null=True)
    rol = models.CharField(max_length=20, choices=ROLES, default='asistente')

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.username} ({self.email})"
