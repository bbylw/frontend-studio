# Pattern library

The first version of this skill was a catalogue of devices: twenty-five patterns, each described as
something to reach for. The study this version rests on shows that many of them are what weak sites are
made of — icon rows, pill badges, gradients and glow appear two to three times more often on the sites a
panel scored under 6.5 than on the ones above 7.5 — and that others became tells simply by being produced
by default. So the catalogue has been re-sorted into three lists instead of one.

**How to use this file.** A pattern is a device, not a recipe. Reach for one only when the direction
(`scripts/draw.mjs`) calls for it, or when the subject itself demands it. Never assemble a surface out of
this list; that is precisely how the average landing page gets built. Section 4 is the more useful half:
how to invent a pattern from the subject instead of borrowing one from here.

## Contents

1. Patterns that survive
2. Patterns that are conditional
3. Dated tells, and what replaced them
4. Inventing a pattern instead of borrowing one

## 1. Patterns that survive

These hold up under the house rules and the study's data. Each still has to earn its place.

**Magnetic button.** The pointer attracts the control slightly. `useMotionValue` + `useSpring`, never
`useState` (a re-render per pointer move drops frames). Code in `motion.md` Part B §10. Use it once, on the
primary action; guard it behind `(hover: hover)`; keep the pull under about 25% of the offset.

**Morphing modal.** A card expands into a detail view with a shared element. Framer Motion `layoutId` on
both card and panel, `AnimatePresence` for the exit. Code in `motion.md` Part B §9. It is a dialog: trap
focus, close on `Esc`, return focus to the trigger.

**Curtain / shutter reveal.** An image or a panel opens from one edge with `clip-path: inset(…)` while the
content inside settles from a slight scale. The gallery's staple for a hero. Recipe in `motion.md` Part A §4.

**Masked line reveal.** Each line of a headline rises from behind its own baseline. In `motion.md` Part A §4,
with the `padding-bottom` / negative-margin pair that stops descenders being clipped. Works because this
skill caps headlines at two lines.

**Split-screen with a real argument.** Two panels carrying two sides of a comparison — before and after, two
materials, two plans. Legitimate when the claim *is* the comparison. It fails the moment the split is
decoration and the halves say the same thing at different speeds.

**Masonry, for variable real media.** Columns of differing heights, because the media genuinely differs.
Correct for an archive, a work index, a photo set. Wrong as a way to arrange six identical feature cards.

**Drag-to-pan, for a large canvas.** Maps, big images, diagrams, a timeline wider than the screen. Needs
`pointerdown/move/up` with velocity for inertia, `touch-action` set correctly, and — mandatory — a keyboard
equivalent (arrow keys, or a scroll container it also lives in). A canvas that can only be dragged is a
canvas half the visitors cannot read.

**SVG draw on scroll.** A path drawing itself with `stroke-dasharray` / `stroke-dashoffset`, driven by
CSS `animation-timeline` where available. Keep it for a path that means something: a route, a process, an
itinerary, a timeline. A decorative SVG border drawing itself is a tell.

**Directional hover.** A small highlight entering from the side the pointer came from. One consistent
response on one family of elements (the work index, the price rows). Not on everything.

**Text mask, when the type is the subject.** Enormous letters with a photograph showing through them
(`background-clip: text`). Legitimate at display size when the subject *is* the image; never on body text,
never with a gradient behind it, and check the contrast of anything set over it.

**Skeleton in the real shape.** A loading placeholder drawn as the geometry the content will occupy
(avatar block, two text lines, a button), so the layout does not jump. **Not a shimmer:** a sweeping
`linear-gradient` highlight is both a banned gradient and a dated tell. Use a flat `--surface` block and,
at most, a slow opacity change.

## 2. Patterns that are conditional

Allowed when the direction names them or the medium genuinely requires them. Each has a stated limit.

| Pattern | Allowed when | Limit |
| --- | --- | --- |
| **Dock magnification** | The surface *is* a dock or a tool palette (a design tool, an app launcher) | Never as a website's navigation. Track the pointer's distance to each item, not just hover, or the wave is not smooth. |
| **Radial menu** | A canvas or editor tool where a radial layout maps to the actual model | Keyboard-reachable, and never the only way to reach the actions. |
| **Dynamic island / expanding status area** | The product is genuinely about live status or media control | One, and only where the status is the content. |
| **Sticky stack** | A sequence where accumulation is the point (steps, a chain of evidence) | The inspector warns past three pinned screens; every screen under a pin needs its own content; never pin under 768px. |
| **Horizontal scroll section** | A real sequence that reads as a track (a catalogue, a process, a reel) | Desktop only — no pin or hijack below 768px; provide a native horizontally scrollable fallback on touch. |
| **Zoom / drift parallax** | A large photograph that is the subject | Travel under about 8% of the element; never on text; off under reduced motion and on `pointer: coarse`. |
| **Accordion slider** | Comparing items where one is enlarged (a menu, three plans) | The expanded item must not push the others off screen; keyboard-operable, and the toggle state announced. |
| **Kinetic marquee** | One line of very large type travelling sideways is the direction's own move | One marquee per page, pause on hover, stop under reduced motion, and the text must be readable at speed. |
| **Particle / WebGL scene** | The subject is genuinely spatial — a product you can turn, a place you can move through | Isolated canvas layer, lazy-loaded, budgets from `motion.md` Part B §13. Never a decorative void-filler. |
| **Parallax tilt** | One kind of card, small angles (±6°) | Behind `(hover: hover) and (pointer: fine)`. A grid where every tile tilts is the strongest motion tell there is. |
| **Bento grid** | The direction is `dense-tiles`, or the surface is a product dashboard | As a *feature section* on a marketing page it is a dated tell (`tells.md` §2): it says "features" without saying anything. Requires filled tiles and strict sizes to read as designed rather than as a card wall. |

## 3. Dated tells, and what replaced them

Do not use these. They are not "bad design" in the abstract — most were good ideas on good sites — they
became tells by being produced everywhere, by default, without a reason. `tells.md` keeps the dated
registry; `lint.mjs` and `inspect.mjs` catch most of them.

| Retired pattern | Why | Do instead |
| --- | --- | --- |
| **Glassmorphism** (frosted panels, translucent cards) | Reads as a 2023 template; the blur says nothing | A flat surface one tone step from the ground (`colour.md` §4). One blurred sticky header is the only exception. |
| **Gooey menu** (SVG `feGaussianBlur` + `feColorMatrix` blobs) | The effect cost is real and the metaphor is gone | A plain menu that opens from its trigger. |
| **Spotlight border** (gradient following the cursor) | A gradient, and a glow by another name | A tone step, or the accent on the state that matters. |
| **Glitch effect** (channel offset, scan lines) | A 2020s "edgy tech" costume | Nothing, or one real move from the motion library. |
| **Coverflow** (3-D fanned carousel) | Usability-hostile and dated simultaneously | A drag row with scroll snapping, or a plain index with a preview. |
| **Ripple click** (Material's expanding circle) | A pastiche of another design system | Press feedback: `scale(0.97)` over 140ms. |
| **Scramble / decode text** | The clearest "made by a model" text effect | The text simply appears, or a masked line reveal if the direction uses one. |
| **Gradient stroke / animated gradient text** | A gradient on text, banned in `page` mode | One flat ink colour. |
| **Chroma grid** (`hue-rotate` by index) | Decoration that implies a system where there is none | Real colour from the subject, or one accent. |
| **Typewriter with a blinking caret** | 2019 hero device, and it hides content behind an animation | Set the sentence. |
| **Decorative particle clouds in a void** | Says "modern tech" to nobody | A photograph of the subject, or a flat colour field. |
| **Fake dashboard hero built from grey bars** | The single clearest generated-surface tell | A real interface fragment at true size with content that adds up (`imagery.md` §7), or no image. |
| **Icon-topped feature card rows** | 28% of weak sites against 1% of the top ones | The dealt section blueprint: a narrative split, a list at large type, real imagery per item. |
| **Shimmer skeletons** (a `linear-gradient` sweep) | Banned gradient, plus a looping animation that means nothing | A flat placeholder in the real shape. |

## 4. Inventing a pattern instead of borrowing one

This is the part that matters, and it is where the study's winning sites all came from. A borrowed pattern
makes a surface that could belong to anyone; a pattern derived from the subject makes one that could not.
The procedure is the idea sentence from `SKILL.md` step 4, applied to a repeated element:

> Take **something that belongs only to this subject** and let it govern **one repeated behaviour**.

Worked shapes:

- The subject is a bakery whose oven is lit at five. The clock is the pattern: every section heading is
  stamped with the hour the work happens, in the same face, at the same place, all the way down.
- The subject is a ferry service. The timetable is the pattern: the pricing section, the FAQ and the footer
  are all set as departures, in one rule, with one column of times.
- The subject is a furniture maker who works in one wood. The grain is the pattern: one macro photograph of
  the grain is cropped three ways, at three scales, and becomes the hero, the section break and the footer.
- The subject is software for architects. The drafting sheet is the pattern: every panel is laid out on the
  same construction grid, and the grid is visible in how things align, never drawn as lines.
- The subject is an archive. The folder tab is the pattern: the tab shape recurs as the section marker, the
  button end and the image mask.

Check each invention against the competitor test and against the inspector: a derived pattern must still
obey the house rules (no gradients, no hairlines as ornament, no numbering as decoration, no monospace
outside the literal-data role in `product` mode). Originality is not a licence to re-admit the tells —
a novel ornament is still an ornament.
