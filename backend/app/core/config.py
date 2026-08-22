"""
Configuration centralisée de l'application.

On utilise pydantic-settings pour :
- Charger automatiquement les variables depuis .env
- Valider leur type (si une variable manque, l'app crash au démarrage)
- Avoir un objet `settings` type-safe qu'on importe partout

Pattern pro : une seule source de vérité pour toute la config.
"""

from urllib.parse import quote, urlparse, urlunparse

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Toutes les variables d'environnement utilisées par l'app."""

    # ----- App -----
    APP_NAME: str = "RoommateFinderAI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # ----- CORS -----
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        """Convertit la string CORS en liste pour FastAPI."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # ----- Supabase -----
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str              # Cle publique (safe cote frontend)
    SUPABASE_SERVICE_ROLE_KEY: str      # Cle service (backend only - bypass RLS)
    SUPABASE_JWT_SECRET: str            # Pour valider les JWT cote backend

    # ----- Database -----
    DATABASE_URL: str

    @property
    def database_url_encoded(self) -> str:
        """DATABASE_URL avec le mot de passe URL-encodé (gère les caractères spéciaux)."""
        parsed = urlparse(self.DATABASE_URL)
        if parsed.password:
            encoded = quote(parsed.password, safe="")
            netloc = f"{parsed.username}:{encoded}@{parsed.hostname}"
            if parsed.port:
                netloc += f":{parsed.port}"
            return urlunparse(parsed._replace(netloc=netloc))
        return self.DATABASE_URL

    # ----- OpenAI -----
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Instance unique, importee partout
settings = Settings()
