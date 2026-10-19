# frontend-studio

A skill for building frontend work that looks designed rather than generated, and for proving it does
instead of hoping so.

The problem it exists for: asked to invent a look, a model returns the category default every time. A
centred headline over three lines, a small label above it, a row of icon cards, a soft gradient, a few
thin rules, a monospace caption. Nothing in that is wrong and nothing in it was decided.

This skill replaces those defaults with decisions, and with three measurements.

## The method

1. **A direction is dealt, not invented.** `scripts/draw.mjs` deals three of 22 researched directions from
   a library distilled from a study of 247 gallery sites. You choose the one that can carry something only
   *this* subject has, and it deals that direction's type system, palette, hero composition and section
   blueprints — plus a direction sheet that names where you are expected to disagree with it.
2. **The idea comes from the subject**, not the category. You write one sentence — *on this surface,
   something of theirs becomes the device the direction calls for* — and do not start building until both
   blanks are filled from an inventory of eight to twelve things that belong to this client and to no
   competitor.
3. **A sketch is approved before anything is built.** `scripts/mock.mjs` renders the dealt direction as one
   throwaway HTML file — Tailwind from a CDN, real palette, real type, the hero at the size its blueprint
   states, one skeleton per section — and asks for a yes. A direction you did not want costs a file here
   instead of the whole build, and rounds of a sketch are still cheap while rounds of a build are not.
4. **The build is measured, not reviewed.** `scripts/lint.mjs` scans source for the tells of a generated
   surface. `scripts/inspect.mjs` opens the page in a real Chrome at 1440, 768 and 390, measures it
   (headline line counts, type sizes, fonts actually loaded, colours, contrast, overflow, how many
   elements genuinely move), photographs every screen, and exits non-zero while a FAIL remains.
5. **You look at what you made.** Passing the gate means nothing banned was measured, not that the page is
   good. `references/critique.md` has the rubric; the screenshots are the evidence.

## Two surface modes

A dashboard is not a landing page. The rules that make a marketing page good actively break a working
interface, so the skill carries both rather than compromising on one.

| | `page` (default) | `product` |
| --- | --- | --- |
| Covers | landing, marketing, portfolio, one-pager, event, restaurant | dashboards, admin panels, tool UIs, data tables, settings, design systems |
| House rules | in full | a documented subset |
| Floors | four real pictures, eight moving elements | pictures replaced by real interface fragments; four moving elements |

`product` mode relaxes eleven devices from FAIL to WARN — monospace in the literal-data role, a rank
number, a table's rules, a shadow on something that really floats, a panel title above a large figure —
and **nothing else**. Gradients, glow, emoji, and the cream-and-terracotta or violet accents are banned in
both modes. Every relaxation is listed in `references/product-surfaces.md` §5 and printed in the tool's own
output, so it can never apply silently. A relaxation only rescues a FAIL: a finding that was already a
warning stays a warning.

```bash
node scripts/lint.mjs src/ --surface product
node scripts/inspect.mjs dist/index.html --surface product
```

## A gate for the library too

`lint.mjs` and `inspect.mjs` keep a build honest. Nothing was keeping the *data* honest, which is how it
came to hold palettes whose surface steps were invisible, palettes with nowhere to put a photograph, and
type systems dealt under duplicate names. `scripts/audit.mjs` is that missing gate: every palette role
legible, every surface visible, every accent distinguishable from its ink, every saturated ground saying
where pictures go, every stylesheet link well formed, every reference resolving.

```bash
node scripts/audit.mjs
```

## What it bans, and what replaces it

| Instead of | It asks for |
| --- | --- |
| a centred headline over three lines | two lines or fewer at every width, verified by measurement |
| a small label above the heading | the information folded into the heading or the first sentence |
| rows of identical icon cards | one composed section from the direction |
| soft gradients, glass, resting shadows | flat colour, a tone step, or a real image |
| hairlines and 1px outlined boxes | space, a step in background tone, a change of scale |
| monospace labels, index numbers | the text face; tabular figures where numbers align |
| stock marketing phrases | the specific thing the product does |

Removing ornament leaves space, and the space has to be filled with substance: type set larger, whole
fields of colour, real pictures of this subject's world, and every section carrying its full content. A
surface that has lost its cards and gained nothing in their place reads as thin, and blind jurors prefer a
richer surface with tells over an empty one without them.

## Install

Copy this folder into your agent's skills directory. It needs Node 22+ and an installed Chrome, Edge or
Chromium, and installs nothing. `scripts/assets.mjs` also needs network access; it uses no API keys.

```
frontend-studio/
├── SKILL.md              the eleven-step run, the house rules, the file table
├── scripts/              draw · mock · lint · inspect · audit · assets
├── references/           research, type, colour, layout, imagery, motion, copy,
│                         critique, tells, accessibility, visual-art,
│                         product-surfaces, creative-patterns
├── library/              56 palettes · 49 type systems · 22 directions ·
│                         51 hero blueprints · 172 section blueprints ·
│                         11 motion patterns · 181 studied-site records
├── assets/               base.css · base.js · the generative-art viewer template
└── evals/                briefs for testing the skill against a no-skill baseline
```

## Verification

Four surfaces and one deliberate mistake, run through both gates in both modes. Reproducible from a
`fs-verify/` directory; the commands are in the `README.md` there.

| Fixture | lint `page` | lint `product` | inspect `page` | inspect `product` |
| --- | --- | --- | --- | --- |
| every banned tell at once | 8 FAIL | **8 FAIL** | 6 FAIL | **3 FAIL** |
| a plausible product skeleton | 4 FAIL | **0 FAIL** | 5 FAIL | 1 FAIL |
| a real product surface | 0 FAIL | 0 FAIL | 3 FAIL | **0 FAIL** |
| a page with four real pictures | 0 FAIL | 0 FAIL | **0 FAIL / 0 WARN** | — |
| a picture on a saturated ground | 0 FAIL | 0 FAIL | **3 FAIL** | **1 FAIL** |
| `audit.mjs` on the library | — | — | **0 FAIL / 0 WARN** | — |

Read the second and third rows together: the bans that matter never relax, while a legitimate working
interface goes from three failures to none on the surface mode alone. That single comparison is the whole
design.

## Provenance

Derived from [taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT, © 2026 Leonxlnx), whose
licence text is kept verbatim in `LICENSE-taste-skill`. `NOTICE.md` maps exactly what came from where.
`CHANGELOG.md` records what each version changed and the verification behind the claims.

Zero dependencies. Node 22+.
