"""Carga los datos iniciales del sistema.

Es idempotente: se puede ejecutar varias veces sin duplicar nada.

Ejecutar con:  python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"
ADMIN_EMAIL = "admin@foodstore.com"
ADMIN_FULL_NAME = "Administrador del sistema"

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra y al molde"),
    ("Empanadas", "Empanadas al horno"),
    ("Hamburguesas", "Hamburguesas caseras"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
]

# (nombre, descripcion, precio, stock, categoria)
PRODUCTOS = [
    ("Pizza Muzzarella", "Muzzarella, salsa de tomate y aceitunas", 9500.0, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 10500.0, 15, "Pizzas"),
    ("Empanada de Carne", "Carne cortada a cuchillo", 1500.0, 60, "Empanadas"),
    ("Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400.0, 50, "Empanadas"),
    ("Hamburguesa Simple", "Medallón de carne, lechuga y tomate", 7800.0, 25, "Hamburguesas"),
    ("Hamburguesa Doble Cheddar", "Doble medallón con cheddar y panceta", 11500.0, 18, "Hamburguesas"),
    ("Gaseosa 1.5 L", "Línea Coca-Cola", 3200.0, 40, "Bebidas"),
    ("Agua Mineral 500 ml", "Sin gas", 1800.0, 45, "Bebidas"),
]


def crear_admin(sesion: Session) -> None:
    existente = sesion.exec(
        select(Usuario).where(Usuario.username == ADMIN_USERNAME)
    ).first()

    if existente is not None:
        print(f"El administrador ya existe: {ADMIN_USERNAME}")
        return

    sesion.add(
        Usuario(
            username=ADMIN_USERNAME,
            full_name=ADMIN_FULL_NAME,
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            role="admin",
        )
    )
    print(f"Administrador creado: {ADMIN_USERNAME} / {ADMIN_PASSWORD}")


def crear_categorias(sesion: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}

    for nombre, descripcion in CATEGORIAS:
        categoria = sesion.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            sesion.add(categoria)
            sesion.flush()
            print(f"Categoría creada: {nombre}")

        categorias[nombre] = categoria

    return categorias


def crear_productos(sesion: Session, categorias: dict[str, Categoria]) -> None:
    for nombre, descripcion, precio, stock, nombre_categoria in PRODUCTOS:
        existente = sesion.exec(
            select(Producto).where(Producto.nombre == nombre)
        ).first()

        if existente is not None:
            continue

        categoria = categorias[nombre_categoria]
        sesion.add(
            Producto(
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                stock=stock,
                categoria_id=categoria.id or 0,
            )
        )
        print(f"Producto creado: {nombre}")


def main() -> None:
    create_all_tables()

    with Session(engine) as sesion:
        crear_admin(sesion)
        categorias = crear_categorias(sesion)
        crear_productos(sesion, categorias)
        sesion.commit()

    print("Seed completado.")


if __name__ == "__main__":
    main()