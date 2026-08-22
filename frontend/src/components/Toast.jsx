/**
 * Toast — Système de notifications premium.
 *
 * Remplace les alert() par des toasts élégants avec :
 * - Auto-dismiss après 4s (configurable)
 * - Types : success, error, info, warning
 * - Animation slide + spring
 * - Stack multi-toasts
 * - Portal-rendered en bas droite (desktop) ou haut (mobile)
 *
 * Usage :
 *   import { useToast } from '@/components/Toast'
 *   const toast = useToast()
 *   toast.success('Profil sauvegardé !')
 *   toast.error('Erreur réseau')
 *   toast.info('Message envoyé')
 *
 * Setup : wrap ton App dans <ToastProvider>
 */

import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

const TOAST_STYLES = {
  success: 'bg-white border-emerald-200 shadow-emerald-100',
  error: 'bg-white border-red-200 shadow-red-100',
  warning: 'bg-white border-amber-200 shadow-amber-100',
  info: 'bg-white border-blue-200 shadow-blue-100',
}

const TOAST_ACCENT = {
  success: 'from-emerald-400 to-teal-500',
  error: 'from-red-400 to-rose-500',
  warning: 'from-amber-400 to-orange-500',
  info: 'from-blue-400 to-indigo-500',
}

// ============================================================
// Provider
// ============================================================

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const add = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, duration }])

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }, [remove])

  const api = {
    success: (msg, dur) => add(msg, 'success', dur),
    error: (msg, dur) => add(msg, 'error', dur),
    warning: (msg, dur) => add(msg, 'warning', dur),
    info: (msg, dur) => add(msg, 'info', dur),
    remove,
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <ToastContainer toasts={toasts} onDismiss={remove} />,
        document.body
      )}
    </ToastContext.Provider>
  )
}

// ============================================================
// Hook
// ============================================================

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback safe si pas wrap dans provider
    return {
      success: console.log,
      error: console.error,
      warning: console.warn,
      info: console.info,
      remove: () => {},
    }
  }
  return ctx
}

// ============================================================
// Container + Toast components
// ============================================================

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed z-[9999] pointer-events-none bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 max-w-md">
      <div className="space-y-2 flex flex-col items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => onDismiss(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`pointer-events-auto flex items-start gap-3 pl-2 pr-4 py-3 rounded-xl border shadow-lg w-full max-w-sm ${TOAST_STYLES[toast.type]}`}
    >
      {/* Accent bar */}
      <div className={`w-1 self-stretch rounded-full bg-gradient-to-b ${TOAST_ACCENT[toast.type]}`} />

      <div className="text-lg pt-0.5">{TOAST_ICONS[toast.type]}</div>

      <div className="flex-1 text-sm text-neutral-800 leading-relaxed py-0.5">
        {toast.message}
      </div>

      <button
        onClick={onDismiss}
        className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}