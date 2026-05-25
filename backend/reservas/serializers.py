from rest_framework import serializers
from .models import Cliente, Reserva, Pago, ChecklistItem, CostoDanio
from propiedades.models import Propiedad

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'telefono', 'email', 'tipo_documento', 'numero_documento', 'fecha_creacion',]
        read_only_fields = ['id', 'fecha_creacion']


class PagoSerializer(serializers.ModelSerializer):
    metodo_display = serializers.SerializerMethodField()
    class Meta:
        model = Pago
        fields = ['id', 'reserva', 'monto', 'fecha_pago', 'metodo', 'metodo_display', 'banco', 'es_devolucion', 'notas',]
        read_only_fields = ['id']

    def get_metodo_display(self, obj):
        return obj.get_metodo_display()


class ChecklistItemSerializer(serializers.ModelSerializer):
    item_nombre = serializers.SerializerMethodField()
    item_categoria = serializers.SerializerMethodField()
    item_cantidad_total = serializers.SerializerMethodField()
    item_costo_unitario = serializers.SerializerMethodField()

    class Meta:
        model = ChecklistItem
        fields = ['id', 'reserva', 'item', 'item_nombre', 'item_categoria', 'item_cantidad_total', 'item_costo_unitario',
                  'incluido_en_checkin', 'estado_entrada', 'cantidad_entregada', 'notas_entrada', 'fecha_checkin', 
                  'revisado_en_checkout', 'estado_salida', 'cantidad_devuelta', 'notas_salida', 'fecha_checkout',
                  'tiene_costo', 'costo_unitario_ref', 'costo_a_cobrar',]
        read_only_fields = ['id']

    def get_item_nombre(self, obj):
        return obj.item.nombre

    def get_item_categoria(self, obj):
        return obj.item.get_categoria_display()

    def get_item_cantidad_total(self, obj):
        return obj.item.cantidad_disponible

    def get_item_costo_unitario(self, obj):
        return obj.item.costo_unitario


class CostoDanioSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostoDanio
        fields = ['id', 'reserva', 'items_danados', 'items_perdidos', 'items_incompletos', 'total_calculado', 
                  'total_a_cobrar', 'cobrado', 'notas', 'fecha',]
        read_only_fields = ['id', 'fecha']


class ReservaSerializer(serializers.ModelSerializer):
    cliente_detalle = ClienteSerializer(source='cliente', read_only=True)
    propiedad_nombre = serializers.SerializerMethodField()
    propiedad_capacidad = serializers.SerializerMethodField()
    estado_display = serializers.SerializerMethodField()
    temporada_display = serializers.SerializerMethodField()
    pagos = PagoSerializer(many=True, read_only=True)
    checklist = ChecklistItemSerializer(many=True, read_only=True)
    costo_danio = CostoDanioSerializer(read_only=True)
    total_pagado = serializers.SerializerMethodField()
    saldo_pendiente = serializers.SerializerMethodField()
    dias = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = ['id', 'propiedad', 'propiedad_nombre', 'propiedad_capacidad', 'cliente', 'cliente_detalle', 'fecha_inicio', 
                  'fecha_fin', 'dias', 'hora_entrada_estimada', 'hora_salida_estimada', 'hora_entrada_real', 'hora_salida_real',
                  'cant_asistentes', 'personas_cobradas', 'cobrar_capacidad_total', 'temporada', 'temporada_display',
                  'precio_base_usado', 'descuento_tipo', 'descuento_valor', 'precio_calculado', 'precio_total', 
                  'precio_modificado_manualmente', 'estado', 'estado_display', 'notas', 'fecha_creacion', 'pagos', 
                  'total_pagado', 'saldo_pendiente', 'checklist', 'costo_danio',]
        read_only_fields = ['id', 'fecha_creacion']

    def get_propiedad_nombre(self, obj):
        return obj.propiedad.nombre

    def get_propiedad_capacidad(self, obj):
        return obj.propiedad.capacidad

    def get_estado_display(self, obj):
        return obj.get_estado_display()

    def get_temporada_display(self, obj):
        return obj.get_temporada_display() if obj.temporada else None

    def get_total_pagado(self, obj):
        return float(obj.total_pagado)

    def get_saldo_pendiente(self, obj):
        return float(obj.saldo_pendiente)

    def get_dias(self, obj):
        return obj.dias


class CrearReservaSerializer(serializers.ModelSerializer):
    cliente_nuevo = ClienteSerializer(required=False, write_only=True)

    class Meta:
        model = Reserva
        fields = ['propiedad', 'cliente', 'cliente_nuevo', 'fecha_inicio', 'fecha_fin', 'hora_entrada_estimada', 
                  'hora_salida_estimada', 'cant_asistentes', 'personas_cobradas', 'cobrar_capacidad_total',
                  'temporada', 'precio_base_usado', 'descuento_tipo', 'descuento_valor', 'precio_calculado', 
                  'precio_total', 'precio_modificado_manualmente', 'notas',]

    def validate(self, data):
        # Debe venir cliente existente o datos de cliente nuevo, no ambos
        cliente    = data.get('cliente')
        cliente_nuevo = data.get('cliente_nuevo')
        if not cliente and not cliente_nuevo:
            raise serializers.ValidationError({
                'cliente': 'Debes seleccionar un cliente o crear uno nuevo.'
            })
        if cliente and cliente_nuevo:
            raise serializers.ValidationError({
                'cliente': 'No puedes seleccionar un cliente y crear uno nuevo al mismo tiempo.'
            })

        # Validar fechas
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin    = data.get('fecha_fin')
        if fecha_inicio and fecha_fin:
            if fecha_fin <= fecha_inicio:
                raise serializers.ValidationError({
                    'fecha_fin': 'La fecha de fin debe ser posterior a la fecha de inicio.'
                })

        # Validar conflicto de fechas con otras reservas
        propiedad = data.get('propiedad')
        if propiedad and fecha_inicio and fecha_fin:
            reserva_id = self.instance.id if self.instance else None
            conflicto = Reserva.objects.filter(
                propiedad=propiedad,
                estado__in=['pendiente', 'en_curso'],
                fecha_inicio__lt=fecha_fin,
                fecha_fin__gt=fecha_inicio,
            )
            if reserva_id:
                conflicto = conflicto.exclude(id=reserva_id)
            if conflicto.exists():
                raise serializers.ValidationError({
                    'fecha_inicio': 'Ya existe una reserva en esas fechas para esta propiedad.'
                })

        return data

    def create(self, validated_data):
        cliente_nuevo_data = validated_data.pop('cliente_nuevo', None)
        if cliente_nuevo_data:
            cliente = Cliente.objects.create(**cliente_nuevo_data)
            validated_data['cliente'] = cliente
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('cliente_nuevo', None)
        return super().update(instance, validated_data)


class CancelarReservaSerializer(serializers.Serializer):
    OPCIONES = [
        ('sin_devolucion', 'Cancelar sin devolver dinero'),
        ('con_devolucion', 'Cancelar con devolución'),
        ('cambio_fechas', 'Cambiar fechas'),
    ]

    opcion = serializers.ChoiceField(choices=OPCIONES)
    monto_devolucion = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    metodo_devolucion = serializers.ChoiceField(choices=Pago.METODOS, required=False)
    nueva_fecha_inicio = serializers.DateField(required=False)
    nueva_fecha_fin = serializers.DateField(required=False)
    notas = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data['opcion'] == 'con_devolucion':
            if not data.get('monto_devolucion'):
                raise serializers.ValidationError({
                    'monto_devolucion': 'Debes indicar el monto a devolver.'
                })
            if not data.get('metodo_devolucion'):
                raise serializers.ValidationError({
                    'metodo_devolucion': 'Debes indicar el método de devolución.'
                })
        if data['opcion'] == 'cambio_fechas':
            if not data.get('nueva_fecha_inicio') or not data.get('nueva_fecha_fin'):
                raise serializers.ValidationError({
                    'nueva_fecha_inicio': 'Debes indicar las nuevas fechas.'
                })
        return data