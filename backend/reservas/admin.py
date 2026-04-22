from django.contrib import admin
from .models import Cliente, Reserva, Pago, RevisionInventario

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
    list_display = ['id', 'cliente', 'propiedad', 'fecha_inicio', 'fecha_fin', 'cant_asistentes', 'temporada', 'estado', 'precio_total', 'fecha_creacion']
    list_filter = ['estado', 'temporada', 'propiedad']
    search_fields = ['cliente__nombre', 'cliente__numero_documento']
    readonly_fields = ['fecha_creacion']
    fieldsets = (
        ('Información general', {
            'fields': ('cliente', 'propiedad', 'cant_asistentes', 'temporada', 'estado')
        }),
        ('Fechas y horarios', {
            'fields': ('fecha_inicio', 'fecha_fin', 'hora_entrada_estimada', 'hora_salida_estimada', 'hora_entrada_real', 'hora_salida_real')
        }),
        ('Pago', {
            'fields': ('precio_total',)
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
    list_display = ['reserva', 'monto', 'metodo', 'banco', 'fecha_pago', 'notas']
    list_filter = ['metodo', 'banco']
    search_fields = ['reserva__cliente__nombre']

@admin.register(RevisionInventario)
class RevisionInventarioAdmin(admin.ModelAdmin):
    list_display = ['reserva', 'item', 'esta_danado', 'costo_reparacion', 'fecha_revision']
    list_filter = ['esta_danado']
    search_fields = ['reserva__cliente__nombre', 'item__nombre']
    readonly_fields = ['fecha_revision']