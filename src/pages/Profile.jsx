import { useState } from 'react'
import { Award, BadgeCheck, ChevronDown, Clock, GraduationCap, Globe, Languages, Share2, Stethoscope, UserRound, Video, Volume2 } from 'lucide-react'
import { Breadcrumbs, Button, EmptyState, ErrorState, LoadingSkeleton, useAsync, useMedia } from '../components/ui.jsx'
import { AvailabilityPanel } from '../components/booking.jsx'
import { DIRECTORY } from '../directory.js'
import { getProvider, isUnavailable } from '../data.js'
import { AreaPage, LoginPrompt } from '../components/patient.jsx'

/* /providers/{slug}: a shareable public profile. Only fields the data supplies are shown; a missing field is a dash
   or an honest "will appear here", never invented text. There is no "Verified by CoraCure" badge, photo or registration
   badge until the data says so. Desktop: summary and detail sections on the left, the booking card on the right.
   Phones: summary, booking card, then the detail sections as an accordion. */

const dash = (v, unit = '') => (v === null || v === undefined || v === '' ? '-' : `${v}${unit}`)

// the native share sheet where there is one, otherwise the link goes to the clipboard
function ShareButton({ name }) {
  const [msg, setMsg] = useState('')
  async function share() {
    const url = location.origin + location.pathname
    try {
      if (navigator.share) await navigator.share({ title: name, url })
      else {
        await navigator.clipboard.writeText(url)
        setMsg('Link copied.')
      }
    } catch (e) {
      if (e.name !== 'AbortError') setMsg('Copy the link from your browser address bar.')
    }
  }
  return (
    <div className="pshare">
      <button type="button" className="pshare-btn" onClick={share} aria-label={`Share ${name}`}><Share2 size={16} aria-hidden="true" /><span>Share</span></button>
      <span className="text-meta" role="status">{msg}</span>
    </div>
  )
}

function Summary({ p }) {
  return (
    <section className="psum" aria-labelledby="provider-name">
      <div className="psum-photo" aria-hidden="true"><UserRound size={72} /></div>
      <div className="psum-main">
        <div className="psum-top">
          <span />
          <ShareButton name={p.name} />
        </div>
        <h1 id="provider-name" className="t-page">{p.name}</h1>
        <p className="psum-spec"><Stethoscope size={18} aria-hidden="true" />{p.specialty}</p>
        <ul className="psum-facts">
          {p.qualifications && <li><GraduationCap size={18} aria-hidden="true" />{p.qualifications}</li>}
          {p.experience != null && <li><Award size={18} aria-hidden="true" />{p.experience}+ years experience</li>}
          {p.languages.length > 0 && <li><Languages size={18} aria-hidden="true" />{p.languages.join(', ')}</li>}
          {p.registration && <li><BadgeCheck size={18} aria-hidden="true" />Registration: {p.registration}</li>}
        </ul>
        <ul className="psum-modes" aria-label="Consultation modes">
          <li><Video size={18} aria-hidden="true" />Video Consultation</li>
          <li><Volume2 size={18} aria-hidden="true" />Audio Consultation</li>
        </ul>
      </div>
    </section>
  )
}

// a titled detail block: an open section on desktop, a collapsed row on phones
function Block({ id, icon: Icon, title, phone, children }) {
  if (!phone) return <section id={id} className="pblock" aria-labelledby={`${id}-t`}><h2 id={`${id}-t`} className="t-card">{title}</h2>{children}</section>
  return (
    <details id={id} name="pdetail" className="pacc">
      <summary><Icon size={20} aria-hidden="true" /><span>{title}</span><ChevronDown size={18} aria-hidden="true" /></summary>
      <div className="pacc-body">{children}</div>
    </details>
  )
}

const TABS = [['about', 'About'], ['areas', 'Areas of Consultation'], ['qualifications', 'Qualifications'], ['experience', 'Experience'], ['languages', 'Languages'], ['availability', 'Availability']]

function Details({ p }) {
  const phone = useMedia('(max-width: 767px)')
  const [tab, setTab] = useState('about')
  return (
    <div className="pdetails">
      {!phone && (
        <nav className="ptabs" aria-label="On this page">
          {TABS.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={tab === id ? 'true' : undefined} onClick={() => setTab(id)}>{label}</a>)}
        </nav>
      )}
      <div className="pgrid">
        <div className="pcol">
          <Block id="about" icon={UserRound} title="About" phone={phone}>
            <p>Information about the provider’s professional background and approach to patient care will appear here once approved profile details are connected.</p>
          </Block>
          <Block id="areas" icon={Stethoscope} title="Areas of Consultation" phone={phone}>
            <p>Key areas of consultation will be listed here once approved profile details are connected.</p>
          </Block>
          <Block id="qualifications" icon={GraduationCap} title="Qualifications" phone={phone}>
            <p>{dash(p.qualifications)}</p>
            {!p.qualifications && <p className="text-support">Qualifications and registration appear here once they are supplied and approved.</p>}
          </Block>
          <Block id="experience" icon={Award} title="Experience" phone={phone}>
            <p>{p.experience != null ? `${p.experience}+ years of clinical experience in ${p.specialty}.` : '-'}</p>
          </Block>
        </div>
        <div className="pcol">
          <Block id="languages" icon={Globe} title="Languages" phone={phone}>
            {p.languages.length ? <ul className="plist">{p.languages.map((l) => <li key={l}><Globe size={16} aria-hidden="true" />{l}</li>)}</ul> : <p>-</p>}
          </Block>
          <Block id="availability" icon={Clock} title="Availability" phone={phone}>
            <p>Consultation slots are updated regularly. Please select a date to view available timings.</p>
          </Block>
        </div>
      </div>
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
    body = r.error?.loginRequired ? <LoginPrompt what="this provider" />
      : isUnavailable(r.error)
      ? <EmptyState title="Provider profiles are not available yet" action={<Button href="/consultations">Browse consultations</Button>}>Profiles open once approved provider data is connected.</EmptyState>
      : <ErrorState title="This profile could not be loaded" onRetry={r.reload} />
  } else if (r.status === 'loading') body = <LoadingSkeleton rows={3} />
  else if (!p) body = <EmptyState title="Provider not found" action={<Button href="/consultations">Browse consultations</Button>}>This profile does not exist or is no longer listed.</EmptyState>
  else {
    body = (
      <div className="ppage">
        <Summary p={p} />
        <AvailabilityPanel provider={p} />
        <Details p={p} />
      </div>
    )
  }

  return (
    <AreaPage bg="plain" title={title} back={p ? [`/${p.group}/${p.specialtySlug}`, 'Back to providers'] : ['/consultations', 'Back to consultations']}>
      <Breadcrumbs items={[['Home', '/'], ...(p ? [[dir.crumb, `/${p.group}`], [p.specialty, `/${p.group}/${p.specialtySlug}`], [p.name]] : [['Consultations', '/consultations'], ['Provider']])]} />
      {body}
    </AreaPage>
  )
}
