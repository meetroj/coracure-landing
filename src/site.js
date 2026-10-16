import { Activity, Apple, Baby, Bean, Brain, BrainCircuit, Hand, HeartPulse, PawPrint, Stethoscope, Users } from 'lucide-react'

/* Site-wide data shared by the homepage, the header/footer and the inner pages. */

// Every destination outside this page. null = not live yet: it shows as unavailable, never as a dead link.
// ponytail: paste each URL here when its page goes live; nothing else needs to change.
// login/signup fall back to the app download until web accounts and booking exist.
export const LINKS = {
  login: null, signup: null, consultations: '/consultations', labTests: '/lab-tests',
  about: null, careers: null, partner: null, support: null, dentists: '/dentists',
  specialties: '/specialties', superSpecialties: '/super-specialties', paramedical: '/paramedical', petCare: '/pet-care', // each group's directory
  profile: null, recConsultations: null, recPayments: null, recPrescriptions: null, recReports: null, // private: need login
  terms: null, privacy: null, refund: null, dataProtection: null, grievance: null,
  appStore: null, playStore: null, linkedin: null, instagram: null,
}
export const APP = '/#download'

// Provider cards are CONCEPT profiles until approved live provider data is connected: each card says so and shows
// no photo, name, qualification, experience or fee, and one notice above the first group repeats it.
// ponytail: switch to false to show "Coming soon" instead; real cards need a provider feed (GET /services/:id/providers
// needs a patient login today). Never put invented clinicians, fees or portraits here.
export const CONCEPT = true

// Category names come from the 15 Oct design reference (specialty / super-specialty) and the guide (paramedical, pet care).
// ponytail: confirm they match the live catalogue before launch.
export const GROUPS = [
  { id: 'specialty-doctors', tone: 'ivory', title: 'Specialty Doctors', blurb: 'Care across everyday medical specialties.',
    viewAll: LINKS.specialties, role: 'Doctor',
    items: [[Stethoscope, 'General Medicine'], [Hand, 'Dermatology'], [Baby, 'Paediatrics']] },
  { id: 'super-specialists', tone: 'sage', title: 'Super-Specialists', blurb: 'Focused care for advanced specialty needs.',
    viewAll: LINKS.superSpecialties, role: 'Doctor',
    items: [[HeartPulse, 'Cardiology'], [BrainCircuit, 'Neurology'], [Bean, 'Nephrology']] },
  { id: 'paramedical', tone: 'mint', title: 'Paramedical Services', blurb: 'Nutrition, movement and emotional wellbeing.',
    viewAll: LINKS.paramedical, role: 'Professional',
    items: [[Apple, 'Dietician'], [Brain, 'Psychologist'], [Users, 'Counsellor'], [Activity, 'Physiotherapist']] },
  { id: 'pet-care', title: 'Pet Care', blurb: 'Explore veterinary consultations for your pets.',
    viewAll: LINKS.petCare, role: 'Veterinarian',
    items: [[PawPrint, 'Veterinary care']] },
]
export const TABS = GROUPS.slice(0, 3)

export const CONSULT_MENU = [
  ['Doctors', LINKS.specialties],
  ['Dentists', LINKS.dentists],
  ['Veterinarians', LINKS.petCare],
  ['Paramedical Professionals', LINKS.paramedical],
]

export const FOOTER_COLS = [
  ['Patients', [
    ['Profile', [['Personal Details', LINKS.profile]]],
    ['Health Records', [['Consultations', LINKS.recConsultations], ['Payments', LINKS.recPayments], ['Prescriptions', LINKS.recPrescriptions], ['Reports', LINKS.recReports]]],
  ]],
  ['Help & Support', [
    [null, [['Terms & Conditions', LINKS.terms], ['Privacy Policy', LINKS.privacy], ['Refund', LINKS.refund], ['Data Protection', LINKS.dataProtection], ['Grievance Redressal', LINKS.grievance]]],
  ]],
  ['Contact Us', [
    [null, [['Support', LINKS.support]]],
    [null, [['Careers', LINKS.careers], ['Partner With Us', LINKS.partner]]],
  ]],
]
