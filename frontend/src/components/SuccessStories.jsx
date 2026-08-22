/**
 * SuccessStories — Carousel de témoignages.
 *
 * Pour le MVP : témoignages hardcodés (à remplacer par vrais témoignages plus tard).
 * Design : cards défilantes avec auto-play + navigation manuelle.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const STORIES = [
  {
    id: 1,
    match_score: 94,
    duration_fr: 'Colocs depuis 8 mois',
    duration_en: 'Roommates for 8 months',
    city: 'Madrid',
    country_code: 'ES',
    initials_a: 'ML',
    initials_b: 'JR',
    quote_fr: '"On a matché à 94%. On aime tous les deux cuisiner, on est méga sociables. Ça fait 8 mois qu\'on vit ensemble, c\'est le feu."',
    quote_en: '"We matched at 94%. We both love cooking and are super social. Living together for 8 months, it\'s amazing."',
    author_fr: 'Maria & Julio',
    author_en: 'Maria & Julio',
    accent: 'from-red-400 to-yellow-500',
  },
  {
    id: 2,
    match_score: 89,
    duration_fr: 'Colocs depuis 1 an',
    duration_en: 'Roommates for 1 year',
    city: 'Paris',
    country_code: 'FR',
    initials_a: 'SL',
    initials_b: 'TC',
    quote_fr: '"L\'IA a détecté qu\'on avait le même rythme de sommeil et les mêmes hobbies. Un an après, on part même en vacances ensemble."',
    quote_en: '"The AI detected we had the same sleep schedule and hobbies. One year later, we even travel together."',
    author_fr: 'Sarah & Thomas',
    author_en: 'Sarah & Thomas',
    accent: 'from-blue-400 to-indigo-500',
  },
  {
    id: 3,
    match_score: 91,
    duration_fr: 'Colocs depuis 6 mois',
    duration_en: 'Roommates for 6 months',
    city: 'Berlin',
    country_code: 'DE',
    initials_a: 'AK',
    initials_b: 'FM',
    quote_fr: '"Je cherchais quelqu\'un de calme, végé et non-fumeur. J\'ai matché à 91%. On s\'entend super bien."',
    quote_en: '"I was looking for someone calm, vegetarian and non-smoker. Matched at 91%. We get along great."',
    author_fr: 'Anna & Felix',
    author_en: 'Anna & Felix',
    accent: 'from-yellow-400 to-red-500',
  },
]

export default function SuccessStories({ lang = 'fr' }) {
  const [current, setCurrent] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Auto-play : change de story toutes les 6s
  useEffect(() => {
    if (!autoPlay) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % STORIES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [autoPlay])

  const story = STORIES[current]

  return (
    <div className="card-premium overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💚</span>
            <h2 className="section-title-premium mb-0">
              {lang === 'fr' ? 'Histoires de succès' : 'Success stories'}
            </h2>
          </div>
          <p className="text-sm text-neutral-500">
            {lang === 'fr'
              ? 'Ils ont trouvé leur coloc grâce à l\'IA'
              : 'They found their roommate thanks to AI'}
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-1.5">
          {STORIES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setAutoPlay(false) }}
              className={`transition-all duration-300 rounded-full ${
                i === current ? 'w-6 h-1.5 bg-emerald-500' : 'w-1.5 h-1.5 bg-neutral-300'
              }`}
              aria-label={`Story ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="relative min-h-[240px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.05, 0.7, 0.1, 1] }}
            className="relative"
          >
            {/* Match score decoration */}
            <div className={`absolute -top-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br ${story.accent} flex items-center justify-center text-white font-bold text-sm shadow-lg glow-emerald opacity-90`}>
              <div className="text-center leading-tight">
                <div className="text-lg">{story.match_score}%</div>
                <div className="text-[8px] opacity-90">MATCH</div>
              </div>
            </div>

            {/* Avatars pair */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${story.accent} flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-md`}>
                  {story.initials_a}
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-md">
                  {story.initials_b}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {lang === 'fr' ? story.author_fr : story.author_en}
                </div>
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                  <span>📍 {story.city}</span>
                  <span className="text-neutral-300">·</span>
                  <span>{lang === 'fr' ? story.duration_fr : story.duration_en}</span>
                </div>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-neutral-700 leading-relaxed italic">
              {lang === 'fr' ? story.quote_fr : story.quote_en}
            </blockquote>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}