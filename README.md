# Sistema de Gestión de Alojamientos — Villa Yaiza

Sistema web para la administración de reservas, clientes, propiedades, inventario y usuarios de Alojamientos Villa Yaiza, un negocio familiar de alquiler de fincas con fines turísticos.

> Para instrucciones detalladas de cada capa ver:
> - [`backend/README.md`](./backend/README.md)
> - [`frontend/README.md`](./frontend/README.md)

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

| Módulo | Descripción |
|---|---|
| **Clientes** | Registro, consulta, actualización y eliminación de clientes |
| **Reservas** | Ciclo completo de reserva con checklist de inventario y cálculo de precios por temporada |
| **Propiedades** | Administración de alojamientos disponibles con precios por temporada |
| **Inventario** | Control de ítems por propiedad: estado, cantidad, daños y costos |
| **Usuarios** | Autenticación JWT con roles `admin`, `asistente` y `empleado` |
| **Contratos** | Generación de contratos en PDF por reserva usando WeasyPrint |
| **Reportes** | Reportes financieros con gráficas (Recharts) y exportación a PDF |

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

## Estructura del repositorio

```
SISTEMA_GESTION_ALOJAMIENTOS_VILLAYAIZA/
│
├── README.md                       # Este archivo
├── backend/                        # API REST con Django
│   └── README.md
├── frontend/                       # SPA con React + Vite
│   └── README.md
└── .gitignore
```

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

## Despliegue del proyecto
 
### 1. Clonar el repositorio
 
```bash
git clone https://github.com/yaiza22/Sistema_Gestion_Alojamientos_VillaYaiza.git
cd Sistema_Gestion_Alojamientos_VillaYaiza
```
 
### 2. Ir a rama develop
 
```bash
git checkout develop
```
 
### 3. Crear entorno virtual
 
```bash
python -m venv venv
venv\Scripts\activate
```
 
### 4. Instalar dependencias Python
 
```bash
cd backend
pip install -r requirements.txt
```
 
### 5. Crear backend/.env
 
Crea el archivo `.env` en la carpeta `backend/`. Ver variables requeridas en [`backend/README.md`](./backend/README.md).
 
### 6. Correr migraciones
 
```bash
python manage.py migrate
```
 
### 7. Crear superusuario
 
```bash
python manage.py createsuperuser
```
 
### 8. Instalar dependencias Node
 
```bash
cd ../frontend
npm install
```
 
### 9. Crear frontend/.env
 
Crea el archivo `.env` en la carpeta `frontend/`.
 
### 10. Poner en funcionamiento el proyecto
 
**Terminal 1 — backend** (desde la raíz):
 
```bash
venv\Scripts\activate
cd backend
python manage.py runserver
```
 
**Terminal 2 — frontend:**
 
```bash
cd frontend
npm run dev
```
 

