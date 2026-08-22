/**
 * TrendingCities v2 — Fix: redirection vers /search au lieu de /matches.
 *
 * La SearchPage supporte le query param ?city=X pour pre-filter.
 * MatchesPage ne le supporte pas.
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { COUNTRY_FLAGS } from '@/lib/europeanUniversityCities'

const TRENDING_CITIES = [
  { name: 'Madrid', country: 'Spain', code: 'ES', searchers: 2340, delta: '+12%', accent: 'from-red-400 to-yellow-400' },
  { name: 'Barcelona', country: 'Spain', code: 'ES', searchers: 1890, delta: '+8%', accent: 'from-orange-400 to-pink-400' },
  { name: 'Paris', country: 'France', code: 'FR', searchers: 3120, delta: '+15%', accent: 'from-blue-400 to-indigo-400' },
  { name: 'Berlin', country: 'Germany', code: 'DE', searchers: 1560, delta: '+22%', accent: 'from-yellow-400 to-red-400' },
  { name: 'Amsterdam', country: 'Netherlands', code: 'NL', searchers: 1230, delta: '+18%', accent: 'from-orange-400 to-red-500' },
  { name: 'Lisbon', country: 'Portugal', code: 'PT', searchers: 980, delta: '+30%', accent: 'from-green-400 to-red-400' },
  { name: 'Milan', country: 'Italy', code: 'IT', searchers: 890, delta: '+5%', accent: 'from-green-400 to-red-500' },
  { name: 'Vienna', country: 'Austria', code: 'AT', searchers: 720, delta: '+10%', accent: 'from-red-400 to-white' },
]

export default function TrendingCities({ lang = 'fr' }) {
  const navigate = useNavigate()

  const title = lang === 'fr' ? 'Villes tendance'
    : lang === 'es' ? 'Ciudades tendencia'
    : lang === 'ar' ? 'المدن الرائجة'
    : 'Trending cities'

  const subtitle = lang === 'fr' ? 'Les colocs les plus recherchés cette semaine'
    : lang === 'es' ? 'Los compañeros más buscados esta semana'
    : lang === 'ar' ? 'أكثر شركاء السكن المطلوبين هذا الأسبوع'
    : 'Most searched roommates this week'

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔥</span>
            <h2 className="section-title-premium mb-0">{title}</h2>
          </div>
          <p className="text-sm text-neutral-500">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TRENDING_CITIES.map((city, i) => (
          <motion.button
            key={city.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 25 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            /* FIX: redirect vers /search, pas /matches */
            onClick={() => navigate(`/search?city=${encodeURIComponent(city.name)}`)}
            className="relative overflow-hidden rounded-xl p-4 text-left group border border-neutral-100 bg-white hover:shadow-lg transition-shadow"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${city.accent}`} />

            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{COUNTRY_FLAGS[city.code] || '🏙️'}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {city.delta}
              </span>
            </div>

            <div className="font-semibold text-neutral-900 text-sm mb-0.5 truncate">
              {city.name}
            </div>
            <div className="text-xs text-neutral-500 truncate">
              {city.country}
            </div>

            <div className="flex items-center gap-1 mt-3 text-xs text-neutral-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="numeric">{city.searchers.toLocaleString()}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}