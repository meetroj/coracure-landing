import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Menu, Minus, Plus, UserRound, X } from 'lucide-react'
import logo from '../assets/logo/coracure-wide.svg'
import logoWhite from '../assets/logo/coracure-wide-white.svg'
import { CONSULT_MENU, FOOTER_COLS, LINKS } from '../site.js'
import { loginHref, signOut, signupHref, useSession } from '../auth.js'
import { Link, useUrl } from '../router.jsx'
import { useMedia } from './ui.jsx'

/* ---------- Links ---------- */

// a link, or an honestly disabled label while its page isn't published (CSS decides whether a "Soon" tag shows)
export const MaybeLink = ({ href, className, children, ...rest }) => {
  if (!href) return <span className={`soon${className ? ` ${className}` : ''}`} aria-disabled="true" title="Not available yet">{children}</span>
  const external = href.startsWith('http')
  return <Link href={href} className={className} {...(external && { target: '_blank', rel: 'noopener noreferrer' })} {...rest}>{children}</Link>
}

// brand glyphs are no longer in lucide; same monoline weight as the rest of the icons.
// No verified URL yet = not rendered at all (never a link to an unrelated page).
const Social = ({ href, label, children }) => href && (
  <a className="social" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
  </a>
)

/* ---------- Header and footer, shared by every route ---------- */

// which top-level item the current route belongs to
const sectionOf = (path) => (path === '/' ? 'home' : path.startsWith('/lab-tests') ? 'lab' : path === '/consultations' || /^\/(specialties|super-specialties|paramedical|pet-care|dentists|providers|book)(\/|$)/.test(path) ? 'consult' : null)

export function Header() {
  const { pathname, search } = useUrl()
  const section = sectionOf(pathname)
  const here = pathname + search
  const { signedIn } = useSession()
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  // the Consultations dropdown and the account menu are native <details>: they also close on outside tap and Escape
  useEffect(() => {
    const dds = () => ref.current.querySelectorAll('details')
    const onDown = (e) => dds().forEach((d) => { if (!d.contains(e.target)) d.open = false })
    const onKey = (e) => { if (e.key === 'Escape') dds().forEach((d) => { d.open = false }) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])
  // open menu: lock page scroll, close on Escape / outside tap / growing past the menu breakpoint
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onKey = (e) => {
      if (e.key === 'Escape') { close(); ref.current.querySelector('.menu-btn').focus() }
      if (e.key !== 'Tab') return
      // keep Tab inside the header while the menu is open
      const f = [...ref.current.querySelectorAll('a[href], button, summary')].filter((el) => el.offsetParent)
      const [first, last] = [f[0], f[f.length - 1]]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    const onDown = (e) => !ref.current.contains(e.target) && close()
    const onResize = () => window.innerWidth > 1023 && close()
    document.documentElement.classList.add('menu-open')
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.documentElement.classList.remove('menu-open')
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', onResize)
    }
  }, [open])
  const close = () => {
    setOpen(false)
    const dd = ref.current.querySelector('.nav-dd')
    if (dd) dd.open = false
  }
  return (
    // transparent and not sticky: it sits on the hero background and scrolls away with it (never comes back on scroll up)
    <header ref={ref} className={`header${open ? ' is-open' : ''}`}>
      <div className="header-inner">
        <Link href="/" className="logo" onClick={close}>
          <img className="logo-light" src={logo} alt="CoraCure, a healthier connection" width="192" height="48" />
          <img className="logo-dark" src={logoWhite} alt="" aria-hidden="true" width="192" height="48" />
        </Link>
        <nav id="main-nav" className={`nav${open ? ' open' : ''}`} aria-label="Main">
          <MaybeLink href="/" onClick={close} aria-current={section === 'home' ? 'page' : undefined}>Home</MaybeLink>
          <MaybeLink href={LINKS.about}>About Us</MaybeLink>
          <details className="nav-dd">
            <summary aria-current={section === 'consult' ? 'page' : undefined}>Consultations <ChevronDown size={16} aria-hidden="true" /></summary>
            <ul>
              {CONSULT_MENU.map(([label, href]) => <li key={label}><MaybeLink href={href} onClick={close}>{label}</MaybeLink></li>)}
            </ul>
          </details>
          <MaybeLink href={LINKS.labTests} onClick={close} aria-current={section === 'lab' ? 'page' : undefined}>Lab Tests</MaybeLink>
          <MaybeLink href={LINKS.careers}>Careers</MaybeLink>
          {/* phones: the header is too narrow for these, so they live in the menu */}
          <div className="nav-actions">
            {signedIn ? (
              <>
                <Link href="/dashboard" className="btn btn-outline" onClick={close}>Dashboard</Link>
                <button type="button" className="btn btn-primary" onClick={() => { close(); signOut() }}>Log out</button>
              </>
            ) : (
              <>
                <Link href={loginHref(here)} className="btn btn-outline" onClick={close}>Login</Link>
                <Link href={signupHref(here)} className="btn btn-primary" onClick={close}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
        <div className="header-actions">
          {signedIn ? (
            <details className="acct">
              <summary aria-label="Account menu"><span className="acct-avatar"><UserRound size={20} aria-hidden="true" /></span><ChevronDown size={16} aria-hidden="true" /></summary>
              <ul>
                <li><button type="button" onClick={() => { close(); signOut() }}>Log out</button></li>
              </ul>
            </details>
          ) : (
            <>
              <Link href={loginHref(here)} className="btn btn-outline">Login</Link>
              <Link href={signupHref(here)} className="btn btn-primary">Sign Up</Link>
            </>
          )}
          <button type="button" className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}

// a footer column: plain heading on wide screens, an expand/collapse row on phones (collapsed links are not focusable)
function FooterCol({ title, className, children }) {
  const phone = useMedia('(max-width: 767px)')
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <nav className={`footer-col ${className}${open ? ' is-open' : ''}`} aria-label={title}>
      {phone
        ? <h3><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{title}{open ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}</button></h3>
        : <h3>{title}</h3>}
      <div id={id} className="footer-col-body">{children}</div>
    </nav>
  )
}

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo"><img src={logoWhite} alt="CoraCure, a healthier connection" width="240" height="60" /></Link>
            <p className="footer-tagline">Care. Connected.</p>
            <p className="footer-about">Compassionate, connected healthcare for every Indian, today and tomorrow.</p>
          </div>
          {FOOTER_COLS.map(([title, groups]) => (
            <FooterCol key={title} title={title} className={title === 'Contact Us' ? 'footer-col-contact' : ''}>
              {groups.map(([label, links], g) => (
                <div key={g} className="footer-group">
                  {label && <p className="footer-sub">{label}</p>}
                  <ul>{links.map(([text, href]) => <li key={text}><MaybeLink href={href}>{text}</MaybeLink></li>)}</ul>
                </div>
              ))}
              {title === 'Contact Us' && (LINKS.linkedin || LINKS.instagram) && (
                <div className="socials">
                  <Social href={LINKS.linkedin} label="LinkedIn">
                    <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 11v5M8 8v.01M12 16v-5m0 2.5c0-1.4 1-2.5 2.2-2.5S16 12 16 13.5V16" />
                  </Social>
                  <Social href={LINKS.instagram} label="Instagram">
                    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5v.01" />
                  </Social>
                </div>
              )}
            </FooterCol>
          ))}
        </div>

        {/* decorative duplicate of the brand name (never the logo): outlined, clipped at the divider, never interactive.
            Outline = stroke painted first, then the text filled with the footer's own green over it, so only the
            outer half of the stroke shows and the font's internal overlapping contours stay hidden. */}
        <div className="footer-mark" aria-hidden="true">
          <svg viewBox="0 0 1240 196" focusable="false">
            <text x="0" y="214" textLength="1240" lengthAdjust="spacingAndGlyphs">CoraCure</text>
          </svg>
        </div>

        <div className="footer-bottom">
          <p>© {YEAR} CoraCure. All rights reserved.</p>
          <p className="made">Made in India
            <svg className="flag" viewBox="0 0 30 20" role="img" aria-label="Indian flag">
              <rect width="30" height="20" fill="#fff" />
              <rect width="30" height="6.67" fill="#ff9933" />
              <rect y="13.33" width="30" height="6.67" fill="#138808" />
              <g fill="none" stroke="#000080" strokeWidth="0.35">
                <circle cx="15" cy="10" r="2.8" />
                {Array.from({ length: 12 }, (_, i) => (
                  <line key={i} x1="15" y1="7.2" x2="15" y2="12.8" transform={`rotate(${i * 15} 15 10)`} />
                ))}
              </g>
            </svg>
          </p>
        </div>
      </div>
    </footer>
  )
}
