from django.contrib import admin
from .models import ItemInventario

@admin.register(ItemInventario)
class ItemInventarioAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'propiedad', 'cantidad', 'cantidad_disponible', 'costo_unitario', 'esta_danado', 'estado', 'fecha_creacion']
    list_filter = ['estado', 'esta_danado', 'propiedad']
    search_fields = ['nombre', 'descripcion']
    list_editable = ['estado', 'esta_danado']
    readonly_fields = ['fecha_creacion']
    fieldsets = (
        ('Información general', {
            'fields': ('propiedad', 'nombre', 'descripcion', 'foto')
        }),
        ('Cantidad y costo', {
            'fields': ('cantidad', 'cantidad_disponible', 'costo_unitario')
        }),
        ('Estado', {
            'fields': ('estado', 'esta_danado', 'notas_dano', 'notas', 'fecha_creacion')
        }),
    )