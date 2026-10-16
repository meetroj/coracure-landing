import { GROUPS } from './site.js'

/* The provider directory's shape: route segment -> category -> specialties. Built from the homepage groups, so the
   names stay in one place. Names only: no provider data lives here (that is data.js). */

export const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// [route segment, homepage group id, breadcrumb label, specialties the 16 Oct reference adds to that group]
// ponytail: Psychiatry is on the reference but not in the 15 Oct catalogue list; confirm it with the live catalogue.
const DEFS = [
  ['specialties', 'specialty-doctors', 'Specialties', ['Psychiatry']],
  ['super-specialties', 'super-specialists', 'Super-specialties', []],
  ['paramedical', 'paramedical', 'Paramedical', []],
  ['pet-care', 'pet-care', 'Pet Care', []],
]

export const DIRECTORY = Object.fromEntries([
  ...DEFS.map(([route, id, crumb, extra]) => {
    const g = GROUPS.find((x) => x.id === id)
    const names = [...g.items.map(([, n]) => n), ...extra]
    return [route, { route, crumb, title: g.title, role: g.role, specialties: names.map((name) => ({ name, slug: slugify(name) })) }]
  }),
  // no dentist specialties exist in the approved catalogue yet: the directory reports the category as unavailable
  ['dentists', { route: 'dentists', crumb: 'Dentists', title: 'Dentists', role: 'Dentist', specialties: [] }],
])

export const groupHref = (route) => `/${route}`
export const specialtyHref = (route, slug) => `/${route}/${slug}`
