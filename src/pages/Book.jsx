import { useId, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Info, UserRound } from 'lucide-react'
import { Breadcrumbs, Button, EmptyState, ErrorState, LoadingSkeleton, PageHeading, inr, useAsync } from '../components/ui.jsx'
import { LoginGate, SLOT_ID, SlotSelector, addDays, fmtDay, fmtTime, todayIST } from '../components/booking.jsx'
import { loginHref, useSession } from '../auth.js'
import { LANGUAGES, getAvailability, getProvider, isUnavailable } from '../data.js'
import { AreaPage, LoginPrompt } from '../components/patient.jsx'
import { Link, navigate, useSearchParams } from '../router.jsx'

/* /book/{provider}: the three booking steps (Consultation, Patient details, Review). The choice lives in the query
   string (?date= &slot= &step=), so Back works and a login can return to the same step.
   Nothing here books anything: payment and the doctor's acceptance are not connected, and the last step says so. */

const STEPS = ['Consultation', 'Patient details', 'Review']
const PARTS = [['Morning', (h) => h < 12], ['Afternoon', (h) => h >= 12 && h < 17], ['Evening', (h) => h >= 17]]
const DATE = /^\d{4}-\d{2}-\d{2}$/

function setQuery(patch, { replace = true } = {}) {
  const next = new URLSearchParams(location.search)
  for (const [k, v] of Object.entries(patch)) {
    if (v) next.set(k, v)
    else next.delete(k)
  }
  const qs = next.toString()
  navigate(location.pathname + (qs ? `?${qs}` : ''), { replace })
}

const dayParts = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`)
  const f = (o) => d.toLocaleDateString('en-IN', { timeZone: 'UTC', ...o })
  return [f({ weekday: 'short' }), f({ day: 'numeric', month: 'short' })]
}

function Stepper({ step }) {
  return (
    <ol className="stepper" aria-label="Booking steps">
      {STEPS.map((label, i) => (
        <li key={label} aria-current={step === i + 1 ? 'step' : undefined} data-state={step > i + 1 ? 'done' : step === i + 1 ? 'now' : 'todo'}>
          <span className="step-dot">{step > i + 1 ? <Check size={16} aria-hidden="true" /> : i + 1}</span>
          <span className="step-label">{label}</span>
        </li>
      ))}
    </ol>
  )
}

// seven days at a time from today, with arrows for the weeks after
function WeekStrip({ value, min, onChange }) {
  const [week, setWeek] = useState(() => Math.max(0, Math.floor((new Date(`${value}T00:00:00Z`) - new Date(`${min}T00:00:00Z`)) / (7 * 864e5))))
  const days = Array.from({ length: 7 }, (_, i) => addDays(min, week * 7 + i))
  return (
    <div className="week">
      <button type="button" className="icon-btn" aria-label="Previous week" disabled={week === 0} onClick={() => setWeek(week - 1)}><ChevronLeft size={20} aria-hidden="true" /></button>
      <div className="week-days" role="group" aria-label="Choose a date">
        {days.map((iso) => {
          const [wd, md] = dayParts(iso)
          return (
            <button key={iso} type="button" className="wday" aria-pressed={value === iso} aria-label={fmtDay(iso)} onClick={() => onChange(iso)}>
              <span>{wd}</span><strong>{md}</strong>
            </button>
          )
        })}
      </div>
      <button type="button" className="icon-btn" aria-label="Next week" onClick={() => setWeek(week + 1)}><ChevronRight size={20} aria-hidden="true" /></button>
    </div>
  )
}

function Field({ label, error, children }) {
  const id = useId()
  return (
    <div className="pf-field">
      <label htmlFor={id}>{label}</label>
      {children(id, error ? `${id}-err` : undefined)}
      {error && <p id={`${id}-err`} className="field-error field-help" role="alert">{error}</p>}
    </div>
  )
}

const validate = (d) => {
  const e = {}
  if (!d.name.trim()) e.name = 'Enter the patient’s full name.'
  if (!/^[6-9]\d{9}$/.test(d.mobile)) e.mobile = 'Enter a 10-digit mobile number.'
  if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter a valid email address.'
  if (!d.dob) e.dob = 'Enter the date of birth.'
  else if (d.dob > todayIST()) e.dob = 'Date of birth cannot be in the future.'
  if (!d.sex) e.sex = 'Choose one.'
  return e
}

export default function Book({ slug }) {
  const [params] = useSearchParams()
  const { signedIn } = useSession()
  const r = useAsync(() => getProvider(slug), slug)
  const p = r.data

  const min = todayIST()
  const date = DATE.test(params.get('date') ?? '') && params.get('date') >= min ? params.get('date') : min
  const m = SLOT_ID.exec(params.get('slot') ?? '')
  const slot = m && m[1] === date ? params.get('slot') : ''
  const time = slot ? m[2] : ''
  const step = slot ? Math.min(3, Math.max(1, Number(params.get('step')) || 1)) : 1

  const avail = useAsync(() => (p?.bookable ? getAvailability(slug, date) : Promise.resolve(null)), `${slug}|${date}|${p?.bookable}`)
  const slots = avail.status === 'ok' && avail.data?.status === 'ok' ? avail.data.slots : null
  const chosen = slots?.find((s) => s.id === slot)
  const gone = step > 1 && Boolean(slots) && !chosen // the time was taken while the visitor filled in details

  const [details, setDetails] = useState({ name: '', mobile: '', email: '', dob: '', sex: '', language: '' })
  const [errors, setErrors] = useState({})
  const [gate, setGate] = useState(false)
  const [note, setNote] = useState(false)
  const set = (k) => (e) => setDetails({ ...details, [k]: e.target.value })
  const here = location.pathname + location.search

  const submit = (e) => {
    e.preventDefault()
    const found = validate(details)
    setErrors(found)
    if (!Object.keys(found).length) setQuery({ step: '3' }, { replace: false })
  }

  if (r.status === 'error' || r.status === 'loading' || !p) {
    let body
    if (r.status === 'error') {
      body = r.error?.loginRequired ? <LoginPrompt what="booking" />
        : isUnavailable(r.error)
        ? <EmptyState title="Booking is not available yet" action={<Button href="/consultations">Browse consultations</Button>}>Booking opens once approved provider data is connected.</EmptyState>
        : <ErrorState title="This page could not be loaded" onRetry={r.reload} />
    } else if (r.status === 'loading') body = <LoadingSkeleton rows={3} />
    else body = <EmptyState title="Provider not found" action={<Button href="/consultations">Browse consultations</Button>}>This provider does not exist or is no longer listed.</EmptyState>
    return (
      <AreaPage bg="profile" title="Book your online consultation" back={[`/providers/${slug}`, 'Back to provider']}>
        <Breadcrumbs items={[['Home', '/'], ['Consultations', '/consultations'], ['Book']]} />
        {body}
      </AreaPage>
    )
  }

  const goStep = { 1: () => setQuery({ step: '2' }, { replace: false }), 2: null, 3: () => (signedIn ? setNote(true) : setGate(true)) }[step]
  const canContinue = p.bookable && Boolean(chosen) && !gone

  let slotBody
  if (!p.bookable) slotBody = <p className="slot-note">This provider is not taking online consultations right now.</p>
  else if (avail.status === 'error') slotBody = <ErrorState title="Availability could not be loaded" onRetry={avail.reload}>Try again in a moment.</ErrorState>
  else if (avail.status === 'loading') slotBody = <LoadingSkeleton rows={2} variant="slots" />
  else if (avail.data?.status === 'not_connected') slotBody = <div className="slot-box"><p>Available slots appear here when connected.</p></div>
  else if (!slots?.length) slotBody = <p className="slot-note">No slots on {fmtDay(date)}. Try another date.</p>
  else {
    slotBody = PARTS.map(([label, test]) => {
      const list = slots.filter((s) => test(Number(s.time.slice(0, 2))))
      return list.length ? (
        <div key={label} className="slot-part">
          <h3 className="slot-part-title">{label}</h3>
          <SlotSelector wide slots={list} value={slot} onChange={(id) => setQuery({ slot: id })} />
        </div>
      ) : null
    })
  }

  return (
    <AreaPage bg="profile" title="Book your online consultation" back={[`/providers/${slug}`, 'Back to provider']}>
      <Breadcrumbs items={[['Home', '/'], ['Consultations', '/consultations'], [p.name, `/providers/${p.slug}`], ['Book']]} />
      <PageHeading title="Book your online consultation">Get expert medical advice from qualified doctors, anytime, anywhere.</PageHeading>
      <Stepper step={step} />

      <div className="book">
        <div className="book-main">
          {step === 1 && (
            <>
              <section className="bcard" aria-labelledby="dt-title">
                <h2 id="dt-title" className="t-card">Choose a date and time</h2>
                <p className="text-support">Select a convenient date and time for your consultation. All times are in Indian Standard Time (IST).</p>
                <WeekStrip value={date} min={min} onChange={(d) => setQuery({ date: d, slot: '', step: '' })} />
                <div className="slot-area" aria-live="polite" aria-busy={avail.status === 'loading'}>{slotBody}</div>
              </section>
              {!signedIn && (
                <section className="bcard signin-card" aria-label="Patient details">
                  <div>
                    <h2 className="t-card">Patient details</h2>
                    <p className="text-support">Have an account? Sign in to fill your details quickly.</p>
                  </div>
                  <Link href={loginHref(here)} className="signin-link">Sign in <ArrowRight size={16} aria-hidden="true" /></Link>
                </section>
              )}
            </>
          )}

          {gone && (
            <div className="state state-error" role="alert">
              <h2 className="t-card">That time is no longer available</h2>
              <p>Please choose another time.</p>
              <Button variant="secondary" onClick={() => setQuery({ slot: '', step: '' })}>Choose another time</Button>
            </div>
          )}

          {step === 2 && !gone && (
            <form id="patient-form" className="bcard" onSubmit={submit} noValidate aria-labelledby="pd-title">
              <h2 id="pd-title" className="t-card">Patient details</h2>
              <p className="text-support">
                {signedIn ? 'Your saved details will be filled in here once your account is connected.' : 'Enter the details of the person who will have the consultation.'}
                {!signedIn && <> Have an account? <Link href={loginHref(here)} className="inline-link">Sign in</Link>.</>}
              </p>
              <div className="pf-grid">
                <Field label="Full name" error={errors.name}>{(id, err) => <input id={id} value={details.name} onChange={set('name')} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={err} />}</Field>
                <Field label="Mobile number" error={errors.mobile}>{(id, err) => <input id={id} value={details.mobile} onChange={(e) => setDetails({ ...details, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" aria-invalid={Boolean(errors.mobile)} aria-describedby={err} />}</Field>
                <Field label="Email address (optional)" error={errors.email}>{(id, err) => <input id={id} type="email" value={details.email} onChange={set('email')} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={err} />}</Field>
                <Field label="Date of birth" error={errors.dob}>{(id, err) => <input id={id} type="date" max={min} value={details.dob} onChange={set('dob')} autoComplete="bday" aria-invalid={Boolean(errors.dob)} aria-describedby={err} />}</Field>
                <Field label="Sex" error={errors.sex}>{(id, err) => (
                  <select id={id} value={details.sex} onChange={set('sex')} aria-invalid={Boolean(errors.sex)} aria-describedby={err}>
                    <option value="">Select</option><option>Female</option><option>Male</option><option>Other</option>
                  </select>
                )}</Field>
                <Field label="Preferred language (optional)">{(id) => (
                  <select id={id} value={details.language} onChange={set('language')}>
                    <option value="">Select</option>{LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                )}</Field>
              </div>
              <Button variant="secondary" className="pf-back" onClick={() => setQuery({ step: '' }, { replace: false })}><ChevronLeft size={18} aria-hidden="true" />Back</Button>
            </form>
          )}

          {step === 3 && !gone && (
            <section className="bcard" aria-labelledby="rv-title">
              <h2 id="rv-title" className="t-card">Review your request</h2>
              <dl className="facts facts-stack">
                <div><dt>Provider</dt><dd>{p.name}, {p.specialty}</dd></div>
                <div><dt>Date and time</dt><dd>{fmtDay(date)}, {fmtTime(time)} IST</dd></div>
                <div><dt>Mode</dt><dd>Online consultation</dd></div>
                <div><dt>Patient</dt><dd>{details.name || '-'}{details.sex && `, ${details.sex}`}</dd></div>
                <div><dt>Mobile</dt><dd>{details.mobile || '-'}</dd></div>
                {details.email && <div><dt>Email</dt><dd>{details.email}</dd></div>}
                {details.language && <div><dt>Language</dt><dd>{details.language}</dd></div>}
              </dl>
              <p className="text-support">After payment, eligible doctors are asked to accept your request. Your appointment is confirmed only when one accepts; until then it is pending.</p>
              {note && <p className="state state-error note" role="alert">Payment is not connected yet, so this request cannot be made. Nothing has been booked or charged.</p>}
              <div className="rv-actions">
                <Button variant="secondary" onClick={() => setQuery({ step: '2' }, { replace: false })}><ChevronLeft size={18} aria-hidden="true" />Back</Button>
                <Button variant="secondary" onClick={() => setQuery({ step: '' }, { replace: false })}>Change time</Button>
              </div>
            </section>
          )}
        </div>

        <aside className="sum-card" aria-labelledby="sum-title">
          <h2 id="sum-title" className="t-card">Consultation summary</h2>
          <div className="sum-provider">
            <span className="avatar sum-avatar"><UserRound size={24} aria-hidden="true" /></span>
            <div>
              <p className="text-meta">Selected provider</p>
              <p className="sum-name">{p.name}</p>
              <p className="text-meta">{p.specialty} · Online consultation</p>
            </div>
          </div>
          {chosen || (step > 1 && slot) ? <p className="avail-chosen">{fmtDay(date)}, {fmtTime(chosen?.time ?? time)} IST</p> : null}
          <dl className="sum-fee">
            <dt>Consultation fee</dt>
            <dd>{inr(p.fee)}</dd>
          </dl>
          {p.fee !== null && <p className="text-meta">This fee will be charged before the consultation.</p>}
          <Button className="sum-go" disabled={step === 1 ? !canContinue : gone} type={step === 2 ? 'submit' : 'button'} form={step === 2 ? 'patient-form' : undefined} onClick={goStep ?? undefined}>
            {step === 3 ? 'Continue to payment' : 'Continue'}
          </Button>
          <p className="advisory"><Info size={18} aria-hidden="true" />For emergency purposes, consult nearby hospital.</p>
        </aside>
      </div>

      <LoginGate open={gate} onClose={() => setGate(false)} summary={`${p.name}: ${fmtDay(date)}, ${fmtTime(time)} IST`} />
    </AreaPage>
  )
}
