from rest_framework import serializers
from .models import Reporte

class ReporteSerializer(serializers.ModelSerializer):
    generado_por_nombre = serializers.SerializerMethodField()
    tipo_display = serializers.SerializerMethodField()

    class Meta:
        model = Reporte
        fields = [
            'id', 'titulo', 'tipo', 'tipo_display',
            'fecha_generacion', 'filtros', 'generado_por_nombre',
        ]
        read_only_fields = ['id', 'fecha_generacion']

    def get_generado_por_nombre(self, obj):
        return obj.generado_por.get_full_name() or obj.generado_por.username if obj.generado_por else "—"

    def get_tipo_display(self, obj):
        return obj.get_tipo_display()