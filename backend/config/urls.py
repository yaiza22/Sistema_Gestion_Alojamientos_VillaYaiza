from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps
    # Usuarios del sistema
    path('api/cuentas/', include('cuentas.urls')),

    # Propiedades
    path('api/propiedades/', include('propiedades.urls')),
    path('api/inventario/', include('inventario.urls')),

    #Reservas
    path('api/reservas/', include('reservas.urls')),

    #Contratos
    path('api/contratos/', include('contratos.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)