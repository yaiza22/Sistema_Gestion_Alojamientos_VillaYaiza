from django.contrib.auth.models import AbstractUser
from django.db import models

from django.db.models.signals import post_save
from django.dispatch import receiver

class UsuarioPersonalizado(AbstractUser):
    ROLES = [
        ('propietario', 'Propietario'),
        ('asistente', 'Asistente'),
        ('empleado', 'Empleado'),
    ]

    TIPO_DOC = [
        ('cc', 'Cédula de Ciudadanía'),
        ('ce', 'Cédula de Extranjería'),
        ('pasaporte', 'Pasaporte'),
        ('nit', 'NIT'),
    ]

    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    tipo_documento = models.CharField(max_length=20, blank=True, null=True, choices=TIPO_DOC, default='cc')
    numero_documento = models.CharField(max_length=20, blank=True, null=True)
    rol = models.CharField(max_length=20, choices=ROLES, default='asistente')
    # Posible mejora para fotos de usuarios del sistema
    # foto = models.ImageField(upload_to='usuarios/fotos/', blank=True, null=True)

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.username} ({self.email})  ({self.get_rol_display()})"

    @property
    def es_propietario(self):
        return self.rol == 'propietario'

    @property
    def puede_gestionar_usuarios(self):
        """Propietario y asistentes pueden gestionar usuarios"""
        return self.rol in ('propietario', 'asistente')


class PermisosUsuario(models.Model):
    # Matriz de permisos individuales por módulo. Se crea automáticamente al crear un usuario.
    usuario = models.OneToOneField(
        UsuarioPersonalizado,
        on_delete=models.CASCADE,
        related_name='permisos'
    )

    # Módulo: Reservas
    reservas_ver      = models.BooleanField(default=False)
    reservas_crear    = models.BooleanField(default=False)
    reservas_editar   = models.BooleanField(default=False)
    reservas_eliminar = models.BooleanField(default=False)

    # Módulo: Clientes
    clientes_ver      = models.BooleanField(default=False)
    clientes_crear    = models.BooleanField(default=False)
    clientes_editar   = models.BooleanField(default=False)
    clientes_eliminar = models.BooleanField(default=False)

    # Módulo: Propiedades
    propiedades_ver      = models.BooleanField(default=False)
    propiedades_crear    = models.BooleanField(default=False)
    propiedades_editar   = models.BooleanField(default=False)
    propiedades_eliminar = models.BooleanField(default=False)

    # Módulo: Inventario
    inventario_ver      = models.BooleanField(default=False)
    inventario_crear    = models.BooleanField(default=False)
    inventario_editar   = models.BooleanField(default=False)
    inventario_eliminar = models.BooleanField(default=False)

    # Módulo: Reportes
    reportes_ver      = models.BooleanField(default=False)
    reportes_crear    = models.BooleanField(default=False)
    reportes_editar   = models.BooleanField(default=False)
    reportes_eliminar = models.BooleanField(default=False)

    # Módulo: Contratos/PDF
    contratos_ver      = models.BooleanField(default=False)
    contratos_crear    = models.BooleanField(default=False)
    contratos_editar   = models.BooleanField(default=False)
    contratos_eliminar = models.BooleanField(default=False)

    # Módulo: Usuarios del sistema
    usuarios_ver      = models.BooleanField(default=False)
    usuarios_crear    = models.BooleanField(default=False)
    usuarios_editar   = models.BooleanField(default=False)
    usuarios_eliminar = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Permisos de Usuario"
        verbose_name_plural = "Permisos de Usuarios"

    def __str__(self):
        return f"Permisos de {self.usuario.username}"

# Crea automáticamente el objeto PermisosUsuario al crear un usuario nuevo.
# Así nunca existe un usuario sin su tabla de permisos.
@receiver(post_save, sender=UsuarioPersonalizado)
def crear_permisos_usuario(sender, instance, created, **kwargs):
    if created:
        PermisosUsuario.objects.create(usuario=instance)