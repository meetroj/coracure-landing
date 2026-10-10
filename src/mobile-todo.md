# Mobile optimisation — todo

Source: `src/mobile.md`. Phone rules live in the "Phones (<= 767px)" block at the end of `src/index.css`
(plus the small blocks after it and a `pointer: coarse` block for touch screens of any width).

**Baseline audit (before):** header overflowed by up to 49px at ≤360px (real horizontal scroll), ~25 tap targets under 44px, ~30 text elements under 14px.
**Final audit (after), 320 / 360 / 375 / 390 / 393 / 412 / 430px:** 0 overflow, 0 tap targets under 40px, 0 body text under 14px (only 12px eyebrow labels, which the spec allows). Landscape 844 / 932px: 0 overflow.

## Global
- [x] Shared gutter: 16px under 360px, 20px, 24px from 410px; every section uses it (incl. safe-area insets)
- [x] Overflow guard (`overflow-x: clip`) added *after* fixing the real cause (header actions)
- [x] `viewport-fit=cover` + safe areas: header top, footer bottom, sides
- [x] Mobile type scale: hero `clamp(36px,10vw,48px)`, sections `clamp(30px,8vw,40px)`, body 15–16px, supporting ≥ 14px
- [x] `text-wrap: balance` on headings, `pretty` on paragraphs; desktop `nowrap` removed on phones
- [x] Buttons 48–52px tall, labels don't wrap
- [x] Section rhythm `clamp(56px,14vw,80px)`; desktop min-heights removed on phones

## Header + menu
- [x] 64px bar, logo left, 44×44 menu button right; "Book Consultation" + "Sign In" moved into the menu on phones
- [x] Menu: full-width dropdown, 48px rows, primary actions, scrolls when the screen is short
- [x] Page scroll locked while open; closes on Escape, outside tap, link tap and resize past the breakpoint

## Sections
- [x] Hero: left-aligned, stacked full-width CTAs, trust chips above the image, 3:2 image with width/height, 48px search fields with 16px text, full-width Search
- [x] Why CoraCure: one list, 44px icon left, dividers; "VERIFIED" hidden, other words faint, all hidden < 390px
- [x] Services: hexagons → readable cards (hexagon kept as icon container), featured card stays green, 2 per row from 560px
- [x] How it works: 44px numbers, stacked cards, 15px text
- [x] Care plans: full-width CTA, card text 14px, 7-day row readable, badge no longer squeezes the title
- [x] For clinicians: one column (number / icon / title / text), stacked CTAs, no negative margins
- [x] FAQ: rows ≥ 56px, question 40px clear of the chevron, multi-line questions top-aligned, "FAQ" letters hidden
- [x] Download CTA: centred, 30–38px heading, equal-width stacked badges, ticks aligned
- [x] Footer: 40px link rows, legal links wrap without separators, safe-area bottom padding, 1 column under 390px

## Forms / images / a11y
- [x] Search inputs: `enterkeyhint`, `autocomplete`, 16px font, whole field tappable; decorative chevrons hidden on text inputs
- [x] Hero image `width`/`height` + `fetchpriority="high"`
- [x] Reduced motion respected; menu has `aria-expanded` + "Open/Close menu" label; FAQ uses native `<details>`

## Not done / needs a real device
- [ ] Convert the large PNGs (hero card 2 MB, backgrounds ~1 MB each) to WebP/AVIF — needs an image tool; biggest mobile speed win left
- [ ] Test on real iOS Safari / Android Chrome (notch, home indicator, keyboard covering fields) — only emulated in headless Chrome here
- [ ] Browser zoom 125% / 150% and OS text scaling — not tested
