import { useSyncExternalStore } from 'react'
import { api, clearSession, hasSession, subscribeSession } from './api.js'
import { navigate } from './router.jsx'

/* The one place the site asks "is someone signed in?". The session itself (tokens, refresh) lives in api.js;
   sign-in is /login and /signup (mobile number + OTP, the same call the app uses). */

export const useSession = () => ({ signedIn: useSyncExternalStore(subscribeSession, hasSession, () => false) })

export async function signOut() {
  try {
    await api('/auth/sign-out', { method: 'POST' })
  } catch { /* the token is dropped below either way */ }
  clearSession('user')
  navigate('/')
}

/** Only a path on this site may be a return address (never //evil.example or https://…). */
export const safeNext = (next) => (typeof next === 'string' && /^\/(?![/\\])/.test(next) ? next : null)

// Login / Sign Up with the page to come back to
const back = (to) => (to && to !== '/' && !/^\/(login|signup)/.test(to) ? `?next=${encodeURIComponent(to)}` : '')
export const loginHref = (to) => `/login${back(to)}`
export const signupHref = (to) => `/signup${back(to)}`
