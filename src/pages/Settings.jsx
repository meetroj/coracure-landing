import { useEffect, useId, useState } from 'react'
import { Bell, CalendarDays, CircleCheck, FileText, FlaskConical, Globe, Monitor, Moon, ShieldCheck, Sun, X } from 'lucide-react'
import { Dialog, PageHeading, useAsync } from '../components/ui.jsx'
import { StatusBadge } from '../components/forms.jsx'
import { PatientShell } from '../components/patient.jsx'
import { LANGUAGES, getNotificationPrefs, getProfile, saveNotificationPrefs, saveProfile } from '../account.js'
import { signOut } from '../auth.js'
import { readPrefs, savePrefs } from '../prefs.js'
import { Link } from '../router.jsx'

/* /settings: consultation languages and notification switches are saved to the account (PATCH /me/profile,
   PUT /me/notifications/preferences) when Save is pressed. Light/dark is kept on this device (prefs.js) and applies
   as soon as it is picked. */

const THEMES = [['light', Sun, 'Light', 'Clean and bright'], ['dark', Moon, 'Dark', 'Easier on the eyes'], ['system', Monitor, 'System Default', 'Matches your device']]
const NOTIFY = [['appointments', CalendarDays, 'Appointment updates', 'Get notified about your consultation appointments.'], ['labs', FlaskConical, 'Lab order updates', 'Get notified about your lab test orders.'], ['reports', FileText, 'Report availability', 'Get notified when your lab reports are ready.']]
const masked = (n) => (n ? `${n.slice(0, 3)} ${'X'.repeat(Math.max(0, n.length - 8))}${n.slice(-5)}` : '-')
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

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

function Switch({ checked, onChange, label, disabled }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className="switch" onClick={() => onChange(!checked)}><span /></button>
}

function SettingsBody() {
  const profile = useAsync(getProfile, 'profile')
  const notif = useAsync(getNotificationPrefs, 'notif')
  const [theme, setTheme] = useState(() => readPrefs().theme)
  const [draft, setDraft] = useState(null) // { languages, notify }, filled once the account has loaded
  const [saved, setSaved] = useState(null)
  const [toast, setToast] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    if (!profile.data || !notif.data) return
    const s = { languages: profile.data.languages ?? [], notify: notif.data }
    setSaved(s)
    setDraft(s)
  }, [profile.data, notif.data])

  const changed = Boolean(draft) && !same(draft, saved)
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

  const pickTheme = (v) => { setTheme(v); savePrefs({ ...readPrefs(), theme: v }) }
  const toggleLang = (code) => setDraft((d) => ({ ...d, languages: d.languages.includes(code) ? d.languages.filter((l) => l !== code) : [...d.languages, code] }))
  const save = async () => {
    if (draft.languages.length === 0) return setError('Choose at least one language.')
    setBusy(true)
    setError('')
    try {
      if (!same(draft.languages, saved.languages)) await saveProfile({ languages: draft.languages })
      if (!same(draft.notify, saved.notify)) await saveNotificationPrefs(draft.notify)
      setSaved(draft)
      setToast(true)
    } catch {
      setError('Could not save your preferences. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  const cancel = () => (changed ? setConfirm(true) : null)
  const discard = () => { setDraft(saved); setError(''); setConfirm(false) }
  const a = profile.data

  return (
    <>
      <div className="shead">
        <PageHeading title="Settings">Manage your languages, appearance and account preferences.</PageHeading>
        <div aria-live="polite">
          {toast && <p className="toast"><CircleCheck size={18} aria-hidden="true" />Preferences updated<button type="button" aria-label="Dismiss" onClick={() => setToast(false)}><X size={16} aria-hidden="true" /></button></p>}
        </div>
      </div>

      <Card icon={Globe} title="Consultation languages" sub="Choose every language you are comfortable consulting in. Providers are matched to you on these.">
        {draft ? (
          <div className="langs" role="group" aria-label="Consultation languages">
            {LANGUAGES.map(([code, name]) => (
              <label key={code} className={`lang${draft.languages.includes(code) ? ' on' : ''}`}>
                <input type="checkbox" checked={draft.languages.includes(code)} onChange={() => toggleLang(code)} />{name}
              </label>
            ))}
          </div>
        ) : <p className="text-meta">{profile.status === 'error' || notif.status === 'error' ? 'Could not load your settings.' : 'Loading…'}</p>}
        <p className="text-meta">The website itself is in English. Your first choice here is your main consultation language.</p>
      </Card>

      <Card icon={Sun} title="Appearance" sub="Choose how you want the website to look.">
        <div className="themes" role="radiogroup" aria-label="Appearance">
          {THEMES.map(([v, Icon, t, d]) => (
            <label key={v} className={`theme${theme === v ? ' on' : ''}`}>
              <input type="radio" name="theme" value={v} checked={theme === v} onChange={() => pickTheme(v)} />
              <Icon size={22} aria-hidden="true" /><strong>{t}</strong><span>{d}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card icon={Bell} title="Notifications" sub="Choose what you would like to be notified about. Notifications contain limited information for privacy.">
        <ul className="nlist">
          {NOTIFY.map(([k, Icon, t, d]) => (
            <li key={k}>
              <Icon size={18} aria-hidden="true" />
              <div><strong>{t}</strong><span>{d}</span></div>
              <Switch checked={draft?.notify[k] ?? false} label={t} disabled={!draft} onChange={(v) => setDraft({ ...draft, notify: { ...draft.notify, [k]: v } })} />
            </li>
          ))}
        </ul>
        <p className="text-meta">Saved to your account. Safety and care messages from your provider are always sent.</p>
      </Card>

      <Card icon={ShieldCheck} title="Account and security" sub="Manage your account information and active sessions.">
        <dl className="alist2">
          <div><dt>Mobile number</dt><dd>{a ? masked(a.mobileNumber) : '…'}</dd><dd><StatusBadge tone="success">Verified</StatusBadge></dd><dd className="muted">Used to sign in</dd></div>
          <div><dt>Email address</dt><dd>{a ? (a.email ?? 'Not added') : '…'}</dd><dd>{a?.email && <StatusBadge tone={a.emailVerified ? 'success' : 'pending'}>{a.emailVerified ? 'Verified' : 'Not verified'}</StatusBadge>}</dd><dd><Link href="/profile" className="link">{a?.email ? 'Change' : 'Add'}</Link></dd></div>
          <div><dt>Active session</dt><dd>This device</dd><dd /><dd><button type="button" className="btn btn-outline logout" onClick={signOut}>Logout</button></dd></div>
        </dl>
      </Card>

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-rect btn-outline" onClick={cancel} disabled={!changed}>Cancel</button>
        <button type="button" className="btn btn-rect btn-primary" onClick={save} disabled={!changed || busy}>{busy ? 'Saving…' : 'Save Preferences'}</button>
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
