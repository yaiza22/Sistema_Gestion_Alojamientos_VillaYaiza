# Backend — Sistema de Gestión de Alojamientos Villa Yaiza

API REST desarrollada con Django y Django REST Framework. Gestiona todos los recursos del negocio: clientes, reservas, propiedades, inventario, usuarios, contratos y reportes.

---

## Dependencias principales

| Paquete | Uso |
|--------|-----|
| Django 6.0.4 | Framework principal |
| Django REST Framework 3.x | API REST |
| djangorestframework-simplejwt 5.x | Autenticación JWT |
| WeasyPrint 68.1 | Generación de contratos en PDF |
| psycopg2 | Conexión a PostgreSQL en producción |

---

## Instalación y ejecución
 
> ** Requisito previo en Windows — WeasyPrint y GTK3 **
>
> WeasyPrint depende del runtime GTK3. Sin él, la instalación fallará y las migraciones del módulo de contratos darán error. Antes de ejecutar `pip install -r requirements.txt`, instala el runtime desde:
>
> https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases
>
> Descarga e instala el archivo: `gtk3-runtime-3.x.x-x-x-ts-win64.exe` (último release disponible). Luego reinicia el terminal.

```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## Variables de entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```
SECRET_KEY=django-insecure-clave-local-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## Estructura del proyecto

```
backend/
├── config/                     # Configuración global (settings, urls, wsgi, asgi)
├── contratos/                  # Generación de contratos PDF con WeasyPrint
├── cuentas/                    # Usuarios, roles y autenticación JWT
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── inventario/                 # Control de ítems por propiedad
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── propiedades/                # Registro de alojamientos
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── reportes/                   # Reportes financieros
├── reservas/                   # Reservas, clientes y pagos
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── .env                        # Variables de entorno (no se versiona)
├── manage.py
└── requirements.txt
```

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/token/ | Login — obtener access y refresh token |
| POST | /api/token/refresh/ | Renovar access token |
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

## Módulos

### Clientes
Registro, consulta, actualización y eliminación de clientes con campos de nombre, teléfono, email, tipo y número de documento.

### Reservas
Gestión del ciclo completo de una reserva: fechas, propiedad, cliente, estado (pendiente, en curso, completada, cancelada) y cálculo de precios según temporada. Incluye checklist de inventario y vista de detalle.

### Propiedades
Administración de los alojamientos disponibles: nombre, tipo (finca, apartamento, cabaña), capacidad, ubicación y precios por temporada.

### Inventario
Control de ítems por propiedad: registro, estado, cantidad, daños y costos asociados.

### Usuarios
Maneja tres roles: `admin`, `asistente` y `empleado`, cada uno con distintos niveles de acceso. Incluye gestión de usuarios y cambio de contraseña.

### Contratos
Generación de contratos en PDF a partir de los datos de cada reserva usando WeasyPrint. El módulo toma la información de la reserva (cliente, propiedad, fechas, precio y condiciones) y produce un documento PDF listo para firmar y descargar.

### Reportes
Reportes financieros con exportación a PDF. Permite consultar ingresos por período y ocupación por propiedad. Disponible para los roles `admin` y `asistente`.

---

