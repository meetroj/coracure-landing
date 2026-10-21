import { useEffect, useState } from 'react'
import logo from '../assets/logo/coracure-wide.svg'
import logoWhite from '../assets/logo/coracure-wide-white.svg'
import { ArrowLeft, CalendarDays, FileText, FlaskConical, House, Menu, Settings, Stethoscope, UserRound, X } from 'lucide-react'
import { Button, Dialog, EmptyState, Page, useAsync } from './ui.jsx'
import { MaybeLink } from './layout.jsx'
import { StatusBadge } from './forms.jsx'
import { listServices } from '../account.js'
import { loginHref, signupHref, useSession } from '../auth.js'
import { Link, useUrl } from '../router.jsx'
import { LINKS } from '../site.js'

/* The signed-in area's shell (dashboard, profile, health records): the account navigation on the right on desktop,
   an Account drawer on phones and tablets, and a login prompt for a visitor who is not signed in. */

// [icon, label, href, match]; a null href = the page is not built yet and shows as unavailable
const NAV = [
  [House, 'Dashboard', '/dashboard'],
  [Stethoscope, 'Consultations', LINKS.consultations],
  [FlaskConical, 'Lab Tests', LINKS.labTests],
  [CalendarDays, 'Appointments', '/health-records?tab=consultations'],
  [FileText, 'Health Records', '/health-records'],
  [UserRound, 'Profile', '/profile'],
  [Settings, 'Settings', '/settings'],
]

function AccountNav({ onNavigate, label = 'Account' }) {
  const { pathname } = useUrl()
  const inConsult = /^\/(specialties|super-specialties|paramedical|pet-care|dentists|providers|book)(\/|$)/.test(pathname)
  const here = (href) => (href === LINKS.consultations && inConsult) || (href && !href.includes('?') && (href === pathname || (href !== '/dashboard' && pathname.startsWith(`${href}/`))))
  return (
    <nav aria-label={label}>
      <ul>
        {NAV.map(([Icon, text, href]) => (
          <li key={text}>
            <MaybeLink href={href} onClick={onNavigate} aria-current={here(href) ? 'page' : undefined}><Icon size={20} aria-hidden="true" />{text}</MaybeLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Shown where a page needs a patient login (the live API gives providers, slots and the lab catalogue to patients only). */
export function LoginPrompt({ what = 'this' }) {
  const { pathname, search } = useUrl()
  const back = pathname + search
  return (
    <EmptyState icon={UserRound} title={`Log in to see ${what}`} action={
      <div className="modal-actions">
        <Button variant="secondary" href={loginHref(back)}>Log in</Button>
        <Button href={signupHref(back)}>Sign Up</Button>
      </div>
    }>
      It takes a mobile number and a one-time code. You will come back to this page afterwards.
    </EmptyState>
  )
}

/** A page that is public for visitors and part of the patient area once signed in (consultations, lab tests, providers,
    booking): signed in it sits inside the account layout with the left menu; signed out it is the ordinary public page. */
export function AreaPage({ bg, title, back, children }) {
  const { signedIn } = useSession()
  // back = [href, label]: a way out of a page that was opened from another one (the breadcrumb trail is hidden here)
  const top = back && <Link href={back[0]} className="back-link"><ArrowLeft size={18} aria-hidden="true" />{back[1]}</Link>
  return signedIn ? <PatientShell title={title}>{top}{children}</PatientShell> : <Page bg={bg} title={title}>{children}</Page>
}

/** The page frame for every signed-in route. `title` is the tab title; the page puts its own <h1> in children. */
export function PatientShell({ title, children }) {
  const { signedIn } = useSession()
  const { pathname, search } = useUrl()
  const [open, setOpen] = useState(false)
  // signed in, the site header is replaced by the logo at the top of the account menu (CSS hides .header under .in-area)
  useEffect(() => {
    if (!signedIn) return undefined
    document.documentElement.classList.add('in-area')
    return () => document.documentElement.classList.remove('in-area')
  }, [signedIn])
  if (!signedIn) {
    const back = pathname + search
    return (
      <Page bg="plain" title={title}>
        <EmptyState icon={UserRound} title="Log in to continue" action={
          <div className="modal-actions">
            <Button variant="secondary" href={loginHref(back)}>Log in</Button>
            <Button href={signupHref(back)}>Sign Up</Button>
          </div>
        }>
          Your consultations, lab tests and health records are private, so we ask you to log in first. You will come back to this page afterwards.
        </EmptyState>
      </Page>
    )
  }
  return (
    <Page bg="plain" title={title} wide>
      <div className="dash">
        <div className="dash-main">
          <div className="area-top">
            <Link href="/dashboard" className="area-logo"><img className="logo-light" src={logo} alt="CoraCure, a healthier connection" width="160" height="40" /><img className="logo-dark" src={logoWhite} alt="" aria-hidden="true" width="160" height="40" /></Link>
            <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="Account menu"><Menu size={22} aria-hidden="true" /></button>
          </div>
          {children}
        </div>
        <div className="dnav">
          <AccountNav />
        </div>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="acct-drawer-t" className="drawer drawer-side">
        <div className="drawer-head">
          <h2 id="acct-drawer-t" className="t-card">Your account</h2>
          <button type="button" className="icon-btn" aria-label="Close account menu" onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="drawer-body dnav dnav-drawer"><AccountNav label="Account (menu)" onNavigate={() => setOpen(false)} /></div>
      </Dialog>
    </Page>
  )
}

/* ---------- formatting and status words, shared by the signed-in pages ---------- */

const IST = { timeZone: 'Asia/Kolkata' }
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { ...IST, day: 'numeric', month: 'short', year: 'numeric' }) : '-')
export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { ...IST, hour: 'numeric', minute: '2-digit' }) : '')
export const fmtDateTime = (iso) => (iso ? `${fmtDate(iso)}, ${fmtTime(iso)}` : '-')
export const dayMonth = (iso) => {
  const d = new Date(iso)
  return [d.toLocaleDateString('en-IN', { ...IST, day: 'numeric' }), d.toLocaleDateString('en-IN', { ...IST, month: 'short' })]
}
export function daypart() {
  const h = Number(new Date().toLocaleString('en-GB', { ...IST, hour: 'numeric', hour12: false }))
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
export const firstName = (name) => (name ? name.trim().split(/\s+/)[0] : '')

const CONSULT = {
  pending_payment: ['pending', 'Payment Pending'],
  awaiting_doctor: ['pending', 'Awaiting Doctor Acceptance'], // never "Confirmed" before a doctor accepts
  scheduled: ['success', 'Confirmed'],
  in_progress: ['success', 'In Progress'],
  awaiting_documentation: ['success', 'Completed'],
  completed: ['success', 'Completed'],
  cancelled: ['error', 'Cancelled'],
  no_show: ['error', 'Missed'],
  expired: ['neutral', 'Expired'],
}
const LAB = {
  payment_pending: ['pending', 'Payment Pending'],
  confirming_collection: ['pending', 'Awaiting lab confirmation'],
  collection_confirmed: ['success', 'Collection Confirmed'],
  collection_scheduled: ['success', 'Collection Scheduled'],
  sample_collected: ['success', 'Sample Collected'],
  processing: ['pending', 'Processing'],
  report_ready: ['success', 'Report Ready'],
  completed: ['success', 'Completed'],
  cancelled: ['error', 'Cancelled'],
  refunded: ['neutral', 'Refunded'],
}
const PAYMENT = { paid: ['success', 'Paid'], created: ['pending', 'Pending'], pending: ['pending', 'Pending'], failed: ['error', 'Failed'], refunded: ['neutral', 'Refunded'] }

const badge = (map, key) => {
  const [tone, text] = map[key] ?? ['neutral', String(key ?? 'Unknown').replace(/_/g, ' ')]
  return <StatusBadge tone={tone}>{text}</StatusBadge>
}
export const consultBadge = (status) => badge(CONSULT, status)
export const labBadge = (status) => badge(LAB, status)
export const paymentBadge = (status) => badge(PAYMENT, status)

/** Opens a private file in a new tab. The tab is opened first (a popup opened after a request is blocked), then pointed at the signed, expiring link. */
export async function openLink(getLink) {
  const win = window.open('', '_blank')
  try {
    const { url } = await getLink()
    if (win) {
      win.opener = null
      win.location.href = url
    } else location.assign(url)
  } catch (e) {
    win?.close()
    throw e
  }
}

/** id → name for specialties, so a consultation can say "Dermatology". Empty while loading or if it fails. */
export function useSpecialties() {
  const r = useAsync(() => listServices().catch(() => []), 'services')
  return new Map((r.data ?? []).map((s) => [s.id, s.name]))
}
