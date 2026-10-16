import { useEffect, useRef, useSyncExternalStore } from 'react'
import { scrollToEl, scrollToTop } from './scroll.js'

/* A tiny path router (History API): routes, links, query params, scroll. No dependency; the host must serve
   index.html for every path (see README "Routes"). */

const subs = new Set()
let lastNav = 'push'
const emit = () => subs.forEach((f) => f())
const subscribe = (f) => {
  subs.add(f)
  return () => subs.delete(f)
}
addEventListener('popstate', () => {
  lastNav = 'pop'
  emit()
})
const snapshot = () => location.pathname + location.search + location.hash

export function navigate(to, { replace = false } = {}) {
  lastNav = replace ? 'replace' : 'push'
  history[replace ? 'replaceState' : 'pushState'](null, '', to)
  emit()
}

export function useUrl() {
  useSyncExternalStore(subscribe, snapshot)
  return new URL(location.href)
}

// [params, set]: set(next) writes the query with replaceState so filtering never fills the history
export function useSearchParams() {
  const url = useUrl()
  const set = (next, { replace = true } = {}) => {
    const qs = next.toString()
    navigate(url.pathname + (qs ? `?${qs}` : '') + url.hash, { replace })
  }
  return [url.searchParams, set]
}

const internal = (href) => typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')

// internal hrefs navigate without a reload; modified clicks, new tabs and external links stay native
export function Link({ href, onClick, ...rest }) {
  const go = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || !internal(href) || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return
    e.preventDefault()
    navigate(href)
  }
  return <a href={href} onClick={go} {...rest} />
}

// new page = top (or its #anchor); Back/Forward and filter changes (same path) keep the scroll position
export function useRouteScroll() {
  const { pathname, hash } = useUrl()
  const prev = useRef(null)
  useEffect(() => {
    const moved = prev.current !== pathname
    prev.current = pathname
    const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (el) requestAnimationFrame(() => scrollToEl(el))
    else if (moved && lastNav !== 'pop') scrollToTop()
  }, [pathname, hash])
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title
  }, [title])
}
