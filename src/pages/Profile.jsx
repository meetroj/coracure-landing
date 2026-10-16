import { useEffect, useState } from 'react'
import { CalendarDays, UserRound, Video } from 'lucide-react'
import { Breadcrumbs, Button, DemoNotice, EmptyState, ErrorState, LoadingSkeleton, Page, Tabs, inr, panelProps, useAsync } from '../components/ui.jsx'
import { AvailabilityPanel } from '../components/booking.jsx'
import { DIRECTORY } from '../directory.js'
import { getProvider, isUnavailable } from '../data.js'
import { scrollToEl } from '../scroll.js'

/* /providers/{slug}: a shareable public profile. Only fields the data supplies are shown; a missing field is a dash
   or an honest "will appear here", never invented text. */

const dash = (v, unit = '') => (v === null || v === undefined || v === '' ? '—' : `${v}${unit}`)
const TABS = [['about', 'About'], ['qualifications', 'Qualifications'], ['details', 'Consultation details']]

function ProfileSummary({ p }) {
  return (
    <section className="summary" aria-labelledby="provider-name">
      <span className="avatar avatar-lg"><UserRound size={56} aria-hidden="true" /></span>
      <div className="summary-main">
        <div className="summary-title">
          <h1 id="provider-name" className="t-h2">{p.name}</h1>
          <span className="badge">Illustrative profile</span>
        </div>
        <p className="summary-spec">{p.specialty}</p>
        <dl className="facts">
          <div><dt>Qualifications</dt><dd>{dash(p.qualifications)}</dd></div>
          <div><dt>Registration details</dt><dd>{dash(p.registration)}</dd></div>
          <div><dt>Experience</dt><dd>{dash(p.experience, ' years')}</dd></div>
          {p.languages.length > 0 && <div><dt>Languages</dt><dd>{p.languages.join(', ')}</dd></div>}
        </dl>
        <p className="online"><Video size={16} aria-hidden="true" />Online consultation</p>
      </div>
    </section>
  )
}

function ProfileTabs({ p }) {
  const [tab, setTab] = useState('about')
  return (
    <section className="profile-tabs">
      <Tabs label="Provider information" idBase="profile" items={TABS} value={tab} onChange={setTab} />
      <div className="tabpanel" {...panelProps('profile', tab)}>
        {tab === 'about' && (
          <>
            <h2 className="t-h2">About</h2>
            <p>Information about the provider’s professional background, areas of interest and approach to patient care will appear here once approved profile details are connected.</p>
            <h3 className="t-card">Areas of focus</h3>
            <p className="text-support">Key areas of clinical interest will be listed here.</p>
          </>
        )}
        {tab === 'qualifications' && (
          <>
            <h2 className="t-h2">Qualifications</h2>
            <dl className="facts facts-stack">
              <div><dt>Qualifications</dt><dd>{dash(p.qualifications)}</dd></div>
              <div><dt>Registration details</dt><dd>{dash(p.registration)}</dd></div>
            </dl>
            <p className="text-support">Qualifications and registration details are shown here once they are supplied and approved.</p>
          </>
        )}
        {tab === 'details' && (
          <>
            <h2 className="t-h2">Consultation details</h2>
            <dl className="facts facts-stack">
              <div><dt>Mode</dt><dd>Online consultation</dd></div>
              <div><dt>Consultation fee</dt><dd>{inr(p.fee)}</dd></div>
              <div><dt>Languages</dt><dd>{p.languages.join(', ') || '—'}</dd></div>
              <div><dt>Time zone</dt><dd>IST (UTC+05:30)</dd></div>
            </dl>
            <p className="text-support">Available dates and times are shown in the Consultation availability panel.</p>
          </>
        )}
      </div>
    </section>
  )
}

// phones and tablets: the panel sits below the content, so a bar at the bottom jumps to it until it is on screen
function JumpToAvailability() {
  const [seen, setSeen] = useState(0) // how many of the panel / the footer are on screen
  useEffect(() => {
    const on = new Set()
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? on.add(e.target) : on.delete(e.target)))
      setSeen(on.size)
    })
    document.querySelectorAll('#availability, .footer').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  if (seen) return null
  return (
    <div className="jump">
      <Button onClick={() => scrollToEl(document.getElementById('availability'))}><CalendarDays size={18} aria-hidden="true" />Select a date and time</Button>
    </div>
  )
}

export default function Profile({ slug }) {
  const r = useAsync(() => getProvider(slug), slug)
  const p = r.data
  const dir = p && DIRECTORY[p.group]
  const title = p?.name ?? 'Provider profile'

  let body
  if (r.status === 'error') {
    body = isUnavailable(r.error)
      ? <EmptyState title="Provider profiles are not available yet" action={<Button href="/consultations">Browse consultations</Button>}>Profiles open once approved provider data is connected.</EmptyState>
      : <ErrorState title="This profile could not be loaded" onRetry={r.reload} />
  } else if (r.status === 'loading') body = <LoadingSkeleton rows={3} />
  else if (!p) body = <EmptyState title="Provider not found" action={<Button href="/consultations">Browse consultations</Button>}>This profile does not exist or is no longer listed.</EmptyState>
  else {
    body = (
      <div className="profile">
        <div className="profile-main">
          <ProfileSummary p={p} />
          <ProfileTabs p={p} />
        </div>
        <AvailabilityPanel provider={p} />
      </div>
    )
  }

  return (
    <Page bg="profile" title={title}>
      <Breadcrumbs items={[['Home', '/'], ...(p ? [[dir.crumb, `/${p.group}`], [p.specialty, `/${p.group}/${p.specialtySlug}`], [p.name]] : [['Consultations', '/consultations'], ['Provider']])]} />
      <DemoNotice />
      {body}
      {p && <JumpToAvailability />}
    </Page>
  )
}
