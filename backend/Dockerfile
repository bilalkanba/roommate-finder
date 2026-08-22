# Dockerfile backend FastAPI
# Multi-stage build pour image finale légère

# ===== Stage 1 : Builder =====
FROM python:3.11-slim AS builder

WORKDIR /build

# Dépendances système pour compiler psycopg2 et cryptography
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Installation des deps Python dans un venv pour un copy propre
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ===== Stage 2 : Runtime =====
FROM python:3.11-slim

# Runtime lib pour psycopg2 (libpq5 seulement, pas les dev headers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Utilisateur non-root (bonne pratique sécurité)
RUN useradd --create-home --shell /bin/bash appuser
WORKDIR /app

# Copie du venv depuis le builder
COPY --from=builder /venv /venv
ENV PATH="/venv/bin:$PATH"

# Copie du code
COPY --chown=appuser:appuser ./app ./app
COPY --chown=appuser:appuser ./pytest.ini ./pytest.ini
COPY --chown=appuser:appuser ./tests ./tests

USER appuser

EXPOSE 8000

# Healthcheck pour docker-compose
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Lancement avec uvicorn (serveur ASGI)
# --host 0.0.0.0 : écoute sur toutes les interfaces (nécessaire dans Docker)
# --workers 1 : en dev. En prod on passera à --workers 4 via docker-compose.prod.yml
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
