"""
Configuration de la base de donnees avec SQLAlchemy + pg8000.
pg8000 est un driver Postgres pur Python qui evite les problemes
d encoding windows de psycopg2.
"""

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def _parse_database_url(url: str) -> URL:
    """Parse our postgres URL and return a SQLAlchemy URL using pg8000 driver."""
    stripped = url.replace("postgresql://", "", 1)
    auth_part, host_part = stripped.split("@", 1)
    username, password = auth_part.split(":", 1)
    host_port, database = host_part.split("/", 1)
    if ":" in host_port:
        host, port = host_port.split(":", 1)
        port = int(port)
    else:
        host = host_port
        port = 5432

    return URL.create(
        drivername="postgresql+pg8000",
        username=username,
        password=password,
        host=host,
        port=port,
        database=database,
    )


engine = create_engine(
    _parse_database_url(settings.DATABASE_URL),
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()