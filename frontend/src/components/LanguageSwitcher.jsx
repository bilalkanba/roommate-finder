/**
 * LanguageSwitcher : dropdown pour changer de langue.
 *
 * Supporte FR / EN / ES / AR (avec RTL automatique pour l'arabe).
 * Stocké dans localStorage et synchronisé avec <html lang dir>.
 */

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '@/i18n'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectLang = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
        aria-label="Changer de langue"
      >
        <span>{currentLang.flag}</span>
        <span className="uppercase text-xs font-semibold">{currentLang.code}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1 w-44 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden animate-fade-in z-50">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => selectLang(lang.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                lang.code === i18n.language
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1 text-start">{lang.label}</span>
              {lang.code === i18n.language && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}