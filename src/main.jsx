import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './index.css'
import App from './App.jsx'

// slower, eased wheel scrolling; skipped for reduced-motion users
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  new Lenis({ autoRaf: true, lerp: 0.08, wheelMultiplier: 0.75, anchors: { offset: -84 } })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
