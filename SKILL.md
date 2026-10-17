---
name: frontend-studio
description: |
  Build distinctive, production-grade frontend interfaces with exceptional design quality.
  Combines bold aesthetic vision with engineering rigor: creative typography, cohesive color
  systems, intentional spatial composition, and polished motion design. Use when building
  websites, landing pages, dashboards, React/Vue/Svelte components, HTML/CSS layouts,
  or any web UI that needs to look and feel premium. Covers design thinking, motion
  systems, copywriting frameworks, generative art, performance optimization, and
  quality assurance.
---

# Frontend Studio

Build distinctive, production-grade interfaces that avoid generic "AI slop" aesthetics. Balance bold creative vision with engineering precision.

## Design Thinking

Before coding, establish a clear aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Choose a direction — brutalist, editorial, retro-futuristic, organic, luxury, playful, minimalist, art deco, industrial, etc. Commit fully to one.
- **Constraints**: Framework, performance, accessibility requirements.
- **Differentiation**: What makes this unforgettable? What is the one thing someone will remember?

**CRITICAL**: Intentionality matters more than intensity. Bold maximalism and refined minimalism both succeed when executed with precision.

## Design Dials

Set these based on the project's character. Adapt dynamically.

| Dial             | Default | Range                          |
| ---------------- | ------- | ------------------------------ |
| DESIGN_VARIANCE  | 6       | 1 = Symmetric, 10 = Asymmetric |
| MOTION_INTENSITY | 5       | 1 = Static, 10 = Cinematic     |
| VISUAL_DENSITY   | 4       | 1 = Airy, 10 = Packed          |

## Design Rules

### Typography

- Choose distinctive fonts. Avoid Inter, Roboto, Arial, system-ui. Use unexpected, characterful pairings: a bold display font + a refined body font.
- Headlines: large, tight tracking (`tracking-tighter`). Body: `leading-relaxed`, `max-w-[65ch]`.
- Never use serif fonts on dashboards or data-heavy UI.

### Color & Theme

- Commit to a cohesive palette with CSS variables. Dominant color + 1 sharp accent.
- Keep accent saturation under 80%. One palette per project — never mix moods.
- Never use AI purple/blue gradients on white backgrounds. Never use pure black (#000).

### Spatial Composition

- Asymmetry over symmetry (when VARIANCE > 4). Never use centered heroes when variance is high.
- Overlap, diagonal flow, grid-breaking elements. Generous negative space OR controlled density.
- Use `max-w-[1400px] mx-auto` or `max-w-7xl`. Use CSS Grid, not flex percentage math.
- Never use 3-column equal card rows. When DENSITY > 7, use `border-t`, `divide-y`, or spacing instead of cards.

### Backgrounds & Visual Details

- Create atmosphere: gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays.
- Never default to flat solid backgrounds.

### States & Forms

- Always implement: Loading (skeleton), Empty, Error, tactile feedback (`scale-[0.98]`).
- Forms: label above input, error below, `gap-2` for input blocks.

### Bento Paradigm

When using bento-grid layouts for dashboards or content hubs:

- **Palette**: Background `#f9fafb`, cards pure white with `border-slate-200/50`
- **Surfaces**: `rounded-[2.5rem]`, diffusion shadow
- **Typography**: Geist/Satoshi, `tracking-tight` headers
- **Labels**: Outside and below cards, not inside
- **Animation**: Spring physics (`stiffness: 100, damping: 20`), infinite loops in `React.memo` isolation

**Card archetypes** (mix and match within a bento grid):

1. **Intelligent List** — auto-sorting items with `layoutId` transitions
2. **Command Input** — typewriter effect with blinking cursor
3. **Live Status** — breathing/blinking indicators for real-time data
4. **Wide Data Stream** — infinite horizontal carousel or ticker
5. **Contextual UI** — staggered highlight with float-in toolbar

## Brand Override

When a brand style is specified, apply these defaults (override with brand guidelines when provided):

- Dark: `#141413`, Light: `#faf9f5`, Mid: `#b0aea5`, Subtle: `#e8e6dc`
- Accents: Orange `#d97757`, Blue `#6a9bcc`, Green `#788c5d`
- Fonts: Poppins (headings), Lora (body)

## Anti-Slop Techniques

- **Liquid Glass**: `backdrop-blur` + `border-white/10` + `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`
- **Magnetic Buttons**: Use `useMotionValue`/`useTransform` — never `useState` for continuous animations
- **Perpetual Motion**: When INTENSITY > 5, add infinite micro-animations (pulse, float, shimmer)
- **Layout Transitions**: Framer `layout` and `layoutId` props for smooth morphs
- **Stagger**: `staggerChildren` or CSS `animation-delay: calc(var(--index) * 100ms)`

## Forbidden Patterns

| Category   | Banned                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Visual     | Neon glows, pure black (#000), oversaturated accents, gradient text on headers, custom cursors |
| Typography | Inter font, oversized H1s without intent, serif on dashboards                                  |
| Layout     | 3-column equal card rows, floating elements with awkward gaps                                  |
| General    | Emojis in UI, default shadcn/ui without customization, placeholder images                      |

## Creative Patterns

Choose patterns that match the aesthetic direction. See `references/creative-patterns.md` for detailed descriptions.

| Category   | Patterns                                                                     |
| ---------- | ---------------------------------------------------------------------------- |
| Navigation | Dock magnification, Magnetic button, Gooey menu, Dynamic island, Radial menu |
| Layout     | Bento grid, Masonry, Split-screen scroll, Curtain reveal, Chroma grid        |
| Cards      | Parallax tilt, Spotlight border, Glassmorphism, Morphing modal               |
| Scroll     | Sticky stack, Horizontal hijack, Zoom parallax, Progress path                |
| Gallery    | Coverflow, Drag-to-pan, Accordion slider, Glitch effect                      |
| Text       | Kinetic marquee, Text mask reveal, Scramble effect, Gradient stroke          |
| Micro      | Particle system, Skeleton shimmer, Directional hover, Ripple click, SVG draw |

## Motion System

### Tool Selection

| Need                             | Tool                                 |
| -------------------------------- | ------------------------------------ |
| UI enter/exit/layout             | Framer Motion / CSS transitions      |
| Scroll storytelling (pin, scrub) | GSAP + ScrollTrigger                 |
| 3D / WebGL                       | Three.js / R3F — isolated `<Canvas>` |
| Hover/focus states               | CSS only — zero JS cost              |
| Native scroll-driven             | CSS `animation-timeline: scroll()`   |

**Conflict rules**: Never mix GSAP + Framer Motion in same component. R3F must live in isolated Canvas wrapper. Lazy-load heavy libraries.

### Intensity Scale

| Level          | Techniques                                               |
| -------------- | -------------------------------------------------------- |
| 1-2 Subtle     | CSS transitions, 150-300ms                               |
| 3-4 Smooth     | CSS keyframes + stagger, <=3 items                       |
| 5-6 Fluid      | `whileInView`, magnetic hover, parallax tilt             |
| 7-8 Cinematic  | GSAP ScrollTrigger, pinned sections, horizontal hijack   |
| 9-10 Immersive | Full scroll sequences, Three.js particles, WebGL shaders |

**Focus**: One well-orchestrated page load with staggered reveals creates more impact than scattered micro-interactions.

### Performance Rules

**Animate ONLY GPU properties**: `transform`, `opacity`, `filter`, `clip-path`. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`. Use `transform: scale()` or `clip-path` instead.

**Isolation**:

- Perpetual animations in `React.memo` leaf components
- `will-change: transform` only during animation
- `contain: layout style paint` on heavy containers

**Mobile**:

- Respect `prefers-reduced-motion`
- Disable parallax/3D on `pointer: coarse`
- Cap particles: desktop 800, tablet 300, mobile 100
- Disable GSAP pin on mobile < 768px

### Springs & Easings

| Feel   | Config                        |
| ------ | ----------------------------- |
| Snappy | `stiffness: 300, damping: 30` |
| Smooth | `stiffness: 150, damping: 20` |
| Bouncy | `stiffness: 100, damping: 10` |

| CSS Easing   | Value                               |
| ------------ | ----------------------------------- |
| Smooth decel | `cubic-bezier(0.16, 1, 0.3, 1)`     |
| Smooth accel | `cubic-bezier(0.7, 0, 0.84, 0)`     |
| Elastic      | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

See `references/motion-recipes.md` for production-ready animation code.

## Accessibility

- Always wrap motion in `prefers-reduced-motion` check
- Never flash content > 3 times/second (seizure risk)
- Provide visible focus rings (`outline`, not `box-shadow`)
- Add `aria-live="polite"` for dynamically revealed content
- Include pause button for auto-playing animations

## Copywriting

For pages that need persuasive text (landing pages, marketing, product pages). See `references/copywriting.md` for full frameworks and examples.

**Core job**: Grab attention → Create desire → Remove friction → Prompt action.

**Framework selection**:

- **AIDA** (Attention → Interest → Desire → Action) — landing pages, emails
- **PAS** (Problem → Agitate → Solution) — pain-driven products
- **FAB** (Feature → Advantage → Benefit) — product differentiation

**Headlines**: Lead with outcome, not method. Use formulas: Promise, Question, How-To, Number, Negative, Curiosity, Transformation.

**CTAs**: Never "Submit" or "Click here". Use [Action Verb] + [What They Get] + [Urgency/Ease]. Example: "Start my free trial", "Get the template now".

**Emotional triggers**: FOMO, Fear of loss, Status, Ease, Frustration, Hope.

Never use "Lorem ipsum" — write real copy that serves the page's purpose.

## Visual Art

Philosophy-first generative art workflow. Two output modes:

| Mode        | Output       | When                                  |
| ----------- | ------------ | ------------------------------------- |
| Static      | PDF/PNG      | Posters, print, design assets         |
| Interactive | HTML (p5.js) | Generative art, explorable variations |

### Workflow

**Step 1 — Philosophy**: Name the movement (1-2 words). Articulate the philosophy (space, form, color, scale, rhythm, hierarchy for static; computation, emergence, noise, parametric variation for interactive).

**Step 2 — Conceptual Seed**: Identify a subtle, niche reference — sophisticated, not literal.

**Step 3 — Creation**:

- **Static**: Single page, highly visual, design-forward. Repeating patterns, perfect shapes, sparse typography. Nothing overlaps, proper margins. Output: `.pdf` or `.png`.
- **Interactive**: Read `assets/viewer.html` template first. Keep FIXED sections (header, sidebar, seed controls). Replace VARIABLE sections (algorithm, parameters). Use seeded randomness: `randomSeed(seed); noiseSeed(seed);`. Output: single self-contained HTML.

**Step 4 — Refinement**: Refine, don't add. Polish into masterpiece.

## Workflow

1. **Design**: Analyze request, set design dials, establish aesthetic direction
2. **Plan**: Map sections, select patterns, identify motion approach. For marketing pages, also draft copy using frameworks from Copywriting section.
3. **Build**: Implement following design and motion rules
4. **Polish**: Refine details — spacing, transitions, edge cases
5. **Verify**: Run quality gates

Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive effects. Minimalist designs need restraint and precision. Elegance = executing the vision well.

## Quality Gates

- [ ] Mobile layout collapse (`w-full`, `px-4`) for high-variance designs
- [ ] `min-h-[100dvh]` not `h-screen`
- [ ] Empty, loading, error states provided
- [ ] Correct animation tool per selection matrix
- [ ] No GSAP + Framer mixed in same component
- [ ] All `useEffect` with GSAP/observers have cleanup returns
- [ ] `prefers-reduced-motion` respected
- [ ] Only GPU properties animated
- [ ] Heavy libraries lazy-loaded
- [ ] No placeholder images — all media assets exist locally
- [ ] Distinctive typography (not Inter/Roboto/Arial)
- [ ] Cohesive color palette with CSS variables
- [ ] Cards omitted where spacing alone suffices
