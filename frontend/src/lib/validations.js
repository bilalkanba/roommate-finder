/**
 * Module central de validation
 *
 * Toute la logique de validation regex/format est centralisée ici pour :
 * - Réutilisation facile dans le form ET dans les tests QA
 * - Point unique de vérité (pas de regex éparpillés)
 * - Testabilité maximale (exportable, pure functions)
 *
 * Chaque validateur retourne :
 *   - true si valide
 *   - un message d'erreur (string) si invalide
 *
 * C'est le pattern attendu par react-hook-form (validate function).
 */

// ============================================================
// REGEX PATTERNS (exportés pour tests unitaires)
// ============================================================

/** Nom : lettres (accents + arabe), espaces, apostrophes, tirets. 2-100 chars */
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s'\-]{2,100}$/u

/** URL LinkedIn : https://linkedin.com/in/username ou /pub/username */
export const LINKEDIN_REGEX = /^https:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9\-_À-ÿ]{2,100}\/?$/

/** Instagram handle : @user avec lettres, chiffres, points, underscores */
export const INSTAGRAM_REGEX = /^@?[a-zA-Z0-9._]{1,30}$/

/** WhatsApp : format international +33612345678 (7-15 chiffres après +) */
export const WHATSAPP_REGEX = /^\+[1-9]\d{6,14}$/

/** Nom de ville custom : lettres, espaces, tirets, accents, apostrophes */
export const CUSTOM_CITY_REGEX = /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s\-']{2,60}$/u

/** Nom de pays : lettres uniquement, espaces, tirets */
export const COUNTRY_REGEX = /^[a-zA-ZÀ-ÿ\s\-]{2,60}$/

/** Nom de quartier */
export const DISTRICT_REGEX = /^[a-zA-ZÀ-ÿ0-9\u0600-\u06FF\s\-'\.]{2,100}$/u

/** Codes langues ISO : FR, EN, ES séparés par virgules */
export const LANGUAGES_REGEX = /^[A-Za-z]{2,3}(\s*,\s*[A-Za-z]{2,3})*$/

/** Entier positif strict (pas de -0, -1, 0, 1e5, décimales) */
export const POSITIVE_INTEGER_REGEX = /^[1-9]\d*$/

// ============================================================
// VALIDATORS (retourne true ou message d'erreur)
// ============================================================

/**
 * Nom complet
 * - 2-100 caractères
 * - Lettres uniquement (accents + arabe OK)
 * - Espaces, apostrophes, tirets autorisés
 * - Rejette : chiffres, emojis, symboles
 */
export function validateFullName(value) {
  if (!value || typeof value !== 'string') return 'Ton nom est requis'
  const trimmed = value.trim()
  if (trimmed.length < 2) return 'Minimum 2 caractères'
  if (trimmed.length > 100) return 'Maximum 100 caractères'
  if (!NAME_REGEX.test(trimmed)) {
    return 'Uniquement des lettres, espaces, tirets et apostrophes'
  }
  // Vérification anti-emoji explicite (double check)
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(trimmed)) {
    return 'Pas d\'emojis dans le nom'
  }
  return true
}

/**
 * Âge : entier entre 18 et 100
 * Rejette : -0, -1, 0, 17, 101, 999, décimales, notation scientifique
 */
export function validateAge(value) {
  if (value === '' || value === null || value === undefined) {
    return 'L\'âge est requis'
  }
  // Cast propre en number
  const num = Number(value)
  if (isNaN(num)) return 'Doit être un nombre'
  if (!Number.isInteger(num)) return 'Doit être un nombre entier'
  if (num < 18) return 'Tu dois avoir au moins 18 ans'
  if (num > 100) return 'Âge maximum : 100 ans'
  return true
}

/**
 * Budget en euros
 * Entre 100€ et 10000€
 */
export function validateBudget(value, fieldName = 'budget') {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} est requis`
  }
  const num = Number(value)
  if (isNaN(num)) return 'Doit être un nombre'
  if (!Number.isInteger(num)) return 'Doit être un nombre entier'
  if (num < 100) return 'Minimum 100€'
  if (num > 10000) return 'Maximum 10000€'
  return true
}

/**
 * Budget max doit être >= budget min
 */
export function validateBudgetMax(value, minValue) {
  const baseCheck = validateBudget(value, 'Budget max')
  if (baseCheck !== true) return baseCheck
  const num = Number(value)
  const minNum = Number(minValue)
  if (num < minNum) return 'Max doit être supérieur ou égal au min'
  return true
}

/**
 * Durée en mois : entre 1 et 60
 * Rejette : 0, -1, 61, 999, décimales
 */
export function validateLeaseDuration(value) {
  if (value === '' || value === null || value === undefined) {
    return 'La durée est requise'
  }
  const num = Number(value)
  if (isNaN(num)) return 'Doit être un nombre'
  if (!Number.isInteger(num)) return 'Doit être un nombre entier'
  if (num < 1) return 'Minimum 1 mois'
  if (num > 60) return 'Maximum 60 mois (5 ans)'
  return true
}

/**
 * Date d'emménagement : aujourd'hui ou futur, max 2 ans dans le futur
 */
export function validateMoveInDate(value) {
  if (!value) return 'Date requise'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Date invalide'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 2)

  if (date < today) return 'La date ne peut pas être dans le passé'
  if (date > maxDate) return 'Date trop lointaine (max 2 ans)'
  return true
}

/**
 * URL LinkedIn (optionnel mais si présent doit matcher)
 */
export function validateLinkedIn(value) {
  if (!value || value.trim() === '') return true // optionnel
  const trimmed = value.trim()
  if (trimmed.length > 200) return 'URL trop longue'
  if (!LINKEDIN_REGEX.test(trimmed)) {
    return 'Format attendu : https://linkedin.com/in/ton-profil'
  }
  return true
}

/**
 * Handle Instagram (optionnel)
 */
export function validateInstagram(value) {
  if (!value || value.trim() === '') return true // optionnel
  const trimmed = value.trim()
  if (trimmed.length > 31) return 'Maximum 30 caractères'
  if (!INSTAGRAM_REGEX.test(trimmed)) {
    return 'Lettres, chiffres, points et underscores uniquement'
  }
  return true
}

/**
 * Numéro WhatsApp (optionnel)
 * Format international : +XXXXXXXXXXX (7-15 chiffres après le +)
 */
export function validateWhatsApp(value) {
  if (!value || value.trim() === '') return true // optionnel
  const trimmed = value.trim().replace(/\s|-/g, '') // nettoie espaces/tirets
  if (!WHATSAPP_REGEX.test(trimmed)) {
    return 'Format attendu : +33612345678 (avec code pays)'
  }
  return true
}

/**
 * Bio (optionnel, max 1000 chars)
 */
export function validateBio(value) {
  if (!value || value.trim() === '') return true
  if (value.length > 1000) return 'Maximum 1000 caractères'
  return true
}

/**
 * Ville custom (quand l'utilisateur ajoute une ville pas dans la liste)
 */
export function validateCustomCity(value) {
  if (!value || value.trim() === '') return 'Nom de ville requis'
  const trimmed = value.trim()
  if (trimmed.length < 2) return 'Minimum 2 caractères'
  if (trimmed.length > 60) return 'Maximum 60 caractères'
  if (!CUSTOM_CITY_REGEX.test(trimmed)) {
    return 'Uniquement des lettres, espaces, tirets et apostrophes'
  }
  return true
}

/**
 * Langues parlées : format "FR, EN, ES"
 */
export function validateLanguages(value) {
  if (!value || value.trim() === '') return true // optionnel
  if (!LANGUAGES_REGEX.test(value)) {
    return 'Format attendu : FR, EN, ES (codes ISO séparés par virgules)'
  }
  const codes = value.split(',').map(c => c.trim())
  if (codes.length > 10) return 'Maximum 10 langues'
  return true
}

/**
 * Age min <= Age max pour les préférences de coloc
 */
export function validateAgeRange(min, max) {
  if (min == null && max == null) return true
  if (min != null && max != null) {
    const minNum = Number(min)
    const maxNum = Number(max)
    if (minNum > maxNum) return 'L\'âge minimum doit être inférieur au maximum'
  }
  return true
}

// ============================================================
// UTILITY : Prevent negative/scientific input in number fields
// ============================================================

/**
 * Handler à mettre sur onKeyDown des inputs number pour bloquer :
 * - Le signe moins (-)
 * - Le signe plus (+)
 * - Le "e" (notation scientifique)
 * - Le point (.)
 * - La virgule (,)
 *
 * Usage : <input type="number" onKeyDown={preventInvalidNumberChars} />
 */
export function preventInvalidNumberChars(e) {
  const invalidChars = ['-', '+', 'e', 'E', '.', ',']
  if (invalidChars.includes(e.key)) {
    e.preventDefault()
  }
}

/**
 * Empêche le paste de valeurs contenant des caractères invalides
 * Usage : <input type="number" onPaste={preventInvalidNumberPaste} />
 */
export function preventInvalidNumberPaste(e) {
  const pastedText = e.clipboardData.getData('text')
  if (!/^\d+$/.test(pastedText)) {
    e.preventDefault()
  }
}

// ============================================================
// HELPER : Get today ISO string for date input min attr
// ============================================================

export function getTodayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

export function getMaxMoveInDateISO() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 2)
  return d.toISOString().split('T')[0]
}