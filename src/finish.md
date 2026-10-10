Audit and refine the complete CoraCure landing page shown in the attached screenshots. Fix the visual alignment, spacing, typography, responsiveness, hierarchy, and consistency across every section.

This is a UI-polish and layout-correction task. Do not redesign the website, rewrite the content, replace images, change section order, remove features, or introduce a new visual style. Preserve the existing CoraCure identity and page structure while making the implementation feel clean, balanced, professional, and production-ready.

## Primary objective

Make the complete website feel like one intentionally designed system rather than separately created sections.

Correct all instances of:

- Inconsistent container widths
- Misaligned headings, paragraphs, cards, buttons, and icons
- Excessive or insufficient whitespace
- Uneven section heights
- Text appearing too close to edges
- Text wrapping awkwardly
- Oversized or undersized typography
- Inconsistent line heights
- Unbalanced left and right columns
- Cards with inconsistent padding or dimensions
- Elements overlapping one another
- Content touching decorative background graphics
- Different border radii, shadows, icon sizes, or button heights
- Broken layouts at intermediate screen widths
- Large unused empty areas
- Horizontal overflow
- Content being cut or clipped
- Decorative elements interfering with readability
- Sections failing to align with the header and footer grid

## Preserve the CoraCure visual identity

Use the existing brand system consistently:

- Surfie Green: `#0E766C`
- Paris Green: `#34D499`
- Pale Mint: `#E8F8F2`
- Dark Navy: `#07163C`
- White: `#FFFFFF`
- Warm off-white may be used for subtle section differentiation
- Muted blue-grey for secondary body text
- Amber only for attention or caution
- Red only for genuine safety or emergency information

Do not introduce unrelated colours, harsh shadows, glossy effects, strong gradients, excessive animations, or generic blue healthcare styling.

## Global page grid

Create one shared responsive page container and use it across all sections.

Desktop:

- Maximum content width: `1200px–1280px`
- Recommended max-width: `1240px`
- Horizontal page padding: `48px–64px`
- Centre the container using `margin-inline: auto`
- All major section headings and content columns must align to this grid
- Avoid sections using visibly different left and right starting points

Tablet:

- Horizontal padding: `32px`
- Reduce large two-column gaps
- Allow complex layouts to become balanced stacked layouts where necessary

Mobile:

- Horizontal padding: `20px`
- Minimum safe horizontal padding: `16px`
- Do not allow content, buttons, cards, text, or illustrations to touch the viewport edges
- Remove any fixed widths that cause horizontal scrolling

Recommended container:

```css
.site-container {
  width: min(100% - 40px, 1240px);
  margin-inline: auto;
}

@media (min-width: 768px) {
  .site-container {
    width: min(100% - 64px, 1240px);
  }
}

@media (min-width: 1200px) {
  .site-container {
    width: min(100% - 96px, 1240px);
  }
}
```

## Spacing system

Replace arbitrary margins and padding with a consistent spacing scale:

- `4px` – micro spacing
- `8px` – icon-to-label or closely related elements
- `12px` – compact internal spacing
- `16px` – standard element spacing
- `24px` – spacing between related content groups
- `32px` – card or column spacing
- `48px` – subsection separation
- `64px` – standard section spacing
- `80px–96px` – large desktop section padding

Recommended section spacing:

```css
section {
  padding-block: clamp(64px, 8vw, 104px);
}
```

Compact sections such as trust strips, download CTAs, and transition bands can use:

```css
.compact-section {
  padding-block: clamp(40px, 5vw, 64px);
}
```

Do not apply the same large vertical padding to every section. Section spacing should reflect the amount and type of content.

Avoid:

- Large blank areas above headings
- Unequal top and bottom padding
- Content floating in the middle of oversized sections
- Sections ending immediately after a card without breathing space
- Multiple margins stacking and creating unintended gaps

Use `gap` on flex and grid parents instead of adding separate margins to every child.

## Typography system

Use a consistent type scale across the full page. Do not assign unrelated font sizes in individual sections.

### Display heading

Use for the hero only:

```css
font-size: clamp(42px, 5.2vw, 72px);
line-height: 0.98–1.06;
letter-spacing: -0.035em;
font-weight: 600–700;
```

### Main section heading

```css
font-size: clamp(34px, 4vw, 56px);
line-height: 1.05–1.12;
letter-spacing: -0.025em;
```

### Smaller section heading

```css
font-size: clamp(28px, 3vw, 42px);
line-height: 1.1–1.18;
letter-spacing: -0.02em;
```

### Card heading

```css
font-size: 16px–20px;
line-height: 1.25;
font-weight: 600;
```

### Body text

```css
font-size: 16px–18px;
line-height: 1.55–1.7;
```

### Compact supporting text

```css
font-size: 14px–15px;
line-height: 1.5–1.6;
```

### Eyebrow labels

```css
font-size: 11px–13px;
line-height: 1.2;
letter-spacing: 0.12em;
font-weight: 600;
text-transform: uppercase;
```

Do not:

- Use excessively small text on desktop
- Stretch paragraphs across the full page width
- Use tight line heights for multi-line body text
- Allow headings to wrap into visually awkward one-word lines
- Use bold styling on too many elements
- Mix serif and sans-serif without purpose

Keep normal body paragraphs within approximately `55–70ch`. Large headings should generally remain within `12–18ch`.

Use `text-wrap: balance` for major headings and `text-wrap: pretty` for body copy where supported.

## Header and navigation

Correct the header so it feels compact, aligned, and stable.

- Use the same main container width as the page sections
- Align the logo with the left edge of the hero content
- Align the main CTA with the right content boundary
- Keep navigation links vertically centred
- Use a consistent gap of approximately `24px–32px`
- Header height should be approximately `72px–80px`
- Do not let the header appear disconnected from the hero
- Ensure the logo has sufficient clear space
- Use one consistent button height
- Prevent navigation links from wrapping
- At tablet and mobile widths, replace the desktop navigation with a properly aligned menu button
- Do not shrink navigation text until it becomes unreadable

## Hero section

The hero currently contains the heading, supporting text, primary actions, consultation image, trust indicators, and search interface. Refine it as one coordinated composition.

- Align the headline, supporting text, and action buttons to a clear vertical centre line
- Keep the headline width controlled so its line breaks feel deliberate
- Maintain approximately `16px–24px` between the headline and supporting copy
- Maintain approximately `24px–32px` between the supporting copy and buttons
- Both hero buttons must use equal height and compatible padding
- Keep the consultation image centred inside the shared container
- Ensure the image width does not exceed the text or page grid unnecessarily
- Maintain sufficient space between the buttons and image
- Keep trust badges positioned consistently rather than floating unpredictably
- Search controls must have equal height and aligned baselines
- Search fields must not overlap the consultation image
- Do not let pale decorative side curves cover the headline, image, search bar, or buttons
- Maintain a clear minimum distance between decorative arcs and meaningful content
- The hero should fit comfortably on common laptop screens without feeling compressed or excessively tall

On smaller screens:

- Stack heading, body, CTAs, image, and search controls
- Make primary buttons full-width only when required
- Stack search fields cleanly instead of shrinking them
- Do not place floating labels over the image if they become unreadable
- Decorative background shapes should reduce in scale and opacity

## “Why CoraCure” section

Maintain the typography-led editorial appearance but correct its spacing and alignment.

- Keep one consistent baseline across all six benefits
- Use a predictable two-column or three-column responsive grid
- Every benefit item should use the same icon size, title spacing, body width, and divider treatment
- Align all icons to the same top position
- Keep approximately `10px–12px` between icon and title
- Keep approximately `8px–10px` between title and supporting text
- Divider rules must align and use the same width and colour
- Background words such as “PRIVATE”, “VERIFIED”, or “SUPPORTED” must remain decorative
- Set decorative text to `pointer-events: none`
- Keep decorative text behind content with controlled opacity
- Do not allow decorative words to reduce the contrast of foreground text
- Decorative words must be clipped intentionally by the section, not by the browser viewport
- Do not let the background typography create horizontal overflow

Mobile:

- Stack benefits in a single column
- Hide or significantly reduce oversized background words if they interfere with reading
- Maintain uniform vertical gaps between items

## Services section

The services section uses a central hexagon and supporting service hexagons.

- Keep the content column and visual diagram balanced at approximately `42/58` or `45/55`
- Vertically align the text block with the centre of the diagram
- Do not allow the diagram to become much taller than the text without visual reason
- Use mathematically consistent hexagon dimensions
- Keep equal spacing between neighbouring hexagons
- Align icons, titles, and descriptions consistently inside each shape
- Ensure text has adequate internal padding
- Do not let text touch or cross the hexagon edges
- Use a consistent title size and line height across every service
- Keep the central highlighted service visually dominant without making the surrounding services unreadable
- Decorative mint shapes must remain behind the section and must not collide with the diagram

Responsive behaviour:

- On tablet, reduce the overall diagram scale
- On mobile, do not preserve the desktop honeycomb if it makes content too small
- Convert the hexagons into a clean vertical list or two-column grid
- Retain the icon and service hierarchy without forcing unreadable text into small shapes

## Care-plan section

The left text and right care-plan cards must feel like one balanced split layout.

- Use a grid such as `42% 58%`
- Set a clear column gap between `48px–72px`
- Vertically centre the left text relative to the right visual
- Keep the eyebrow, heading, paragraph, and CTA aligned
- Limit the heading width so it does not form awkward line breaks
- Maintain consistent internal padding inside every care-plan card
- Use the same border, radius, shadow, and background treatment on all cards
- Keep icons and labels aligned
- Avoid making the right-side card composition look crowded
- Maintain at least `16px` between neighbouring cards
- Do not use heavy shadows
- Ensure small card text remains readable

On mobile:

- Place the text block first
- Place the care-plan visual below it
- Stack or simplify card groups
- Avoid shrinking the entire desktop layout into an unreadable miniature

## Doctor/practitioner section

The practitioner section uses large editorial typography with a structured feature index.

- Align the large headline and the numbered feature grid to the same section boundaries
- Keep the large heading from becoming too wide or touching the feature area
- Use deliberate, balanced line breaks
- Keep each numbered feature aligned to a consistent internal grid
- Number, icon, title, and description must occupy predictable positions
- All feature rows must have equal padding
- Thin divider lines should align perfectly
- Avoid unnecessary card borders around every feature
- Preserve the editorial appearance while improving scanability
- The bottom CTA strip must align with the content above it
- CTA buttons must not touch the section boundary
- Do not allow the browser viewport or scrollbar to clip the CTA

On mobile:

- Heading first
- Features in a single column
- CTA strip below the features
- Buttons stacked or allowed to wrap cleanly
- Background typography should reduce or disappear

## FAQ section

The FAQ section currently uses a left introduction and right accordion.

- Use a balanced two-column grid
- Recommended desktop ratio: `38% 62%`
- Maintain a gap of `64px–96px`
- Align the top of the left heading with the first FAQ row
- Keep the contact CTA near the introduction rather than floating too far away
- All FAQ rows must have identical vertical padding
- Number, indicator, question, and chevron must align on one baseline
- Keep question text away from the chevron
- Expanded answers need comfortable top spacing
- Accordion height should grow naturally; do not use hardcoded heights
- Use subtle dividers and avoid heavy card styling
- Keyboard focus states must remain visible
- The decorative “FAQ” typography must stay behind content and must not create horizontal scrolling

On mobile:

- Introduction above the accordion
- Full-width questions
- Keep `44px` minimum touch targets
- Allow questions to wrap naturally
- Keep chevrons anchored to the right

## Final app-download CTA

Use the selected light-theme CTA with side mint arcs.

- Keep the central content inside a safe area of approximately `760px–900px`
- The side arcs must remain decorative and symmetrical
- Side arcs must never intersect the text or store badges
- Use a centred logo, heading, paragraph, store badges, and trust row
- Keep the heading to two balanced lines on desktop where possible
- Paragraph width should remain approximately `650px–760px`
- App Store and Google Play badges must have equal height and aligned edges
- Maintain `12px–16px` between the badges
- Maintain approximately `32px` between the copy and badges
- Maintain approximately `36px–48px` between badges and trust indicators
- Trust indicators should use equal-width columns
- Keep icons, labels, and dividers aligned
- Section padding must be sufficient without making the section feel empty
- Avoid placing a dark bar directly against the section unless it is part of the footer transition

Mobile:

- Stack badges if necessary
- Stack trust indicators vertically
- Reduce or crop decorative arcs outside the content area
- Keep the heading readable without shrinking it excessively

## Footer

Create a structured, readable footer that visually completes the page.

- Use the same container as the rest of the website
- Keep the logo and brand description in a dedicated column
- Organise navigation links into clearly labelled groups
- Keep consistent column widths
- Align headings and links to a shared baseline
- Use `12px–16px` vertical spacing between links
- Keep legal links and copyright information in a separate bottom row
- Provide sufficient padding above and below
- Add a subtle divider between the primary footer and the legal row
- Ensure emergency or crisis-support information is visually identifiable but not alarming
- Do not overcrowd the footer with too many links in one column
- Do not centre all footer text on desktop
- Stack columns logically on mobile
- Avoid very small text; keep legal text at least `12px–13px`

## Buttons and interactive elements

Standardise all buttons:

- Small height: `40px`
- Default height: `44px–48px`
- Large CTA height: `48px–52px`
- Consistent horizontal padding: `20px–28px`
- Consistent border radius
- Primary button: Surfie Green background with white text
- Secondary button: white or transparent background with Surfie Green border and text
- Avoid multiple unrelated button styles
- Keep icon-to-label gap between `8px–10px`
- Add visible hover, active, focus-visible, loading, and disabled states
- Touch targets must be at least `44px × 44px`
- Button text must remain vertically and horizontally centred
- Do not let button text wrap

## Cards and component consistency

Standardise:

- Border colour
- Border width
- Radius
- Internal padding
- Icon container size
- Shadow intensity
- Heading spacing
- Body spacing

Suggested card system:

```css
.card {
  border: 1px solid rgba(14, 118, 108, 0.12);
  border-radius: 16px;
  background: #ffffff;
  padding: clamp(20px, 2vw, 28px);
  box-shadow: 0 8px 28px rgba(7, 22, 60, 0.05);
}
```

Do not add shadows to every object. Flat editorial sections should remain flat.

## Decorative backgrounds

All decorative graphics must follow these rules:

- Use absolute positioning inside a `position: relative` section
- Set `overflow: hidden` on the section rather than the entire page
- Keep decoration behind content using controlled `z-index`
- Use `pointer-events: none`
- Do not allow shapes to affect document flow
- Do not use fixed pixel positions that only work at one viewport size
- Scale decoration responsively using `clamp()`, percentages, or viewport-relative sizing
- Reduce decorative opacity on smaller screens
- Hide non-essential decorations when they create clutter

## Responsive breakpoints

Test at minimum:

- `1440px`
- `1280px`
- `1024px`
- `768px`
- `430px`
- `390px`
- `360px`

Suggested breakpoints:

```css
@media (max-width: 1199px) {}
@media (max-width: 991px) {}
@media (max-width: 767px) {}
@media (max-width: 479px) {}
```

Do not optimise only for desktop and mobile. The page must remain stable at all intermediate widths.

At each breakpoint, verify:

- No horizontal scrolling
- No clipped headings
- No overlapping sections
- No cards outside the viewport
- No text hidden behind decoration
- No excessively long lines
- No tiny diagram text
- No broken navigation
- No uneven grid columns
- No fixed heights causing content clipping
- No buttons overlapping nearby elements
- No large unexplained empty spaces

## Implementation rules

- Prefer CSS Grid for major page layouts
- Prefer Flexbox for local component alignment
- Use `gap` instead of child margins where possible
- Replace unnecessary absolute positioning with normal layout flow
- Avoid hardcoded section heights
- Use `min-height` only where genuinely required
- Use `clamp()` for responsive font sizes and spacing
- Use `aspect-ratio` for visual assets
- Use `object-fit: cover` for photography
- Use `object-fit: contain` for logos, UI previews, and diagrams
- Set `min-width: 0` on grid and flex children to prevent text overflow
- Add `overflow-wrap: anywhere` only where unavoidable
- Prevent layout shift by defining image dimensions or aspect ratios
- Use semantic heading order: one `h1`, followed by `h2` and `h3`
- Preserve visible keyboard focus states
- Respect `prefers-reduced-motion`

## Motion and transitions

Keep motion restrained:

- Transition duration: `180ms–260ms`
- Use ease-out for hover and reveal interactions
- Do not animate layout dimensions unnecessarily
- Avoid bouncing, parallax overload, or constant floating animation
- Background decorations may move very subtly only if performance remains smooth
- Disable non-essential motion when reduced-motion is requested

## Final quality-control pass

After making the layout changes, inspect every section from top to bottom and correct all remaining inconsistencies.

Verify that:

1. Every section aligns to the same page grid.
2. Headings follow one consistent scale.
3. Paragraph widths remain readable.
4. Buttons use the same height and radius.
5. Cards share the same spacing logic.
6. Icons use consistent dimensions and stroke weight.
7. Decorative graphics remain behind the content.
8. Section spacing feels deliberate.
9. Mobile layouts are intentionally reorganised rather than merely compressed.
10. No text, card, button, icon, image, or decorative element overlaps another.
11. Nothing is clipped by the viewport or section boundaries.
12. No horizontal scrollbar appears at any tested width.
13. Content remains readable at browser zoom levels of 100%, 125%, and 150%.
14. The page works with long text and does not rely on perfect copy length.
15. Header, hero, sections, CTA, and footer feel like one unified CoraCure website.

Do not stop after changing a few margins. Perform a full-page visual consistency pass and resolve the root layout problems across all components and breakpoints.