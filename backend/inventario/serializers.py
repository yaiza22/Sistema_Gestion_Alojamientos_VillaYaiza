from rest_framework import serializers
from .models import ItemInventario

class ItemInventarioSerializer(serializers.ModelSerializer):
    categoria_display = serializers.SerializerMethodField()
    estado_display    = serializers.SerializerMethodField()
    propiedad_nombre  = serializers.SerializerMethodField()

    class Meta:
        model = ItemInventario
        fields = [
            'id', 'propiedad', 'propiedad_nombre', 'nombre', 'categoria', 'categoria_display', 'descripcion',
            'cantidad', 'cantidad_disponible', 'costo_unitario', 'foto', 'esta_danado', 'notas_dano', 'estado',
            'estado_display', 'notas', 'fecha_creacion',
        ]
        read_only_fields = ['id', 'fecha_creacion']

    def get_categoria_display(self, obj):
        return obj.get_categoria_display()

    def get_estado_display(self, obj):
        return obj.get_estado_display()

    def get_propiedad_nombre(self, obj):
        return obj.propiedad.nombre