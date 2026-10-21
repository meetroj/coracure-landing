import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './index.css'
import './pages.css'
import './account.css'
import './prefs.js' // theme and language, applied before the first render
import './scroll.js' // smooth scrolling (Lenis)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
