import { useEffect, useState } from 'react'
import { LocateFixed, MailCheck, MapPin, X } from 'lucide-react'
import { Button, ErrorState, LoadingSkeleton, PageHeading, useAsync } from '../components/ui.jsx'
import { Notice, OtpInput, StatusBadge, TextArea, TextField } from '../components/forms.jsx'
import { PatientShell } from '../components/patient.jsx'
import { clearAddress, completion, confirmEmailCode, getProfile, requestEmailCode, saveAddress, saveEmail, saveProfile } from '../account.js'
import { api, errorText } from '../api.js'

/* /profile: Personal Details and Address Details on one page (the address has no page of its own). Saving sends only
   what changed. The mobile number is the sign-in identity, so it is shown, not edited. There is no emergency contact. */

const PIN = /^[1-9][0-9]{5}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const today = () => new Date().toISOString().slice(0, 10)
const GENDERS = [['male', 'Male'], ['female', 'Female'], ['other', 'Other']]

const fromProfile = (p) => ({
  fullName: p.fullName ?? '',
  dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
  gender: p.gender && p.gender !== 'undisclosed' ? p.gender : '',
  email: p.email ?? '',
  line: p.address?.line ?? '',
  pinCode: p.address?.pinCode ?? '',
  location: p.address?.location ?? null,
})

function EmailVerify({ profile, onDone }) {
  const [token, setToken] = useState(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  async function ask() {
    setBusy(true)
    setError(null)
    try {
      setToken((await requestEmailCode()).challengeToken)
    } catch (e) {
      setError(errorText(e, 'We could not send the code. Please try again.'))
    } finally {
      setBusy(false)
    }
  }
  async function confirm() {
    setBusy(true)
    setError(null)
    try {
      onDone(await confirmEmailCode(token, code))
    } catch (e) {
      setCode('')
      setError(errorText(e, 'That code is incorrect or has expired.'))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="verify-box">
      {!token ? (
        <>
          <p className="text-support">{profile.email} is not verified yet.</p>
          <Button variant="secondary" onClick={ask} disabled={busy}><MailCheck size={18} aria-hidden="true" />{busy ? 'Sending…' : 'Send verification code'}</Button>
        </>
      ) : (
        <>
          <p className="text-support">Enter the 6-digit code we sent to {profile.email}.</p>
          <OtpInput value={code} onChange={setCode} label="Email verification code" invalid={Boolean(error)} />
          <Button onClick={confirm} disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify email'}</Button>
        </>
      )}
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  )
}

function ProfileForm({ profile, onSaved }) {
  const [form, setForm] = useState(() => fromProfile(profile))
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null) // { tone, text }
  const [geo, setGeo] = useState(null)
  const [place, setPlace] = useState(null)
  const base = fromProfile(profile)
  const dirty = JSON.stringify(form) !== JSON.stringify(base)
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setResult(null) }
  const c = completion(profile)

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => e.preventDefault() // the browser shows its own "leave site?" prompt
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [dirty])

  // city and state for a valid PIN, when the service can say; typing is never blocked on it
  useEffect(() => {
    setPlace(null)
    if (!PIN.test(form.pinCode)) return undefined
    let live = true
    api(`/pincode/${form.pinCode}`).then((r) => live && r?.city && setPlace(`${r.city}${r.state ? `, ${r.state}` : ''}`), () => {})
    return () => { live = false }
  }, [form.pinCode])

  function locate() {
    setGeo(null)
    if (!navigator.geolocation) return setGeo('Location is not available in this browser. You can enter the address by hand.')
    navigator.geolocation.getCurrentPosition(
      (pos) => { setForm((f) => ({ ...f, location: { latitude: +pos.coords.latitude.toFixed(6), longitude: +pos.coords.longitude.toFixed(6) } })); setResult(null) },
      () => setGeo('Location permission was not given. You can enter the address by hand.'),
      { timeout: 10000 },
    )
  }

  async function submit(e) {
    e.preventDefault()
    const err = {}
    if (!form.fullName.trim()) err.fullName = 'Enter your full name.'
    if (form.dateOfBirth && form.dateOfBirth > today()) err.dateOfBirth = 'Date of birth cannot be in the future.'
    if (form.email && !EMAIL.test(form.email.trim())) err.email = 'Enter a valid email address.'
    const hasAddr = form.line.trim() || form.pinCode
    if (hasAddr && !form.line.trim()) err.line = 'Enter the full address.'
    if (hasAddr && !PIN.test(form.pinCode)) err.pinCode = 'Enter a valid 6-digit PIN code.'
    setErrors(err)
    if (Object.keys(err).length) return
    setBusy(true)
    setResult(null)
    const failed = []
    let latest = profile
    try {
      const body = {}
      if (form.fullName.trim() !== (base.fullName ?? '').trim()) body.fullName = form.fullName.trim()
      if (form.dateOfBirth && form.dateOfBirth !== base.dateOfBirth) body.dateOfBirth = form.dateOfBirth
      if (form.gender && form.gender !== base.gender) body.gender = form.gender
      if (Object.keys(body).length) latest = await saveProfile(body)
    } catch (x) { failed.push(errorText(x, 'Your personal details could not be saved.')) }
    try {
      if (form.email.trim().toLowerCase() !== base.email.toLowerCase() && form.email.trim()) latest = await saveEmail(form.email)
    } catch (x) { failed.push(errorText(x, 'Your email address could not be saved.')) }
    try {
      const addrChanged = form.line !== base.line || form.pinCode !== base.pinCode || JSON.stringify(form.location) !== JSON.stringify(base.location)
      if (addrChanged) latest = hasAddr ? await saveAddress({ line: form.line, pinCode: form.pinCode, latitude: form.location?.latitude, longitude: form.location?.longitude }) : await clearAddress()
    } catch (x) { failed.push(errorText(x, 'Your address could not be saved.')) }
    setBusy(false)
    onSaved(latest)
    setResult(failed.length ? { tone: 'error', text: failed.join(' ') } : { tone: 'success', text: 'Your changes have been saved.' })
  }

  const emailChanged = form.email.trim().toLowerCase() !== base.email.toLowerCase()
  return (
    <form onSubmit={submit} noValidate>
      <div className="comp-strip">
        <div className="meter" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.percent}><span style={{ width: `${c.percent}%` }} /></div>
        <p className="text-meta">{c.percent === 100 ? 'Your profile is complete.' : `${c.percent}% complete`}</p>
      </div>

      <section className="pcard-form" aria-labelledby="pd-h">
        <h2 id="pd-h" className="t-h2">Personal Details</h2>
        <div className="pf-grid">
          <TextField label="Full name" required value={form.fullName} onChange={set('fullName')} error={errors.fullName} autoComplete="name" maxLength={100} />
          <div className="pf-field">
            <span className="pf-label">Mobile number</span>
            <div className="ro-field"><span>{profile.mobileNumber}</span><StatusBadge tone="success">Verified</StatusBadge></div>
            <p className="field-help">This is how you sign in, so it cannot be changed here.</p>
          </div>
          <TextField label="Email address" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} maxLength={254}
            hint={profile.email && !emailChanged ? (profile.emailVerified ? 'Verified' : 'Not verified yet') : undefined} />
          <TextField label="Date of birth" type="date" max={today()} value={form.dateOfBirth} onChange={set('dateOfBirth')} error={errors.dateOfBirth} autoComplete="bday" />
          <fieldset className="pf-field gender">
            <legend>Gender</legend>
            <div className="radios">
              {GENDERS.map(([v, text]) => (
                <label key={v}><input type="radio" name="gender" value={v} checked={form.gender === v} onChange={set('gender')} />{text}</label>
              ))}
            </div>
          </fieldset>
        </div>
        {profile.email && !profile.emailVerified && !emailChanged && <EmailVerify profile={profile} onDone={onSaved} />}
      </section>

      <section className="pcard-form" aria-labelledby="ad-h">
        <h2 id="ad-h" className="t-h2">Address Details</h2>
        <div className="pf-grid">
          <TextArea label="Full address" className="span-2" rows={3} value={form.line} onChange={set('line')} error={errors.line} autoComplete="street-address" maxLength={500}
            hint="House or flat, street, locality, city and state." />
          <TextField label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={form.pinCode} onChange={(e) => { setForm({ ...form, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) }); setResult(null) }}
            error={errors.pinCode} hint={place ?? 'A 6-digit Indian PIN code.'} />
          <div className="pf-field">
            <span className="pf-label">Location (optional)</span>
            {form.location ? (
              <div className="ro-field"><span><MapPin size={16} aria-hidden="true" /> {form.location.latitude}, {form.location.longitude}</span>
                <button type="button" className="icon-btn" aria-label="Remove location" onClick={() => { setForm({ ...form, location: null }); setResult(null) }}><X size={18} aria-hidden="true" /></button></div>
            ) : (
              <Button variant="secondary" onClick={locate}><LocateFixed size={18} aria-hidden="true" />Use current location</Button>
            )}
            {geo && <p className="field-help" role="status">{geo}</p>}
          </div>
        </div>
      </section>

      <div aria-live="polite">{result && <Notice tone={result.tone}>{result.text}</Notice>}</div>
      <div className="form-actions">
        <button type="submit" className="btn btn-rect btn-primary" disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save Changes'}</button>
        <button type="button" className="btn btn-rect btn-outline" disabled={busy || !dirty} onClick={() => { setForm(base); setErrors({}); setResult(null) }}>Discard changes</button>
      </div>
      {!dirty && !result && <p className="text-meta">Nothing to save yet. Change a detail above.</p>}
    </form>
  )
}

function ProfileBody() {
  const r = useAsync(getProfile, 'profile')
  const [saved, setSaved] = useState(null)
  const profile = saved ?? r.data
  return (
    <>
      <PageHeading title="Your profile">Keep your details up to date so bookings and records are correct.</PageHeading>
      {r.status === 'error' && !profile ? <ErrorState title="Your profile could not be loaded" onRetry={r.reload}>{errorText(r.error)}</ErrorState>
        : !profile ? <LoadingSkeleton rows={2} variant="grid" />
        : <ProfileForm key={profile.id} profile={profile} onSaved={setSaved} />}
    </>
  )
}

export default function Account() {
  return (
    <PatientShell title="Profile">
      <ProfileBody />
    </PatientShell>
  )
}
