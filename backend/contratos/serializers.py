from rest_framework import serializers
from .models import Contrato

class ContratoSerializer(serializers.ModelSerializer):
    url_publica = serializers.SerializerMethodField()
    cliente_nombre = serializers.SerializerMethodField()
    propiedad_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Contrato
        fields = ['id', 'reserva', 'token_publico', 'url_publica', 'fecha_generacion', 'fue_descargado', 'fecha_descarga', 
                  'notas_adicionales', 'cliente_nombre', 'propiedad_nombre',]
        read_only_fields = ['id', 'token_publico', 'fecha_generacion', 'fecha_descarga']

    def get_url_publica(self, obj):
        return obj.url_publica

    def get_cliente_nombre(self, obj):
        return obj.reserva.cliente.nombre

    def get_propiedad_nombre(self, obj):
        return obj.reserva.propiedad.nombre