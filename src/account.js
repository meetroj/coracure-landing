import { api, setSession } from './api.js'

/* Everything the signed-in pages and the public forms ask the API. One function per endpoint, same paths and bodies
   as the apps' client (coracure-apps/libs/api). The backend runs forbidNonWhitelisted, so bodies list their keys. */

/* ---------- sign-in (sign-up is the same call: the account is created when the code is confirmed) ---------- */

export const E164 = /^\+[1-9]\d{7,14}$/
export const OTP_LENGTH = 6
export const requestOtp = (mobileNumber) => api('/auth/patient/otp/request', { method: 'POST', body: { mobileNumber }, auth: false })
export async function verifyOtp(mobileNumber, challengeId, code) {
  const res = await api('/auth/patient/otp/verify', { method: 'POST', body: { mobileNumber, challengeId, code }, auth: false })
  setSession(res)
  return res // { isNewAccount, ... }
}

/* ---------- profile ---------- */

export const getProfile = () => api('/me/profile')
export const saveProfile = ({ fullName, dateOfBirth, gender }) => {
  const body = {}
  if (fullName !== undefined) body.fullName = fullName
  if (dateOfBirth !== undefined) body.dateOfBirth = dateOfBirth
  if (gender !== undefined) body.gender = gender
  return api('/me/profile', { method: 'PATCH', body })
}
export const saveAddress = ({ line, pinCode, latitude, longitude }) => {
  const body = { line: line.trim(), pinCode: pinCode.trim() }
  if (latitude !== undefined && longitude !== undefined) Object.assign(body, { latitude, longitude }) // both or neither
  return api('/me/address', { method: 'PUT', body })
}
export const clearAddress = () => api('/me/address', { method: 'DELETE' })
export const saveEmail = (email) => api('/me/email', { method: 'PUT', body: { email: email.trim().toLowerCase() } })
export const requestEmailCode = () => api('/me/email/verification', { method: 'POST' }) // { challengeToken, expiresIn }
export const confirmEmailCode = (challengeToken, code) => api('/me/email/verification/confirm', { method: 'POST', body: { challengeToken, code } })

/** How complete the profile is, from what the page asks for. Each item: [label, done]. */
export function completion(p) {
  const items = [
    ['Full name', Boolean(p?.fullName)],
    ['Date of birth', Boolean(p?.dateOfBirth)],
    ['Gender', Boolean(p?.gender) && p.gender !== 'undisclosed'],
    ['Email address', Boolean(p?.email)],
    ['Address and PIN code', Boolean(p?.address?.line && p.address.pinCode)],
  ]
  const done = items.filter(([, ok]) => ok).length
  return { items, done, total: items.length, percent: Math.round((done / items.length) * 100) }
}

/* ---------- consultations, payments, records, lab ---------- */

export const listConsultations = (query = {}) => api('/me/consultations', { query })
export const getProvider = (doctorId) => api(`/doctors/${doctorId}`)
export const listServices = () => api('/services')
export const listPayments = (query = {}) => api('/me/payments', { query })
export const listFiles = (category) => api('/me/files', { query: { category } })
export const fileLink = (fileId) => api(`/me/files/${fileId}/download-url`) // { url, expiresInSeconds }, signed fresh each call
export const listLabOrders = (filter = 'all') => api('/me/lab/orders', { query: { filter, limit: 100 } }) // { items, total }
export const labReportLink = (orderId, reportId) => api(`/me/lab/orders/${orderId}/reports/${reportId}/download-url`)

/* ---------- public: partnership, support, legal ---------- */

export const submitPartnership = (body) => api('/partnership-enquiries', { method: 'POST', body, auth: false })
export const supportContact = () => api('/website-settings/public', { auth: false }).then((r) => r.contact) // { email, phone, address, hours }, each null until confirmed (the public endpoint; /support/contact needs a login)
export const raiseComplaint = ({ category, subject, description }) => api('/me/complaints', { method: 'POST', body: { category, subject, description } })
export const legalDocument = (type) => api(`/legal/documents/${type}`, { auth: false })
