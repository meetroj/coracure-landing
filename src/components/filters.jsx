import { useId } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Button, Dialog } from './ui.jsx'
import { EXPERIENCE_BANDS, FEE_BANDS, SORTS } from '../data.js'

/* Listing filters. A filter value is { lang: [], exp: [], fee: [], spec: [] } (lists of option ids); the same
   panel renders in the desktop sidebar and inside the mobile drawer. */

export const EMPTY = { lang: [], exp: [], fee: [], spec: [] }
export const countFilters = (v) => Object.values(v).reduce((n, l) => n + l.length, 0)

// [param, group title, facet key -> options as [id, label]]
const GROUPS = (facets, withSpecialty) => [
  ...(withSpecialty ? [['spec', 'Specialty', facets.specialties]] : []),
  ['lang', 'Language', facets.languages.map((l) => [l, l])],
  ['exp', 'Experience', facets.experience.map(([id, label]) => [id, label])],
  ['fee', 'Consultation fee', facets.fee.map(([id, label]) => [id, label])],
].filter(([, , options]) => options.length)

/** Human label of one selected option, for the removable chips. */
export const filterLabel = (key, id, facets) =>
  key === 'lang' ? id
    : key === 'exp' ? EXPERIENCE_BANDS.find(([x]) => x === id)?.[1] ?? id
    : key === 'fee' ? FEE_BANDS.find(([x]) => x === id)?.[1] ?? id
    : facets.specialties.find(([x]) => x === id)?.[1] ?? id

function FilterGroup({ title, options, selected, onToggle }) {
  return (
    <details className="fgroup" open>
      <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
      <div className="fopts" role="group" aria-label={title}>
        {options.map(([id, label]) => (
          <label key={id} className="check">
            <input type="checkbox" checked={selected.includes(id)} onChange={() => onToggle(id)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </details>
  )
}

/** facets: what the data offers; value: what is selected; onToggle(key, id); onClear(). */
export function FilterPanel({ facets, value, onToggle, onClear, withSpecialty, hideHead = false }) {
  const groups = GROUPS(facets, withSpecialty)
  return (
    <div className="fpanel">
      {!hideHead && (
        <div className="fpanel-head">
          <h2 className="t-card">Filters</h2>
          <button type="button" className="link-btn" onClick={onClear} disabled={!countFilters(value)}>Clear All</button>
        </div>
      )}
      {groups.length === 0 && <p className="text-support">No filters are available for these providers yet.</p>}
      {groups.map(([key, title, options]) => (
        <FilterGroup key={key} title={title} options={options} selected={value[key]} onToggle={(id) => onToggle(key, id)} />
      ))}
    </div>
  )
}

export const SelectedFilterChip = ({ label, onRemove }) => (
  <button type="button" className="chip" aria-label={`Remove filter ${label}`} onClick={onRemove}>
    {label}
    <X size={14} aria-hidden="true" />
  </button>
)

export function SortControl({ value, onChange }) {
  const id = useId()
  return (
    <div className="sort">
      <label htmlFor={id}>Sort by</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {SORTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
      </select>
    </div>
  )
}

/** Mobile filter sheet. Edits a draft; Apply commits it, Clear empties it, Close drops it. */
export function FilterDrawer({ open, count, onClose, onApply, onClear, children }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="drawer-title" className="drawer">
      <div className="drawer-head">
        <h2 id="drawer-title" className="t-h2">Filters{count ? ` (${count})` : ''}</h2>
        <button type="button" className="icon-btn" aria-label="Close filters" onClick={onClose}><X size={22} aria-hidden="true" /></button>
      </div>
      <div className="drawer-body">{children}</div>
      <div className="drawer-foot">
        <Button variant="secondary" onClick={onClear}>Clear</Button>
        <Button onClick={onApply}>Apply</Button>
      </div>
    </Dialog>
  )
}
