/**
 * DesignShowcase — Composant de test pour valider :
 * 1. Framer Motion est bien installé
 * 2. Les design tokens fonctionnent
 * 3. Les animations sont fluides
 *
 * Route temporaire : /design-showcase
 * (À supprimer après validation de la Phase B1)
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { VARIANTS, SPRINGS } from '@/lib/designTokens'

export default function DesignShowcase() {
  const [count, setCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [likedItems, setLikedItems] = useState(new Set())

  const toggleLike = (id) => {
    const newSet = new Set(likedItems)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setLikedItems(newSet)
  }

  return (
    <div className="min-h-screen bg-mesh py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={VARIANTS.fadeInUp}
        >
          <h1 className="text-6xl font-serif-display leading-tight mb-4">
            Design system{' '}
            <span className="text-gradient-hero">premium</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Phase B1 — validation Framer Motion + design tokens. Si tu vois
            des animations fluides ci-dessous, tout marche.
          </p>
        </motion.div>

        {/* Cards showcase */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={VARIANTS.staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {['Emerald', 'Teal', 'Indigo'].map((color, i) => (
            <motion.div
              key={color}
              variants={VARIANTS.staggerItem}
              whileHover={{ y: -8, transition: SPRINGS.gentle }}
              className="card-premium cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl mb-4 ${
                i === 0 ? 'bg-emerald-500' :
                i === 1 ? 'bg-teal-500' : 'bg-indigo-500'
              } shadow-lg`}></div>
              <h3 className="text-xl font-semibold mb-2">{color} card</h3>
              <p className="text-neutral-600 text-sm">
                Hover me — je monte avec un spring gentle. C'est ça une
                animation premium.
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="section-title-premium">Buttons premium</h2>
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRINGS.snappy}
              className="btn-primary-premium"
            >
              Primary CTA ✨
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRINGS.snappy}
              className="btn-ghost-premium"
            >
              Ghost button
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRINGS.wobbly}
              className="btn-icon"
              aria-label="Like"
            >
              ❤️
            </motion.button>
          </div>
        </section>

        {/* Animated counter */}
        <section className="card-premium">
          <h2 className="section-title-premium">Animated counter</h2>
          <div className="flex items-center gap-6">
            <motion.div
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRINGS.wobbly}
              className="text-6xl font-bold text-gradient-emerald numeric"
            >
              {count}
            </motion.div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCount(c => c + 1)}
                className="btn-primary-premium"
              >
                +
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCount(c => Math.max(0, c - 1))}
                className="btn-ghost-premium"
              >
                −
              </motion.button>
            </div>
          </div>
        </section>

        {/* Chips */}
        <section className="card-premium">
          <h2 className="section-title-premium">Chips (hobbies)</h2>
          <div className="flex flex-wrap gap-2">
            {['🏋️ Gym', '🎮 Gaming', '🍳 Cooking', '🎬 Movies', '📚 Reading', '☕ Coffee', '🎵 Music'].map((chip, i) => (
              <motion.button
                key={chip}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, ...SPRINGS.snappy }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleLike(chip)}
                className={likedItems.has(chip) ? 'chip' : 'chip-neutral'}
              >
                {chip}
              </motion.button>
            ))}
          </div>
        </section>

        {/* AI bubble */}
        <section className="card-premium">
          <h2 className="section-title-premium">AI icebreaker (bubble)</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRINGS.gentle}
            className="ai-bubble max-w-md"
          >
            <p className="text-sm mb-1 opacity-80">Suggested message</p>
            <p>
              "Hi! I noticed we're both remote workers and enjoy cooking.
              What's your favorite thing to make after work?"
            </p>
          </motion.div>
        </section>

        {/* Progress bars */}
        <section className="card-premium">
          <h2 className="section-title-premium">Compatibility breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Lifestyle', value: 92 },
              { label: 'Budget', value: 86 },
              { label: 'Personality', value: 94 },
              { label: 'Housing', value: 75 },
            ].map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="numeric text-neutral-600">{item.value}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'var(--gradient-hero)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal test */}
        <section>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="btn-primary-premium"
          >
            Open modal
          </motion.button>
        </section>

        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={SPRINGS.gentle}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4"
              >
                <div className="card-glass p-8">
                  <h3 className="text-2xl font-semibold mb-3">Premium modal ✨</h3>
                  <p className="text-neutral-600 mb-6">
                    Glassmorphism + backdrop blur + smooth spring animations.
                    C'est le niveau de qualité qu'on va mettre partout.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowModal(false)}
                    className="btn-primary-premium w-full"
                  >
                    Cool !
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="text-center text-neutral-500 text-sm">
          Si toutes ces animations sont fluides → Framer Motion + tokens OK ✅
        </div>
      </div>
    </div>
  )
}