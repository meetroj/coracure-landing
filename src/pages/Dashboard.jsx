import { useState } from 'react'
import { ArrowRight, CalendarDays, ChevronRight, FileText, FlaskConical, Stethoscope, UserRound } from 'lucide-react'
import { Button, ErrorState, LoadingSkeleton, PageHeading, useAsync } from '../components/ui.jsx'
import { PatientShell, consultBadge, dayMonth, daypart, fmtDate, fmtDateTime, firstName, labBadge, openLink, useSpecialties } from '../components/patient.jsx'
import { completion, fileLink, getProfile, getProvider, listConsultations, listFiles, listLabOrders } from '../account.js'
import { errorText } from '../api.js'
import { Link } from '../router.jsx'
import { LINKS } from '../site.js'

/* /dashboard: the signed-in patient's home. Every section loads on its own, so one failing call shows one retry
   instead of an empty page, and nothing is shown that the API did not return. */

const Panel = ({ icon: Icon, title, to, toLabel, r, empty, children }) => (
  <section className="dpanel" aria-label={title}>
    <div className="dpanel-head">
      <h2 className="t-card"><Icon size={20} aria-hidden="true" />{title}</h2>
      {to && <Link href={to} className="link">{toLabel}<ArrowRight size={16} aria-hidden="true" /></Link>}
    </div>
    {r.status === 'error' ? <ErrorState title="This could not be loaded" onRetry={r.reload}>{errorText(r.error)}</ErrorState>
      : !r.data ? <LoadingSkeleton rows={1} variant="card" />
      : r.data.length === 0 ? <div className="dempty">{empty}</div>
      : children}
  </section>
)

function ProfileCard({ r }) {
  const p = r.data
  const c = completion(p)
  const initials = p?.fullName ? p.fullName.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : null
  return (
    <section className="dcard health-card" aria-label="Your health profile">
      <span className="health-avatar" aria-hidden="true">{initials ?? <UserRound size={28} />}</span>
      <div className="dcard-text">
        <h2 className="t-card">Your Health Profile</h2>
        {r.status === 'error' ? <p className="text-support">{errorText(r.error)}</p>
          : !p ? <p className="text-support">Loading…</p>
          : <>
              <p className="text-support">{p.fullName ?? 'Name not added yet'}{p.age != null ? ` · ${p.age} years` : ''}</p>
              <div className="meter" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.percent}><span style={{ width: `${c.percent}%` }} /></div>
              <p className="text-meta">{c.percent}% complete{c.done < c.total ? ` · still to add: ${c.items.filter(([, ok]) => !ok).map(([l]) => l.toLowerCase()).join(', ')}` : ''}</p>
            </>}
      </div>
      {p && <Button variant="secondary" href="/profile">{c.done < c.total ? 'Complete Profile' : 'Edit Profile'}</Button>}
    </section>
  )
}

function Appointment({ c, specialties }) {
  const [d, m] = dayMonth(c.scheduledStartAt)
  const prov = useAsync(() => (c.doctorId ? getProvider(c.doctorId).catch(() => null) : Promise.resolve(null)), c.id)
  return (
    <li className="arow">
      <span className="datebox" aria-hidden="true"><strong>{d}</strong>{m}</span>
      <div className="arow-main">
        <p className="t-card">{prov.data?.fullName ?? (c.doctorId ? 'Your doctor' : 'Doctor to be assigned')}</p>
        <p className="text-meta">{specialties.get(c.specialtyId) ?? 'Consultation'} · {c.channel === 'audio' ? 'Audio' : 'Video'} consultation · {fmtDateTime(c.scheduledStartAt)}</p>
      </div>
      {consultBadge(c.status)}
    </li>
  )
}

const RECORD_CATEGORIES = new Set(['prescription_pdf', 'report'])

function DashboardBody() {
  const profile = useAsync(getProfile, 'profile')
  const specialties = useSpecialties()
  const appts = useAsync(() => listConsultations({ upcoming: true, limit: 3 }), 'appts')
  const labs = useAsync(() => listLabOrders('upcoming').then((p) => p.items.slice(0, 2)), 'labs')
  const records = useAsync(() => listFiles().then((f) => f.filter((x) => RECORD_CATEGORIES.has(x.category)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)), 'records')
  const [fileError, setFileError] = useState(null)
  const name = firstName(profile.data?.fullName)
  return (
    <>
      <PageHeading title={`${daypart()}${name ? `, ${name}` : ''}.`}>Take charge of your health with CoraCure.</PageHeading>
      <ProfileCard r={profile} />

      <div className="quick" role="list" aria-label="Quick actions">
        {[
          [Stethoscope, 'Book Consultation', 'Find a doctor', LINKS.consultations],
          [FlaskConical, 'Book Lab Test', 'Explore tests', LINKS.labTests],
          [FileText, 'View Reports', 'Your health records', '/health-records?tab=reports'],
          [UserRound, 'Manage Profile', 'Personal details', '/profile'],
        ].map(([Icon, title, sub, href]) => (
          <Link key={title} href={href} className="qa" role="listitem"><Icon size={24} aria-hidden="true" /><strong>{title}</strong><span>{sub}</span></Link>
        ))}
      </div>

      <Panel icon={CalendarDays} title="Upcoming Appointment" to="/health-records?tab=consultations" toLabel="All consultations" r={appts}
        empty={<><p className="dempty-title">No upcoming appointments</p><p className="text-support">When you book a consultation it appears here.</p><Button variant="secondary" href={LINKS.consultations}>Book a consultation</Button></>}>
        <ul className="alist">{(appts.data ?? []).map((c) => <Appointment key={c.id} c={c} specialties={specialties} />)}</ul>
      </Panel>

      <Panel icon={FlaskConical} title="Upcoming Lab Order" to="/health-records?tab=reports" toLabel="Reports" r={labs}
        empty={<><p className="dempty-title">No upcoming lab orders</p><p className="text-support">Orders for tests and packages appear here.</p><Button variant="secondary" href={LINKS.labTests}>Explore lab tests</Button></>}>
        <ul className="alist">
          {(labs.data ?? []).map((o) => {
            const [d, m] = dayMonth(o.collection.scheduledAt ?? o.collection.preferredAt ?? o.createdAt)
            return (
              <li key={o.id} className="arow">
                <span className="datebox" aria-hidden="true"><strong>{d}</strong>{m}</span>
                <div className="arow-main">
                  <p className="t-card">{o.items.map((i) => i.name).join(', ')}</p>
                  <p className="text-meta">{o.collection.type === 'home_collection' ? 'Home collection' : 'Walk-in'} · Order {o.referenceCode}</p>
                </div>
                {labBadge(o.status)}
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel icon={FileText} title="Recent Records" to="/health-records" toLabel="View all health records" r={records}
        empty={<><p className="dempty-title">No records yet</p><p className="text-support">Prescriptions and reports from your care appear here.</p></>}>
        {fileError && <p className="field-error" role="alert">{fileError}</p>}
        <ul className="alist">
          {(records.data ?? []).map((f) => (
            <li key={f.id} className="arow">
              <span className="datebox datebox-icon" aria-hidden="true"><FileText size={20} /></span>
              <div className="arow-main">
                <p className="t-card">{f.fileName}</p>
                <p className="text-meta">{f.category === 'prescription_pdf' ? 'Prescription' : 'Report'} · {fmtDate(f.createdAt)}</p>
              </div>
              <button type="button" className="link-btn" aria-label={`View ${f.fileName}`} onClick={() => { setFileError(null); openLink(() => fileLink(f.id)).catch((e) => setFileError(errorText(e, 'This file could not be opened. Please try again.'))) }}>View<ChevronRight size={16} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  )
}

export default function Dashboard() {
  return (
    <PatientShell title="Dashboard">
      <DashboardBody />
    </PatientShell>
  )
}
