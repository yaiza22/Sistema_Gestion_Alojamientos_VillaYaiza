# Sistema de Gestión de Alojamientos — Villa Yaiza

Sistema web para la administración de reservas, clientes, propiedades, inventario y usuarios de Alojamientos Villa Yaiza, un negocio familiar de alquiler de fincas con fines turísticos.

---

## Contexto del proyecto

Alojamientos Villa Yaiza es un negocio dedicado al alquiler de propiedades para eventos, vacaciones y fiestas. Actualmente toda la administración se hace de forma manual: las reservas se registran por WhatsApp o agenda, los contratos se hacen con plantillas básicas y el inventario se lleva de manera informal.

Este sistema busca centralizar esa operación en una plataforma web accesible desde cualquier dispositivo.

**Stakeholder principal:** Ana Lucía Dueñez Vanegas — administradora del negocio.

### Problemas que resuelve

| Problema actual | Solución |
|---|---|
| Reservas dispersas en WhatsApp y agenda | Gestión centralizada de reservas |
| Contratos elaborados manualmente | Generación automática de contratos en PDF |
| Sin reportes de ingresos | Reportes financieros con gráficas |
| Inventario informal | Módulo CRUD con control de daños y checklists |
| Sin acceso desde la finca por falta de señal | PWA con funcionamiento offline |

---

## Módulos del sistema

### Clientes
Registro, consulta, actualización y eliminación de clientes con campos de nombre, teléfono, email, tipo y número de documento.

### Reservas
Gestión del ciclo completo de una reserva: fechas, propiedad, cliente, estado (pendiente, en curso, completada, cancelada) y cálculo de precios según temporada. Incluye checklist de inventario y vista de detalle.

### Propiedades
Administración de los alojamientos disponibles: nombre, tipo (finca, apartamento, cabaña), capacidad, ubicación y precios por temporada.

### Inventario
Control de ítems por propiedad: registro, estado, cantidad, daños y costos asociados.

### Usuarios
Autenticación con JWT. Maneja tres roles: `admin`, `asistente` y `empleado`, cada uno con distintos niveles de acceso. Incluye gestión de usuarios y cambio de contraseña.

### Contratos
Generación de contratos en PDF a partir de los datos de cada reserva usando WeasyPrint.

### Reportes
Reportes financieros con gráficas (Recharts) y exportación a PDF.

---

## Estructura del repositorio

```
SISTEMA_GESTION_ALOJAMIENTOS_VILLAYAIZA/
│
├── backend/                        # API REST con Django
│   ├── config/                     # Configuración global (settings, urls, wsgi, asgi)
│   ├── contratos/                  # Generación de contratos PDF
│   ├── cuentas/                    # Usuarios, roles y autenticación JWT
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── inventario/                 # Control de ítems por propiedad
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── propiedades/                # Registro de alojamientos
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── reportes/                   # Reportes financieros
│   ├── reservas/                   # Reservas, clientes y pagos
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── .env                        # Variables de entorno (no se versiona)
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                       # SPA con React + Vite
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── MatrizPermisos.jsx
│       │   └── RutaProtegida.jsx
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── AuthProvider.jsx
│       ├── hooks/
│       │   └── useAuth.js
│       ├── pages/
│       │   ├── clientes/
│       │   │   ├── FormularioClientes.jsx
│       │   │   └── ListaClientes.jsx
│       │   ├── inventario/
│       │   │   ├── FormularioInventario.jsx
│       │   │   └── ListaInventario.jsx
│       │   ├── propiedades/
│       │   │   ├── FormularioPropiedades.jsx
│       │   │   └── ListaPropiedades.jsx
│       │   ├── reservas/
│       │   │   ├── ChecklistReserva.jsx
│       │   │   ├── DetalleReserva.jsx
│       │   │   ├── FormularioReservas.jsx
│       │   │   └── ListaReservas.jsx
│       │   ├── usuarios/
│       │   │   ├── CambiarPassword.jsx
│       │   │   ├── FormularioUsuarios.jsx
│       │   │   └── ListaUsuarios.jsx
│       │   ├── inicioSesion.jsx
│       │   └── panel.jsx
│       ├── router/
│       │   └── RutasApp.jsx
│       ├── services/
│       │   ├── api.js
│       │   ├── clienteService.js
│       │   ├── inventarioService.js
│       │   ├── propiedadService.js
│       │   └── reservaService.js
│       ├── utils/
│       │   ├── calculadoraPrecio.js
│       │   └── permisos.js
│       ├── App.jsx
│       └── main.jsx
│
└── .gitignore
```

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Django + Django REST Framework | 6.0.4 / 3.x |
| Frontend | React + Vite | 18.x / 5.4.21 |
| Gráficas | Recharts | 3.8.1 |
| HTTP client | Axios | 1.15.1 |
| Estilos | Tailwind CSS | 3.4.19 |
| Animaciones | Framer Motion | latest |
| Autenticación | JWT (djangorestframework-simplejwt) | 5.x |
| Generación PDF | WeasyPrint | 68.1 |
| Base de datos (desarrollo) | SQLite | — |
| Base de datos (producción) | PostgreSQL en Neon | — |
| Hosting frontend | Vercel | — |
| Hosting backend | Render | — |

---

## Cómo funciona la comunicación frontend-backend

```
React (frontend)
     │
     │  import api from '../services/api'
     │  api.get('/clientes/')
     │
     ▼
services/api.js
     │  baseURL: '/api'
     │  + token JWT en cada petición
     │
     ▼
vite.config.js (proxy en desarrollo)
     │  /api → http://localhost:8000
     │
     ▼
Django (backend)
     │  config/urls.py → path('api/clientes/', ...)
     │  views.py → procesa la petición
     │  serializers.py → convierte modelo a JSON
     │
     ▼
React recibe el JSON y lo renderiza
```

---

## Autenticación

El sistema usa JWT con el siguiente flujo:

1. El usuario ingresa sus credenciales en `/`
2. El frontend envía `POST /api/token/` al backend
3. El backend devuelve `accessToken` y `refreshToken`
4. Los tokens se guardan en `localStorage`
5. Cada petición incluye el `accessToken` en el header `Authorization: Bearer <token>`
6. Si el token no existe o expira, el usuario es redirigido al login

Los roles disponibles son `admin`, `asistente` y `empleado`.

---

## Inicio rápido

### Backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El proxy de Vite redirige las peticiones `/api/*` al backend en `http://localhost:8000` durante el desarrollo.

---

## Variables de entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```
SECRET_KEY=django-insecure-clave-local-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

**Materia:** Ingeniería de Software
**Stakeholder:** Ana Lucía Dueñez Vanegas — Administradora, Alojamientos Villa Yaiza