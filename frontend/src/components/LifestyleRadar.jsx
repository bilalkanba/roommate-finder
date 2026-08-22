/**
 * LifestyleRadar — Radar chart animé avec Framer Motion + SVG pur.
 *
 * Pas besoin de recharts pour ça : un radar chart simple à 6 axes fait en SVG
 * natif, c'est plus léger et plus contrôlable niveau design.
 *
 * Props:
 * - dimensions: [{ label, value }] — 4 à 8 dimensions
 * - size: number (default 280)
 * - color: string (default emerald)
 * - showLabels: boolean (default true)
 */

import { motion } from 'framer-motion'

// Convertit un profil en dimensions radar (0-100)
export function profileToRadarDimensions(profile, lang = 'fr') {
  if (!profile) return []

  // Mapping des enums vers scores 0-100
  const lifestyleToScore = {
    very_low: 20, low: 40, medium: 60, high: 80, very_high: 100,
  }
  const socialToScore = {
    very_private: 20, balanced: 60, very_social: 100,
  }
  const sleepToScore = {
    early_bird: 20, normal: 50, night_owl: 80, irregular: 60,
  }

  const labels = lang === 'fr' ? {
    cleanliness: 'Propreté',
    social: 'Sociabilité',
    sleep: 'Rythme',
    noise: 'Ambiance',
    guests: 'Invités',
    activity: 'Activité',
  } : {
    cleanliness: 'Cleanliness',
    social: 'Social',
    sleep: 'Sleep',
    noise: 'Vibe',
    guests: 'Guests',
    activity: 'Activity',
  }

  return [
    { label: labels.cleanliness, value: lifestyleToScore[profile.cleanliness] || 50 },
    { label: labels.social, value: socialToScore[profile.social_level] || 50 },
    { label: labels.sleep, value: sleepToScore[profile.sleep_schedule] || 50 },
    { label: labels.noise, value: lifestyleToScore[profile.noise_tolerance] || 50 },
    { label: labels.guests, value: lifestyleToScore[profile.guests_frequency] || 50 },
    { label: labels.activity, value: profile.work_type === 'full_time_remote' ? 80 : 60 },
  ]
}

export default function LifestyleRadar({
  dimensions = [],
  size = 280,
  color = '#10b981',
  showLabels = true,
}) {
  if (!dimensions || dimensions.length < 3) return null

  const centerX = size / 2
  const centerY = size / 2
  const maxRadius = size / 2 - 40 // marge pour les labels
  const numAxes = dimensions.length
  const angleStep = (Math.PI * 2) / numAxes

  // Calcule position pour un point (angle, distance)
  const getPoint = (angleIdx, distance) => {
    // -PI/2 pour commencer en haut
    const angle = angleIdx * angleStep - Math.PI / 2
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    }
  }

  // Grille de fond (concentrique) : 4 niveaux
  const gridLevels = [0.25, 0.5, 0.75, 1]

  // Polygone des données (path pour Framer Motion)
  const dataPoints = dimensions.map((d, i) =>
    getPoint(i, (d.value / 100) * maxRadius)
  )
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="relative inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="radar-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>

        {/* Grille concentrique */}
        {gridLevels.map((level) => {
          const pts = dimensions.map((_, i) => getPoint(i, maxRadius * level))
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
          return (
            <path
              key={level}
              d={path}
              fill="none"
              stroke="#e7e5e4"
              strokeWidth={1}
              opacity={0.5}
            />
          )
        })}

        {/* Axes radiaux */}
        {dimensions.map((_, i) => {
          const end = getPoint(i, maxRadius)
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={end.x}
              y2={end.y}
              stroke="#e7e5e4"
              strokeWidth={1}
              opacity={0.4}
            />
          )
        })}

        {/* Zone remplie des données */}
        <motion.path
          d={dataPath}
          fill="url(#radar-gradient)"
          stroke="url(#radar-stroke)"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1] }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        />

        {/* Points de données */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="white"
            stroke={color}
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
          />
        ))}

        {/* Labels */}
        {showLabels && dimensions.map((d, i) => {
          const labelPos = getPoint(i, maxRadius + 22)
          return (
            <motion.g
              key={d.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.05 }}
            >
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-neutral-700"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {d.label}
              </text>
              <text
                x={labelPos.x}
                y={labelPos.y + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] fill-neutral-400 numeric"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {Math.round(d.value)}%
              </text>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}