import { useState } from 'react'
import { Briefcase, Clock, MapPin, Search } from 'lucide-react'
import banner from '../assets/BG/careers-banner.webp'
import { EmptyState, Page } from '../components/ui.jsx'
import { Link } from '../router.jsx'

/* /careers. There is no careers feed in the API yet, so ROLES is empty and the page says so plainly: no vacancy is
   invented and no Apply button appears. When roles exist, each is
   { id, title, department, location, type, href } and the search and filters start working.
   ponytail: fill ROLES from the careers source once it exists. */
const ROLES = []

export default function Careers() {
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('')
  const [place, setPlace] = useState('')
  const [kind, setKind] = useState('')
  const uniq = (k) => [...new Set(ROLES.map((r) => r[k]))]
  const shown = ROLES.filter((r) => (!dept || r.department === dept) && (!place || r.location === place) && (!kind || r.type === kind) && (!q || `${r.title} ${r.department} ${r.location}`.toLowerCase().includes(q.toLowerCase())))
  const none = ROLES.length === 0
  const Filter = ({ label, value, set, options }) => (
    <label className="cfilter"><span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)} disabled={none} aria-label={label}>
        <option value="">{label}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  )
  return (
    <Page bg="plain" title="Careers" wide>
      <div className="pcard-wrap">
        <header className="banner">
          <div className="banner-art" style={{ backgroundImage: `url(${banner})` }} aria-hidden="true" />
          <div className="banner-text">
            <h1 className="t-page">Build a healthier<br />tomorrow with us.</h1>
            <p className="page-sub">Be part of a team that’s making quality healthcare more accessible for everyone.</p>
          </div>
          <p className="banner-tag" aria-hidden="true">Different experts.<br />A healthier tomorrow.</p>
        </header>

        <section id="roles" className="roles-card" aria-labelledby="roles-h">
          <h2 id="roles-h" className="sr-only">Open positions</h2>
          <div className="cbar">
            <label className="rec-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search positions</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search positions" disabled={none} autoComplete="off" />
            </label>
            <Filter label="Department" value={dept} set={setDept} options={uniq('department')} />
            <Filter label="Location" value={place} set={setPlace} options={uniq('location')} />
            <Filter label="Job Type" value={kind} set={setKind} options={uniq('type')} />
          </div>

          {none ? (
            <EmptyState icon={Briefcase} title="There are no open positions right now">
              We do not have roles listed at the moment. Please check back soon, or <Link href="/support">contact us</Link> to ask.
            </EmptyState>
          ) : shown.length === 0 ? <EmptyState title="No positions match">Try a different search or filter.</EmptyState> : (
            <ul className="jobs">
              {shown.map((r) => (
                <li key={r.id} className="job">
                  <h3 className="t-card">{r.title}</h3>
                  <p className="text-meta">{r.department}</p>
                  <p className="text-meta"><MapPin size={16} aria-hidden="true" />{r.location}</p>
                  <p className="text-meta"><Clock size={16} aria-hidden="true" />{r.type}</p>
                  <Link href={r.href} className="link">View Role →</Link>
                </li>
              ))}
            </ul>
          )}

          <p className="text-support eeo">We are an equal opportunity employer. All applications are reviewed carefully and submission does not guarantee a response.</p>
        </section>
      </div>
    </Page>
  )
}
