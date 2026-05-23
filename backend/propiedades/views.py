from rest_framework import generics, filters
from .models import Propiedad
from .serializers import PropiedadSerializer

class PropiedadListCreateView(generics.ListCreateAPIView):
    queryset = Propiedad.objects.all().order_by('nombre')
    serializer_class = PropiedadSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'tipo', 'ubicacion']

class PropiedadDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Propiedad.objects.all()
    serializer_class = PropiedadSerializer