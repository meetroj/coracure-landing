import Lenis from 'lenis'

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

// slower, eased wheel scrolling; skipped for reduced-motion users.
// No anchor offset: Lenis already honours the CSS scroll-margin-top that clears the header.
const lenis = reduced ? null : new Lenis({ autoRaf: true, lerp: 0.08, wheelMultiplier: 0.75, anchors: true })

// code-triggered jumps go through Lenis too, otherwise its animation fights the native scroll
export function scrollToEl(el, { center = false } = {}) {
  if (!lenis) return el.scrollIntoView({ block: center ? 'center' : 'start' })
  lenis.scrollTo(el, { offset: center ? -(innerHeight - el.getBoundingClientRect().height) / 2 : 0 })
}

// route changes start at the top, without the eased scroll
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true })
  else scrollTo(0, 0)
}
