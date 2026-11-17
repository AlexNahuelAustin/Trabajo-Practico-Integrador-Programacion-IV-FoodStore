# Food Store - Sistema de Pedidos de Comida

Trabajo Práctico Integrador - Programación 4 - UTN FRSN

Autor: Austin Alex Nahuel

URL del repositorio: <URL_DEL_REPOSITORIO>

Video de demostración: <URL_DEL_VIDEO>

## Descripción

Food Store es una aplicación web para un negocio de comidas. Los clientes se
registran, recorren el catálogo de productos, arman un carrito de compras y
confirman un pedido indicando la dirección de entrega y la forma de pago
(efectivo o transferencia). El administrador gestiona las categorías, los
productos, el stock, los pedidos y los usuarios desde un panel propio. El
sistema garantiza que un pedido se cree completo o no se cree, que el stock
se descuente y se restituya de forma coherente, y que los precios de un
pedido ya confirmado no cambien.

## Stack tecnológico

**Backend**

- Python 3.11 a 3.13
- FastAPI 0.163.2 (`fastapi[standard]`, incluye Uvicorn y email-validator)
- SQLModel 0.0.50 sobre PostgreSQL (`psycopg2-binary` 2.9.13)
- Autenticación con JWT (`python-jose[cryptography]` 3.5.0) en cookie HttpOnly
- `passlib[bcrypt]` 1.7.4 y `bcrypt` 4.0.1 para el hash de contraseñas
- `pydantic-settings` 2.16.3 y `python-multipart` 0.0.34

**Frontend**

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- TanStack Query, TanStack Form y TanStack Table
- React Router (`react-router-dom`) con `BrowserRouter`
- Zustand para el estado del cliente (sesión y carrito)
- Axios como cliente HTTP

## Requisitos previos

- Python 3.11 a 3.13
- PostgreSQL 15 o superior
- Node.js 20.19 o superior
- pnpm 9 o superior

## Instalación y ejecución del backend

```bash
# 1. Crear la base de datos
psql -U postgres -c "CREATE DATABASE foodstore_db;"

# 2. Ubicarse en la carpeta del backend
cd backend

# 3. Crear y activar el entorno virtual
python -m venv .venv
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # Linux / macOS

# 4. Instalar las dependencias
pip install -r requirements.txt

# 5. Configurar las variables de entorno
copy .env.example .env       # Windows
cp .env.example .env         # Linux / macOS

# 6. Cargar los datos iniciales (admin, categorías y productos)
python -m app.db.seed

# 7. Levantar el servidor de desarrollo
uvicorn app.main:app --reload
```

La API queda disponible en `http://localhost:8000`. La documentación
interactiva se genera automáticamente en `http://localhost:8000/docs` y en
`http://localhost:8000/redoc`.

## Instalación y ejecución del frontend

```bash
# 1. Ubicarse en la carpeta del frontend
cd frontend

# 2. Configurar las variables de entorno
copy .env.example .env       # Windows
cp .env.example .env         # Linux / macOS

# 3. Instalar las dependencias
pnpm install

# 4. Verificar que el proyecto compila (chequeo de tipos de TypeScript)
pnpm build

# 5. Levantar el servidor de desarrollo
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Cadena de conexión a la base de datos PostgreSQL | `postgresql+psycopg2://postgres:tu_contraseña@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo de firma del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS (URL del frontend) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API del backend, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

## Usuario administrador

El seed (`python -m app.db.seed`) crea de forma idempotente un usuario
administrador con las siguientes credenciales:

- Usuario: `admin`
- Contraseña: `Admin1234!`
- Rol: `admin`

El mismo seed carga además un conjunto de categorías y de productos con
stock para poder probar el catálogo. Los usuarios nuevos se registran desde
la pantalla de registro del frontend y nacen siempre con rol `user`.

## Advertencia importante

**Usar siempre `localhost` y no `127.0.0.1` para acceder tanto al backend
como al frontend.** La cookie de sesión se emite con `SameSite=Lax`; si un
proyecto se abre con `localhost` y el otro con `127.0.0.1`, el navegador los
trata como sitios distintos y no envía la cookie, por lo que la sesión no
funciona.

## Estructura del proyecto

```
backend/
├── app/                  Paquete de la aplicación FastAPI.
│   ├── core/              Infraestructura compartida: configuración, base de datos,
│   │                      seguridad, dependencias, Unit of Work y Repository base.
│   ├── db/                 Script de carga inicial de datos (seed).
│   └── modules/             Un paquete por dominio: auth, usuarios, categorias,
│                            productos y pedidos, cada uno con su router, service,
│                            unit of work, repository, models y schemas.
├── test/                  Colecciones .http para probar los endpoints manualmente.
├── requirements.txt       Dependencias de Python con versiones fijadas.
└── .env.example           Plantilla de variables de entorno del backend.

frontend/
├── src/                   Código fuente de la aplicación React.
│   ├── features/           Un dominio por carpeta (auth, categorias, productos,
│   │                       pedidos, usuarios), cada una con sus páginas,
│   │                       componentes, hooks, acceso a la API y tipos.
│   ├── routes/              Definición de rutas y protección por sesión y rol.
│   ├── shared/               Piezas transversales: cliente HTTP, componentes de
│   │                         UI, layout y utilidades, sin lógica de negocio.
│   └── store/                 Estado global del cliente con Zustand: sesión y carrito.
├── public/                Archivos estáticos servidos tal cual.
├── package.json           Dependencias de Node con versiones fijadas.
└── .env.example            Plantilla de variables de entorno del frontend.
```

## Funcionalidades

### Cliente

- Registro e inicio de sesión con usuario y contraseña.
- Navegación del catálogo con paginación en el servidor, búsqueda por nombre
  y filtro por categoría.
- Carrito de compras persistido en el navegador, con alta, baja y cambio de
  cantidades.
- Confirmación del pedido indicando dirección de entrega, forma de pago
  (efectivo o transferencia) y notas opcionales.
- Consulta de "Mis pedidos" con el detalle de cada uno.
- Cancelación de un pedido propio mientras esté en estado `PENDIENTE`.

### Administrador

- Resumen del negocio: pedidos por estado, pedidos del día e ingresos de los
  pedidos entregados.
- ABM de categorías, con baja lógica.
- ABM de productos, incluido el cambio de stock y disponibilidad, con baja
  lógica.
- Gestión de pedidos: ver todos los pedidos, avanzar o cancelar su estado
  según la máquina de estados definida.
- Gestión de usuarios: listar, activar y desactivar cuentas.
