# Changelog

## 2.2.0 — 2026-10-17

An audit of the toolchain against its own contract in `SKILL.md` and `references/*` turned up seven places
where a script did the opposite of what the document promised or went blind on a real page shape, plus four
neighboring traps discovered while tracing the same code paths. Every one was reproduced in isolation and
fixed at the root.

### Added

- **`--surface art` and automatic canvas-art recognition** across `draw.mjs`, `lint.mjs`, `inspect.mjs`,
  `probe.mjs`, and `rules.mjs` (fixes **D5** and **D6**):
  - `inspect.mjs` now patches `HTMLCanvasElement.prototype.getContext` and `requestAnimationFrame` in the
    instrumented page so a `<canvas>` that redraws across frames or responds to scroll is counted in
    `motion` alongside Web Animations and CSS transitions (`canvasMoved`). A generative canvas piece no
    longer fails `still-page` with `0 element(s) moved`.
  - `probe.mjs` sets `metrics.page.canvasArt` when a large `<canvas>` (≥ 25% of the viewport) carries the
    piece with zero external photographs and ≤ 450 words, and `rules.mjs` (plus `--surface art`) exempts
    such pieces from `few-pictures`, `no-real-pictures`, and `no-footage`, and lowers the motion floor to
    `1 / 2` so a single self-contained HTML piece (`references/visual-art.md`) is never told to attach four
    photographs.
- **`--max-screens <n>` on `inspect.mjs`** (default raised from `12` to `20`, fixing **D2**). Each viewport
  entry in `report.json` now records `screens` (photographed) and `totalScreens` (actual page height in
  screens), and the console header explicitly prints `N of M screens photographed (K below cap; pass
  --max-screens M to capture all)` whenever a page exceeds the cap.

### Changed

- **`assets/viewer.html` hardened against its own gates**:
  - Replaced `<div class="sidebar">` and `<div class="stage">` with semantic `<aside>` and `<main>`
    landmarks, and reordered the mobile stacked layout (`@media (max-width: 760px)`) so the `<main>` canvas
    sits above the `<aside>` controls (`references/visual-art.md` §"The viewer template"). Adding longer
    notes to a piece built from `viewer.html` no longer trips `landmark-main` in `lint.mjs`.
  - `.sidebar .subtitle` now uses `var(--step-body)` (`1rem` / `16px`) and `var(--ink)` instead of
    `13px` muted text, so replacing the placeholder subtitle with a 60+ character description never trips
    `body-size` or `grey-body` in `inspect.mjs`.
- **`SKILL.md` and `README.md` library counts synced** with `scripts/audit.mjs` (22 directions, 51 hero
  blueprints, 172 section blueprints across 16 roles, 49 type systems, 56 palettes, 181 sites).

### Fixed

- **D1 · `lint.mjs` now reads `surface` and `allow` back from `.frontend-studio/direction.json`** when
  `--surface` or `--allow` is omitted, walking up from the target path (and current working directory)
  exactly as `inspect.mjs` does and printing `[surface product]` in the summary. Previously `lint.mjs`
  defaulted unconditionally to `page`, causing product-surface tables, monospace data cells, and floating
  menu shadows to fail when invoked without `--surface product`.
- **D2 · `inspect.mjs` no longer silently drops the bottom of long pages.** Default screen capture cap
  increased from 12 to 20 screens per viewport, with `totalScreens` recorded and any unphotographed screens
  reported explicitly.
- **D3 · `probe.mjs` skips unrendered content inside closed `<details>` and `content-visibility: hidden`
  subtrees.** Chrome hides closed `<details>` children via UA `content-visibility` on an anonymous slot
  while leaving non-zero bounding boxes and `display !== 'none'` on the children. `probe.mjs` now checks
  `el.checkVisibility({ checkVisibilityCSS: true, contentVisibilityAuto: true })` and verifies that no
  ancestor `<details>` is closed before measuring text, rules, controls, or pictures. Open `<details open>`
  elements continue to be measured normally.
- **D4 · `probe.mjs` measures text contrast across the full document height.** Removed `t.top - SY > H * 6`
  from the contrast loop, which previously stopped checking contrast after the sixth viewport height and
  missed low-contrast footer links and colophons on long pages (`overMedia(t)` remains intact).
- **D7 · `draw.mjs --list roles` now lists all accepted section roles**, printing both the 16 canonical
  page roles (`features`, `showcase`, `process`, …) and the product-surface role aliases (`panel`, `table`,
  `inspector`, `timeline`, `empty-state`, `metrics`, `specimens`, `changelog`, `records`) promised in
  `SKILL.md`. In addition, `draw.mjs` now preserves `requestedRole` on each section entry in
  `.frontend-studio/direction.json` so `--redraw section:inspector` works alongside `--redraw section:showcase`.
- **`assets.mjs` strips a trailing file extension passed to `--name`** (`stripKnownExt()`) before slugifying
  and appends the real format extension once, so `--name w900.jpg` writes `w900.jpg` instead of
  `w900-jpg.jpg`. Also added explicit `res.resume()` when draining oversized streams in `getBytes()` so sockets
  close cleanly on Node 22+.
- **`draw.mjs` `adjustments()` no longer fires false-positive warnings on negated library notes** such as
  `"separated by whitespace, not by borders or shadows"` or `"No pill badges"`, and prints product-appropriate
  motion guidance in `product` mode (`references/product-surfaces.md` §6).
- **`lint.mjs` single-line multi-rule CSS tracking** now updates the active selector to the trailing rule
  after the last `}` on a line instead of resetting `sel = ''` whenever `}` appears anywhere on the line.

## 2.1.0 — 2026-10-17

The 2.0 rebuild imported taste-skill's toolchain and its rules. In use, the results were competent and
sometimes handsome but not reliably good, and the worst outcomes were described the same way every time:
ugly, abstract. This round chases that at the layer it actually came from, which was not the rules but the
data behind them.

The diagnosis, from measuring the library rather than reading it:

- **Nine palettes dealt a saturated mid-tone ground** (cobalt, mustard, carmine, bubblegum, ultramarine,
  sky, orange, candy) while `page` mode demands four or more real photographs. Two of them
  (`cobalt-field`, `mustard-field`) had no `fields` at all, so there was nowhere else to put a picture. The
  result is photographs laid straight onto electric blue, which reads as mud. This is the mechanical
  source of "ugly and abstract", and it was a contradiction inside the library rather than a mistake by
  whoever built the page.
- **Fourteen palettes had no `fields`.** A palette with no field can never change its ground, so every
  section ends up a band and the composition flattens.
- **Nine two-tone palettes set `ink` and `accent` to the same colour.** The running text and the single
  action wore one colour, so the accent had no job and every word on the page competed at once.
- **The type library was thin exactly where the demand was.** 9 directions asked for a serif display and 5
  systems could answer; the collection leaned on the neo-grotesque register (Work Sans, Epilogue, Albert
  Sans, Jost, Chivo) that reads as competent rather than designed.
- **Six directions and palettes cited `seenIn` site ids that do not exist** in `sites.json`. Plausible,
  unfalsifiable, and invented.

### Added

- **`scripts/audit.mjs`** — the gate the library never had. `lint.mjs` and `inspect.mjs` keep a build
  honest; nothing was keeping the data honest. It checks every palette role for legibility (ink 7:1,
  muted 4.5:1, button ink 3.2:1), every surface for being a visible surface at all (bg↔surface ≥ 1.05:1),
  every accent for being distinguishable from its ink (≥ 1.15:1, or it has no job), every palette for
  offering at least one field, every saturated mid-tone ground for declaring where pictures go and for
  naming a field that exists, every type system for duplicate ids and names, well-formed Google Fonts or
  Fontshare links, and a declared `single: true` when one family fills both roles. It also checks id
  uniqueness across all eight library files, that every direction names a sector `draw.mjs` knows, that no
  direction asks for a type class nothing supplies, and that every `seenIn` resolves. Exit 1 on any FAIL.
  Verified by deliberately breaking seven invariants (8 findings, exit 1) and restoring.
- **`picture-on-colour`, a new FAIL in `rules.mjs`**, measured in `probe.mjs`: a picture 240×160 or larger
  sitting on a ground that is at least 22% saturated and between 22% and 78% light. It fails in **both**
  surface modes, because it is a failure of taste rather than a convention a working interface needs, and
  so it is deliberately absent from the `product` relaxation list.
- **Five type systems** in `library/type.json` (44 → 49), chosen against supply and demand rather than
  taste alone: `fraunces-instrument` (a variable serif with an optical-size axis and a display-only wonk),
  `gloock-karla` (the heaviest thin strokes in the library), `caslon-karla` (Caslon title, workmanlike
  text), `syne-familjen` (a geometric with off-centre apertures), `petrona-commissioner` (one serif across
  the whole page). Every family was checked to resolve on Google Fonts before being written into the
  library, and all five were rendered and looked at rather than judged from their notes.
- **`pictures` policy on the nine saturated-ground palettes**, naming the neutral field each one uses, and
  printed by `draw.mjs` in the Colour section and again in the Floor paragraph.

### Changed

- **Nine two-tone palettes re-roled**: the ink moved to the neutral value of the pair and the chromatic
  value kept the accent. `orange-field-black` went the other way, keeping its dark ink and giving the
  accent the white end of the pair, which is the move a vermilion page actually wants. No third colour was
  introduced, so they are still two-tone.
- **All 56 palettes now carry at least one `fields` entry**; the fourteen that had none gained a field
  that suits them, and a dark-ground palette gained a light band it could flip a section to.
- **`draw.mjs` prints a one-family type system as a decision** ("One voice: the same family sets the
  display and the text…") instead of printing the same name twice and letting it read as an oversight.
  Twenty-seven systems declare `single: true`.
- **`draw.mjs` prints the `pictures` policy in the Floor paragraph as a pointer** rather than repeating it
  in full, and says the floor itself is unchanged: the page still owes four or more real pictures and the
  field is where they go.
- **`references/colour.md` §7** gained "A saturated ground is the one that fails", with the four steps for
  building on such a palette, and the note that a palette which cannot produce a neutral field is not a
  page palette but a poster.
- **`SKILL.md`** gained a house rule for it (unchanged in `product` mode), two bullets in the laws of the
  craft (the ink is the neutral value and the accent the chromatic one; every palette needs a field), a
  line in step 3 to read the `pictures` line before the imagery step, and `audit.mjs` in the file table.

### Fixed

- **`draw.mjs` emitted invalid CSS for palette fields.** `--field-1: #06525c;  --field-1-ink: #f7f9f8;`
  was printed on one line, so any agent copying the block silently lost the field's ink. One declaration per
  line now.
- **Six fabricated `seenIn` references removed** (`opl-boaxt`, `opl-kontu`, `opl-bueno-fyi`,
  `opl-gunes-atakan-peksen`, `opl-devonshire`, `opl-statements`). None of them exists in the 181-site
  study. They were dropped rather than pointed at a plausible substitute: a direction with no `seenIn` is
  honest, and a direction with an invented one is a lie the study cannot support. `audit.mjs` now fails any
  that reappear.
- **Two pairs of type systems shared a display name.** `Switzer` appeared twice and `Archivo` twice, so a
  sheet could print a name the reader had just seen under different settings. Renamed to the setting that
  tells them apart: "Switzer, pulled tight" / "Switzer, at rest", "Archivo, at full size" /
  "Archivo, condensed".
- **The one-family check was reading English.** The first version of that audit rule decided whether a
  design decision was intentional by looking for words like "one" in the note, which made the gate pass or
  fail on how a sentence happened to be written. It is now a structural declaration.

### Verified

The 2.0.0 matrix re-run in full, unchanged, plus the new fixture:

| Fixture | lint `page` | lint `product` | inspect `page` | inspect `product` |
| --- | --- | --- | --- | --- |
| `fixture-banned.html` | 8 FAIL / 1 WARN, exit 1 | **8 FAIL / 1 WARN, exit 1** | 6 FAIL / 2 WARN, exit 1 | **3 FAIL / 3 WARN, exit 1** |
| `fixture-product.html` | 4 FAIL / 1 WARN, exit 1 | **0 FAIL / 5 WARN, exit 0** | 5 FAIL / 5 WARN, exit 1 | 1 FAIL / 7 WARN, exit 1 |
| `console.html` | 0 FAIL / 0 WARN, exit 0 | 0 FAIL / 0 WARN, exit 0 | 3 FAIL / 3 WARN, exit 1 | **0 FAIL / 2 WARN, exit 0** |
| `page-studio.html` | 0 FAIL / 0 WARN, exit 0 | 0 FAIL / 0 WARN, exit 0 | **0 FAIL / 0 WARN, exit 0** | — |
| `fixture-mud.html` | 0 FAIL / 0 WARN, exit 0 | 0 FAIL / 0 WARN, exit 0 | **3 FAIL / 1 WARN, exit 1** | **1 FAIL / 1 WARN, exit 1** |
| `scripts/audit.mjs` | — | — | **0 FAIL / 0 WARN, exit 0** | — |

`fixture-mud.html` is clean in the source scanner and fails only `picture-on-colour`, in both modes, and
clears it under `--allow picture-on-colour`. `console.html` still moves 3 FAIL → 0 FAIL on the mode alone.

## 2.0.0 — 2026-10-16

A rebuild of the skill around one change of method: **directions are dealt from a research library and
the result is measured in a real browser**, instead of style advice being described in prose and hoped
for. Derived from [taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT); see `NOTICE.md` for the
line-by-line provenance.

The six files of the pre-upgrade skill are kept unmodified in `frontend-studio-before-upgrade/` beside
the verification evidence, so any of these changes can be diffed against what it replaced. It is
deliberately **not** kept inside the skills directory: it still contains a `SKILL.md`, and a scanner
walking that directory could register it as a second, stale `frontend-studio`.

### The three things that are new in kind, not just in quantity

1. **`scripts/draw.mjs` deals the direction.** Asked to invent a look, a model returns the category
   default. The script deals three of 22 researched directions; you pick the one that carries the
   subject's idea, and it then deals that direction's type system, palette, hero composition and
   section blueprints, plus a direction sheet that names where you are expected to disagree with it.
2. **`scripts/lint.mjs` and `scripts/inspect.mjs` are a gate, not advice.** A static scan for the tells
   of a generated surface, and a zero-dependency Chrome DevTools Protocol pass that measures the page at
   1440 / 768 / 390, photographs every screen, counts the elements that actually moved, and exits
   non-zero while a FAIL remains.
3. **Surface modes.** `--surface page` (default) or `--surface product`. A dashboard is not a landing
   page: the rules that make a marketing page good actively break a working interface. Both modes share
   one ban list; `product` relaxes a documented subset and nothing else.

### Added

- **`references/product-surfaces.md`** — new. What changes for dashboards, docs, tools and component
  libraries and what does not; software equivalents of the imagery rules; product copy (empty, error
  and confirmation states, table headers, numbers that reconcile); the rule-by-rule relaxation table in
  §5; density, tables, states and charts; how product surfaces fail.
- **`references/accessibility.md`** — new. Contrast, type and reading, semantics, images and media,
  dynamic content and reduced motion, forms, keyboard and pointer, plus a two-minute self-check.
- **`references/visual-art.md`** — new. Philosophy first, then a conceptual seed, then static or
  interactive execution; the viewer template contract; the refinement order; banned tells.
- **`references/creative-patterns.md`** — rewritten. Patterns sorted into those that survive the house
  rules, those that are conditional, and those that are now dated tells with a named replacement, plus
  a method for inventing a pattern from the subject rather than picking one from a list.
- **`NOTICE.md`** — new. Attribution and the imported/kept/rewritten map.
- **`CHANGELOG.md`** — this file.
- **Two directions** in `library/directions.json` (20 → 22): `workbench` (a tool laid out as a
  workbench: tool rail, primary stage, inspector rail) and `atlas` (the index is the first screen).
  Both exist because the library had no answer for a software-first subject.
- **Three hero blueprints** in `library/heroes.json` (48 → 51): `stage-and-rail`, `figure-dominant`,
  `index-is-the-content`.
- **Three sectors** in `draw.mjs`: `dashboard`, `docs`, `component`, each with its default section
  order and its role aliases (`panel`/`inspector` → `showcase`, `table`/`records`/`changelog` → `list`,
  `metrics`/`kpis` → `stats`, `empty-state` → `intro`, `specimens` → `gallery`).
- **`--surface`** on `draw.mjs`, `lint.mjs` and `inspect.mjs`, and the surface is read back from
  `.frontend-studio/direction.json` when the flag is omitted.
- **`fs-ignore`**, a per-line escape comment, in `lint.mjs`.

### Changed

- **`SKILL.md`** rewritten as a decision procedure: ten steps (read the brief, write the argument, draw
  the direction, find the idea, write the words, build it still, gate, look, move, report), a house
  rules table with a column per surface mode, the laws of the craft, the special cases, and a file
  table that says when to read each reference. The frontmatter description now covers product surfaces
  and generative art, and names the "looks generic / templated / AI-made" triggers.
- **`rules.mjs`** — `judge()` takes a surface. In `product` mode eleven devices fall from FAIL to WARN
  while keeping their documented limit (`mono`, `numbering`, `micro-label`, `hairline`, `outlined-box`,
  `shadow`, `icon-cards`, `card-rows`, `glass`, `dashed`, `eyebrow`); the body-size floor drops one step;
  the four-picture floor is skipped; `side-scroll` and the three-typeface warning are page-mode only;
  `focal-point` falls from FAIL to WARN.
- **`inspect.mjs`** — motion floor is mode-aware (8 / 16 in `page`, 4 / 8 in `product`); `empty-screens`
  is page-mode only; the surface is printed in the header with a line explaining what it relaxed.
- **`lint.mjs`** — `--surface product` downgrades `mono`, `numbering`, `hairline`, `outlined-box` and
  `shadow` per finding and appends the reason.
- **`copy.md`** and **`motion.md`** — each grew a Part B. Copy: the four jobs of a page, AIDA / PAS /
  FAB / BAB, CTA rewrites as a instead-of/write table, emotional triggers in honest and dishonest form,
  objection handling, proof types from weakest to strongest. Motion: which library to choose and never
  to mix in one component, Motion/Framer reveal-stagger-`layoutId` recipes, magnetic and tilt controls
  driven by motion values, `gsap.context` with `ctx.revert()` and `matchMedia`, CSS scroll-driven
  animation, and an isolated R3F canvas with a particle budget. The original standalone
  `copywriting.md` and `motion-recipes.md` were folded in and removed rather than left to drift.
- **`assets/viewer.html`** largely rewritten. The previous version demonstrated the assistant palette,
  a gradient, glass and a resting shadow; the new one is token-driven, flat and tone-stepped, keeps the
  fixed shell, seed controls and parameters, and gates motion behind `prefers-reduced-motion`.

### Fixed

- A legitimate "panel title above a large figure" was reported as an `[eyebrow]` FAIL. Small panel
  titles now sit in the documented `product`-mode relaxation, the rule text distinguishes a panel title
  from a kicker, and the same wording was corrected in `SKILL.md`, `product-surfaces.md` §5 and the
  direction sheet.
- The skill's own `assets/` failed its own linter on eight emoji, two comments containing a banned word
  and five em dashes. All cleaned; `assets/` now scans at 0 FAIL, 0 WARN.
- `draw.mjs` could deal a photograph-led hero for a dashboard. A `mediaLed()` filter now excludes
  full-bleed-media blueprints on product surfaces.
- **`lint.mjs` silently discarded its first path argument whenever `--surface` was not passed.** The
  filter that drops the flag's value computed `surfaceAt + 1`, which is `0` when the flag is absent, so
  `lint.mjs assets` scanned nothing and exited 2 while `lint.mjs assets --surface page` worked. Found by
  running the linter against the skill's own directories as a self-check, which is a use the changelog
  would otherwise have claimed without exercising. All four invocation shapes (path alone, path then
  flag, flag then path, no arguments) are now checked, and the skill's own `assets/`, `references/` and
  `scripts/` scan at 0 FAIL, 0 WARN.
- `draw.mjs` now says out loud when it inferred the surface mode from the sector, instead of applying it
  silently. A user building a public documentation site had no way to learn that the `docs` sector had
  been treated as a product surface. The note prints only when the inference lands on `product`, since
  `page` is what a reader would have assumed, and it names the override.

### Verified

Two gates, two modes, both directions, with a real browser. Fixtures and reports are in `fs-verify/` of
the working directory that produced this version.

| Fixture | lint `page` | lint `product` | inspect `page` | inspect `product` |
| --- | --- | --- | --- | --- |
| `fixture-banned.html` — every banned tell at once | 8 FAIL / 1 WARN, exit 1 | **8 FAIL / 1 WARN, exit 1** | 6 FAIL / 2 WARN, exit 1 | **3 FAIL / 3 WARN, exit 1** |
| `fixture-product.html` — a plausible product skeleton, stripped of motion | 4 FAIL / 1 WARN, exit 1 | **0 FAIL / 5 WARN, exit 0** | 5 FAIL / 5 WARN, exit 1 | 1 FAIL / 7 WARN, exit 1 |
| `console.html` — a real product surface with a table, monospaced vessel codes and a panel title | 0 FAIL / 0 WARN, exit 0 | 0 FAIL / 0 WARN, exit 0 | 3 FAIL / 3 WARN, exit 1 | **0 FAIL / 2 WARN, exit 0** |
| `page-studio.html` — a page with three photographs and one looping clip (four pictures as the meter counts them) | 0 FAIL / 0 WARN, exit 0 | — | **0 FAIL / 0 WARN, exit 0** | — |

Bold marks the mode each fixture is actually meant for. All fourteen invocations behind this table are
listed in `fs-verify/README.md` and were re-run after the last script change.

What the four rows prove, read together:

1. **The bans that matter never relax.** `fixture-banned.html` keeps 8 FAIL under `lint` in both modes and
   keeps `emoji` and `gradient` as FAIL under `inspect` in both modes. What moves between modes is only
   the interface devices and the page-only floors.
2. **`console.html` goes 3 FAIL → 0 FAIL on the mode alone** — `eyebrow`, `mono` and `few-pictures` in
   `page`, then `eyebrow` and `mono` correctly downgraded to WARN with the reason printed, and the
   picture floor correctly skipped. This single comparison is the whole design.
3. **The motion floor is lowered, not removed.** `fixture-product.html` still fails `still-page` in
   product mode at a floor of 4, because it contains no motion at all. A working interface is allowed to
   move less than a landing page; it is not allowed to stand still.
4. **`page` mode is a gate, not a permissive default.** `page-studio.html` reaches 0 FAIL / 0 WARN in both
   gates at all three widths, with 31 elements moving and every desktop screen at least 35% filled. It did
   not reach that on the first run. The gate caught three real faults in the page itself, all now fixed:
   a 20-word statement left at 30px at phone width, where a paragraph that large stops counting as a
   statement and becomes a four-line headline; ten distinct font sizes where a page wants about five; and
   a CSS specificity mistake (`.rack .claim` beating a later `.claim`) that silently kept the 30px value
   in place. That last one is the argument for measuring rather than reviewing: the stylesheet looked
   correct, and only the render at 390px said otherwise.

A note for whoever reads the reports: a relaxation only rescues a FAIL. A finding that was already a WARN
stays a WARN and keeps its plain message, which is why `hairline` and `micro-label` appear without the
"tolerated in product mode" suffix on `fixture-product.html`.

One path that is easy to leave untested was checked too: the mode is decided once and then carried by the
direction sheet, so `inspect.mjs` run without `--surface` has to pick it up from
`.frontend-studio/direction.json`. Dealing a `dashboard` sheet and inspecting `console.html` without the
flag prints `[surface product]` and reaches 0 FAIL / 2 WARN; dealing a `restaurant` sheet and inspecting
`page-studio.html` without the flag prints `[surface page]` and reaches 0 FAIL / 0 WARN. Both directions
of the round-trip work.

### Numbers

56 palettes · 49 type systems · 22 directions · 51 hero blueprints · 172 section role blueprints · 11 motion patterns · 181 detailed site records (drawn from a study of 247). `scripts/audit.mjs` reports the per-class type counts and the per-sector direction counts on every run.

### Known limits

- The research library records 181 detailed entries from a 247-site study; the rest were measured but
  not written up. Do not claim per-site figures for a site without a record.
- The relaxations are conservative by construction. A designer looking at the screenshot still has to
  decide whether a rule's "documented role" applies; the tool can only say that it might.
- `assets/viewer.html` ships working placeholders for `build()`, `system()` and `drawGenerativeArt()`.
  It is a template with the scaffolding in place, not a finished piece.
