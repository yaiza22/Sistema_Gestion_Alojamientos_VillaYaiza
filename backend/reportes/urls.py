from django.urls import path
from . import views

urlpatterns = [
    path('ingresos/',   views.reporte_ingresos,   name='reporte-ingresos'),
    path('ocupacion/',  views.reporte_ocupacion,  name='reporte-ocupacion'),
    path('inventario/', views.reporte_inventario, name='reporte-inventario'),
]