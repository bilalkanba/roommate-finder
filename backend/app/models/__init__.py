"""
Module `models` : contient tous les modèles SQLAlchemy (= tables de la DB).

On importe ici pour que `Base.metadata` connaisse toutes les tables
quand on fait des migrations ou des créations de tables.
"""

from app.models.profile import (
    Gender,
    LifestyleLevel,
    PetsPreference,
    Profile,
    SleepSchedule,
    SmokingPreference,
    SocialLevel,
)

__all__ = [
    "Profile",
    "Gender",
    "LifestyleLevel",
    "SleepSchedule",
    "SocialLevel",
    "SmokingPreference",
    "PetsPreference",
]
