/**
 * Navbar v6 — channelKey pour éviter conflit Realtime.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { profilesApi, messagesApi } from '@/lib/api'
import { useRealtimeMessages, playNotificationSound } from '@/hooks/useRealtimeMessages'

const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'ar', label: 'العربية', short: 'AR' },
]

const HIDDEN_ON_ROUTES = ['/login']

export default function NavbarPremium() {
  const location = useLocation()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const langRef = useRef(null)
  const userRef = useRef(null)

  const isRTL = i18n.language === 'ar'
  const shouldHide = HIDDEN_ON_ROUTES.some(r => location.pathname === r || location.pathname.startsWith(r + '/'))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    profilesApi.getMine().then(setProfile).catch(() => setProfile(null))

    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        profilesApi.getMine().then(setProfile).catch(() => setProfile(null))
      } else {
        setProfile(null)
        setUnreadCount(0)
      }
    })
    return () => sub.subscription?.unsubscribe()
  }, [])

  const refreshUnread = () => {
    if (!user) return
    messagesApi.getUnreadCount()
      .then(data => setUnreadCount(data.unread_count || 0))
      .catch(() => {})
  }

  useEffect(() => {
    refreshUnread()
  }, [user, location.pathname])

  // FIX : channelKey UNIQUE pour la Navbar
  useRealtimeMessages({
    userId: user?.id,
    channelKey: 'navbar',
    enabled: !!user,
    onNewMessage: (newMsg) => {
      if (newMsg.to_user_id === user?.id) {
        const onThisConversation = location.pathname === `/messages/${newMsg.from_user_id}`
        if (!onThisConversation) {
          setUnreadCount(prev => prev + 1)
          if (document.hidden) {
            playNotificationSound()
          }
        }
      }
    },
    onUpdatedMessage: (updatedMsg) => {
      if (updatedMsg.to_user_id === user?.id && updatedMsg.read_at) {
        refreshUnread()
      }
    },
  })

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangMenuOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  if (shouldHide) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]

  const navLinks = user ? [
    { path: '/', label_fr: 'Accueil', label_en: 'Home', label_es: 'Inicio', label_ar: 'الرئيسية' },
    { path: '/matches', label_fr: 'Matches', label_en: 'Matches', label_es: 'Coincidencias', label_ar: 'المطابقات' },
    { path: '/search', label_fr: 'Recherche', label_en: 'Search', label_es: 'Buscar', label_ar: 'بحث' },
    { path: '/messages', label_fr: 'Messages', label_en: 'Messages', label_es: 'Mensajes', label_ar: 'الرسائل', badge: unreadCount },
    { path: '/profile', label_fr: 'Mon profil', label_en: 'My profile', label_es: 'Mi perfil', label_ar: 'ملفي' },
  ] : []

  const getLabel = (link) => link[`label_${i18n.language}`] || link.label_en
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
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to={user ? '/' : '/login'} className="flex items-center gap-2 group shrink-0">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg shadow-md shrink-0"
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

          {user && (
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => {
                const active = location.pathname === link.path || (link.path === '/messages' && location.pathname.startsWith('/messages'))
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span className={`inline-flex items-center gap-1.5 ${active ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'}`}>
                      {getLabel(link)}
                      {link.badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                        >
                          {link.badge > 9 ? '9+' : link.badge}
                        </motion.span>
                      )}
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

          <div className="flex items-center gap-2 shrink-0">
            <div ref={langRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{currentLang.short}</span>
              </motion.button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full mt-2 min-w-[180px] bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden ${
                      isRTL ? 'left-0' : 'right-0'
                    }`}
                  >
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          i18n.changeLanguage(l.code)
                          setLangMenuOpen(false)
                          document.documentElement.dir = l.code === 'ar' ? 'rtl' : 'ltr'
                          document.documentElement.lang = l.code
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors text-start ${
                          l.code === i18n.language ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-neutral-700'
                        }`}
                      >
                        <span className="flex-1">{l.label}</span>
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

            {user ? (
              <div ref={userRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="relative w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute top-full mt-2 min-w-[220px] bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden ${
                        isRTL ? 'left-0' : 'right-0'
                      }`}
                    >
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <div className="text-sm font-semibold text-neutral-900 truncate">
                          {profile?.full_name || user.email}
                        </div>
                        <div className="text-xs text-neutral-500 truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/messages"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>
                            {i18n.language === 'fr' ? 'Messages'
                              : i18n.language === 'es' ? 'Mensajes'
                              : i18n.language === 'ar' ? 'الرسائل'
                              : 'Messages'}
                          </span>
                        </span>
                        {unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>
                          {i18n.language === 'fr' ? 'Modifier mon profil'
                            : i18n.language === 'es' ? 'Editar perfil'
                            : i18n.language === 'ar' ? 'تعديل الملف'
                            : 'Edit profile'}
                        </span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-start border-t border-neutral-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>
                          {i18n.language === 'fr' ? 'Déconnexion'
                            : i18n.language === 'es' ? 'Cerrar sesión'
                            : i18n.language === 'ar' ? 'تسجيل الخروج'
                            : 'Logout'}
                        </span>
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

            {user && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden btn-icon"
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
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`md:hidden fixed top-16 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl z-40 p-4 ${
                isRTL ? 'left-0' : 'right-0'
              }`}
            >
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === link.path || (link.path === '/messages' && location.pathname.startsWith('/messages'))
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{getLabel(link)}</span>
                    {link.badge > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {link.badge > 9 ? '9+' : link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}