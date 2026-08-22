"""
Client Supabase pour les opérations côté serveur.

Usage : principalement pour gérer les comptes users (create, delete, lookup)
en complément de l'auth côté frontend.

Note : pour les données métier (profiles, matches), on passe par SQLAlchemy
directement sur la DB Postgres de Supabase. Le client Supabase n'est utilisé
que pour les fonctionnalités qui touchent à `auth.users` (protégé).
"""

from supabase import Client, create_client

from app.core.config import settings

_client: Client | None = None


def get_supabase_client() -> Client:
    """
    Retourne un client Supabase avec la service_role key.

    ⚠️ La service_role key bypass les Row Level Security (RLS).
    À n'utiliser QUE côté serveur, jamais exposée au frontend.
    """
    global _client
    if _client is None:
        _client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client
