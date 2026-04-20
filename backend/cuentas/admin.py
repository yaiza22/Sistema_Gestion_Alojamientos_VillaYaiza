from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UsuarioPersonalizado

@admin.register(UsuarioPersonalizado)
class UsuarioPersonalizadoAdmin(UserAdmin):
    list_display = ['username', 'email', 'telefono', 'tipo_documento', 'numero_documento', 'is_active']
    list_filter = ['is_active', 'is_staff']
    search_fields = ['username', 'email', 'numero_documento']
    fieldsets = UserAdmin.fieldsets + (
        ('Información adicional', {
            'fields': ('telefono', 'tipo_documento', 'numero_documento')
        }),
    )