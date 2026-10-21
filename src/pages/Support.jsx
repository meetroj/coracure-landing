import { useState } from 'react'
import { Clock, FileText, Mail, Phone, RotateCcw, Search, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Button, Page, PageHeading, useAsync } from '../components/ui.jsx'
import { Notice, SelectField, TextArea } from '../components/forms.jsx'
import { raiseComplaint, supportContact } from '../account.js'
import { errorText } from '../api.js'
import { loginHref, signupHref, useSession } from '../auth.js'
import { Link } from '../router.jsx'

/* /support. Help topics, the contact details the admin panel has confirmed (nothing shown until it has), a request form,
   the policy links and the emergency notice. A request is a complaint on the patient's own account (POST /me/complaints),
   so sending needs a login: the form is always shown, and a visitor who sends it is asked to log in (nothing typed is lost).
   The answers below are draft wording for approval. */

const TOPICS = [
  ['How do I book a consultation?', 'Choose Consult a Doctor, pick a provider and an available time, and pay. The booking is confirmed only once the doctor accepts it; until then it shows as awaiting acceptance.'],
  ['How do I book a lab test?', 'Open Lab Tests, choose a test or package, check that it is available at your PIN code, and place the order. Availability depends on your area.'],
  ['How will I receive my reports?', 'Reports appear under Health Records, in the Reports tab, once they are uploaded. You can view or download them there.'],
  ['Cancellation and refund policy', null], // answered by the published Refund policy, linked below
  ['Technical issues', 'If something is not working, or a payment failed, check Health Records, Payments for its status. If it still looks wrong, send us a request with the category Technical issue and any order reference.'],
]
const CATEGORIES = [['payment_issue', 'Payments and refunds'], ['technical_issue', 'Technical issue'], ['consultation_quality', 'Consultation quality'], ['doctor_conduct', 'Doctor conduct'], ['other', 'Other (lab tests, account, general)']]
const POLICIES = [['Terms & Conditions', '/legal/terms_of_use', FileText], ['Privacy Policy', '/legal/privacy_policy', ShieldCheck], ['Refund Policy', '/legal/refund_policy', RotateCcw], ['Data Protection', null, ShieldCheck], ['Grievance Redressal', null, FileText]]

function ContactBlock() {
  const r = useAsync(supportContact, 'contact')
  const c = r.data
  if (r.status === 'error' || !c || (!c.email && !c.phone && !c.hours && !c.address)) return null // nothing confirmed yet: nothing shown
  return (
    <ul className="contact-list">
      {c.email && <li><Mail size={18} aria-hidden="true" /><a href={`mailto:${c.email}`}>{c.email}</a></li>}
      {c.phone && <li><Phone size={18} aria-hidden="true" /><a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a></li>}
      {c.hours && <li><Clock size={18} aria-hidden="true" />{c.hours}</li>}
    </ul>
  )
}

function RequestForm() {
  const { signedIn } = useSession()
  const [f, setF] = useState({ category: '', description: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [needLogin, setNeedLogin] = useState(false)
  const [done, setDone] = useState(null)
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setNeedLogin(false) }
  if (done) {
    return (
      <div className="success-panel compact" role="status">
        <h3 className="t-card">Your request has been sent.</h3>
        <p className="ref">Reference: <strong>{done.referenceCode}</strong></p>
        <p className="text-support">Keep this reference if you contact us about it. Our team will review your request.</p>
        <Button variant="secondary" onClick={() => { setDone(null); setF({ category: '', description: '' }) }}>Send another request</Button>
      </div>
    )
  }
  async function submit(e) {
    e.preventDefault()
    const err = {}
    if (!f.category) err.category = 'Choose what your request is about.'
    if (!f.description.trim()) err.description = 'Describe what happened.'
    setErrors(err)
    if (Object.keys(err).length) return
    if (!signedIn) return setNeedLogin(true)
    setBusy(true)
    setError(null)
    try {
      const label = CATEGORIES.find(([v]) => v === f.category)[1]
      setDone(await raiseComplaint({ category: f.category, subject: label, description: f.description.trim() }))
    } catch (x) {
      setError(errorText(x, 'We could not send your request. What you typed is still here; please try again.'))
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} noValidate>
      <p className="text-support">Tell us about your issue.</p>
      <SelectField label="Issue category" required value={f.category} onChange={set('category')} error={errors.category} options={CATEGORIES} placeholder="Select an issue category" />
      <TextArea label="Describe your issue" required value={f.description} onChange={set('description')} error={errors.description} maxLength={4000} hint="Include the appointment or order reference if you have one." />
      {needLogin && (
        <Notice tone="warn">
          Please log in to send your request, so we can find your bookings and orders. What you typed will be kept.
          <span className="modal-actions"><Link className="btn btn-outline" href={loginHref('/support')}>Log in</Link><Link className="btn btn-primary" href={signupHref('/support')}>Sign Up</Link></span>
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" className="btn btn-rect btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Submit Request'}</button>
    </form>
  )
}

export default function Support() {
  const [q, setQ] = useState('')
  const shown = TOPICS.filter(([t, a]) => !q.trim() || `${t} ${a ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <Page bg="plain" title="Support">
      <PageHeading title="How can we help?">Find answers, or get in touch with our support team.</PageHeading>

      <label className="help-search"><Search size={20} aria-hidden="true" /><span className="sr-only">Search help topics</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for help topics, e.g. booking, reports, refunds…" autoComplete="off" />
      </label>

      <div className="support-grid">
        <section aria-labelledby="topics-h" className="topics-card">
          <h2 id="topics-h" className="t-card">Popular Topics</h2>
          {shown.length === 0 ? <p className="text-support">No topics match that search. Send us a request instead.</p> : (
            <div className="faq">
              {shown.map(([t, a]) => (
                <details key={t} name="faq">
                  <summary>{t}</summary>
                  {a ? <p>{a}</p> : <p>Our refund policy explains how cancellations and refunds work. <Link href="/legal/refund_policy">Read the Refund policy</Link>.</p>}
                </details>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="contact-h" className="contact-card">
          <h2 id="contact-h" className="t-card">Contact Support</h2>
          <ContactBlock />
          <RequestForm />
        </section>
      </div>

      <nav aria-label="Policies" className="policies">
        <ul>
          {POLICIES.map(([label, href, Icon]) => (
            <li key={label}>{href
              ? <Link href={href}><Icon size={22} aria-hidden="true" /><span>{label}</span></Link>
              : <span className="soon" aria-disabled="true"><Icon size={22} aria-hidden="true" /><span>{label}</span><small>Soon</small></span>}</li>
          ))}
        </ul>
      </nav>

      <p className="emergency" role="note"><TriangleAlert size={22} aria-hidden="true" />For emergency purposes, consult nearby hospital.</p>
    </Page>
  )
}
