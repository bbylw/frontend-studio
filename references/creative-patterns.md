# Creative Patterns

Detailed descriptions of design patterns for distinctive UI. Choose patterns that reinforce the aesthetic direction — not every pattern fits every project.

---

## Navigation

### Dock Magnification
macOS-style dock where items scale up on hover with spring physics. Items near the cursor also partially enlarge, creating a smooth wave effect.
- **Best for**: Minimalist interfaces, app launchers, tool palettes
- **Key detail**: Use mouse position relative to each item (not just hover state) for the smooth wave

### Magnetic Button
Buttons that subtly attract toward the cursor when nearby, creating a tactile, physical feel.
- **Best for**: Primary CTAs, prominent action buttons
- **Key detail**: Use `useMotionValue` / `useSpring` — never `useState` for this (causes re-renders)

### Gooey Menu
Navigation items connected by organic, blob-like shapes using SVG filters (`feGaussianBlur` + `feColorMatrix`).
- **Best for**: Playful brands, creative portfolios
- **Key detail**: The gooey effect comes from `filter: url(#goo)` on a parent SVG

### Dynamic Island
An expanding/collapsing notification or status area, inspired by Apple's Dynamic Island.
- **Best for**: Status indicators, notifications, media controls
- **Key detail**: Animate with `layout` prop for smooth size transitions

### Radial Menu
Circular menu that opens from a trigger point, items spread radially with staggered spring animation.
- **Best for**: Canvas/tool applications, context menus, mobile

---

## Layout

### Bento Grid
Asymmetric grid of varying card sizes creating visual hierarchy through size contrast.
- **Best for**: Dashboards, feature showcases, content hubs
- **Key detail**: Mix 2x2, 1x1, 2x1 cells. Use `grid-column: span 2` and `grid-row: span 2`

### Masonry
Pinterest-style columns of varying height items, filling gaps naturally.
- **Best for**: Image galleries, content feeds, portfolios
- **Key detail**: Use CSS `columns` property for simple cases; JS-based for precise control

### Split-Screen Scroll
Two or more vertical panels that scroll independently or at different speeds.
- **Best for**: Storytelling, comparisons, before/after reveals
- **Key detail**: GSAP `scrub` for scroll-linked speed differential

### Curtain Reveal
Content hidden behind panels that slide apart on scroll or interaction.
- **Best for**: Dramatic reveals, transition between sections
- **Key detail**: Use `clip-path: inset()` for clean edge control

### Chroma Grid
Grid items that shift hue or color based on scroll position or index.
- **Best for**: Creative portfolios, artistic showcases
- **Key detail**: CSS `filter: hue-rotate(calc(var(--index) * 30deg))` or scroll-linked JS

---

## Cards

### Parallax Tilt
Cards that respond to mouse movement with 3D perspective rotation.
- **Best for**: Product cards, portfolio items, feature highlights
- **Key detail**: Track mouse position relative to card center, map to `rotateX`/`rotateY` with ±8deg

### Spotlight Border
A gradient border that follows the cursor around the card edge.
- **Best for**: Premium cards, pricing tables, selection UI
- **Key detail**: Use a pseudo-element with radial gradient positioned at mouse coords

### Glassmorphism
Frosted glass effect with background blur, semi-transparent background, and subtle border.
- **Best for**: Overlaid panels, modals, floating UI, dark-mode interfaces
- **Key detail**: `backdrop-blur-xl bg-white/10 border border-white/20`

### Morphing Modal
Card that smoothly expands into a full modal using shared layout animation.
- **Best for**: Detail views, gallery lightboxes, content expansion
- **Key detail**: Framer Motion `layoutId` on both card and modal

---

## Scroll

### Sticky Stack
Elements pin to viewport and accumulate, each new item stacking on top of the previous.
- **Best for**: Step-by-step guides, feature reveals, timeline
- **Key detail**: Each item `position: sticky; top: calc(var(--index) * 2rem)` with decreasing scale

### Horizontal Hijack
Vertical scroll temporarily converts to horizontal panning within a pinned section.
- **Best for**: Image galleries, process flows, team showcases
- **Key detail**: GSAP ScrollTrigger with `pin: true` and `scrub`

### Zoom Parallax
Background content scales or translates at a different rate than foreground on scroll.
- **Best for**: Hero sections, immersive storytelling
- **Key detail**: Scale from 1.0 to 1.5 over the section's scroll duration

### Progress Path
An SVG path that draws itself in sync with scroll progress, revealing content along the way.
- **Best for**: Onboarding flows, data visualization narratives
- **Key detail**: `stroke-dashoffset` animated via CSS `animation-timeline: scroll()` or JS

---

## Gallery

### Coverflow
Items fanned out in a 3D perspective, center item facing forward, sides angled away.
- **Best for**: Carousels, product browsers, album art
- **Key detail**: `transform: rotateY(angle) translateZ(depth)` based on distance from center

### Drag-to-Pan
Content that can be grabbed and dragged to pan around a larger canvas.
- **Best for**: Maps, large images, interactive diagrams
- **Key detail**: Track `pointerdown` / `pointermove` / `pointerup` with velocity for inertia

### Accordion Slider
Items that expand horizontally on click, pushing siblings to compress.
- **Best for**: Testimonials, FAQ with media, feature details
- **Key detail**: Use CSS flex with `flex: 0 0 auto` → `flex: 3` on active, spring transition

### Glitch Effect
Visual glitch/distortion on hover or cycle — split channels, offset copies, scan lines.
- **Best for**: Gaming, tech brands, edgy portfolios
- **Key detail**: CSS `clip-path` with animated inset rectangles + color channel offset

---

## Text

### Kinetic Marquee
Continuous scrolling text, often in multiple rows at different speeds or directions.
- **Best for**: Statements, testimonials, brand values, dividers
- **Key detail**: CSS `@keyframes scroll { to { translateX(-50%) } }` on duplicated content

### Text Mask Reveal
Large text that acts as a window, revealing an image or video behind it through `background-clip: text`.
- **Best for**: Hero sections, dramatic transitions
- **Key detail**: `background-clip: text; color: transparent; -webkit-background-clip: text`

### Scramble Effect
Text characters cycle through random glyphs before resolving to final text.
- **Best for**: Loading states, headers, interactive reveals
- **Key detail**: Replace characters iteratively with random pool, left to right

### Gradient Stroke
Text with animated gradient fill or stroke, shifting colors over time.
- **Best for**: Headlines, logos, artistic typography
- **Key detail**: `background: linear-gradient(...)` with animated `background-position` + `background-clip: text`

---

## Micro

### Particle System
Decorative floating particles or dots that respond to scroll or mouse movement.
- **Best for**: Hero backgrounds, atmospheric depth
- **Key detail**: Canvas-based for performance. Cap at 800 desktop / 100 mobile.

### Skeleton Shimmer
Loading placeholder with a shimmering highlight sweep.
- **Best for**: All loading states
- **Key detail**: `background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)` with animated position

### Directional Hover
Highlight or shadow that follows the cursor direction (top/bottom/left/right) when entering an element.
- **Best for**: Cards, buttons, list items
- **Key detail**: Track `mouseenter` position relative to element center to determine direction

### Ripple Click
Material-design-inspired ripple expanding from click point.
- **Best for**: Buttons, interactive surfaces
- **Key detail**: Absolutely positioned circle expanding from click coordinates with fade-out

### SVG Draw
SVG path that draws itself stroke-by-stroke, triggered by scroll or intersection.
- **Best for**: Illustrations, icons, decorative borders, progress indicators
- **Key detail**: `stroke-dasharray` = path length, animate `stroke-dashoffset` from full to 0
