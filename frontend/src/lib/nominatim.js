/**
 * Nominatim API helper (OpenStreetMap)
 *
 * Valide qu'une ville existe réellement dans un pays donné.
 * Gratuit, sans clé API, mais avec rate limit strict (1 req/sec).
 *
 * Documentation : https://nominatim.org/release-docs/develop/api/Search/
 *
 * Politique d'usage :
 * - Max 1 requête par seconde
 * - User-Agent obligatoire et identifiable
 * - Interdit de faire du bulk geocoding
 * - Nous : usage humain occasionnel = OK
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'RoommateFinderAI/1.0 (contact: bilal.kanba@example.com)'

// Cache en mémoire pour éviter de re-requêter la même ville
const cache = new Map()

/**
 * Vérifie qu'une ville existe dans un pays donné.
 *
 * @param {string} cityName - Nom de la ville (ex: "Ahfir")
 * @param {string} countryName - Nom du pays en anglais (ex: "Morocco")
 * @param {string} countryCode - Code ISO du pays (ex: "MA", "NO")
 * @returns {Promise<{isValid: boolean, officialName?: string, lat?: number, lon?: number, alternatives?: string[]}>}
 */
export async function verifyCityInCountry(cityName, countryName, countryCode) {
  if (!cityName || !countryName) {
    return { isValid: false, reason: 'missing_params' }
  }

  const normalizedCity = cityName.trim().toLowerCase()
  const normalizedCountry = countryName.trim().toLowerCase()
  const cacheKey = `${normalizedCity}|${normalizedCountry}`

  // Vérifie le cache
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  try {
    const params = new URLSearchParams({
      city: cityName,
      country: countryName,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      'accept-language': 'en',
    })

    const url = `${NOMINATIM_BASE_URL}?${params}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      // En cas d'erreur API, on accepte la ville (fail open)
      // On ne veut pas bloquer l'utilisateur si Nominatim est down
      console.warn('[Nominatim] API error:', response.status)
      return { isValid: true, reason: 'api_unavailable', officialName: cityName }
    }

    const results = await response.json()

    if (!Array.isArray(results) || results.length === 0) {
      // Aucun résultat → ville n'existe pas dans ce pays
      // Chercher des alternatives : dans quel pays cette ville existe-t-elle ?
      const alternatives = await findCityAlternatives(cityName)
      const result = {
        isValid: false,
        reason: 'city_not_in_country',
        alternatives,
      }
      cache.set(cacheKey, result)
      return result
    }

    // On vérifie que le pays retourné matche bien le pays demandé
    const bestMatch = results[0]
    const returnedCountryCode = (bestMatch.address?.country_code || '').toUpperCase()

    if (countryCode && returnedCountryCode && returnedCountryCode !== countryCode.toUpperCase()) {
      // Nominatim a trouvé la ville mais dans un autre pays
      const alternatives = [
        `${cityName}, ${bestMatch.address?.country || returnedCountryCode}`,
      ]
      const result = {
        isValid: false,
        reason: 'city_in_different_country',
        alternatives,
      }
      cache.set(cacheKey, result)
      return result
    }

    // Match confirmé
    const officialName =
      bestMatch.address?.city ||
      bestMatch.address?.town ||
      bestMatch.address?.village ||
      bestMatch.display_name?.split(',')[0]?.trim() ||
      cityName

    const result = {
      isValid: true,
      officialName,
      lat: parseFloat(bestMatch.lat),
      lon: parseFloat(bestMatch.lon),
    }
    cache.set(cacheKey, result)
    return result
  } catch (error) {
    console.error('[Nominatim] Fetch error:', error)
    // Fail open : si erreur réseau, on accepte
    return { isValid: true, reason: 'network_error', officialName: cityName }
  }
}

/**
 * Cherche dans quel(s) pays une ville existe (pour proposer des alternatives).
 * Retourne max 3 propositions au format "Ville, Pays".
 */
async function findCityAlternatives(cityName) {
  try {
    const params = new URLSearchParams({
      city: cityName,
      format: 'json',
      addressdetails: '1',
      limit: '3',
      'accept-language': 'en',
    })

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!response.ok) return []
    const results = await response.json()
    if (!Array.isArray(results)) return []

    // Dédupliquer par pays
    const seen = new Set()
    const alternatives = []
    for (const r of results) {
      const country = r.address?.country
      const city =
        r.address?.city || r.address?.town || r.address?.village || cityName
      if (country && !seen.has(country)) {
        seen.add(country)
        alternatives.push(`${city}, ${country}`)
      }
    }
    return alternatives.slice(0, 3)
  } catch {
    return []
  }
}

/**
 * Debounced version : évite de spammer l'API à chaque frappe.
 * Utile si on veut valider "à la volée".
 */
let debounceTimer = null
export function verifyCityInCountryDebounced(cityName, countryName, countryCode, delay = 600) {
  return new Promise((resolve) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const result = await verifyCityInCountry(cityName, countryName, countryCode)
      resolve(result)
    }, delay)
  })
}