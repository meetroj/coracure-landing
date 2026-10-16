import { CalendarDays, ChevronRight, FileText, FlaskConical, House, Settings, Stethoscope, UserRound } from 'lucide-react'
import { Button, DemoNotice, EmptyState, ErrorState, LoadingSkeleton, Page, PageHeading, useAsync } from '../components/ui.jsx'
import { MaybeLink } from '../components/layout.jsx'
import { loginHref, signupHref, useSession } from '../auth.js'
import { getDashboard } from '../data.js'
import { Link } from '../router.jsx'
import { LINKS } from '../site.js'

/* /dashboard: the signed-in patient's home (guide section 2). Private, so a visitor who is not signed in is asked to
   log in first and comes back here. Nothing is invented: with no account data the panels are honest empty states,
   and there is no name, ID or sample appointment. */

// [icon, label, href]; null = the page is not built yet and shows as unavailable
const NAV = [
  [House, 'Dashboard', '/dashboard'],
  [Stethoscope, 'Consultations', LINKS.consultations],
  [FlaskConical, 'Lab Tests', LINKS.labTests],
  [CalendarDays, 'Appointments', null],
  [FileText, 'Health Records', null],
  [UserRound, 'Profile', LINKS.profile],
  [Settings, 'Settings', null],
]

const Panel = ({ icon: Icon, title, empty, hint, action, items, children }) => (
  <section className="dpanel" aria-labelledby={`${title}-t`}>
    <h2 id={`${title}-t`} className="t-card"><Icon size={20} aria-hidden="true" />{title}</h2>
    {items.length ? (
      <ul className="dlist">{items.map((it) => <li key={it.id}>{it.title}<span>{it.when}</span></li>)}</ul>
    ) : (
      <div className="dempty">
        <FileText size={32} aria-hidden="true" />
        <p className="dempty-title">{empty}</p>
        <p className="text-support">{hint}</p>
        {action}
      </div>
    )}
    {children}
  </section>
)

function Signin() {
  return (
    <EmptyState icon={UserRound} title="Log in to see your dashboard" action={
      <div className="modal-actions">
        <Button variant="secondary" href={loginHref('/dashboard')}>Log in</Button>
        <Button href={signupHref('/dashboard')}>Sign Up</Button>
      </div>
    }>
      Your consultations, lab tests and health records are private, so we ask you to log in first. You will come back to this page afterwards.
      {!LINKS.login && ' Web accounts are not open yet, so these take you to the CoraCure app.'}
    </EmptyState>
  )
}

export default function Dashboard() {
  const { signedIn } = useSession()
  const r = useAsync(() => (signedIn ? getDashboard() : Promise.resolve(null)), String(signedIn))

  if (!signedIn) {
    return (
      <Page bg="profile" title="Dashboard">
        <PageHeading title="Your dashboard" />
        <Signin />
      </Page>
    )
  }
  const d = r.data
  return (
    <Page bg="profile" title="Dashboard">
      <div className="dash">
        <div className="dash-main">
          <PageHeading title="Your health, in one place.">Manage your consultations, lab tests and health records with ease.</PageHeading>
          <DemoNotice>Preview of the signed-in dashboard. Web accounts are not open yet, so no account data is shown.</DemoNotice>

          <section className="dcard" aria-label="Complete your profile">
            <span className="dcard-icon"><FileText size={26} aria-hidden="true" /></span>
            <div className="dcard-text">
              <h2 className="t-card">Complete your profile</h2>
              <p className="text-support">Add a few details to get a more personalised experience.</p>
            </div>
            <MaybeLink href={LINKS.profile} className="btn btn-rect btn-outline">Complete profile</MaybeLink>
          </section>

          <div className="dash-cards">
            <Link href={LINKS.consultations} className="dcard dcard-link">
              <span className="dcard-icon"><Stethoscope size={28} aria-hidden="true" /></span>
              <span className="dcard-text"><span className="t-card">Consult a Doctor</span><span className="text-support">Book an online consultation with qualified doctors.</span></span>
              <span className="dcard-go" aria-hidden="true"><ChevronRight size={18} /></span>
            </Link>
            <Link href={LINKS.labTests} className="dcard dcard-link">
              <span className="dcard-icon"><FlaskConical size={28} aria-hidden="true" /></span>
              <span className="dcard-text"><span className="t-card">Lab Tests</span><span className="text-support">Book diagnostic tests from trusted labs.</span></span>
              <span className="dcard-go" aria-hidden="true"><ChevronRight size={18} /></span>
            </Link>
          </div>

          {r.status === 'error' ? (
            <ErrorState title="Your dashboard could not be loaded" onRetry={r.reload} />
          ) : !d ? (
            <LoadingSkeleton rows={2} variant="grid" />
          ) : (
            <div className="dash-panels">
              <Panel icon={CalendarDays} title="Upcoming appointments" items={d.appointments} empty="No upcoming appointments" hint="Your scheduled consultations will appear here."
                action={<Button variant="secondary" href={LINKS.consultations}>Book a consultation</Button>} />
              <Panel icon={FileText} title="Health records" items={d.records} empty="No records yet" hint="Your lab reports and medical records will appear here."
                action={<Button variant="secondary" href={LINKS.labTests}>View lab tests</Button>} />
            </div>
          )}
        </div>

        <nav className="dnav" aria-label="Account">
          <ul>
            {NAV.map(([Icon, label, href]) => (
              <li key={label}>
                <MaybeLink href={href} aria-current={href === '/dashboard' ? 'page' : undefined}><Icon size={20} aria-hidden="true" />{label}</MaybeLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Page>
  )
}
