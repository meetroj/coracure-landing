# finish.md — to-do

Status: [x] done · [~] done differently, reason given · [ ] open

## 0. Tooling
- [x] Headless-Chrome audit (scratchpad, not in repo): per-section screenshots, horizontal-overflow, <13px text, content-spill checks
- [x] Baseline audit: real horizontal scroll at 360 (header) and 768 (search bar); doctors row 3 clipped by the bar; 5 different container widths

## 1. Global system
- [x] One container (`.wrap`): 1240px + gutters 16/20/24 (phones, per mobile.md) → 32 (≥768) → 48 (≥1200); header, every section and footer use it
- [x] Brand tokens: Dark Navy `#07163C`, Pale Mint `#E8F8F2`, Surfie/Paris Green, muted blue-grey `#5C6A85`; amber only on the safety card
- [x] Type scale tokens (`--fs-display / h2 / h2-sm / h3 / lead / eyebrow`); every section maps onto them
- [x] One `.eyebrow` (was 8 different styles)
- [x] Section rhythm `clamp(64px, 8vw, 104px)`; compact hero padding; phones `clamp(56px, 14vw, 80px)` (mobile.md)
- [x] `text-wrap: balance` on h1–h3, `pretty` on paragraphs; forced `<br>`s removed from Why/Care titles; leads ≤ 60ch
- [x] Breakpoints 1439 / 1279 / 1199 / 991 / 767 / 559 / 389 (1439 and 1279 only where a diagram or bento needs the width)
- [x] `minmax(0, …)` / `min-width: 0` on every grid that holds text

## 2. Buttons & interactive
- [x] One system: sm 40 / default 48 / lg 52, radius 10, 8px icon gap, no wrapping (pill + 56px + 46px variants removed)
- [x] Hover, active, focus-visible (teal on light, mint on dark), disabled, `aria-busy` loading
- [x] Touch targets ≥ 44px (menu 44, FAQ rows 56, contact 56, menu rows 48)
- [x] Transitions 220–260ms ease-out; reveal animations shortened; infinite "breathe" animation removed

## 3. Cards & decoration
- [x] Card tokens: border `rgba(14,118,108,.12)`, radius 16, padding `clamp(20px,2vw,28px)`, one soft shadow (timeline, bento, search, mobile service cards)
- [x] Decorations absolute, `pointer-events: none`, clipped by their section; reduced/hidden on small screens (Why words, FAQ letters hidden when stacked)

## 4. Header
- [x] Shared container: logo on the content's left edge, CTA on the right edge
- [x] 76px tall; nav gap 24, no wrapping, fits at 1200
- [x] Menu button (44px) below 1200; dropdown rows align with the logo; menu closes when the window grows past 1199

## 5. Hero
- [x] One centre line; 20px headline→tag, 28px copy→buttons; equal 52px CTAs
- [x] Search bar moved below the image (no overlap); 48px controls; 2×2 grid on tablets, stacked on phones
- [x] Fits a 1440×900 laptop (820px + header)
- [x] Trust badges pinned 20px above the image's bottom edge at every desktop/tablet width

## 6. Why CoraCure
- [x] Staggered columns → predictable grid (3 / 2 / 1 columns), identical icon (52), spacing (12 / 8) and top divider per item
- [x] Head: title left, lead right (stacked under 992)
- [x] Background words behind content, clipped by the section; Verified hidden on phones, all hidden under 390

## 7. Services
- [x] 41/59 columns on the container, copy centred against the diagram
- [x] Hexagon text 14px (was 12.4px at 1280)
- [x] Below 1280: copy first, diagram centred at full size
- [x] Phones: readable cards (other session's work, kept)

## 8. How it works
- [x] Container, token heading/lead, card tokens; fixed min-heights removed

## 9. Care plans
- [x] 38/62 next to the copy at ≥1440 (5-card layout needs ~730px)
- [x] Below 1440: copy first, cards at full width; 2 per row under 992; 1 per row on phones
- [x] Same border/radius/shadow/padding on every card; card text ≥ 13px (14px body)

## 10. For clinicians
- [x] ≥1280: the BG image is scaled so its left edge sits on the container's left edge and its grid's right edge on the container's right edge — section now shares the page grid
- [x] Dark bar continues full width (pseudo-element, colour sampled from the image `#163626`); standard 48px buttons inside it
- [x] Row 3 no longer runs into the bar (checked at 1280/1366/1440/1920)
- [x] Below 1280: stacked on the container; single column + stacked CTAs on phones
- [~] The ≥1280 layout still depends on the image's fixed grid lines, so feature text has ~1 spare line per cell. Much longer copy would need the stacked layout or a new background.

## 11. FAQ
- [x] 38/62 grid, gap 48–96; heading top level with the first row; padding-left hack removed
- [x] Identical 56px+ rows; number, dot, question, chevron on one line; 16px gap before the chevron
- [x] Answers start under the question text; focus ring visible
- [x] "FAQ" letters lighter, hidden once the FAQ stacks (<992)

## 12. Download CTA
- [x] 880px content column; arcs drawn ≥1500px wide so they stay outside it at every width
- [x] Centred logo (finish.md), 2-line heading, equal 56px badges, 14px gap, 32px copy→badges, 44px badges→trust row
- [x] Trust row: 3 equal columns with dividers; stacked on phones

## 13. Footer
- [x] Shared container; brand / 3 equal link columns / helpline card; 12px link spacing; h4 → h3 (heading order)
- [x] Divider before the legal row; text ≥ 13px; helpline card calm, no red
- [x] Regroups at 1199 (brand + card full width), 2 columns on phones, 1 under 390; phone legal row uses spacing instead of `|`

## 13b. One section per screen (follow-up request)
- [x] Spacing, heading sizes, hero image and honeycomb also scale with the screen's height (`svh`)
- [x] Short-screen block (≥992px wide, ≤760px tall): slimmer header, tighter search/bento/timeline
- [x] Why CoraCure items: icon beside the title (half the row height)
- [x] Services, care plans side by side from 1100px; doctors canvas from 1140px, scaled by width or height
- [x] Verified: every section ≤ one screen at 1920×947, 1536×730, 1440×789, 1366×657, 1280×690, 1280×600, 1200×660, 1152×700, 1140×700 (hero ≤ screen minus header)
- [~] Tablets (<1140px) and phones still scroll within long sections: stacked content is taller than any phone screen, and shrinking it to fit would make text unreadable

## 13c. Declutter (follow-up request)
- [x] Why CoraCure: giant PRIVATE / VERIFIED / SUPPORTED background words removed
- [x] Why CoraCure: description sits directly under its title in every cell (rows of mixed heights pushed text down)
- [x] FAQ letters kept, but only in the empty left margin, fading out before the heading; hidden below 1440px where that margin is too narrow
- [x] Flat cards: no drop shadows or hover lift on timeline, care-plan and store cards (border only; search bar keeps a light shadow)
- [x] How it works: background arcs kept in the lower corner, no longer behind the paragraph
- [x] Slightly more space between sections and in the hero text, still one screen per section on laptops

## 14. Final QA
- [x] No horizontal scroll / clipping / spill at 1920, 1440, 1366, 1280, 1200, 1152 (125% zoom), 1024, 960 (150% zoom), 768, 430, 390, 360
- [x] Only text under 13px: 12px eyebrows on phones (mobile.md spec)
- [x] Build + lint pass
- [ ] `public/__qa.html` and `public/__phone.html` were left by the other session's mobile pass — delete before deploying
