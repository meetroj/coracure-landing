import { useEffect, useId, useState } from 'react'
import { Bell, CalendarDays, CircleCheck, FileText, FlaskConical, Globe, Monitor, Moon, ShieldCheck, Sun, X } from 'lucide-react'
import { Dialog, PageHeading, useAsync } from '../components/ui.jsx'
import { StatusBadge } from '../components/forms.jsx'
import { PatientShell } from '../components/patient.jsx'
import { getProfile } from '../account.js'
import { signOut } from '../auth.js'
import { LANGS, readPrefs, savePrefs } from '../prefs.js'
import { Link } from '../router.jsx'

/* /settings: website language, appearance, notification switches and account details. Preferences are kept on this
   device (prefs.js); nothing here is sent to the API. Notifications are shown as "optional, when supported": the
   switches record a preference and do not by themselves send anything. */

const THEMES = [['light', Sun, 'Light', 'Clean and bright'], ['dark', Moon, 'Dark', 'Easier on the eyes'], ['system', Monitor, 'System Default', 'Matches your device']]
const NOTIFY = [['appointments', CalendarDays, 'Appointment updates', 'Get notified about your consultation appointments.'], ['labs', FlaskConical, 'Lab order updates', 'Get notified about your lab test orders.'], ['reports', FileText, 'Report availability', 'Get notified when your lab reports are ready.']]
const masked = (n) => (n ? `${n.slice(0, 3)} ${'X'.repeat(Math.max(0, n.length - 8))}${n.slice(-5)}` : '-')

function Card({ icon: Icon, title, sub, children }) {
  const id = useId()
  return (
    <section className="scard" aria-labelledby={id}>
      <span className="scard-icon" aria-hidden="true"><Icon size={22} /></span>
      <div className="scard-main">
        <h2 id={id} className="t-card">{title}</h2>
        {sub && <p className="text-support">{sub}</p>}
        {children}
      </div>
    </section>
  )
}

function Switch({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)}><span /></button>
}

function SettingsBody() {
  const [p, setP] = useState(readPrefs)
  const [toast, setToast] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const profile = useAsync(getProfile, 'profile')
  const changed = JSON.stringify(p) !== JSON.stringify(readPrefs())

  useEffect(() => {
    if (!changed) return undefined
    const warn = (e) => e.preventDefault() // the browser's own "leave site?" prompt
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [changed])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(false), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const save = () => { savePrefs(p); setToast(true) }
  const cancel = () => (changed ? setConfirm(true) : null)
  const discard = () => { setP(readPrefs()); setConfirm(false) }
  const a = profile.data

  return (
    <>
      <div className="shead">
        <PageHeading title="Settings">Manage your language, appearance and account preferences.</PageHeading>
        <div aria-live="polite">
          {toast && <p className="toast"><CircleCheck size={18} aria-hidden="true" />Preferences updated<button type="button" aria-label="Dismiss" onClick={() => setToast(false)}><X size={16} aria-hidden="true" /></button></p>}
        </div>
      </div>

      <Card icon={Globe} title="Language" sub="Choose your preferred language for the website.">
        <label className="sr-only" htmlFor="lang">Website language</label>
        <select id="lang" className="sselect" value={p.lang} onChange={(e) => setP({ ...p, lang: e.target.value })}>
          {LANGS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
        <p className="text-meta">The website will appear in your selected language, where translations are available.</p>
      </Card>

      <Card icon={Sun} title="Appearance" sub="Choose how you want the website to look.">
        <div className="themes" role="radiogroup" aria-label="Appearance">
          {THEMES.map(([v, Icon, t, d]) => (
            <label key={v} className={`theme${p.theme === v ? ' on' : ''}`}>
              <input type="radio" name="theme" value={v} checked={p.theme === v} onChange={() => setP({ ...p, theme: v })} />
              <Icon size={22} aria-hidden="true" /><strong>{t}</strong><span>{d}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card icon={Bell} title="Notifications" sub="Optional: shown when supported. Choose what you would like to be notified about. Notifications contain limited information for privacy.">
        <ul className="nlist">
          {NOTIFY.map(([k, Icon, t, d]) => (
            <li key={k}>
              <Icon size={18} aria-hidden="true" />
              <div><strong>{t}</strong><span>{d}</span></div>
              <Switch checked={p.notify[k]} label={t} onChange={(v) => setP({ ...p, notify: { ...p.notify, [k]: v } })} />
            </li>
          ))}
        </ul>
        <p className="text-meta">Saved on this device. Notifications themselves are delivered by the CoraCure app.</p>
      </Card>

      <Card icon={ShieldCheck} title="Account and security" sub="Manage your account information and active sessions.">
        <dl className="alist2">
          <div><dt>Mobile number</dt><dd>{a ? masked(a.mobileNumber) : '…'}</dd><dd><StatusBadge tone="success">Verified</StatusBadge></dd><dd className="muted">Used to sign in</dd></div>
          <div><dt>Email address</dt><dd>{a ? (a.email ?? 'Not added') : '…'}</dd><dd>{a?.email && <StatusBadge tone={a.emailVerified ? 'success' : 'pending'}>{a.emailVerified ? 'Verified' : 'Not verified'}</StatusBadge>}</dd><dd><Link href="/profile" className="link">{a?.email ? 'Change' : 'Add'}</Link></dd></div>
          <div><dt>Active session</dt><dd>This device</dd><dd /><dd><button type="button" className="btn btn-outline logout" onClick={signOut}>Logout</button></dd></div>
        </dl>
      </Card>

      <div className="form-actions">
        <button type="button" className="btn btn-rect btn-outline" onClick={cancel} disabled={!changed}>Cancel</button>
        <button type="button" className="btn btn-rect btn-primary" onClick={save} disabled={!changed}>Save Preferences</button>
      </div>

      <Dialog open={confirm} onClose={() => setConfirm(false)} labelledBy="discard-t" className="modal">
        <h2 id="discard-t" className="t-card">Discard changes?</h2>
        <p className="text-support">You have unsaved changes. Are you sure you want to leave this page without saving?</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-rect btn-outline" onClick={() => setConfirm(false)}>Stay</button>
          <button type="button" className="btn btn-rect btn-danger" onClick={discard}>Discard</button>
        </div>
      </Dialog>
    </>
  )
}

export default function Settings() {
  return (
    <PatientShell title="Settings">
      <SettingsBody />
    </PatientShell>
  )
}
