/**
 * FilterChips — Chips des filtres actifs en haut de la page.
 * Chaque chip est clearable individuellement (click sur ×).
 */

import { motion, AnimatePresence } from 'framer-motion'

function getActiveFilters(filters, lang = 'fr') {
  const active = []

  if (filters.min_score && filters.min_score !== 40) {
    active.push({
      key: 'min_score',
      icon: '✨',
      label: `${filters.min_score}%+ ${lang === 'fr' ? 'match' : 'match'}`,
    })
  }
  if (filters.budget_min || filters.budget_max) {
    const min = filters.budget_min || 0
    const max = filters.budget_max || '∞'
    active.push({
      key: 'budget',
      icon: '💰',
      label: `${min}€ — ${max}€`,
      keys: ['budget_min', 'budget_max'],
    })
  }
  if (filters.move_in_date) {
    active.push({
      key: 'move_in_date',
      icon: '📅',
      label: filters.move_in_date,
    })
  }
  if (filters.distance_km && filters.distance_km !== 25) {
    active.push({
      key: 'distance_km',
      icon: '📍',
      label: `${filters.distance_km} km`,
    })
  }
  if (filters.languages?.length > 0) {
    active.push({
      key: 'languages',
      icon: '🗣️',
      label: filters.languages.join(', '),
    })
  }
  if (filters.students_only) {
    active.push({
      key: 'students_only',
      icon: '🎓',
      label: lang === 'fr' ? 'Étudiants' : 'Students',
    })
  }
  if (filters.remote_only) {
    active.push({
      key: 'remote_only',
      icon: '🏡',
      label: lang === 'fr' ? 'Remote' : 'Remote',
    })
  }
  if (filters.verified_only) {
    active.push({
      key: 'verified_only',
      icon: '✅',
      label: lang === 'fr' ? 'Vérifiés' : 'Verified',
    })
  }
  if (filters.pet_friendly) {
    active.push({
      key: 'pet_friendly',
      icon: '🐾',
      label: lang === 'fr' ? 'Pet friendly' : 'Pet friendly',
    })
  }
  if (filters.smoking) {
    const labels = { no_smoking: '🚭 Non-fumeur', ok_outside: '🌿 OK dehors' }
    active.push({
      key: 'smoking',
      label: labels[filters.smoking] || filters.smoking,
    })
  }
  if (filters.diet) {
    const labels = {
      omnivore: '🍖 Omnivore', vegetarian: '🥗 Végétarien',
      vegan: '🌱 Végan', halal: '☪️ Halal',
    }
    active.push({
      key: 'diet',
      label: labels[filters.diet] || filters.diet,
    })
  }
  if (filters.housing_type) {
    const labels = {
      entire_apartment: '🏠 Appart entier', private_room: '🚪 Chambre privée',
      shared_room: '👥 Chambre partagée', studio: '🏢 Studio',
    }
    active.push({
      key: 'housing_type',
      label: labels[filters.housing_type] || filters.housing_type,
    })
  }

  return active
}

export default function FilterChips({ filters, onFiltersChange, lang = 'fr' }) {
  const active = getActiveFilters(filters, lang)

  const clearOne = (chip) => {
    const newFilters = { ...filters }
    if (chip.keys) {
      chip.keys.forEach(k => { delete newFilters[k] })
    } else {
      delete newFilters[chip.key]
    }
    onFiltersChange(newFilters)
  }

  const clearAll = () => {
    onFiltersChange({})
  }

  if (active.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <AnimatePresence>
        {active.map((chip) => (
          <motion.button
            key={chip.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => clearOne(chip)}
            className="chip flex items-center gap-2 group"
          >
            {chip.icon && <span>{chip.icon}</span>}
            <span>{chip.label}</span>
            <span className="w-4 h-4 rounded-full bg-emerald-200/70 flex items-center justify-center group-hover:bg-emerald-300 transition-colors">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {active.length > 1 && (
        <button
          onClick={clearAll}
          className="text-xs text-neutral-500 hover:text-neutral-700 underline ml-2"
        >
          {lang === 'fr' ? 'Tout effacer' : 'Clear all'}
        </button>
      )}
    </div>
  )
}