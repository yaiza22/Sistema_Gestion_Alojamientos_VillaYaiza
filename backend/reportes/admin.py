from django.contrib import admin
from .models import Reporte

@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'tipo', 'fecha_generacion']
    list_filter = ['tipo']
    search_fields = ['titulo']
    readonly_fields = ['fecha_generacion']