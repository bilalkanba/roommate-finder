/**
 * DailyRoutineTimeline — Visualise le rythme quotidien du profil.
 *
 * Sections : Morning / Work / Evening / Sleep
 * Basé sur sleep_schedule, work_type, home_presence, social_level.
 *
 * Design : timeline horizontale premium avec icons + labels.
 */

import { motion } from 'framer-motion'

function buildTimeline(profile, lang = 'fr') {
  if (!profile) return []

  const isFrench = lang === 'fr'

  // MORNING selon sleep_schedule
  let morning = { icon: '🌅', title: isFrench ? 'Matin' : 'Morning', time: '7h-9h', desc: isFrench ? 'Se lève tôt' : 'Wakes up early' }
  if (profile.sleep_schedule === 'night_owl') {
    morning = { icon: '😴', title: isFrench ? 'Matin' : 'Morning', time: '10h-12h', desc: isFrench ? 'Se lève tard' : 'Wakes up late' }
  } else if (profile.sleep_schedule === 'normal') {
    morning = { icon: '☕', title: isFrench ? 'Matin' : 'Morning', time: '8h-10h', desc: isFrench ? 'Routine standard' : 'Standard routine' }
  } else if (profile.sleep_schedule === 'irregular') {
    morning = { icon: '🔄', title: isFrench ? 'Matin' : 'Morning', time: '???', desc: isFrench ? 'Rythme flexible' : 'Flexible schedule' }
  }

  // WORK selon work_type + home_presence
  let work = { icon: '💼', title: isFrench ? 'Journée' : 'Day', time: '9h-18h', desc: isFrench ? 'Au travail' : 'At work' }
  if (profile.work_type === 'full_time_remote') {
    work = { icon: '🏡', title: isFrench ? 'Journée' : 'Day', time: '9h-18h', desc: isFrench ? 'Full remote à la maison' : 'Full remote from home' }
  } else if (profile.work_type === 'student') {
    work = { icon: '🎓', title: isFrench ? 'Journée' : 'Day', time: isFrench ? 'Cours' : 'Class', desc: isFrench ? 'Étudiant' : 'Student' }
  } else if (profile.work_type === 'freelancer') {
    work = { icon: '💼', title: isFrench ? 'Journée' : 'Day', time: isFrench ? 'Flex' : 'Flex', desc: isFrench ? 'Freelance' : 'Freelance' }
  } else if (profile.work_type === 'part_time') {
    work = { icon: '⏰', title: isFrench ? 'Journée' : 'Day', time: isFrench ? 'Mi-temps' : 'Part-time', desc: isFrench ? 'Temps partiel' : 'Part-time' }
  }

  // EVENING selon social_level
  let evening = { icon: '🌆', title: isFrench ? 'Soirée' : 'Evening', time: '18h-22h', desc: isFrench ? 'Équilibrée' : 'Balanced' }
  if (profile.social_level === 'very_social') {
    evening = { icon: '🎉', title: isFrench ? 'Soirée' : 'Evening', time: '18h-00h', desc: isFrench ? 'Sorties fréquentes' : 'Often out' }
  } else if (profile.social_level === 'very_private') {
    evening = { icon: '📚', title: isFrench ? 'Soirée' : 'Evening', time: '18h-22h', desc: isFrench ? 'Chill à la maison' : 'Chill at home' }
  }

  // SLEEP
  let sleep = { icon: '😴', title: isFrench ? 'Sommeil' : 'Sleep', time: '23h-7h', desc: isFrench ? '8h par nuit' : '8h per night' }
  if (profile.sleep_schedule === 'early_bird') {
    sleep = { icon: '🌙', title: isFrench ? 'Sommeil' : 'Sleep', time: '22h-6h', desc: isFrench ? 'Se couche tôt' : 'Sleeps early' }
  } else if (profile.sleep_schedule === 'night_owl') {
    sleep = { icon: '🌌', title: isFrench ? 'Sommeil' : 'Sleep', time: '01h-9h', desc: isFrench ? 'Couche-tard' : 'Sleeps late' }
  } else if (profile.sleep_schedule === 'irregular') {
    sleep = { icon: '🔄', title: isFrench ? 'Sommeil' : 'Sleep', time: '???', desc: isFrench ? 'Irrégulier' : 'Irregular' }
  }

  return [morning, work, evening, sleep]
}

export default function DailyRoutineTimeline({ profile, lang = 'fr' }) {
  const items = buildTimeline(profile, lang)

  if (!items.length) return null

  return (
    <div className="relative">
      {/* Ligne de fond décorative */}
      <div className="absolute left-0 right-0 top-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

      <div className="relative grid grid-cols-4 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.title + i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200, damping: 25 }}
            className="text-center"
          >
            {/* Icon circle */}
            <motion.div
              whileHover={{ scale: 1.1, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-16 h-16 mx-auto mb-3 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl relative z-10 border-2 border-emerald-100"
            >
              {item.icon}
            </motion.div>

            {/* Time */}
            <div className="text-xs font-semibold text-emerald-600 numeric mb-1">
              {item.time}
            </div>

            {/* Title */}
            <div className="text-sm font-semibold text-neutral-900 mb-0.5">
              {item.title}
            </div>

            {/* Description */}
            <div className="text-xs text-neutral-500 leading-tight px-1">
              {item.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}