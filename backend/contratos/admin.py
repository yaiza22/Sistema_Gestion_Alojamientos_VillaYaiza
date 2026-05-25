from django.contrib import admin
from .models import Contrato

@admin.register(Contrato)
class ContratoAdmin(admin.ModelAdmin):
    list_display = ['reserva', 'token_publico', 'fecha_generacion', 'fue_descargado', 'fecha_descarga']
    list_filter = ['fue_descargado']
    search_fields = ['reserva__cliente__nombre']
    readonly_fields = ['token_publico', 'fecha_generacion']
    fieldsets = (
        ('Información general', {
            'fields': ('reserva', 'token_publico', 'fecha_generacion')
        }),
        ('Descarga', {
            'fields': ('fue_descargado', 'fecha_descarga')
        }),
    )