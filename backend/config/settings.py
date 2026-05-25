from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework', #
    'corsheaders', #
    'cuentas', #
    'propiedades', #
    'reservas', #
    'contratos', #
    'inventario', #
    'reportes', #
    'social_django',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', #
    
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', #Solo para producción, no afecta desarrollo
    
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS - HIBRIDO, deploy and debug
CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173"
).split(",")
CORS_ALLOW_CREDENTIALS = True

# REST Framework + JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Para producción (Neon - postgres) y desarrollo (SQLite)
if os.getenv("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.config(
            default=os.getenv("DATABASE_URL"),
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'es-co'

TIME_ZONE = 'America/Bogota'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# Archivos estáticos y media (para imágenes de inventario)
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'
# Esto no rompe desarrollo, ayuda a Render
STATICFILES_STORAGE = (
    'whitenoise.storage.CompressedManifestStaticFilesStorage'
)

if os.getenv("CLOUDINARY_URL"):
    INSTALLED_APPS += [
        'cloudinary',
        'cloudinary_storage',
    ]

    DEFAULT_FILE_STORAGE = (
        'cloudinary_storage.storage.MediaCloudinaryStorage'
    )
else:
    #Imagenes van a backend/media
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

# Migraciones
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'cuentas.UsuarioPersonalizado'

########### LOGIN GOOGLE
# Auth backends — agrega Google al backend de autenticación
AUTHENTICATION_BACKENDS = [
    'social_core.backends.google.GoogleOAuth2',
    'django.contrib.auth.backends.ModelBackend',
]

SOCIAL_AUTH_JSONFIELD_ENABLED = True

# URLs de social-auth
SOCIAL_AUTH_URL_PREFIX = 'auth'

# Credenciales de Google
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY    = os.getenv('GOOGLE_CLIENT_ID')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

# Qué datos pedir a Google
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
]

# Pipeline personalizado para crear UsuarioPersonalizado
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
    'cuentas.pipeline.guardar_datos_google',  # ← pipeline personalizado
)

# Redirigir al frontend después del login con Google
#SOCIAL_AUTH_LOGIN_REDIRECT_URL  = 'http://localhost:5173/auth/callback'
SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/api/auth/google/callback-jwt/'
SOCIAL_AUTH_LOGIN_ERROR_URL = (
    f"{FRONTEND_URL}/?error=google"
)

# Usar nuestro modelo de usuario personalizado
SOCIAL_AUTH_USER_MODEL = 'cuentas.UsuarioPersonalizado'