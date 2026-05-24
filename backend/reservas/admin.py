from django.contrib import admin
from .models import Cliente, Reserva, Pago, ChecklistItem, CostoDanio

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo_documento', 'numero_documento', 'telefono', 'email', 'fecha_creacion']
    search_fields = ['nombre', 'numero_documento', 'telefono', 'email']
    readonly_fields = ['fecha_creacion']
    fieldsets = (
        ('Información personal', {
            'fields': ('nombre', 'tipo_documento', 'numero_documento')
        }),
        ('Contacto', {
            'fields': ('telefono', 'email')
        }),
        ('Registro', {
            'fields': ('fecha_creacion',)
        }),
    )


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ['id', 'cliente', 'propiedad', 'fecha_inicio', 'fecha_fin', 'cant_asistentes', 'personas_cobradas', 
                    'temporada', 'estado', 'precio_calculado', 'precio_total', 'precio_modificado_manualmente', 'fecha_creacion']
    list_filter = ['estado', 'temporada', 'propiedad', 'precio_modificado_manualmente']
    search_fields = ['cliente__nombre', 'propiedad__nombre', 'cliente__numero_documento']
    readonly_fields = ['fecha_creacion']
    fieldsets = (
        ('Información general', {
            'fields': ('cliente', 'propiedad', 'cant_asistentes', 'temporada', 'estado')
        }),
        ('Fechas y horarios', {
            'fields': ('fecha_inicio', 'fecha_fin', 'hora_entrada_estimada', 'hora_salida_estimada', 'hora_entrada_real', 'hora_salida_real')
        }),
        ('Cálculo de precio', {
            'fields': ('precio_base_usado', 'personas_cobradas', 'cobrar_capacidad_total', 'descuento_tipo', 
                       'descuento_valor', 'precio_calculado', 'precio_total', 'precio_modificado_manualmente')
        }),
        ('Notas', {
            'fields': ('notas',)
        }),
        ('Registro', {
            'fields': ('fecha_creacion',)
        }),
    )

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ['reserva', 'monto', 'metodo', 'banco', 'es_devolucion', 'fecha_pago', 'notas']
    list_filter = ['metodo', 'banco', 'es_devolucion'] 
    search_fields = ['reserva__cliente__nombre']

# RevisioInventario se convirtió en ChecklistItem
@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['reserva', 'item', 'incluido_en_checkin', 'estado_entrada', 'estado_salida', 'tiene_costo', 'costo_a_cobrar']
    list_filter = ['incluido_en_checkin', 'estado_entrada', 'estado_salida', 'tiene_costo']
    search_fields = ['reserva__cliente__nombre', 'item__nombre']
    readonly_fields = ['fecha_checkin', 'fecha_checkout']


@admin.register(CostoDanio)
class CostoDanioAdmin(admin.ModelAdmin):
    list_display = ['reserva', 'items_danados', 'items_perdidos', 'items_incompletos', 'total_calculado', 'total_a_cobrar', 'cobrado', 'fecha']
    list_filter = ['cobrado']
    search_fields = ['reserva__cliente__nombre']
    readonly_fields = ['fecha']