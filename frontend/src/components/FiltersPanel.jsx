/**
 * FiltersPanel — Panneau de filtres avancés (Airbnb-style).
 *
 * Filtres :
 * - Budget (slider min/max)
 * - Move-in date (date input)
 * - Distance (slider km)
 * - Languages (multi-select chips)
 * - Toggles : students only, remote workers, verified, pet friendly
 * - Smoking preference (radio)
 * - Diet preference (radio)
 * - Housing type (radio)
 * - Min compatibility (slider %)
 *
 * Props:
 * - filters: object avec tous les filtres actifs
 * - onFiltersChange: (newFilters) => void
 * - onReset: () => void
 * - onClose: () => void (pour mobile modal)
 * - isMobile: boolean
 */

import { motion } from 'framer-motion'

const LANGUAGES = [
  { code: 'FR', label: 'Français' },
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Español' },
  { code: 'DE', label: 'Deutsch' },
  { code: 'IT', label: 'Italiano' },
  { code: 'PT', label: 'Português' },
  { code: 'AR', label: 'العربية' },
  { code: 'NL', label: 'Nederlands' },
]

const SMOKING_OPTIONS = [
  { value: 'any', emoji: '🔁', label_fr: 'Peu importe', label_en: 'Any' },
  { value: 'no_smoking', emoji: '🚭', label_fr: 'Non-fumeur', label_en: 'Non-smoker' },
  { value: 'ok_outside', emoji: '🌿', label_fr: 'OK dehors', label_en: 'OK outside' },
]

const DIET_OPTIONS = [
  { value: 'any', emoji: '🔁', label_fr: 'Peu importe', label_en: 'Any' },
  { value: 'omnivore', emoji: '🍖', label_fr: 'Omnivore', label_en: 'Omnivore' },
  { value: 'vegetarian', emoji: '🥗', label_fr: 'Végétarien', label_en: 'Vegetarian' },
  { value: 'vegan', emoji: '🌱', label_fr: 'Végan', label_en: 'Vegan' },
  { value: 'halal', emoji: '☪️', label_fr: 'Halal', label_en: 'Halal' },
]

const HOUSING_OPTIONS = [
  { value: 'any', emoji: '🔁', label_fr: 'Peu importe', label_en: 'Any' },
  { value: 'entire_apartment', emoji: '🏠', label_fr: 'Appart entier', label_en: 'Entire apartment' },
  { value: 'private_room', emoji: '🚪', label_fr: 'Chambre privée', label_en: 'Private room' },
  { value: 'shared_room', emoji: '👥', label_fr: 'Chambre partagée', label_en: 'Shared room' },
  { value: 'studio', emoji: '🏢', label_fr: 'Studio', label_en: 'Studio' },
]

export default function FiltersPanel({
  filters,
  onFiltersChange,
  onReset,
  onClose,
  isMobile = false,
  lang = 'fr',
}) {
  const setFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleLanguage = (code) => {
    const current = filters.languages || []
    const newLangs = current.includes(code)
      ? current.filter(l => l !== code)
      : [...current, code]
    setFilter('languages', newLangs)
  }

  return (
    <div className={`${isMobile ? 'p-6' : ''} space-y-6`}>
      {/* Header mobile only */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold">
            {lang === 'fr' ? 'Filtres' : 'Filters'}
          </h2>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ===== Min compatibility ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Compatibilité minimum' : 'Minimum compatibility'}
        icon="✨"
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600">
              {lang === 'fr' ? 'Score min' : 'Min score'}
            </span>
            <span className="text-lg font-bold text-gradient-emerald numeric">
              {filters.min_score || 40}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.min_score || 40}
            onChange={(e) => setFilter('min_score', Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${filters.min_score || 40}%, #e5e7eb ${filters.min_score || 40}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </FilterSection>

      {/* ===== Budget ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Budget mensuel' : 'Monthly budget'}
        icon="💰"
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Min €</label>
            <input
              type="number"
              min="0"
              max="10000"
              step="50"
              value={filters.budget_min || ''}
              onChange={(e) => setFilter('budget_min', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              className="input-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Max €</label>
            <input
              type="number"
              min="0"
              max="10000"
              step="50"
              value={filters.budget_max || ''}
              onChange={(e) => setFilter('budget_max', e.target.value ? Number(e.target.value) : null)}
              placeholder="∞"
              className="input-lg text-sm"
            />
          </div>
        </div>
      </FilterSection>

      {/* ===== Move-in date ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Date d\'emménagement' : 'Move-in date'}
        icon="📅"
      >
        <input
          type="date"
          value={filters.move_in_date || ''}
          onChange={(e) => setFilter('move_in_date', e.target.value || null)}
          className="input-lg text-sm"
        />
        <p className="text-xs text-neutral-500 mt-1">
          {lang === 'fr' ? '± 30 jours autour de cette date' : '± 30 days around this date'}
        </p>
      </FilterSection>

      {/* ===== Distance ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Distance max' : 'Max distance'}
        icon="📍"
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600">
              {lang === 'fr' ? 'Rayon' : 'Radius'}
            </span>
            <span className="text-lg font-bold text-neutral-900 numeric">
              {filters.distance_km || 25} km
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={filters.distance_km || 25}
            onChange={(e) => setFilter('distance_km', Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${((filters.distance_km || 25) / 100) * 100}%, #e5e7eb ${((filters.distance_km || 25) / 100) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </FilterSection>

      {/* ===== Languages ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Langues parlées' : 'Languages'}
        icon="🗣️"
      >
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const isSelected = (filters.languages || []).includes(l.code)
            return (
              <motion.button
                key={l.code}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleLanguage(l.code)}
                className={isSelected ? 'chip' : 'chip-neutral'}
              >
                {l.label}
              </motion.button>
            )
          })}
        </div>
      </FilterSection>

      {/* ===== Toggles ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Filtres rapides' : 'Quick filters'}
        icon="⚡"
      >
        <div className="space-y-1">
          <ToggleRow
            icon="🎓"
            label={lang === 'fr' ? 'Étudiants uniquement' : 'Students only'}
            checked={!!filters.students_only}
            onChange={(v) => setFilter('students_only', v)}
          />
          <ToggleRow
            icon="🏡"
            label={lang === 'fr' ? 'Full remote' : 'Remote workers'}
            checked={!!filters.remote_only}
            onChange={(v) => setFilter('remote_only', v)}
          />
          <ToggleRow
            icon="✅"
            label={lang === 'fr' ? 'Profils vérifiés' : 'Verified profiles'}
            checked={!!filters.verified_only}
            onChange={(v) => setFilter('verified_only', v)}
          />
          <ToggleRow
            icon="🐾"
            label={lang === 'fr' ? 'Aime les animaux' : 'Pet friendly'}
            checked={!!filters.pet_friendly}
            onChange={(v) => setFilter('pet_friendly', v)}
          />
        </div>
      </FilterSection>

      {/* ===== Smoking ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Fumeur' : 'Smoking'}
        icon="🚭"
      >
        <div className="flex flex-wrap gap-2">
          {SMOKING_OPTIONS.map((opt) => (
            <RadioChip
              key={opt.value}
              selected={filters.smoking === opt.value || (!filters.smoking && opt.value === 'any')}
              onClick={() => setFilter('smoking', opt.value === 'any' ? null : opt.value)}
              emoji={opt.emoji}
              label={lang === 'fr' ? opt.label_fr : opt.label_en}
            />
          ))}
        </div>
      </FilterSection>

      {/* ===== Diet ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Régime alimentaire' : 'Diet'}
        icon="🍽️"
      >
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((opt) => (
            <RadioChip
              key={opt.value}
              selected={filters.diet === opt.value || (!filters.diet && opt.value === 'any')}
              onClick={() => setFilter('diet', opt.value === 'any' ? null : opt.value)}
              emoji={opt.emoji}
              label={lang === 'fr' ? opt.label_fr : opt.label_en}
            />
          ))}
        </div>
      </FilterSection>

      {/* ===== Housing type ===== */}
      <FilterSection
        title={lang === 'fr' ? 'Type de logement' : 'Housing type'}
        icon="🏠"
      >
        <div className="flex flex-wrap gap-2">
          {HOUSING_OPTIONS.map((opt) => (
            <RadioChip
              key={opt.value}
              selected={filters.housing_type === opt.value || (!filters.housing_type && opt.value === 'any')}
              onClick={() => setFilter('housing_type', opt.value === 'any' ? null : opt.value)}
              emoji={opt.emoji}
              label={lang === 'fr' ? opt.label_fr : opt.label_en}
            />
          ))}
        </div>
      </FilterSection>

      {/* ===== Actions ===== */}
      <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="btn-ghost-premium flex-1"
        >
          {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
        </motion.button>
        {isMobile && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="btn-primary-premium flex-1"
          >
            {lang === 'fr' ? 'Appliquer' : 'Apply'}
          </motion.button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function FilterSection({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function ToggleRow({ icon, label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 py-2 hover:bg-neutral-50 rounded-lg px-2 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1 text-sm text-neutral-700 text-left">{label}</span>
      <div
        className={`w-10 h-6 rounded-full relative transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-neutral-300'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        />
      </div>
    </button>
  )
}

function RadioChip({ selected, onClick, emoji, label }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={selected ? 'chip' : 'chip-neutral'}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </motion.button>
  )
}