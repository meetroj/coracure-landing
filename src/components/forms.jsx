import { useId, useRef } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'

/* Shared form pieces for the account, partner and support pages. Every field: a visible label, hint and error tied to
   the control with aria-describedby, an error that is announced, and a mobile keyboard that fits (set by the caller). */

/** A labelled control. children is a function so the control gets its id, aria-invalid and aria-describedby. */
export function Field({ label, error, hint, required, className = '', children }) {
  const id = useId()
  const hintId = `${id}-h`
  const errId = `${id}-e`
  const props = {
    id,
    required: required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [hint && hintId, error && errId].filter(Boolean).join(' ') || undefined,
  }
  return (
    <div className={`pf-field ${className}`.trim()}>
      <label htmlFor={id}>{label}{required && <span className="req" aria-hidden="true"> *</span>}</label>
      {children(props)}
      {hint && <p className="field-help" id={hintId}>{hint}</p>}
      {error && <p className="field-error" id={errId} role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</p>}
    </div>
  )
}

export const TextField = ({ label, error, hint, required, className, ...input }) => (
  <Field label={label} error={error} hint={hint} required={required} className={className}>{(p) => <input {...p} {...input} />}</Field>
)

export const SelectField = ({ label, error, hint, required, className, options, placeholder, ...select }) => (
  <Field label={label} error={error} hint={hint} required={required} className={className}>
    {(p) => (
      <select {...p} {...select}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
      </select>
    )}
  </Field>
)

export const TextArea = ({ label, error, hint, required, className, ...area }) => (
  <Field label={label} error={error} hint={hint} required={required} className={className}>{(p) => <textarea rows={5} {...p} {...area} />}</Field>
)

/** A required-consent checkbox with its own error line. */
export function Consent({ checked, onChange, error, children }) {
  const id = useId()
  return (
    <div className="consent">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-e` : undefined} />
      <label htmlFor={id}>{children}</label>
      {error && <p className="field-error" id={`${id}-e`} role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</p>}
    </div>
  )
}

/** Six cells, one digit each; typing moves on, Backspace goes back, a pasted code fills them all. */
export function OtpInput({ value, onChange, length = 6, invalid, disabled, label = 'One-time code' }) {
  const refs = useRef([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')
  const focus = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()
  const set = (text, from) => {
    const clean = text.replace(/\D/g, '')
    if (!clean) return
    const next = (value.slice(0, from) + clean).slice(0, length)
    onChange(next)
    focus(from + clean.length)
  }
  return (
    <div className="otp" role="group" aria-label={label}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="otp-cell"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={d}
          disabled={disabled}
          aria-label={`${label}, digit ${i + 1} of ${length}`}
          aria-invalid={invalid ? true : undefined}
          onChange={(e) => (e.target.value ? set(e.target.value, i) : onChange(value.slice(0, i) + value.slice(i + 1)))}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d) {
              e.preventDefault()
              onChange(value.slice(0, Math.max(0, i - 1)) + value.slice(i))
              focus(i - 1)
            } else if (e.key === 'ArrowLeft') focus(i - 1)
            else if (e.key === 'ArrowRight') focus(i + 1)
          }}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}

/** tone: success | info | warn | error. Errors and results are announced (role alert / status). */
export function Notice({ tone = 'info', children, className = '' }) {
  const Icon = { success: CircleCheck, info: Info, warn: TriangleAlert, error: CircleAlert }[tone]
  return (
    <div className={`notice-box notice-${tone} ${className}`.trim()} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

/** A status chip. The words carry the meaning; the colour only backs them up. tone: success | pending | error | neutral. */
export const StatusBadge = ({ tone = 'neutral', children }) => <span className={`sbadge sbadge-${tone}`}>{children}</span>
