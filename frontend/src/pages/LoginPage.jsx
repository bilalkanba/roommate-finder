/**
 * LoginPage v2 — Fixes:
 * - Validation client-side stricte du mot de passe AVANT envoi
 * - Validation format email
 * - Après signup réussi → auto-redirect vers /profile
 * - Après login réussi → redirect vers /
 * - Password strength indicators live
 * - Toggle show/hide password
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

function checkPasswordStrength(password) {
  if (!password) return { ok: false, reason: 'empty' }
  if (password.length < 8) return { ok: false, reason: 'too_short' }
  if (!/[A-Z]/.test(password)) return { ok: false, reason: 'no_uppercase' }
  if (!/[a-z]/.test(password)) return { ok: false, reason: 'no_lowercase' }
  if (!/[0-9]/.test(password)) return { ok: false, reason: 'no_digit' }
  return { ok: true }
}

function getPasswordError(check, lang) {
  const messages = {
    empty: { fr: 'Mot de passe requis', en: 'Password required', es: 'Contraseña requerida', ar: 'كلمة السر مطلوبة' },
    too_short: { fr: 'Au moins 8 caractères', en: 'At least 8 characters', es: 'Al menos 8 caracteres', ar: '8 أحرف على الأقل' },
    no_uppercase: { fr: 'Au moins une majuscule', en: 'At least one uppercase letter', es: 'Al menos una mayúscula', ar: 'حرف كبير واحد على الأقل' },
    no_lowercase: { fr: 'Au moins une minuscule', en: 'At least one lowercase letter', es: 'Al menos una minúscula', ar: 'حرف صغير واحد على الأقل' },
    no_digit: { fr: 'Au moins un chiffre', en: 'At least one digit', es: 'Al menos un dígito', ar: 'رقم واحد على الأقل' },
  }
  return messages[check.reason]?.[lang] || messages[check.reason]?.en || ''
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const switchMode = (newMode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!EMAIL_REGEX.test(email)) {
      setError(
        lang === 'fr' ? 'Email invalide' :
        lang === 'es' ? 'Email inválido' :
        lang === 'ar' ? 'بريد إلكتروني غير صالح' :
        'Invalid email'
      )
      return
    }

    if (mode === 'signup') {
      const check = checkPasswordStrength(password)
      if (!check.ok) {
        setError(getPasswordError(check, lang))
        return
      }
    } else {
      if (!password || password.length < 6) {
        setError(
          lang === 'fr' ? 'Mot de passe requis' :
          lang === 'es' ? 'Contraseña requerida' :
          lang === 'ar' ? 'كلمة السر مطلوبة' :
          'Password required'
        )
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: sbError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (sbError) {
          console.error('[Signup error]', sbError)
          let msg = sbError.message
          if (sbError.message?.toLowerCase().includes('password')) {
            msg = lang === 'fr' ? 'Mot de passe trop faible (8+ car., majuscule, minuscule, chiffre)'
              : lang === 'es' ? 'Contraseña muy débil (8+ car., mayúscula, minúscula, dígito)'
              : lang === 'ar' ? 'كلمة السر ضعيفة جدا'
              : 'Password too weak (8+ char., uppercase, lowercase, digit)'
          } else if (sbError.message?.toLowerCase().includes('already registered')) {
            msg = lang === 'fr' ? 'Cet email est déjà utilisé'
              : lang === 'es' ? 'Este email ya está en uso'
              : lang === 'ar' ? 'هذا البريد مستخدم بالفعل'
              : 'This email is already registered'
          } else if (sbError.message?.toLowerCase().includes('invalid email')) {
            msg = lang === 'fr' ? 'Format email invalide'
              : lang === 'es' ? 'Formato de email inválido'
              : lang === 'ar' ? 'صيغة البريد غير صحيحة'
              : 'Invalid email format'
          }
          setError(msg)
          setLoading(false)
          return
        }

        if (data?.user && data?.session) {
          setSuccess(
            lang === 'fr' ? 'Compte créé ! Redirection...' :
            lang === 'es' ? '¡Cuenta creada! Redirigiendo...' :
            lang === 'ar' ? 'تم إنشاء الحساب!' :
            'Account created! Redirecting...'
          )
          setTimeout(() => navigate('/profile'), 800)
        } else if (data?.user && !data?.session) {
          setSuccess(
            lang === 'fr' ? 'Compte créé ! Vérifie ton email.' :
            lang === 'es' ? 'Cuenta creada. Verifica tu email.' :
            lang === 'ar' ? 'تم إنشاء الحساب. تحقق من بريدك.' :
            'Account created! Check your email.'
          )
          setLoading(false)
        } else {
          setError('Unexpected response from server')
          setLoading(false)
        }
      } else {
        const { data, error: sbError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (sbError) {
          console.error('[Login error]', sbError)
          let msg = sbError.message
          if (sbError.message?.toLowerCase().includes('invalid login')) {
            msg = lang === 'fr' ? 'Email ou mot de passe incorrect'
              : lang === 'es' ? 'Email o contraseña incorrectos'
              : lang === 'ar' ? 'البريد الإلكتروني أو كلمة السر غير صحيحة'
              : 'Invalid email or password'
          }
          setError(msg)
          setLoading(false)
          return
        }

        if (data?.session) {
          setSuccess(
            lang === 'fr' ? 'Connexion réussie !' :
            lang === 'es' ? '¡Sesión iniciada!' :
            lang === 'ar' ? 'تم تسجيل الدخول!' :
            'Login successful!'
          )
          setTimeout(() => navigate('/'), 500)
        }
      }
    } catch (err) {
      console.error('[Auth error]', err)
      setError(err.message || 'Unknown error')
      setLoading(false)
    }
  }

  const t = {
    signup: {
      title_fr: 'Créer un compte', title_en: 'Create account', title_es: 'Crear cuenta', title_ar: 'إنشاء حساب',
      cta_fr: 'S\'inscrire', cta_en: 'Sign up', cta_es: 'Registrarse', cta_ar: 'التسجيل',
      switch_fr: 'Déjà un compte ? Se connecter', switch_en: 'Already have an account? Login',
      switch_es: '¿Ya tienes cuenta? Iniciar sesión', switch_ar: 'لديك حساب؟ تسجيل الدخول',
    },
    login: {
      title_fr: 'Connexion', title_en: 'Login', title_es: 'Iniciar sesión', title_ar: 'تسجيل الدخول',
      cta_fr: 'Se connecter', cta_en: 'Login', cta_es: 'Entrar', cta_ar: 'دخول',
      switch_fr: 'Pas de compte ? S\'inscrire', switch_en: 'No account? Sign up',
      switch_es: '¿Sin cuenta? Registrarse', switch_ar: 'ليس لديك حساب؟ سجل',
    },
    email_fr: 'Email', email_en: 'Email', email_es: 'Email', email_ar: 'البريد الإلكتروني',
    password_fr: 'Mot de passe', password_en: 'Password', password_es: 'Contraseña', password_ar: 'كلمة السر',
  }

  const config = t[mode]
  const title = config[`title_${lang}`] || config.title_en
  const cta = config[`cta_${lang}`] || config.cta_en
  const switchLabel = config[`switch_${lang}`] || config.switch_en

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl shadow-lg">
              🏡
            </div>
          </div>
          <h1 className="text-3xl font-serif-display leading-tight">{title}</h1>
          <p className="text-sm text-neutral-500 mt-2">Roommate Finder AI</p>
        </div>

        <div className="card-premium">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label">{t[`email_${lang}`] || t.email_en}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-lg"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="label">{t[`password_${lang}`] || t.password_en}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-lg pr-10"
                  placeholder="••••••••"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  minLength={mode === 'signup' ? 8 : 6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {mode === 'signup' && password && (
                <div className="mt-2 space-y-1">
                  <PasswordCheck ok={password.length >= 8}
                    label={lang === 'fr' ? '8+ caractères' : lang === 'es' ? '8+ caracteres' : lang === 'ar' ? '8+ أحرف' : '8+ characters'} />
                  <PasswordCheck ok={/[A-Z]/.test(password)}
                    label={lang === 'fr' ? 'Une majuscule' : lang === 'es' ? 'Una mayúscula' : lang === 'ar' ? 'حرف كبير' : 'One uppercase'} />
                  <PasswordCheck ok={/[a-z]/.test(password)}
                    label={lang === 'fr' ? 'Une minuscule' : lang === 'es' ? 'Una minúscula' : lang === 'ar' ? 'حرف صغير' : 'One lowercase'} />
                  <PasswordCheck ok={/[0-9]/.test(password)}
                    label={lang === 'fr' ? 'Un chiffre' : lang === 'es' ? 'Un dígito' : lang === 'ar' ? 'رقم' : 'One digit'} />
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-start gap-2">
                <span className="shrink-0">✓</span>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-primary-premium w-full disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-transform"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{lang === 'fr' ? 'Chargement...' : lang === 'es' ? 'Cargando...' : lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                </span>
              ) : cta}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors font-medium"
          >
            {switchLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function PasswordCheck({ ok, label }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${ok ? 'text-emerald-600' : 'text-neutral-400'}`}>
      <span>{ok ? '✓' : '○'}</span>
      <span>{label}</span>
    </div>
  )
}