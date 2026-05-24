from rest_framework import serializers
from .models import Propiedad

class PropiedadSerializer(serializers.ModelSerializer):
    tipo_display = serializers.SerializerMethodField()

    class Meta:
        model = Propiedad
        fields = [
            'id',
            'nombre',
            'tipo',
            'tipo_display', 
            'descripcion',
            'capacidad',
            'ubicacion',
            'precio_base_por_dia',
            'precio_temporada_baja',
            'precio_temporada_alta',
            'esta_activa',
            'imagen',
            'fecha_creacion',
        ]
        read_only_fields = ['id', 'fecha_creacion']
    
    def get_tipo_display(self, obj):
        return obj.get_tipo_display()