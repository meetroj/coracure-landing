import { DIRECTORY } from './directory.js'

/* Data layer for the inner pages. Every read the pages make goes through the functions below, so connecting a real
   source means changing this file only.

   Today NOTHING here is connected: the backend gives a public visitor no providers, availability, lab catalogue or
   PIN check (they need a patient login). While DEMO is true the provider and lab-catalogue reads return clearly
   ILLUSTRATIVE entries (pages label them); availability and serviceability report "not connected" and never invent
   an answer. With DEMO false the reads report the service as unavailable.
   ponytail: replace the bodies with calls to the public endpoints once they exist; keep the return shapes.

   Preview switches, for checking states without a backend (only while DEMO is true), add to any URL:
     ?demo=error         every read fails (error + retry states)
     ?demo=slots         the availability read returns slots (labelled illustrative; Continue still never confirms)
     ?demo=unavailable   the provider is not bookable
     ?demo=serviceable | unserviceable | pinerror    the PIN check answers (or fails on its own)
     ?demo=signedin      shows the signed-in state (header avatar, dashboard) for the session; there are no web accounts yet */

export const DEMO = true

const flag = () => new URLSearchParams(location.search).get('demo')
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms))
export const isUnavailable = (e) => Boolean(e?.unavailable)

async function gate() {
  await wait()
  if (flag() === 'error') throw new Error('The service did not respond.')
  if (!DEMO) throw Object.assign(new Error('Not connected.'), { unavailable: true })
}

const norm = (s) => s.toLowerCase()
const has = (hay, q) => norm(hay).includes(norm(q.trim()))

/* ---------------------------------- providers --------------------------------- */

export const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Kannada']
// ranges from the 16 Oct reference; a band is offered only when the data has someone in it
export const EXPERIENCE_BANDS = [['0-5', '0 – 5 years', 0, 5], ['6-10', '6 – 10 years', 6, 10], ['11-15', '11 – 15 years', 11, 15], ['16+', '16+ years', 16, Infinity]]
export const FEE_BANDS = [['lt500', 'Under ₹500', 0, 499], ['500-1000', '₹500 – ₹1,000', 500, 1000], ['gt1000', 'Above ₹1,000', 1001, Infinity]]
export const SORTS = [['relevance', 'Relevance'], ['experience', 'Experience: high to low'], ['fee', 'Fee: low to high']]

const inBand = (bands, id, n) => {
  const b = bands.find((x) => x[0] === id)
  return n !== null && Boolean(b) && n >= b[2] && n <= b[3]
}

// ILLUSTRATIVE values, not real people, qualifications or prices. Qualifications and registration are left empty on
// purpose: the pages show a dash for them.
const EXP = [3, 8, 13, 19, 6, 11, 4, 16]
const FEE = [400, 600, 800, 1200, 500, 1000, 700, 1500]
const ILLUSTRATIVE = Object.values(DIRECTORY).flatMap((d) =>
  d.specialties.flatMap((s) => {
    const seed = [...s.slug].reduce((n, c) => n + c.charCodeAt(0), 0)
    return Array.from({ length: 8 }, (_, i) => ({
      slug: `${s.slug}-${i + 1}`,
      name: `Illustrative provider ${i + 1}`,
      group: d.route, role: d.role, specialty: s.name, specialtySlug: s.slug,
      languages: [...new Set(['English', LANGUAGES[(seed + i) % 6], ...(i % 3 === 2 ? [LANGUAGES[(seed + i * 2 + 1) % 6]] : [])])],
      experience: EXP[i], fee: FEE[i], qualifications: null, registration: null, bookable: true,
    }))
  }),
)

const facetsOf = (scope) => ({
  languages: LANGUAGES.filter((l) => scope.some((p) => p.languages.includes(l))),
  experience: EXPERIENCE_BANDS.filter(([id]) => scope.some((p) => inBand(EXPERIENCE_BANDS, id, p.experience))),
  fee: FEE_BANDS.filter(([id]) => scope.some((p) => inBand(FEE_BANDS, id, p.fee))),
  specialties: [...new Map(scope.map((p) => [p.specialtySlug, p.specialty])).entries()],
})

const inScope = ({ group, specialty }) => ILLUSTRATIVE.filter((p) => (!group || p.group === group) && (!specialty || p.specialtySlug === specialty))

/** One page of a category's or specialty's providers. { unavailable: true } when the category has none to show. */
export async function searchProviders({ group, specialty, q = '', lang = [], exp = [], fee = [], spec = [], sort = 'relevance', limit = 5 }) {
  await gate()
  const scope = inScope({ group, specialty })
  if (!scope.length) return { unavailable: true }
  const any = (list, test) => !list.length || list.some(test)
  const items = scope
    .filter((p) => !q.trim() || has(p.name, q) || has(p.specialty, q))
    .filter((p) => any(lang, (l) => p.languages.includes(l)))
    .filter((p) => any(exp, (id) => inBand(EXPERIENCE_BANDS, id, p.experience)))
    .filter((p) => any(fee, (id) => inBand(FEE_BANDS, id, p.fee)))
    .filter((p) => any(spec, (s) => p.specialtySlug === s))
  if (sort === 'experience') items.sort((a, b) => b.experience - a.experience)
  if (sort === 'fee') items.sort((a, b) => a.fee - b.fee)
  return { items: items.slice(0, limit), total: items.length, facets: facetsOf(scope) }
}

export async function getProvider(slug) {
  await gate()
  const p = ILLUSTRATIVE.find((x) => x.slug === slug)
  return p ? { ...p, bookable: flag() !== 'unavailable' } : null
}

/* ------------------------------------ lab ------------------------------------- */

// ILLUSTRATIVE entries: names and wording follow the reference; no price, component, partner or turnaround is invented.
const make = (kind, label, summary) => Array.from({ length: 6 }, (_, i) => ({ slug: `sample-${kind}-${i + 1}`, kind, name: `${label} ${i + 1}`, summary, price: null }))
// The CBC entry's wording is the 16 Oct design reference's, supplied by the product owner; it is not from an approved catalogue yet.
const CBC = {
  slug: 'complete-blood-count-cbc', kind: 'test', name: 'Complete Blood Count (CBC)', price: null,
  summary: 'A routine test that evaluates your overall health and helps detect a variety of conditions.',
  about: 'This test evaluates your red blood cells, white blood cells and platelets. It provides useful information about your general health and can help in the initial assessment of a variety of conditions.',
  components: ['Haemoglobin (Hb)', 'Total Red Blood Cell Count (RBC)', 'Total White Blood Cell Count (WBC)', 'Platelet Count', 'Packed Cell Volume (PCV)', 'Mean Corpuscular Volume (MCV)', 'Mean Corpuscular Haemoglobin (MCH)', 'Mean Corpuscular Haemoglobin Concentration (MCHC)'],
  preparation: 'No special preparation is typically required for this test.',
  sample: 'A small sample of blood is collected from a vein in your arm.',
}
const CATALOGUE = [
  ...make('package', 'Sample package', 'Test components appear here.'),
  CBC,
  ...make('test', 'Sample test', 'Sample and preparation information appear here.'),
]

export const validPin = (s) => /^[1-9]\d{5}$/.test(s)

export async function searchCatalogue({ kind, q = '', limit = 3 }) {
  await gate()
  const items = CATALOGUE.filter((c) => c.kind === kind && (!q.trim() || has(c.name, q) || has(c.summary, q)))
  return { items: items.slice(0, limit), total: items.length }
}

export async function getCatalogueItem(slug) {
  await gate()
  return CATALOGUE.find((c) => c.slug === slug) ?? null
}

/** 'serviceable' | 'not_serviceable' | 'not_connected'. Never a guess: with no lab service connected it says so. */
export async function checkPin() {
  await gate()
  const f = flag()
  if (f === 'pinerror') throw new Error('The serviceability check did not respond.')
  if (f === 'serviceable') return { status: 'serviceable' }
  if (f === 'unserviceable') return { status: 'not_serviceable' }
  return { status: 'not_connected' }
}

/* -------------------------------- patient dashboard ---------------------------- */

/** { appointments: [], records: [] } for the signed-in patient. No web account exists, so there is nothing to list. */
export async function getDashboard() {
  await gate()
  return { appointments: [], records: [] }
}

/* ------------------------------ consultation search ---------------------------- */

const SERVICE_WORDS = /lab|test|package|blood|sample/i

/** Grouped matches for the Consultations search: specialties, providers and lab services. */
export async function searchAll(q) {
  await gate()
  const specialties = Object.values(DIRECTORY).flatMap((d) =>
    d.specialties.filter((s) => has(s.name, q) || has(d.title, q)).map((s) => ({ ...s, route: d.route, group: d.title })))
  const providers = ILLUSTRATIVE.filter((p) => has(p.name, q) || has(p.specialty, q))
  return {
    specialties,
    providers: providers.slice(0, 6),
    providerTotal: providers.length,
    labs: SERVICE_WORDS.test(q) || CATALOGUE.some((c) => has(c.name, q)),
  }
}

/** Suggestions while typing, from the specialty names only (no network), grouped by provider category. */
export function suggest(q) {
  if (!q.trim()) return []
  return Object.values(DIRECTORY)
    .map((d) => ({ group: d.title, items: d.specialties.filter((s) => has(s.name, q)).map((s) => ({ ...s, href: `/${d.route}/${s.slug}` })) }))
    .filter((g) => g.items.length)
}

/* ---------------------------------- availability ------------------------------- */

/** { status: 'not_connected' } | { status: 'ok', slots: [{ id, time: 'HH:MM' }] } (times in IST). */
export async function getAvailability(slug, date) {
  await gate()
  if (flag() !== 'slots') return { status: 'not_connected' }
  // ?demo=slots only: illustrative times, none on Sundays so the "no slots" state can be reached
  const sunday = new Date(`${date}T00:00:00Z`).getUTCDay() === 0
  const times = sunday ? [] : ['10:00', '10:30', '11:00', '11:30', '15:00', '15:30', '16:00', '19:00']
  return { status: 'ok', slots: times.map((t) => ({ id: `${date}T${t}`, time: t })) }
}
