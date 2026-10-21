import { Breadcrumbs, EmptyState, ErrorState, LoadingSkeleton, Page, PageHeading, useAsync } from '../components/ui.jsx'
import { legalDocument } from '../account.js'
import { errorText } from '../api.js'
import { fmtDate } from '../components/patient.jsx'

/* /legal/{type}: the current published version of a legal document, straight from the API (GET /legal/documents/:type).
   The footer, sign-up and support link here. Until an admin publishes a document the page says so; nothing is invented. */

export const LEGAL_TYPES = ['terms_of_use', 'privacy_policy', 'refund_policy', 'teleconsultation_consent', 'reconsult_policy', 'contact_us']

// blank-line separated blocks; a line starting with "# " is a heading. No HTML is ever injected.
function Body({ text }) {
  return (
    <div className="legal-body">
      {String(text ?? '').split(/\n{2,}/).map((block, i) => {
        const h = /^#{1,3}\s+(.*)$/.exec(block.trim())
        return h ? <h2 key={i} className="t-card">{h[1]}</h2> : <p key={i}>{block}</p>
      })}
    </div>
  )
}

const NAMES = { terms_of_use: 'Terms & Conditions', privacy_policy: 'Privacy Policy', refund_policy: 'Refund Policy', teleconsultation_consent: 'Teleconsultation Consent', reconsult_policy: 'Reconsultation Policy', contact_us: 'Contact Us' }

export default function Legal({ type }) {
  const known = LEGAL_TYPES.includes(type)
  const r = useAsync(() => (known ? legalDocument(type) : Promise.resolve(null)), type)
  const d = r.data
  const title = d?.title ?? NAMES[type] ?? 'Legal document'
  return (
    <Page bg="plain" title={title}>
      <Breadcrumbs items={[['Home', '/'], [title]]} />
      <PageHeading title={title}>{d ? `${d.version ? `Version ${d.version}` : ''}${d.effectiveAt || d.createdAt ? `${d.version ? ' · ' : ''}${fmtDate(d.effectiveAt ?? d.createdAt)}` : ''}` : null}</PageHeading>
      {!known ? <EmptyState title="We could not find that document">Check the link, or go back to the footer to choose a policy.</EmptyState>
        : r.status === 'error' ? (r.error?.status === 404
          ? <EmptyState title="This document has not been published yet">It will appear here once the CoraCure team publishes it.</EmptyState>
          : <ErrorState title="The document could not be loaded" onRetry={r.reload}>{errorText(r.error)}</ErrorState>)
        : !d ? <LoadingSkeleton rows={3} variant="card" />
        : <Body text={d.body} />}
    </Page>
  )
}
