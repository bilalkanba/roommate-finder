/**
 * MatchesPage — Liste des matches (roommates compatibles).
 *
 * ⚠️ ATTENTION : ce fichier affiche les MATCHES, pas les MESSAGES.
 * MessagesPage.jsx est un fichier différent qui affiche les conversations.
 *
 * Features :
 * - Grid de MatchCards avec score + IA
 * - Header avec stats (top score + avg score)
 * - Bouton "Message" ouvre la conversation avec ce match
 * - Save/View/Share
 * - Lazy loading explications (via with_explanations: false)
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { matchesApi, profilesApi } from '@/lib/api'
import MatchCardPremium from '@/components/MatchCardPremium'

export default function MatchesPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const [matches, setMatches] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [noProfile, setNoProfile] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const profile = await profilesApi.getMine().catch(() => null)
        if (!mounted) return

        if (!profile) {
          setNoProfile(true)
          setLoading(false)
          return
        }
        setCurrentProfile(profile)

        // FIX PERF : with_explanations: false → pas d'appels OpenAI ici
        const response = await matchesApi.list({
          limit: 10,
          min_score: 40,
          language: i18n.language,
          with_explanations: false,
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
  }, [i18n.language])

  const toggleSaved = (profileId) => {
    const newSet = new Set(savedIds)
    if (newSet.has(profileId)) newSet.delete(profileId)
    else newSet.add(profileId)
    setSavedIds(newSet)
  }

  // NOUVEAU : redirige vers la messagerie interne au lieu de WhatsApp
  const handleMessage = (profile) => {
    if (profile.user_id) {
      navigate(`/messages/${profile.user_id}`)
    } else {
      alert(i18n.language === 'fr'
        ? 'Impossible d\'ouvrir la conversation'
        : 'Cannot open conversation')
    }
  }

  const handleView = (profile) => {
    navigate(`/profile/${profile.id}`)
  }

  const handleShare = async (profile) => {
    const url = `${window.location.origin}/profile/${profile.id}`
    const text = i18n.language === 'fr'
      ? `Découvre le profil de ${profile.full_name} sur Roommate Finder`
      : `Check out ${profile.full_name}'s profile on Roommate Finder`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Roommate Finder AI', text, url })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        alert(i18n.language === 'fr' ? 'Lien copié !' : 'Link copied!')
      } catch {}
    }
  }

  if (loading) return <MatchesLoadingSkeleton />
  if (noProfile) return <WelcomeEmptyState onCreate={() => navigate('/profile')} lang={i18n.language} />

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">
          {i18n.language === 'fr' ? 'Une erreur est survenue' : 'An error occurred'}
        </h2>
        <p className="text-neutral-600 text-sm">{typeof error === 'string' ? error : 'Unknown error'}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary-premium mt-6 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {i18n.language === 'fr' ? 'Réessayer' : 'Try again'}
        </button>
      </div>
    )
  }

  if (matches.length === 0) {
    return <NoMatchesEmptyState onEditProfile={() => navigate('/profile')} lang={i18n.language} />
  }

  const avgScore = matches.length > 0
    ? Math.round(matches.reduce((sum, m) => sum + (m.total_score || 0), 0) / matches.length)
    : 0
  const topScore = matches.length > 0
    ? Math.max(...matches.map(m => m.total_score || 0))
    : 0

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  {i18n.language === 'fr' ? 'IA analyse tes matches' : 'AI analyzing your matches'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif-display leading-tight mb-2">
                {i18n.language === 'fr' ? 'Tes matches' : 'Your matches'}{' '}
                <span className="text-gradient-hero">2026</span>
              </h1>
              <p className="text-neutral-600 text-lg">
                {i18n.language === 'fr'
                  ? `${matches.length} personne${matches.length > 1 ? 's' : ''} compatible${matches.length > 1 ? 's' : ''} avec toi`
                  : `${matches.length} compatible ${matches.length > 1 ? 'people' : 'person'} for you`}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="card-premium text-center" style={{ padding: '16px 24px' }}>
                <div className="text-3xl font-bold text-gradient-emerald numeric">{topScore}%</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
                  {i18n.language === 'fr' ? 'Top match' : 'Top match'}
                </div>
              </div>
              <div className="card-premium text-center" style={{ padding: '16px 24px' }}>
                <div className="text-3xl font-bold text-neutral-900 numeric">{avgScore}%</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
                  {i18n.language === 'fr' ? 'Score moyen' : 'Avg score'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCardPremium
              key={match.profile.id}
              match={match}
              currentUserProfile={currentProfile}
              onMessage={handleMessage}
              onSave={() => toggleSaved(match.profile.id)}
              onView={handleView}
              onShare={handleShare}
              isSaved={savedIds.has(match.profile.id)}
              lang={i18n.language}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MatchesLoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="h-4 w-32 animate-shimmer rounded-full mb-4"></div>
        <div className="h-12 w-96 animate-shimmer rounded-2xl mb-2"></div>
        <div className="h-6 w-64 animate-shimmer rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-premium overflow-hidden" style={{ padding: 0 }}>
            <div className="aspect-[4/3] animate-shimmer"></div>
            <div className="p-5 space-y-3">
              <div className="h-4 w-3/4 animate-shimmer rounded"></div>
              <div className="h-3 w-full animate-shimmer rounded"></div>
              <div className="h-3 w-5/6 animate-shimmer rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WelcomeEmptyState({ onCreate, lang }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 bg-mesh">
      <div className="max-w-md text-center">
        <div className="text-8xl mb-6">👋</div>
        <h1 className="text-3xl md:text-4xl font-serif-display mb-3">
          {lang === 'fr' ? 'Bienvenue !' : 'Welcome!'}
        </h1>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          {lang === 'fr'
            ? 'Pour trouver des colocataires compatibles, nous avons d\'abord besoin de mieux te connaître.'
            : 'To find compatible roommates, we need to know you better first.'}
        </p>
        <button
          onClick={onCreate}
          className="btn-primary-premium hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {lang === 'fr' ? 'Créer mon profil ✨' : 'Create my profile ✨'}
        </button>
      </div>
    </div>
  )
}

function NoMatchesEmptyState({ onEditProfile, lang }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 bg-mesh">
      <div className="max-w-md text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-3xl md:text-4xl font-serif-display mb-3">
          {lang === 'fr' ? 'Ton colocataire parfait est là-bas' : 'Your perfect roommate is out there'}
        </h1>
        <p className="text-neutral-600 mb-6 leading-relaxed">
          {lang === 'fr'
            ? 'Complète ton profil pour augmenter tes chances de trouver le bon match.'
            : 'Complete your profile to increase your chances of finding the right match.'}
        </p>

        <div className="text-left card-premium mb-6 max-w-sm mx-auto">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            {lang === 'fr' ? 'Améliore ton profil' : 'Improve your profile'}
          </p>
          <div className="space-y-2">
            {[
              { icon: '📸', label: lang === 'fr' ? 'Ajoute une photo' : 'Add a photo' },
              { icon: '📝', label: lang === 'fr' ? 'Complète ta bio' : 'Complete your bio' },
              { icon: '🎯', label: lang === 'fr' ? 'Ajoute tes centres d\'intérêt' : 'Add your hobbies' },
              { icon: '✅', label: lang === 'fr' ? 'Vérifie tes réseaux' : 'Verify your socials' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-neutral-700">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100">
            <p className="text-xs text-emerald-600 font-semibold">
              {lang === 'fr' ? '+42% de matches compatibles' : '+42% compatible matches'}
            </p>
          </div>
        </div>

        <button
          onClick={onEditProfile}
          className="btn-primary-premium hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {lang === 'fr' ? 'Améliorer mon profil' : 'Improve my profile'}
        </button>
      </div>
    </div>
  )
}