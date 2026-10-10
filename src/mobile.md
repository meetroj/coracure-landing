Perform a complete mobile-first responsive optimisation pass on the entire CoraCure website.

The desktop design and existing content are already approved. Do not redesign the website, rewrite content, change the section order, replace assets, or remove functionality. Adapt the existing visual system carefully for mobile devices so the website remains clean, balanced, readable, touch-friendly, and consistent.

The finished mobile website must feel intentionally designed for a phone—not like the desktop layout has simply been reduced in size.

## Target mobile sizes

Optimise and manually test at:

- `360 × 800px`
- `375 × 812px`
- `390 × 844px`
- `393 × 852px`
- `412 × 915px`
- `430 × 932px`

Also verify:

- Portrait orientation
- Landscape orientation
- Browser zoom at 100%, 125%, and 150%
- Android browser interface
- iOS Safari safe areas
- Devices with and without a bottom home indicator

The website must not have horizontal scrolling at any viewport width from `320px` upward.

## Core mobile rules

Across the entire website:

- Use a minimum horizontal page padding of `18px`
- Recommended horizontal padding: `20px`
- Increase to `24px` on screens wider than `410px`
- Keep meaningful content inside the safe content area
- Never allow text, images, buttons, icons, cards, or controls to touch the viewport edge
- Remove fixed desktop widths
- Remove hardcoded section heights
- Avoid absolute positioning for meaningful content
- Convert desktop columns into intentional stacked mobile layouts
- Use natural document flow
- Use consistent vertical rhythm
- Prevent all text clipping and overlap
- Keep every button and interactive element at least `44 × 44px`
- Ensure all cards fit within the viewport
- Do not shrink desktop diagrams until their text becomes unreadable
- Simplify complex desktop compositions where necessary
- Keep decorative backgrounds behind content and outside the safe reading area

## Mobile container

Use one shared mobile container across the complete website:

```css
.mobile-container,
.site-container {
  width: 100%;
  max-width: 100%;
  margin-inline: auto;
  padding-inline: 20px;
  box-sizing: border-box;
}

@media (max-width: 359px) {
  .mobile-container,
  .site-container {
    padding-inline: 16px;
  }
}

@media (min-width: 410px) and (max-width: 767px) {
  .mobile-container,
  .site-container {
    padding-inline: 24px;
  }
}
```

Do not create different left and right content boundaries in different sections. The logo, headings, paragraphs, cards, CTAs, FAQ rows, and footer content should follow the same horizontal grid.

## Global overflow protection

Apply the following carefully:

```css
html,
body {
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

img,
svg,
video,
canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.flex-child,
.grid-child {
  min-width: 0;
}
```

Do not use `overflow-x: hidden` to conceal broken layouts without fixing their cause. Find and correct the element producing the overflow.

Check for:

- Elements wider than `100vw`
- Decorative shapes positioned outside the viewport
- Fixed-width images
- Long unbroken text
- Transformed elements
- Negative margins
- Grid columns with fixed pixel widths
- Absolutely positioned badges
- Buttons with excessive horizontal padding

## Mobile typography

Use responsive typography rather than shrinking all text uniformly.

### Hero heading

```css
font-size: clamp(36px, 10vw, 48px);
line-height: 1.02–1.1;
letter-spacing: -0.03em;
```

### Main section heading

```css
font-size: clamp(30px, 8vw, 40px);
line-height: 1.08–1.16;
letter-spacing: -0.025em;
```

### Secondary section heading

```css
font-size: clamp(26px, 7vw, 34px);
line-height: 1.12–1.2;
```

### Card headings

```css
font-size: 16px–18px;
line-height: 1.3;
font-weight: 600;
```

### Standard body text

```css
font-size: 15px–17px;
line-height: 1.55–1.7;
```

### Supporting text

```css
font-size: 14px–15px;
line-height: 1.5–1.6;
```

### Eyebrow label

```css
font-size: 11px–12px;
line-height: 1.2;
letter-spacing: 0.1em;
```

Typography requirements:

- Never use body text smaller than `14px`
- Never reduce text simply to force it onto one line
- Allow headings to wrap naturally
- Avoid single-word orphan lines in major headings
- Apply `text-wrap: balance` to headings
- Apply `text-wrap: pretty` to paragraphs where supported
- Do not justify text
- Maintain left alignment for most mobile content
- Use centred alignment only for intentionally centred CTA sections
- Keep paragraph line length approximately `30–42 characters`
- Avoid more than four lines for small card descriptions
- Do not use excessive font weights
- Keep sufficient contrast between primary and secondary text

## Mobile spacing system

Use a consistent mobile spacing scale:

- `4px` – very small internal spacing
- `8px` – icon and label gap
- `12px` – tightly related elements
- `16px` – standard element spacing
- `20px` – compact component padding
- `24px` – content-group separation
- `32px` – card or subsection separation
- `48px` – compact section spacing
- `64px–80px` – main section spacing

Recommended:

```css
section {
  padding-block: clamp(56px, 14vw, 80px);
}

.compact-section {
  padding-block: clamp(40px, 10vw, 56px);
}
```

Do not leave large empty mobile spaces caused by desktop section heights.

Do not stack bottom margin from one element with top margin from the next. Prefer parent `gap`.

## Mobile header

Redesign the existing desktop header responsively without changing its content.

Requirements:

- Header height: approximately `64px–72px`
- Use a white or very light background
- Keep the logo on the left
- Keep the menu button on the right
- Logo must remain fully visible and must not be stretched
- Hide desktop navigation links below the tablet breakpoint
- Do not squeeze navigation links into the mobile header
- Menu button touch area: minimum `44 × 44px`
- Menu icon: approximately `22px–24px`
- Respect `env(safe-area-inset-top)` on iOS
- Do not let the header overlap the hero
- If sticky, maintain a stable height and subtle bottom border
- Do not use a large shadow
- Prevent the header from jumping when scrolling

Mobile menu:

- Open as a controlled drawer or full-width dropdown
- Keep sufficient spacing between links
- Minimum row height: `48px`
- Include primary actions clearly
- Do not place small links close together
- Lock background scrolling while the mobile menu is open
- Maintain visible focus states
- Support Escape key and outside-click closing
- Keep the close button accessible

## Mobile hero section

The hero must be completely reorganised for mobile.

Recommended order:

1. Eyebrow or introductory label
2. Main headline
3. Supporting paragraph
4. Primary CTA
5. Secondary CTA
6. Trust indicators
7. Consultation visual
8. Search or booking controls

Requirements:

- Use a single-column layout
- Keep the heading width at `100%`
- Use deliberate line breaks only where necessary
- Maintain `16px–20px` between the heading and supporting paragraph
- Maintain `24px–28px` between the paragraph and CTAs
- CTAs may become full-width
- Use `12px` vertical gap between stacked CTAs
- Button height: `48px–52px`
- Keep text and icons vertically centred
- Do not allow the hero image to exceed the viewport
- Use an appropriate aspect ratio for the consultation image
- Crop using `object-fit: cover` only if important content remains visible
- Prevent badges from floating outside the image
- If trust badges overlap the desktop image, move them into a separate mobile row
- Do not position the search bar over the image on mobile

Search/booking controls:

- Stack all controls vertically
- Each control must be full width
- Minimum control height: `48px`
- Maintain `10px–12px` gaps
- Use visible labels or accessible placeholders
- Ensure dropdown menus remain within the viewport
- Search button should be full width
- Do not truncate selected values
- Keep validation messages below the related field
- Prevent the keyboard from covering the active control

Decorative hero arcs:

- Reduce their scale
- Reduce opacity
- Move them outside the central reading area
- Hide them when they create clutter
- Do not allow them to create horizontal scrolling

## Trust and “Why CoraCure” section

Convert the desktop benefits layout into a clear mobile list.

Recommended structure:

- Section heading
- Supporting paragraph
- Six benefit items in one column

Each item should contain:

- Icon
- Title
- Description
- Optional divider below

Requirements:

- Use a consistent icon container of `40px–44px`
- Keep icon size around `20px–22px`
- Align icon to the top of the text
- Use `12px–14px` gap between icon and content
- Maintain equal padding in every item
- Do not use uneven card heights caused by fixed dimensions
- Keep title and description aligned
- Use consistent dividers
- Maintain `20px–24px` between benefit items

Oversized decorative words such as “PRIVATE”, “SAFE”, “SUPPORTED”, or “VERIFIED” must:

- Stay behind content
- Use very low opacity
- Never cross readable text
- Be cropped deliberately
- Be hidden on screens below `390px` if they create clutter
- Never create horizontal scrolling

## Services section

Do not shrink the full desktop hexagon composition into a tiny mobile diagram.

For mobile:

- Keep the heading and supporting paragraph first
- Convert service hexagons into clean mobile service items
- Use either a one-column list or a two-column layout only if text remains readable
- Prefer one column for screens below `390px`
- Retain icons and service names
- Preserve the highlighted primary service
- Use compact descriptions
- Avoid forcing paragraphs inside small geometric shapes
- Keep consistent internal padding
- Maintain `16px` gaps
- Ensure touch targets are large enough if cards are interactive

If the hexagon shape is retained:

- Use it only as a decorative icon container
- Do not put long text inside it
- Do not allow shape edges to clip content

## Care-plan section

Stack the desktop two-column design.

Mobile order:

1. Eyebrow
2. Heading
3. Supporting paragraph
4. CTA
5. Care-plan interface preview

Requirements:

- Align text to the left
- Keep the CTA full width when appropriate
- Add `32px–40px` between the text block and visual
- Convert complex care-plan card layouts into readable stacked groups
- Do not scale the full desktop interface down as one image if text becomes unreadable
- If using a screenshot, allow zoom or use a simplified mobile-specific visual
- Keep cards inside the viewport
- Remove hardcoded widths and heights
- Keep `12px–16px` gaps between cards
- Avoid excessive shadows
- Ensure progress indicators and status labels remain readable

## Practitioner section

Convert the desktop editorial feature grid into a mobile sequence.

Order:

1. Eyebrow
2. Main headline
3. Supporting paragraph
4. Feature list
5. Bottom CTA

Each feature should contain:

- Number
- Icon
- Title
- Short description

Requirements:

- Use one column
- Align numbers consistently
- Use equal vertical padding
- Keep dividers consistent
- Avoid card boxes around every feature unless needed
- Keep the editorial appearance
- Do not display the large desktop headline beside the features
- Large background typography must become subtle or be hidden
- CTA buttons should stack vertically
- Ensure buttons remain within the viewport
- Keep sufficient space above the footer or next section

## FAQ section

Stack the FAQ introduction above the accordion.

Requirements:

- Keep the introductory heading, supporting copy, and contact CTA together
- Add `32px–40px` between introduction and accordion
- Make FAQ rows full width
- Minimum FAQ row height: `56px`
- Keep question text at least `40px` away from the right chevron
- Allow questions to wrap onto multiple lines
- Align numbers and icons consistently
- Do not vertically centre multi-line questions incorrectly
- Expanded answers must grow naturally
- Do not use fixed heights
- Use approximately `16px–20px` vertical padding
- Keep accordion dividers subtle
- Ensure expanded answers remain readable
- Add clear focus and active states
- Decorative “FAQ” letters must not interfere with the accordion
- Hide or crop decorative text on narrow screens

## Final download CTA

Optimise the light-theme final CTA for mobile.

Recommended order:

1. CoraCure mark
2. Headline
3. Supporting paragraph
4. App Store badge
5. Google Play badge
6. Trust points

Requirements:

- Keep the content centred
- Heading should use approximately `30px–38px`
- Maintain readable line height
- Keep paragraph width within the mobile container
- Stack store badges vertically if they do not fit comfortably side-by-side
- Badges must have equal width and height
- Keep approximately `12px` between badges
- Trust points should stack vertically
- Align icons and labels consistently
- Use `12px–16px` spacing between trust points
- Keep side mint arcs outside the central content area
- Reduce the arcs’ scale and opacity
- Hide one or both decorative arcs on very small screens if required
- Avoid excessive section height
- Do not place the footer immediately against CTA content without spacing

## Mobile footer

Rebuild the footer layout responsively while preserving all content.

Recommended structure:

1. Logo and short brand description
2. Primary navigation group
3. Patient resources
4. Doctor resources
5. Support and contact links
6. Emergency information
7. Legal links
8. Copyright

Requirements:

- Stack footer columns vertically or use accordions
- Keep column headings clear
- Use `16px` between links
- Maintain minimum link height of `40px`
- Do not place multiple small links on the same line
- Keep social icons at least `40px × 40px`
- Use a visible separator before the legal section
- Legal links may wrap naturally
- Keep copyright text readable
- Centre only the final legal line if appropriate
- Ensure emergency information is visible but not visually alarming
- Maintain safe bottom padding

Use:

```css
.footer {
  padding-bottom: calc(32px + env(safe-area-inset-bottom));
}
```

## Buttons

Standardise all mobile buttons:

```css
.button {
  min-height: 48px;
  padding: 12px 20px;
  border-radius: 10px–14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}
```

Requirements:

- Do not allow button labels to wrap
- Use full-width buttons selectively
- Keep primary and secondary actions visually distinct
- Do not place two narrow buttons side-by-side if either label becomes cramped
- Use visible hover, pressed, focus, loading, and disabled states
- Keep adequate space between neighbouring buttons
- Do not use tiny icon-only buttons without accessible labels

## Forms and fields

All mobile form controls must:

- Use a minimum height of `48px`
- Use at least `16px` input font size to prevent iOS auto-zoom
- Use clear labels
- Maintain `8px` between label and field
- Maintain `16px–20px` between field groups
- Show errors directly below the related field
- Keep dropdowns inside the viewport
- Avoid fixed-position dropdown panels
- Scroll focused inputs into view
- Avoid covering submit actions with the keyboard
- Support autofill
- Use correct keyboard types
- Maintain visible focus states

## Images and visual assets

- Use explicit `width` and `height` or `aspect-ratio`
- Avoid layout shift while images load
- Use responsive image sources where possible
- Compress large assets
- Use WebP or AVIF with fallback
- Do not load desktop-scale images unnecessarily on mobile
- Keep focal subjects visible
- Ensure rounded image corners remain consistent
- Do not crop logos
- Do not stretch illustrations
- Keep image alt text meaningful

## Mobile safe areas

Support notched devices and home indicators:

```css
.page {
  padding-top: env(safe-area-inset-top);
}

.footer,
.mobile-fixed-action {
  padding-bottom: env(safe-area-inset-bottom);
}
```

Do not add safe-area padding twice.

If using any fixed element:

- Position it above the home indicator
- Ensure it does not cover page content
- Add corresponding bottom padding to the scrollable content
- Hide or reposition it when the keyboard opens

## Landscape mobile

Test screens with short viewport heights.

In landscape:

- Reduce excessive vertical padding
- Do not vertically centre large sections using `100vh`
- Keep navigation accessible
- Avoid full-screen modals exceeding available height
- Allow modal content to scroll
- Keep close buttons visible
- Do not let CTAs fall below inaccessible areas

## Accessibility

Mobile optimisation must include:

- Minimum touch target: `44 × 44px`
- Visible keyboard focus states
- Logical tab order
- Semantic headings
- Descriptive link labels
- Accessible accordion states using `aria-expanded`
- Accessible mobile menu states
- Sufficient colour contrast
- Support for screen readers
- Support for text scaling
- No information conveyed only by colour
- Respect `prefers-reduced-motion`
- Do not disable pinch-to-zoom
- Do not use `user-scalable=no`

## Performance

Improve mobile loading performance:

- Lazy-load below-the-fold images
- Do not lazy-load the primary hero image
- Preload only essential fonts and hero assets
- Limit font weights
- Use `font-display: swap`
- Avoid large animation libraries for minor effects
- Remove unused CSS and JavaScript
- Avoid render-blocking resources
- Debounce resize and scroll events
- Use passive scroll listeners
- Prevent cumulative layout shift
- Keep decorative assets lightweight

## Mobile QA checklist

After implementation, review the website section by section at every target width.

Confirm:

1. There is no horizontal scrollbar.
2. No text is clipped or hidden.
3. No heading creates an awkward one-word final line.
4. No card crosses the viewport boundary.
5. No button label is truncated.
6. No image is stretched.
7. No logo is cropped.
8. No decorative shape covers readable content.
9. All two-column sections stack correctly.
10. All desktop grids convert into readable mobile structures.
11. All tap targets meet the minimum size.
12. Dropdowns and menus remain inside the viewport.
13. The mobile menu can be opened and closed reliably.
14. Accordions expand without clipping.
15. Forms remain usable when the keyboard is open.
16. Store badges remain aligned.
17. Trust points remain readable.
18. Footer links are easy to tap.
19. Safe-area insets are respected.
20. The complete page maintains consistent spacing and alignment.

Also test:

- Long names
- Longer translated text
- Browser text scaling
- Slow image loading
- Empty states
- Error states
- Disabled buttons
- Open dropdowns
- Expanded FAQs
- Mobile menu open
- Keyboard open
- Landscape orientation

Do not solve mobile responsiveness by reducing everything to very small sizes. Reorganise the content, simplify complex desktop layouts, preserve readable typography, and maintain the premium CoraCure visual identity throughout the entire mobile experience.