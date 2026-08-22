/**
 * NavbarPremium — Navbar sticky glassmorphism.
 *
 * Features :
 * - Blur backdrop au scroll
 * - Logo animé avec gradient
 * - Nav links avec underline active
 * - Language switcher (FR/EN/ES/AR)
 * - Avatar dropdown
 * - Mobile menu (hamburger + drawer)
 *
 * Remplace ton Navbar.jsx actuel.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { profilesApi } from '@/lib/api'

const LANGUAGES = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
]

export default function NavbarPremium() {
  const location = useLocation()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const langRef = useRef(null)
  const userRef = useRef(null)

  // Track scroll pour glassmorphism
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch user + profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    profilesApi.getMine().then(setProfile).catch(() => setProfile(null))

    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })
    return () => sub.subscription?.unsubscribe()
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangMenuOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]

  const navLinks = user ? [
    { path: '/', label: i18n.language === 'fr' ? 'Accueil' : 'Home', icon: '🏠' },
    { path: '/matches', label: i18n.language === 'fr' ? 'Matches' : 'Matches', icon: '💚' },
    { path: '/search', label: i18n.language === 'fr' ? 'Recherche' : 'Search', icon: '🔍' },
    { path: '/profile', label: i18n.language === 'fr' ? 'Mon profil' : 'My profile', icon: '👤' },
  ] : []

  const initials = profile?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-lg bg-white/70 border-b border-neutral-200/60'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg shadow-md"
            >
              🏡
            </motion.div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-serif-display text-lg leading-none">Roommate</span>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                Finder AI
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span className={active ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'}>
                      {link.label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-lg bg-neutral-100 -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div ref={langRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="btn-icon text-base"
                aria-label="Language"
              >
                {currentLang.flag}
              </motion.button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 min-w-[180px] bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden"
                  >
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          i18n.changeLanguage(l.code)
                          setLangMenuOpen(false)
                          // Direction for AR
                          document.documentElement.dir = l.code === 'ar' ? 'rtl' : 'ltr'
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors text-left ${
                          l.code === i18n.language ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-neutral-700'
                        }`}
                      >
                        <span className="text-lg">{l.flag}</span>
                        <span className="flex-1">{l.name}</span>
                        {l.code === i18n.language && (
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar / login */}
            {user ? (
              <div ref={userRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  aria-label="User menu"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 min-w-[220px] bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <div className="text-sm font-semibold text-neutral-900 truncate">
                          {profile?.full_name || user.email}
                        </div>
                        <div className="text-xs text-neutral-500 truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <span>👤</span>
                        <span>{i18n.language === 'fr' ? 'Modifier mon profil' : 'Edit profile'}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-neutral-100"
                      >
                        <span>👋</span>
                        <span>{i18n.language === 'fr' ? 'Déconnexion' : 'Logout'}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="btn-primary-premium text-sm px-4 py-2"
              >
                {i18n.language === 'fr' ? 'Connexion' : 'Login'}
              </motion.button>
            )}

            {/* Mobile burger */}
            {user && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden btn-icon"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </motion.button>
            )}
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed top-16 right-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl z-40 p-4"
            >
              <div className="space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}