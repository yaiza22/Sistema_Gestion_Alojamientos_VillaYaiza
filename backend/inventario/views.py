from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import ItemInventario
from .serializers import ItemInventarioSerializer

def tiene_permiso_inventario(usuario, accion):
    if usuario.rol == 'propietario':
        return True
    return getattr(usuario.permisos, f'inventario_{accion}', False)


class ItemListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemInventarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'categoria', 'estado', 'propiedad__nombre']

    def get_queryset(self):
        if not tiene_permiso_inventario(self.request.user, 'ver'):
            return ItemInventario.objects.none()
        queryset = ItemInventario.objects.select_related('propiedad').all()
        # Busca por propiedad: /api/inventario/?propiedad=1
        propiedad_id = self.request.query_params.get('propiedad')
        if propiedad_id:
            queryset = queryset.filter(propiedad_id=propiedad_id)
        return queryset

    def perform_create(self, serializer):
        if not tiene_permiso_inventario(self.request.user, 'crear'):
            raise PermissionDenied('No tienes permiso para crear ítems.')
        serializer.save()


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ItemInventario.objects.select_related('propiedad').all()
    serializer_class = ItemInventarioSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        if not tiene_permiso_inventario(request.user, 'editar'):
            raise PermissionDenied('No tienes permiso para editar ítems.')
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not tiene_permiso_inventario(request.user, 'eliminar'):
            raise PermissionDenied('No tienes permiso para eliminar ítems.')
        return super().destroy(request, *args, **kwargs)