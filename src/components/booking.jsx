import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, Dialog, ErrorState, LoadingSkeleton, inr, useAsync } from './ui.jsx'
import { loginHref, signupHref } from '../auth.js'
import { getAvailability } from '../data.js'
import { navigate } from '../router.jsx'
import { LINKS } from '../site.js'

/* Consultation availability: date, slots, fee, and the hand-off to the booking page. Dates are 'YYYY-MM-DD' in IST
   (Asia/Kolkata) and times 'HH:MM' in IST, shown in Indian conventions. Nothing here ever confirms an appointment:
   confirmation needs payment and an eligible doctor's acceptance, which happen after login. */

const TZ = 'Asia/Kolkata'
const pad = (n) => String(n).padStart(2, '0')
export const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })
const utc = (iso) => new Date(`${iso}T00:00:00Z`)
export const fmtDay = (iso) => utc(iso).toLocaleDateString('en-IN', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
export const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return `${pad(h % 12 || 12)}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
}
export const addDays = (iso, n) => new Date(utc(iso).getTime() + n * 864e5).toISOString().slice(0, 10)
export const SLOT_ID = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/ // a slot id is its IST date and time

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DateSelector({ value, onChange, min }) {
  const start = utc(value || min)
  const [month, setMonth] = useState({ y: start.getUTCFullYear(), m: start.getUTCMonth() })
  const first = new Date(Date.UTC(month.y, month.m, 1))
  const days = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate()
  const minMonth = utc(min)
  const atMin = month.y === minMonth.getUTCFullYear() && month.m === minMonth.getUTCMonth()
  const shift = (d) => setMonth(({ y, m }) => ({ y: y + Math.floor((m + d) / 12), m: (m + d + 12) % 12 }))
  const label = first.toLocaleDateString('en-IN', { timeZone: 'UTC', month: 'long', year: 'numeric' })
  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="icon-btn" aria-label="Previous month" disabled={atMin} onClick={() => shift(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
        <p className="cal-title" aria-live="polite">{label}</p>
        <button type="button" className="icon-btn" aria-label="Next month" onClick={() => shift(1)}><ChevronRight size={20} aria-hidden="true" /></button>
      </div>
      <div className="cal-grid" role="group" aria-label={`Choose a date, ${label}`}>
        {WEEKDAYS.map((d) => <span key={d} className="cal-dow" aria-hidden="true">{d}</span>)}
        {Array.from({ length: first.getUTCDay() }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const iso = `${month.y}-${pad(month.m + 1)}-${pad(i + 1)}`
          return (
            <button key={iso} type="button" className="cal-day" aria-label={fmtDay(iso)} aria-pressed={value === iso} data-today={iso === min ? '' : undefined} disabled={iso < min} onClick={() => onChange(iso)}>
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const SlotSelector = ({ slots, value, onChange, wide }) => (
  <div className={wide ? 'slots slots-wide' : 'slots'} role="group" aria-label="Available times">
    {slots.map((s) => (
      <button key={s.id} type="button" className="slot" aria-pressed={value === s.id} onClick={() => onChange(s.id)}>{fmtTime(s.time)}</button>
    ))}
  </div>
)

/** provider: { slug, name, fee, bookable }. */
export function AvailabilityPanel({ provider }) {
  const min = todayIST()
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const avail = useAsync(() => (date && provider.bookable ? getAvailability(provider.slug, date) : Promise.resolve(null)), `${provider.slug}|${date}|${provider.bookable}`)

  const slots = avail.status === 'ok' && avail.data?.status === 'ok' ? avail.data.slots : null
  // a slot that is not in the list that came back is not selected
  const chosen = slots?.find((s) => s.id === slot)
  const canContinue = Boolean(provider.bookable && date && chosen)

  // on to the booking page with the choice in the URL; the demo switch is carried so a preview stays a preview
  const next = () => {
    const q = new URLSearchParams({ date, slot })
    const demo = new URLSearchParams(location.search).get('demo')
    if (demo) q.set('demo', demo)
    navigate(`/book/${provider.slug}?${q}`)
  }

  let body
  if (!provider.bookable) body = <p className="slot-note">This provider is not taking online consultations right now.</p>
  else if (!date) body = <p className="slot-note">Select a date to see available times.</p>
  else if (avail.status === 'error') body = <ErrorState title="Availability could not be loaded" onRetry={avail.reload}>Try again in a moment.</ErrorState>
  else if (avail.status === 'loading') body = <LoadingSkeleton rows={2} variant="slots" />
  else if (avail.data?.status === 'not_connected') {
    body = (
      <div className="slot-box">
        <CalendarDays size={22} aria-hidden="true" />
        <p>Available slots appear here when connected.</p>
      </div>
    )
  } else if (!slots?.length) body = <p className="slot-note">No slots on {fmtDay(date)}. Try another date.</p>
  else body = <SlotSelector slots={slots} value={slot} onChange={setSlot} />

  return (
    <aside className="avail" id="availability" aria-labelledby="avail-title">
      <h2 id="avail-title" className="t-h2">Consultation availability</h2>
      <p className="avail-label">Select a date</p>
      <DateSelector value={date} min={min} onChange={(d) => { setDate(d); setSlot('') }} />
      <div className="slot-area" aria-live="polite" aria-busy={avail.status === 'loading'}>{body}</div>
      <p className="text-meta">Times are shown in IST (UTC+05:30).</p>
      {chosen && <p className="avail-chosen">Selected: {fmtDay(date)}, {fmtTime(chosen.time)} IST</p>}
      <dl className="avail-fee">
        <dt>Consultation fee</dt>
        <dd>{inr(provider.fee)}</dd>
      </dl>
      <p className="text-meta">For emergency purposes, consult nearby hospital.</p>
      <Button className="avail-go" disabled={!canContinue} onClick={next}>Continue</Button>
    </aside>
  )
}

/** The sign-in step of booking: keeps where the visitor was, so logging in returns them to this step. */
export function LoginGate({ open, onClose, summary }) {
  const to = location.pathname + location.search
  return (
    <Dialog open={open} onClose={onClose} labelledBy="gate-title" className="modal">
      <h2 id="gate-title" className="t-h2">Log in to continue</h2>
      {summary && <p className="avail-chosen">{summary}</p>}
      <p>You need a CoraCure account to go on to payment. Your provider, date and time stay in this page address, so you come back to this step after logging in. Your appointment is confirmed only after payment and an eligible doctor accepts it.</p>
      {!LINKS.login && <p className="text-support">Web accounts are not open yet, so Log in and Sign Up take you to the CoraCure app.</p>}
      <div className="modal-actions">
        <Button variant="secondary" href={loginHref(to)} onClick={onClose}>Log in</Button>
        <Button href={signupHref(to)} onClick={onClose}>Sign Up</Button>
      </div>
      <button type="button" className="link-btn" onClick={onClose}>Not now</button>
    </Dialog>
  )
}
