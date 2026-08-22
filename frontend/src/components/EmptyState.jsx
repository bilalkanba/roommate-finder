/**
 * EmptyState — Composant réutilisable pour tous les états vides.
 *
 * Variants:
 * - no_matches : "Ton coloc parfait est là-bas"
 * - no_results : "Aucun résultat"
 * - error : "Une erreur est survenue"
 * - no_profile : "Crée ton profil"
 * - offline : "Pas de connexion"
 *
 * Props:
 * - variant: string
 * - title: string (optional override)
 * - description: string (optional override)
 * - actionLabel: string
 * - onAction: () => void
 * - lang: 'fr' | 'en'
 */

import { motion } from 'framer-motion'

const VARIANTS = {
  no_matches: {
    emoji: '💫',
    animation: { rotate: [0, 10, -10, 0] },
    title_fr: 'Ton coloc parfait est là-bas',
    title_en: 'Your perfect roommate is out there',
    desc_fr: 'Continue à compléter ton profil pour trouver plus de matches compatibles.',
    desc_en: 'Keep completing your profile to find more compatible matches.',
    actionLabel_fr: 'Compléter mon profil',
    actionLabel_en: 'Complete my profile',
  },
  no_results: {
    emoji: '🔍',
    animation: { rotate: [0, 10, -10, 0] },
    title_fr: 'Aucun résultat',
    title_en: 'No results',
    desc_fr: 'Essaie d\'assouplir tes filtres pour découvrir plus de profils.',
    desc_en: 'Try relaxing your filters to discover more profiles.',
    actionLabel_fr: 'Réinitialiser',
    actionLabel_en: 'Reset',
  },
  error: {
    emoji: '😕',
    animation: { y: [0, -4, 0] },
    title_fr: 'Une erreur est survenue',
    title_en: 'Something went wrong',
    desc_fr: 'Réessaie dans un instant. Si le problème persiste, contacte-nous.',
    desc_en: 'Please try again in a moment. If the issue persists, contact us.',
    actionLabel_fr: 'Réessayer',
    actionLabel_en: 'Retry',
  },
  no_profile: {
    emoji: '👋',
    animation: { rotate: [0, 20, -20, 0] },
    title_fr: 'Bienvenue !',
    title_en: 'Welcome!',
    desc_fr: 'Crée ton profil pour trouver ton coloc idéal grâce à notre IA.',
    desc_en: 'Create your profile to find your ideal roommate with our AI.',
    actionLabel_fr: 'Créer mon profil ✨',
    actionLabel_en: 'Create my profile ✨',
  },
  offline: {
    emoji: '📡',
    animation: { opacity: [1, 0.5, 1] },
    title_fr: 'Pas de connexion',
    title_en: 'No connection',
    desc_fr: 'Vérifie ta connexion internet et réessaie.',
    desc_en: 'Check your internet connection and try again.',
    actionLabel_fr: 'Réessayer',
    actionLabel_en: 'Retry',
  },
  coming_soon: {
    emoji: '🚧',
    animation: { rotate: [0, -5, 5, 0] },
    title_fr: 'Bientôt disponible',
    title_en: 'Coming soon',
    desc_fr: 'Cette fonctionnalité arrive prochainement. Reviens vite !',
    desc_en: 'This feature is coming soon. Stay tuned!',
    actionLabel_fr: 'Retour',
    actionLabel_en: 'Back',
  },
}

export default function EmptyState({
  variant = 'no_matches',
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  lang = 'fr',
  compact = false,
}) {
  const config = VARIANTS[variant] || VARIANTS.no_matches

  const displayTitle = title || (lang === 'fr' ? config.title_fr : config.title_en)
  const displayDesc = description || (lang === 'fr' ? config.desc_fr : config.desc_en)
  const displayAction = actionLabel || (lang === 'fr' ? config.actionLabel_fr : config.actionLabel_en)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center text-center max-w-md mx-auto ${compact ? 'py-8' : 'py-16 px-6'}`}
    >
      <motion.div
        animate={config.animation}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={compact ? 'text-6xl mb-4' : 'text-8xl mb-6'}
      >
        {config.emoji}
      </motion.div>

      <h2 className={`font-serif-display leading-tight mb-3 ${compact ? 'text-2xl' : 'text-3xl md:text-4xl'}`}>
        {displayTitle}
      </h2>

      <p className={`text-neutral-600 leading-relaxed mb-6 ${compact ? 'text-sm' : 'text-base'}`}>
        {displayDesc}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {onAction && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAction}
            className="btn-primary-premium"
          >
            {displayAction}
          </motion.button>
        )}
        {onSecondary && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSecondary}
            className="btn-ghost-premium"
          >
            {secondaryLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}