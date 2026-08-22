/**
 * CompatibilityRing — Circular progress ring animé pour le score.
 *
 * Utilise SVG + Framer Motion pour une animation fluide au mount.
 * Le gradient change selon le tier de score (excellent/good/medium/low).
 *
 * Props:
 * - score: number (0-100)
 * - size: number (default 120) — taille en px
 * - strokeWidth: number (default 8) — épaisseur du ring
 * - showLabel: boolean (default true) — affiche "Excellent Match" etc.
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

// Détermine le tier et le label selon le score
function getScoreTier(score) {
  if (score >= 85) return {
    tier: 'excellent',
    label: 'Excellent Match',
    gradientId: 'gradient-excellent',
    colors: ['#10b981', '#06b6d4'],
    glow: 'rgba(16, 185, 129, 0.4)',
  }
  if (score >= 70) return {
    tier: 'good',
    label: 'Great Match',
    gradientId: 'gradient-good',
    colors: ['#14b8a6', '#3b82f6'],
    glow: 'rgba(20, 184, 166, 0.4)',
  }
  if (score >= 50) return {
    tier: 'medium',
    label: 'Good Match',
    gradientId: 'gradient-medium',
    colors: ['#f59e0b', '#ec4899'],
    glow: 'rgba(245, 158, 11, 0.4)',
  }
  return {
    tier: 'low',
    label: 'Possible Match',
    gradientId: 'gradient-low',
    colors: ['#6b7280', '#9ca3af'],
    glow: 'rgba(107, 114, 128, 0.3)',
  }
}

export default function CompatibilityRing({
  score = 0,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
}) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const tier = getScoreTier(score)

  // Compte à rebours animé pour le nombre
  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    const startScore = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(startScore + (score - startScore) * eased))

      if (progress < 1) requestAnimationFrame(animate)
    }
    animate()
  }, [score])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40"
        style={{
          background: `radial-gradient(circle, ${tier.glow} 0%, transparent 70%)`,
        }}
      />

      <svg
        width={size}
        height={size}
        className="transform -rotate-90 compat-ring relative"
      >
        <defs>
          <linearGradient
            id={tier.gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={tier.colors[0]} />
            <stop offset="100%" stopColor={tier.colors[1]} />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={strokeWidth}
          opacity={0.4}
        />

        {/* Animated progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${tier.gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1.5,
            ease: [0.05, 0.7, 0.1, 1],
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
          className="text-3xl font-bold numeric leading-none"
          style={{
            background: `linear-gradient(135deg, ${tier.colors[0]} 0%, ${tier.colors[1]} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {animatedScore}
          <span className="text-xl">%</span>
        </motion.div>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-[10px] font-medium text-neutral-500 mt-0.5 tracking-wide uppercase"
          >
            {tier.label}
          </motion.div>
        )}
      </div>
    </div>
  )
}