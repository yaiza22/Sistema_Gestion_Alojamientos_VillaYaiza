from django.contrib import admin
from .models import Propiedad

@admin.register(Propiedad)
class PropiedadAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'capacidad', 'precio_base_por_dia', 'ubicacion', 'esta_activa', 'fecha_creacion']
    list_filter = ['tipo', 'esta_activa']
    search_fields = ['nombre', 'ubicacion']
    list_editable = ['esta_activa']
    readonly_fields = ['fecha_creacion']
    fieldsets = (
        ('Información general', {
            'fields': ('nombre', 'tipo', 'descripcion', 'ubicacion')
        }),
        ('Capacidad y precio', {
            'fields': ('capacidad', 'precio_base_por_dia')
        }),
        ('Estado', {
            'fields': ('esta_activa', 'fecha_creacion')
        }),
    )