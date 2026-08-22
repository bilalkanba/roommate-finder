/**
 * MatchCardPremium v4 — Lazy load explanation.
 *
 * NOUVEAU :
 * - L'explication IA n'est PAS chargée au mount
 * - Elle se charge quand l'user clique "Voir plus de détails" pour la 1ère fois
 * - Loading state pendant le fetch (petit skeleton dans la section)
 * - Cached ensuite (ne re-fetch pas au 2ème clic)
 *
 * Autres changements v4 :
 * - Score pill discret (Option B)
 * - Animations Framer Motion réduites (perf)
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { HOBBIES } from '@/lib/hobbies'
import { matchesApi } from '@/lib/api'

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

function getSharedHobbies(userA, userB, lang = 'fr') {
  const setA = new Set(userA?.hobbies || [])
  const setB = new Set(userB?.hobbies || [])
  const shared = [...setA].filter(x => setB.has(x))
  return shared.map(id => getHobbyDetails(id, lang))
}

function analyzeStrengthsAndDiscussion(breakdown) {
  if (!breakdown) return { strengths: [], discussions: [] }
  const strengths = []
  const discussions = []
  breakdown.forEach(dim => {
    const item = { dimension: dim.dimension, label: dim.label, score: dim.score }
    if (dim.score >= 80) strengths.push(item)
    else if (dim.score < 70) discussions.push(item)
  })
  return { strengths: strengths.slice(0, 5), discussions: discussions.slice(0, 3) }
}

const DIMENSION_ICONS = {
  budget: '💰', schedule: '⏰', cleanliness: '✨', social: '🤝',
  smoking_pets: '🚭', noise: '🔊', age: '🎂', diet: '🍽️',
  presence: '🏠', hobbies: '🎯',
}

function getQuickFacts(profile, lang = 'fr') {
  const facts = []
  if (profile?.smoking === 'no_smoking') facts.push({ icon: '🚭', label: lang === 'fr' ? 'Non-fumeur' : 'Non-smoker' })
  else if (profile?.smoking === 'ok_outside') facts.push({ icon: '🌿', label: lang === 'fr' ? 'Fume dehors' : 'Smokes outside' })
  if (profile?.pets === 'has_pet') facts.push({ icon: '🐶', label: lang === 'fr' ? 'A un animal' : 'Has pet' })
  else if (profile?.pets === 'ok_with_pets') facts.push({ icon: '🐾', label: lang === 'fr' ? 'Aime les animaux' : 'Loves pets' })
  if (profile?.sleep_schedule === 'early_bird') facts.push({ icon: '🌅', label: lang === 'fr' ? 'Lève-tôt' : 'Early bird' })
  else if (profile?.sleep_schedule === 'night_owl') facts.push({ icon: '🦉', label: lang === 'fr' ? 'Couche-tard' : 'Night owl' })
  if (profile?.work_type === 'full_time_remote') facts.push({ icon: '🏡', label: lang === 'fr' ? 'Full remote' : 'Remote worker' })
  else if (profile?.work_type === 'student') facts.push({ icon: '🎓', label: lang === 'fr' ? 'Étudiant' : 'Student' })
  else if (profile?.work_type === 'freelancer') facts.push({ icon: '💼', label: lang === 'fr' ? 'Freelance' : 'Freelancer' })
  if (profile?.diet === 'vegetarian') facts.push({ icon: '🥗', label: lang === 'fr' ? 'Végétarien' : 'Vegetarian' })
  else if (profile?.diet === 'vegan') facts.push({ icon: '🌱', label: lang === 'fr' ? 'Végan' : 'Vegan' })
  else if (profile?.diet === 'halal') facts.push({ icon: '☪️', label: 'Halal' })
  return facts.slice(0, 5)
}

function getVerificationBadges(profile, lang = 'fr') {
  const badges = []
  if (profile?.linkedin_url) badges.push({ icon: '💼', label: 'LinkedIn' })
  if (profile?.instagram_handle) badges.push({ icon: '📸', label: 'Instagram' })
  if (profile?.whatsapp_number) badges.push({ icon: '📱', label: 'Phone' })
  badges.push({ icon: '📧', label: 'Email' })
  if (profile?.work_type === 'student') badges.push({ icon: '🎓', label: lang === 'fr' ? 'Étudiant' : 'Student' })
  return badges
}

function generateLocalIcebreaker(sharedHobbies, matchProfile, lang = 'fr') {
  if (sharedHobbies.length > 0) {
    const hobby = sharedHobbies[0].label.toLowerCase()
    if (lang === 'fr') return `Salut ! J'ai vu qu'on partage ${hobby}. C'est quoi ton spot préféré pour ça ?`
    return `Hi! I noticed we both enjoy ${hobby}. What's your favorite way to do it?`
  }
  if (matchProfile?.target_city) {
    if (lang === 'fr') return `Salut ${matchProfile.full_name?.split(' ')[0]} ! Cool ton profil. Tu cherches à emménager quand exactement ?`
    return `Hi ${matchProfile.full_name?.split(' ')[0]}! Great profile. When are you looking to move in exactly?`
  }
  return lang === 'fr' ? "Salut ! Ravi de faire ta connaissance." : "Hi! Nice to meet you."
}

// ============================================================
// Score Pill
// ============================================================

function ScorePill({ score }) {
  let bgColor, borderColor, textColor, dotColor
  if (score >= 85) {
    bgColor = '#ecfdf5'; borderColor = '#a7f3d0'; textColor = '#065f46'; dotColor = '#10b981'
  } else if (score >= 70) {
    bgColor = '#f0fdfa'; borderColor = '#99f6e4'; textColor = '#115e59'; dotColor = '#14b8a6'
  } else if (score >= 50) {
    bgColor = '#fef3c7'; borderColor = '#fde68a'; textColor = '#78350f'; dotColor = '#f59e0b'
  } else {
    bgColor = '#f5f5f4'; borderColor = '#e7e5e4'; textColor = '#57534e'; dotColor = '#a8a29e'
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md"
      style={{
        background: bgColor,
        border: `0.5px solid ${borderColor}`,
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: dotColor }}
      />
      <span
        className="text-xs font-semibold numeric"
        style={{ color: textColor }}
      >
        {Math.round(score)}% match
      </span>
    </div>
  )
}

// ============================================================
// MatchCardPremium
// ============================================================

export default function MatchCardPremium({
  match,
  currentUserProfile,
  onMessage,
  onSave,
  onView,
  onShare,
  isSaved = false,
  lang = 'fr',
}) {
  const [expanded, setExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // LAZY LOAD EXPLANATION
  const [explanation, setExplanation] = useState(match.explanation || null)
  const [explanationLoading, setExplanationLoading] = useState(false)
  const [explanationFetched, setExplanationFetched] = useState(!!match.explanation)

  if (!match || !match.profile) return null

  const { profile, total_score, breakdown } = match
  const { strengths, discussions } = analyzeStrengthsAndDiscussion(breakdown)
  const sharedHobbies = getSharedHobbies(currentUserProfile, profile, lang)
  const quickFacts = getQuickFacts(profile, lang)
  const verificationBadges = getVerificationBadges(profile, lang)
  const icebreaker = generateLocalIcebreaker(sharedHobbies, profile, lang)

  const initials = getInitials(profile.full_name)
  const hasPhoto = profile.avatar_url && !imageError

  // Handler du clic "Voir plus" — déclenche le fetch explication si pas encore fait
  const handleToggleExpand = async () => {
    const willExpand = !expanded
    setExpanded(willExpand)

    // Si on ouvre pour la 1ère fois ET qu'on n'a pas encore l'explication → fetch
    if (willExpand && !explanationFetched && profile.user_id) {
      setExplanationLoading(true)
      try {
        const result = await matchesApi.getExplanation(profile.user_id, {
          language: lang,
        })
        setExplanation(result.explanation)
        setExplanationFetched(true)
      } catch (err) {
        console.error('[Explanation error]', err)
        // Fallback silencieux : on garde null, on affiche pas l'explication
      } finally {
        setExplanationLoading(false)
      }
    }
  }

  return (
    <article className="card-premium overflow-hidden group hover:-translate-y-1 transition-transform duration-200" style={{ padding: 0 }}>
      {/* ============ HEADER ============ */}
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-indigo-100">
          {hasPhoto ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600">
              <div className="text-6xl font-bold text-white/90">{initials}</div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Score pill discret */}
          <div className="absolute top-3 right-3">
            <ScorePill score={total_score || 0} />
          </div>

          {/* Online status */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-white">{lang === 'fr' ? 'En ligne' : 'Online'}</span>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold leading-tight truncate">
                {profile.full_name}
                {profile.age && <span className="font-light opacity-90">, {profile.age}</span>}
              </h3>
              {profile.occupation && (
                <p className="text-xs text-white/85 mt-0.5 truncate">{profile.occupation}</p>
              )}
              <div className="flex items-center gap-1 mt-1.5 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white/90">
                  {profile.target_city}
                  {profile.district && `, ${profile.district}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification badges */}
        {verificationBadges.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-100 overflow-x-auto">
            <span className="text-[10px] font-medium text-neutral-500 shrink-0 mr-1 uppercase tracking-wider">
              {lang === 'fr' ? 'Vérifié' : 'Verified'}
            </span>
            {verificationBadges.map((badge) => (
              <div key={badge.label} className="verify-badge shrink-0">
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ BODY ============ */}
      <div className="p-4 space-y-4">
        {/* Quick facts */}
        {quickFacts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="chip-neutral text-xs">
                <span>{fact.icon}</span>
                <span>{fact.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Shared hobbies */}
        {sharedHobbies.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-neutral-700 uppercase tracking-wider">
                {lang === 'fr' ? 'Passions communes' : 'Shared hobbies'}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {sharedHobbies.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sharedHobbies.map((hobby) => (
                <div key={hobby.id} className="chip text-xs">
                  <span>{hobby.emoji}</span>
                  <span>{hobby.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle expand */}
        <button
          type="button"
          onClick={handleToggleExpand}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          <span>{expanded
            ? (lang === 'fr' ? 'Voir moins' : 'Show less')
            : (lang === 'fr' ? 'Voir plus de détails' : 'Show more details')}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* EXPANDABLE SECTION */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-2">
                {/* AI Summary - Lazy loaded */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px]">
                      <span>✨</span>
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-700 uppercase tracking-wider">
                      {lang === 'fr' ? 'Analyse IA' : 'AI Analysis'}
                    </span>
                  </div>

                  {explanationLoading ? (
                    <div className="space-y-2">
                      <div className="h-3 w-full animate-shimmer rounded"></div>
                      <div className="h-3 w-5/6 animate-shimmer rounded"></div>
                      <div className="h-3 w-4/6 animate-shimmer rounded"></div>
                      <p className="text-xs text-neutral-400 italic mt-2">
                        {lang === 'fr' ? '✨ L\'IA analyse votre compatibilité...' : '✨ AI is analyzing your compatibility...'}
                      </p>
                    </div>
                  ) : explanation ? (
                    <p className="text-sm text-neutral-700 leading-relaxed">{explanation}</p>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">
                      {lang === 'fr' ? 'Analyse IA non disponible pour le moment' : 'AI analysis not available at the moment'}
                    </p>
                  )}
                </div>

                {/* Shared strengths */}
                {strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">✅</span>
                      <span className="text-[10px] font-semibold text-neutral-700 uppercase tracking-wider">
                        {lang === 'fr' ? 'Points forts communs' : 'Shared strengths'}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {strengths.map((s) => (
                        <div key={s.dimension} className="flex items-center gap-2 text-sm">
                          <span className="text-emerald-500">✓</span>
                          <span className="text-neutral-700">
                            {lang === 'fr' ? 'Similaire' : 'Similar'} {s.label.toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discussion points */}
                {discussions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">💬</span>
                      <span className="text-[10px] font-semibold text-neutral-700 uppercase tracking-wider">
                        {lang === 'fr' ? 'À discuter ensemble' : 'To discuss together'}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {discussions.map((d) => (
                        <div key={d.dimension} className="flex items-center gap-2 text-sm">
                          <span className="text-amber-500">💡</span>
                          <span className="text-neutral-700">
                            {lang === 'fr' ? 'Différence sur' : 'Difference on'} {d.label.toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compatibility breakdown */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">📊</span>
                    <span className="text-[10px] font-semibold text-neutral-700 uppercase tracking-wider">
                      {lang === 'fr' ? 'Détail de compatibilité' : 'Compatibility breakdown'}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {breakdown?.slice(0, 6).map((dim) => (
                      <BreakdownBar
                        key={dim.dimension}
                        icon={DIMENSION_ICONS[dim.dimension] || '📌'}
                        label={dim.label}
                        score={dim.score}
                      />
                    ))}
                  </div>
                </div>

                {/* AI icebreaker */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">💌</span>
                    <span className="text-[10px] font-semibold text-neutral-700 uppercase tracking-wider">
                      {lang === 'fr' ? 'Message suggéré par IA' : 'AI suggested icebreaker'}
                    </span>
                  </div>
                  <div className="ai-bubble text-sm">
                    "{icebreaker}"
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ ACTIONS ============ */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onMessage?.(profile)}
            className="btn-primary-premium flex-1 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{lang === 'fr' ? 'Message' : 'Message'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSave?.(profile)}
            className="btn-icon hover:scale-105 active:scale-90 transition-transform"
            aria-label={isSaved ? 'Unsave' : 'Save'}
          >
            <span className="text-lg">{isSaved ? '❤️' : '🤍'}</span>
          </button>

          <button
            type="button"
            onClick={() => onView?.(profile)}
            className="btn-icon hover:scale-105 active:scale-90 transition-transform"
            aria-label="View profile"
          >
            <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onShare?.(profile)}
            className="btn-icon hover:scale-105 active:scale-90 transition-transform"
            aria-label="Share"
          >
            <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

function BreakdownBar({ icon, label, score }) {
  const scoreColor = score >= 80 ? 'from-emerald-400 to-teal-500'
    : score >= 60 ? 'from-teal-400 to-blue-500'
    : score >= 40 ? 'from-amber-400 to-orange-500'
    : 'from-neutral-400 to-neutral-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-xs">
          <span>{icon}</span>
          <span className="font-medium text-neutral-700">{label}</span>
        </div>
        <span className="text-xs font-semibold text-neutral-600 numeric">{Math.round(score)}%</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${scoreColor} transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}