/* Display preference kept on this device: light/dark, chosen on /settings. Read and applied before the first render
   (main.jsx), so there is no flash of the wrong theme. Language and notification choices live on the account (API). */

const KEY = 'coracure.prefs.v2' // v2: an earlier build could save Dark as the default; those old values are ignored
export const DEFAULTS = { theme: 'light' }

export function readPrefs() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY)) ?? {}) }
  } catch {
    return DEFAULTS
  }
}

// Only "dark" is dark; System Default is the Light look.
export function applyPrefs(p) {
  document.documentElement.dataset.theme = p.theme === 'dark' ? 'dark' : 'light'
}
export function savePrefs(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch { /* storage blocked: applies for this visit only */ }
  applyPrefs(p)
}

applyPrefs(readPrefs())
