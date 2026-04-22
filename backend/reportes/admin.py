from django.contrib import admin
from .models import Reporte

@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'tipo', 'generado_por', 'fecha_generacion']
    list_filter = ['tipo', 'generado_por']
    search_fields = ['titulo']
    readonly_fields = ['fecha_generacion']
    fieldsets = (
        ('Información general', {
            'fields': ('titulo', 'tipo', 'generado_por')
        }),
        ('Detalles', {
            'fields': ('filtros', 'fecha_generacion')
        }),
    )