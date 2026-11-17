from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

contexto_password = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ===== Contraseñas =====#
def hash_password(password: str) -> str:
    """bcrypt agrega una sal aleatoria: dos contraseñas iguales dan hashes distintos."""
    return contexto_password.hash(password)


def verify_password(password: str, hash_guardado: str) -> bool:
    """La comparación corre en tiempo constante, para mitigar ataques de temporización."""
    return contexto_password.verify(password, hash_guardado)


# ===== Token JWT =====#
def create_access_token(usuario_id: int) -> str:
    expira = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    datos = {
        "sub": str(usuario_id),  # el subject del JWT se guarda como texto
        "type": "access",
        "exp": expira,
    }
    return jwt.encode(datos, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> int | None:
    """Devuelve el id del usuario, o None si el token es inválido o venció."""
    try:
        datos: dict[str, Any] = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],  # lista fija: evita el ataque de algoritmo
        )
    except JWTError:
        return None

    if datos.get("type") != "access":
        return None

    sujeto = datos.get("sub")
    if sujeto is None:
        return None

    try:
        return int(sujeto)
    except ValueError:
        return None