"""
🤖 LLM Explainer v2 - Phase 1 complete

Prompt enrichi :
- Hobbies communs → explication mentionne les intérêts partagés
- "What I'm looking for" → le LLM comprend les attentes
- Dealbreakers → warnings explicites si conflit potentiel
- Diet, home_presence, work_type → contexte personnalité
"""

from openai import AsyncOpenAI

from app.core.config import settings
from app.models.profile import Profile
from app.services.scoring_engine import MatchingScore

_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def _common_hobbies(user_a: Profile, user_b: Profile) -> list[str]:
    """Retourne les hobbies en commun."""
    a = set(user_a.hobbies or [])
    b = set(user_b.hobbies or [])
    return sorted(a & b)


def _profile_summary(p: Profile, language: str) -> str:
    """Génère un résumé structuré du profil pour le prompt."""
    parts = []
    parts.append(f"Name: {p.full_name}, Age: {p.age}, Gender: {p.gender.value}")
    if p.occupation:
        parts.append(f"Occupation: {p.occupation}")
    if p.work_type:
        parts.append(f"Work situation: {p.work_type.value.replace('_', ' ')}")
    if p.home_presence:
        parts.append(f"Home presence: {p.home_presence.value.replace('_', ' ')}")
    if p.diet:
        parts.append(f"Diet: {p.diet.value}")
    parts.append(f"Budget: €{p.budget_min_eur}-{p.budget_max_eur}/month in {p.target_city}")
    parts.append(f"Sleep: {p.sleep_schedule.value}, Cleanliness: {p.cleanliness.value}")
    parts.append(f"Social: {p.social_level.value}, Smoking: {p.smoking.value}, Pets: {p.pets.value}")
    if p.hobbies:
        parts.append(f"Hobbies: {', '.join(p.hobbies)}")
    if p.bio:
        parts.append(f"Bio: {p.bio[:200]}")
    if p.looking_for:
        parts.append(f"Looking for in a roommate: {p.looking_for[:300]}")
    if p.dealbreakers:
        parts.append(f"Dealbreakers: {p.dealbreakers[:300]}")
    return "\n- " + "\n- ".join(parts)


def _build_prompt(
    user_a: Profile,
    user_b: Profile,
    matching_score: MatchingScore,
    language: str = "fr",
) -> str:
    """
    Prompt enrichi qui donne au LLM tout le contexte nécessaire
    pour produire une explication personnalisée et insightful.
    """
    breakdown_text = "\n".join(
        f"- {d.label}: {d.score:.0f}/100 (weight {d.weight * 100:.0f}%)"
        for d in matching_score.breakdown
    )

    common = _common_hobbies(user_a, user_b)
    common_hobbies_text = (
        f"\n\nShared hobbies: {', '.join(common)}" if common else ""
    )

    # Warnings basés sur les dealbreakers croisés
    dealbreaker_warnings = []
    if user_a.dealbreakers:
        dealbreaker_warnings.append(
            f"Profile A explicitly mentioned they don't want: {user_a.dealbreakers[:200]}"
        )
    if user_b.dealbreakers:
        dealbreaker_warnings.append(
            f"Profile B explicitly mentioned they don't want: {user_b.dealbreakers[:200]}"
        )
    dealbreakers_text = (
        "\n\nImportant dealbreakers to consider:\n" + "\n".join(dealbreaker_warnings)
        if dealbreaker_warnings
        else ""
    )

    if language == "fr":
        return f"""Tu es un conseiller expert en cohabitation. Analyse la compatibilité entre ces deux personnes qui cherchent à devenir colocataires.

**Profile A :**
{_profile_summary(user_a, language)}

**Profile B :**
{_profile_summary(user_b, language)}

**Score calculé : {matching_score.total_score:.0f}/100**
{breakdown_text}
{common_hobbies_text}
{dealbreakers_text}

Rédige une explication chaleureuse et personnalisée (3-5 phrases max) destinée au Profile A, en français.
Mentionne :
1. Les vrais points forts de compatibilité (cite des détails spécifiques : hobbies communs, budget, horaires...)
2. Les points d'attention éventuels (sans être négatif)
3. Un conseil concret pour bien démarrer

Important :
- Sois naturel et chaleureux, pas robotique
- Utilise les détails personnels des profils (hobbies, bio, looking_for)
- Si des dealbreakers sont mentionnés, assure-toi de rassurer
- Ne donne PAS de chiffres/scores numériques
- Réponds UNIQUEMENT avec l'explication, pas de préambule"""

    elif language == "es":
        return f"""Eres un consejero experto en convivencia. Analiza la compatibilidad entre estas dos personas que buscan ser compañeros de piso.

**Profile A:**
{_profile_summary(user_a, language)}

**Profile B:**
{_profile_summary(user_b, language)}

**Score calculated: {matching_score.total_score:.0f}/100**
{breakdown_text}
{common_hobbies_text}
{dealbreakers_text}

Escribe una explicación cálida y personalizada (3-5 frases máximo) para el Profile A, en español.
Menciona los puntos fuertes, los puntos de atención, y un consejo concreto. Sé natural, no menciones números."""

    elif language == "ar":
        return f"""أنت مستشار خبير في العيش المشترك. حلل التوافق بين هذين الشخصين اللذين يريدان أن يصبحا شريكي سكن.

**Profile A:**
{_profile_summary(user_a, language)}

**Profile B:**
{_profile_summary(user_b, language)}

**Score: {matching_score.total_score:.0f}/100**
{breakdown_text}
{common_hobbies_text}
{dealbreakers_text}

اكتب شرحاً ودياً وشخصياً (3-5 جمل كحد أقصى) للشخص A، باللغة العربية.
اذكر نقاط القوة في التوافق والنقاط التي يجب الانتباه إليها ونصيحة ملموسة. كن طبيعياً ولا تذكر أرقاماً."""

    else:  # English
        return f"""You are an expert roommate compatibility advisor. Analyze the compatibility between these two potential roommates.

**Profile A:**
{_profile_summary(user_a, language)}

**Profile B:**
{_profile_summary(user_b, language)}

**Calculated score: {matching_score.total_score:.0f}/100**
{breakdown_text}
{common_hobbies_text}
{dealbreakers_text}

Write a warm, personalized 3-5 sentence explanation for Profile A, in English.
Mention:
1. Real compatibility strengths (cite specific details: shared hobbies, budget, schedules...)
2. Any watch-outs (stay positive)
3. A concrete tip to start well

Important:
- Be natural and warm, not robotic
- Use personal details from profiles (hobbies, bio, looking_for)
- If dealbreakers are mentioned, address them reassuringly
- Do NOT give numerical scores
- Reply ONLY with the explanation, no preamble"""


async def generate_explanation(
    user_a: Profile,
    user_b: Profile,
    matching_score: MatchingScore,
    language: str = "fr",
) -> str:
    client = get_openai_client()
    prompt = _build_prompt(user_a, user_b, matching_score, language)

    system_msgs = {
        "fr": "Tu es un conseiller bienveillant en cohabitation étudiante.",
        "en": "You are a friendly roommate compatibility advisor.",
        "es": "Eres un consejero amable de convivencia.",
        "ar": "أنت مستشار ودي للعيش المشترك.",
    }

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_msgs.get(language, system_msgs["en"])},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=250,
    )

    explanation = response.choices[0].message.content or ""
    return explanation.strip()


def generate_fallback_explanation(
    matching_score: MatchingScore, language: str = "fr"
) -> str:
    """Fallback si OpenAI plante."""
    sorted_dims = sorted(matching_score.breakdown, key=lambda d: d.score, reverse=True)
    best = sorted_dims[0]
    worst = sorted_dims[-1]

    templates = {
        "fr": {
            "high": f"Très bonne compatibilité ! Votre meilleur point commun : {best.label.lower()}. Pensez à discuter de {worst.label.lower()}.",
            "mid": f"Compatibilité correcte. Vous vous rejoignez sur {best.label.lower()}, attention à {worst.label.lower()}.",
            "low": f"Compatibilité limitée. Votre différence principale concerne {worst.label.lower()}. Une discussion approfondie est recommandée.",
        },
        "en": {
            "high": f"Great compatibility! Your strongest alignment is on {best.label.lower()}. Discuss {worst.label.lower()}.",
            "mid": f"Decent compatibility. You align on {best.label.lower()}, watch out for {worst.label.lower()}.",
            "low": f"Limited compatibility. Your main difference is on {worst.label.lower()}. A thorough discussion is recommended.",
        },
        "es": {
            "high": f"¡Gran compatibilidad! Vuestro mejor punto en común: {best.label.lower()}. Hablad de {worst.label.lower()}.",
            "mid": f"Compatibilidad correcta. Coincidís en {best.label.lower()}, atención a {worst.label.lower()}.",
            "low": f"Compatibilidad limitada. Vuestra diferencia principal: {worst.label.lower()}. Se recomienda discusión.",
        },
        "ar": {
            "high": f"توافق ممتاز! أقوى نقطة مشتركة: {best.label}. ناقشا {worst.label}.",
            "mid": f"توافق جيد. تتوافقان في {best.label}، انتبها إلى {worst.label}.",
            "low": f"توافق محدود. الاختلاف الرئيسي: {worst.label}. يُنصح بالمناقشة.",
        },
    }

    lang_templates = templates.get(language, templates["en"])
    if matching_score.total_score >= 75:
        return lang_templates["high"]
    elif matching_score.total_score >= 50:
        return lang_templates["mid"]
    else:
        return lang_templates["low"]