import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Ne pas afficher la navbar sur la page login (design split-screen)
  if (location.pathname === '/login') return null

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-neutral-200/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">R</div>
          <span className="font-semibold text-neutral-900 text-sm">Roommate Finder AI</span>
        </Link>

        <div className="flex items-center gap-1">
          {user && (
            <>
              <Link
                to="/matches"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive('/matches')
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Matches
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Mon profil
              </Link>
              <div className="w-px h-5 bg-neutral-200 mx-2"><LanguageSwitcher /></div>
              <button onClick={handleSignOut} className="btn-ghost text-sm">
                Déconnexion
              </button>
            </>
          )}
          {!user && (
            <Link to="/login" className="btn-primary text-sm">
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}