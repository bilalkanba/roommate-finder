/**
 * CityAutocomplete v3 — With Nominatim validation
 *
 * Nouveautés :
 * - Validation ville + pays via OpenStreetMap Nominatim API
 * - Rejet si la ville n'existe pas dans le pays choisi
 * - Propose des alternatives si Nominatim trouve la ville dans un autre pays
 * - Loading state pendant la vérification
 * - Cache pour éviter de re-requêter
 */

import { useEffect, useRef, useState } from 'react'
import { COUNTRY_FLAGS, searchCities, cityExists } from '@/lib/europeanUniversityCities'
import { validateCustomCity } from '@/lib/validations'
import { verifyCityInCountry } from '@/lib/nominatim'
import { WORLD_COUNTRIES_SORTED } from '@/lib/worldCountries'

// Utilise la liste mondiale des pays (~250)
const COUNTRIES = WORLD_COUNTRIES_SORTED

export default function CityAutocomplete({ value, onChange, placeholder = 'Rechercher ta ville...', error }) {
  const [query, setQuery] = useState(value?.city || '')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [results, setResults] = useState([])
  const [showCustomModal, setShowCustomModal] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setQuery(value?.city || '')
  }, [value?.city])

  useEffect(() => {
    setResults(searchCities(query, 15))
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (city) => {
    setQuery(city.name)
    onChange({ city: city.name, country: city.country, countryCode: city.code })
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (open && results[activeIdx]) {
        handleSelect(results[activeIdx])
      }
      return
    }

    if (!open) {
      if (e.key === 'ArrowDown') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const shouldShowCustomOption = query.length >= 2 && !cityExists(query)

  return (
    <>
      <div ref={containerRef} className="relative">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`input-lg pl-10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            autoComplete="off"
            spellCheck="false"
          />
          {value?.countryCode && !open && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
              {COUNTRY_FLAGS[value.countryCode]}
            </div>
          )}
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden animate-fade-in max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <>
                {results.map((city, i) => (
                  <button
                    key={`${city.name}-${city.code}`}
                    type="button"
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === activeIdx ? 'bg-emerald-50' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xl">{COUNTRY_FLAGS[city.code] || '🏴'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {city.name}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-2">
                        <span>{city.country}</span>
                        {city.students && (
                          <>
                            <span className="text-neutral-300">·</span>
                            <span className="text-emerald-600">
                              🎓 ~{city.students}k étudiants
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {i === activeIdx && (
                      <span className="text-xs text-emerald-600 font-medium">↵</span>
                    )}
                  </button>
                ))}

                {shouldShowCustomOption && (
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left border-t border-neutral-200 bg-neutral-50 hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-xl">➕</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900">
                        Ajouter "{query}" comme ville personnalisée
                      </div>
                      <div className="text-xs text-neutral-500">
                        Vérifiée automatiquement via OpenStreetMap
                      </div>
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div>
                <div className="p-4 text-sm text-neutral-500 text-center">
                  Aucune ville trouvée pour "{query}"
                </div>
                {shouldShowCustomOption && (
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left border-t border-neutral-200 bg-neutral-50 hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-xl">➕</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900">
                        Ajouter "{query}" comme ville personnalisée
                      </div>
                      <div className="text-xs text-neutral-500">
                        Vérifiée automatiquement via OpenStreetMap
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showCustomModal && (
        <CustomCityModal
          initialCityName={query}
          onCancel={() => setShowCustomModal(false)}
          onConfirm={({ city, countryCode, countryName }) => {
            setQuery(city)
            onChange({ city, country: countryName, countryCode })
            setShowCustomModal(false)
            setOpen(false)
          }}
        />
      )}
    </>
  )
}

// ============================================================
// Modal avec validation Nominatim
// ============================================================

function CustomCityModal({ initialCityName, onCancel, onConfirm }) {
  const [cityName, setCityName] = useState(initialCityName)
  const [countryCode, setCountryCode] = useState('')
  const [errors, setErrors] = useState({ city: null, country: null, verify: null })
  const [verifying, setVerifying] = useState(false)
  const [alternatives, setAlternatives] = useState([])

  const handleConfirm = async () => {
    setErrors({ city: null, country: null, verify: null })
    setAlternatives([])

    // 1. Validation locale du format
    const cityCheck = validateCustomCity(cityName)
    const countryCheck = countryCode ? true : 'Sélectionne un pays'

    if (cityCheck !== true || countryCheck !== true) {
      setErrors({
        city: cityCheck !== true ? cityCheck : null,
        country: countryCheck !== true ? countryCheck : null,
        verify: null,
      })
      return
    }

    const country = COUNTRIES.find(c => c.code === countryCode)
    if (!country) return

    // 2. Validation Nominatim (async)
    setVerifying(true)
    try {
      const result = await verifyCityInCountry(cityName.trim(), country.name, countryCode)
      setVerifying(false)

      if (!result.isValid) {
        // Ville n'existe pas dans ce pays
        let message = `"${cityName}" n'existe pas en ${country.name}.`
        if (result.reason === 'city_in_different_country') {
          message = `"${cityName}" n'existe pas en ${country.name}, mais existe dans un autre pays.`
        }
        setErrors({ city: null, country: null, verify: message })
        setAlternatives(result.alternatives || [])
        return
      }

      // 3. Succès : on confirme avec le nom officiel (si Nominatim a corrigé)
      onConfirm({
        city: result.officialName || cityName.trim(),
        countryCode,
        countryName: country.name,
      })
    } catch (err) {
      setVerifying(false)
      console.error('[CityValidation] Error:', err)
      // Fail open : si erreur, on accepte quand même pour ne pas bloquer
      onConfirm({
        city: cityName.trim(),
        countryCode,
        countryName: country.name,
      })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && !verifying && onCancel()}
    >
      <div className="fixed inset-0 bg-black/40 animate-fade-in" onClick={() => !verifying && onCancel()}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Ajouter ta ville</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Vérification automatique via OpenStreetMap
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={verifying}
            className="text-neutral-400 hover:text-neutral-600 p-1 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nom de la ville
            </label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => {
                setCityName(e.target.value)
                setErrors({ ...errors, city: null, verify: null })
                setAlternatives([])
              }}
              className={`input-lg ${errors.city ? 'border-red-300' : ''}`}
              placeholder="Exemple : Oujda, Casablanca..."
              autoFocus
              disabled={verifying}
            />
            {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
            <p className="text-xs text-neutral-500 mt-1">
              Lettres uniquement (accents et apostrophes autorisés)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Pays
            </label>
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value)
                setErrors({ ...errors, country: null, verify: null })
                setAlternatives([])
              }}
              disabled={verifying}
              className={`input-lg ${errors.country ? 'border-red-300' : ''}`}
            >
              <option value="">-- Sélectionne un pays --</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
          </div>

          {/* Erreur Nominatim + alternatives */}
          {errors.verify && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">
                    {errors.verify}
                  </p>
                  {alternatives.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-700 mb-1">Suggestions :</p>
                      <ul className="text-xs text-red-700 space-y-0.5">
                        {alternatives.map((alt, i) => (
                          <li key={i}>• {alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={verifying}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={verifying}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Vérification...</span>
                </>
              ) : (
                'Ajouter'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}