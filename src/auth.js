import { useSyncExternalStore } from 'react'
import { DEMO } from './data.js'
import { navigate } from './router.jsx'
import { APP, LINKS } from './site.js'

/* The one place the site asks "is someone signed in?". There are no web accounts yet (the backend has patient OTP
   endpoints, /auth/patient/otp/request and /verify, but no web login screen uses them), so the only session is
   the ?demo=signedin preview: it shows the signed-in layout with no account data, for this browser tab only.
   ponytail: replace read() with the real session check when web login ships; nothing else needs to change. */

const KEY = 'coracure.preview-session'
const subs = new Set()
const read = () => {
  try {
    return DEMO && sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
try {
  if (DEMO && new URLSearchParams(location.search).get('demo') === 'signedin') sessionStorage.setItem(KEY, '1')
} catch { /* storage blocked: stays signed out */ }

export const useSession = () => ({
  signedIn: useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), read),
})

export function signOut() {
  try {
    sessionStorage.removeItem(KEY)
  } catch { /* nothing stored */ }
  subs.forEach((f) => f())
  navigate('/')
}

// Login / Sign Up with the page to come back to; the app download until web accounts exist
export const loginHref = (to) => (LINKS.login ? `${LINKS.login}?next=${encodeURIComponent(to)}` : APP)
export const signupHref = (to) => (LINKS.signup ? `${LINKS.signup}?next=${encodeURIComponent(to)}` : APP)
