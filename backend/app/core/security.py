"""
Securite : validation des JWT emis par Supabase.
Version robuste qui recupere les cles publiques Supabase pour verifier
automatiquement tout algorithme (HS256, ES256, RS256).
"""

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import JWTError

from app.core.config import settings

security_scheme = HTTPBearer()

# Cache pour les cles publiques Supabase
_jwks_cache = None


class TokenData:
    def __init__(self, user_id: str, email: str | None = None):
        self.user_id = user_id
        self.email = email


def _get_jwks():
    """Recupere les cles publiques Supabase (cache)."""
    global _jwks_cache
    if _jwks_cache is None:
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        try:
            response = httpx.get(jwks_url, timeout=5.0)
            response.raise_for_status()
            _jwks_cache = response.json()
        except Exception:
            _jwks_cache = None
    return _jwks_cache


def decode_supabase_jwt(token: str) -> TokenData:
    """
    Decode et valide un JWT Supabase.
    Essaie d abord avec le secret HS256, puis avec les cles publiques si dispo.
    """
    # Tentative 1 : HS256 avec le secret (methode historique Supabase)
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if user_id:
            return TokenData(user_id=user_id, email=payload.get("email"))
    except JWTError:
        pass  # On essaie avec JWKS

    # Tentative 2 : JWKS (cles publiques pour ES256 / RS256)
    jwks = _get_jwks()
    if jwks:
        try:
            # On recupere le kid du token pour trouver la bonne cle
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")

            # On cherche la cle correspondante dans le JWKS
            key = None
            for jwk in jwks.get("keys", []):
                if jwk.get("kid") == kid:
                    key = jwk
                    break

            if key:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=[key.get("alg", "ES256"), "RS256", "ES256"],
                    audience="authenticated",
                )
                user_id = payload.get("sub")
                if user_id:
                    return TokenData(user_id=user_id, email=payload.get("email"))
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token (JWKS): {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token: could not verify with HS256 or JWKS",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> TokenData:
    return decode_supabase_jwt(credentials.credentials)