/**
 * ProfilePage Premium
 *
 * Route : /profile/:id (voir le profil d'un autre user)
 *
 * Sections :
 * - Hero photo avec overlay gradient
 * - Name, age, occupation, city (bold)
 * - Compatibility ring (si vue depuis un match)
 * - Bio dans un bloc typography soignée
 * - LifestyleRadar (7 dimensions)
 * - DailyRoutineTimeline
 * - Shared hobbies + all hobbies
 * - Quick facts
 * - Housing preferences
 * - Deal breakers (si renseignés)
 * - Looking for
 * - Verification section
 * - Social links (LinkedIn, Instagram)
 * - Sticky action bar en bas
 */

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { profilesApi, matchesApi } from '@/lib/api'
import CompatibilityRing from '@/components/CompatibilityRing'
import LifestyleRadar, { profileToRadarDimensions } from '@/components/LifestyleRadar'
import DailyRoutineTimeline from '@/components/DailyRoutineTimeline'
import { HOBBIES } from '@/lib/hobbies'

// ============================================================
// Helpers
// ============================================================

function getInitials(name) {
  return name?.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

function getHobbyDetails(id, lang = 'fr') {
  const h = HOBBIES.find(x => x.id === id)
  if (!h) return { id, label: id, emoji: '🎯' }
  return { id: h.id, emoji: h.emoji, label: h[lang] || h.fr }
}

function getSharedHobbyIds(userA, userB) {
  if (!userA?.hobbies || !userB?.hobbies) return new Set()
  const setA = new Set(userA.hobbies)
  return new Set(userB.hobbies.filter(x => setA.has(x)))
}

const HOUSING_LABELS = {
  entire_apartment: { fr: 'Appartement entier', en: 'Entire apartment', emoji: '🏠' },
  private_room: { fr: 'Chambre privée', en: 'Private room', emoji: '🚪' },
  shared_room: { fr: 'Chambre partagée', en: 'Shared room', emoji: '👥' },
  studio: { fr: 'Studio', en: 'Studio', emoji: '🏢' },
  any: { fr: 'Peu importe', en: 'Any', emoji: '🔁' },
}

const DIET_LABELS = {
  omnivore: { fr: 'Omnivore', en: 'Omnivore', emoji: '🍖' },
  vegetarian: { fr: 'Végétarien', en: 'Vegetarian', emoji: '🥗' },
  vegan: { fr: 'Végan', en: 'Vegan', emoji: '🌱' },
  halal: { fr: 'Halal', en: 'Halal', emoji: '☪️' },
  kosher: { fr: 'Kasher', en: 'Kosher', emoji: '✡️' },
  other: { fr: 'Autre', en: 'Other', emoji: '🍽️' },
}

// ============================================================
// Main component
// ============================================================

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language

  const [profile, setProfile] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaved, setIsSaved] = useState(false)

  // Parallax scroll effect sur le hero
  const { scrollY } = useScroll()
  const heroImageY = useTransform(scrollY, [0, 400], [0, 100])
  const heroOverlay = useTransform(scrollY, [0, 300], [0.5, 0.9])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        // Fetch le profil demandé
        const p = await profilesApi.getById(id)
        if (!mounted) return
        setProfile(p)

        // Fetch le user courant en parallèle
        const me = await profilesApi.getMine().catch(() => null)
        if (!mounted) return
        setCurrentUser(me)

        // Fetch match details (score, breakdown, explanation)
        if (me && p) {
          try {
            const match = await matchesApi.getDetails(p.user_id, {
              language: lang,
              with_explanation: true,
            })
            if (mounted) setMatchData(match)
          } catch {
            // Peut échouer si les 2 users ne sont pas dans la même ville, etc.
          }
        }

        setLoading(false)
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.detail || err.message)
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id, lang])

  const handleMessage = () => {
    if (profile?.whatsapp_number) {
      const msg = encodeURIComponent(
        lang === 'fr'
          ? `Salut ${profile.full_name?.split(' ')[0]} ! J'ai vu ton profil sur Roommate Finder 🏠`
          : `Hi ${profile.full_name?.split(' ')[0]}! I saw your profile on Roommate Finder 🏠`
      )
      window.open(`https://wa.me/${profile.whatsapp_number.replace('+', '')}?text=${msg}`, '_blank')
    } else {
      alert(lang === 'fr'
        ? 'Cette personne n\'a pas partagé de moyen de contact'
        : 'This person did not share a contact method')
    }
  }

  if (loading) return <ProfileSkeleton />
  if (error) return <ProfileError error={error} onBack={() => navigate('/matches')} lang={lang} />
  if (!profile) return null

  const initials = getInitials(profile.full_name)
  const hasPhoto = !!profile.avatar_url
  const sharedHobbies = getSharedHobbyIds(currentUser, profile)
  const radarDims = profileToRadarDimensions(profile, lang)
  const housing = HOUSING_LABELS[profile.housing_type] || HOUSING_LABELS.any
  const diet = profile.diet ? DIET_LABELS[profile.diet] : null

  return (
    <div className="min-h-screen bg-mesh pb-24">
      {/* ============ HERO ============ */}
      <div className="relative h-[60vh] max-h-[500px] overflow-hidden">
        {/* Photo avec parallax */}
        <motion.div
          style={{ y: heroImageY }}
          className="absolute inset-0"
        >
          {hasPhoto ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-500 flex items-center justify-center">
              <div className="text-9xl font-bold text-white/90">{initials}</div>
            </div>
          )}
        </motion.div>

        {/* Gradient overlay */}
        <motion.div
          style={{ opacity: heroOverlay }}
          className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"
        />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 btn-icon"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>

        {/* Compatibility ring (top right, si match dispo) */}
        {matchData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-6 right-6"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-full p-1 shadow-xl">
              <CompatibilityRing score={matchData.total_score || 0} size={90} strokeWidth={6} showLabel={true} />
            </div>
          </motion.div>
        )}

        {/* Info principale en bas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white"
        >
          <div className="max-w-4xl mx-auto">
            {/* Online status */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-white">{lang === 'fr' ? 'En ligne' : 'Online'}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif-display leading-none mb-2">
              {profile.full_name}
              {profile.age && <span className="font-light opacity-90">, {profile.age}</span>}
            </h1>
            {profile.occupation && (
              <p className="text-lg md:text-xl text-white/90 mb-3">{profile.occupation}</p>
            )}
            <div className="flex items-center gap-2 text-sm md:text-base">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white/90">
                {profile.target_city}
                {profile.district && `, ${profile.district}`}
                {profile.target_country && `, ${profile.target_country}`}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============ CONTENT ============ */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 space-y-6">
        {/* Bio */}
        {profile.bio && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-premium"
          >
            <h2 className="section-title-premium">
              {lang === 'fr' ? 'À propos' : 'About'}
            </h2>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </motion.section>
        )}

        {/* AI Summary (si dispo depuis match) */}
        {matchData?.explanation && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-premium"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs">
                ✨
              </div>
              <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                {lang === 'fr' ? 'Pourquoi vous êtes compatibles' : 'Why you\'re compatible'}
              </span>
            </div>
            <p className="text-neutral-700 leading-relaxed">{matchData.explanation}</p>
          </motion.section>
        )}

        {/* Radar chart */}
        {radarDims.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-premium"
          >
            <h2 className="section-title-premium mb-2">
              {lang === 'fr' ? 'Profil lifestyle' : 'Lifestyle profile'}
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              {lang === 'fr'
                ? 'Vue d\'ensemble des dimensions clés'
                : 'Overview of key dimensions'}
            </p>
            <div className="flex justify-center py-4">
              <LifestyleRadar dimensions={radarDims} size={320} />
            </div>
          </motion.section>
        )}

        {/* Daily routine timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-premium"
        >
          <h2 className="section-title-premium mb-6">
            {lang === 'fr' ? 'Une journée type' : 'A typical day'}
          </h2>
          <DailyRoutineTimeline profile={profile} lang={lang} />
        </motion.section>

        {/* Hobbies */}
        {profile.hobbies?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="card-premium"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title-premium mb-0">
                {lang === 'fr' ? 'Centres d\'intérêt' : 'Hobbies'}
              </h2>
              {sharedHobbies.size > 0 && (
                <span className="text-xs font-semibold text-emerald-600">
                  {sharedHobbies.size} {lang === 'fr' ? 'en commun' : 'shared'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.hobbies.map((id, i) => {
                const h = getHobbyDetails(id, lang)
                const isShared = sharedHobbies.has(id)
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.03 }}
                    className={isShared ? 'chip' : 'chip-neutral'}
                    title={isShared ? (lang === 'fr' ? 'Vous partagez cet intérêt' : 'You share this interest') : ''}
                  >
                    <span>{h.emoji}</span>
                    <span>{h.label}</span>
                    {isShared && <span className="text-emerald-600">✨</span>}
                  </motion.div>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* Housing preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card-premium"
        >
          <h2 className="section-title-premium mb-4">
            {lang === 'fr' ? 'Préférences logement' : 'Housing preferences'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow
              icon={housing.emoji}
              label={lang === 'fr' ? 'Type recherché' : 'Housing type'}
              value={housing[lang] || housing.fr}
            />
            <InfoRow
              icon="💰"
              label={lang === 'fr' ? 'Budget' : 'Budget'}
              value={`${profile.budget_min_eur || 0} — ${profile.budget_max_eur || 0} €`}
            />
            <InfoRow
              icon="📅"
              label={lang === 'fr' ? 'Emménagement' : 'Move-in'}
              value={profile.move_in_date}
            />
            <InfoRow
              icon="⏳"
              label={lang === 'fr' ? 'Durée' : 'Duration'}
              value={`${profile.lease_duration_months} ${lang === 'fr' ? 'mois' : 'months'}`}
            />
            {diet && (
              <InfoRow
                icon={diet.emoji}
                label={lang === 'fr' ? 'Régime' : 'Diet'}
                value={diet[lang]}
              />
            )}
            {profile.languages_spoken?.length > 0 && (
              <InfoRow
                icon="🗣️"
                label={lang === 'fr' ? 'Langues' : 'Languages'}
                value={profile.languages_spoken.join(', ')}
              />
            )}
          </div>
        </motion.section>

        {/* Looking for */}
        {profile.looking_for && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="card-premium"
          >
            <h2 className="section-title-premium mb-2">
              {lang === 'fr' ? 'Cherche chez un coloc' : 'Looking for'}
            </h2>
            <p className="text-neutral-700 leading-relaxed italic">"{profile.looking_for}"</p>
          </motion.section>
        )}

        {/* Deal breakers */}
        {profile.dealbreakers && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="card-premium border-amber-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚠️</span>
              <h2 className="section-title-premium mb-0">
                {lang === 'fr' ? 'Ce qui ne passe pas' : 'Deal breakers'}
              </h2>
            </div>
            <p className="text-neutral-700 leading-relaxed">{profile.dealbreakers}</p>
          </motion.section>
        )}

        {/* Verification & Social */}
        {(profile.linkedin_url || profile.instagram_handle) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="card-premium"
          >
            <h2 className="section-title-premium mb-4">
              {lang === 'fr' ? 'Réseaux sociaux' : 'Social links'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {profile.linkedin_url && (
                <motion.a
                  whileHover={{ y: -2, scale: 1.02 }}
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl">💼</span>
                  <span className="text-sm font-medium">LinkedIn</span>
                  <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              )}
              {profile.instagram_handle && (
                <motion.a
                  whileHover={{ y: -2, scale: 1.02 }}
                  href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 hover:border-pink-300 hover:bg-pink-50 transition-colors"
                >
                  <span className="text-xl">📸</span>
                  <span className="text-sm font-medium">{profile.instagram_handle}</span>
                  <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              )}
            </div>
          </motion.section>
        )}

        {/* Padding pour la sticky bar */}
        <div className="h-10"></div>
      </div>

      {/* ============ STICKY ACTION BAR ============ */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
        className="fixed bottom-4 left-0 right-0 z-40 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="card-glass flex items-center gap-3 p-3">
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-sm font-semibold text-neutral-900 truncate">{profile.full_name}</p>
              <p className="text-xs text-neutral-500">
                {profile.target_city}
                {matchData && ` · ${Math.round(matchData.total_score)}% match`}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSaved(!isSaved)}
              className="btn-icon"
              aria-label={isSaved ? 'Unsave' : 'Save'}
            >
              <motion.span
                key={isSaved ? 'saved' : 'not-saved'}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="text-lg"
              >
                {isSaved ? '❤️' : '🤍'}
              </motion.span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMessage}
              className="btn-primary-premium flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{lang === 'fr' ? 'Envoyer un message' : 'Send message'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-neutral-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium text-neutral-900 truncate">{value}</div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-mesh">
      <div className="h-[60vh] max-h-[500px] animate-shimmer"></div>
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-premium">
            <div className="h-4 w-32 animate-shimmer rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 animate-shimmer rounded"></div>
              <div className="h-3 w-5/6 animate-shimmer rounded"></div>
              <div className="h-3 w-4/6 animate-shimmer rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileError({ error, onBack, lang }) {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-semibold mb-2">
          {lang === 'fr' ? 'Profil introuvable' : 'Profile not found'}
        </h2>
        <p className="text-neutral-600 text-sm mb-6">
          {typeof error === 'string' ? error : (lang === 'fr' ? 'Ce profil n\'existe pas ou est privé.' : 'This profile doesn\'t exist or is private.')}
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="btn-primary-premium"
        >
          {lang === 'fr' ? 'Retour aux matches' : 'Back to matches'}
        </motion.button>
      </div>
    </div>
  )
}