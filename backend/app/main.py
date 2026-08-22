"""
Point d'entrée de l'application FastAPI.

Rôle : assembler tous les composants (routes, middleware, CORS)
et lancer le serveur.

Lancement :
- Dev : uvicorn app.main:app --reload
- Docker : géré par le Dockerfile
- Prod : gunicorn avec workers uvicorn

Swagger UI disponible sur : http://localhost:8000/docs
Redoc disponible sur : http://localhost:8000/redoc
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import matches, profiles, messages
from app.core.config import settings
from app.core.database import Base, engine
from app.api import messages as messages_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Hook de démarrage/arrêt de l'app.

    Au démarrage : crée les tables si elles n'existent pas (pratique en dev).
    En prod, on utilisera Alembic pour les migrations propres.
    """
    # --- Startup ---
    print(f"🚀 Starting {settings.APP_NAME} in {settings.APP_ENV} mode")

    # Création des tables (dev only)
    # En prod : utiliser Alembic migrations à la place
    if settings.APP_ENV == "development":
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables ready")

    yield

    # --- Shutdown ---
    print("👋 Shutting down gracefully")


# Création de l'app FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-powered roommate matching API. "
        "Finds compatible flatmates using a hybrid scoring algorithm "
        "and LLM-generated compatibility explanations."
    ),
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ===== Middleware CORS =====
# Autorise le frontend (sur un autre port/domaine) à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Routes =====
app.include_router(
    messages_router.router,
    prefix="/api/v1/messages",
    tags=["messages"],
)
app.include_router(messages.router, prefix="/api/v1")

@app.get("/", tags=["health"])
async def root():
    """Root endpoint : redirige vers la doc."""
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "docs": "/docs",
        "status": "ok",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Healthcheck pour Docker et monitoring."""
    return {"status": "healthy"}


# Enregistrement des routes avec le préfixe /api/v1
app.include_router(profiles.router, prefix=settings.API_V1_PREFIX)
app.include_router(matches.router, prefix=settings.API_V1_PREFIX)
