# Frontend — Sistema de Gestión de Alojamientos Villa Yaiza

Interfaz web desarrollada con React y Vite. Consume la API REST del backend en Django e implementa autenticación JWT, rutas protegidas y módulos CRUD para los principales recursos del negocio.

---

## Dependencias principales

| Paquete | Versión | Uso |
|--------|---------|-----|
| React | 18.x | Framework principal |
| React Router DOM | latest | Navegación y rutas |
| Axios | 1.15.1 | Consumo de la API REST |
| Tailwind CSS | 3.4.19 | Estilos |
| Recharts | 3.8.1 | Gráficas en módulo de Reportes |
| Framer Motion | latest | Animaciones |
| Vite | 5.4.21 | Bundler y servidor de desarrollo |
| vite-plugin-pwa | 0.17.5 | Soporte PWA |

---

## Instalación y ejecución

```bash
cd frontend
npm install
npm install recharts
npm run dev
```

El proxy de Vite redirige las peticiones `/api/*` al backend en `http://localhost:8000` durante el desarrollo.

---

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|------|------------|--------|
| `/` | `inicioSesion` | Público |
| `/dashboard` | `panel` | Privado |
| `/clientes` | `ListaClientes` | Privado |
| `/propiedades` | `ListaPropiedades` | Privado |
| `/inventario` | `ListaInventario` | Privado |
| `/reservas` | `ListaReservas` | Privado |
| `/usuarios` | `ListaUsuarios` | Privado |
| `/reportes` | `Reportes` | Privado (admin / asistente) |

Las rutas privadas requieren un token JWT válido. Si no existe, `RutaProtegida.jsx` redirige al login automáticamente.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── Layout.jsx              # Estructura base con navbar/sidebar
│   ├── MatrizPermisos.jsx      # Control de acceso por rol
│   └── RutaProtegida.jsx       # Protección de rutas privadas
│
├── context/
│   ├── AuthContext.js          # Contexto de autenticación
│   └── AuthProvider.jsx        # Proveedor del contexto
│
├── hooks/
│   └── useAuth.js              # Hook para consumir el contexto de auth
│
├── pages/
│   ├── clientes/
│   │   ├── FormularioClientes.jsx
│   │   └── ListaClientes.jsx
│   ├── inventario/
│   │   ├── FormularioInventario.jsx
│   │   └── ListaInventario.jsx
│   ├── propiedades/
│   │   ├── FormularioPropiedades.jsx
│   │   └── ListaPropiedades.jsx
│   ├── reportes/
│   │   └── Reportes.jsx        # Gráficas Recharts y exportación PDF
│   ├── reservas/
│   │   ├── ChecklistReserva.jsx
│   │   ├── DetalleReserva.jsx
│   │   ├── FormularioReservas.jsx
│   │   └── ListaReservas.jsx
│   ├── usuarios/
│   │   ├── CambiarPassword.jsx
│   │   ├── FormularioUsuarios.jsx
│   │   └── ListaUsuarios.jsx
│   ├── inicioSesion.jsx
│   └── panel.jsx
│
├── router/
│   └── RutasApp.jsx            # Definición de rutas públicas y privadas
│
├── services/
│   ├── api.js                  # Instancia de Axios con baseURL e interceptor JWT
│   ├── clienteService.js       # Llamadas a /api/clientes/
│   ├── contratoService.js      # Llamadas a /api/contratos/
│   ├── inventarioService.js    # Llamadas a /api/inventario/
│   ├── propiedadService.js     # Llamadas a /api/propiedades/
│   └── reservaService.js       # Llamadas a /api/reservas/
│
├── utils/
│   ├── calculadoraPrecio.js    # Lógica de precios por temporada
│   └── permisos.js             # Permisos por rol
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## Endpoints consumidos

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/token/ | Login |
| POST | /api/token/refresh/ | Renovar token |
| GET | /api/perfil/ | Datos del usuario autenticado |
| GET / POST | /api/clientes/ | Listar y crear clientes |
| GET / PUT / DELETE | /api/clientes/{id}/ | Detalle, editar y eliminar cliente |
| GET / POST | /api/propiedades/ | Listar y crear propiedades |
| GET / PUT / DELETE | /api/propiedades/{id}/ | Detalle, editar y eliminar propiedad |
| GET / POST | /api/inventario/ | Listar y crear ítems |
| GET / PUT / DELETE | /api/inventario/{id}/ | Detalle, editar y eliminar ítem |
| GET / POST | /api/reservas/ | Listar y crear reservas |
| GET / PUT / DELETE | /api/reservas/{id}/ | Detalle, editar y eliminar reserva |
| POST | /api/contratos/{reserva_id}/generar/ | Generar contrato PDF de una reserva |
| GET | /api/reportes/ingresos/ | Reporte de ingresos por período |
| GET | /api/reportes/ocupacion/ | Reporte de ocupación por propiedad |

---

## Autenticación JWT

1. El usuario inicia sesión en `/`
2. El backend devuelve `accessToken` y `refreshToken`
3. Los tokens se guardan en `localStorage`
4. Cada petición incluye el `accessToken` en el header `Authorization: Bearer <token>`
5. Si no hay token válido, `RutaProtegida.jsx` redirige al login

---
