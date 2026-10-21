import { DIRECTORY } from './directory.js'
import * as live from './live.js'

/* Data layer for the provider, availability and lab pages. Every read goes to the live API through live.js (patient
   login required); nothing here is sample data. The constants are the filter options the pages offer. */

export const isUnavailable = (e) => Boolean(e?.unavailable)

export const LANGUAGES = ['English', 'Hindi', 'Hinglish', 'Marathi', 'Kannada', 'Tamil', 'Telugu', 'Bengali']
export const EXPERIENCE_BANDS = [['0-5', '0 – 5 years', 0, 5], ['6-10', '6 – 10 years', 6, 10], ['11-15', '11 – 15 years', 11, 15], ['16+', '16+ years', 16, Infinity]]
export const FEE_BANDS = [['lt500', 'Under ₹500', 0, 499], ['500-1000', '₹500 – ₹1,000', 500, 1000], ['gt1000', 'Above ₹1,000', 1001, Infinity]]
export const SORTS = [['relevance', 'Relevance'], ['experience', 'Experience: high to low'], ['fee', 'Fee: low to high']]
export const validPin = (s) => /^[1-9]\d{5}$/.test(s)

export const { searchProviders, getProvider, searchAll, getAvailability, searchCatalogue, getCatalogueItem, checkPin } = live

/** Suggestions while typing, from the directory's specialty names only (no network), grouped by provider category. */
export function suggest(q) {
  const n = q.trim().toLowerCase()
  if (!n) return []
  return Object.values(DIRECTORY)
    .map((d) => ({ group: d.title, items: d.specialties.filter((s) => s.name.toLowerCase().includes(n)).map((s) => ({ ...s, href: `/${d.route}/${s.slug}` })) }))
    .filter((g) => g.items.length)
}
