/**
 * MatchCard : affiche un profil matché avec son score de compatibilité.
 *
 * Props :
 *   - match : MatchResult du backend
 */

import { useTranslation } from 'react-i18next'

export default function MatchCard({ match }) {
  const { t } = useTranslation()
  const { profile, total_score, breakdown, explanation } = match

  // Couleur du badge selon le score
  const scoreColor =
    total_score >= 80
      ? 'bg-green-100 text-green-800'
      : total_score >= 60
      ? 'bg-blue-100 text-blue-800'
      : total_score >= 40
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800'

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Avatar + nom */}
        <div className="flex items-center gap-4">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xl">
              {profile.full_name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {profile.full_name}, {profile.age}
            </h3>
            <p className="text-sm text-gray-500">
              {profile.occupation} · {profile.target_city}
            </p>
            <p className="text-sm text-gray-500">
              {profile.budget_min_eur}–{profile.budget_max_eur}€/mois
            </p>
          </div>
        </div>

        {/* Score badge */}
        <div className={`px-4 py-2 rounded-full font-semibold ${scoreColor}`}>
          {Math.round(total_score)}%
        </div>
      </div>

      {/* Explication IA */}
      {explanation && (
        <div className="mt-4 p-4 bg-brand-50 border border-brand-100 rounded-lg">
          <p className="text-sm text-gray-700 italic">✨ {explanation}</p>
        </div>
      )}

      {/* Breakdown par dimension */}
      <div className="mt-4 space-y-2">
        {breakdown.map((dim) => (
          <div key={dim.dimension} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-32">{dim.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${dim.score}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10 text-right">
              {Math.round(dim.score)}
            </span>
          </div>
        ))}
      </div>

      <button className="btn-primary w-full mt-4">
        {t('matches.viewProfile')}
      </button>
    </div>
  )
}
