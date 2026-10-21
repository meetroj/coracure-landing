/* Display preferences kept on this device: website language, light/dark, and the notification switches shown on
   /settings. Read and applied before the first render (main.jsx), so there is no flash of the wrong theme. */

const KEY = 'coracure.prefs.v2' // v2: an earlier build could save Dark as the default; those old values are ignored
export const DEFAULTS = { lang: 'en', theme: 'light', notify: { appointments: true, labs: true, reports: false } }
export const LANGS = [['en', 'English'], ['hi', 'हिन्दी (Hindi)'], ['mr', 'मराठी (Marathi)'], ['kn', 'ಕನ್ನಡ (Kannada)'], ['ta', 'தமிழ் (Tamil)']]

export function readPrefs() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)) ?? {}
    return { ...DEFAULTS, ...s, notify: { ...DEFAULTS.notify, ...s.notify } }
  } catch {
    return DEFAULTS
  }
}

const dark = (m) => m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
export function applyPrefs(p) {
  document.documentElement.dataset.theme = dark(p.theme) ? 'dark' : 'light'
  document.documentElement.lang = p.lang
}
export function savePrefs(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch { /* storage blocked: applies for this visit only */ }
  applyPrefs(p)
}

applyPrefs(readPrefs())
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyPrefs(readPrefs()))
