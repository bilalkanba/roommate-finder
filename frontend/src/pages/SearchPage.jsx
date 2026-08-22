/**
 * SearchPage — Recherche avancée de colocataires.
 *
 * Layout :
 * - Desktop : sidebar filtres à gauche (sticky) + grid résultats à droite
 * - Mobile : bouton "Filtres" en haut + modal fullscreen
 *
 * Filtrage : client-side (post-API) car l'API backend ne supporte
 * pas encore tous les filtres. À terme, migrer vers query params backend.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { matchesApi, profilesApi } from '@/lib/api'
import MatchCardPremium from '@/components/MatchCardPremium'
import FiltersPanel from '@/components/FiltersPanel'
import FilterChips from '@/components/FilterChips'

const DEFAULT_FILTERS = {
  min_score: 40,
  distance_km: 25,
}

export default function SearchPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const lang = i18n.language

  const cityFromUrl = searchParams.get('city') || null

  const [matches, setMatches] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [savedIds, setSavedIds] = useState(new Set())
  const [sortBy, setSortBy] = useState('score') // 'score' | 'recent' | 'distance'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // ===== Fetch matches =====
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const profile = await profilesApi.getMine().catch(() => null)
        if (!mounted) return
        setCurrentProfile(profile)

        if (!profile) {
          setLoading(false)
          return
        }

        // Fetch large batch, on filtre côté client
        const response = await matchesApi.list({
          limit: 50,
          min_score: 30,
          language: lang,
          with_explanations: true,
        })
        if (!mounted) return
        setMatches(response?.matches || [])
        setLoading(false)
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.detail || err.message)
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [lang])

  // ===== Client-side filtering + sorting =====
  const filteredMatches = useMemo(() => {
    let result = [...matches]

    // Min score
    if (filters.min_score) {
      result = result.filter(m => (m.total_score || 0) >= filters.min_score)
    }

    // Budget
    if (filters.budget_min) {
      result = result.filter(m => (m.profile.budget_max_eur || 0) >= filters.budget_min)
    }
    if (filters.budget_max) {
      result = result.filter(m => (m.profile.budget_min_eur || 0) <= filters.budget_max)
    }

    // Move-in date (± 30 jours)
    if (filters.move_in_date) {
      const target = new Date(filters.move_in_date).getTime()
      const range = 30 * 864e5
      result = result.filter(m => {
        if (!m.profile.move_in_date) return false
        const d = new Date(m.profile.move_in_date).getTime()
        return Math.abs(d - target) <= range
      })
    }

    // Languages (au moins une en commun)
    if (filters.languages?.length > 0) {
      result = result.filter(m => {
        const userLangs = (m.profile.languages_spoken || []).map(l => l.toUpperCase())
        return filters.languages.some(l => userLangs.includes(l.toUpperCase()))
      })
    }

    // Toggles
    if (filters.students_only) {
      result = result.filter(m => m.profile.work_type === 'student')
    }
    if (filters.remote_only) {
      result = result.filter(m => m.profile.work_type === 'full_time_remote')
    }
    if (filters.verified_only) {
      result = result.filter(m => !!m.profile.linkedin_url || !!m.profile.instagram_handle)
    }
    if (filters.pet_friendly) {
      result = result.filter(m =>
        m.profile.pets === 'has_pet' || m.profile.pets === 'ok_with_pets'
      )
    }

    // Radios
    if (filters.smoking) {
      result = result.filter(m => m.profile.smoking === filters.smoking)
    }
    if (filters.diet) {
      result = result.filter(m => m.profile.diet === filters.diet)
    }
    if (filters.housing_type) {
      result = result.filter(m =>
        m.profile.housing_type === filters.housing_type ||
        m.profile.housing_type === 'any'
      )
    }

    // City (depuis URL)
    if (cityFromUrl) {
      result = result.filter(m =>
        m.profile.target_city?.toLowerCase() === cityFromUrl.toLowerCase()
      )
    }

    // Sort
    if (sortBy === 'score') {
      result.sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    } else if (sortBy === 'recent') {
      // Les plus récents en premier (par created_at si dispo)
      result.sort((a, b) => {
        const aDate = new Date(a.profile.created_at || 0).getTime()
        const bDate = new Date(b.profile.created_at || 0).getTime()
        return bDate - aDate
      })
    }

    return result
  }, [matches, filters, sortBy, cityFromUrl])

  const toggleSaved = (profileId) => {
    const newSet = new Set(savedIds)
    if (newSet.has(profileId)) newSet.delete(profileId)
    else newSet.add(profileId)
    setSavedIds(newSet)
  }

  const handleMessage = (profile) => {
    if (profile.whatsapp_number) {
      const msg = encodeURIComponent(
        lang === 'fr'
          ? `Salut ${profile.full_name?.split(' ')[0]} ! On a matché 🏠`
          : `Hi ${profile.full_name?.split(' ')[0]}! We matched 🏠`
      )
      window.open(`https://wa.me/${profile.whatsapp_number.replace('+', '')}?text=${msg}`, '_blank')
    } else {
      alert(lang === 'fr' ? 'Pas de contact partagé' : 'No contact shared')
    }
  }

  const handleView = (profile) => navigate(`/profile/${profile.id}`)

  const handleShare = async (profile) => {
    const url = `${window.location.origin}/profile/${profile.id}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Roommate Finder AI', url }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        alert(lang === 'fr' ? 'Lien copié !' : 'Link copied!')
      } catch {}
    }
  }

  const activeFiltersCount = Object.keys(filters).filter(k => {
    if (k === 'min_score') return filters[k] !== 40
    if (k === 'distance_km') return filters[k] !== 25
    if (k === 'languages') return filters[k]?.length > 0
    return !!filters[k]
  }).length

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ===== Header ===== */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-serif-display leading-tight mb-2">
              {cityFromUrl
                ? (lang === 'fr' ? `Recherche à ${cityFromUrl}` : `Search in ${cityFromUrl}`)
                : (lang === 'fr' ? 'Recherche avancée' : 'Advanced search')}
            </h1>
            <p className="text-neutral-600">
              {loading
                ? (lang === 'fr' ? 'Recherche en cours...' : 'Searching...')
                : (lang === 'fr'
                    ? `${filteredMatches.length} résultat${filteredMatches.length > 1 ? 's' : ''} sur ${matches.length} matches`
                    : `${filteredMatches.length} result${filteredMatches.length > 1 ? 's' : ''} of ${matches.length} matches`)}
            </p>
          </motion.div>
        </div>

        {/* ===== Layout : sidebar + results ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* ===== Sidebar Desktop ===== */}
          <aside className="hidden lg:block">
            <div className="card-premium sticky top-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <FiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
                lang={lang}
              />
            </div>
          </aside>

          {/* ===== Results ===== */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              {/* Mobile filter button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-medium">{lang === 'fr' ? 'Filtres' : 'Filters'}</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center numeric">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-neutral-500 hidden sm:inline">
                  {lang === 'fr' ? 'Trier par' : 'Sort by'}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium cursor-pointer hover:border-neutral-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="score">
                    {lang === 'fr' ? '✨ Meilleur match' : '✨ Best match'}
                  </option>
                  <option value="recent">
                    {lang === 'fr' ? '🕐 Plus récents' : '🕐 Most recent'}
                  </option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            <FilterChips
              filters={filters}
              onFiltersChange={setFilters}
              lang={lang}
            />

            {/* Results grid */}
            {loading ? (
              <ResultsSkeleton />
            ) : error ? (
              <ErrorState error={error} lang={lang} />
            ) : filteredMatches.length === 0 ? (
              <NoResultsState onReset={() => setFilters(DEFAULT_FILTERS)} lang={lang} />
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {filteredMatches.map((match) => (
                    <motion.div
                      key={match.profile.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } }
                      }}
                      layout
                    >
                      <MatchCardPremium
                        match={match}
                        currentUserProfile={currentProfile}
                        onMessage={handleMessage}
                        onSave={() => toggleSaved(match.profile.id)}
                        onView={handleView}
                        onShare={handleShare}
                        isSaved={savedIds.has(match.profile.id)}
                        lang={lang}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Mobile Filters Modal ===== */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-x-0 bottom-0 top-16 bg-white rounded-t-3xl z-50 overflow-y-auto shadow-2xl"
            >
              <FiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
                onClose={() => setMobileFiltersOpen(false)}
                isMobile
                lang={lang}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// States
// ============================================================

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card-premium overflow-hidden" style={{ padding: 0 }}>
          <div className="aspect-[4/3] animate-shimmer"></div>
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 animate-shimmer rounded"></div>
            <div className="h-3 w-full animate-shimmer rounded"></div>
            <div className="flex gap-2 mt-4">
              <div className="h-8 w-20 animate-shimmer rounded-full"></div>
              <div className="h-8 w-24 animate-shimmer rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ error, lang }) {
  return (
    <div className="card-premium text-center py-12">
      <div className="text-6xl mb-4">😕</div>
      <h3 className="text-xl font-semibold mb-2">
        {lang === 'fr' ? 'Erreur' : 'Error'}
      </h3>
      <p className="text-neutral-600 text-sm">
        {typeof error === 'string' ? error : 'Unknown error'}
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => window.location.reload()}
        className="btn-primary-premium mt-6"
      >
        {lang === 'fr' ? 'Réessayer' : 'Try again'}
      </motion.button>
    </div>
  )
}

function NoResultsState({ onReset, lang }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium text-center py-16"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-7xl mb-6"
      >
        🔍
      </motion.div>
      <h3 className="text-2xl font-serif-display mb-2">
        {lang === 'fr' ? 'Aucun résultat' : 'No results'}
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
        {lang === 'fr'
          ? 'Essaie d\'assouplir tes critères ou de réduire ton score minimum.'
          : 'Try relaxing your criteria or lowering your minimum score.'}
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onReset}
        className="btn-primary-premium"
      >
        {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
      </motion.button>
    </motion.div>
  )
}