from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Cliente
from .serializers import ClienteSerializer

def tiene_permiso_cliente(usuario, accion):
    if usuario.rol == 'propietario':
        return True
    return getattr(usuario.permisos, f'clientes_{accion}', False)

class ClienteListCreateView(generics.ListCreateAPIView):
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'email', 'numero_documento', 'telefono']

    def get_queryset(self):
        if not tiene_permiso_cliente(self.request.user, 'ver'):
            return Cliente.objects.none()
        return Cliente.objects.all().order_by('nombre')

    def perform_create(self, serializer):
        # Solo bloquear si no tiene permiso de clientes NI de reservas
        tiene_clientes = tiene_permiso_cliente(self.request.user, 'crear')
        tiene_reservas = getattr(
            self.request.user.permisos, 'reservas_crear', False
        )
        if not tiene_clientes and not tiene_reservas:
            raise PermissionDenied('No tienes permiso para crear clientes.')
        serializer.save()

class ClienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        if not tiene_permiso_cliente(request.user, 'editar'):
            raise PermissionDenied('No tienes permiso para editar clientes.')
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not tiene_permiso_cliente(request.user, 'eliminar'):
            raise PermissionDenied('No tienes permiso para eliminar clientes.')
        return super().destroy(request, *args, **kwargs)