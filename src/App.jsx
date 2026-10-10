import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Bell, BookOpen, Brain, Calendar, CalendarCheck, CalendarClock, Check, ChevronDown, ChevronRight, ChartNoAxesColumn,
  ClipboardList, Download, FileText, Languages, Leaf, LifeBuoy, Lock, MapPin, Menu, MessageCircle,
  MessageSquareText, Moon, Percent, ReceiptText, Search, RefreshCw, ShieldCheck, Sprout, Stethoscope,
  TriangleAlert, Users, Video, X,
} from 'lucide-react'
import bg from './assets/BG/hero (3).png'
import servicesBg from './assets/BG/2 (6).png'
import howBg from './assets/BG/3 (7).png'
import heroImg from './assets/images/herocard.png'
import logo from './assets/logo/coracure-mark-twotone.svg'

/* ---------- Content (facts from the CoraCure SRS / apps) ---------- */

const NAV = [
  ['Find a Doctor', '#find-a-doctor'],
  ['How It Works', '#how-it-works'],
  ['Specialties', '#specialties'],
  ['Care Plans', '#care-plans'],
  ['Resources', '#faq'],
  ['For Doctors', '#for-doctors'],
]

const SEARCH_SUGGESTIONS = [
  'Psychiatry', 'Psychology', 'Therapy & Counselling', 'De-addiction', 'Sleep & Stress',
  'Depression', 'Anxiety', 'OCD', 'Substance use', 'Child & adolescent', "Women's mental health", 'Elderly care',
]

const WHY = [
  [ShieldCheck, 'Verified providers', 'Every psychiatrist, psychologist and counsellor is credential-checked before they can take a single consultation.'],
  [Languages, 'Care in your language', "You're matched with a provider who speaks your language, so nothing gets lost in translation."],
  [Lock, 'Private by design', 'Consultations are never recorded, and notifications never mention your diagnosis.'],
  [CalendarCheck, '7 days of follow-up', "Daily check-ins after every consultation, so your doctor knows how you're really doing."],
  [ReceiptText, 'Clear, itemised pricing', 'See the consultation fee, convenience fee and GST before you pay. No surprises.'],
  [LifeBuoy, 'Safety comes first', "If you're in crisis, CoraCure shows emergency guidance and helplines right away."],
]

const LANGUAGES = ['English', 'Hindi', 'Hinglish', 'Marathi', 'Kannada', 'Punjabi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Malayalam', 'Urdu']

const STEPS = [
  [MessageCircle, "Tell us what's going on", "Type or speak in English, Hindi or Hinglish. We'll point you to the right kind of care, or you can pick a service yourself."],
  [CalendarClock, 'Choose a time, or consult now', 'Book a slot that suits you or request an instant consultation. A verified provider who speaks your language is assigned.'],
  [Video, 'Meet on private video', 'Pay securely, run a quick device check and join your consultation in the app. Nothing is recorded.'],
  [ClipboardList, 'Get a plan that continues', 'Receive your e-prescription or therapy plan, then 7 days of check-ins and an easy follow-up with the same doctor.'],
]

const Ico = ({ children }) => (
  <svg className="hex-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

// pos = honeycomb slot (see .hex-* in index.css); i = reveal order (featured last); DOM order = mobile carousel order
const SERVICES = [
  { pos: 'gp', i: 0, title: 'General Psychiatry', text: 'Comprehensive evaluation and personalised treatment for a wide range of mental health conditions.',
    icon: <Brain className="hex-icon" strokeWidth={1.25} aria-hidden="true" /> },
  { pos: 'ax', i: 1, title: 'Anxiety & Stress', text: 'Evidence-based care to help manage anxiety, reduce stress, and regain a sense of calm.',
    icon: <Ico><path d="M12 20c-4.4 0-8-3-8.5-7.5 3 0 5.8 1.3 8.5 4 2.7-2.7 5.5-4 8.5-4-.5 4.5-4.1 7.5-8.5 7.5Z" /><path d="M12 16.5c-1.8-1.9-2.6-4-2.6-6.2 0-2 .9-4 2.6-5.8 1.7 1.8 2.6 3.8 2.6 5.8 0 2.2-.8 4.3-2.6 6.2Z" /><path d="M7.2 11.6C6.8 9.8 7 8 7.8 6.4c.8.4 1.5.9 2.1 1.5M16.8 11.6c.4-1.8.2-3.6-.6-5.2-.8.4-1.5.9-2.1 1.5" /></Ico> },
  { pos: 'dep', i: 5, featured: true, title: 'Depression Support', text: 'Compassionate, structured care to help you feel better, reconnect with what matters, and move forward.',
    icon: <Ico><path d="M12 2.5v2M7.3 3.8l1.1 1.6M16.7 3.8l-1.1 1.6" /><path d="M12 21 6 15.2C4.6 13.8 4 12.6 4 11.2a3.7 3.7 0 0 1 3.7-3.7c1.6 0 2.9.8 4.3 2.2 1.4-1.4 2.7-2.2 4.3-2.2a3.7 3.7 0 0 1 3.7 3.7c0 1.4-.6 2.6-2 4Z" /></Ico> },
  { pos: 'ad', i: 2, title: 'Addiction Care', text: 'Nonjudgmental support for lasting recovery, with treatment tailored to your goals.',
    icon: <Sprout className="hex-icon" strokeWidth={1.25} aria-hidden="true" /> },
  { pos: 'ch', i: 3, title: 'Child & Adolescent Care', text: 'Specialised, age-appropriate support for children and teens to help them thrive.',
    icon: <Ico><circle cx="8" cy="6.5" r="3" /><path d="M2.5 20v-2.5a5.5 5.5 0 0 1 11 0V20" /><circle cx="17" cy="10" r="2.3" /><path d="M13.5 20v-1.7a3.5 3.5 0 0 1 7 0V20" /></Ico> },
  { pos: 'sl', i: 4, title: 'Sleep Disorders', text: 'Evaluation and treatment for sleep concerns that affect mental and overall health.',
    icon: <Ico><path d="M13 4.5a7 7 0 0 0 6.5 9.8A8.5 8.5 0 1 1 13 4.5Z" /><path d="M16 3.5h2.6L16 6.6h2.6M20 1.5h1.8L20 3.7h1.8" /></Ico> },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TODAY = 3 // Thu: days before are done, days after upcoming
const SELF_HELP = [[Leaf, '5-minute breathing exercise'], [BookOpen, 'Managing anxious thoughts'], [Moon, 'Better sleep habits']]

const DOCTOR_FEATURES = [
  [Percent, 'Keep your fee', 'Your consultation fee stays 100% yours. Platform fees are paid separately.'],
  [Calendar, 'Set your hours', "Set weekly slots and leave, or switch to 'Available now'."],
  [FileText, 'Clinical notes', 'Structured case summaries and digitally signed e-prescriptions.'],
  [Bell, 'Follow-up alerts', 'Red flags and missed check-ins surface before they become a crisis.'],
  [Users, 'Expert review', 'Get a second opinion from a senior colleague on an anonymised case.'],
  [ChartNoAxesColumn, 'Transparent earnings', 'Track every consultation and payout from your dashboard.'],
]

const FAQS = [
  ['Do I choose my doctor?', "You choose the service and a time. CoraCure assigns a verified provider who fits your need and speaks your language, and you'll see their name, qualifications, registration number and experience before the consultation."],
  ['Are consultations recorded?', 'No. Your video consultation is private and is never recorded. Notifications on your phone never mention your diagnosis.'],
  ['What happens after my consultation?', "You get a Care Plan with your prescription or therapy plan, recommended self-help and 7 days of daily check-ins. Booking a follow-up with the same doctor takes a few taps."],
  ['Which languages can I consult in?', `${LANGUAGES.slice(0, -1).join(', ')} and ${LANGUAGES.at(-1)}.`],
  ['Is CoraCure for emergencies?', 'No. If you or someone you know is in immediate danger, call 112. For free 24/7 mental health support, call Tele-MANAS on 14416.'],
  ["I'm a doctor. How do I join?", 'Download the CoraCure Doctor app, sign in with your mobile number and submit your identity, qualifications and registration. Our team verifies everything before your profile goes live.'],
]

// ponytail: every '#' is a page that doesn't exist yet (library, stories, legal, socials); swap in real URLs when published
const FOOTER_LINKS = [
  ['Patients', [['Find a Doctor', '#find-a-doctor'], ['Book Appointment', '#download'], ['Health Library', '#'], ['Mental Health Support', '#specialties'], ['Patient Stories', '#'], ['Help Centre', '#faq']]],
  ['Doctors', [['Join CoraCure', '#download'], ['For Providers', '#for-doctors'], ['Clinical Resources', '#'], ['Telehealth Tools', '#for-doctors'], ['Doctor Stories', '#'], ['Support', '#faq']]],
  ['Legal', [['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#'], ['Data Protection', '#'], ['Compliance', '#'], ['Grievance Redressal', '#']]],
]
const FOOTER_BOTTOM = [['Privacy', '#'], ['Terms', '#'], ['LinkedIn', '#'], ['Instagram', '#']]

/* ---------- Small building blocks ---------- */

const Logo = () => (
  <a href="#top" className="logo">
    <img src={logo} alt="" width="44" height="44" />
    CoraCure
  </a>
)


const Svg = (p) => <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor" {...p} />
// CoraCure mark as inline SVG: outer shape takes currentColor, inner diamond stays mint, so it works on dark backgrounds
const Mark = (p) => (
  <Svg viewBox="0 0 76.4 76.4" {...p}>
    <g transform="matrix(1,0,0,-1,-192.3997,167.9906)">
      <path d="M214.7394 158.4836 219.541 153.6831C220.4759 152.7486 222.0007 152.7486 222.9352 153.6831L228.702 159.4502C229.6372 160.3845 231.1611 160.3843 232.0965 159.4502 241.4789 150.0681 250.8616 140.6849 260.2446 131.3022 261.1786 130.3671 261.1786 128.8431 260.2446 127.908L254.4772 122.1403C253.5426 121.2052 253.5426 119.681 254.4772 118.7464L259.2777 113.9451C259.852 113.3717 260.6037 113.1361 261.4022 113.2801 262.2005 113.4244 262.8224 113.9074 263.1591 114.6461 265.7469 120.3205 266.7855 126.534 266.2722 132.645 265.5862 140.8175 262.1132 148.8027 255.8557 155.0614 249.5976 161.3194 241.6116 164.7918 233.439 165.4781 227.3287 165.9906 221.1151 164.9526 215.4407 162.3654 214.7029 162.0286 214.219 161.4061 214.0744 160.6079 213.9307 159.8097 214.1657 159.0576 214.7394 158.4836ZM215.4832 149.6254 209.2062 155.9024C208.2915 156.8183 206.8132 156.8421 205.8681 155.9568 205.5628 155.6705 205.2539 155.3715 204.9429 155.0608 197.9141 148.0311 194.3997 138.8183 194.3997 129.6051 194.4 120.8214 197.5938 112.0371 203.9822 105.1466 204.5083 104.5791 204.4922 103.6976 203.9454 103.1499L196.8579 96.0523C196.4373 95.6319 196.3179 95.0326 196.5461 94.483 196.7737 93.9334 197.2814 93.594 197.8761 93.594H230.0295L230.0156 93.6079 230.3994 93.6057V93.594C239.6055 93.594 248.8187 97.1121 255.8557 104.1491 256.1661 104.4595 256.4646 104.7688 256.7509 105.0744 257.6353 106.0189 257.6115 107.4963 256.6962 108.4119L250.4194 114.6895C249.4845 115.6235 247.9603 115.6235 247.0252 114.6895L232.0965 99.7597C231.1611 98.8251 229.6372 98.8251 228.702 99.7597L200.5543 127.908C199.62 128.8431 199.62 130.3671 200.5543 131.3022L215.4832 146.2317C216.4178 147.1663 216.4178 148.6905 215.4832 149.6254" fillRule="evenodd" />
      <path d="M219.5402 142.1736 208.6693 131.3022C207.7347 130.3671 207.7347 128.8431 208.6693 127.908L228.702 107.8744C229.6372 106.9401 231.1611 106.9398 232.0965 107.8744 238.7741 114.552 245.452 121.2304 252.1295 127.908 253.0641 128.8426 253.0641 130.3671 252.1295 131.3022L241.2578 142.1736C240.323 143.1082 238.7979 143.1079 237.8633 142.1734L232.0965 136.406C231.1611 135.4711 229.6372 135.4714 228.702 136.406L222.9347 142.1736C221.9998 143.1082 220.4756 143.1079 219.5402 142.1736" fill="var(--mint)" fillRule="evenodd" />
    </g>
  </Svg>
)

const Chevron = () => <ChevronDown className="chevron" size={18} aria-hidden="true" />

/* ---------- Sections ---------- */

function Header() {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > lastY && y > 80)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // open menu: lock page scroll, close on Escape / outside tap / growing past the menu breakpoint
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onKey = (e) => e.key === 'Escape' && close()
    const onDown = (e) => !ref.current.contains(e.target) && close()
    const onResize = () => window.innerWidth > 1199 && close()
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
  const close = () => setOpen(false)
  return (
    <header ref={ref} className={`header${hidden && !open ? ' header-hidden' : ''}`}>
      <div className="wrap header-inner">
        <Logo />
        <nav id="main-nav" className={`nav${open ? ' open' : ''}`} aria-label="Main">
          {NAV.map(([label, href]) => <a key={label} href={href} onClick={close}>{label}</a>)}
          {/* phones: the header is too narrow for these, so they live in the menu */}
          <div className="nav-actions">
            <a href="#download" className="btn btn-primary" onClick={close}>Book Consultation</a>
            <a href="#download" className="btn btn-outline" onClick={close}>Sign In</a>
          </div>
        </nav>
        <div className="header-actions">
          <a href="#download" className="signin">Sign In</a>
          <a href="#download" className="btn btn-primary btn-sm">Book Consultation</a>
          <button type="button" className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url("${bg}")` }}>
      <div className="wrap">
        <h1>Care that listens.<br />Support that continues.</h1>
        <p className="hero-tag">Expert care, from the comfort of home.</p>
        <p className="hero-sub">
          Connect with verified doctors, receive a clear care plan and stay supported after every consultation.
        </p>
        <div className="hero-ctas">
          <a href="#find-a-doctor" className="btn btn-primary btn-lg">Find a Doctor</a>
          <a href="#download" className="btn btn-outline btn-lg">Consult Now</a>
        </div>

        <div className="hero-media">
          <img className="hero-img" src={heroImg} width="2073" height="759" fetchPriority="high" alt="Patient smiling during a video consultation with a doctor on her laptop" />

          <ul className="trust">
            <li>
              <Svg>
                <path d="M12 2 4 5v6c0 5.2 3.4 9.8 8 11 4.6-1.2 8-5.8 8-11V5z" />
                <path d="m8.5 12 2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              Verified Doctors
            </li>
            <li>
              <Svg>
                <rect x="4" y="10" width="16" height="12" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.2" fill="none" />
              </Svg>
              Private &amp; Secure
            </li>
            <li>
              <Svg>
                <circle cx="12" cy="7" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0z" />
                <circle cx="4.5" cy="9" r="2.5" /><path d="M0 19a4.5 4.5 0 0 1 6-4.2A8.5 8.5 0 0 0 3.6 19z" />
                <circle cx="19.5" cy="9" r="2.5" /><path d="M24 19a4.5 4.5 0 0 0-6-4.2 8.5 8.5 0 0 1 2.4 4.2z" />
              </Svg>
              Follow-up Support
            </li>
          </ul>

          {/* ponytail: no web booking yet; wire onSubmit to the app/deep link once it exists */}
          <form id="find-a-doctor" className="search" onSubmit={(e) => e.preventDefault()}>
            <label className="field field-wide">
              <Search size={20} aria-hidden="true" />
              <input name="q" list="concerns" autoComplete="off" enterKeyHint="search" placeholder="Search by specialty or concern" aria-label="Specialty or concern" />
              <Chevron />
            </label>
            <datalist id="concerns">{SEARCH_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
            <label className="field">
              <MapPin size={20} aria-hidden="true" />
              <input name="loc" autoComplete="address-level2" enterKeyHint="search" placeholder="Enter your location" aria-label="Location" />
              <Chevron />
            </label>
            <label className="field">
              <Video size={20} aria-hidden="true" />
              <select name="mode" aria-label="Consultation type">
                <option>Video Consultation</option>
                <option>Consult Now (instant)</option>
              </select>
              <Chevron />
            </label>
            <button type="submit" className="btn btn-primary search-btn">Search</button>
          </form>
        </div>
      </div>
    </section>
  )
}

const WhyItem = ({ item: [Icon, title, text], i }) => (
  <article className="why-item" style={{ '--i': i }}>
    <span className="why-icon"><Icon size={26} aria-hidden="true" /></span>
    <h3>{title}</h3>
    <p>{text}</p>
  </article>
)

function Why() {
  const ref = useReveal()
  return (
    <section ref={ref} className="why" id="why">
      <div className="wrap">
        <div className="why-head" style={{ '--i': 0 }}>
          <div>
            <p className="eyebrow">Why CoraCure</p>
            <h2 className="why-title">Mental health care that doesn’t end when the call does</h2>
          </div>
          <p className="lead why-lead">
            CoraCure isn't a video-call marketplace. It's a clinically governed consultation service, built around what
            happens before, during and after you talk to a doctor.
          </p>
        </div>
        <div className="why-grid">
          {WHY.map((item, i) => <WhyItem key={item[1]} item={item} i={i + 1} />)}
        </div>
      </div>
    </section>
  )
}

// adds .in once the section scrolls into view; CSS only hides content when motion is allowed
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

// reserves room for the longest open answer, so opening or closing a question never resizes the FAQ
function useSteadyAccordion() {
  const ref = useRef(null)
  useEffect(() => {
    const list = ref.current
    let width = 0
    const measure = () => {
      const items = [...list.children]
      let closed = 0
      let extra = 0
      for (const item of items) {
        const probe = item.cloneNode(true)
        probe.removeAttribute('name') // a clone in the same group would close the open question
        probe.style.cssText = 'position:absolute;inset:0 0 auto;visibility:hidden'
        list.append(probe)
        probe.open = false
        const h = probe.getBoundingClientRect().height
        probe.open = true
        extra = Math.max(extra, probe.getBoundingClientRect().height - h)
        closed += h
        probe.remove()
      }
      const gaps = parseFloat(getComputedStyle(list).rowGap) * (items.length - 1)
      list.style.minHeight = `${Math.ceil(closed + gaps + extra)}px`
    }
    // answers re-wrap when the width changes; height changes (our own min-height) are ignored
    const ro = new ResizeObserver(([e]) => {
      if (e.contentRect.width !== width) { width = e.contentRect.width; measure() }
    })
    ro.observe(list)
    document.fonts.ready.then(measure)
    return () => ro.disconnect()
  }, [])
  return ref
}

function HowItWorks() {
  const ref = useReveal()
  const stepsRef = useRef(null)
  const [active, setActive] = useState(0)
  // the step crossing the middle of the viewport becomes active; between steps the last one stays lit
  useEffect(() => {
    const items = [...stepsRef.current.children]
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(items.indexOf(e.target)) })
    }, { rootMargin: '-50% 0px -50% 0px' })
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} className="how" id="how-it-works" style={{ backgroundImage: `url("${howBg}")` }}>
      <div className="wrap how-grid">
        <div className="how-copy">
          <p className="eyebrow">How it works</p>
          <h2 className="how-title">From your first concern to continuing care</h2>
          <p className="lead">
            Get expert care, on your terms, from the first question to a personalized plan and ongoing support with the same doctor.
          </p>
        </div>

        <ol className="timeline" ref={stepsRef}>
          {STEPS.map(([Icon, title, text], i) => (
            <li key={title} className={`tl-step${i === active ? ' active' : ''}`} aria-current={i === active ? 'step' : undefined} style={{ '--i': i }}>
              <span className="tl-num" aria-hidden="true">0{i + 1}</span>
              <div className="tl-card">
                <span className="tl-icon"><Icon size={36} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Services() {
  const ref = useReveal()

  return (
    <section ref={ref} className="services" id="specialties" style={{ backgroundImage: `url("${servicesBg}")` }}>
      <div className="wrap services-grid">
        <div className="svc-copy">
          <p className="eyebrow">Our services</p>
          <h2 className="svc-title">Mental healthcare<br /><span>built around you</span></h2>
          <p className="lead">
            Compassionate, evidence-based psychiatry for every stage of life. We tailor care to your unique needs,
            helping you feel better, function fuller, and move toward a healthier tomorrow.
          </p>
          <a href="#how-it-works" className="btn btn-primary btn-lg copy-cta">Explore services <ArrowRight size={18} aria-hidden="true" /></a>
        </div>

        <div className="hex-cluster">
          {SERVICES.map((s) => (
            <article key={s.pos} className={`hex hex-${s.pos}${s.featured ? ' hex-featured' : ''}`} style={{ '--i': s.i }}>
              <div className="hex-inner">
                <svg className="hex-shape" viewBox="0 0 100 86.6" aria-hidden="true">
                  <polygon points="25.4,0.75 74.6,0.75 99.15,43.3 74.6,85.85 25.4,85.85 0.85,43.3" vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="hex-body">
                  {s.icon}
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CarePlans() {
  const ref = useReveal()
  return (
    <section ref={ref} className="care" id="care-plans">
      <div className="wrap care-grid">
        <div className="care-copy">
          <p className="eyebrow">Care plans</p>
          <h2 className="care-title">Support that continues after every consultation</h2>
          <p className="lead">
            Every consultation ends with a Care Plan in your app: a clear next step, not a goodbye. From e-prescriptions
            to daily check-ins, evidence-based self-help and safety guidance, we're with you between appointments.
          </p>
          <a href="#download" className="btn btn-primary btn-lg copy-cta">Explore care plans <ArrowRight size={18} aria-hidden="true" /></a>
        </div>

        {/* illustrative app screen: one summary for screen readers instead of a dozen look-alike controls */}
        <div
          className="bento"
          role="img"
          aria-label="Example Care Plan in the CoraCure app: 7-day check-in progress on day 4, an e-prescription ready to download, doctor-recommended self-help, guidance on when to reach out, and the next follow-up appointment."
        >
          <div className="bcard b-progress" style={{ '--i': 0 }}>
            <div className="b-head">
              <span className="b-icon"><CalendarCheck size={24} /></span>
              <div><h3>7-day check-in progress</h3><p>A minute a day to track how you're feeling.</p></div>
              <span className="b-badge">Day {TODAY + 1} of 7</span>
            </div>
            <ol className="days">
              {DAYS.map((d, i) => (
                <li key={d} className={i < TODAY ? 'done' : i === TODAY ? 'today' : ''} style={{ '--d': i }}>
                  <span className="dot">{i < TODAY && <Check size={15} strokeWidth={3} />}</span>
                  {d}
                </li>
              ))}
            </ol>
            <div className="b-today">
              <MessageSquareText size={22} />
              <div><strong>Today's check-in</strong><span>How are you feeling right now?</span></div>
              <span className="b-btn b-btn-solid">Check in</span>
            </div>
          </div>

          <div className="bcard b-rx" style={{ '--i': 1 }}>
            <span className="b-icon round"><FileText size={24} /></span>
            <h3>E-prescription ready</h3>
            <p>Download your prescription any time and share it with your pharmacy.</p>
            <span className="b-btn b-btn-outline wide"><Download size={18} /> Download PDF</span>
          </div>

          <div className="bcard b-help" style={{ '--i': 2 }}>
            <div className="b-head">
              <span className="b-icon"><BookOpen size={24} /></span>
              <div><h3>Doctor-recommended self-help</h3><p>Personalised exercises and reading chosen for you.</p></div>
            </div>
            <ul className="b-rows">
              {SELF_HELP.map(([Icon, t]) => (
                <li key={t}><Icon size={20} /><span>{t}</span><ChevronRight size={18} className="chev" /></li>
              ))}
            </ul>
          </div>

          <div className="bcard b-safety" style={{ '--i': 3 }}>
            <span className="b-icon round amber"><TriangleAlert size={24} /></span>
            <h3>Know when to reach out</h3>
            <p>If a check-in shows something's wrong, your doctor is alerted and you get guidance right away.</p>
            <span className="b-btn b-btn-amber">View safety guide <ChevronRight size={16} /></span>
          </div>

          <div className="bcard b-follow" style={{ '--i': 4 }}>
            <span className="b-icon round"><CalendarCheck size={24} /></span>
            <h3>Next follow-up</h3>
            <p>Scheduled with your psychiatrist.</p>
            <div className="b-appt"><strong>Tue, 16 Apr</strong><span>4:00 PM (30 mins)</span></div>
            <span className="b-btn b-btn-outline wide"><Calendar size={16} /> Reschedule</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ForDoctors() {
  return (
    <section className="doctors" id="for-doctors">
      <div className="doc-canvas">
        <p className="doc-label">For clinicians</p>
        <div className="doc-copy">
          <h2>Your practice,<br />without the<br />admin burden.</h2>
          <p>CoraCure handles the operational complexity, so you can focus on what you do best: caring for patients. More time for people, less time on paperwork.</p>
        </div>
        <ol className="doc-grid">
          {DOCTOR_FEATURES.map(([Icon, title, text], i) => (
            <li key={title}>
              <span className="doc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="doc-icon"><Icon strokeWidth={1.5} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="doc-cta">
          <p>Ready to practise differently?</p>
          <div>
            <a href="#download" className="btn btn-mint">Get the Doctor app <ArrowRight size={18} aria-hidden="true" /></a>
            <a href="#faq" className="btn btn-ghost">How verification works <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const listRef = useSteadyAccordion()
  return (
    <section className="section faq-section" id="faq">
      {/* viewBox sized to Outfit cap height (0.7em) so the letters span the full section height */}
      <svg className="faq-bg" viewBox="0 0 80 240" aria-hidden="true">
        <text x="0" y="70">F</text>
        <text x="0" y="155">A</text>
        <text x="0" y="240">Q</text>
      </svg>
      <div className="wrap faq-split">
        <div className="faq-head">
          <p className="eyebrow">Questions, answered</p>
          <h2>What would you like to know?</h2>
          <p className="lead">Clear answers to common questions about CoraCure, our care, and how it all works.</p>
          {/* ponytail: no contact page/email yet; point at the real one when it exists */}
          <a href="#" className="faq-contact">
            <span className="faq-contact-btn"><ArrowRight size={20} aria-hidden="true" /></span>
            <span><strong>Contact our care team</strong><small>We're here to help.</small></span>
          </a>
        </div>
        <div>
          <div className="faq" ref={listRef}>
            {FAQS.map(([q, a], i) => (
              <details key={q} name="faq" open={i === 1}>
                <summary>
                  <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="faq-q">{q}</span>
                  <ChevronDown size={20} aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p className="faq-note"><ShieldCheck size={18} aria-hidden="true" /> Your privacy and care always come first.</p>
        </div>
      </div>
    </section>
  )
}

const CTA_POINTS = [[Stethoscope, 'Verified doctors'], [ShieldCheck, 'Private, never recorded'], [RefreshCw, 'Follow-ups with the same doctor']]

function GetTheApp() {
  return (
    <section className="cta" id="download">
      <Mark className="cta-mark" />
      <div className="wrap">
        <div className="cta-main">
          <h2>Care that listens<br />starts with<br />one conversation</h2>
          <div className="cta-side">
            <p className="cta-lead">Download CoraCure, choose a service and a time, and talk to a verified doctor in your language. Your care plan and follow-ups stay in the app.</p>
            {/* ponytail: store links not published yet; swap spans for <a href> when listings go live */}
            <div className="stores">
              <span className="store">
                <Svg width="26" height="26"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></Svg>
                <span><small>Coming soon on</small><strong>App Store</strong></span>
              </span>
              <span className="store">
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                  <path fill="#00a0ff" d="M3.6 1.8c-.4.3-.6.8-.6 1.4v17.6c0 .6.2 1.1.6 1.4L13.7 12z" />
                  <path fill="#00c853" d="M3.6 1.8 13.7 12l3.4-3.4L5.3 1.8c-.6-.4-1.3-.4-1.7 0z" />
                  <path fill="#ffc400" d="M17.1 8.6 13.7 12l3.4 3.4 4-2.3c1.1-.6 1.1-1.7 0-2.3z" />
                  <path fill="#ff3a44" d="M13.7 12 3.6 22.2c.4.4 1.1.4 1.7 0l11.8-6.8z" />
                </svg>
                <span><small>Coming soon on</small><strong>Google Play</strong></span>
              </span>
            </div>
          </div>
        </div>
        <ul className="cta-points">
          {CTA_POINTS.map(([Icon, t]) => (
            <li key={t}><span className="cta-icon"><Icon size={26} strokeWidth={1.75} aria-hidden="true" /></span>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const YEAR = new Date().getFullYear()

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#top" className="footer-logo"><Mark />CoraCure</a>
            <p className="footer-tagline">Care. Connected.</p>
          </div>
          {FOOTER_LINKS.map(([title, links]) => (
            <nav key={title} className="footer-col" aria-label={title}>
              <h3>{title}</h3>
              <ul>{links.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
            </nav>
          ))}
        </div>

        <div className="footer-bottom">
          <p className="footer-about">
            Compassionate, connected healthcare for every Indian, today and tomorrow.
          </p>
          <ul className="footer-legal">
            <li>© {YEAR} CoraCure. All rights reserved.</li>
            {FOOTER_BOTTOM.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}
            <li>Made in India
              <svg className="flag" viewBox="0 0 30 20" role="img" aria-label="Indian flag">
                <rect width="30" height="20" fill="#fff" />
                <rect width="30" height="6.67" fill="#ff9933" />
                <rect y="13.33" width="30" height="6.67" fill="#138808" />
                <g fill="none" stroke="#000080" strokeWidth="0.35">
                  <circle cx="15" cy="10" r="2.8" />
                  {/* Ashoka Chakra: 24 spokes */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <line key={i} x1="15" y1="7.2" x2="15" y2="12.8" transform={`rotate(${i * 15} 15 10)`} />
                  ))}
                </g>
              </svg>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Why />
        <Services />
        <HowItWorks />
        <CarePlans />
        <ForDoctors />
        <Faq />
        <GetTheApp />
      </main>
      <Footer />
    </>
  )
}
