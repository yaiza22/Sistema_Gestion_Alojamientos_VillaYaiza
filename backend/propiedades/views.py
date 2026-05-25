from rest_framework import generics, filters
from .models import Propiedad
from .serializers import PropiedadSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

def tiene_permiso_propiedad(usuario, accion):
    if usuario.rol == 'propietario':
        return True
    return getattr(usuario.permisos, f'propiedades_{accion}', False)

class PropiedadListCreateView(generics.ListCreateAPIView):
    serializer_class = PropiedadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'tipo', 'ubicacion']

    def get_queryset(self):
        if not tiene_permiso_propiedad(self.request.user, 'ver'):
            return Propiedad.objects.none()
        return Propiedad.objects.all().order_by('nombre')
    
    def perform_create(self, serializer):
        if not tiene_permiso_propiedad(self.request.user, 'crear'):
            raise PermissionDenied('No tienes permiso para crear propiedades.')
        serializer.save()

class PropiedadDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Propiedad.objects.all()
    serializer_class = PropiedadSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        if not tiene_permiso_propiedad(request.user, 'editar'):
            raise PermissionDenied('No tienes permiso para editar propiedades.')
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not tiene_permiso_propiedad(request.user, 'eliminar'):
            raise PermissionDenied('No tienes permiso para eliminar propiedades.')
        return super().destroy(request, *args, **kwargs)