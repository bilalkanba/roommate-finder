/**
 * i18n configuration : FR / EN / ES / AR avec support RTL pour l'arabe.
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  fr: {
    translation: {
      app: {
        title: 'Roommate Finder AI',
        tagline: 'Trouve le colocataire qui te ressemble',
      },
      nav: {
        matches: 'Matches',
        profile: 'Mon profil',
        login: 'Se connecter',
        logout: 'Déconnexion',
      },
      landing: {
        badge: 'Propulsé par l\'IA',
        hero_1: 'Trouve le colocataire',
        hero_2: 'qui te ressemble.',
        sub: 'Fini les mauvaises surprises. Notre algorithme analyse 7 dimensions de compatibilité pour te matcher avec la bonne personne, partout en Europe.',
        cta: 'Commencer',
        how_it_works: 'Comment ça marche',
      },
      auth: {
        email: 'Email',
        password: 'Mot de passe',
        signIn: 'Se connecter',
        signUp: 'Créer un compte',
        welcome_back: 'Bon retour !',
        signin_sub: 'Connecte-toi pour voir tes nouveaux matches.',
        signup_sub: 'Commence à chercher ton coloc idéal en 2 minutes.',
        no_account: 'Pas encore de compte ?',
        has_account: 'Déjà un compte ?',
        min_chars: 'Minimum 6 caractères',
      },
      profile: {
        title_create: 'Crée ton profil',
        title_edit: 'Modifie ton profil',
        step_you: 'Toi',
        step_housing: 'Logement',
        step_lifestyle: 'Style de vie',
        full_name: 'Ton nom complet',
        age: 'Âge',
        gender: 'Genre',
        occupation: 'Occupation',
        bio: 'Présente-toi',
        bio_optional: '(optionnel)',
        city: 'Ville',
        country: 'Pays',
        district: 'Quartier',
        district_placeholder: 'Malasaña, Le Marais...',
        district_optional: '(optionnel)',
        search_radius: 'Rayon de recherche',
        budget: 'Budget mensuel',
        budget_min: 'Min',
        budget_max: 'Max',
        move_in: 'Emménagement',
        lease_duration: 'Durée du bail (mois)',
        languages: 'Langues parlées',
        photo: 'Photo de profil',
        photo_sub: 'Optionnelle. Aide les autres à te faire confiance.',
        submit_create: 'Créer mon profil',
        submit_edit: 'Enregistrer',
        continue: 'Continuer',
        back: 'Retour',
      },
      lifestyle: {
        cleanliness: 'Propreté',
        sleep: 'Horaires de sommeil',
        social: 'Sociabilité',
        noise: 'Tolérance au bruit',
        smoking: 'Fumeur',
        pets: 'Animaux',
        guests: 'Invités',
      },
      matches: {
        title: 'Tes matches',
        sub_with_count_one: '{{count}} personne compatible avec toi',
        sub_with_count_other: '{{count}} personnes compatibles avec toi',
        sub_empty: 'Personne ne correspond pour l\'instant',
        welcome: 'Bienvenue !',
        welcome_sub: 'Pour trouver des colocataires compatibles, nous avons d\'abord besoin de mieux te connaître.',
        cta_create: 'Créer mon profil',
        empty_title: 'Aucun match pour le moment',
        empty_sub: 'Reviens bientôt ! Plus il y a d\'utilisateurs dans ta ville, plus tu auras de matches.',
        score_excellent: 'Excellente compatibilité',
        score_good: 'Bonne compatibilité',
        score_medium: 'Compatibilité moyenne',
        score_low: 'Compatibilité limitée',
      },
      common: {
        loading: 'Chargement...',
        saving: 'Enregistrement...',
        error: 'Une erreur est survenue',
      },
      errors: {
        name_required: 'Ton nom est requis (min 2 caractères)',
        name_invalid: 'Ton nom contient des caractères invalides',
        age_range: 'L\'âge doit être entre 18 et 100',
        city_required: 'Choisis une ville dans la liste',
        budget_min_max: 'Le budget max doit être supérieur au min',
        budget_range: 'Le budget doit être entre 100€ et 10000€',
        date_past: 'La date ne peut pas être dans le passé',
        duration_range: 'Durée entre 1 et 60 mois',
      },
    },
  },
  en: {
    translation: {
      app: { title: 'Roommate Finder AI', tagline: 'Find your perfect roommate' },
      nav: { matches: 'Matches', profile: 'My profile', login: 'Sign in', logout: 'Sign out' },
      landing: {
        badge: 'AI-powered',
        hero_1: 'Find the roommate',
        hero_2: 'who fits you.',
        sub: 'No more bad surprises. Our algorithm analyzes 7 compatibility dimensions to match you with the right person, anywhere in Europe.',
        cta: 'Get started',
        how_it_works: 'How it works',
      },
      auth: {
        email: 'Email', password: 'Password',
        signIn: 'Sign in', signUp: 'Create account',
        welcome_back: 'Welcome back!',
        signin_sub: 'Sign in to see your new matches.',
        signup_sub: 'Start looking for your ideal roommate in 2 minutes.',
        no_account: 'No account yet?', has_account: 'Already have an account?',
        min_chars: 'Minimum 6 characters',
      },
      profile: {
        title_create: 'Create your profile', title_edit: 'Edit your profile',
        step_you: 'You', step_housing: 'Housing', step_lifestyle: 'Lifestyle',
        full_name: 'Your full name', age: 'Age', gender: 'Gender',
        occupation: 'Occupation', bio: 'Introduce yourself', bio_optional: '(optional)',
        city: 'City', country: 'Country', district: 'Neighborhood',
        district_placeholder: 'Malasaña, SoHo, Kreuzberg...',
        district_optional: '(optional)',
        search_radius: 'Search radius',
        budget: 'Monthly budget', budget_min: 'Min', budget_max: 'Max',
        move_in: 'Move-in', lease_duration: 'Lease duration (months)',
        languages: 'Languages spoken',
        photo: 'Profile photo',
        photo_sub: 'Optional. Helps others trust you.',
        submit_create: 'Create profile', submit_edit: 'Save',
        continue: 'Continue', back: 'Back',
      },
      lifestyle: {
        cleanliness: 'Cleanliness', sleep: 'Sleep schedule', social: 'Sociability',
        noise: 'Noise tolerance', smoking: 'Smoking', pets: 'Pets', guests: 'Guests',
      },
      matches: {
        title: 'Your matches',
        sub_with_count_one: '{{count}} person compatible with you',
        sub_with_count_other: '{{count}} people compatible with you',
        sub_empty: 'No one matches for now',
        welcome: 'Welcome!',
        welcome_sub: 'To find compatible roommates, we need to know you better first.',
        cta_create: 'Create my profile',
        empty_title: 'No matches yet',
        empty_sub: 'Come back soon! The more users in your city, the more matches.',
        score_excellent: 'Excellent compatibility',
        score_good: 'Good compatibility',
        score_medium: 'Medium compatibility',
        score_low: 'Limited compatibility',
      },
      common: { loading: 'Loading...', saving: 'Saving...', error: 'An error occurred' },
      errors: {
        name_required: 'Your name is required (min 2 chars)',
        name_invalid: 'Your name contains invalid characters',
        age_range: 'Age must be between 18 and 100',
        city_required: 'Choose a city from the list',
        budget_min_max: 'Max budget must be higher than min',
        budget_range: 'Budget must be between €100 and €10000',
        date_past: 'Date cannot be in the past',
        duration_range: 'Duration between 1 and 60 months',
      },
    },
  },
  es: {
    translation: {
      app: { title: 'Roommate Finder AI', tagline: 'Encuentra tu compañero de piso ideal' },
      nav: { matches: 'Matches', profile: 'Mi perfil', login: 'Iniciar sesión', logout: 'Cerrar sesión' },
      landing: {
        badge: 'Con IA',
        hero_1: 'Encuentra el compañero',
        hero_2: 'perfecto para ti.',
        sub: 'Adiós a las sorpresas. Nuestro algoritmo analiza 7 dimensiones de compatibilidad para encontrar la persona adecuada en toda Europa.',
        cta: 'Empezar',
        how_it_works: 'Cómo funciona',
      },
      auth: {
        email: 'Email', password: 'Contraseña',
        signIn: 'Iniciar sesión', signUp: 'Crear cuenta',
        welcome_back: '¡Bienvenido de nuevo!',
        signin_sub: 'Inicia sesión para ver tus nuevos matches.',
        signup_sub: 'Empieza a buscar tu compañero ideal en 2 minutos.',
        no_account: '¿Aún no tienes cuenta?', has_account: '¿Ya tienes cuenta?',
        min_chars: 'Mínimo 6 caracteres',
      },
      profile: {
        title_create: 'Crea tu perfil', title_edit: 'Edita tu perfil',
        step_you: 'Tú', step_housing: 'Vivienda', step_lifestyle: 'Estilo de vida',
        full_name: 'Tu nombre completo', age: 'Edad', gender: 'Género',
        occupation: 'Ocupación', bio: 'Preséntate', bio_optional: '(opcional)',
        city: 'Ciudad', country: 'País', district: 'Barrio',
        district_placeholder: 'Malasaña, Chueca, Gràcia...',
        district_optional: '(opcional)',
        search_radius: 'Radio de búsqueda',
        budget: 'Presupuesto mensual', budget_min: 'Mín', budget_max: 'Máx',
        move_in: 'Mudanza', lease_duration: 'Duración del contrato (meses)',
        languages: 'Idiomas hablados',
        photo: 'Foto de perfil',
        photo_sub: 'Opcional. Ayuda a que otros confíen en ti.',
        submit_create: 'Crear mi perfil', submit_edit: 'Guardar',
        continue: 'Continuar', back: 'Atrás',
      },
      lifestyle: {
        cleanliness: 'Limpieza', sleep: 'Horario de sueño', social: 'Sociabilidad',
        noise: 'Tolerancia al ruido', smoking: 'Fumador', pets: 'Mascotas', guests: 'Invitados',
      },
      matches: {
        title: 'Tus matches',
        sub_with_count_one: '{{count}} persona compatible contigo',
        sub_with_count_other: '{{count}} personas compatibles contigo',
        sub_empty: 'Nadie coincide por ahora',
        welcome: '¡Bienvenido!',
        welcome_sub: 'Para encontrar compañeros compatibles, necesitamos conocerte mejor.',
        cta_create: 'Crear mi perfil',
        empty_title: 'Sin matches por ahora',
        empty_sub: '¡Vuelve pronto! Cuantos más usuarios en tu ciudad, más matches.',
        score_excellent: 'Excelente compatibilidad',
        score_good: 'Buena compatibilidad',
        score_medium: 'Compatibilidad media',
        score_low: 'Compatibilidad limitada',
      },
      common: { loading: 'Cargando...', saving: 'Guardando...', error: 'Ha ocurrido un error' },
      errors: {
        name_required: 'Tu nombre es obligatorio (mín 2 caracteres)',
        name_invalid: 'Tu nombre contiene caracteres no válidos',
        age_range: 'La edad debe estar entre 18 y 100',
        city_required: 'Elige una ciudad de la lista',
        budget_min_max: 'El presupuesto máx debe ser superior al mín',
        budget_range: 'El presupuesto debe estar entre 100€ y 10000€',
        date_past: 'La fecha no puede ser en el pasado',
        duration_range: 'Duración entre 1 y 60 meses',
      },
    },
  },
  ar: {
    translation: {
      app: { title: 'Roommate Finder AI', tagline: 'ابحث عن شريك السكن المثالي' },
      nav: { matches: 'التوافقات', profile: 'ملفي', login: 'تسجيل الدخول', logout: 'تسجيل الخروج' },
      landing: {
        badge: 'مدعوم بالذكاء الاصطناعي',
        hero_1: 'ابحث عن شريك السكن',
        hero_2: 'الذي يناسبك.',
        sub: 'لا مزيد من المفاجآت السيئة. خوارزميتنا تحلل 7 أبعاد للتوافق للعثور على الشخص المناسب في جميع أنحاء أوروبا.',
        cta: 'ابدأ الآن',
        how_it_works: 'كيف يعمل',
      },
      auth: {
        email: 'البريد الإلكتروني', password: 'كلمة المرور',
        signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب',
        welcome_back: 'مرحباً بعودتك!',
        signin_sub: 'سجل الدخول لرؤية التوافقات الجديدة.',
        signup_sub: 'ابدأ البحث عن شريك السكن المثالي في دقيقتين.',
        no_account: 'ليس لديك حساب بعد؟', has_account: 'لديك حساب بالفعل؟',
        min_chars: '6 أحرف كحد أدنى',
      },
      profile: {
        title_create: 'أنشئ ملفك الشخصي', title_edit: 'تعديل ملفك الشخصي',
        step_you: 'أنت', step_housing: 'السكن', step_lifestyle: 'نمط الحياة',
        full_name: 'اسمك الكامل', age: 'العمر', gender: 'النوع',
        occupation: 'المهنة', bio: 'عرّف عن نفسك', bio_optional: '(اختياري)',
        city: 'المدينة', country: 'البلد', district: 'الحي',
        district_placeholder: 'مالاسانيا، ليه ماريه...',
        district_optional: '(اختياري)',
        search_radius: 'نطاق البحث',
        budget: 'الميزانية الشهرية', budget_min: 'الحد الأدنى', budget_max: 'الحد الأقصى',
        move_in: 'تاريخ الانتقال', lease_duration: 'مدة العقد (أشهر)',
        languages: 'اللغات المتحدثة',
        photo: 'صورة الملف الشخصي',
        photo_sub: 'اختيارية. تساعد الآخرين على الثقة بك.',
        submit_create: 'إنشاء ملفي', submit_edit: 'حفظ',
        continue: 'متابعة', back: 'رجوع',
      },
      lifestyle: {
        cleanliness: 'النظافة', sleep: 'مواعيد النوم', social: 'الاجتماعية',
        noise: 'تحمل الضوضاء', smoking: 'التدخين', pets: 'الحيوانات الأليفة', guests: 'الضيوف',
      },
      matches: {
        title: 'توافقاتك',
        sub_with_count_one: '{{count}} شخص متوافق معك',
        sub_with_count_other: '{{count}} أشخاص متوافقون معك',
        sub_empty: 'لا أحد متوافق الآن',
        welcome: 'مرحباً!',
        welcome_sub: 'للعثور على شركاء سكن متوافقين، نحتاج أولاً إلى معرفتك بشكل أفضل.',
        cta_create: 'إنشاء ملفي الشخصي',
        empty_title: 'لا توجد توافقات بعد',
        empty_sub: 'عد قريباً! كلما زاد عدد المستخدمين في مدينتك، زادت التوافقات.',
        score_excellent: 'توافق ممتاز',
        score_good: 'توافق جيد',
        score_medium: 'توافق متوسط',
        score_low: 'توافق محدود',
      },
      common: { loading: 'جاري التحميل...', saving: 'جاري الحفظ...', error: 'حدث خطأ' },
      errors: {
        name_required: 'الاسم مطلوب (حرفان على الأقل)',
        name_invalid: 'يحتوي الاسم على أحرف غير صالحة',
        age_range: 'يجب أن يكون العمر بين 18 و 100',
        city_required: 'اختر مدينة من القائمة',
        budget_min_max: 'يجب أن تكون الميزانية القصوى أعلى من الأدنى',
        budget_range: 'يجب أن تكون الميزانية بين 100€ و 10000€',
        date_past: 'لا يمكن أن يكون التاريخ في الماضي',
        duration_range: 'المدة بين 1 و 60 شهراً',
      },
    },
  },
}

// Langue initiale : récupère depuis localStorage ou détecte navigateur
const SUPPORTED_LANGS = ['fr', 'en', 'es', 'ar']
const savedLang = localStorage.getItem('i18nextLng')
const browserLang = navigator.language?.split('-')[0]
const initialLang = SUPPORTED_LANGS.includes(savedLang)
  ? savedLang
  : SUPPORTED_LANGS.includes(browserLang)
    ? browserLang
    : 'fr'

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// Synchronise la direction (RTL pour l'arabe) avec l'HTML
const updateHtmlDir = (lng) => {
  document.documentElement.lang = lng
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
}
updateHtmlDir(initialLang)
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng)
  updateHtmlDir(lng)
})

export default i18n

// Helper exporté
export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]