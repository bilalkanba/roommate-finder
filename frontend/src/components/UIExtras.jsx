/**
 * PageTransition, ScrollToTop, CommandPalette — Micro-interactions premium.
 *
 * PageTransition: wrapper qui anime les changements de route
 * ScrollToTop: bouton flottant qui apparaît au scroll (bottom-right)
 * CommandPalette: ⌘K style Linear (bonus, super pro)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// ============================================================
// PageTransition
// ============================================================

export function PageTransition({ children }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================
// ScrollToTop button
// ============================================================

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={scrollTop}
          className="fixed bottom-6 left-6 z-30 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-neutral-200 flex items-center justify-center hover:shadow-2xl transition-shadow"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// Command Palette (⌘K)
// ============================================================

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setSelectedIdx(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const COMMANDS = [
    { icon: '🏠', label_fr: 'Accueil', label_en: 'Home', hint: '/', action: () => navigate('/') },
    { icon: '💚', label_fr: 'Voir mes matches', label_en: 'View matches', hint: '/matches', action: () => navigate('/matches') },
    { icon: '🔍', label_fr: 'Recherche avancée', label_en: 'Advanced search', hint: '/search', action: () => navigate('/search') },
    { icon: '👤', label_fr: 'Modifier mon profil', label_en: 'Edit profile', hint: '/profile', action: () => navigate('/profile') },
    { icon: '🇫🇷', label_fr: 'Passer en Français', label_en: 'Switch to French', action: () => { i18n.changeLanguage('fr'); document.documentElement.dir = 'ltr' } },
    { icon: '🇬🇧', label_fr: 'Passer en Anglais', label_en: 'Switch to English', action: () => { i18n.changeLanguage('en'); document.documentElement.dir = 'ltr' } },
    { icon: '🇪🇸', label_fr: 'Passer en Espagnol', label_en: 'Switch to Spanish', action: () => { i18n.changeLanguage('es'); document.documentElement.dir = 'ltr' } },
  ]

  const filtered = COMMANDS.filter(c => {
    const label = lang === 'fr' ? c.label_fr : c.label_en
    return label.toLowerCase().includes(query.toLowerCase())
  })

  const runCommand = (cmd) => {
    cmd.action()
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIdx]) runCommand(filtered[selectedIdx])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg mx-auto px-4"
          >
            <div className="card-glass overflow-hidden" style={{ padding: 0 }}>
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200/50">
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0) }}
                  onKeyDown={handleKeyDown}
                  placeholder={lang === 'fr' ? 'Chercher une action...' : 'Search actions...'}
                  className="flex-1 bg-transparent text-base outline-none placeholder-neutral-400"
                  autoFocus
                />
                <kbd className="text-xs text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-300 bg-white/50">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-neutral-500">
                    {lang === 'fr' ? 'Aucun résultat' : 'No results'}
                  </div>
                ) : (
                  filtered.map((cmd, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setSelectedIdx(i)}
                      onClick={() => runCommand(cmd)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        i === selectedIdx ? 'bg-emerald-50' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-lg">{cmd.icon}</span>
                      <span className="flex-1 text-neutral-800">
                        {lang === 'fr' ? cmd.label_fr : cmd.label_en}
                      </span>
                      {cmd.hint && (
                        <span className="text-xs text-neutral-400 font-mono">{cmd.hint}</span>
                      )}
                      {i === selectedIdx && (
                        <kbd className="text-xs text-emerald-600 font-mono">↵</kbd>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200/50 text-xs text-neutral-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-neutral-300 bg-white/50">↑↓</kbd>
                    {lang === 'fr' ? 'Naviguer' : 'Navigate'}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-neutral-300 bg-white/50">↵</kbd>
                    {lang === 'fr' ? 'Ouvrir' : 'Open'}
                  </span>
                </div>
                <span className="text-emerald-600 font-medium">⌘K</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}