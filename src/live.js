import { api, hasSession } from './api.js'
import { DIRECTORY, slugify } from './directory.js'

/* The live data layer behind data.js. Every provider, lab and slot endpoint the backend has is patient-only, so a visitor who is
   not signed in gets `loginRequired` and the pages ask them to log in.
   Endpoints (all /api/v1): GET /services, /services/:id/providers, /providers/:id, /providers/:id/available-times,
   /me/lab/tests, /me/lab/categories, POST /me/lab/quote, GET /pincode/:code. */

export const loginRequired = () => Object.assign(new Error('Log in to see this.'), { unavailable: true, loginRequired: true })
const need = () => { if (!hasSession()) throw loginRequired() }

// specialty name -> service id (the directory's names are the catalogue's names)
let services
const loadServices = () => (services ??= api('/services').catch((e) => { services = undefined; throw e }))
const byName = async () => new Map((await loadServices()).map((s) => [slugify(s.name), s]))

const TZ = 'Asia/Kolkata'
const istDate = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
const istTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })

const LANG_NAME = { en: 'English', hi: 'Hindi', hinglish: 'Hinglish', mr: 'Marathi', kn: 'Kannada', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', gu: 'Gujarati', ml: 'Malayalam', pa: 'Punjabi' }
const langs = (l) => (l ?? []).map((c) => LANG_NAME[c] ?? c)
const LANG_CODE = Object.fromEntries(Object.entries(LANG_NAME).map(([c, n]) => [n, c]))

const groupOfSpecialty = (name) => Object.values(DIRECTORY).find((d) => d.specialties.some((s) => s.slug === slugify(name)))

const toProvider = (p) => {
  const d = groupOfSpecialty(p.specialtyName)
  return {
    slug: p.id, name: p.fullName, group: d?.route ?? 'specialties', role: d?.role ?? 'Doctor',
    specialty: p.specialtyName, specialtySlug: slugify(p.specialtyName), specialtyId: p.specialtyId,
    languages: langs(p.languages), experience: p.yearsOfExperience, fee: p.consultationFeeInr,
    qualifications: p.qualification, registration: p.registrationNumber ?? null, bio: p.bio ?? p.bioSnippet ?? null,
    bookable: p.bookable ?? true, notBookableReason: p.notBookableReason ?? null, photoUrl: p.photoUrl ?? null,
  }
}

/* ---------------- providers ---------------- */

const EXP = { '0-5': [0], '6-10': [6], '11-15': [11], '16+': [16] }
const FEE = { lt500: [undefined, 499], '500-1000': [500, 1000], gt1000: [1001, undefined] }
const SORT = { experience: 'experience', fee: 'fee_low' }

export async function searchProviders({ group, specialty, q = '', lang = [], exp = [], fee = [], spec = [], sort = 'relevance', limit = 5 }) {
  need()
  const map = await byName()
  const dirs = Object.values(DIRECTORY).filter((d) => !group || d.route === group)
  let names = dirs.flatMap((d) => d.specialties).filter((s) => !specialty || s.slug === specialty).filter((s) => !spec.length || spec.includes(s.slug))
  names = names.filter((s) => map.has(s.slug))
  if (!names.length) return { unavailable: true }
  const params = {
    ...(q.trim() && { search: q.trim() }),
    ...(lang.length && { languages: lang.map((l) => LANG_CODE[l] ?? l).join(',') }),
    ...(exp.length && { minExperienceYears: Math.min(...exp.flatMap((id) => EXP[id] ?? [0])) }),
    ...(fee.length && { minFeeInr: Math.min(...fee.map((id) => FEE[id]?.[0] ?? 0)) }),
    ...(fee.length && !fee.some((id) => FEE[id]?.[1] === undefined) && { maxFeeInr: Math.max(...fee.map((id) => FEE[id][1])) }),
    ...(SORT[sort] && { sort: SORT[sort] }),
    limit: Math.min(limit, 50),
  }
  const pages = await Promise.all(names.map((s) => api(`/services/${map.get(s.slug).id}/providers`, { query: params })))
  let items = pages.flatMap((p) => p.items.map(toProvider))
  if (names.length > 1) { // several specialties: merge, then re-sort and cut to the page
    if (sort === 'experience') items.sort((a, b) => (b.experience ?? 0) - (a.experience ?? 0))
    if (sort === 'fee') items.sort((a, b) => (a.fee ?? 0) - (b.fee ?? 0))
    items = items.slice(0, limit)
  }
  const total = pages.reduce((n, p) => n + p.total, 0)
  const lo = pages.flatMap((p) => p.filterOptions?.languages ?? [])
  const feeR = pages.map((p) => p.filterOptions?.feeRange).filter(Boolean)
  const expR = pages.map((p) => p.filterOptions?.experienceRange).filter(Boolean)
  return {
    items, total,
    facets: {
      languages: [...new Set(lo)].map((c) => LANG_NAME[c] ?? c),
      experience: [['0-5', '0 – 5 years', 0, 5], ['6-10', '6 – 10 years', 6, 10], ['11-15', '11 – 15 years', 11, 15], ['16+', '16+ years', 16, Infinity]].filter(([, , a, b]) => expR.some((r) => r.max >= a && r.min <= b)),
      fee: [['lt500', 'Under ₹500', 0, 499], ['500-1000', '₹500 – ₹1,000', 500, 1000], ['gt1000', 'Above ₹1,000', 1001, Infinity]].filter(([, , a, b]) => feeR.some((r) => r.max >= a && r.min <= b)),
      specialties: dirs.flatMap((d) => d.specialties).filter((s) => map.has(s.slug)).map((s) => [s.slug, s.name]),
    },
  }
}

export async function getProvider(slug) {
  need()
  try {
    return toProvider(await api(`/providers/${slug}`))
  } catch (e) {
    if (e.status === 404 || e.status === 400) return null // no such provider (or an id that is not one)
    throw e
  }
}

/** { status: 'ok', slots: [{ id: 'YYYY-MM-DDTHH:MM', time: 'HH:MM' }] } in IST, or { status: 'ok', slots: [] }. */
export async function getAvailability(slug, date) {
  need()
  const r = await api(`/providers/${slug}/available-times`, { query: { date } })
  const slots = (r.times ?? []).filter((t) => istDate(t) === date).map((t) => ({ id: `${date}T${istTime(t)}`, time: istTime(t), startsAt: t }))
  return { status: 'ok', slots }
}

/** Grouped matches for the Consultations search. Specialties need no login; providers do (from the search text). */
export async function searchAll(q) {
  const norm = q.trim().toLowerCase()
  const specialties = Object.values(DIRECTORY).flatMap((d) => d.specialties.filter((s) => s.name.toLowerCase().includes(norm) || d.title.toLowerCase().includes(norm)).map((s) => ({ ...s, route: d.route, group: d.title })))
  let providers = []
  let total = 0
  if (hasSession()) {
    const map = await byName()
    const hit = specialties.filter((s) => map.has(s.slug)).slice(0, 3)
    const pages = await Promise.all(hit.map((s) => api(`/services/${map.get(s.slug).id}/providers`, { query: { limit: 6 } }).catch(() => ({ items: [], total: 0 }))))
    providers = pages.flatMap((p) => p.items.map(toProvider)).slice(0, 6)
    total = pages.reduce((n, p) => n + p.total, 0)
  }
  return { specialties, providers, providerTotal: total, labs: /lab|test|package|blood|sample/i.test(q) }
}

/* ---------------- lab catalogue ---------------- */

const toTest = (t) => ({ slug: t.id, kind: 'test', name: t.name, summary: t.description ?? `${t.sampleType ?? 'Test'}${t.turnaroundHours ? ` · report in about ${t.turnaroundHours} hours` : ''}`, price: t.priceInr, about: t.description, components: null, preparation: t.preparation, sample: t.sampleType, code: t.code })

export async function searchCatalogue({ kind, q = '', limit = 3 }) {
  need()
  if (kind !== 'test') return { items: [], total: 0 } // the patient API lists tests; packages are not exposed to patients yet
  const r = await api('/me/lab/tests', { query: { ...(q.trim() && { search: q.trim().slice(0, 100) }), limit: Math.min(limit, 100) } })
  return { items: r.items.map(toTest), total: r.total }
}

export async function getCatalogueItem(slug) {
  need()
  if (!/^[0-9a-f-]{36}$/i.test(slug)) return null
  const r = await api('/me/lab/tests', { query: { limit: 100 } }) // the API has no single-test read: find it in the catalogue
  const t = r.items.find((x) => x.id === slug)
  return t ? toTest(t) : null
}

/** 'serviceable' | 'not_serviceable', from the same quote the order uses. */
export async function checkPin(pin, testId) {
  need()
  // no test given (the list page's general check): any one test on sale stands in for "can a lab come to this PIN"
  testId ??= (await api('/me/lab/tests', { query: { limit: 1 } })).items[0]?.id
  if (!testId) return { status: 'not_connected' }
  const r = await api('/me/lab/quote', { method: 'POST', body: { testIds: [testId], pinCode: pin } })
  return { status: r.serviceable ? 'serviceable' : 'not_serviceable' }
}
