import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Eye, FileText, Lock, ReceiptText, Search } from 'lucide-react'
import { Button, EmptyState, ErrorState, LoadingSkeleton, PageHeading, Tabs, inr, panelProps, useAsync } from '../components/ui.jsx'
import { Notice } from '../components/forms.jsx'
import { PatientShell, consultBadge, fmtDate, fmtDateTime, openLink, paymentBadge, useSpecialties } from '../components/patient.jsx'
import { fileLink, getProvider, labReportLink, listConsultations, listFiles, listLabOrders, listPayments } from '../account.js'
import { errorText } from '../api.js'
import { useSearchParams } from '../router.jsx'

/* /health-records: four tabs (Consultations, Payments, Prescriptions, Reports). Files open through a signed link that
   is requested at the moment of the click and expires, never a stored URL. */

const TABS = [['consultations', 'Consultations'], ['payments', 'Payments'], ['prescriptions', 'Prescriptions'], ['reports', 'Reports']]
const PAGE = 20

/** First page on mount (and on reload), then `more()` for the next one. load(last) gets the last row held, or undefined. */
function usePaged(load, key) {
  const [s, setS] = useState({ items: [], status: 'loading', done: false, error: null, busy: false })
  const latest = useRef(load)
  latest.current = load
  const first = useCallback(() => {
    setS({ items: [], status: 'loading', done: false, error: null, busy: false })
    latest.current(undefined).then(
      (items) => setS({ items, status: 'ok', done: items.length < PAGE, error: null, busy: false }),
      (error) => setS({ items: [], status: 'error', done: true, error, busy: false }),
    )
  }, [])
  useEffect(first, [first, key])
  const more = () => {
    setS((v) => ({ ...v, busy: true }))
    latest.current(s.items[s.items.length - 1]).then(
      (items) => setS((v) => ({ ...v, items: [...v.items, ...items], done: items.length < PAGE, busy: false })),
      (error) => setS((v) => ({ ...v, busy: false, error })),
    )
  }
  return { ...s, more, reload: first }
}

const Controls = ({ q, setQ, sort, setSort, status, setStatus, statuses, noun }) => (
  <div className="rec-controls">
    {setQ && (
      <label className="rec-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search {noun}</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${noun}`} autoComplete="off" />
      </label>
    )}
    {statuses && (
      <label className="rec-select"><span>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {statuses.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      </label>
    )}
    <label className="rec-select"><span>Sort</span>
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="new">Newest first</option>
        <option value="old">Oldest first</option>
      </select>
    </label>
  </div>
)

const useControls = (statuses) => {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('new')
  const [status, setStatus] = useState('')
  return { q, setQ, sort, setSort, status, setStatus, statuses }
}
const arrange = (rows, c, text, dateOf, statusOf) => {
  const q = c.q.trim().toLowerCase()
  return rows
    .filter((r) => (!c.status || statusOf?.(r) === c.status) && (!q || text(r).toLowerCase().includes(q)))
    .sort((a, b) => (c.sort === 'new' ? 1 : -1) * String(dateOf(b)).localeCompare(String(dateOf(a))))
}

function List({ pg, rows, empty, noun, children }) {
  if (pg.status === 'loading') return <LoadingSkeleton rows={4} variant="card" />
  if (pg.status === 'error' && pg.items.length === 0) return <ErrorState title={`Your ${noun} could not be loaded`} onRetry={pg.reload}>{errorText(pg.error)}</ErrorState>
  if (pg.items.length === 0) return <EmptyState icon={FileText} title={empty[0]}>{empty[1]}</EmptyState>
  return (
    <>
      {rows.length === 0 ? <EmptyState title="Nothing matches those filters">Try clearing the search or the status filter.</EmptyState> : <ul className="rlist">{children}</ul>}
      {pg.error && <Notice tone="error">{errorText(pg.error)}</Notice>}
      <div className="pager">
        <p className="text-support" aria-live="polite">Showing {pg.items.length} {noun}</p>
        {!pg.done && <Button variant="secondary" onClick={pg.more} disabled={pg.busy}>{pg.busy ? 'Loading…' : 'Load more'}</Button>}
      </div>
    </>
  )
}

/* ---------- tabs ---------- */

const CONSULT_STATUSES = [['scheduled', 'Confirmed'], ['awaiting_doctor', 'Awaiting Doctor Acceptance'], ['pending_payment', 'Payment Pending'], ['completed', 'Completed'], ['cancelled', 'Cancelled']]

function ConsultRow({ c, specialties }) {
  const prov = useAsync(() => (c.doctorId ? getProvider(c.doctorId).catch(() => null) : Promise.resolve(null)), c.id)
  return (
    <li className="rrow">
      <div className="rcell rmain">
        <p className="t-card">{prov.data?.fullName ?? (c.doctorId ? 'Your doctor' : 'Doctor to be assigned')}</p>
        <p className="text-meta">{specialties.get(c.specialtyId) ?? 'Consultation'} · {c.channel === 'audio' ? 'Audio' : 'Video'}</p>
      </div>
      <div className="rcell"><span className="rlabel">Date</span>{fmtDateTime(c.scheduledStartAt ?? c.createdAt)}</div>
      <div className="rcell"><span className="rlabel">Reference</span>{c.referenceCode}</div>
      <div className="rcell">{consultBadge(c.status)}</div>
    </li>
  )
}

function Consultations() {
  const [when, setWhen] = useState('upcoming')
  const specialties = useSpecialties()
  const pg = usePaged((last) => listConsultations({ upcoming: when === 'upcoming', limit: PAGE, after: last?.id }), when)
  const c = useControls(CONSULT_STATUSES)
  const rows = arrange(pg.items, c, (r) => r.referenceCode, (r) => r.scheduledStartAt ?? r.createdAt, (r) => r.status)
  return (
    <>
      <div className="seg" role="group" aria-label="Show">
        {[['upcoming', 'Upcoming'], ['past', 'Previous']].map(([id, t]) => <button key={id} type="button" aria-pressed={when === id} onClick={() => setWhen(id)}>{t}</button>)}
      </div>
      <Controls {...c} noun="consultations" />
      <List pg={pg} rows={rows} noun="consultations" empty={[when === 'upcoming' ? 'No upcoming consultations' : 'No previous consultations', 'Your consultations appear here once you book one.']}>
        {rows.map((r) => <ConsultRow key={r.id} c={r} specialties={specialties} />)}
      </List>
    </>
  )
}

const PAY_STATUSES = [['paid', 'Paid'], ['pending', 'Pending'], ['failed', 'Failed'], ['refunded', 'Refunded']]

function Payments() {
  const pg = usePaged((last) => listPayments({ limit: PAGE, before: last?.createdAt, beforeId: last?.id }), 'pay')
  const c = useControls(PAY_STATUSES)
  const rows = arrange(pg.items, c, (r) => `${r.referenceCode} ${r.orderReference ?? ''} ${r.transactionReference ?? ''}`, (r) => r.paidAt ?? r.createdAt, (r) => (r.status === 'created' ? 'pending' : r.status))
  return (
    <>
      <Controls {...c} noun="payments" setQ={c.setQ} />
      <List pg={pg} rows={rows} noun="payments" empty={['No payments yet', 'Payments for consultations and lab orders appear here.']}>
        {rows.map((p) => (
          <li key={p.id} className="rrow">
            <div className="rcell rmain">
              <p className="t-card">{inr(p.amount)}</p>
              <p className="text-meta"><ReceiptText size={14} aria-hidden="true" /> Consultation {p.currentReferenceCode ?? p.referenceCode}</p>
            </div>
            <div className="rcell"><span className="rlabel">Date</span>{fmtDate(p.paidAt ?? p.createdAt)}</div>
            <div className="rcell"><span className="rlabel">Order / transaction</span>{p.transactionReference ?? p.orderReference ?? '—'}</div>
            <div className="rcell">{p.refund?.status === 'pending' ? paymentBadge('pending') : paymentBadge(p.status)}{p.refund?.status === 'pending' && <span className="text-meta"> Refund pending</span>}</div>
          </li>
        ))}
      </List>
    </>
  )
}

function FileRow({ name, kind, date, link, onError }) {
  const [busy, setBusy] = useState(false)
  const open = () => {
    setBusy(true)
    onError(null)
    openLink(link).catch((e) => onError(errorText(e, 'This file could not be opened. The link may have expired; please try again.'))).finally(() => setBusy(false))
  }
  return (
    <li className="rrow">
      <div className="rcell rmain">
        <p className="t-card">{name}</p>
        <p className="text-meta">{kind}</p>
      </div>
      <div className="rcell"><span className="rlabel">Date</span>{fmtDate(date)}</div>
      <div className="rcell rbtns">
        <button type="button" className="btn btn-rect btn-outline rbtn" disabled={busy} onClick={open} aria-label={`View ${name}`}><Eye size={16} aria-hidden="true" />View</button>
        <button type="button" className="btn btn-rect btn-outline rbtn" disabled={busy} onClick={open} aria-label={`Download ${name}`}><Download size={16} aria-hidden="true" />Download</button>
      </div>
    </li>
  )
}

function Files({ kind }) {
  const reports = kind === 'reports'
  const [err, setErr] = useState(null)
  const pg = usePaged(async () => {
    const files = await listFiles(reports ? 'report' : 'prescription_pdf')
    const rows = files.map((f) => ({ id: f.id, name: f.fileName, kind: reports ? 'Medical report' : 'Prescription', date: f.createdAt, link: () => fileLink(f.id) }))
    if (reports) {
      const orders = await listLabOrders('all').catch(() => ({ items: [] })) // lab reports are a bonus: a failure here must not hide the rest
      for (const o of orders.items) for (const r of o.reports) rows.push({ id: r.id, name: r.fileName, kind: `Lab report · ${o.referenceCode}`, date: r.createdAt, link: () => labReportLink(o.id, r.id) })
    }
    return rows.slice(0, 500)
  }, kind)
  const c = useControls(null)
  const rows = arrange(pg.items, c, (r) => `${r.name} ${r.kind}`, (r) => r.date)
  return (
    <>
      <Controls {...c} noun={kind} />
      {err && <Notice tone="error">{err}</Notice>}
      <List pg={{ ...pg, done: true }} rows={rows} noun={kind} empty={[reports ? 'No reports yet' : 'No prescriptions yet', reports ? 'Reports from your care team and lab orders appear here.' : 'Prescriptions issued by your doctor appear here.']}>
        {rows.map((r) => <FileRow key={r.id} name={r.name} kind={r.kind} date={r.date} link={r.link} onError={setErr} />)}
      </List>
    </>
  )
}

function Body() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([id]) => id === params.get('tab')) ? params.get('tab') : 'consultations'
  const change = (id) => { const n = new URLSearchParams(params); n.set('tab', id); setParams(n) }
  const view = useMemo(() => ({ consultations: <Consultations />, payments: <Payments />, prescriptions: <Files kind="prescriptions" />, reports: <Files kind="reports" /> })[tab], [tab])
  return (
    <>
      <PageHeading title="Health Records">Your consultations, payments, prescriptions and reports in one place.</PageHeading>
      <Tabs label="Health records" idBase="rec" items={TABS} value={tab} onChange={change} className="rec-tabs" />
      <div {...panelProps('rec', tab)} className="rec-panel">{view}</div>
      <p className="privacy-note"><Lock size={18} aria-hidden="true" />Your health records are private to you. Files open through a link that expires.</p>
    </>
  )
}

export default function Records() {
  return (
    <PatientShell title="Health Records">
      <Body />
    </PatientShell>
  )
}
