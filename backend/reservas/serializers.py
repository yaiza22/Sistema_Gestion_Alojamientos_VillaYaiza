from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'id',
            'nombre',
            'telefono',
            'email',
            'tipo_documento',
            'numero_documento',
            'fecha_creacion',
        ]
        read_only_fields = ['id', 'fecha_creacion']
