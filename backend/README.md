#  Backend — Sistema de Gestión de Alojamientos Villa Yaiza

> API REST en construcción desarrollada con **Django 5** para el sistema de gestión interno de Alojamientos Villa Yaiza. Actualmente expone administración completa vía Django Admin y los primeros endpoints REST de autenticación y perfil de usuario.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.17-red)
![WeasyPrint](https://img.shields.io/badge/WeasyPrint-68.1-blue)
![Estado](https://img.shields.io/badge/API%20REST-en%20desarrollo-yellow)

>  Este README documenta únicamente el backend. Para el contexto general del proyecto, consulta el [README principal](../README.md).

---

##  Dependencias principales

| Paquete | Versión | Uso |
|--------|---------|-----|
| Django | 6.0.4 | Framework principal |
| djangorestframework | 3.17.1 | API REST |
| djangorestframework-simplejwt | 5.5.1 | Autenticación JWT |
| django-cors-headers | 4.9.0 | Comunicación con el frontend React |
| WeasyPrint | 68.1 | Generación de contratos en PDF |
| Pillow | 12.2.0 | Manejo de imágenes del inventario |
| psycopg2-binary | 2.9.11 | Conector PostgreSQL |
| python-dotenv | 1.2.2 | Variables de entorno |

>  

Todas las dependencias están listadas en [`requirements.txt`](./requirements.txt).

---

##  Instalación y ejecución

### 1. Clonar el repositorio y entrar al backend

```bash
git clone https://github.com/tu-usuario/sistema-gestion-alojamientos-villayaiza.git
cd sistema-gestion-alojamientos-villayaiza/backend
```

### 2. Crear y activar entorno virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del backend con el siguiente contenido:

```env
SECRET_KEY=django-insecure-clave-de-prueba-123
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

> En producción `DEBUG` debe ser `False` y `SECRET_KEY` debe ser una clave segura generada con `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`.

### 5. Aplicar migraciones

```bash
python manage.py migrate
```

### 6. Crear superusuario (para acceder al Admin)

```bash
python manage.py createsuperuser
```

### 7. Ejecutar el servidor

```bash
python manage.py runserver
```

| Ruta | Descripción |
|------|-------------|
| `http://127.0.0.1:8000/admin/` | Panel de administración Django |
| `http://127.0.0.1:8000/api/hello/` | Endpoint de prueba (público) |
| `http://127.0.0.1:8000/api/perfil/` | Perfil del usuario autenticado |

---

##  Estructura del backend

```
backend/
│
├── config/               # Configuración global del proyecto
│   ├── settings.py       # Ajustes principales (BD, apps, JWT, CORS)
│   ├── urls.py           # Enrutador raíz
│   └── wsgi.py
│
├── cuentas/              # Modelo de usuario personalizado + endpoints de perfil
├── propiedades/          # Registro de alojamientos con precios por temporada
├── reservas/             # Reservas, clientes, pagos y revisiones
├── inventario/           # Ítems de inventario por propiedad
├── contratos/            # Contratos asociados a reservas
├── reportes/             # Historial y generación de reportes
│
├── .env                  # Variables de entorno (no se versiona)
├── manage.py
├── requirements.txt
└── db.sqlite3            # Base de datos de desarrollo (SQLite)
```

---

##  Modelos de datos

### `cuentas` — UsuarioPersonalizado

Extiende `AbstractUser` de Django con campos adicionales requeridos por el negocio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `email` | EmailField (único) | Reemplaza el username como identificador principal |
| `telefono` | CharField | Teléfono de contacto |
| `tipo_documento` | CharField | CC, NIT, pasaporte, etc. |
| `numero_documento` | CharField | Número del documento de identidad |
| `rol` | CharField (choices) | `admin`, `asistente`, `empleado` — controla permisos de acceso |

---

### `propiedades` — Propiedad

Registro de los alojamientos disponibles para reserva, con soporte de precios diferenciados por temporada.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | CharField | Nombre del alojamiento |
| `tipo` | CharField (choices) | `finca`, `apartamento`, `cabaña` |
| `descripcion` | TextField | Descripción opcional |
| `capacidad` | PositiveIntegerField | Número máximo de huéspedes |
| `precio_base_por_dia` | DecimalField | Precio base diario en COP |
| `precio_temporada_baja` | DecimalField | Precio en temporada baja (opcional) |
| `precio_temporada_alta` | DecimalField | Precio en temporada alta (opcional) |
| `ubicacion` | CharField | Dirección o referencia de ubicación |
| `esta_activa` | BooleanField | Indica si la propiedad está disponible |

---

### `reservas` — Cliente, Reserva, Pago, RevisionInventario

**Cliente** — huéspedes que realizan reservas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | CharField | Nombre completo |
| `telefono` | CharField | Teléfono de contacto |
| `email` | EmailField | Correo electrónico (opcional) |
| `tipo_documento` | CharField | Tipo de documento de identidad |
| `numero_documento` | CharField | Número del documento |

**Reserva** — núcleo del sistema, vincula cliente y propiedad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `propiedad` | FK → Propiedad | Alojamiento reservado |
| `cliente` | FK → Cliente | Huésped que reserva |
| `fecha_inicio` / `fecha_fin` | DateField | Rango de la reserva |
| `hora_entrada_estimada` / `hora_salida_estimada` | TimeField | Horarios planificados |
| `hora_entrada_real` / `hora_salida_real` | DateTimeField | Check-in / check-out real |
| `cant_asistentes` | PositiveIntegerField | Número de personas |
| `temporada` | CharField (choices) | `alta` o `baja` |
| `estado` | CharField (choices) | `pendiente`, `en_curso`, `completada`, `cancelada` |
| `precio_total` | DecimalField | Precio total calculado en COP |
| `notas` | TextField | Observaciones adicionales |

**Pago** — pagos asociados a una reserva (admite pagos parciales).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `reserva` | FK → Reserva | Reserva a la que corresponde |
| `monto` | DecimalField | Monto del pago en COP |
| `fecha_pago` | DateTimeField | Fecha y hora del pago |
| `metodo` | CharField (choices) | `efectivo`, `transferencia`, `tarjeta` |
| `banco` | CharField | Banco asociado al pago (opcional, aplica para transferencias) |

**RevisionInventario** — checklist de ítems por reserva.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `reserva` | FK → Reserva | Reserva revisada |
| `item` | FK → ItemInventario | Ítem revisado |
| `esta_danado` | BooleanField | Indica si el ítem tiene daño nuevo |
| `costo_reparacion` | DecimalField | Costo estimado del daño (opcional) |
| `notas` | TextField | Observaciones del revisor |

---

### `inventario` — ItemInventario

Control de bienes de cada propiedad, clasificados por categoría.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `propiedad` | FK → Propiedad | Propiedad a la que pertenece |
| `nombre` | CharField | Nombre del ítem |
| `categoria` | CharField (choices) | `mobiliario`, `electrodomestico`, `ropa_cama`, `utensilio_cocina`, `decoracion`, `herramienta`, `juegos`, `otro` |
| `cantidad` | PositiveIntegerField | Cantidad total registrada |
| `cantidad_disponible` | PositiveIntegerField | Cantidad actualmente disponible |
| `costo_unitario` | DecimalField | Valor unitario del ítem (opcional) |
| `foto` | ImageField | Foto del ítem (sube a `media/inventario/`) |
| `esta_danado` | BooleanField | Si el ítem tiene un daño registrado |
| `notas_dano` | TextField | Descripción del daño |
| `estado` | CharField (choices) | `disponible`, `no_disponible`, `en_reparacion` |

---

### `contratos` — Contrato

Contrato digital generado a partir de una reserva.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `reserva` | OneToOneField → Reserva | Reserva asociada (1 contrato por reserva) |
| `token_publico` | UUIDField | Token único para acceso/descarga sin login |
| `fecha_generacion` | DateTimeField | Cuándo se generó el contrato |
| `fue_descargado` | BooleanField | Si ya fue descargado al menos una vez |
| `fecha_descarga` | DateTimeField | Fecha de la primera descarga |

---

### `reportes` — Reporte

Historial de reportes generados por los administradores, con trazabilidad del usuario que los generó.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo` | CharField | Nombre del reporte |
| `tipo` | CharField (choices) | `ingresos`, `ocupacion`, `inventario` |
| `fecha_generacion` | DateTimeField | Cuándo se generó |
| `filtros` | JSONField | Parámetros usados para el reporte |
| `generado_por` | FK → UsuarioPersonalizado | Usuario que generó el reporte |

---

##  Endpoints disponibles

| Método | Ruta | Descripción | Auth | Estado |
|--------|------|-------------|:----:|--------|
| GET | `/admin/` | Panel de administración Django | Admin | ✅ Activo |
| GET | `/api/hello/` | Verificación de conexión backend | No | ✅ Activo |
| GET | `/api/perfil/` | Datos del usuario autenticado (id, username, email, rol, nombre) | JWT | ✅ Activo |
| — | `/api/reservas/` | CRUD de reservas | JWT | 🔄 En desarrollo |
| — | `/api/clientes/` | CRUD de clientes | JWT | 🔄 En desarrollo |
| — | `/api/propiedades/` | CRUD de propiedades | JWT | 🔄 En desarrollo |
| — | `/api/inventario/` | CRUD de inventario | JWT | 🔄 En desarrollo |
| — | `/api/contratos/` | Generación y descarga de PDF | JWT | 🔄 En desarrollo |
| — | `/api/reportes/` | Generación de reportes | JWT | 🔄 En desarrollo |
| POST | `/api/auth/token/` | Obtener token JWT | No | ⏳ Pendiente |
| POST | `/api/auth/token/refresh/` | Refrescar token JWT | No | ⏳ Pendiente |

---

##  Estado actual del backend

| Componente | Estado |
|---|---|
| Modelos definidos (todos los módulos) | ✅ Completo |
| Migraciones aplicadas | ✅ Completo |
| Panel Django Admin funcional | ✅ Completo |
| CRUD completo vía Admin | ✅ Completo |
| Endpoint de prueba `/api/hello/` | ✅ Activo |
| Endpoint de perfil `/api/perfil/` (requiere JWT) | ✅ Activo |
| Conexión frontend ↔ backend | ✅ Establecida |
| Serializers (DRF) | 🔄 En desarrollo |
| Endpoints REST (reservas, inventario, etc.) | 🔄 En desarrollo |
| Autenticación JWT (login / refresh) | ⏳ Pendiente |
| Generación PDF con WeasyPrint | ⏳ Pendiente |
| Migración a PostgreSQL (Neon) | ⏳ Pendiente |
| Configuración CORS para producción | ⏳ Pendiente |
| Despliegue en Render | ⏳ Pendiente |

---

##  Próximos pasos

1. Implementar endpoints JWT de login y refresh (`/api/auth/token/`)
2. Crear serializers con DRF para `reservas`, `clientes`, `propiedades` e `inventario`
3. Implementar ViewSets y registrar rutas con `DefaultRouter`
4. Desarrollar la vista de generación de contratos PDF con WeasyPrint
5. Configurar CORS para permitir peticiones desde el dominio de Vercel en producción
6. Migrar la base de datos de SQLite a PostgreSQL en Neon
7. Preparar el proyecto para despliegue en Render

---

*Parte del proyecto [Sistema de Gestión de Alojamientos Villa Yaiza](../README.md) — Ingeniería de Software.*
