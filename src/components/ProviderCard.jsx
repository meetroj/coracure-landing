import { ArrowRight, GraduationCap, UserRound } from 'lucide-react'
import { MaybeLink } from './layout.jsx'
import { Button, inr } from './ui.jsx'

/* One provider card for the whole site.
   - `provider` given: the directory's horizontal result card (name, specialty, qualifications, experience, fee, View Profile).
   - no `provider`: the homepage's CONCEPT card (variant "compact" = stacked, "horizontal" = avatar left); it carries no
     photo, name, qualification, experience or fee until approved provider data is connected.
   ponytail: no photograph field yet; when approved photos exist render <img> in `.avatar` (object-fit: cover). */

const dash = (v, unit = '') => (v === null || v === undefined || v === '' ? '—' : `${v}${unit}`)

export function ProviderCard({ provider, Icon, category, role, variant = 'compact' }) {
  if (provider) {
    return (
      <li className="pcard pcard-row">
        <span className="avatar"><UserRound size={44} aria-hidden="true" /></span>
        <div className="pcard-main">
          <h3 className="t-card">{provider.name}</h3>
          <p className="pcard-spec">{provider.specialty} <span className="pcard-tag-inline">Illustrative profile</span></p>
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
  return (
    <li className={`pcard pcard-${variant}`}>
      <span className="avatar"><UserRound size={40} aria-hidden="true" /></span>
      <div className="pcard-head">
        <p className="pcard-cat"><Icon size={18} aria-hidden="true" />{category}</p>
        <p className="pcard-tag">Concept profile</p>
      </div>
      <div className="pcard-body">
        <h3 className="t-card">{role} name</h3>
        <p className="pcard-qual"><GraduationCap size={16} aria-hidden="true" />Qualifications</p>
        <dl className="pcard-meta">
          <div><dt>Experience</dt><dd>—</dd></div>
          <div><dt>Fee</dt><dd>—</dd></div>
        </dl>
        {/* the concept cards have no profile page; the directory's cards (with `provider`) link to /providers/{slug} */}
        <MaybeLink href={null} className="link">View Profile <ArrowRight size={18} aria-hidden="true" /></MaybeLink>
      </div>
    </li>
  )
}
