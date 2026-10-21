import { Children, useEffect, useRef, useState } from 'react'
import { ArrowRight, FileText, FlaskConical, Search, Stethoscope } from 'lucide-react'
import appIcon from './assets/logo/coracure-mark-twotone.svg'
import { Footer, Header, MaybeLink } from './components/layout.jsx'
import { ProviderCard } from './components/ProviderCard.jsx'
import { Breadcrumbs, Button, EmptyState, Page, useMedia } from './components/ui.jsx'
import { DIRECTORY } from './directory.js'
import Book from './pages/Book.jsx'
import Consultations from './pages/Consultations.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Listing from './pages/Listing.jsx'
import LabTests, { LabDetail } from './pages/Lab.jsx'
import Profile from './pages/Profile.jsx'
import { Link, navigate, usePageTitle, useRouteScroll, useUrl } from './router.jsx'
import { APP, CONCEPT, GROUPS, LINKS, TABS } from './site.js'

/* The CoraCure website. Routes: / (homepage), /consultations, /{category} and /{category}/{specialty} (provider
   directory), /providers/{slug}, /lab-tests, /lab-tests/{slug}. Header, footer and tokens are shared; the pages'
   data comes from data.js, the destinations from site.js. The logged-in state (health card, appointments, sidebar)
   needs web accounts, which don't exist yet. */

const SEARCH_SUGGESTIONS = ['Lab tests', 'Health packages', ...GROUPS.flatMap((g) => g.items.map(([, name]) => name))]

/* ---------- Small building blocks ---------- */

const Svg = (p) => <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor" {...p} />

const GooglePlayIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path fill="#00a0ff" d="M3.6 1.8c-.4.3-.6.8-.6 1.4v17.6c0 .6.2 1.1.6 1.4L13.7 12z" />
    <path fill="#00c853" d="M3.6 1.8 13.7 12l3.4-3.4L5.3 1.8c-.6-.4-1.3-.4-1.7 0z" />
    <path fill="#ffc400" d="M17.1 8.6 13.7 12l3.4 3.4 4-2.3c1.1-.6 1.1-1.7 0-2.3z" />
    <path fill="#ff3a44" d="M13.7 12 3.6 22.2c.4.4 1.1.4 1.7 0l11.8-6.8z" />
  </svg>
)

const AppleIcon = () => (
  <Svg width="26" height="26"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></Svg>
)

// app store badge: a link once the listing is live, until then a disabled label (never an invented URL).
// ponytail: stand-ins for the official Google Play / App Store artwork, which hasn't been supplied.
const StoreBadge = ({ href, store, icon }) => {
  const label = <span><small>{href ? (store === 'App Store' ? 'Download on the' : 'Get it on') : 'Coming soon on'}</small><strong>{store}</strong></span>
  return href
    ? <a className="store" href={href} target="_blank" rel="noopener noreferrer" aria-label={store === 'App Store' ? 'Download CoraCure on the App Store' : 'Get CoraCure on Google Play'}>{icon}{label}</a>
    : <span className="store" aria-disabled="true" title="Not available yet">{icon}{label}</span>
}

/* Phones: a row of cards swipes sideways (CSS snaps it and lets the next card peek); the dots follow the position.
   Wider screens show the same <ul> as a grid and hide the dots. The list is only a tab stop where it scrolls. */
function Rail({ className, label, children }) {
  const ref = useRef(null)
  const [at, setAt] = useState(0)
  const phone = useMedia('(max-width: 767px)')
  const n = Children.count(children)
  const onScroll = () => {
    const el = ref.current
    const max = el.scrollWidth - el.clientWidth
    setAt(max > 0 ? Math.round((el.scrollLeft / max) * (n - 1)) : 0)
  }
  return (
    <>
      <ul ref={ref} className={className} aria-label={label} tabIndex={phone ? 0 : undefined} onScroll={onScroll}>{children}</ul>
      <div className="dots" aria-hidden="true">{Array.from({ length: n }, (_, i) => <span key={i} className={i === at ? 'on' : undefined} />)}</div>
    </>
  )
}

/* ---------- Homepage sections ---------- */

// Search opens the Consultations search (specialties, providers) or the lab catalogue for lab words, keeping the query
const LAB_WORDS = /lab|test|package|blood|sample/i
function onSearch(e) {
  e.preventDefault()
  const q = new FormData(e.currentTarget).get('q').trim()
  if (!q) return
  navigate(`${LAB_WORDS.test(q) ? LINKS.labTests : LINKS.consultations}?q=${encodeURIComponent(q)}`)
}

function Hero() {
  // ponytail: read once at render, so it doesn't follow a window resize; the full text doesn't fit a phone-width field
  const narrow = (px) => matchMedia(`(max-width: ${px}px)`).matches
  const placeholder = narrow(359) ? 'Search doctors or tests' : narrow(389) ? 'Search doctors or lab tests' : 'Search symptoms, doctors or lab tests'
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <h1 className="t-display">Your Health, <span>Our Priority.</span></h1>
        <p className="hero-sub">Find healthcare professionals and explore lab tests, all in one place.</p>
        <form className="search" role="search" onSubmit={onSearch}>
          <button type="submit" className="search-icon" aria-label="Search"><Search size={22} aria-hidden="true" /></button>
          <input name="q" list="concerns" autoComplete="off" enterKeyHint="search" placeholder={placeholder} aria-label="Search symptoms, doctors or lab tests" />
          <datalist id="concerns">{SEARCH_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
        </form>
        <p className="search-note">Search points you to the right kind of care; it is not a diagnosis. For emergency purposes, consult nearby hospital.</p>

        {/* no web booking yet: both cards open the app download until LINKS.consultations / LINKS.labTests are set.
            The row sits --overlap px onto the next section (normal flow, negative margin: it can't collide when text wraps). */}
        <div className="svc-grid">
          <Link id="consult" className="svc svc-primary" href={LINKS.consultations ?? APP} title={LINKS.consultations ? undefined : 'Available in the CoraCure app'}>
            <span className="svc-icon"><Stethoscope size={36} aria-hidden="true" /></span>
            <div className="svc-text">
              <h2>Consult a Doctor</h2>
              <p>Explore consultations across specialties.</p>
            </div>
            <span className="svc-go"><ArrowRight size={20} aria-hidden="true" /></span>
          </Link>
          <Link id="lab-tests" className="svc svc-lab" href={LINKS.labTests ?? APP} title={LINKS.labTests ? undefined : 'Available in the CoraCure app'}>
            <span className="svc-icon"><FlaskConical size={36} aria-hidden="true" /></span>
            <div className="svc-text">
              <h2>Lab Tests</h2>
              <p>Explore tests and health packages.</p>
            </div>
            <span className="svc-go"><ArrowRight size={20} aria-hidden="true" /></span>
          </Link>
        </div>
      </div>
    </section>
  )
}

// teal band that links to the three groups below; the pill follows the group in view (links, not filters)
function Intro() {
  const [active, setActive] = useState(TABS[0].id)
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    TABS.forEach((t) => io.observe(document.getElementById(t.id)))
    return () => io.disconnect()
  }, [])
  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="intro-band">
        <div className="wrap">
          <h2 id="intro-title" className="t-page">The right care, for every need.</h2>
          <p className="intro-sub">Explore specialties and healthcare professionals.</p>
          <nav className="intro-tabs" aria-label="Provider groups">
            {TABS.map((t) => (
              <a key={t.id} href={`#${t.id}`} aria-current={active === t.id ? 'true' : undefined}>{t.title}</a>
            ))}
          </nav>
        </div>
        <p className="intro-tag" aria-hidden="true">Different experts.<br />A healthier tomorrow.</p>
        <div className="intro-photo" aria-hidden="true" />
      </div>
    </section>
  )
}

function Group({ id, tone, title, blurb, viewAll, role, items, first }) {
  return (
    <section className={`group group-${tone}`} id={id} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        {CONCEPT && first && <p className="notice">Profiles are concept previews, not real providers. Directories and profile pages open once approved provider data is connected.</p>}
        <div className="group-head">
          <div>
            <h2 id={`${id}-title`} className="t-h2">{title}</h2>
            <p>{blurb}</p>
          </div>
          <MaybeLink href={viewAll} className="link">View All <ArrowRight size={18} aria-hidden="true" /></MaybeLink>
        </div>
        {CONCEPT
          ? items.length > 3
            ? <ul className="pcards pcards-4">
                {items.map(([Icon, name]) => <ProviderCard key={name} Icon={Icon} category={name} role={role} />)}
              </ul>
            : <Rail className="pcards" label={`${title} profiles`}>
                {items.map(([Icon, name]) => <ProviderCard key={name} Icon={Icon} category={name} role={role} />)}
              </Rail>
          : <p className="row-empty">Coming soon.</p>}
      </div>
    </section>
  )
}

// Pet Care has its own composition: BG/Golden retriever and tabby cat.png as a photo layer at the right on desktop,
// and as a separate crop (.pet-photo) between the heading and the cards when it stacks.
function PetCare() {
  const { title, blurb, viewAll, role, items } = GROUPS.find((g) => g.id === 'pet-care')
  const [[Icon, name]] = items
  return (
    <section className="pet" id="pet-care" aria-labelledby="pet-care-title">
      <div className="wrap">
        <div className="pet-main">
          <div className="group-head">
            <div>
              <h2 id="pet-care-title" className="t-h2">{title}</h2>
              <p>{blurb}</p>
              <span className="pet-rule" aria-hidden="true" />
            </div>
            <MaybeLink href={viewAll} className="link">View All <ArrowRight size={18} aria-hidden="true" /></MaybeLink>
          </div>
          <div className="pet-photo" role="img" aria-label="A golden retriever and a tabby cat resting together on a blanket" />
          {CONCEPT
            ? <Rail className="vets" label="Veterinary profiles">
                <ProviderCard Icon={Icon} category={name} role={role} variant="horizontal" />
                <ProviderCard Icon={Icon} category={name} role={role} variant="horizontal" />
                <ProviderCard Icon={Icon} category={name} role={role} variant="horizontal" />
              </Rail>
            : <p className="row-empty">Coming soon.</p>}
        </div>
      </div>
    </section>
  )
}

const APP_POINTS = [[Stethoscope, 'Consultations'], [FlaskConical, 'Lab Tests'], [FileText, 'Health Records']]

// BG/download (7).png behind a centred stack: heading, copy, app icon, store badges, divider, three facts.
function AppDownload() {
  return (
    <section className="app" id="download" aria-labelledby="app-title">
      <div className="wrap">
        <h2 id="app-title" className="t-h2">Healthcare at your fingertips</h2>
        <p className="app-sub">Consultations, lab tests and health records.<br />One connected app.</p>
        {/* ponytail: the brand mark stands in until the official app icon file is supplied */}
        <img className="app-icon" src={appIcon} width="56" height="56" alt="CoraCure app icon" />
        <div className="stores">
          <StoreBadge href={LINKS.playStore} store="Google Play" icon={<GooglePlayIcon />} />
          <StoreBadge href={LINKS.appStore} store="App Store" icon={<AppleIcon />} />
        </div>
        <ul className="app-points">
          {APP_POINTS.map(([Icon, label]) => (
            <li key={label}><Icon size={32} aria-hidden="true" />{label}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- Routing ---------- */

const CATEGORY_ROUTES = new Set(Object.keys(DIRECTORY))

// [page, props] for a path, or null (not found)
function match(pathname) {
  const [a, b, c] = pathname.replace(/\/+$/, '').slice(1).split('/')
  if (!a) return [Home, {}]
  if (a === 'open') return [OpenInApp, {}]
  if (c) return null
  if (a === 'consultations' && !b) return [Consultations, {}]
  if (a === 'providers' && b) return [Profile, { slug: b }]
  if (a === 'book' && b) return [Book, { slug: b }]
  if (a === 'dashboard' && !b) return [Dashboard, {}]
  if (a === 'lab-tests') return b ? [LabDetail, { slug: b }] : [LabTests, {}]
  if (CATEGORY_ROUTES.has(a)) return [Listing, { group: a, slug: b }]
  return null
}

// A shared app link (/open/...) that reached the website. With the app installed Android opens it there and never
// shows this; without it, this offers the same link through the app's own scheme, and the download.
// ponytail: no automatic redirect to coracure:// (desktop browsers show an error); add a store link via LINKS.playStore.
function OpenInApp() {
  usePageTitle('Open in the CoraCure app')
  const rest = useUrl().pathname.replace(/^\/open\/?/, '')
  return (
    <Page bg="profile" title="Open in the app">
      <EmptyState title="Open this in the CoraCure app" action={<Button href={`coracure://open/${rest}`}>Open in app</Button>}>
        Don't have the app yet? <Link href={APP}>Get the app</Link>, then tap the link again.
      </EmptyState>
    </Page>
  )
}

function NotFound() {
  return (
    <Page bg="profile" title="Page not found">
      <Breadcrumbs items={[['Home', '/'], ['Page not found']]} />
      <EmptyState title="We could not find that page" action={<Button href="/">Go to the homepage</Button>}>The link may be out of date, or the page is not published yet.</EmptyState>
    </Page>
  )
}

function Home() {
  usePageTitle('CoraCure | Your Health, Our Priority')
  return (
    <>
      <Hero />
      {/* personalised cards (greeting, Patient Health Card, upcoming appointments) render here for signed-in patients only */}
      <div className="discover">
        <Intro />
        {GROUPS.slice(0, 3).map((g, i) => <Group key={g.id} {...g} first={i === 0} />)}
        <PetCare />
      </div>
      <AppDownload />
    </>
  )
}

export default function App() {
  const url = useUrl()
  useRouteScroll()
  const [Route, props] = match(url.pathname) ?? [NotFound, {}]
  return (
    <>
      <a className="skip" href="#main">Skip to main content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Route key={url.pathname} {...props} />
      </main>
      <Footer />
    </>
  )
}
