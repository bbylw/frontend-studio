# Visual art

Posters, print pieces, and generative works: the part of the skill where the deliverable is not an
interface. The workflow is philosophy first — the piece comes out of a stated idea, not out of a filter —
and the house rules apply to its typography and colour rather than to any interface convention.

This is a different mode from the run in `SKILL.md`. Keep the order below; do not skip step 1, which is
where the work either has an idea or does not.

## Contents

1. Philosophy
2. Conceptual seed
3. Creation: the two output modes
4. The interactive template
5. Refinement
6. What is banned, and what is a trace of a generator

## 1. Philosophy

Name the movement in one or two words. A movement is a constraint you can state in a sentence, and every
later decision answers to it. Examples of the shape (invent your own; these are named to show the
grammar, not to be reused):

- **Slow grid** — everything on one coarse grid, moving at one speed so the eye reads structure before
  content.
- **Full bleed, no air** — the field is packed edge to edge with one mark repeated at three scales.
- **One line, one colour** — a single continuous stroke in one flat colour across the whole sheet.
- **Cold garden** — botanical forms, drawn mechanically, in a palette that denies them life.

State it as a sentence that contains the *rule*: what is allowed, and what is forbidden. "Slow grid: all
marks sit on a 12-column structure; no mark crosses a column line; nothing moves faster than the grid."

For each piece, decide the parameters the discipline works on:

| Static (print, poster) | Interactive (generative) |
| --- | --- |
| space, form, colour, scale, rhythm, hierarchy | computation, emergence, noise, parametric variation, interaction |

If the piece is static, the philosophy is about composition. If it is interactive, it is about the rule
system, and the composition is whatever the rule system produces. Do not blur the two: an interactive
piece does not need a designed hero, and a poster does not need a rule that generates 10,000 variants.

## 2. Conceptual seed

Identify one subtle, specific reference — sophisticated, not literal. Not "Bauhaus" but "the registration
marks on a 1960s Dutch seed catalogue"; not "fluid dynamics" but "the way a spill finds the edge of a
tilted table". The seed is what keeps the work from being a genre exercise, and it is usually invisible in
the final piece. Write it down in one line, in your notes, and let it govern the details (the margins, the
line weight, the numbers you choose).

## 3. Creation: the two output modes

| Mode | Output | When |
| --- | --- | --- |
| **Static** | PDF or PNG | Posters, print, design assets, anything that will be produced once |
| **Interactive** | a single self-contained HTML file (p5.js) | Generative art, explorable variations, a piece whose point is the variation |

**Static.**

- One page, highly visual, composition first.
- Repeating pattern, perfect shapes, sparse typography. Nothing overlaps; margins are real and equal.
- Choose two or three type sizes, far apart (the laws in `SKILL.md` apply). For print, set the sizes in
  millimetres or points, and check the physical margins: a print piece has a bleed and a safe area.
- Colour: flat fields, at most one accent. The assistant palette is banned here too, and a print piece
  makes it even more obvious because there is no interface to hide behind.
- Export at print resolution (300dpi at final size), with the page size declared.

**Interactive.** Read `assets/viewer.html` first. It is a template, not a starting point to be discarded:
keep its shell, its token block and its seed controls, and write the algorithm yourself.

- **Seeded randomness is the whole point.** `randomSeed(seed); noiseSeed(seed);` before building the
  system, so the same seed always produces the same piece. Without this the seed controls are theatre.
- **The seed controls must always be present:** a numeric field, previous, next, random. This is what makes
  the piece explorable and reproducible.
- **Every control changes something visible.** A slider that does nothing is worse than no slider.
- **Output: one self-contained HTML file.** p5.js from a CDN, fonts from Google Fonts, everything else
  inline. No build step.
- Respect `prefers-reduced-motion` by drawing one still frame instead of running the loop, and stop the
  loop when the tab is hidden (both are wired in the template).
- Give it an export control (`saveCanvas`) so the piece can be printed or posted.

## 4. The interactive template

`assets/viewer.html` is the starting point. Its structure is:

```
header            the work's title and a one-line description — write these
seed section      ALWAYS KEEP: numeric field, previous, next, random, read-out
parameters        only the parameters this piece really has
colour            the piece's own palette, two or three values
export            save a PNG of the current frame; reset
canvas area       the piece, drawn at a fixed square size and scaled by CSS
```

Marked in the file: `system()` and `drawGenerativeArt()` are the two functions you replace. The seed
handlers, `build()`, the reduced-motion handling and the visibility handling are written and should be
kept — they are the parts that are easy to get subtly wrong.

Two rules the template enforces and you must not undo: **flat fills only** (no gradient on the ground, on
controls or in text) and **no shadows on resting surfaces** (a tone step separates the panel from the
ground). Both are house rules, and `lint.mjs` will fail a file that breaks them.

When you run `inspect.mjs` on a generative piece (either directly or with `--surface art`), the inspector
recognises a self-contained `<canvas>` viewer automatically: it counts `requestAnimationFrame` canvas
drawing in the motion check and exempts the piece from the external photograph and video floor
(`few-pictures`, `no-real-pictures`, `no-footage`), because the canvas itself is the visual work.

## 5. Refinement

Refine, do not add. In order:

1. Cut one thing. Every piece of this kind has one element that is not earning its place.
2. Fix the composition: the anchor line, the margins, the one deliberate void.
3. Fix the type: the size contrast, the measure, the line breaks.
4. Fix the palette proportion: ground dominant, accent under 5% of the sheet.
5. Only then adjust the algorithm's parameters.

Then look at it as an image, at 100% and at thumbnail size. A composition that only works at full size is
not composed. If the piece is interactive, look at ten draws from ten seeds: if eight of them are
forgettable, the rule system is wrong, not the parameters.

## 6. What is banned, and what is a trace of a generator

The dated tells in `tells.md` apply with unusual force here, because this genre is where they were born.

- **Gradient blobs and mesh gradients** as the whole composition. The most generated-looking object that
  exists.
- **The assistant palette:** violet and indigo, cream with terracotta.
- **Depth-of-field bokeh, glow, "aurora" ribbons, particles floating in a void** with no relation to the
  idea.
- **A grid of small identical thumbnails** as the piece. Variation is the point; a 4×4 contact sheet of
  near-identical frames is a parameter sweep, not a work.
- **Type as decoration** — an oversized number, a fake coordinate, "001 / 0100", a fake timestamp. The
  index-numbering ban is `SKILL.md`'s and it holds here.
- **A dark ground with a neon accent and a glow.** The second most generated-looking object.
- **A "download" button as the only interaction** with no seed control. The seed control is what makes it
  art rather than a screenshot.

Ask of every element: if I removed it, would the philosophy survive? If yes, it was decoration. Remove it,
and make what is left larger.
