"""
Schémas Pydantic v3 - Phase 1 complete avec tous les champs.

Validation renforcée :
- LinkedIn URL doit matcher le pattern linkedin.com/in/...
- Instagram handle : alphanumeric + underscores + dots
- Hobbies : max 10 tags
- Age preferences : min <= max si renseignés
"""

import re
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.profile import (
    Diet,
    Gender,
    HomePresence,
    HousingType,
    LifestyleLevel,
    MaxRoommates,
    PetsPreference,
    PreferredGender,
    SleepSchedule,
    SmokingPreference,
    SocialLevel,
    WorkType,
)


LINKEDIN_PATTERN = re.compile(
    r"^https?://(www\.)?linkedin\.com/(in|pub)/[a-zA-Z0-9\-_À-ÿ]+/?$"
)
INSTAGRAM_HANDLE_PATTERN = re.compile(r"^@?[a-zA-Z0-9._]{1,30}$")


class ProfileBase(BaseModel):
    # ===== Basic =====
    full_name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=18, le=100)
    gender: Gender
    bio: str | None = Field(None, max_length=1000)
    photo_url: str | None = Field(None, max_length=500)
    avatar_url: str | None = None

    # ===== Location =====
    target_city: str = Field(..., min_length=2, max_length=100)
    target_country: str = Field(..., min_length=2, max_length=100)
    district: str | None = Field(None, max_length=100)
    search_radius_km: int = Field(default=0, ge=0, le=100)

    # ===== Budget & dates =====
    budget_min_eur: int = Field(..., ge=100, le=10000)
    budget_max_eur: int = Field(..., ge=100, le=10000)
    move_in_date: date
    lease_duration_months: int = Field(..., ge=1, le=60)

    # ===== 7 dimensions =====
    cleanliness: LifestyleLevel
    sleep_schedule: SleepSchedule
    social_level: SocialLevel
    noise_tolerance: LifestyleLevel
    smoking: SmokingPreference
    pets: PetsPreference
    guests_frequency: LifestyleLevel

    # ===== Préférences coloc =====
    preferred_gender: PreferredGender = PreferredGender.ANY
    housing_type: HousingType = HousingType.ANY
    preferred_age_min: int | None = Field(None, ge=18, le=100)
    preferred_age_max: int | None = Field(None, ge=18, le=100)
    max_roommates: MaxRoommates | None = None

    # ===== À propos de toi =====
    work_type: WorkType | None = None
    home_presence: HomePresence | None = None
    diet: Diet | None = None

    # ===== Personnalité =====
    hobbies: list[str] = Field(default_factory=list, max_length=10)
    looking_for: str | None = Field(None, max_length=500)
    dealbreakers: str | None = Field(None, max_length=500)

    # ===== Social =====
    linkedin_url: str | None = Field(None, max_length=200)
    instagram_handle: str | None = Field(None, max_length=50)

    # ===== Extras =====
    languages_spoken: list[str] = Field(default_factory=list, max_length=10)
    occupation: str | None = Field(None, max_length=100)
    whatsapp_number: str | None = Field(None, max_length=30)

    # ----- Validators -----

    @field_validator("budget_max_eur")
    @classmethod
    def validate_budget_range(cls, v: int, info) -> int:
        if "budget_min_eur" in info.data and v < info.data["budget_min_eur"]:
            raise ValueError("budget_max_eur must be >= budget_min_eur")
        return v

    @field_validator("move_in_date")
    @classmethod
    def validate_move_in_date(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("move_in_date cannot be in the past")
        return v

    @field_validator("languages_spoken")
    @classmethod
    def validate_languages(cls, v: list[str]) -> list[str]:
        return [lang.upper().strip() for lang in v if lang.strip()]

    @field_validator("hobbies")
    @classmethod
    def validate_hobbies(cls, v: list[str]) -> list[str]:
        # Normalize: lowercase, strip, dedupe
        seen = set()
        result = []
        for h in v:
            h = h.strip().lower()
            if h and h not in seen:
                seen.add(h)
                result.append(h)
        return result

    @field_validator("linkedin_url")
    @classmethod
    def validate_linkedin(cls, v: str | None) -> str | None:
        if not v:
            return None
        v = v.strip()
        if not LINKEDIN_PATTERN.match(v):
            raise ValueError(
                "LinkedIn URL must look like https://linkedin.com/in/your-profile"
            )
        return v

    @field_validator("instagram_handle")
    @classmethod
    def validate_instagram(cls, v: str | None) -> str | None:
        if not v:
            return None
        v = v.strip().lstrip("@")
        if not INSTAGRAM_HANDLE_PATTERN.match(f"@{v}"):
            raise ValueError(
                "Instagram handle contains invalid characters"
            )
        return v

    @field_validator("whatsapp_number")
    @classmethod
    def validate_whatsapp(cls, v: str | None) -> str | None:
        if not v:
            return None
        v = v.strip().replace(" ", "").replace("-", "")
        if not v.lstrip("+").isdigit():
            raise ValueError("whatsapp_number must contain only digits")
        if len(v) < 7 or len(v) > 20:
            raise ValueError("whatsapp_number length invalid")
        return v

    @model_validator(mode="after")
    def validate_age_preferences(self):
        """Si les deux prefs d'âge sont renseignées, vérifier min <= max."""
        if self.preferred_age_min is not None and self.preferred_age_max is not None:
            if self.preferred_age_min > self.preferred_age_max:
                raise ValueError(
                    "preferred_age_min must be <= preferred_age_max"
                )
        # Either both or none
        if (self.preferred_age_min is None) != (self.preferred_age_max is None):
            raise ValueError(
                "preferred_age_min and preferred_age_max must be both set or both empty"
            )
        return self


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    """Tous les champs optionnels pour PATCH."""
    full_name: str | None = Field(None, min_length=2, max_length=100)
    age: int | None = Field(None, ge=18, le=100)
    gender: Gender | None = None
    bio: str | None = Field(None, max_length=1000)
    photo_url: str | None = Field(None, max_length=500)
    avatar_url: str | None = None
    target_city: str | None = Field(None, min_length=2, max_length=100)
    target_country: str | None = Field(None, min_length=2, max_length=100)
    district: str | None = Field(None, max_length=100)
    search_radius_km: int | None = Field(None, ge=0, le=100)
    budget_min_eur: int | None = Field(None, ge=100, le=10000)
    budget_max_eur: int | None = Field(None, ge=100, le=10000)
    move_in_date: date | None = None
    lease_duration_months: int | None = Field(None, ge=1, le=60)
    cleanliness: LifestyleLevel | None = None
    sleep_schedule: SleepSchedule | None = None
    social_level: SocialLevel | None = None
    noise_tolerance: LifestyleLevel | None = None
    smoking: SmokingPreference | None = None
    pets: PetsPreference | None = None
    guests_frequency: LifestyleLevel | None = None
    preferred_gender: PreferredGender | None = None
    housing_type: HousingType | None = None
    preferred_age_min: int | None = Field(None, ge=18, le=100)
    preferred_age_max: int | None = Field(None, ge=18, le=100)
    max_roommates: MaxRoommates | None = None
    work_type: WorkType | None = None
    home_presence: HomePresence | None = None
    diet: Diet | None = None
    hobbies: list[str] | None = Field(None, max_length=10)
    looking_for: str | None = Field(None, max_length=500)
    dealbreakers: str | None = Field(None, max_length=500)
    linkedin_url: str | None = Field(None, max_length=200)
    instagram_handle: str | None = Field(None, max_length=50)
    languages_spoken: list[str] | None = Field(None, max_length=10)
    occupation: str | None = Field(None, max_length=100)
    whatsapp_number: str | None = Field(None, max_length=30)
    is_active: bool | None = None


class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)