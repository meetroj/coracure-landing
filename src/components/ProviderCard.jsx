import { GraduationCap, UserRound } from 'lucide-react'
import { Button, inr } from './ui.jsx'

/* The directory's provider result card: name, specialty, qualifications, experience, fee and View Profile. Only fields
   the API supplies are shown; a missing one is a dash.
   ponytail: no photograph yet; when the API serves photos render <img> in `.avatar` (object-fit: cover). */

const dash = (v, unit = '') => (v === null || v === undefined || v === '' ? '-' : `${v}${unit}`)

export function ProviderCard({ provider }) {
  return (
    <li className="pcard pcard-row">
      <span className="avatar"><UserRound size={44} aria-hidden="true" /></span>
      <div className="pcard-main">
        <h3 className="t-card">{provider.name}</h3>
        <p className="pcard-spec">{provider.specialty}</p>
        <p className="pcard-qual"><GraduationCap size={16} aria-hidden="true" />Qualifications: {dash(provider.qualifications)}</p>
        <dl className="pcard-meta pcard-meta-row">
          <div><dt>Experience</dt><dd>{dash(provider.experience, ' years')}</dd></div>
          <div><dt>Consultation fee</dt><dd>{inr(provider.fee)}</dd></div>
        </dl>
      </div>
      <Button href={`/providers/${provider.slug}`} className="pcard-cta" aria-label={`View profile of ${provider.name}, ${provider.specialty}`}>View Profile</Button>
    </li>
  )
}
