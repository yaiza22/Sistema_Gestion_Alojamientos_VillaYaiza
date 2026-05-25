from .models import PermisosUsuario

def guardar_datos_google(backend, user, response, *args, **kwargs):
    # Si no tiene rol asignado, le pone empleado por defecto
    if not user.rol:
        user.rol = 'empleado'

    # Guarda nombre y foto de Google si no los tiene
    if backend.name == 'google-oauth2':
        if not user.first_name and response.get('given_name'):
            user.first_name = response.get('given_name', '')
        if not user.last_name and response.get('family_name'):
            user.last_name = response.get('family_name', '')

    user.save()

    # Crea los permisos si no existen (la señal lo hace al crear,
    # pero con Google a veces no se dispara correctamente)
    PermisosUsuario.objects.get_or_create(usuario=user)