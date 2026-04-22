# Frontend — Sistema de Gestión de Alojamientos Villa Yaiza

Interfaz web desarrollada para el sistema de gestión interno de Alojamientos Villa Yaiza. Actualmente implementa autenticación JWT, rutas protegidas y un panel administrativo con estadísticas, gráficas de ocupación y acciones rápidas.


## Dependencias principales

| Paquete | Versión | Uso |
|--------|---------|-----|
| React | 18.x | Framework principal |
| Axios | 1.15.1 | Consumo de API REST |
| Tailwind CSS | 3.4.19 | Estilos y diseño |
| Recharts | 3.8.1 | Gráficas y visualización de datos |
| Vite | 5.4.21 | Bundler y servidor de desarrollo |
| vite-plugin-pwa | 0.17.5 | Soporte PWA |
| Workbox | 7.4.0 | Funcionalidad offline y caché |

## Instalación y ejecución

### 1. Clonar el repositorio y entrar al frontend

git clone https://github.com/tu-usuario/sistema-gestion-alojamientos-villayaiza.git
cd sistema-gestion-alojamientos-villayaiza/frontend

### 2. Instalar dependencias

npm install

### 3. Configurar variables de entorno

Crea un archivo ".env" en la raíz del frontend con el siguiente contenido:

VITE_API_URL=http://localhost:8000

### 4. Ejecutar el servidor de desarrollo

npm run dev

| Ruta | Descripción |
|------|-------------|
| http://localhost:5173/ | Página de inicio de sesión |
| http://localhost:5173/panel | Panel administrativo (requiere JWT) |

## Estructura del frontend

frontend/
│
├── public/                
│
└── src/
    ├── paginas/              
    │   ├── InicioSesion.jsx  
    │   └── Panel.jsx         # Dashboard con estadísticas y gráficas
    │
    ├── proteccion/           # Control de acceso
    │   └── RutaProtegida.jsx # Redirige al login si no hay JWT
    │
    ├── rutas/                # Configuración de rutas
    │   └── RutasApp.jsx      # Define rutas públicas y privadas
    │
    ├── services/             # Configuración de Axios
    │   └── api.js            # baseURL + interceptor JWT automático
    │
    ├── App.jsx               # Componente raíz
    ├── main.jsx              # Punto de entrada
    └── index.css             # Estilos globales

## Conexión con el backend


React (frontend)
     │
     │  import api from '../services/api'
     │  api.get('/clientes/')
     │
     ▼
services/api.js
     │  baseURL: '/api'
     │  + token JWT automático
     │
     ▼
vite.config.js (proxy)
     │  /api → http://localhost:8000
     │
     ▼
Django (backend)
     │
     │  config/urls.py
     │  path('api/clientes/', ...)
     │
     ▼
     │  views.py
     │  procesa la petición
     │
     ▼
     │  serializers.py
     │  convierte modelo a JSON
     │
     ▼
React recibe el JSON
y lo muestra en pantalla


## Endpoints consumidos

| Método | Ruta | Descripción | Auth | Estado |
|--------|------|-------------|:----:|--------|
| POST | /api/token/ | Login — obtiene "access" y "refresh" token |
| GET | /api/auth/google/ | Inicio de sesión con Google OAuth | 
| GET | /api/perfil/ | Datos del usuario autenticado |

## Autenticación JWT

1. El usuario inicia sesión en "/"
2. El backend devuelve "accessToken" y "refreshToken"
3. Ambos tokens se guardan en "localStorage"
4. Cada petición incluye el "accessToken" en el header "Authorization: Bearer <token>"
5. Si no hay token, "RutaProtegida.jsx" redirige automáticamente al login

---

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|------|------------|--------|
| "/" | "InicioSesion" | Público |
| "/panel" | "Panel" |  Privado (requiere JWT) |


## Próximos pasos

1. Implementar módulo de reservas conectado al backend
2. Implementar módulo de clientes conectado al backend
3. Implementar módulo de inventario conectado al backend
4. Integrar generación y descarga de contratos PDF
5. Implementar módulo de reportes con filtros
