/**
 * Liste des hobbies/intérêts prédéfinis pour les tags cliquables.
 *
 * Structure : { id, emoji, label_fr, label_en, label_es, label_ar }
 * On utilise l'id stable (anglais snake_case) en DB, on affiche le label traduit.
 *
 * ~30 hobbies couvrant les centres d'intérêt populaires des étudiants/young pros européens.
 */

export const HOBBIES = [
  // Sports
  { id: 'gym', emoji: '💪', fr: 'Sport/Gym', en: 'Gym/Fitness', es: 'Gym', ar: 'الرياضة' },
  { id: 'running', emoji: '🏃', fr: 'Course à pied', en: 'Running', es: 'Correr', ar: 'الجري' },
  { id: 'yoga', emoji: '🧘', fr: 'Yoga', en: 'Yoga', es: 'Yoga', ar: 'اليوغا' },
  { id: 'hiking', emoji: '🥾', fr: 'Randonnée', en: 'Hiking', es: 'Senderismo', ar: 'المشي لمسافات طويلة' },
  { id: 'cycling', emoji: '🚴', fr: 'Vélo', en: 'Cycling', es: 'Ciclismo', ar: 'ركوب الدراجات' },
  { id: 'football', emoji: '⚽', fr: 'Football', en: 'Football', es: 'Fútbol', ar: 'كرة القدم' },
  { id: 'basketball', emoji: '🏀', fr: 'Basketball', en: 'Basketball', es: 'Baloncesto', ar: 'كرة السلة' },
  { id: 'swimming', emoji: '🏊', fr: 'Natation', en: 'Swimming', es: 'Natación', ar: 'السباحة' },
  { id: 'tennis', emoji: '🎾', fr: 'Tennis', en: 'Tennis', es: 'Tenis', ar: 'التنس' },

  // Creative
  { id: 'music', emoji: '🎵', fr: 'Musique', en: 'Music', es: 'Música', ar: 'الموسيقى' },
  { id: 'photography', emoji: '📸', fr: 'Photo', en: 'Photography', es: 'Fotografía', ar: 'التصوير' },
  { id: 'art', emoji: '🎨', fr: 'Art/Dessin', en: 'Art/Drawing', es: 'Arte/Dibujo', ar: 'الفن' },
  { id: 'writing', emoji: '✍️', fr: 'Écriture', en: 'Writing', es: 'Escribir', ar: 'الكتابة' },
  { id: 'dance', emoji: '💃', fr: 'Danse', en: 'Dance', es: 'Baile', ar: 'الرقص' },

  // Culture / Media
  { id: 'cinema', emoji: '🎬', fr: 'Cinéma', en: 'Cinema', es: 'Cine', ar: 'السينما' },
  { id: 'reading', emoji: '📚', fr: 'Lecture', en: 'Reading', es: 'Lectura', ar: 'القراءة' },
  { id: 'gaming', emoji: '🎮', fr: 'Jeux vidéo', en: 'Gaming', es: 'Videojuegos', ar: 'ألعاب الفيديو' },
  { id: 'concerts', emoji: '🎤', fr: 'Concerts', en: 'Concerts', es: 'Conciertos', ar: 'الحفلات الموسيقية' },
  { id: 'podcasts', emoji: '🎙️', fr: 'Podcasts', en: 'Podcasts', es: 'Podcasts', ar: 'البودكاست' },
  { id: 'theater', emoji: '🎭', fr: 'Théâtre', en: 'Theater', es: 'Teatro', ar: 'المسرح' },

  // Social / Lifestyle
  { id: 'cooking', emoji: '🍳', fr: 'Cuisine', en: 'Cooking', es: 'Cocina', ar: 'الطبخ' },
  { id: 'coffee', emoji: '☕', fr: 'Cafés', en: 'Cafés', es: 'Cafés', ar: 'المقاهي' },
  { id: 'travel', emoji: '✈️', fr: 'Voyages', en: 'Travel', es: 'Viajes', ar: 'السفر' },
  { id: 'nightlife', emoji: '🌃', fr: 'Sortir le soir', en: 'Nightlife', es: 'Vida nocturna', ar: 'الحياة الليلية' },
  { id: 'board_games', emoji: '🎲', fr: 'Jeux de société', en: 'Board games', es: 'Juegos de mesa', ar: 'ألعاب الطاولة' },

  // Tech / Learning
  { id: 'tech', emoji: '💻', fr: 'Tech/Code', en: 'Tech/Coding', es: 'Tecnología', ar: 'التقنية' },
  { id: 'languages', emoji: '🗣️', fr: 'Langues', en: 'Languages', es: 'Idiomas', ar: 'اللغات' },
  { id: 'science', emoji: '🔬', fr: 'Sciences', en: 'Science', es: 'Ciencias', ar: 'العلوم' },

  // Wellness
  { id: 'meditation', emoji: '🧘‍♂️', fr: 'Méditation', en: 'Meditation', es: 'Meditación', ar: 'التأمل' },
  { id: 'nature', emoji: '🌳', fr: 'Nature', en: 'Nature', es: 'Naturaleza', ar: 'الطبيعة' },
  { id: 'pets_lover', emoji: '🐾', fr: 'Amis des animaux', en: 'Pet lover', es: 'Amante animales', ar: 'محب الحيوانات' },

  // Political / Values (optional)
  { id: 'volunteering', emoji: '🤝', fr: 'Bénévolat', en: 'Volunteering', es: 'Voluntariado', ar: 'العمل التطوعي' },
]

export function getHobbyLabel(hobbyId, lang = 'fr') {
  const h = HOBBIES.find((x) => x.id === hobbyId)
  if (!h) return hobbyId
  return h[lang] || h.fr
}