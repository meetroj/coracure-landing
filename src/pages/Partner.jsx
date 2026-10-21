import { useState } from 'react'
import { Building2, FlaskConical, Handshake, Hospital, Stethoscope } from 'lucide-react'
import banner from '../assets/BG/partner-banner.webp'
import { Button, Page } from '../components/ui.jsx'
import { Consent, Notice, SelectField, TextArea, TextField } from '../components/forms.jsx'
import { submitPartnership } from '../account.js'
import { ApiError, errorText } from '../api.js'
import { Link } from '../router.jsx'

/* /partner-with-us: POST /partnership-enquiries (public, rate-limited). The API stores: name, mobile, email,
   profession (the partnership type), organisation, city and one message. Designation and PIN code have no field of
   their own, so they travel at the top of the message. Nothing here promises approval or a reply time. */

const TYPES = [
  [Stethoscope, 'Healthcare Provider'],
  [FlaskConical, 'Diagnostic / Lab Partner'],
  [Hospital, 'Hospital / Clinic'],
  [Building2, 'Corporate / Institutional'],
  [Handshake, 'Other'],
]
const DESIGNATIONS = ['Owner / Founder', 'Director / CEO', 'Manager', 'Doctor / Clinician', 'Other'].map((d) => [d, d])
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const empty = { org: '', person: '', role: '', email: '', mobile: '', city: '', pin: '', message: '' }

export default function Partner() {
  const [type, setType] = useState(TYPES[0][1])
  const [f, setF] = useState(empty)
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    const err = {}
    if (!f.org.trim()) err.org = 'Enter the organisation name.'
    if (!f.person.trim()) err.person = 'Enter the contact person.'
    if (!f.role) err.role = 'Select a designation.'
    if (!EMAIL.test(f.email.trim())) err.email = 'Enter a valid email address.'
    if (!/^[6-9]\d{9}$/.test(f.mobile)) err.mobile = 'Enter a valid 10-digit mobile number.'
    if (!f.city.trim()) err.city = 'Enter the city.'
    if (!/^[1-9]\d{5}$/.test(f.pin)) err.pin = 'Enter a valid 6-digit PIN code.'
    if (!f.message.trim()) err.message = 'Tell us briefly about the partnership you have in mind.'
    if (!agree) err.agree = 'Please agree to be contacted about this enquiry.'
    const message = [`Designation: ${f.role}`, `PIN code: ${f.pin}`, f.message.trim()].join('\n\n')
    if (message.length > 2000) err.message = 'Please shorten the message to about 1,900 characters.'
    setErrors(err)
    if (Object.keys(err).length) return
    setBusy(true)
    setError(null)
    try {
      setDone(await submitPartnership({ fullName: f.person.trim(), mobileNumber: `+91${f.mobile}`, email: f.email.trim().toLowerCase(), profession: type, organisation: f.org.trim(), city: f.city.trim(), message }))
    } catch (x) {
      setError(x instanceof ApiError && x.status === 429 ? 'You have sent several enquiries recently. Please try again a little later.' : errorText(x, 'We could not send your enquiry. Your details are still here, so you can try again.'))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Page bg="plain" title="Partner with us">
        <div className="success-panel" role="status">
          <h1 className="t-page">Thank you. Your enquiry has been received.</h1>
          {done.referenceCode && <p className="ref">Reference: <strong>{done.referenceCode}</strong></p>}
          <p className="page-sub">Your enquiry will be reviewed by the CoraCure team. Submission does not imply approval or partnership.</p>
          <Button href="/">Back to home</Button>
        </div>
      </Page>
    )
  }
  return (
    <Page bg="plain" title="Partner with us" wide>
      <div className="pcard-wrap">
        <header className="banner">
          <div className="banner-art" style={{ backgroundImage: `url(${banner})` }} aria-hidden="true" />
          <div className="banner-text">
            <h1 className="t-page">Partner with us<br />for a healthier tomorrow.</h1>
            <p className="page-sub">Collaborate with CoraCure to expand access to quality healthcare services.</p>
          </div>
        </header>

        <form className="enquiry" onSubmit={submit} noValidate>
          <fieldset className="types">
            <legend className="sr-only">Partnership type</legend>
            <div className="type-grid">
              {TYPES.map(([Icon, label]) => (
                <label key={label} className={`type-card${type === label ? ' on' : ''}`}>
                  <input type="radio" name="ptype" value={label} checked={type === label} onChange={() => setType(label)} />
                  <Icon size={24} aria-hidden="true" /><span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="form12">
            <TextField label="Organization Name" required className="c5" placeholder="Your organization name" value={f.org} onChange={set('org')} error={errors.org} autoComplete="organization" maxLength={120} />
            <TextField label="Contact Person" required className="c4" placeholder="Full name" value={f.person} onChange={set('person')} error={errors.person} autoComplete="name" maxLength={100} />
            <SelectField label="Designation" required className="c3" value={f.role} onChange={set('role')} error={errors.role} options={DESIGNATIONS} placeholder="Select" />
            <TextField label="Email Address" required className="c4" type="email" inputMode="email" placeholder="you@organization.com" value={f.email} onChange={set('email')} error={errors.email} autoComplete="email" maxLength={254} />
            <TextField label="Mobile Number" required className="c3" type="tel" inputMode="numeric" placeholder="+91  98765 43210" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} error={errors.mobile} autoComplete="tel-national" />
            <TextField label="City" required className="c2" placeholder="Enter city" value={f.city} onChange={set('city')} error={errors.city} autoComplete="address-level2" maxLength={60} />
            <TextField label="PIN Code" required className="c3" inputMode="numeric" placeholder="400001" value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} error={errors.pin} autoComplete="postal-code" />
            <TextArea label="Message" required className="c12" rows={3} placeholder="Tell us about your partnership interest…" value={f.message} onChange={set('message')} error={errors.message} maxLength={1800} />
          </div>
          {error && <Notice tone="error">{error}</Notice>}
          <div className="enquiry-foot">
            <Consent checked={agree} onChange={setAgree} error={errors.agree}>I agree to be contacted by CoraCure regarding this enquiry. See our <Link href="/legal/privacy_policy" target="_blank">Privacy Policy</Link>.</Consent>
            <button type="submit" className="btn btn-rect btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit Enquiry'}</button>
          </div>
          <Notice>Your enquiry will be reviewed by our team. Submission does not imply approval or partnership.</Notice>
        </form>
      </div>
    </Page>
  )
}
