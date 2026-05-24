from django.urls import path
from .views import PropiedadListCreateView, PropiedadDetailView

urlpatterns = [
    path('', PropiedadListCreateView.as_view(), name='propiedad-list-create'),
    path('<int:pk>/', PropiedadDetailView.as_view(), name='propiedad-detail'),
]