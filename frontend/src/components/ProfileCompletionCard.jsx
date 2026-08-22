/**
 * ProfileCompletionCard — Suivi de complétion du profil.
 *
 * Analyse le profil du user courant et donne un score de complétion + suggestions.
 * Design premium avec bar animée + checklist.
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Champs pris en compte pour le score de complétion (pondérés)
const COMPLETION_CHECKS = [
  { key: 'avatar_url', label_fr: 'Photo de profil', label_en: 'Profile photo', weight: 20, icon: '📸' },
  { key: 'bio', label_fr: 'Bio', label_en: 'Bio', weight: 15, icon: '📝' },
  { key: 'hobbies', label_fr: 'Centres d\'intérêt', label_en: 'Hobbies', weight: 15, icon: '🎯', arrayMin: 3 },
  { key: 'looking_for', label_fr: 'Ce que je cherche', label_en: 'Looking for', weight: 10, icon: '💭' },
  { key: 'dealbreakers', label_fr: 'Deal breakers', label_en: 'Deal breakers', weight: 5, icon: '⚠️' },
  { key: 'linkedin_url', label_fr: 'LinkedIn', label_en: 'LinkedIn', weight: 10, icon: '💼' },
  { key: 'instagram_handle', label_fr: 'Instagram', label_en: 'Instagram', weight: 5, icon: '📸' },
  { key: 'occupation', label_fr: 'Occupation', label_en: 'Occupation', weight: 10, icon: '💼' },
  { key: 'work_type', label_fr: 'Situation pro', label_en: 'Work type', weight: 5, icon: '💻' },
  { key: 'diet', label_fr: 'Régime alimentaire', label_en: 'Diet', weight: 5, icon: '🍽️' },
]

function calculateCompletion(profile) {
  if (!profile) return { score: 0, missing: [], completed: [] }

  let totalWeight = 0
  let earnedWeight = 0
  const missing = []
  const completed = []

  for (const check of COMPLETION_CHECKS) {
    totalWeight += check.weight
    const value = profile[check.key]

    let isFilled = false
    if (check.arrayMin) {
      isFilled = Array.isArray(value) && value.length >= check.arrayMin
    } else {
      isFilled = value !== null && value !== undefined && value !== ''
    }

    if (isFilled) {
      earnedWeight += check.weight
      completed.push(check)
    } else {
      missing.push(check)
    }
  }

  const score = Math.round((earnedWeight / totalWeight) * 100)
  return { score, missing, completed }
}

export default function ProfileCompletionCard({ profile, lang = 'fr' }) {
  const navigate = useNavigate()
  const { score, missing } = calculateCompletion(profile)

  if (score === 100) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl">
            ✓
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">
              {lang === 'fr' ? 'Profil complet !' : 'Profile complete!'}
            </h3>
            <p className="text-sm text-neutral-600">
              {lang === 'fr'
                ? 'Tu maximises tes chances de trouver le bon match.'
                : 'You maximize your chances of finding the right match.'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              {lang === 'fr' ? 'Complète ton profil' : 'Complete your profile'}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-1">
            {lang === 'fr'
              ? 'Tu es à '
              : 'You\'re '}
            <span className="text-gradient-emerald">{score}%</span>
          </h3>
          <p className="text-sm text-neutral-500">
            {lang === 'fr'
              ? `+${Math.round((100 - score) * 0.6)}% de matches en plus si complet`
              : `+${Math.round((100 - score) * 0.6)}% more matches when complete`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
          className="h-full rounded-full"
          style={{ background: 'var(--gradient-hero)' }}
        />
      </div>

      {/* Missing items */}
      {missing.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {lang === 'fr' ? 'À compléter' : 'To complete'}
          </p>
          {missing.slice(0, 3).map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 py-1.5"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="flex-1 text-sm text-neutral-700">
                {lang === 'fr' ? item.label_fr : item.label_en}
              </div>
              <span className="text-xs text-emerald-600 font-semibold">
                +{item.weight}%
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/profile')}
        className="btn-primary-premium w-full"
      >
        {lang === 'fr' ? 'Compléter mon profil' : 'Complete my profile'}
      </motion.button>
    </motion.div>
  )
}