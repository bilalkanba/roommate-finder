import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import MatchesPage from '@/pages/MatchesPage'
import ProfileFormPage from '@/pages/ProfileFormPage'
import Navbar from '@/components/Navbar'
import DesignShowcase from './pages/DesignShowcase'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import MessagesPage from './pages/MessagesPage'
import ConversationPage from './pages/ConversationPage'
import {
  PageTransition,
  ScrollToTop,
  CommandPalette,
} from '@/components/UIExtras'

function RequireAuth({ children, authStatus }) {
  if (authStatus === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Vérification de la session...</div>
      </div>
    )
  }
  if (authStatus === false) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  const [authStatus, setAuthStatus] = useState(null)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setAuthStatus(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_IN') setAuthStatus(true)
      if (event === 'SIGNED_OUT') setAuthStatus(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageTransition>
        <Routes>
          {/* Public pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/design-showcase" element={<DesignShowcase />} />

          {/* Protected pages */}
          <Route
            path="/"
            element={
              <RequireAuth authStatus={authStatus}>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/home"
            element={
              <RequireAuth authStatus={authStatus}>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/matches"
            element={
              <RequireAuth authStatus={authStatus}>
                <MatchesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={
              <RequireAuth authStatus={authStatus}>
                <SearchPage />
              </RequireAuth>
            }
          />
          <Route
            path="/messages"
            element={
              <RequireAuth authStatus={authStatus}>
                <MessagesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <RequireAuth authStatus={authStatus}>
                <ConversationPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth authStatus={authStatus}>
                <ProfileFormPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <RequireAuth authStatus={authStatus}>
                <ProfilePage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>

      <ScrollToTop />
      <CommandPalette />
    </div>
  )
}