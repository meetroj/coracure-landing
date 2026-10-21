import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { CircleAlert, RefreshCw, Search, SearchX, X } from 'lucide-react'
import { Link, usePageTitle } from '../router.jsx'

/* Shared building blocks for the inner pages. Every page uses these, so equivalent elements look identical. */

/** True while a CSS media query matches (follows resizes and rotation). */
export function useMedia(query) {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(query); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => matchMedia(query).matches,
    () => false,
  )
}

/** Page wrapper: header-height gap, the page's own background layer (`bg` picks it in pages.css), one container. */
export function Page({ bg, title, wide, children }) {
  usePageTitle(`${title} | CoraCure`)
  return (
    <div className={`page page-${bg}`}>
      <div className={wide ? 'wrap wrap-wide' : 'wrap'}>{children}</div>
    </div>
  )
}

/** items: [label, href?]; the last one is the current page. */
export function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map(([label, href], i) => (
          <li key={label + i}>{href && i < items.length - 1 ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}</li>
        ))}
      </ol>
    </nav>
  )
}

export const PageHeading = ({ title, children }) => (
  <header className="page-head">
    <h1 className="t-page">{title}</h1>
    {children && <p className="page-sub">{children}</p>}
  </header>
)

/** A link-styled or real button in the shared rectangular style. variant: 'primary' | 'secondary'. */
export function Button({ variant = 'primary', href, className = '', ...rest }) {
  const cls = `btn btn-rect btn-${variant === 'primary' ? 'primary' : 'outline'} ${className}`.trim()
  return href ? <Link href={href} className={cls} {...rest} /> : <button type="button" className={cls} {...rest} />
}

/** Runs `fn` whenever `key` changes (or reload() is called). Keeps the last data while the next load is in flight. */
export function useAsync(fn, key) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [tick, setTick] = useState(0)
  const latest = useRef(fn)
  latest.current = fn
  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, status: 'loading', error: null }))
    latest.current().then(
      (data) => live && setState({ status: 'ok', data, error: null }),
      (error) => live && setState({ status: 'error', data: null, error }),
    )
    return () => {
      live = false
    }
  }, [key, tick])
  return { ...state, reload: () => setTick((t) => t + 1) }
}

/** Labelled text field with a search icon, a clear button and an optional submit button. */
export function SearchField({ label, value, onChange, onSubmit, placeholder, button, clearLabel = 'Clear search', children, ...inputProps }) {
  const id = useId()
  return (
    <div className="field-wrap">
      <label className="field-label" htmlFor={id}>{label}</label>
      <form className="field" role="search" onSubmit={(e) => { e.preventDefault(); onSubmit?.(value) }}>
        <Search size={20} className="field-icon" aria-hidden="true" />
        <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" enterKeyHint="search" {...inputProps} />
        {value && (
          <button type="button" className="field-clear" aria-label={clearLabel} onClick={() => { onChange(''); onSubmit?.('') }}>
            <X size={18} aria-hidden="true" />
          </button>
        )}
        {button && <button type="submit" className="btn btn-rect btn-primary field-btn">{button}</button>}
      </form>
      {children}
    </div>
  )
}

/* ---- states ---- */

export const LoadingSkeleton = ({ rows = 3, variant = 'card' }) => (
  <div className={`skel-list skel-${variant}`} aria-hidden="true">
    {Array.from({ length: rows }, (_, i) => <div key={i} className="skel" />)}
  </div>
)

export const EmptyState = ({ icon: Icon = SearchX, title, children, action }) => (
  <div className="state">
    <Icon size={32} aria-hidden="true" />
    <h2 className="t-card">{title}</h2>
    {children && <p>{children}</p>}
    {action}
  </div>
)

export const ErrorState = ({ title = 'Something went wrong', children = 'We could not load this. Check your connection and try again.', onRetry }) => (
  <div className="state state-error" role="alert">
    <CircleAlert size={32} aria-hidden="true" />
    <h2 className="t-card">{title}</h2>
    <p>{children}</p>
    {onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw size={16} aria-hidden="true" />Try again</Button>}
  </div>
)

/** "Showing x of y" with a Load more button while there is more. */
export function Pagination({ shown, total, noun, onMore, busy }) {
  return (
    <div className="pager">
      <p className="text-support" aria-live="polite">Showing {shown} of {total} {noun}</p>
      {shown < total && <Button variant="secondary" onClick={onMore} disabled={busy}>{busy ? 'Loading…' : 'Load more'}</Button>}
    </div>
  )
}

/** Tab strip with roving focus and arrow keys. Pair the panel with panelProps(idBase, value). */
export function Tabs({ label, items, value, onChange, idBase, className = '' }) {
  const onKey = (e) => {
    const i = items.findIndex(([id]) => id === value)
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const [id] = items[(next + items.length) % items.length]
    onChange(id)
    document.getElementById(`${idBase}-tab-${id}`)?.focus()
  }
  return (
    <div role="tablist" aria-label={label} className={`tabs ${className}`.trim()} onKeyDown={onKey}>
      {items.map(([id, text]) => (
        <button key={id} type="button" role="tab" id={`${idBase}-tab-${id}`} aria-selected={value === id} aria-controls={`${idBase}-panel`} tabIndex={value === id ? 0 : -1} onClick={() => onChange(id)}>
          {text}
        </button>
      ))}
    </div>
  )
}
export const panelProps = (idBase, value) => ({ role: 'tabpanel', id: `${idBase}-panel`, 'aria-labelledby': `${idBase}-tab-${value}`, tabIndex: 0 })

/** Native modal <dialog>: focus moves in, Escape and the backdrop close it, focus returns to the opener. */
export function Dialog({ open, onClose, labelledBy, className = '', children }) {
  const ref = useRef(null)
  const opener = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (open) {
      opener.current = document.activeElement
      if (!d.open) d.showModal()
    } else if (opener.current) {
      if (d.open) d.close()
      opener.current.focus?.() // back to the control that opened it, whichever way it closed
      opener.current = null
    }
    document.documentElement.classList.toggle('menu-open', open) // same page-scroll lock the mobile menu uses
    return () => document.documentElement.classList.remove('menu-open')
  }, [open])
  return (
    <dialog ref={ref} className={`dialog ${className}`.trim()} aria-labelledby={labelledBy} data-lenis-prevent onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      {open && children}
    </dialog>
  )
}

export const inr = (n) => (n === null || n === undefined ? '—' : `₹${n.toLocaleString('en-IN')}`)
