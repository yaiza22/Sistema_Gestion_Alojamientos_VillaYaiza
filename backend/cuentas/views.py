from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
#from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import UsuarioPersonalizado, PermisosUsuario
from .serializers import ( UsuarioSerializer, CrearUsuarioSerializer, EditarUsuarioSerializer, CambiarPasswordSerializer, )
# Google
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
from django.contrib.auth import get_user_model

def google_callback(request):
    user = request.user

    if not user or not user.is_authenticated:
        return redirect(f'{settings.FRONTEND_URL}/?error=google')

    refresh = RefreshToken.for_user(user)
    access_token  = str(refresh.access_token)
    refresh_token = str(refresh)

    return redirect(
        f'{settings.FRONTEND_URL}/auth/callback'
        f'?access={access_token}&refresh={refresh_token}'
    )

def puede_gestionar_usuarios(usuario):
    return usuario.rol in ('propietario', 'asistente')

def es_propietario(usuario):
    return usuario.rol == 'propietario'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mi_perfil(request):
    serializer = UsuarioSerializer(request.user)
    return Response(serializer.data)


###### CRUD Usuarios del sistema

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def listar_crear_usuarios(request):
    if not puede_gestionar_usuarios(request.user):
        return Response(
            {'error': 'No tienes permiso para gestionar usuarios.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        usuarios = UsuarioPersonalizado.objects.select_related('permisos').all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        datos = request.data.copy()
        if datos.get('rol') == 'propietario' and not es_propietario(request.user):
            return Response(
                {'error': 'Solo el rol propietario puede crear usuarios.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CrearUsuarioSerializer(data=datos)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response(
                UsuarioSerializer(usuario).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def detalle_usuario(request, pk):
    if not puede_gestionar_usuarios(request.user):
        return Response(
            {'error': 'No tienes permiso para gestionar usuarios.'},
            status=status.HTTP_403_FORBIDDEN
        )

    usuario = get_object_or_404(
        UsuarioPersonalizado.objects.select_related('permisos'), pk=pk
    )

    if request.method == 'GET':
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)

    if request.method == 'PUT':
        if es_propietario(usuario) and not es_propietario(request.user):
            return Response(
                {'error': 'No puedes editar el perfil de rol propietario'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.data.get('rol') == 'propietario' and not es_propietario(request.user):
            return Response(
                {'error': 'Solo el rol propietario puede asignar ese rol.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = EditarUsuarioSerializer(usuario, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UsuarioSerializer(usuario).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        if es_propietario(usuario):
            return Response(
                {'error': 'No se puede eliminar a un usuario con rol propietario.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if usuario.pk == request.user.pk:
            return Response(
                {'error': 'No puedes eliminar tu propio usuario.'},
                status=status.HTTP_403_FORBIDDEN
            )
        usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_password(request, pk):
    usuario = get_object_or_404(UsuarioPersonalizado, pk=pk)
    
    if usuario.pk != request.user.pk and not es_propietario(request.user):
        return Response(
            {'error': 'No tienes permiso para cambiar esta contraseña.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = CambiarPasswordSerializer(data=request.data)
    if serializer.is_valid():
        if not usuario.check_password(serializer.validated_data['password_actual']):
            return Response(
                {'error': 'La contraseña actual es incorrecta.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        usuario.set_password(serializer.validated_data['password_nuevo'])
        usuario.save()
        return Response({'mensaje': 'Contraseña actualizada correctamente.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vista de prueba
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hello_world(request):
    return Response({"mensaje": "Hola, BD desde Django con JWT conectado."})

