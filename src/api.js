/* The one HTTP client for the CoraCure API (same contract the apps use: docs/API_CONTRACT.md) and the patient session.
   API_BASE: VITE_API_URL, else the live API (in `vite dev`, through the proxy in vite.config.js). Session: access token (15 min) + refresh token in localStorage, refreshed
   once for all parallel calls.
   ponytail: localStorage is readable by any script on this origin (no CSP yet); httpOnly cookies need a backend change. */

export const API_BASE = String(import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://api.coracure.in/api/v1')).replace(/\/+$/, '')
const TIMEOUT_MS = 20000
const KEY = 'coracure.session'
const EXPIRED = 'coracure.expired'

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

/* ---------- session ---------- */

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}
let session = read()
const subs = new Set()
const notify = () => subs.forEach((f) => f())
addEventListener('storage', (e) => {
  if (e.key === KEY) {
    session = read()
    notify()
  }
})

export const getSession = () => session
export const subscribeSession = (f) => (subs.add(f), () => subs.delete(f))
export const hasSession = () => session !== null

/** tokens: { accessToken, refreshToken, expiresIn } from /auth/patient/otp/verify or /auth/refresh. */
export function setSession(tokens) {
  session = { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: Date.now() + tokens.expiresIn * 1000 }
  try {
    localStorage.setItem(KEY, JSON.stringify(session))
    sessionStorage.removeItem(EXPIRED)
  } catch { /* storage blocked: the session lasts until the tab closes */ }
  notify()
}
export function clearSession(reason) {
  session = null
  try {
    localStorage.removeItem(KEY)
    if (reason === 'expired') sessionStorage.setItem(EXPIRED, '1')
  } catch { /* nothing stored */ }
  notify()
}
/** True once after a session ran out, so the login page can say so. */
export function takeExpiredNotice() {
  try {
    const v = sessionStorage.getItem(EXPIRED) === '1'
    sessionStorage.removeItem(EXPIRED)
    return v
  } catch {
    return false
  }
}

/* ---------- requests ---------- */

const parse = async (res) => {
  const text = await res.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch { /* not JSON */ }
  if (res.ok) return body
  throw new ApiError(res.status, body?.code ?? 'ERROR', body?.message ?? 'Something went wrong.', body?.details)
}

async function send(path, { method = 'GET', body, query, token, signal }) {
  const url = new URL(`${API_BASE}${path}`, location.origin) // a relative base (the dev proxy) resolves against this site
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  signal?.addEventListener('abort', () => ctl.abort())
  try {
    const res = await fetch(url, {
      method,
      signal: ctl.signal,
      headers: { Accept: 'application/json', ...(body !== undefined && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    return await parse(res)
  } catch (e) {
    if (e instanceof ApiError) throw e
    throw new ApiError(0, 'NETWORK', 'We could not reach CoraCure. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }
}

let refreshing = null
// one refresh for any number of parallel calls (each refresh issues a new pair, so a second one would sign the user out)
function refresh() {
  const rt = session?.refreshToken
  if (!rt) return Promise.reject(new ApiError(401, 'UNAUTHENTICATED', 'Please log in.'))
  refreshing ??= send('/auth/refresh', { method: 'POST', body: { refreshToken: rt } })
    .then((t) => (setSession(t), t))
    .catch((e) => {
      if (e.status === 401 || e.status === 403) clearSession('expired')
      throw e
    })
    .finally(() => { refreshing = null })
  return refreshing
}

/** api('/me/profile'), api('/me/profile', { method: 'PATCH', body }), api('/x', { auth: false }). */
export async function api(path, opts = {}) {
  const { auth = true, ...rest } = opts
  if (!auth) return send(path, rest)
  if (!session) throw new ApiError(401, 'UNAUTHENTICATED', 'Please log in.')
  if (session.expiresAt - Date.now() < 15000) await refresh()
  try {
    return await send(path, { ...rest, token: session.accessToken })
  } catch (e) {
    if (e.status !== 401 || !session) throw e
    await refresh() // the token was revoked or expired early: one retry with a fresh pair
    return send(path, { ...rest, token: session.accessToken })
  }
}

/** A message safe to show, by error code (never the backend's wording alone). */
export function errorText(e, fallback = 'Something went wrong. Please try again.') {
  switch (e?.code) {
    case 'NETWORK': return e.message
    case 'NOT_CONFIGURED': return e.message
    case 'TOO_MANY_ATTEMPTS': return 'Too many attempts. Please wait a few minutes and try again.'
    case 'OTP_PROVIDER_UNAVAILABLE': return 'We could not send the code right now. Please try again in a minute.'
    case 'ACCOUNT_NOT_ACTIVE': return 'This account cannot be used to sign in. Please contact support.'
    default: return e instanceof ApiError && e.status >= 400 && e.status < 500 && e.message ? e.message : fallback
  }
}
