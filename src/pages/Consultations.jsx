import { useId, useState } from 'react'
import { ArrowRight, PawPrint, Stethoscope, UserRound, Users } from 'lucide-react'
import { Breadcrumbs, EmptyState, ErrorState, LoadingSkeleton, PageHeading, SearchField, useAsync } from '../components/ui.jsx'
import { AreaPage } from '../components/patient.jsx'
import { Link, navigate, useSearchParams } from '../router.jsx'
import { DIRECTORY } from '../directory.js'
import { searchAll, suggest } from '../data.js'
import { LINKS } from '../site.js'

/* /consultations: choose a professional category, or search; then browse by specialty. */

const ToothIcon = ({ size = 28 }) => (
  <svg className="lucide" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5.5C10.6 4.1 8.6 3.7 7 4.5 5 5.5 4.5 8 5 10.2c.4 1.8 1 3.4 1.3 5.3.3 2.1.8 4.5 2.1 4.5 1.4 0 1.5-2.6 2-4.4.3-1 .9-1.8 1.6-1.8s1.3.8 1.6 1.8c.5 1.800.6 4.400 2 4.400 1.300 0 1.800-2.400 2.100-4.500.3-1.900.9-3.500 1.300-5.300.5-2.200 0-4.700-2-5.700-1.600-.8-3.600-.4-5 1z" />
  </svg>
)

// each card goes to its own directory (guide section 9), never to one shared list
const CATEGORIES = [
  { title: 'Doctors', text: 'Explore medical consultations across specialties.', href: LINKS.specialties, Icon: Stethoscope },
  { title: 'Dentists', text: 'Explore dental consultation providers.', href: LINKS.dentists, Icon: ToothIcon },
  { title: 'Veterinarians', text: 'Explore consultation providers for your pets.', href: LINKS.petCare, Icon: PawPrint },
  { title: 'Paramedical Professionals', text: 'Explore nutrition, psychological and rehabilitation services.', href: LINKS.paramedical, Icon: Users },
]

// the whole card is the one link, so there is nothing nested inside it to compete
const CategoryCard = ({ title, text, href, Icon }) => (
  <li>
    <Link href={href} className="cat-card">
      <span className="cat-icon"><Icon size={28} aria-hidden="true" /></span>
      <span className="t-card">{title}</span>
      <span className="cat-text">{text}</span>
      <span className="cat-go" aria-hidden="true"><ArrowRight size={18} /></span>
    </Link>
  </li>
)

const TILES = ['specialties', 'super-specialties'].flatMap((r) => DIRECTORY[r].specialties.map((s) => ({ ...s, href: `/${r}/${s.slug}` })))

/* ---- search ---- */

function Search({ q, onSubmit }) {
  const [text, setText] = useState(q)
  const [focus, setFocus] = useState(false)
  const [active, setActive] = useState(-1)
  const listId = useId()
  const groups = suggest(text)
  const flat = groups.flatMap((g) => g.items)
  const show = focus && flat.length > 0

  const onKey = (e) => {
    if (e.key === 'Escape') return setFocus(false)
    if (!show) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => {
        const n = i + (e.key === 'ArrowDown' ? 1 : -1)
        return n >= flat.length ? -1 : n < -1 ? flat.length - 1 : n
      })
    }
  }
  const submit = (value) => {
    if (show && active >= 0 && active < flat.length) return navigate(flat[active].href)
    onSubmit(value)
  }
  return (
    <SearchField
      label="Search for a doctor, dentist, specialty or service"
      placeholder="Search for a doctor, dentist, specialty or service"
      button="Search"
      value={text}
      onChange={(v) => { setText(v); setActive(-1) }}
      onSubmit={submit}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onKeyDown={onKey}
      role="combobox"
      aria-expanded={show}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
    >
      <div id={listId} role="listbox" aria-label="Suggestions" className="suggest" hidden={!show}>
        {groups.map((g) => (
          <div key={g.group} role="group" aria-label={g.group}>
            <p className="suggest-group" aria-hidden="true">{g.group}</p>
            {g.items.map((s) => {
              const i = flat.indexOf(s)
              return (
                <div key={s.href} id={`${listId}-${i}`} role="option" aria-selected={active === i} className="suggest-item" onMouseDown={(e) => e.preventDefault()} onClick={() => navigate(s.href)}>
                  {s.name}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </SearchField>
  )
}

function Results({ q, clear }) {
  const r = useAsync(() => searchAll(q), q)
  const { specialties, providers, providerTotal, labs } = r.data ?? {}
  const none = r.data && !specialties.length && !providers.length && !labs
  return (
    <section className="results" aria-labelledby="results-title" aria-busy={r.status === 'loading'}>
      <div className="results-head">
        <h2 id="results-title" className="t-h2">Results for “{q}”</h2>
        <button type="button" className="link-btn" onClick={clear}>Clear search</button>
      </div>
      {r.status === 'error' ? (
        <ErrorState title="Search could not be completed" onRetry={r.reload} />
      ) : !r.data ? (
        <LoadingSkeleton rows={3} variant="line" />
      ) : none ? (
        <EmptyState title="No matches found">Try a specialty such as Dermatology, a provider type such as Dentist, or a lab test name.</EmptyState>
      ) : (
        <div className="results-grid">
          {specialties.length > 0 && (
            <div>
              <h3 className="results-group">Specialties</h3>
              <ul className="results-list">
                {specialties.map((s) => <li key={s.route + s.slug}><Link href={`/${s.route}/${s.slug}`}>{s.name}<span>{s.group}</span></Link></li>)}
              </ul>
            </div>
          )}
          {providers.length > 0 && (
            <div>
              <h3 className="results-group">Providers</h3>
              <ul className="results-list">
                {providers.map((p) => <li key={p.slug}><Link href={`/providers/${p.slug}`}><UserRound size={16} aria-hidden="true" />{p.name}<span>{p.specialty}</span></Link></li>)}
              </ul>
              {providerTotal > providers.length && <p className="text-support">Showing {providers.length} of {providerTotal} providers. Open a specialty to see them all.</p>}
            </div>
          )}
          {labs && (
            <div>
              <h3 className="results-group">Lab services</h3>
              <ul className="results-list">
                <li><Link href={`/lab-tests?q=${encodeURIComponent(q)}`}>Search lab tests and packages for “{q}”</Link></li>
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default function Consultations() {
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const go = (value) => {
    const next = new URLSearchParams(params)
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    setParams(next, { replace: false })
  }
  return (
    <AreaPage bg="consult" title="Consultations">
      <Breadcrumbs items={[['Home', '/'], ['Consultations']]} />
      <PageHeading title="Find the right kind of care">Choose a professional category to begin.</PageHeading>

      <div className="search-block">
        <Search key={q} q={q} onSubmit={go} />
        <p className="text-meta">Search points you to the right kind of care; it is not a diagnosis. For emergency purposes, consult nearby hospital.</p>
      </div>

      {q && <Results q={q} clear={() => go('')} />}

      <ul className="cat-grid" aria-label="Professional categories">
        {CATEGORIES.map((c) => <CategoryCard key={c.title} {...c} />)}
      </ul>

      <section className="explore" aria-labelledby="explore-title">
        <h2 id="explore-title" className="t-h2">Explore by specialty</h2>
        <ul className="tile-grid">
          {TILES.map((t) => (
            <li key={t.href}><Link href={t.href} className="tile">{t.name}<ArrowRight size={16} aria-hidden="true" /></Link></li>
          ))}
        </ul>
      </section>
    </AreaPage>
  )
}
