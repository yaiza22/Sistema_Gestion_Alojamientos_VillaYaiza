from rest_framework import serializers
from .models import Propiedad

class PropiedadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Propiedad
        fields = [
            'id',
            'nombre',
            'tipo',
            'descripcion',
            'capacidad',
            'ubicacion',
            'precio_base_por_dia',
            'precio_temporada_baja',
            'precio_temporada_alta',
            'esta_activa',
            'fecha_creacion',
        ]
        read_only_fields = ['id', 'fecha_creacion']