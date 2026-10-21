import { useId, useState } from 'react'
import { CircleAlert, ClipboardCheck, Clock, Droplet, Droplets, HeartPulse, Leaf, MapPin, Microscope, TestTube } from 'lucide-react'
import { Breadcrumbs, Button, EmptyState, ErrorState, LoadingSkeleton, PageHeading, Pagination, SearchField, Tabs, inr, panelProps, useAsync } from '../components/ui.jsx'
import { PinBoxes, RESULT } from '../components/pin.jsx'
import { checkPin, getCatalogueItem, isUnavailable, searchCatalogue, validPin } from '../data.js'
import { AreaPage, LoginPrompt } from '../components/patient.jsx'
import { navigate, useSearchParams } from '../router.jsx'

/* /lab-tests: PIN-code serviceability, search, Health Packages / Individual Tests, catalogue cards.
   /lab-tests/{slug}: one package or test. State lives in the query string (?tab= &q= &pin= &page=). */

const PAGE_SIZE = 3
const TABS = [['tests', 'Individual Tests'], ['packages', 'Health Packages']]
const ICONS = { package: [HeartPulse, Droplet, Leaf], test: [TestTube, Droplets, Microscope] }

function write(patch) {
  const next = new URLSearchParams(location.search)
  for (const [k, v] of Object.entries(patch)) {
    if (v) next.set(k, v)
    else next.delete(k)
  }
  if (!('page' in patch)) next.delete('page')
  const qs = next.toString()
  navigate(location.pathname + (qs ? `?${qs}` : ''), { replace: true })
}

/* ---- serviceability ---- */

function ServiceabilityInput({ pin }) {
  const id = useId()
  const [text, setText] = useState('')
  const [invalid, setInvalid] = useState(false)
  const r = useAsync(() => (pin ? checkPin(pin) : Promise.resolve(null)), pin)

  const submit = (e) => {
    e.preventDefault()
    if (!validPin(text)) return setInvalid(true)
    setInvalid(false)
    write({ pin: text })
  }
  const change = () => {
    setText(pin ?? '')
    write({ pin: '' })
  }

  if (pin) {
    const res = RESULT[r.data?.status]
    return (
      <div className="field-wrap">
        <p className="field-label">PIN code</p>
        <div className="pin-result" role="status" aria-live="polite">
          {r.status === 'loading' && <p><MapPin size={18} aria-hidden="true" />Checking PIN {pin}…</p>}
          {r.status === 'error' && (
            <div className="pin-error" role="alert">
              <p><CircleAlert size={18} aria-hidden="true" />We could not check PIN {pin} right now.</p>
              <Button variant="secondary" onClick={r.reload}>Try again</Button>
            </div>
          )}
          {r.status === 'ok' && res && <p className={`pin-${res.tone}`}><res.Icon size={18} aria-hidden="true" />{res.text(pin)}</p>}
          <button type="button" className="link-btn" onClick={change}>Change PIN</button>
        </div>
      </div>
    )
  }
  return (
    <div className="field-wrap">
      <label className="field-label" htmlFor={id}>PIN code</label>
      <form className="field" onSubmit={submit} noValidate>
        <MapPin size={20} className="field-icon" aria-hidden="true" />
        <input id={id} value={text} onChange={(e) => { setText(e.target.value.replace(/\D/g, '').slice(0, 6)); setInvalid(false) }}
          inputMode="numeric" autoComplete="postal-code" placeholder="Enter your PIN code" aria-invalid={invalid} aria-describedby={`${id}-help`} />
        <button type="submit" className="btn btn-rect btn-primary field-btn">Check</button>
      </form>
      <p id={`${id}-help`} className={invalid ? 'field-help field-error' : 'field-help'} role={invalid ? 'alert' : undefined}>
        {invalid ? 'Enter a valid 6-digit PIN code.' : 'We use your PIN code to check lab availability in your area.'}
      </p>
    </div>
  )
}

/* ---- catalogue ---- */

function LabCatalogueCard({ item, index, pin }) {
  const Icon = ICONS[item.kind][index % 3]
  return (
    <li className="lcard">
      <span className="lcard-icon"><Icon size={26} aria-hidden="true" /></span>
      <h3 className="t-card">{item.name}</h3>
      <p className="text-support">{item.summary}</p>
      <dl className="lcard-price"><dt>Price</dt><dd>{inr(item.price)}</dd></dl>
      <Button variant="secondary" href={`/lab-tests/${item.slug}${pin ? `?pin=${pin}` : ''}`} aria-label={`View details of ${item.name}`}>View Details</Button>
    </li>
  )
}

export default function LabTests() {
  const [params] = useSearchParams()
  const tab = params.get('tab') === 'packages' ? 'packages' : 'tests'
  const q = params.get('q') ?? ''
  const pin = validPin(params.get('pin') ?? '') ? params.get('pin') : ''
  const pages = Math.max(1, Number(params.get('page')) || 1)

  const [text, setText] = useState(q)
  const [seenQ, setSeenQ] = useState(q)
  if (q !== seenQ) {
    setSeenQ(q)
    setText(q)
  }

  const r = useAsync(() => searchCatalogue({ kind: tab === 'tests' ? 'test' : 'package', q, limit: pages * PAGE_SIZE }), `${tab}|${q}|${pages}`)
  const data = r.data

  let body
  if (r.status === 'error') {
    body = r.error?.loginRequired ? <LoginPrompt what="lab tests" />
      : isUnavailable(r.error)
      ? <EmptyState title="The lab catalogue is not available yet">Tests and health packages appear here once the approved catalogue is connected.</EmptyState>
      : <ErrorState title="The catalogue could not be loaded" onRetry={r.reload} />
  } else if (!data) body = <LoadingSkeleton rows={3} variant="grid" />
  else if (!data.total) {
    body = (
      <EmptyState title={q.trim() ? `No ${tab === 'tests' ? 'tests' : 'packages'} found` : 'Nothing listed here yet'} action={q.trim() && <Button variant="secondary" onClick={() => write({ q: '' })}>Clear search</Button>}>
        {q.trim() ? 'Try a different name.' : 'Check back soon.'}
      </EmptyState>
    )
  } else {
    body = (
      <>
        <ul className="lgrid">{data.items.map((it, i) => <LabCatalogueCard key={it.slug} item={it} index={i} pin={pin} />)}</ul>
        <Pagination shown={data.items.length} total={data.total} noun={tab === 'tests' ? 'tests' : 'packages'} busy={r.status === 'loading'} onMore={() => write({ page: String(pages + 1) })} />
      </>
    )
  }

  return (
    <AreaPage bg="lab" title="Lab tests and health packages">
      <Breadcrumbs items={[['Home', '/'], ['Lab Tests']]} />
      <PageHeading title="Lab tests and health packages">Check availability in your area.</PageHeading>

      <div className="lab-controls">
        <ServiceabilityInput key={pin} pin={pin} />
        <SearchField label="Search tests or packages" placeholder="Search tests or packages" button="Search" clearLabel="Clear search" value={text} onChange={setText} onSubmit={(v) => write({ q: v.trim() })} />
      </div>

      <Tabs label="Catalogue" idBase="lab" className="tabs-lab" items={TABS} value={tab} onChange={(v) => write({ tab: v === 'packages' ? 'packages' : '' })} />
      <div {...panelProps('lab', tab)} className={`catalogue${r.status === 'loading' && data ? ' is-updating' : ''}`} aria-busy={r.status === 'loading'}>{body}</div>
    </AreaPage>
  )
}

/* ---- /lab-tests/{slug} ---- */

const NOT_YET = 'appears here when the lab catalogue is connected.'

// the PIN box and what it found; nothing here claims a collection option the service has not confirmed
function CheckAvailability({ pin, testId }) {
  const help = useId()
  const [digits, setDigits] = useState(() => Array.from({ length: 6 }, (_, i) => pin[i] ?? ''))
  const [invalid, setInvalid] = useState(false)
  const r = useAsync(() => (pin ? checkPin(pin, testId) : Promise.resolve(null)), pin)
  const res = r.status === 'ok' && r.data ? RESULT[r.data.status] : null

  const submit = (e) => {
    e.preventDefault()
    const v = digits.join('')
    if (!validPin(v)) return setInvalid(true)
    setInvalid(false)
    write({ pin: v })
  }
  return (
    <aside className="dtl-side" aria-labelledby="avail-title">
      <h2 id="avail-title" className="t-card">Check availability</h2>
      <p className="text-support">Enter your PIN to see available collection options in your area.</p>
      <form onSubmit={submit} noValidate>
        <PinBoxes digits={digits} onChange={(d) => { setDigits(d); setInvalid(false) }} invalid={invalid} describedBy={help} />
        <p id={help} className={invalid ? 'field-help field-error' : 'sr-only'} role={invalid ? 'alert' : undefined}>
          {invalid ? 'Enter a valid 6-digit PIN code.' : 'Six digits.'}
        </p>
        <Button className="dtl-check" type="submit" disabled={r.status === 'loading' && Boolean(pin)}>{r.status === 'loading' && pin ? 'Checking…' : 'Check'}</Button>
      </form>
      <div className="dtl-options" aria-live="polite">
        <h3 className="t-card">Collection options</h3>
        {r.status === 'error' ? (
          <div className="pin-error" role="alert">
            <p><CircleAlert size={18} aria-hidden="true" />We could not check PIN {pin} right now.</p>
            <Button variant="secondary" onClick={r.reload}>Try again</Button>
          </div>
        ) : res ? (
          <p className={`dtl-note pin-${res.tone}`}><res.Icon size={20} aria-hidden="true" />{res.text(pin)}</p>
        ) : (
          <p className="dtl-note"><Clock size={20} aria-hidden="true" />{pin ? `Checking PIN ${pin}…` : 'Enter your PIN to view available home collection and lab centre options near you.'}</p>
        )}
      </div>
      <Button disabled>Continue</Button>
      {res && <p className="text-meta">Ordering is not available on the website yet.</p>}
    </aside>
  )
}

export function LabDetail({ slug }) {
  const [params] = useSearchParams()
  const pin = validPin(params.get('pin') ?? '') ? params.get('pin') : ''
  const r = useAsync(() => getCatalogueItem(slug), slug)
  const item = r.data

  let body
  if (r.status === 'error') {
    body = r.error?.loginRequired ? <LoginPrompt what="this test" />
      : isUnavailable(r.error)
      ? <EmptyState title="The lab catalogue is not available yet" action={<Button href="/lab-tests">Back to lab tests</Button>} />
      : <ErrorState title="This page could not be loaded" onRetry={r.reload} />
  } else if (r.status === 'loading') body = <LoadingSkeleton rows={3} />
  else if (!item) body = <EmptyState title="Not found" action={<Button href="/lab-tests">Back to lab tests</Button>}>This test or package does not exist or is no longer listed.</EmptyState>
  else {
    const noun = item.kind === 'test' ? 'test' : 'package'
    body = (
      <div className="lab-detail">
        <section className="dtl-main" aria-label={`About ${item.name}`}>
          <div className="dtl-block">
            <h2 className="t-card">About this {noun}</h2>
            <p>{item.about ?? `Information about this ${noun} ${NOT_YET}`}</p>
          </div>
          <div className="dtl-block">
            <h2 className="t-card">What is included</h2>
            {item.components
              ? <ul className="included">{item.components.map((c) => <li key={c}>{c}</li>)}</ul>
              : <p>The list of tests included {NOT_YET}</p>}
          </div>
          <div className="dtl-block prep-grid">
            <div className="prep">
              <ClipboardCheck size={28} aria-hidden="true" />
              <div>
                <h3 className="t-card">Preparation</h3>
                <p className="text-support">{item.preparation ?? `Preparation instructions ${NOT_YET}`}</p>
              </div>
            </div>
            <div className="prep">
              <TestTube size={28} aria-hidden="true" />
              <div>
                <h3 className="t-card">Sample information</h3>
                <p className="text-support">{item.sample ?? `Sample information ${NOT_YET}`}</p>
              </div>
            </div>
          </div>
          <p className="text-meta dtl-price">Price: {inr(item.price)}{item.price === null && ' (shown when the lab catalogue is connected)'}</p>
        </section>
        <CheckAvailability pin={pin} testId={item.slug} />
      </div>
    )
  }
  return (
    <AreaPage bg="plain" title={item?.name ?? 'Lab test'} back={['/lab-tests', 'Back to lab tests']}>
      <Breadcrumbs items={[['Home', '/'], ['Lab Tests', `/lab-tests${pin ? `?pin=${pin}` : ''}`], [item?.name ?? 'Details']]} />
      {item && <PageHeading title={item.name}>{item.summary}</PageHeading>}
      {body}
    </AreaPage>
  )
}
