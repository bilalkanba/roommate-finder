/**
 * HomePage v2 — Perf fix.
 *
 * CHANGES :
 * - matchesApi.list appelé SANS with_explanations (économise 5-10s)
 * - L'explication du top match est chargée en background (non bloquante)
 *   quand la page est déjà affichée
 * - Skeleton animé pendant que l'explication arrive
 * - Animations Framer Motion supprimées sur les sections statiques
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { profilesApi, matchesApi } from '@/lib/api'
import CompatibilityRing from '@/components/CompatibilityRing'
import ProfileCompletionCard from '@/components/ProfileCompletionCard'
import TrendingCities from '@/components/TrendingCities'
import SuccessStories from '@/components/SuccessStories'

// ============================================================
// Helpers
// ============================================================

function getGreeting(name, lang) {
  const hour = new Date().getHours()
  const firstName = name?.split(' ')[0] || (lang === 'fr' ? 'toi' : 'you')

  if (lang === 'fr') {
    if (hour < 6) return { emoji: '🌙', text: `Bonne nuit ${firstName}` }
    if (hour < 12) return { emoji: '☀️', text: `Bonjour ${firstName}` }
    if (hour < 18) return { emoji: '👋', text: `Salut ${firstName}` }
    return { emoji: '🌆', text: `Bonsoir ${firstName}` }
  }
  if (hour < 6) return { emoji: '🌙', text: `Good night, ${firstName}` }
  if (hour < 12) return { emoji: '☀️', text: `Good morning, ${firstName}` }
  if (hour < 18) return { emoji: '👋', text: `Hi ${firstName}` }
  return { emoji: '🌆', text: `Good evening, ${firstName}` }
}

function getInitials(name) {
  return name?.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

function getDailyTip(lang) {
  const tips_fr = [
    { emoji: '💡', title: 'Photo de profil', body: 'Une photo authentique augmente tes matches de 40%.' },
    { emoji: '💡', title: 'Bio courte', body: '2-3 phrases suffisent. Sois toi-même.' },
    { emoji: '💡', title: 'Deal breakers', body: 'Sois clair sur ce qui ne passe pas. Ça évite les malentendus.' },
    { emoji: '💡', title: 'LinkedIn', body: 'Un LinkedIn vérifié inspire confiance et améliore ton profil.' },
    { emoji: '💡', title: 'Hobbies', body: 'Ajoute au moins 5 centres d\'intérêt pour de meilleures suggestions.' },
    { emoji: '💡', title: 'Rythme de vie', body: 'Sois honnête sur ton rythme de sommeil. C\'est LE facteur clé.' },
    { emoji: '💡', title: 'Budget', body: 'Une fourchette réaliste attire les bons profils.' },
  ]
  const tips_en = [
    { emoji: '💡', title: 'Profile photo', body: 'An authentic photo increases your matches by 40%.' },
    { emoji: '💡', title: 'Short bio', body: '2-3 sentences are enough. Be yourself.' },
    { emoji: '💡', title: 'Deal breakers', body: 'Be clear about what won\'t work. Avoids misunderstandings.' },
    { emoji: '💡', title: 'LinkedIn', body: 'A verified LinkedIn inspires trust and improves your profile.' },
    { emoji: '💡', title: 'Hobbies', body: 'Add at least 5 hobbies for better suggestions.' },
    { emoji: '💡', title: 'Lifestyle rhythm', body: 'Be honest about your sleep pattern. It\'s THE key factor.' },
    { emoji: '💡', title: 'Budget', body: 'A realistic range attracts the right profiles.' },
  ]
  const tips = lang === 'fr' ? tips_fr : tips_en
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return tips[dayOfYear % tips.length]
}

// ============================================================
// Component
// ============================================================

export default function HomePage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language

  const [profile, setProfile] = useState(null)
  const [topMatch, setTopMatch] = useState(null)
  const [topMatchExplanation, setTopMatchExplanation] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [totalMatches, setTotalMatches] = useState(0)
  const [loading, setLoading] = useState(true)
  const [noProfile, setNoProfile] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        // 1. Profil courant
        const p = await profilesApi.getMine().catch(() => null)
        if (!mounted) return
        if (!p) {
          setNoProfile(true)
          setLoading(false)
          return
        }
        setProfile(p)

        // 2. Matches SANS explications (rapide, ~200ms)
        const response = await matchesApi.list({
          limit: 5,
          min_score: 40,
          language: lang,
          with_explanations: false, // ← FIX PERF : plus d'appel OpenAI ici
        }).catch(() => ({ matches: [] }))

        if (!mounted) return
        const match = response?.matches?.[0] || null
        setTopMatch(match)
        setTotalMatches(response?.matches?.length || 0)
        setLoading(false)  // ← Page affichée immédiatement !

        // 3. En BACKGROUND, on charge l'explication du top match
        // (pas bloquant, l'user voit déjà toute la page)
        if (match && match.profile?.user_id) {
          setLoadingExplanation(true)
          matchesApi.getExplanation(match.profile.user_id, { language: lang })
            .then(result => {
              if (mounted) setTopMatchExplanation(result.explanation)
            })
            .catch(err => {
              console.error('[TopMatch explanation]', err)
            })
            .finally(() => {
              if (mounted) setLoadingExplanation(false)
            })
        }
      } catch (err) {
        console.error('[HomePage load]', err)
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [lang])

  if (loading) return <HomeLoadingSkeleton />
  if (noProfile) {
    return (
      <WelcomeToApp
        onCreate={() => navigate('/profile')}
        lang={lang}
      />
    )
  }

  const greeting = getGreeting(profile.full_name, lang)
  const tip = getDailyTip(lang)

  return (
    <div className="min-h-screen bg-mesh pb-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-3xl md:text-5xl font-serif-display leading-tight">
            <span>{greeting.emoji}</span>
            <h1>{greeting.text}</h1>
          </div>
          <p className="text-lg text-neutral-600 mt-3">
            {lang === 'fr'
              ? `Tu as ${totalMatches} match${totalMatches > 1 ? 'es' : ''} disponible${totalMatches > 1 ? 's' : ''}.`
              : `You have ${totalMatches} available match${totalMatches > 1 ? 'es' : ''}.`}
          </p>
        </div>

        {/* Top match */}
        {topMatch && (
          <div className="mb-8">
            <div className="card-premium bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50 border-emerald-100 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20 blur-3xl" />

              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="text-center md:text-left flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-200 mb-3">
                    <span className="text-xs">✨</span>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                      {lang === 'fr' ? 'Recommandation IA du jour' : 'AI pick of the day'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
                      {topMatch.profile.avatar_url ? (
                        <img
                          src={topMatch.profile.avatar_url}
                          alt={topMatch.profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {getInitials(topMatch.profile.full_name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 truncate">
                        {topMatch.profile.full_name}
                        {topMatch.profile.age && <span className="font-light text-neutral-500">, {topMatch.profile.age}</span>}
                      </h2>
                      <p className="text-sm text-neutral-600 truncate">
                        {topMatch.profile.occupation && `${topMatch.profile.occupation} · `}
                        {topMatch.profile.target_city}
                      </p>
                    </div>
                  </div>

                  {/* Explication : loading OU affichée OU pas dispo */}
                  {loadingExplanation ? (
                    <div className="space-y-2 mb-4">
                      <div className="h-3 w-full animate-shimmer rounded"></div>
                      <div className="h-3 w-5/6 animate-shimmer rounded"></div>
                      <div className="h-3 w-4/6 animate-shimmer rounded"></div>
                      <p className="text-xs text-neutral-400 italic mt-1">
                        {lang === 'fr' ? '✨ L\'IA analyse votre compatibilité...' : '✨ AI analyzing your compatibility...'}
                      </p>
                    </div>
                  ) : topMatchExplanation ? (
                    <p className="text-sm text-neutral-700 leading-relaxed mb-4 line-clamp-3">
                      {topMatchExplanation}
                    </p>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => navigate(`/profile/${topMatch.profile.id}`)}
                      className="btn-primary-premium hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      {lang === 'fr' ? 'Voir le profil' : 'View profile'}
                    </button>
                    <button
                      onClick={() => navigate('/matches')}
                      className="btn-ghost-premium hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      {lang === 'fr' ? 'Voir tous mes matches' : 'View all matches'}
                    </button>
                  </div>
                </div>

                <div className="shrink-0">
                  <CompatibilityRing score={topMatch.total_score || 0} size={140} strokeWidth={5} showLabel={true} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid : Profile completion + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <ProfileCompletionCard profile={profile} lang={lang} />
          </div>

          <div className="space-y-4">
            <StatCard
              icon="🌍"
              label={lang === 'fr' ? 'Villes couvertes' : 'Cities covered'}
              value="180+"
              accent="from-blue-400 to-indigo-500"
            />
            <StatCard
              icon="👥"
              label={lang === 'fr' ? 'Utilisateurs actifs' : 'Active users'}
              value="12k+"
              accent="from-emerald-400 to-teal-500"
            />
          </div>
        </div>

        {/* Trending cities */}
        <div className="mb-8">
          <TrendingCities lang={lang} />
        </div>

        {/* Success stories + Daily tip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SuccessStories lang={lang} />
          </div>

          <div className="card-premium bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100 h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{tip.emoji}</span>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                {lang === 'fr' ? 'Astuce du jour' : 'Daily tip'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">{tip.title}</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">{tip.body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="card-premium flex items-center gap-3 py-4 hover:-translate-y-1 transition-transform duration-200">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-xl shadow-md shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-neutral-500 uppercase tracking-wider truncate">{label}</div>
        <div className="text-xl font-bold text-neutral-900 numeric">{value}</div>
      </div>
    </div>
  )
}

function HomeLoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="h-12 w-64 animate-shimmer rounded-2xl mb-3"></div>
        <div className="h-4 w-40 animate-shimmer rounded"></div>
      </div>
      <div className="card-premium mb-8">
        <div className="h-6 w-40 animate-shimmer rounded mb-4"></div>
        <div className="h-3 animate-shimmer rounded mb-2"></div>
        <div className="h-3 w-5/6 animate-shimmer rounded"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-premium">
            <div className="h-8 w-8 animate-shimmer rounded mb-3"></div>
            <div className="h-4 w-3/4 animate-shimmer rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WelcomeToApp({ onCreate, lang }) {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <div className="text-8xl mb-6">🏡</div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            {lang === 'fr' ? 'Bienvenue sur Roommate Finder AI' : 'Welcome to Roommate Finder AI'}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-serif-display leading-tight mb-4">
          {lang === 'fr' ? 'Trouve ton coloc' : 'Find your'}{' '}
          <span className="text-gradient-hero">
            {lang === 'fr' ? 'idéal' : 'perfect roommate'}
          </span>
        </h1>

        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
          {lang === 'fr'
            ? 'Notre IA analyse ton profil sur 10 dimensions pour te matcher avec des personnes réellement compatibles.'
            : 'Our AI analyzes your profile across 10 dimensions to match you with genuinely compatible people.'}
        </p>

        <button
          onClick={onCreate}
          className="btn-primary-premium text-lg px-8 py-4 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {lang === 'fr' ? 'Créer mon profil ✨' : 'Create my profile ✨'}
        </button>

        <p className="text-xs text-neutral-500 mt-4">
          {lang === 'fr' ? 'Prend 3 minutes' : 'Takes 3 minutes'}
        </p>
      </div>
    </div>
  )
}