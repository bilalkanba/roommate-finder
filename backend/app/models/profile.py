"""
Modèle Profile - Phase 1 v2 DÉFINITIVEMENT FIXED

Fix crucial : les enums Postgres ont été créés par la migration SQL
avec suffixe `_enum` et valeurs en lowercase. Python doit utiliser :
- Le bon nom d'enum Postgres (preferred_gender_enum, pas preferredgender)
- Les valeurs en lowercase via values_callable
- create_type=False pour ne pas recréer le type
"""

import enum
from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    ARRAY,
    Boolean,
    Date,
    DateTime,
    Enum,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


# ===== Enums Python =====

class LifestyleLevel(str, enum.Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class SleepSchedule(str, enum.Enum):
    EARLY_BIRD = "early_bird"
    NORMAL = "normal"
    NIGHT_OWL = "night_owl"
    IRREGULAR = "irregular"


class SocialLevel(str, enum.Enum):
    VERY_PRIVATE = "very_private"
    BALANCED = "balanced"
    VERY_SOCIAL = "very_social"


class SmokingPreference(str, enum.Enum):
    NO_SMOKING = "no_smoking"
    OK_OUTSIDE = "ok_outside"
    INDOOR_OK = "indoor_ok"


class PetsPreference(str, enum.Enum):
    NO_PETS = "no_pets"
    HAS_PET = "has_pet"
    OK_WITH_PETS = "ok_with_pets"


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class PreferredGender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    ANY = "any"


class HousingType(str, enum.Enum):
    ENTIRE_APARTMENT = "entire_apartment"
    PRIVATE_ROOM = "private_room"
    SHARED_ROOM = "shared_room"
    STUDIO = "studio"
    ANY = "any"


class MaxRoommates(str, enum.Enum):
    SOLO = "solo"
    ONE = "one"
    TWO = "two"
    THREE_PLUS = "three_plus"
    ANY = "any"


class Diet(str, enum.Enum):
    OMNIVORE = "omnivore"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    HALAL = "halal"
    KOSHER = "kosher"
    OTHER = "other"


class WorkType(str, enum.Enum):
    STUDENT = "student"
    FREELANCER = "freelancer"
    FULL_TIME_ONSITE = "full_time_onsite"
    FULL_TIME_REMOTE = "full_time_remote"
    PART_TIME = "part_time"
    UNEMPLOYED = "unemployed"
    OTHER = "other"


class HomePresence(str, enum.Enum):
    MOSTLY_HOME = "mostly_home"
    EVENINGS_ONLY = "evenings_only"
    WEEKENDS_ONLY = "weekends_only"
    RARELY_HOME = "rarely_home"


# ===== Helper : force SQLAlchemy à utiliser les VALEURS (lowercase) =====
def _enum_column(enum_cls, enum_name: str):
    """
    Config pour les enums Postgres existants :
    - name : le nom exact du type dans Postgres
    - values_callable : utiliser les .value (lowercase) et non les .name (uppercase)
    - create_type=False : ne pas tenter de recréer le type (il existe déjà)
    """
    return Enum(
        enum_cls,
        name=enum_name,
        values_callable=lambda x: [e.value for e in x],
        create_type=False,
    )


# ===== Main model =====

class Profile(Base):
    __tablename__ = "profiles"

    # Identity
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), unique=True, nullable=False, index=True)

    # Basic info
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[Gender] = mapped_column(_enum_column(Gender, "gender"), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Location & budget
    target_city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    target_country: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    search_radius_km: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    budget_min_eur: Mapped[int] = mapped_column(Integer, nullable=False)
    budget_max_eur: Mapped[int] = mapped_column(Integer, nullable=False)
    move_in_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    lease_duration_months: Mapped[int] = mapped_column(Integer, nullable=False)

    # 7 lifestyle dimensions
    # IMPORTANT : pour les enums existants SANS suffixe _enum, on utilise le nom
    # par défaut SQLAlchemy (lifestylelevel, etc.) avec values lowercase
    cleanliness: Mapped[LifestyleLevel] = mapped_column(_enum_column(LifestyleLevel, "lifestylelevel"), nullable=False)
    sleep_schedule: Mapped[SleepSchedule] = mapped_column(_enum_column(SleepSchedule, "sleepschedule"), nullable=False)
    social_level: Mapped[SocialLevel] = mapped_column(_enum_column(SocialLevel, "sociallevel"), nullable=False)
    noise_tolerance: Mapped[LifestyleLevel] = mapped_column(_enum_column(LifestyleLevel, "lifestylelevel"), nullable=False)
    smoking: Mapped[SmokingPreference] = mapped_column(_enum_column(SmokingPreference, "smokingpreference"), nullable=False)
    pets: Mapped[PetsPreference] = mapped_column(_enum_column(PetsPreference, "petspreference"), nullable=False)
    guests_frequency: Mapped[LifestyleLevel] = mapped_column(_enum_column(LifestyleLevel, "lifestylelevel"), nullable=False)

    # Préférences coloc - enums avec suffixe _enum
    preferred_gender: Mapped[PreferredGender] = mapped_column(
        _enum_column(PreferredGender, "preferred_gender_enum"),
        nullable=False,
        default=PreferredGender.ANY,
    )
    housing_type: Mapped[HousingType] = mapped_column(
        _enum_column(HousingType, "housing_type_enum"),
        nullable=False,
        default=HousingType.ANY,
    )
    preferred_age_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    preferred_age_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_roommates: Mapped[MaxRoommates | None] = mapped_column(
        _enum_column(MaxRoommates, "max_roommates_enum"),
        nullable=True,
    )

    # À propos de toi - enums avec suffixe _enum
    work_type: Mapped[WorkType | None] = mapped_column(_enum_column(WorkType, "work_type_enum"), nullable=True)
    home_presence: Mapped[HomePresence | None] = mapped_column(_enum_column(HomePresence, "home_presence_enum"), nullable=True)
    diet: Mapped[Diet | None] = mapped_column(_enum_column(Diet, "diet_enum"), nullable=True, index=True)

    # Personnalité
    hobbies: Mapped[list[str]] = mapped_column(ARRAY(String(50)), nullable=False, default=list)
    looking_for: Mapped[str | None] = mapped_column(Text, nullable=True)
    dealbreakers: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Social
    linkedin_url: Mapped[str | None] = mapped_column(String(200), nullable=True)
    instagram_handle: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Extras
    languages_spoken: Mapped[list[str]] = mapped_column(ARRAY(String(10)), nullable=False, default=list)
    occupation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    whatsapp_number: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # State
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Profile {self.full_name} ({self.target_city})>"