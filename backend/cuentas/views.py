#from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def hello_world(request):
    return Response({'mensaje': 'Backend conectado correctamente', 'status': 'ok'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'rol': user.rol,
        'nombre': f"{user.first_name} {user.last_name}".strip()
    })