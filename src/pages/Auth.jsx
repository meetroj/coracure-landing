import { useEffect, useState } from 'react'
import { ArrowLeft, CircleAlert, Lock, ShieldCheck, Users } from 'lucide-react'
import logo from '../assets/logo/coracure-wide.svg'
import logoWhite from '../assets/logo/coracure-wide-white.svg'
import { Page } from '../components/ui.jsx'
import { Consent, Notice, OtpInput } from '../components/forms.jsx'
import { E164, OTP_LENGTH, requestOtp, verifyOtp } from '../account.js'
import { errorText, takeExpiredNotice } from '../api.js'
import { safeNext, useSession } from '../auth.js'
import { Link, navigate, useSearchParams } from '../router.jsx'

/* /login and /signup. One flow for both, because the backend's is one call: a code is sent to the mobile number, and
   confirming it signs in (or creates the patient account on first use). Sign Up adds the required consent line.
   Mobile number and OTP only: there is no email sign-in. */

const RESEND_SECONDS = 30
// Autofill and paste bring "+91 94068 79532", "0094068 79532" or "094068 79532": drop the country code or the trunk 0 first,
// so the last digit is not cut off. Typing a 10-digit number by hand is left alone.
const digitsOnly = (s) => {
  let d = s.replace(/\D/g, '')
  if (d.length > 10 && d.startsWith('0091')) d = d.slice(4)
  else if (d.length > 10 && d.startsWith('91')) d = d.slice(2)
  else if (d.length > 10 && d.startsWith('0')) d = d.slice(1)
  return d.slice(0, 10)
}

export default function Auth({ mode }) {
  const signup = mode === 'signup'
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const { signedIn } = useSession()
  const [step, setStep] = useState('phone') // phone | otp | done
  const [number, setNumber] = useState('')
  const [agree, setAgree] = useState(false)
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [fieldError, setFieldError] = useState(null)
  const [wait, setWait] = useState(0)
  const [expired] = useState(takeExpiredNotice)
  const mobile = `+91${number}`

  // already signed in (or just became so): go where they were headed
  useEffect(() => {
    if (signedIn) navigate(next ?? '/dashboard', { replace: true })
  }, [signedIn, next])

  useEffect(() => {
    if (wait <= 0) return undefined
    const id = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  async function send(e) {
    e?.preventDefault()
    setError(null)
    if (!E164.test(mobile) || number.length !== 10 || /^[0-5]/.test(number)) return setFieldError('Enter a valid 10-digit mobile number.')
    if (signup && !agree) return setFieldError('Please accept the Terms & Conditions and Privacy Policy to create an account.')
    setFieldError(null)
    setBusy(true)
    try {
      const res = await requestOtp(mobile)
      setChallenge(res.challengeId)
      setCode('')
      setStep('otp')
      setWait(RESEND_SECONDS)
    } catch (err) {
      setError(errorText(err, 'We could not send the code. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  async function verify(e) {
    e?.preventDefault()
    if (code.length !== OTP_LENGTH || busy) return
    setError(null)
    setBusy(true)
    try {
      await verifyOtp(mobile, challenge, code)
      setStep('done') // the session is set; the effect above redirects
    } catch (err) {
      setCode('')
      setError(err.code === 'TOO_MANY_ATTEMPTS' || err.code === 'NETWORK' || err.code === 'NOT_CONFIGURED' ? errorText(err) : 'That code is incorrect or has expired. Please try again or request a new code.')
    } finally {
      setBusy(false)
    }
  }

  const h = signup ? 'Create Your Account' : 'Welcome Back'
  return (
    <Page bg="auth" title={signup ? 'Sign Up' : 'Login'} wide>
      <div className="auth">
        <aside className="auth-side">
          <p className="auth-kicker" aria-hidden="true">Care.<br /><span>Connected.</span></p>
          <p className="auth-lead">Book consultations, manage lab tests and access your health records securely.</p>
          <ul className="auth-points">
            <li><span><Lock size={22} aria-hidden="true" /></span><div><strong>Secure patient access</strong><small>Your information stays protected and secure.</small></div></li>
            <li><span><Users size={22} aria-hidden="true" /></span><div><strong>One account across CoraCure</strong><small>Access consultations, lab tests and your records in one place.</small></div></li>
            <li><span><ShieldCheck size={22} aria-hidden="true" /></span><div><strong>Private health information</strong><small>We follow industry best practices to keep your data private.</small></div></li>
          </ul>
        </aside>
        <section className="auth-card" aria-labelledby="auth-h">
          <Link href="/" className="auth-logo"><img className="logo-light" src={logo} alt="CoraCure, a healthier connection" width="180" height="45" /><img className="logo-dark" src={logoWhite} alt="" aria-hidden="true" width="180" height="45" /></Link>

          {step === 'phone' && (
            <form onSubmit={send} noValidate>
              <h1 id="auth-h" className="t-h2">{h}</h1>
              <p className="auth-sub">{signup ? 'Join CoraCure for a healthier tomorrow.' : 'Log in to continue to CoraCure.'}</p>

              {expired && <Notice tone="warn">Your session ended. Please log in again.</Notice>}

              <div className="pf-field">
                <label htmlFor="mobile">Mobile number</label>
                <div className={`phone${fieldError ? ' phone-bad' : ''}`}>
                  <span className="phone-code" aria-label="Country code +91, India">+91</span>
                  <input id="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Enter mobile number" value={number} onChange={(e) => { setNumber(digitsOnly(e.target.value)); setFieldError(null) }}
                    aria-invalid={fieldError ? true : undefined} aria-describedby={fieldError ? 'mobile-e' : undefined} enterKeyHint="send" />
                </div>
                {fieldError && <p className="field-error" id="mobile-e" role="alert">{fieldError}</p>}
              </div>

              {signup && (
                <Consent checked={agree} onChange={(v) => { setAgree(v); setFieldError(null) }}>
                  I agree to the <Link href="/legal/terms_of_use" target="_blank">Terms &amp; Conditions</Link> and <Link href="/legal/privacy_policy" target="_blank">Privacy Policy</Link>.
                </Consent>
              )}

              {error && <Notice tone="error">{error}</Notice>}
              <button type="submit" className="btn btn-rect btn-primary auth-btn" disabled={busy}>{busy ? 'Sending code…' : 'Send OTP'}</button>

              {!signup && <p className="auth-fine">By continuing, you agree to our <Link href="/legal/terms_of_use">Terms &amp; Conditions</Link> and <Link href="/legal/privacy_policy">Privacy Policy</Link>.</p>}
              <p className="auth-aside"><Lock size={16} aria-hidden="true" />{next && next !== '/dashboard' ? 'You’ll return to the page you were viewing after login.' : 'A code will be sent to this number by SMS.'}</p>
              <p className="auth-switch">{signup ? <>Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Log in</Link></> : <>New to CoraCure? <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link></>}</p>
            </form>
          )}

          {step !== 'phone' && (
            <form onSubmit={verify} noValidate>
              <button type="button" className="link-btn auth-back-top" onClick={() => { setStep('phone'); setError(null); setCode('') }}><ArrowLeft size={16} aria-hidden="true" />Back</button>
              <h1 id="auth-h" className="t-h2 h-left">Enter verification code</h1>
              <p className="auth-sub" id="otp-sub">Sent to <strong>+91 ••••••{number.slice(-4)}</strong></p>
              <OtpInput value={code} onChange={(v) => { setCode(v); setError(null) }} length={OTP_LENGTH} invalid={Boolean(error)} disabled={busy || step === 'done'} />
              <div className="auth-msg" aria-live="polite">{error && <p className="field-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</p>}</div>
              <button type="submit" className="btn btn-rect btn-primary auth-btn" disabled={busy || code.length !== OTP_LENGTH || step === 'done'}>{step === 'done' ? 'Signing you in…' : busy ? 'Verifying…' : 'Verify & Continue'}</button>
              <div className="auth-resend">
                {wait > 0 ? <span aria-live="off">Resend code in <strong>00:{String(wait).padStart(2, '0')}</strong></span>
                  : <button type="button" className="link-btn" onClick={send} disabled={busy}>Resend code</button>}
                <button type="button" className="link-btn" onClick={() => { setStep('phone'); setError(null); setCode('') }}>Change mobile number</button>
              </div>
            </form>
          )}
        </section>
      </div>
    </Page>
  )
}
