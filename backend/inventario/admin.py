from django.contrib import admin
from .models import ItemInventario

@admin.register(ItemInventario)
class ItemInventarioAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'categoria', 'propiedad', 'cantidad', 'cantidad_disponible', 'costo_unitario', 'esta_danado', 'estado', 'fecha_creacion']
    list_filter = ['estado', 'esta_danado', 'categoria', 'propiedad']
    search_fields = ['nombre', 'descripcion']
    list_editable = ['estado', 'esta_danado', 'cantidad_disponible']
    readonly_fields = ['fecha_creacion']
    fieldsets = (
        ('Información general', {
            'fields': ('propiedad', 'nombre', 'categoria', 'descripcion', 'foto')
        }),
        ('Cantidad y costo', {
            'fields': ('cantidad', 'cantidad_disponible', 'costo_unitario')
        }),
        ('Estado', {
            'fields': ('estado', 'esta_danado', 'notas_dano', 'notas', 'fecha_creacion')
        }),
    )