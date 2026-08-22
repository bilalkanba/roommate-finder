/**
 * ProfileFormPage v6 — Bugs fixed edition
 *
 * FIXES CRITIQUES :
 * ✅ Bug auto-submit : preventDefault sur Enter + noValidate + submit uniquement au dernier step
 * ✅ Regex STRICTS partout via validations.js
 * ✅ preventInvalidNumberChars sur tous les inputs number
 * ✅ Min/max HTML5 + validation JS double sécurité
 * ✅ Date d'emménagement : min=today, max=today+2ans
 * ✅ Bio, looking_for, dealbreakers avec compteurs
 * ✅ Meilleurs feedback erreurs
 */

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { profilesApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import CityAutocomplete from '@/components/CityAutocomplete'
import PhotoUpload from '@/components/PhotoUpload'
import { HOBBIES } from '@/lib/hobbies'
import {
  validateFullName, validateAge, validateBudget, validateBudgetMax,
  validateLeaseDuration, validateMoveInDate, validateLinkedIn,
  validateInstagram, validateBio, validateLanguages, validateAgeRange,
  preventInvalidNumberChars, preventInvalidNumberPaste,
  getTodayISO, getMaxMoveInDateISO,
} from '@/lib/validations'

// ===== Options pills =====
const LIFESTYLE_OPTIONS = [
  { value: 'very_low', emoji: '😴' },
  { value: 'low', emoji: '🙂' },
  { value: 'medium', emoji: '⚖️' },
  { value: 'high', emoji: '💪' },
  { value: 'very_high', emoji: '🔥' },
]
const SLEEP_OPTIONS = [
  { value: 'early_bird', emoji: '🌅' },
  { value: 'normal', emoji: '🌙' },
  { value: 'night_owl', emoji: '🦉' },
  { value: 'irregular', emoji: '🔄' },
]
const SOCIAL_OPTIONS = [
  { value: 'very_private', emoji: '🤫' },
  { value: 'balanced', emoji: '😊' },
  { value: 'very_social', emoji: '🎉' },
]
const SMOKING_OPTIONS = [
  { value: 'no_smoking', emoji: '🚫' },
  { value: 'ok_outside', emoji: '🌿' },
  { value: 'indoor_ok', emoji: '🚬' },
]
const PETS_OPTIONS = [
  { value: 'no_pets', emoji: '🚫' },
  { value: 'has_pet', emoji: '🐕' },
  { value: 'ok_with_pets', emoji: '😊' },
]
const PREFERRED_GENDER_OPTIONS = [
  { value: 'male', emoji: '👨', label: 'Homme' },
  { value: 'female', emoji: '👩', label: 'Femme' },
  { value: 'any', emoji: '🌀', label: 'Peu importe' },
]
const HOUSING_TYPE_OPTIONS = [
  { value: 'entire_apartment', emoji: '🏠', label: 'Appart entier' },
  { value: 'private_room', emoji: '🚪', label: 'Chambre privée' },
  { value: 'shared_room', emoji: '👥', label: 'Chambre partagée' },
  { value: 'studio', emoji: '🏢', label: 'Studio' },
  { value: 'any', emoji: '🔁', label: 'Peu importe' },
]
const MAX_ROOMMATES_OPTIONS = [
  { value: 'one', emoji: '2️⃣', label: '+1 coloc' },
  { value: 'two', emoji: '3️⃣', label: '+2 colocs' },
  { value: 'three_plus', emoji: '4️⃣', label: '3 colocs ou +' },
  { value: 'any', emoji: '🔁', label: 'Peu importe' },
]
const WORK_TYPE_OPTIONS = [
  { value: 'student', emoji: '🎓', label: 'Étudiant' },
  { value: 'freelancer', emoji: '💼', label: 'Freelance' },
  { value: 'full_time_onsite', emoji: '🏢', label: 'CDI sur site' },
  { value: 'full_time_remote', emoji: '🏡', label: 'Full remote' },
  { value: 'part_time', emoji: '⏰', label: 'Temps partiel' },
  { value: 'unemployed', emoji: '🔍', label: 'En recherche' },
  { value: 'other', emoji: '❓', label: 'Autre' },
]
const HOME_PRESENCE_OPTIONS = [
  { value: 'mostly_home', emoji: '🏠', label: 'Souvent à la maison' },
  { value: 'evenings_only', emoji: '🌙', label: 'Surtout le soir' },
  { value: 'weekends_only', emoji: '📅', label: 'Surtout le week-end' },
  { value: 'rarely_home', emoji: '✈️', label: 'Rarement à la maison' },
]
const DIET_OPTIONS = [
  { value: 'omnivore', emoji: '🍖', label: 'Omnivore' },
  { value: 'vegetarian', emoji: '🥗', label: 'Végétarien' },
  { value: 'vegan', emoji: '🌱', label: 'Végan' },
  { value: 'halal', emoji: '☪️', label: 'Halal' },
  { value: 'kosher', emoji: '✡️', label: 'Kasher' },
  { value: 'other', emoji: '🍽️', label: 'Autre' },
]

export default function ProfileFormPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('create')
  const [step, setStep] = useState(0)
  const [userId, setUserId] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const {
    register, handleSubmit, reset, watch, setValue, control, trigger, getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      full_name: '', age: 22, gender: 'male', occupation: '', bio: '',
      avatar_url: null, work_type: '', home_presence: '', diet: '',
      target_city: '', target_country: '', district: '',
      budget_min_eur: 400, budget_max_eur: 700,
      move_in_date: new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0],
      lease_duration_months: 12, languages_spoken: 'FR,EN',
      housing_type: 'any',
      cleanliness: 'medium', sleep_schedule: 'normal', social_level: 'balanced',
      noise_tolerance: 'medium', smoking: 'no_smoking', pets: 'no_pets',
      guests_frequency: 'medium',
      preferred_gender: 'any',
      preferred_age_min: '', preferred_age_max: '',
      max_roommates: '',
      hobbies: [], looking_for: '', dealbreakers: '',
      linkedin_url: '', instagram_handle: '',
    },
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id))
  }, [])

  useEffect(() => {
    let mounted = true
    profilesApi.getMine()
      .then((p) => {
        if (!mounted) return
        reset({
          ...p,
          languages_spoken: (p.languages_spoken || []).join(','),
          district: p.district || '',
          avatar_url: p.avatar_url || null,
          work_type: p.work_type || '',
          home_presence: p.home_presence || '',
          diet: p.diet || '',
          max_roommates: p.max_roommates || '',
          hobbies: p.hobbies || [],
          looking_for: p.looking_for || '',
          dealbreakers: p.dealbreakers || '',
          linkedin_url: p.linkedin_url || '',
          instagram_handle: p.instagram_handle || '',
          preferred_age_min: p.preferred_age_min || '',
          preferred_age_max: p.preferred_age_max || '',
        })
        setMode('edit'); setLoading(false)
      })
      .catch(() => { if (mounted) { setMode('create'); setLoading(false) } })
    return () => { mounted = false }
  }, [reset])

  const STEPS = [
    t('profile.step_you', 'Toi'),
    t('profile.step_housing', 'Logement'),
    t('profile.step_lifestyle', 'Style de vie'),
    'Préférences',
  ]

  const isLastStep = step === STEPS.length - 1

  const nextStep = async () => {
    // Champs à valider par step
    const fieldsByStep = [
      ['full_name', 'age', 'gender'],
      ['target_city', 'target_country', 'budget_min_eur', 'budget_max_eur', 'move_in_date', 'lease_duration_months', 'languages_spoken'],
      ['cleanliness', 'sleep_schedule', 'social_level', 'noise_tolerance', 'smoking', 'pets', 'guests_frequency'],
      ['preferred_age_min', 'preferred_age_max', 'linkedin_url', 'instagram_handle'],
    ]
    const isValid = await trigger(fieldsByStep[step])
    if (isValid) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const previousStep = () => {
    if (step > 0) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // FIX BUG AUTO-SUBMIT :
  // Empêche le submit si l'utilisateur presse Entrée dans un input.
  // Le vrai submit se fait UNIQUEMENT via le bouton final "Créer mon profil".
  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault()
      if (!isLastStep) {
        nextStep()
      }
    }
  }

  const onSubmit = async (data) => {
    setSubmitError(null)

    // Double sécurité : ne submit QUE si on est au dernier step
    if (!isLastStep) {
      console.warn('Submit bloqué : pas au dernier step')
      return
    }

    try {
      const payload = {
        ...data,
        languages_spoken: data.languages_spoken
          .split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
        age: Number(data.age),
        budget_min_eur: Number(data.budget_min_eur),
        budget_max_eur: Number(data.budget_max_eur),
        lease_duration_months: Number(data.lease_duration_months),
        district: data.district || null,
        avatar_url: data.avatar_url || null,
        occupation: data.occupation || null,
        bio: data.bio || null,
        work_type: data.work_type || null,
        home_presence: data.home_presence || null,
        diet: data.diet || null,
        max_roommates: data.max_roommates || null,
        hobbies: data.hobbies || [],
        looking_for: data.looking_for || null,
        dealbreakers: data.dealbreakers || null,
        linkedin_url: data.linkedin_url || null,
        instagram_handle: data.instagram_handle || null,
        preferred_age_min: data.preferred_age_min ? Number(data.preferred_age_min) : null,
        preferred_age_max: data.preferred_age_max ? Number(data.preferred_age_max) : null,
      }

      if (mode === 'create') await profilesApi.create(payload)
      else await profilesApi.updateMine(payload)
      navigate('/matches')
    } catch (err) {
      const detail = err.response?.data?.detail
      setSubmitError(
        typeof detail === 'string' ? detail :
        Array.isArray(detail) ? detail.map(e => `${e.loc?.slice(-1).join('')}: ${e.msg}`).join(' · ') :
        err.message
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          {mode === 'create' ? 'Crée ton profil' : 'Modifie ton profil'}
        </h1>
        <p className="text-neutral-600">
          Plus ton profil est complet, plus tes matches sont précis.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-neutral-900' : 'text-neutral-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (i + 1)}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-emerald-500' : 'bg-neutral-200'}`}></div>}
            </div>
          ))}
        </div>
      </div>

      {/*
        FIX AUTO-SUBMIT : noValidate + onKeyDown pour bloquer Enter
        Le form ne submit QUE via le bouton final au dernier step
      */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleFormKeyDown}
        noValidate
        className="animate-fade-in space-y-6"
      >
        {/* ============ STEP 0 : Toi ============ */}
        {step === 0 && (
          <>
            <div className="card">
              <label className="label">Photo de profil</label>
              <p className="text-xs text-neutral-500 mb-4">Optionnelle. Aide les autres à te faire confiance.</p>
              {userId && (
                <Controller name="avatar_url" control={control}
                  render={({ field }) => (
                    <PhotoUpload
                      currentUrl={field.value}
                      onUploaded={field.onChange}
                      userId={userId}
                      fullName={watch('full_name')}
                    />
                  )}
                />
              )}
            </div>

            <div className="card space-y-5">
              <h2 className="section-title">À propos de toi</h2>

              <div>
                <label className="label">Nom complet *</label>
                <input
                  {...register('full_name', { validate: validateFullName })}
                  className={`input-lg ${errors.full_name ? 'border-red-300' : ''}`}
                  placeholder="Prénom Nom"
                  autoComplete="name"
                  maxLength={100}
                />
                {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Âge *</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    step="1"
                    inputMode="numeric"
                    onKeyDown={preventInvalidNumberChars}
                    onPaste={preventInvalidNumberPaste}
                    {...register('age', {
                      valueAsNumber: true,
                      validate: validateAge,
                    })}
                    className={`input-lg ${errors.age ? 'border-red-300' : ''}`}
                  />
                  {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age.message}</p>}
                </div>
                <div>
                  <label className="label">Genre *</label>
                  <select {...register('gender', { required: true })} className="input-lg">
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="non_binary">Non-binaire</option>
                    <option value="prefer_not_to_say">Préfère ne pas dire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  Occupation <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <input
                  {...register('occupation', { maxLength: 100 })}
                  className="input-lg"
                  placeholder="Étudiant en informatique, Designer..."
                  maxLength={100}
                />
              </div>

              <div>
                <label className="label">
                  Présente-toi <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  {...register('bio', { validate: validateBio })}
                  className="input-lg min-h-[100px]"
                  maxLength={1000}
                  placeholder="Quelques mots sur toi, ta personnalité, ce que tu aimes faire..."
                />
                <p className="text-xs text-neutral-400 mt-1 text-right">
                  {watch('bio')?.length || 0} / 1000
                </p>
                {errors.bio && <p className="text-xs text-red-600 mt-1">{errors.bio.message}</p>}
              </div>
            </div>

            <div className="card space-y-5">
              <h2 className="section-title">Ton quotidien</h2>
              <p className="text-xs text-neutral-500 -mt-3">Optionnel, aide l'algorithme à mieux te comprendre.</p>

              <PillSelect label="Situation pro" name="work_type" options={WORK_TYPE_OPTIONS}
                watch={watch} setValue={setValue} allowEmpty />
              <PillSelect label="Présence à la maison" name="home_presence" options={HOME_PRESENCE_OPTIONS}
                watch={watch} setValue={setValue} allowEmpty />
              <PillSelect label="Régime alimentaire" name="diet" options={DIET_OPTIONS}
                watch={watch} setValue={setValue} allowEmpty />
            </div>
          </>
        )}

        {/* ============ STEP 1 : Logement ============ */}
        {step === 1 && (
          <div className="card space-y-5">
            <div>
              <label className="label">Ville *</label>
              <Controller name="target_city" control={control}
                rules={{ required: 'Choisis une ville dans la liste' }}
                render={({ field }) => (
                  <CityAutocomplete
                    value={{ city: field.value, country: watch('target_country') }}
                    onChange={({ city, country }) => {
                      field.onChange(city)
                      setValue('target_country', country, { shouldValidate: true })
                    }}
                    placeholder="Rechercher ta ville..."
                    error={!!errors.target_city}
                  />
                )}
              />
              {errors.target_city && <p className="text-xs text-red-600 mt-1">{errors.target_city.message}</p>}
              <input type="hidden" {...register('target_country', { required: 'Pays requis' })} />
            </div>

            <div>
              <label className="label">
                Quartier <span className="text-neutral-400 font-normal">(optionnel)</span>
              </label>
              <input
                {...register('district', { maxLength: 100 })}
                className="input-lg"
                placeholder="Malasaña, Le Marais..."
                maxLength={100}
              />
            </div>

            <PillSelect label="Type de logement recherché *" name="housing_type" options={HOUSING_TYPE_OPTIONS}
              watch={watch} setValue={setValue} />

            <div>
              <label className="label">Budget mensuel (€) *</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Min</span>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="10"
                    inputMode="numeric"
                    onKeyDown={preventInvalidNumberChars}
                    onPaste={preventInvalidNumberPaste}
                    {...register('budget_min_eur', {
                      valueAsNumber: true,
                      validate: (v) => validateBudget(v, 'Budget min'),
                    })}
                    className="input-lg pl-14"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Max</span>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="10"
                    inputMode="numeric"
                    onKeyDown={preventInvalidNumberChars}
                    onPaste={preventInvalidNumberPaste}
                    {...register('budget_max_eur', {
                      valueAsNumber: true,
                      validate: (v) => validateBudgetMax(v, getValues('budget_min_eur')),
                    })}
                    className="input-lg pl-14"
                  />
                </div>
              </div>
              {(errors.budget_min_eur || errors.budget_max_eur) && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.budget_max_eur?.message || errors.budget_min_eur?.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Emménagement *</label>
                <input
                  type="date"
                  min={getTodayISO()}
                  max={getMaxMoveInDateISO()}
                  {...register('move_in_date', { validate: validateMoveInDate })}
                  className="input-lg"
                />
                {errors.move_in_date && <p className="text-xs text-red-600 mt-1">{errors.move_in_date.message}</p>}
              </div>
              <div>
                <label className="label">Durée (mois) *</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  inputMode="numeric"
                  onKeyDown={preventInvalidNumberChars}
                  onPaste={preventInvalidNumberPaste}
                  {...register('lease_duration_months', {
                    valueAsNumber: true,
                    validate: validateLeaseDuration,
                  })}
                  className="input-lg"
                />
                {errors.lease_duration_months && <p className="text-xs text-red-600 mt-1">{errors.lease_duration_months.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Langues parlées</label>
              <input
                {...register('languages_spoken', { validate: validateLanguages })}
                className="input-lg"
                placeholder="FR, EN, ES"
                maxLength={50}
              />
              <p className="text-xs text-neutral-500 mt-1">Codes ISO séparés par virgules</p>
              {errors.languages_spoken && <p className="text-xs text-red-600 mt-1">{errors.languages_spoken.message}</p>}
            </div>
          </div>
        )}

        {/* ============ STEP 2 : Style de vie ============ */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 mb-2">
              Les 7 dimensions clés pour l'algorithme de matching.
            </p>
            <PillSelect label="Propreté *" name="cleanliness" options={LIFESTYLE_OPTIONS} watch={watch} setValue={setValue} />
            <PillSelect label="Horaires de sommeil *" name="sleep_schedule" options={SLEEP_OPTIONS} watch={watch} setValue={setValue} />
            <PillSelect label="Sociabilité *" name="social_level" options={SOCIAL_OPTIONS} watch={watch} setValue={setValue} />
            <PillSelect label="Tolérance au bruit *" name="noise_tolerance" options={LIFESTYLE_OPTIONS} watch={watch} setValue={setValue} />
            <PillSelect label="Fumeur *" name="smoking" options={SMOKING_OPTIONS} watch={watch} setValue={setValue} />
            <PillSelect label="Animaux *" name="pets" options={PETS_OPTIONS} watch={watch} setValue={setValue} />
            <PillSelect label="Fréquence des invités *" name="guests_frequency" options={LIFESTYLE_OPTIONS} watch={watch} setValue={setValue} />
          </div>
        )}

        {/* ============ STEP 3 : Préférences ============ */}
        {step === 3 && (
          <>
            <div className="card space-y-5">
              <h2 className="section-title">Ton coloc idéal</h2>
              <p className="text-xs text-neutral-500 -mt-3">Ces préférences influencent directement les matches.</p>

              <PillSelect label="Genre préféré du coloc *" name="preferred_gender"
                options={PREFERRED_GENDER_OPTIONS} watch={watch} setValue={setValue} />

              <div>
                <label className="label">
                  Tranche d'âge préférée <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Min</span>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      step="1"
                      inputMode="numeric"
                      onKeyDown={preventInvalidNumberChars}
                      onPaste={preventInvalidNumberPaste}
                      {...register('preferred_age_min', {
                        valueAsNumber: true,
                        validate: (v) => {
                          if (v === '' || v == null || Number.isNaN(Number(v))) return true
                          if (v < 18) return 'Min 18 ans'
                          if (v > 100) return 'Max 100 ans'
                          return true
                        }
                      })}
                      className="input-lg pl-14"
                      placeholder="20"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Max</span>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      step="1"
                      inputMode="numeric"
                      onKeyDown={preventInvalidNumberChars}
                      onPaste={preventInvalidNumberPaste}
                      {...register('preferred_age_max', {
                        valueAsNumber: true,
                        validate: (v) => {
                          if (v === '' || v == null || Number.isNaN(Number(v))) return true
                          if (v < 18) return 'Min 18 ans'
                          if (v > 100) return 'Max 100 ans'
                          return validateAgeRange(getValues('preferred_age_min'), v)
                        }
                      })}
                      className="input-lg pl-14"
                      placeholder="30"
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Laisse vide pour ne pas filtrer par âge</p>
                {(errors.preferred_age_min || errors.preferred_age_max) && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.preferred_age_max?.message || errors.preferred_age_min?.message}
                  </p>
                )}
              </div>

              <PillSelect label="Nombre max de colocs" name="max_roommates"
                options={MAX_ROOMMATES_OPTIONS} watch={watch} setValue={setValue} allowEmpty />
            </div>

            <div className="card">
              <label className="label mb-3">
                Tes centres d'intérêt <span className="text-neutral-400 font-normal">(optionnel, max 10)</span>
              </label>
              <p className="text-xs text-neutral-500 mb-4">L'IA utilise ça pour expliquer pourquoi vous matchez.</p>
              <Controller name="hobbies" control={control}
                render={({ field }) => (
                  <HobbiesSelector
                    selected={field.value || []}
                    onChange={field.onChange}
                    lang={i18n.language}
                  />
                )}
              />
            </div>

            <div className="card space-y-5">
              <h2 className="section-title">Exprime-toi</h2>

              <div>
                <label className="label">
                  Ce que je cherche chez un coloc <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  {...register('looking_for', { maxLength: 500 })}
                  className="input-lg min-h-[80px]"
                  maxLength={500}
                  placeholder="Je cherche quelqu'un de calme, qui aime cuisiner..."
                />
                <p className="text-xs text-neutral-400 mt-1 text-right">
                  {watch('looking_for')?.length || 0} / 500
                </p>
              </div>

              <div>
                <label className="label">
                  Ce qui ne passe pas pour moi <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  {...register('dealbreakers', { maxLength: 500 })}
                  className="input-lg min-h-[80px]"
                  maxLength={500}
                  placeholder="Pas de fêtes en semaine, pas de vaisselle qui traîne..."
                />
                <p className="text-xs text-neutral-400 mt-1 text-right">
                  {watch('dealbreakers')?.length || 0} / 500
                </p>
              </div>
            </div>

            <div className="card space-y-5">
              <h2 className="section-title">
                Tes réseaux <span className="text-neutral-400 font-normal">(optionnel, pour la confiance)</span>
              </h2>

              <div>
                <label className="label">LinkedIn</label>
                <input
                  {...register('linkedin_url', { validate: validateLinkedIn })}
                  className="input-lg"
                  placeholder="https://linkedin.com/in/ton-profil"
                  maxLength={200}
                />
                {errors.linkedin_url && <p className="text-xs text-red-600 mt-1">{errors.linkedin_url.message}</p>}
              </div>

              <div>
                <label className="label">Instagram</label>
                <input
                  {...register('instagram_handle', { validate: validateInstagram })}
                  className="input-lg"
                  placeholder="@ton_pseudo"
                  maxLength={31}
                />
                {errors.instagram_handle && <p className="text-xs text-red-600 mt-1">{errors.instagram_handle.message}</p>}
              </div>
            </div>
          </>
        )}

        {submitError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          {step > 0 ? (
            <button type="button" onClick={previousStep} className="btn-secondary">
              ← Retour
            </button>
          ) : <div></div>}

          {!isLastStep ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Continuer →
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer mon profil ✨' : 'Enregistrer'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ===== Pills select =====
function PillSelect({ label, name, options, watch, setValue, allowEmpty = false }) {
  const current = watch(name)
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {allowEmpty && (
          <button type="button" onClick={() => setValue(name, '')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              !current
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
            }`}>
            —
          </button>
        )}
        {options.map((opt) => (
          <button key={opt.value} type="button" onClick={() => setValue(name, opt.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              current === opt.value
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
            }`}>
            <span>{opt.emoji}</span>
            <span>{opt.label || opt.value.replace(/_/g, ' ')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ===== Hobbies selector =====
function HobbiesSelector({ selected, onChange, lang = 'fr' }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id))
    } else {
      if (selected.length >= 10) return
      onChange([...selected, id])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {HOBBIES.map((h) => {
          const isSelected = selected.includes(h.id)
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => toggle(h.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <span>{h.emoji}</span>
              <span>{h[lang] || h.fr}</span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-neutral-500 mt-3">
        {selected.length} / 10 sélectionné{selected.length > 1 ? 's' : ''}
      </p>
    </div>
  )
}