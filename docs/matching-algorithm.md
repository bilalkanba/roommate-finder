# Matching Algorithm — Technical Specification

> This document describes the compatibility scoring algorithm used by Roommate Finder AI.

## Design Philosophy

We chose a **hybrid approach** combining deterministic rule-based scoring with LLM-generated explanations, rather than a pure-LLM or pure-ML solution. Here's why:

| Approach       | Pros                                      | Cons                                                    |
|----------------|-------------------------------------------|---------------------------------------------------------|
| Pure LLM       | Easy to build; natural outputs            | Expensive ($0.01–0.03/match), slow (2–4s), inconsistent |
| Pure ML        | Could learn from user feedback            | Cold-start problem; needs thousands of labeled matches  |
| **Hybrid**     | Fast, cheap, explainable, debuggable      | Requires manual weight tuning                           |

The hybrid approach also has an underrated benefit: **every score is auditable**. If a user asks "why did you show me this person?", we can produce a full breakdown, not a black-box answer. This matters for user trust in a product that affects real-life decisions.

## The 7 Dimensions

Each profile is compared across 7 dimensions. The weights were chosen based on common sources of roommate conflict documented in housing research.

| Dimension          | Weight | Rationale                                                                       |
|--------------------|--------|---------------------------------------------------------------------------------|
| **Budget**         | 25%    | Dealbreaker in practice — no match possible if financial expectations differ    |
| **Schedule**       | 20%    | Daily friction source; mismatched sleep patterns erode quality of life fast     |
| **Cleanliness**    | 15%    | Documented as the #1 cause of roommate conflict in student surveys              |
| **Social level**   | 15%    | Personality compatibility — matters for shared-space dynamics                   |
| **Smoking/Pets**   | 10%    | Binary dealbreakers; handled with hard penalties                                |
| **Noise tolerance**| 10%    | Combined with guest frequency — models the "my home is a party" mismatch        |
| **Age**            | 5%     | Weak correlation with lifestyle; not a dealbreaker                              |

Weights sum to 1.00 and this is verified by an assertion at module import time.

## Scoring Functions

### Budget (25%)

We compute the **overlap** between the two budget intervals, normalized by their average range:

```
overlap_min = max(a.budget_min, b.budget_min)
overlap_max = min(a.budget_max, b.budget_max)

if overlap_max < overlap_min:
    score = 0                  # no overlap
else:
    overlap_size = overlap_max - overlap_min
    avg_range = (a.range + b.range) / 2
    score = min(100, (overlap_size / avg_range) * 100)
```

This correctly handles edge cases like two users with fixed budgets that happen to match.

### Schedule (20%)

We use a **precomputed compatibility matrix** between chronotypes. Two early birds get 100, an early bird + night owl gets 40. The matrix is symmetric by construction.

### Cleanliness (15%)

Levels are mapped to numeric values 1–5, and the score is derived from the absolute difference:

| Difference | Score |
|------------|-------|
| 0          | 100   |
| 1          | 85    |
| 2          | 60    |
| 3          | 30    |
| 4          | 0     |

The curve is deliberately non-linear — adjacent levels are nearly perfect matches, but large gaps are penalized heavily.

### Social level (15%)

Precomputed 3×3 matrix. A `very_private` person paired with a `very_social` person scores 30 — not zero, because tolerance varies.

### Smoking & Pets (10%)

This dimension treats dealbreakers explicitly. Scored as the average of two sub-scores:

- **Smoking**: a non-smoker strictly incompatible with an indoor smoker → 0
- **Pets**: a pet-averse person paired with a pet owner → 0

When neither partner has strict preferences, scores default to 100.

### Noise & Guests (10%)

This dimension models an asymmetric conflict: the real issue is not "noise tolerance" in isolation, but the mismatch between *how much noise one person generates* and *how much the other tolerates*.

```
mismatch_ab = max(0, b.guests_frequency - a.noise_tolerance)
mismatch_ba = max(0, a.guests_frequency - b.noise_tolerance)
max_mismatch = max(mismatch_ab, mismatch_ba)
score = max(0, 100 - max_mismatch * 25)
```

### Age (5%)

A tiered function: differences under 4 years score 100, over 20 years score 20. Low weight because age is not causal — it correlates with lifestyle, which is already captured by other dimensions.

## Hard Incompatibilities

Before scoring, we run `is_hard_incompatible()` which eliminates candidates when:

1. Target cities differ (case-insensitive)
2. Budget intervals don't overlap at all
3. Move-in dates are more than 60 days apart

This is both a UX decision (hiding 0% matches is cleaner) and a performance optimization (fewer candidates to score).

## LLM Explanation Layer

After scoring, the top N matches are passed to `llm_explainer.py`, which prompts `gpt-4o-mini` with:

- Both full profiles (structured)
- The computed score + breakdown
- An instruction to produce a 3–4 sentence friendly explanation

Key design decisions:

- **Explanations are generated in parallel** via `asyncio.gather` — 10 explanations in ~2s instead of ~20s sequential
- **Fallback mechanism**: if OpenAI is down or rate-limited, we fall back to a template-based explanation built from the breakdown. The product never breaks.
- **We use `gpt-4o-mini`** (not GPT-4) because the task is narrow enough that the smaller model produces equivalent quality at 10× lower cost
- **We cache explanations in the DB** (planned) keyed by `(user_a, user_b)` — since explanations depend only on profiles, they're stable until either profile changes

## Testing Strategy

The algorithm is covered by **25 unit tests** in `tests/test_scoring_engine.py`:

- Each dimension has dedicated tests for edge cases (perfect match, total mismatch, symmetric cases)
- Integration tests verify that the total score is always in [0, 100]
- A structural test verifies that dimension weights sum to 1.0
- Hard-incompatibility filters are tested separately

Run: `pytest tests/ -v --cov=app`

## Future Improvements

1. **Learned weights**: once we collect user feedback ("was this a good match?"), we can fit weights via logistic regression or a small neural net
2. **Embeddings for bio text**: currently bios are unused in scoring; adding a sentence-transformer similarity would enrich matching
3. **Explanation caching**: store generated explanations in DB to avoid re-calling the LLM on identical profile pairs
4. **A/B testing framework**: allow testing different weight configurations on user cohorts
