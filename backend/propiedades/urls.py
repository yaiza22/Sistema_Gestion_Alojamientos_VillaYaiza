from django.urls import path
from .views import PropiedadListCreateView, PropiedadDetailView

urlpatterns = [
    path('propiedades/', PropiedadListCreateView.as_view(), name='propiedad-list-create'),
    path('propiedades/<int:pk>/', PropiedadDetailView.as_view(), name='propiedad-detail'),
]