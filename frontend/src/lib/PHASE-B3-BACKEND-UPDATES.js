/**
 * Updates nécessaires pour supporter ProfilePage :
 *
 * 1. FRONTEND : frontend/src/lib/api.js
 *    - Ajouter profilesApi.getById(id)
 *    - Ajouter matchesApi.getDetails(userId, params)
 *
 * 2. BACKEND : backend/app/api/profiles.py
 *    - Ajouter endpoint GET /profiles/{id}
 *
 * 3. BACKEND : backend/app/api/matches.py
 *    - Ajouter endpoint GET /matches/details/{other_user_id}
 *
 * 4. FRONTEND : frontend/src/App.jsx
 *    - Ajouter route <Route path="/profile/:id" element={<ProfilePage />} />
 *
 * Ce fichier contient les snippets à copier-coller.
 */


// ============================================================
// 1. FRONTEND : frontend/src/lib/api.js
// ============================================================
// Ajouter ces méthodes à profilesApi et matchesApi :

/*
export const profilesApi = {
  // ... existing methods

  // NEW : Récupère un profil par son ID
  getById: async (id) => {
    const { data } = await client.get(`/profiles/${id}`)
    return data
  },
}

export const matchesApi = {
  // ... existing methods

  // NEW : Récupère les détails de match avec un autre user
  getDetails: async (otherUserId, params = {}) => {
    const { data } = await client.get(`/matches/details/${otherUserId}`, { params })
    return data
  },
}
*/


// ============================================================
// 2. BACKEND : backend/app/api/profiles.py
// ============================================================
// Ajouter cet endpoint (n'importe où dans le fichier) :

/*
from uuid import UUID
from fastapi import HTTPException

@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile_by_id(
    profile_id: UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Récupère un profil public par son ID."""
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not profile.is_active:
        raise HTTPException(status_code=404, detail="Profile not available")
    return profile
*/


// ============================================================
// 3. BACKEND : backend/app/api/matches.py
// ============================================================
// Ajouter cet endpoint :

/*
from uuid import UUID
from fastapi import HTTPException

@router.get("/details/{other_user_id}", response_model=MatchDetail)
async def get_match_details(
    other_user_id: UUID,
    language: str = "fr",
    with_explanation: bool = True,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """
    Retourne les détails de match entre l'utilisateur courant et other_user_id.
    Utilisé par la page ProfilePage.
    """
    from app.services.matching_service import calculate_and_explain

    # Profil du user courant
    my_profile = db.query(Profile).filter(Profile.user_id == user["id"]).first()
    if not my_profile:
        raise HTTPException(status_code=404, detail="Your profile not found")

    # Profil de l'autre user
    other_profile = db.query(Profile).filter(Profile.user_id == other_user_id).first()
    if not other_profile:
        raise HTTPException(status_code=404, detail="Other profile not found")

    # Calcule le match
    result = await calculate_and_explain(
        my_profile, other_profile,
        language=language,
        with_explanation=with_explanation,
    )

    return result
*/


// ============================================================
// 4. FRONTEND : frontend/src/App.jsx
// ============================================================
// Ajouter cette route dans <Routes> :

/*
import ProfilePage from './pages/ProfilePage'

// Dans <Routes> :
<Route path="/profile/:id" element={<ProfilePage />} />
*/

// NOTE : ta route actuelle "/profile" (pour créer/éditer son propre profil) doit rester.
// La nouvelle route "/profile/:id" est pour voir le profil d'un AUTRE user.
// Ta ProfileFormPage garde "/profile" comme route.


// ============================================================
// RENOMMER LES PAGES POUR ÉVITER LA CONFUSION
// ============================================================
//
// Pour clarifier, je te suggère de renommer les fichiers :
//
//   Actuellement:                    Renomme en:
//   ProfileFormPage.jsx        →     ProfileFormPage.jsx  (garde, c'est /profile)
//   (nouveau)                        ProfilePage.jsx      (nouveau, c'est /profile/:id)
//
// Route mapping:
//   /profile          → ProfileFormPage (créer/éditer MON profil)
//   /profile/:id      → ProfilePage (voir le profil de quelqu'un d'autre)