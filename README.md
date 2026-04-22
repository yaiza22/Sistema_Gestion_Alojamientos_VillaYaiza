#  Sistema de Gestión de Alojamientos — Villa Yaiza

> Sistema web interno para la administración centralizada de reservas, contratos, pagos e inventario de **Alojamientos Villa Yaiza**, un negocio familiar de alquiler de fincas con fines turísticos.



---

##  Contexto del proyecto

**Alojamientos Villa Yaiza** es un negocio familiar dedicado al alquiler de propiedades con fines turísticos (eventos, vacaciones y fiestas), cuya propiedad principal es la finca *Villa Yaiza*. Actualmente, toda la administración se realiza de forma manual: las reservas se registran por WhatsApp o agenda, los contratos se elaboran con plantillas básicas y el inventario se lleva de manera informal.

Este sistema centraliza la operación en una plataforma web accesible desde cualquier dispositivo, con soporte **offline** dado que la finca presenta problemas de señal.

**Stakeholder principal:** Ana Lucía Dueñez Vanegas — administradora del negocio y responsable de validar los avances del producto.

### Problemas que resuelve

| Problema actual | Solución implementada |
|---|---|
| Reservas dispersas en WhatsApp y agenda | Calendario digital con gestión centralizada |
| Contratos elaborados manualmente | Generación automática de contratos en PDF |
| Sin reportes de ingresos | Reportes financieros con gráficas y exportación PDF |
| Inventario informal o inexistente | Módulo CRUD con control de daños y checklists |
| Sin acceso desde la finca (sin señal) | PWA con funcionamiento offline y sincronización automática |

---

##  Módulos del sistema

### Reservas
Gestión completa del ciclo de una reserva: registro de clientes, fechas, propiedades, estados (check-in / check-out) y cálculo automático de precios según temporada. Incluye calendario digital interactivo.

### Contratos
Generación automática de contratos en PDF a partir de los datos de cada reserva usando **WeasyPrint**. Elimina la elaboración manual y reduce demoras.

### Pagos y Reportes
Registro y control de ingresos asociados a las reservas. Generación de reportes con gráficas (Recharts) y exportación a PDF.

### Inventario
Control de ítems de la finca y apartamentos clasificados por categoría: registro, estado, cantidad, daños y costos asociados. Incluye checklists dinámicos por propiedad.

### Cuentas
Autenticación segura con JWT + Refresh Token. Soporta tres roles: `admin`, `asistente` y `empleado`, cada uno con distintos niveles de acceso.

---

##  Estructura del repositorio

```
SISTEMA_GESTION_ALOJAMIENTOS_VILLAYAIZA/
│
├── backend/                        # API REST con Django
│   ├── config/                     # Configuración global (settings, urls, wsgi)
│   ├── contratos/                  # Generación de contratos PDF
│   ├── cuentas/                    # Usuarios, roles y autenticación JWT
│   ├── inventario/                 # Control de ítems por propiedad
│   ├── propiedades/                # Registro de alojamientos
│   ├── reportes/                   # Reportes financieros y de operación
│   ├── reservas/                   # Reservas, clientes y pagos
│   ├── .env                        # Variables de entorno (no se versiona)
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                       # SPA con React + Vite
│   ├── public/                     # Archivos estáticos
│   └── src/
│       ├── paginas/                # Vistas principales (Login, Panel)
│       ├── proteccion/             # Protección de rutas privadas
│       ├── rutas/                  # Configuración de rutas
│       ├── services/               # Cliente Axios + interceptores JWT
│       ├── App.jsx
│       └── main.jsx
│
└── .gitignore
```

 Documentación detallada de cada parte:
- [README del backend](./backend/README.md)
- README del frontend *(próximamente)*

---

##  Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Django + Django REST Framework | 5.2 / 3.17 |
| Frontend | React + Vite | 18.3.1 / 5.4.21 |
| Gráficas | Recharts | 3.8.1 |
| HTTP client | Axios | 1.15.1 |
| Estilos | Tailwind CSS | 3.4.19 |
| PWA / Offline | Workbox | 5.4.21 |
| Autenticación | JWT (djangorestframework-simplejwt) | 5.5.1 |
| Generación PDF | WeasyPrint | 68.1 |
| Base de datos (dev) | SQLite | — |
| Base de datos (prod) | PostgreSQL en Neon | — |
| Hosting frontend | Vercel | — |
| Hosting backend | Render | — |

---

##  Arquitectura de comunicación

```
React (frontend)
     │
     │  import api from '../services/api'
     │  api.get('/clientes/')
     │
     ▼
services/api.js
     │  baseURL: '/api'
     │  + token JWT automático en cada petición
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

##  Autenticación

El sistema usa **JWT (JSON Web Tokens)** con el siguiente flujo:

1. El usuario ingresa sus credenciales en `/` (página de login)
2. El frontend envía `POST /api/token/` al backend
3. El backend devuelve `accessToken` y `refreshToken`
4. Ambos tokens se almacenan en `localStorage`
5. Cada petición incluye el `accessToken` en el header `Authorization: Bearer <token>`
6. Si el token no existe o expira, el usuario es redirigido automáticamente al login

Los roles disponibles son `admin`, `asistente` y `empleado`, definidos en el modelo de usuario del backend.

---

##  Inicio rápido

### Backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env                            # Configurar variables
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

El proxy de Vite redirige automáticamente las peticiones `/api/*` al backend en `http://localhost:8000` durante el desarrollo.

Para instrucciones detalladas consulta el [README del backend](./backend/README.md).

---

##  Estado general del proyecto

| Módulo / Componente | Estado |
|---|---|
| Modelos de datos (todos los módulos) | ✅ Completo |
| Panel Django Admin | ✅ Funcional |
| Endpoint de prueba y perfil de usuario | ✅ Activo |
| Conexión frontend ↔ backend | ✅ Establecida |
| Login con JWT y protección de rutas | ✅ Implementado |
| Dashboard principal (Panel) | ✅ En curso |
| API REST — serializers y endpoints | 🔄 En desarrollo |
| Módulo de reservas (frontend + backend) | 🔄 En desarrollo |
| Generación de contratos PDF | ⏳ Pendiente |
| Reportes con gráficas | ⏳ Pendiente |
| PWA / soporte offline con Workbox | ⏳ Pendiente |
| Migración a PostgreSQL (Neon) | ⏳ Pendiente |
| Despliegue en Render + Vercel | ⏳ Pendiente |

---



**Materia:** Ingeniería de Software
**Stakeholder:** Ana Lucía Dueñez Vanegas — Administradora, Alojamientos Villa Yaiza

---

##  Licencia

Proyecto académico desarrollado para la materia de Ingeniería de Software. Todos los derechos sobre el nombre y marca *Villa Yaiza* pertenecen a sus propietarios.
