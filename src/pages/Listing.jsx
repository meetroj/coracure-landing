import { useEffect, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Breadcrumbs, Button, EmptyState, ErrorState, LoadingSkeleton, PageHeading, Pagination, SearchField, useAsync } from '../components/ui.jsx'
import { EMPTY, FilterDrawer, FilterPanel, SelectedFilterChip, SortControl, countFilters, filterLabel } from '../components/filters.jsx'
import { ProviderCard } from '../components/ProviderCard.jsx'
import { DIRECTORY } from '../directory.js'
import { searchProviders } from '../data.js'
import { AreaPage, LoginPrompt } from '../components/patient.jsx'
import { Link, navigate, useSearchParams } from '../router.jsx'

/* /specialties, /super-specialties, /paramedical, /pet-care, /dentists (a category) and /{category}/{specialty}
   (one specialty): search, filter and sort providers. Everything the visitor chose lives in the query string
   (?q= &lang= &exp= &fee= &spec= &sort= &page=), so a shared link or Back restores the same list. */

const PAGE_SIZE = 5
const KEYS = ['lang', 'exp', 'fee', 'spec']

// writes the query (replaceState) from the live URL, so a debounced write never uses a stale snapshot
function write(patch) {
  const next = new URLSearchParams(location.search)
  for (const [k, v] of Object.entries(patch)) {
    next.delete(k)
    ;[].concat(v).filter(Boolean).forEach((x) => next.append(k, x))
  }
  if (!('page' in patch)) next.delete('page')
  const qs = next.toString()
  navigate(location.pathname + (qs ? `?${qs}` : ''), { replace: true })
}

export default function Listing({ group, slug }) {
  const [params] = useSearchParams()
  const dir = DIRECTORY[group]
  const specialty = slug ? dir.specialties.find((s) => s.slug === slug) : null
  const heading = specialty?.name ?? dir.title

  const q = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'relevance'
  const pages = Math.max(1, Number(params.get('page')) || 1)
  const filters = Object.fromEntries(KEYS.map((k) => [k, params.getAll(k)]))
  const active = countFilters(filters)

  // the typed text follows the URL when it changes from outside (Back, Clear), without fighting the visitor's typing
  const [text, setText] = useState(q)
  const [seenQ, setSeenQ] = useState(q)
  if (q !== seenQ) {
    setSeenQ(q)
    setText(q)
  }
  useEffect(() => {
    if (text.trim() === q.trim()) return
    const t = setTimeout(() => write({ q: text.trim() }), 300)
    return () => clearTimeout(t)
  }, [text, q])

  const key = `${group}|${slug}|${params.toString()}`
  const r = useAsync(
    () => (slug && !specialty ? Promise.resolve({ unavailable: true }) : searchProviders({ group, specialty: slug, q, ...filters, sort, limit: pages * PAGE_SIZE })),
    key,
  )
  const data = r.data
  // the Filters panel, button and drawer exist only when the API offered at least one option to filter by
  const raw = data?.facets
  const facets = raw && (raw.languages.length || raw.experience.length || raw.fee.length || (!slug && dir.specialties.length > 1 && raw.specialties.length > 1)) ? raw : undefined

  // mobile drawer edits a draft that Apply commits
  const [drawer, setDrawer] = useState(false)
  const [draft, setDraft] = useState(EMPTY)
  const toggle = (state, set) => (k, id) => set({ ...state, [k]: state[k].includes(id) ? state[k].filter((x) => x !== id) : [...state[k], id] })
  useEffect(() => {
    const close = () => innerWidth >= 1024 && setDrawer(false)
    addEventListener('resize', close)
    return () => removeEventListener('resize', close)
  }, [])

  const crumbs = [['Home', '/'], [dir.crumb, specialty ? `/${group}` : undefined], ...(specialty ? [[specialty.name]] : [])]
  const withSpecialty = !slug && dir.specialties.length > 1

  let body
  if (r.status === 'error') body = r.error?.loginRequired ? <LoginPrompt what="providers" /> : <ErrorState title="Providers could not be loaded" onRetry={r.reload} />
  else if (!data) body = <LoadingSkeleton rows={4} />
  else if (data.unavailable) {
    body = (
      <EmptyState title="Providers in this category are not available yet" action={<Button href="/consultations">Browse other categories</Button>}>
        {specialty || !slug ? `${heading} consultations are not listed on the website yet. Check back soon.` : 'We could not find that specialty.'}
      </EmptyState>
    )
  } else if (!data.total) {
    body = (
      <EmptyState title="No matching providers" action={(active || q) && <Button variant="secondary" onClick={() => write({ q: '', lang: [], exp: [], fee: [], spec: [] })}>Clear search and filters</Button>}>
        Try a different name or remove a filter.
      </EmptyState>
    )
  } else {
    body = (
      <>
        <ul className="plist">{data.items.map((p) => <ProviderCard key={p.slug} provider={p} />)}</ul>
        <Pagination shown={data.items.length} total={data.total} noun="providers" busy={r.status === 'loading'} onMore={() => write({ page: String(pages + 1) })} />
      </>
    )
  }
  // the same page for every category: search, sort and (when the API gave options) the filters; an empty category says so in the results area
  const showTools = Boolean(data)

  return (
    <AreaPage bg="listing" title={heading} back={slug ? [`/${group}`, `Back to ${dir.crumb.toLowerCase()}`] : ['/consultations', 'Back to consultations']}>
      <Breadcrumbs items={crumbs} />
      <PageHeading title={heading}>Explore online consultation providers in this {specialty ? 'specialty' : 'category'}.</PageHeading>

      {!slug && dir.specialties.length > 1 && (
        <nav className="spec-links" aria-label={`${dir.title} by specialty`}>
          {dir.specialties.map((s) => <Link key={s.slug} href={`/${group}/${s.slug}`}>{s.name}</Link>)}
        </nav>
      )}

      <div className="listing">
        {showTools && facets && (
          <aside className="filters" aria-label="Filters">
            <FilterPanel facets={facets} value={filters} withSpecialty={withSpecialty}
              onToggle={(k, id) => write({ [k]: filters[k].includes(id) ? filters[k].filter((x) => x !== id) : [...filters[k], id] })}
              onClear={() => write({ lang: [], exp: [], fee: [], spec: [] })} />
          </aside>
        )}

        <div className="results-col">
          {showTools && (
            <div className="toolbar">
              <SearchField label="Search by doctor name or keyword" placeholder="Search by doctor name or keyword..." value={text} onChange={setText} onSubmit={(v) => write({ q: v.trim() })} />
              <SortControl value={sort} onChange={(v) => write({ sort: v === 'relevance' ? '' : v })} />
              {facets && (
                <Button variant="secondary" className="filter-btn" onClick={() => { setDraft(filters); setDrawer(true) }}>
                  <SlidersHorizontal size={18} aria-hidden="true" />Filters{active ? ` (${active})` : ''}
                </Button>
              )}
            </div>
          )}

          {showTools && active > 0 && facets && (
            <div className="chips" aria-label="Selected filters">
              {KEYS.flatMap((k) => filters[k].map((id) => (
                <SelectedFilterChip key={k + id} label={filterLabel(k, id, facets)} onRemove={() => write({ [k]: filters[k].filter((x) => x !== id) })} />
              )))}
              <button type="button" className="link-btn" onClick={() => write({ lang: [], exp: [], fee: [], spec: [] })}>Clear all</button>
            </div>
          )}

          {showTools && !data.unavailable && <p className="text-support count" aria-live="polite">{data.total} {data.total === 1 ? 'provider' : 'providers'}{q.trim() ? ` for “${q.trim()}”` : ''}</p>}

          <div className={r.status === 'loading' && data ? 'is-updating' : undefined} aria-busy={r.status === 'loading'}>{body}</div>
        </div>
      </div>

      {facets && (
        <FilterDrawer open={drawer} count={countFilters(draft)} onClose={() => setDrawer(false)} onClear={() => setDraft(EMPTY)}
          onApply={() => { write(draft); setDrawer(false) }}>
          <FilterPanel hideHead facets={facets} value={draft} withSpecialty={withSpecialty} onToggle={toggle(draft, setDraft)} onClear={() => setDraft(EMPTY)} />
        </FilterDrawer>
      )}
    </AreaPage>
  )
}
