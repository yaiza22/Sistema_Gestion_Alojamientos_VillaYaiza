from rest_framework import serializers
from .models import UsuarioPersonalizado, PermisosUsuario


class PermisosSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermisosUsuario
        # id y usuario se manejan internamente, entonces se excluyen
        exclude = ['id', 'usuario']


class UsuarioSerializer(serializers.ModelSerializer):
    permisos = PermisosSerializer()
    # Campos de solo lectura calculados
    nombre_completo = serializers.SerializerMethodField()
    rol_display = serializers.SerializerMethodField()

    class Meta:
        model = UsuarioPersonalizado
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'nombre_completo',
            'telefono',
            'tipo_documento',
            'numero_documento',
            'rol',
            'rol_display',
            #'foto',
            'is_active',
            'date_joined',
            'permisos',
        ]
        # Estos campos nunca se devuelven al frontend
        read_only_fields = ['id', 'date_joined']

    def get_nombre_completo(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_rol_display(self, obj):
        return obj.get_rol_display()


class CrearUsuarioSerializer(serializers.ModelSerializer):
    # Serializer para crear usuarios, se manejan los permisos iniciales.
    
    permisos = PermisosSerializer()
    password = serializers.CharField(write_only=True, min_length=8)
    confirmar_password = serializers.CharField(write_only=True)

    class Meta:
        model = UsuarioPersonalizado
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'telefono',
            'tipo_documento',
            'numero_documento',
            'rol',
            #'foto',
            'password',
            'confirmar_password',
            'permisos',
        ]

    def validate(self, data):
        if data['password'] != data['confirmar_password']:
            raise serializers.ValidationError({
                'confirmar_password': 'Las contraseñas no coinciden.'
            })
        return data

    def validate_email(self, value):
        if UsuarioPersonalizado.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este email ya está registrado.')
        return value

    def validate_username(self, value):
        if UsuarioPersonalizado.objects.filter(username=value).exists():
            raise serializers.ValidationError('Este nombre de usuario ya existe.')
        return value

    def create(self, validated_data):
        permisos_data = validated_data.pop('permisos')
        validated_data.pop('confirmar_password')
        password = validated_data.pop('password')

        # set_password para que la contraseña quede hasheada correctamente en la BD
        usuario = UsuarioPersonalizado(**validated_data)
        usuario.set_password(password)
        usuario.save()

        # post_save ya creó el objeto PermisosUsuario, entonces se actualizan los permisos
        PermisosUsuario.objects.filter(usuario=usuario).update(**permisos_data)

        return usuario


class EditarUsuarioSerializer(serializers.ModelSerializer):
    #Hay un endpoint separado para la contraseña
    permisos = PermisosSerializer()

    class Meta:
        model = UsuarioPersonalizado
        fields = [
            'email',
            'first_name',
            'last_name',
            'telefono',
            'tipo_documento',
            'numero_documento',
            'rol',
            #'foto',
            'is_active',
            'permisos',
        ]

    def validate_email(self, value):
        usuario_actual = self.instance
        if UsuarioPersonalizado.objects.filter(email=value).exclude(pk=usuario_actual.pk).exists():
            raise serializers.ValidationError('Este email ya está registrado.')
        return value

    def update(self, instance, validated_data):
        permisos_data = validated_data.pop('permisos', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if permisos_data:
            PermisosUsuario.objects.filter(usuario=instance).update(**permisos_data)

        return instance


class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(write_only=True)
    password_nuevo = serializers.CharField(write_only=True, min_length=8)
    confirmar_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password_nuevo'] != data['confirmar_password']:
            raise serializers.ValidationError({
                'confirmar_password': 'Las contraseñas no coinciden.'
            })
        return data