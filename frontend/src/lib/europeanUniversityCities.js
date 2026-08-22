/**
 * Villes universitaires européennes
 *
 * ~180 villes sélectionnées selon 3 critères :
 * 1. Nombre significatif d'universités (au moins 1 grande fac ou école)
 * 2. Popularité auprès des étudiants Erasmus/internationaux
 * 3. Attractivité pour les jeunes actifs (young professionals)
 *
 * Structure : { name, country, code, pop, isUniversity, students (in thousands) }
 *
 * Sources : Times Higher Education, QS Rankings, Eurostat, Erasmus stats 2024
 */

export const EUROPEAN_UNIVERSITY_CITIES = [
  // ===== FRANCE (18 villes) =====
  { name: 'Paris', country: 'France', code: 'FR', pop: 2148, students: 700 },
  { name: 'Lyon', country: 'France', code: 'FR', pop: 522, students: 165 },
  { name: 'Marseille', country: 'France', code: 'FR', pop: 870, students: 90 },
  { name: 'Toulouse', country: 'France', code: 'FR', pop: 493, students: 130 },
  { name: 'Montpellier', country: 'France', code: 'FR', pop: 295, students: 90 },
  { name: 'Bordeaux', country: 'France', code: 'FR', pop: 260, students: 100 },
  { name: 'Lille', country: 'France', code: 'FR', pop: 234, students: 118 },
  { name: 'Strasbourg', country: 'France', code: 'FR', pop: 287, students: 65 },
  { name: 'Nantes', country: 'France', code: 'FR', pop: 320, students: 60 },
  { name: 'Rennes', country: 'France', code: 'FR', pop: 220, students: 68 },
  { name: 'Nice', country: 'France', code: 'FR', pop: 341, students: 30 },
  { name: 'Grenoble', country: 'France', code: 'FR', pop: 158, students: 60 },
  { name: 'Aix-en-Provence', country: 'France', code: 'FR', pop: 145, students: 40 },
  { name: 'Nancy', country: 'France', code: 'FR', pop: 105, students: 50 },
  { name: 'Reims', country: 'France', code: 'FR', pop: 182, students: 30 },
  { name: 'Dijon', country: 'France', code: 'FR', pop: 155, students: 32 },
  { name: 'Angers', country: 'France', code: 'FR', pop: 155, students: 42 },
  { name: 'Poitiers', country: 'France', code: 'FR', pop: 88, students: 27 },

  // ===== ESPAGNE (17 villes) =====
  { name: 'Madrid', country: 'Spain', code: 'ES', pop: 3320, students: 300 },
  { name: 'Barcelona', country: 'Spain', code: 'ES', pop: 1620, students: 200 },
  { name: 'Valencia', country: 'Spain', code: 'ES', pop: 790, students: 78 },
  { name: 'Seville', country: 'Spain', code: 'ES', pop: 688, students: 70 },
  { name: 'Zaragoza', country: 'Spain', code: 'ES', pop: 675, students: 40 },
  { name: 'Malaga', country: 'Spain', code: 'ES', pop: 579, students: 40 },
  { name: 'Granada', country: 'Spain', code: 'ES', pop: 227, students: 80 },
  { name: 'Salamanca', country: 'Spain', code: 'ES', pop: 143, students: 30 },
  { name: 'Bilbao', country: 'Spain', code: 'ES', pop: 346, students: 45 },
  { name: 'Alicante', country: 'Spain', code: 'ES', pop: 337, students: 30 },
  { name: 'Murcia', country: 'Spain', code: 'Spain', pop: 460, students: 38 },
  { name: 'Palma', country: 'Spain', code: 'ES', pop: 416, students: 15 },
  { name: 'Cordoba', country: 'Spain', code: 'ES', pop: 325, students: 21 },
  { name: 'Santiago de Compostela', country: 'Spain', code: 'ES', pop: 98, students: 25 },
  { name: 'Pamplona', country: 'Spain', code: 'ES', pop: 203, students: 20 },
  { name: 'San Sebastián', country: 'Spain', code: 'ES', pop: 188, students: 16 },
  { name: 'Oviedo', country: 'Spain', code: 'ES', pop: 220, students: 22 },

  // ===== ALLEMAGNE (20 villes) =====
  { name: 'Berlin', country: 'Germany', code: 'DE', pop: 3660, students: 200 },
  { name: 'Munich', country: 'Germany', code: 'DE', pop: 1510, students: 130 },
  { name: 'Hamburg', country: 'Germany', code: 'DE', pop: 1850, students: 105 },
  { name: 'Cologne', country: 'Germany', code: 'DE', pop: 1090, students: 100 },
  { name: 'Frankfurt', country: 'Germany', code: 'DE', pop: 760, students: 70 },
  { name: 'Stuttgart', country: 'Germany', code: 'DE', pop: 630, students: 60 },
  { name: 'Düsseldorf', country: 'Germany', code: 'DE', pop: 620, students: 50 },
  { name: 'Leipzig', country: 'Germany', code: 'DE', pop: 620, students: 40 },
  { name: 'Dortmund', country: 'Germany', code: 'DE', pop: 590, students: 55 },
  { name: 'Dresden', country: 'Germany', code: 'DE', pop: 560, students: 47 },
  { name: 'Hannover', country: 'Germany', code: 'DE', pop: 540, students: 45 },
  { name: 'Nuremberg', country: 'Germany', code: 'DE', pop: 520, students: 30 },
  { name: 'Bremen', country: 'Germany', code: 'DE', pop: 570, students: 32 },
  { name: 'Heidelberg', country: 'Germany', code: 'DE', pop: 160, students: 40 },
  { name: 'Aachen', country: 'Germany', code: 'DE', pop: 250, students: 55 },
  { name: 'Freiburg', country: 'Germany', code: 'DE', pop: 231, students: 30 },
  { name: 'Göttingen', country: 'Germany', code: 'DE', pop: 118, students: 30 },
  { name: 'Tübingen', country: 'Germany', code: 'DE', pop: 91, students: 27 },
  { name: 'Mainz', country: 'Germany', code: 'DE', pop: 218, students: 31 },
  { name: 'Karlsruhe', country: 'Germany', code: 'DE', pop: 313, students: 40 },

  // ===== ITALIE (16 villes) =====
  { name: 'Rome', country: 'Italy', code: 'IT', pop: 2870, students: 200 },
  { name: 'Milan', country: 'Italy', code: 'IT', pop: 1370, students: 200 },
  { name: 'Naples', country: 'Italy', code: 'IT', pop: 970, students: 100 },
  { name: 'Turin', country: 'Italy', code: 'IT', pop: 870, students: 100 },
  { name: 'Bologna', country: 'Italy', code: 'IT', pop: 390, students: 87 },
  { name: 'Florence', country: 'Italy', code: 'IT', pop: 380, students: 50 },
  { name: 'Palermo', country: 'Italy', code: 'IT', pop: 670, students: 40 },
  { name: 'Padua', country: 'Italy', code: 'IT', pop: 210, students: 60 },
  { name: 'Pisa', country: 'Italy', code: 'IT', pop: 90, students: 50 },
  { name: 'Bari', country: 'Italy', code: 'IT', pop: 320, students: 45 },
  { name: 'Verona', country: 'Italy', code: 'IT', pop: 260, students: 25 },
  { name: 'Venice', country: 'Italy', code: 'IT', pop: 260, students: 20 },
  { name: 'Genoa', country: 'Italy', code: 'IT', pop: 580, students: 33 },
  { name: 'Catania', country: 'Italy', code: 'IT', pop: 310, students: 45 },
  { name: 'Trento', country: 'Italy', code: 'IT', pop: 118, students: 16 },
  { name: 'Siena', country: 'Italy', code: 'IT', pop: 53, students: 16 },

  // ===== PORTUGAL (7 villes) =====
  { name: 'Lisbon', country: 'Portugal', code: 'PT', pop: 548, students: 122 },
  { name: 'Porto', country: 'Portugal', code: 'PT', pop: 238, students: 65 },
  { name: 'Coimbra', country: 'Portugal', code: 'PT', pop: 140, students: 30 },
  { name: 'Braga', country: 'Portugal', code: 'PT', pop: 193, students: 20 },
  { name: 'Aveiro', country: 'Portugal', code: 'PT', pop: 78, students: 15 },
  { name: 'Faro', country: 'Portugal', code: 'PT', pop: 65, students: 8 },
  { name: 'Évora', country: 'Portugal', code: 'PT', pop: 57, students: 8 },

  // ===== PAYS-BAS (10 villes) =====
  { name: 'Amsterdam', country: 'Netherlands', code: 'NL', pop: 900, students: 100 },
  { name: 'Rotterdam', country: 'Netherlands', code: 'NL', pop: 655, students: 65 },
  { name: 'The Hague', country: 'Netherlands', code: 'NL', pop: 548, students: 30 },
  { name: 'Utrecht', country: 'Netherlands', code: 'NL', pop: 361, students: 71 },
  { name: 'Eindhoven', country: 'Netherlands', code: 'NL', pop: 240, students: 45 },
  { name: 'Groningen', country: 'Netherlands', code: 'NL', pop: 235, students: 63 },
  { name: 'Leiden', country: 'Netherlands', code: 'NL', pop: 125, students: 33 },
  { name: 'Delft', country: 'Netherlands', code: 'NL', pop: 105, students: 27 },
  { name: 'Nijmegen', country: 'Netherlands', code: 'NL', pop: 179, students: 32 },
  { name: 'Maastricht', country: 'Netherlands', code: 'NL', pop: 122, students: 22 },

  // ===== BELGIQUE (7 villes) =====
  { name: 'Brussels', country: 'Belgium', code: 'BE', pop: 1220, students: 100 },
  { name: 'Antwerp', country: 'Belgium', code: 'BE', pop: 530, students: 55 },
  { name: 'Ghent', country: 'Belgium', code: 'BE', pop: 265, students: 75 },
  { name: 'Leuven', country: 'Belgium', code: 'BE', pop: 102, students: 60 },
  { name: 'Liège', country: 'Belgium', code: 'BE', pop: 197, students: 30 },
  { name: 'Louvain-la-Neuve', country: 'Belgium', code: 'BE', pop: 33, students: 30 },
  { name: 'Namur', country: 'Belgium', code: 'BE', pop: 111, students: 12 },

  // ===== ROYAUME-UNI + IRLANDE (17 villes) =====
  { name: 'London', country: 'United Kingdom', code: 'GB', pop: 9300, students: 400 },
  { name: 'Manchester', country: 'United Kingdom', code: 'GB', pop: 550, students: 100 },
  { name: 'Birmingham', country: 'United Kingdom', code: 'GB', pop: 1140, students: 85 },
  { name: 'Edinburgh', country: 'United Kingdom', code: 'GB', pop: 525, students: 63 },
  { name: 'Glasgow', country: 'United Kingdom', code: 'GB', pop: 635, students: 80 },
  { name: 'Oxford', country: 'United Kingdom', code: 'GB', pop: 160, students: 45 },
  { name: 'Cambridge', country: 'United Kingdom', code: 'GB', pop: 145, students: 32 },
  { name: 'Liverpool', country: 'United Kingdom', code: 'GB', pop: 500, students: 70 },
  { name: 'Leeds', country: 'United Kingdom', code: 'GB', pop: 800, students: 68 },
  { name: 'Bristol', country: 'United Kingdom', code: 'GB', pop: 465, students: 55 },
  { name: 'Newcastle', country: 'United Kingdom', code: 'GB', pop: 300, students: 55 },
  { name: 'Sheffield', country: 'United Kingdom', code: 'GB', pop: 585, students: 60 },
  { name: 'Nottingham', country: 'United Kingdom', code: 'GB', pop: 330, students: 65 },
  { name: 'Southampton', country: 'United Kingdom', code: 'GB', pop: 253, students: 40 },
  { name: 'Cardiff', country: 'United Kingdom', code: 'GB', pop: 366, students: 55 },
  { name: 'Dublin', country: 'Ireland', code: 'IE', pop: 590, students: 80 },
  { name: 'Cork', country: 'Ireland', code: 'IE', pop: 224, students: 22 },
  { name: 'Galway', country: 'Ireland', code: 'IE', pop: 84, students: 19 },

  // ===== PAYS NORDIQUES (12 villes) =====
  { name: 'Stockholm', country: 'Sweden', code: 'SE', pop: 980, students: 80 },
  { name: 'Gothenburg', country: 'Sweden', code: 'SE', pop: 590, students: 60 },
  { name: 'Malmö', country: 'Sweden', code: 'SE', pop: 355, students: 24 },
  { name: 'Uppsala', country: 'Sweden', code: 'SE', pop: 178, students: 47 },
  { name: 'Lund', country: 'Sweden', code: 'SE', pop: 94, students: 40 },
  { name: 'Copenhagen', country: 'Denmark', code: 'DK', pop: 660, students: 100 },
  { name: 'Aarhus', country: 'Denmark', code: 'DK', pop: 350, students: 45 },
  { name: 'Odense', country: 'Denmark', code: 'DK', pop: 180, students: 20 },
  { name: 'Oslo', country: 'Norway', code: 'NO', pop: 700, students: 80 },
  { name: 'Bergen', country: 'Norway', code: 'NO', pop: 285, students: 30 },
  { name: 'Helsinki', country: 'Finland', code: 'FI', pop: 660, students: 80 },
  { name: 'Turku', country: 'Finland', code: 'FI', pop: 195, students: 40 },

  // ===== SUISSE + AUTRICHE (10 villes) =====
  { name: 'Zurich', country: 'Switzerland', code: 'CH', pop: 430, students: 50 },
  { name: 'Geneva', country: 'Switzerland', code: 'CH', pop: 203, students: 20 },
  { name: 'Basel', country: 'Switzerland', code: 'CH', pop: 174, students: 13 },
  { name: 'Lausanne', country: 'Switzerland', code: 'CH', pop: 140, students: 45 },
  { name: 'Bern', country: 'Switzerland', code: 'CH', pop: 133, students: 19 },
  { name: 'Vienna', country: 'Austria', code: 'AT', pop: 1980, students: 200 },
  { name: 'Graz', country: 'Austria', code: 'AT', pop: 295, students: 60 },
  { name: 'Salzburg', country: 'Austria', code: 'AT', pop: 157, students: 20 },
  { name: 'Innsbruck', country: 'Austria', code: 'AT', pop: 132, students: 30 },
  { name: 'Linz', country: 'Austria', code: 'AT', pop: 205, students: 22 },

  // ===== EUROPE DE L'EST (18 villes) =====
  { name: 'Warsaw', country: 'Poland', code: 'PL', pop: 1800, students: 260 },
  { name: 'Krakow', country: 'Poland', code: 'PL', pop: 780, students: 130 },
  { name: 'Wrocław', country: 'Poland', code: 'PL', pop: 640, students: 105 },
  { name: 'Poznań', country: 'Poland', code: 'PL', pop: 540, students: 100 },
  { name: 'Łódź', country: 'Poland', code: 'PL', pop: 680, students: 60 },
  { name: 'Prague', country: 'Czech Republic', code: 'CZ', pop: 1310, students: 130 },
  { name: 'Brno', country: 'Czech Republic', code: 'CZ', pop: 380, students: 70 },
  { name: 'Budapest', country: 'Hungary', code: 'HU', pop: 1750, students: 130 },
  { name: 'Debrecen', country: 'Hungary', code: 'HU', pop: 200, students: 30 },
  { name: 'Szeged', country: 'Hungary', code: 'HU', pop: 158, students: 22 },
  { name: 'Bucharest', country: 'Romania', code: 'RO', pop: 1830, students: 150 },
  { name: 'Cluj-Napoca', country: 'Romania', code: 'RO', pop: 325, students: 65 },
  { name: 'Iași', country: 'Romania', code: 'RO', pop: 290, students: 50 },
  { name: 'Sofia', country: 'Bulgaria', code: 'BG', pop: 1240, students: 90 },
  { name: 'Plovdiv', country: 'Bulgaria', code: 'BG', pop: 350, students: 40 },
  { name: 'Athens', country: 'Greece', code: 'GR', pop: 3150, students: 190 },
  { name: 'Thessaloniki', country: 'Greece', code: 'GR', pop: 820, students: 100 },
  { name: 'Patras', country: 'Greece', code: 'GR', pop: 213, students: 32 },

  // ===== AUTRES (14 villes) =====
  { name: 'Luxembourg', country: 'Luxembourg', code: 'LU', pop: 130, students: 8 },
  { name: 'Zagreb', country: 'Croatia', code: 'HR', pop: 790, students: 70 },
  { name: 'Split', country: 'Croatia', code: 'HR', pop: 178, students: 22 },
  { name: 'Ljubljana', country: 'Slovenia', code: 'SI', pop: 295, students: 40 },
  { name: 'Maribor', country: 'Slovenia', code: 'SI', pop: 95, students: 15 },
  { name: 'Bratislava', country: 'Slovakia', code: 'SK', pop: 475, students: 65 },
  { name: 'Košice', country: 'Slovakia', code: 'SK', pop: 240, students: 25 },
  { name: 'Tallinn', country: 'Estonia', code: 'EE', pop: 440, students: 25 },
  { name: 'Tartu', country: 'Estonia', code: 'EE', pop: 96, students: 18 },
  { name: 'Riga', country: 'Latvia', code: 'LV', pop: 615, students: 45 },
  { name: 'Vilnius', country: 'Lithuania', code: 'LT', pop: 590, students: 45 },
  { name: 'Kaunas', country: 'Lithuania', code: 'LT', pop: 300, students: 35 },
  { name: 'Reykjavik', country: 'Iceland', code: 'IS', pop: 130, students: 18 },
  { name: 'Nicosia', country: 'Cyprus', code: 'CY', pop: 350, students: 25 },
]

// Mapping code pays → drapeau emoji
export const COUNTRY_FLAGS = {
  FR: '🇫🇷', ES: '🇪🇸', DE: '🇩🇪', IT: '🇮🇹', PT: '🇵🇹', NL: '🇳🇱',
  BE: '🇧🇪', GB: '🇬🇧', IE: '🇮🇪', SE: '🇸🇪', DK: '🇩🇰', NO: '🇳🇴',
  FI: '🇫🇮', CH: '🇨🇭', AT: '🇦🇹', PL: '🇵🇱', CZ: '🇨🇿', HU: '🇭🇺',
  RO: '🇷🇴', BG: '🇧🇬', GR: '🇬🇷', LU: '🇱🇺', HR: '🇭🇷', SI: '🇸🇮',
  SK: '🇸🇰', EE: '🇪🇪', LV: '🇱🇻', LT: '🇱🇹', IS: '🇮🇸', CY: '🇨🇾',
}

// ============================================================
// FUZZY SEARCH avec scoring intelligent
// ============================================================

/**
 * Normalise une string pour la recherche :
 * - Retire accents (é → e)
 * - Lowercase
 * - Trim
 */
function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Recherche de villes avec scoring intelligent.
 *
 * Scoring (du meilleur au pire) :
 * - 1000 : match exact du nom
 * - 500+  : starts with query (bonus population)
 * - 200+  : contient query (bonus population)
 * - 100+  : match sur pays
 * - 50+   : match approximatif (permutation lettres)
 *
 * Retourne aussi les métadonnées pour l'UI (nombre d'étudiants).
 */
export function searchCities(query, limit = 15) {
  // Si pas de query, on retourne les top villes étudiantes
  if (!query || query.trim().length < 1) {
    return EUROPEAN_UNIVERSITY_CITIES
      .slice()
      .sort((a, b) => b.students - a.students)
      .slice(0, limit)
  }

  const q = normalizeString(query)

  const results = EUROPEAN_UNIVERSITY_CITIES
    .map((city) => {
      const nameNorm = normalizeString(city.name)
      const countryNorm = normalizeString(city.country)

      let score = 0

      if (nameNorm === q) {
        score = 10000
      } else if (nameNorm.startsWith(q)) {
        // Boost par nombre d'étudiants (plus important pour ton use case que population)
        score = 5000 + city.students * 2
      } else if (nameNorm.includes(q)) {
        score = 2000 + city.students
      } else if (countryNorm.startsWith(q)) {
        score = 500 + city.students
      } else if (countryNorm.includes(q)) {
        score = 100 + city.students / 2
      } else {
        // Fuzzy check : chaque lettre de q apparaît dans le nom
        const allLettersPresent = q.split('').every(ch => nameNorm.includes(ch))
        if (allLettersPresent && q.length >= 3) {
          score = 10 + city.students / 10
        }
      }

      return { ...city, _score: score }
    })
    .filter((c) => c._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)

  return results
}

/**
 * Vérifie si une ville existe déjà dans la liste (pour éviter les doublons custom)
 */
export function cityExists(cityName) {
  const q = normalizeString(cityName)
  return EUROPEAN_UNIVERSITY_CITIES.some(c => normalizeString(c.name) === q)
}