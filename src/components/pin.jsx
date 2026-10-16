import { useRef } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'

/* PIN-code pieces shared by the lab pages. */

// What is true after a check: the real answer, or "not connected" while no lab service is. Never an assumption.
export const RESULT = {
  serviceable: { Icon: CircleCheck, tone: 'ok', text: (pin) => `Lab services are available for PIN ${pin}. Collection options depend on the test or package you choose.` },
  not_serviceable: { Icon: CircleAlert, tone: 'warn', text: (pin) => `Lab services are not available for PIN ${pin} yet.` },
  not_connected: { Icon: Info, tone: 'info', text: (pin) => `We cannot confirm availability for PIN ${pin} yet. Availability checks open when lab partners are connected.` },
}

/** Six one-digit boxes: type to move on, Backspace to go back, paste a whole PIN. digits is an array of 6 strings. */
export function PinBoxes({ digits, onChange, invalid, describedBy }) {
  const refs = useRef([])
  const put = (i, v) => onChange(digits.map((d, j) => (j === i ? v : d)))
  const focus = (i) => refs.current[Math.max(0, Math.min(5, i))]?.focus()
  return (
    <fieldset className="pin-boxes">
      <legend className="field-label">PIN code</legend>
      <div className="pin-row">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? 'postal-code' : 'off'}
            maxLength={1}
            aria-label={`PIN digit ${i + 1} of 6`}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(-1)
              put(i, v)
              if (v) focus(i + 1)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !d) {
                e.preventDefault()
                put(Math.max(0, i - 1), '')
                focus(i - 1)
              } else if (e.key === 'ArrowLeft') focus(i - 1)
              else if (e.key === 'ArrowRight') focus(i + 1)
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
              if (!pasted) return
              e.preventDefault()
              onChange(Array.from({ length: 6 }, (_, j) => pasted[j] ?? ''))
              focus(pasted.length)
            }}
          />
        ))}
      </div>
    </fieldset>
  )
}
