---
name: frontend-studio
description: |
  Build distinctive, production-grade frontend work with exceptional design quality, and prove it is
  good instead of hoping so. Combines an art-direction engine drawn from a study of 247 curated gallery
  sites with engineering rigour: a real-browser inspector that measures the result, a static linter for
  the tells of generated pages, and a look-and-fix loop on your own screenshots.

  Use when building, designing, redesigning, restyling, polishing or reviewing any of:
  - public-facing pages — landing pages, marketing sites, portfolios, product pages, one-pagers,
    heroes, event and restaurant pages, docs sites, in any stack (HTML/CSS, React, Next.js, Vue,
    Nuxt, Svelte, Astro, Solid, Tailwind);
  - product surfaces — dashboards, admin panels, tool UIs, data tables, settings screens, design
    systems and component libraries;
  - and generative / visual art — posters, print pieces, explorable canvas works.

  Also use it when the user says a page looks generic, templated, "AI-made", sloppy, "like every other
  site", or asks to make it look designed, premium or award-level. Covers design thinking, typography,
  colour, spatial composition, imagery and its licensing, motion systems, copywriting, accessibility,
  performance and quality assurance.
---

# Frontend Studio

A surface built by a model usually looks like the average of every surface the model has seen: a centred
headline over three lines, a small label above it, a row of icon cards, a soft gradient, a few thin
rules, a monospace caption. Nothing in it is wrong and nothing in it was decided.

This skill replaces those defaults with decisions, in four ways:

1. **A script deals the direction; you choose among the dealt options.** Asked to invent a look, a model
   returns the category default every time. `scripts/draw.mjs` deals three of twenty-two researched
   directions; you choose the one that carries the subject's idea, and it then deals that direction's
   type system, palette, hero and section compositions from a library distilled from a study of 247
   gallery sites.
2. **The idea comes from the subject,** not from the category. In the study, what separated the best
   sites from the forgettable ones was a concept taken from the thing itself, not the styling.
3. **A house style with no ornaments, measured in a real browser** by `scripts/inspect.mjs`, and scanned
   in source by `scripts/lint.mjs`, so the rules are checked rather than hoped for.
4. **You look at what you made.** Screenshots at three widths, a juror's rubric, fix, look again.

One warning learned in testing. Taking the ornaments away is only half the job; a surface that has lost
its labels, rules and cards and gained nothing in their place reads as thin, and blind jurors rightly
prefer a richer surface with tells over an empty one without them. The other half is substance: type set
larger, whole fields of colour, real pictures of this subject's world (found or drawn), and every
section carrying its full content. The skill is built to give you that; do not trade it for restraint.

In the commands below `<skill>` is this skill's folder. Run them from the project's root, so the working
files land in `.frontend-studio/` there. The scripts need Node 22+ and an installed Chrome, Edge or
Chromium, and install nothing. `assets.mjs` also needs network access; it uses no API keys.

## Surface modes

Decide this first; it changes which rules are hard and which are guidance.

| Mode | What it covers | House rules |
| --- | --- | --- |
| **`page`** (default) | Public-facing pages: landing, marketing, portfolio, product page, one-pager, event, restaurant, docs site | In full. Four real pictures minimum, the motion floor, no cards, no rules, no monospace, no numbering. |
| **`product`** | Application surfaces: dashboards, admin panels, tool UIs, data tables, settings, design systems, component libraries | A documented subset. Tables may keep lines, data may keep monospace and numbering, tiles and cards are legitimate, panels may cast a shadow. Gradients, glow, emoji, violet and cream-and-terracotta are still banned. See `references/product-surfaces.md`. |

The **procedural core is identical in both modes**: inventory the subject, argue the page as claims,
draw a direction, find the idea, write real words, build still first, pass the gate, look at your own
screenshots. What changes is only the ornament budget and the picture/motion floor. Do not use `product`
as an excuse to skip the idea; a dashboard template is as forgettable as a landing-page template.

Decide the mode yourself and pass it explicitly. `draw.mjs` infers one when you do not: sectors that are
software by nature (`dashboard`, `docs`, `component`) infer `product`, every other sector infers `page`,
and the sheet says so and tells you to re-deal if you know better. The inference is a guess about the
sector, not about your brief: a public documentation site is a `page`, while help and reference living
inside an application is a `product` surface, and both are dealt from the `docs` sector.

Pass the mode to the tools: `--surface product` on `lint.mjs` and `inspect.mjs`. They read it back from
`.frontend-studio/direction.json` if you leave the flag out.

## The run

Do these in order. Steps 1–6 take a few minutes and decide whether the result is any good.

### 1. Read the brief and the project

Find out what is real: the subject, the audience, the one thing the surface must get someone to do, the
stack, any existing brand (colours, fonts, logo), and above all **what imagery truly exists**: the
project's own photographs or product shots, a real interface that can be shown, an image generation tool
you can call, or nothing. Do not plan around pictures you do not have. Nothing of its own is rarely
nothing at all: the subject's city, street, materials and history are in open archives and museums, free
to use with a credit (step 6, `scripts/assets.mjs`).

If the request is vague, decide and state your reading in one line instead of asking. Ask only when a
missing fact blocks the work (for example, no product name).

Then **inventory the subject** in your notes: eight to twelve things that belong to this client and to no
competitor. Look for its name and what the name means; its address, door number, street and
neighbourhood, and what that place looks like (its tiles, signs, paint colours, typefaces on its shop
fronts, its light, its weather); the numbers in the brief (seats, rooms, minutes to the sea, the price,
the year); the constraint it lives with (only one batch a month, closed in winter, by appointment); its
materials and colours; its rituals and hours (the oven lit at five, the ferry at seven); the printed
things of its world (a timetable, a label, a ticket, a sign). This list is where the idea comes from in
step 4. In blind tests, the page that won each brief was built from an item on such a list (the client's
name and what it means, the street it stands in, the one constraint that makes it what it is), and the
pages that lost had a good composition with a category idea. The list is also your picture search: each
place, material and printed thing on it is a query for step 6.

For a **product surface**, the inventory is the same discipline applied to the software: what the thing
actually does, the shape of its real data (how many rows, how many columns, which figures matter), the
one job the user came to do, the constraint it lives with (read-only, audited, offline, one account).
`references/product-surfaces.md` §2 lists the equivalents of "its street" for software.

### 2. Write the argument

Before any design, list the surface as claims with their proof, one line per section, the way
`references/copy.md` §1 shows. The claims decide which sections exist and in what order. Delete any
section that has no claim. This is how you avoid the stock sequence of hero, logos, three features,
testimonial, pricing, call to action — and, on a product surface, the stock sequence of KPI tiles, a
chart nobody reads, a table, and a settings pane.

### 3. Draw the direction

```bash
node <skill>/scripts/draw.mjs --sector <sector> --brief "<one line about the subject>" \
  --sections <roles in the order of your argument> [--surface page|product] [--tone <tone>] \
  [--have <assets>] [--keep palette,type] --options 3
```

This deals three directions and prints a short summary of each. Hold each one against your inventory:
which way of composing can carry something only this client has? Choose that one, not the most familiar,
and write one line in your notes on why. In testing, a single random direction that did not suit the
subject was the commonest cause of a weak result. Then deal the full sheet:

```bash
node <skill>/scripts/draw.mjs <the same arguments, without --options> --direction <chosen id>
```

- `--sector`: `node <skill>/scripts/draw.mjs --list sectors`. Pick the closest. For software surfaces use
  `dashboard`, `docs`, `component`, `dev-tool`, `saas` or `ai-product`.
- `--sections`: roles from `--list roles` (features, showcase, how-it-works, testimonial, proof, stats,
  pricing, faq, cta, footer, intro, about, work, gallery, list, contact; product roles: panel, table,
  inspector, timeline, empty-state). The hero is implied.
- `--tone` (optional): quiet, bold, warm, technical, playful, luxury, editorial. Only pass it when the
  brief clearly asks for one.
- `--have`: assets that really exist, comma-separated: `photography` (the project's own photographs of the
  place, people or work), `product-photo` (photographs of the specific product, or an image tool that can
  make them), `product-ui` (real screenshots), `illustration`, `video`. Leave it out if you have none: the
  draw then avoids compositions that depend on them and the sheet says how to fill picture slots honestly
  (software shows its own interface built in HTML; a product with no photographs is drawn and set among
  real pictures of its world, never a fake product shot). Pictures you will find in the open collections
  are not the project's own; leave them out of `--have`.
- **`--keep palette,type`**: when the brand already fixes colours or typefaces. The draw then deals only the
  composition, and you map the brand's values onto the roles.

Changing the library itself, rather than using it: run `node <skill>/scripts/audit.mjs` first and last. It
checks every palette role for legibility, every surface for being visible at all, every accent for being
distinguishable from its ink, every saturated ground for saying where pictures go, and every stylesheet
link for being well formed. It is the same discipline as `lint.mjs`, pointed at the data instead of the
build, and it exists because nothing was holding the library to it.

The command prints a **direction sheet**. It is the art direction for this build:

- **Adopt it.** Do not blend it with the layout you would have made anyway. If it feels unfamiliar, good:
  the familiar layout is the one this skill exists to prevent.
- **Read the palette's `pictures` line before the imagery step.** Nine palettes in the library deal a
  saturated mid-tone ground (cobalt, mustard, carmine, bubblegum, ultramarine, orange). Those name the
  neutral field the pictures go in, and the floor paragraph says so too. A photograph on one of those
  grounds reads as mud and `inspect.mjs` fails it as `picture-on-colour`.
- Redraw one slot (`--redraw hero | type | palette | photos | section:<role> | direction`) only for a
  reason you can state: it contradicts a stated brand constraint, or needs an asset that does not exist.
  Never redraw to get something more comfortable. Record every redraw in your report.
- When a dealt section cannot hold the real content (it compares three plans and there is one price; it
  wants five quotations and there are none), do not bend the content to fit. List the others with
  `--alternatives <role>`, pick the one whose assumptions match the content, and take it with
  `--redraw section:<role>=<id>`.
- **Check the palette against the subject.** A dealt palette is a set of proportions (one ground, one ink,
  one accent, fields) as much as a set of colours. If its colours fight the subject's own material (candy
  pastels for a peat whisky, neon for a mountain hut), redraw the palette once; if the subject has
  unmistakable colours of its own (its material, the paint of its street, the landscape outside its
  windows), keep the dealt proportions and take the colours from the subject instead, and say so in the
  report.
- Reprint it any time with `node <skill>/scripts/draw.mjs --show`. In a long session, re-read it before
  each section you build.

### 4. Find the idea

The direction is a way of composing. The idea is what makes the surface belong to this subject and no
other. Write this sentence in your notes and do not start building until both blanks are filled from the
subject itself:

> On this surface, **[something that belongs to the subject]** becomes **[the device the direction calls for]**.

Places to look for the first blank:

- **Its output.** What does the thing produce? Put the real output on the surface as material. (A camera
  that prints poems delivered its copy as paper slips.)
- **Its object or shape.** What does it physically look like, in cross-section, in silhouette? Enlarge it,
  crop it, make it the frame or the one motif.
- **Its name.** Can the letters hold a photograph, stack into a wall, split to two corners?
- **Its place.** Is there one view that makes someone want to be there?
- **Its ritual.** Is there a sequence the surface can perform as it scrolls?
- **Its artefact.** What printed thing already exists in its world: ticket, menu, label, receipt,
  invitation, folder, manual?
- **Its opposite.** Which other category owns the feeling this one lacks?

For a product surface the same list applies to the software: **its output** (the document, invoice, export
or chart the tool really makes — put a believable one on screen), **its object** (the shape of its data:
a calendar, a ledger, a map, a queue), **its artefact** (the printed form the industry already uses, which
the interface can be dressed as). See `references/product-surfaces.md` §3.

Fill the first blank from your inventory (step 1), not from the category. **The competitor test:** put the
nearest real competitor in the sentence (the bakery two streets away, another oak furniture maker, another
hut on the same mountain; for software, the nearest tool in the same category). If the sentence still
works, the idea belongs to the category: a loaf of bread is every bakery; the seven doors of the street
this one is named after are only this one. "Clean and modern" is not an idea. The sites the study's panel
scored lowest were the ones whose idea was recorded as "none beyond the standard formula".

**One live thing.** Give the surface one thing the visitor can do, or that is different for each visit,
made from the idea: pick a wood and see the chair in it; type your name and see it cut in the foundry's
letters; set the loan and read the real monthly figure; see whether the hut's stove is lit right now and
how long until the last ferry; choose a size and see it against the room. On a product surface the live
thing is often the product itself working on real-looking data (a filter that really filters, a figure that
really recomputes), which is why §2 of `references/product-surfaces.md` insists on real numbers that
add up. In blind tests every winning page had one and the jurors named it first. Rules: it uses the
subject's real content, it works on a phone with a thumb, it has a plain fallback without script, it never
blocks reading, and it is one thing, not a playground. It is built in step 6 as part of the surface, not
added as motion in step 9.

### 5. Write the words

Write the whole surface as a copy deck (plain text) before markup, following `references/copy.md`:

- **Every headline fits in two lines or fewer at every width.** Do the arithmetic in `copy.md` §2 before
  committing to a sentence: about 32 characters is safe everywhere at a confident size. The studied
  gallery heroes have a median of 5 words and 32 characters. (On a product surface, headings are short
  labels; this rule still holds and is usually already met — see `product-surfaces.md` §4.)
- One supporting sentence. One primary action, named for what it does, as a real button on the first
  screen.
- **The first screen answers the visitor's first question in large type.** For an event: what it is, when
  and where (the dates belong in the headline or at the second size, never only in small text). For a
  product: what it is and what it costs or does. For a person: who and what they do. For software: what
  the thing is for, and the state of the data. Every section the visitor came for (the line-up, the menu,
  the rooms, the price) has its own heading and its own place in the navigation.
- **Write the full content.** Every section the brief asks for delivers its information completely: the
  whole menu with prices, each room with its own details, every speaker and talk, the price with what it
  includes, an answer for each real question. Thin sections are the commonest reason a clean surface loses
  to a busier one.
- Sample details are expected where the brief leaves gaps (dish names, room names and rates, project
  titles, row labels and figures) so the design is seen at full density; list them in the report for the
  client to confirm. Proof is never invented: no customers, quotes, reviews, press, logos or business
  statistics. `references/copy.md` §5 has the full rule.

### 6. Build it, still

Build the surface with motion switched off in your head; a surface that needs animation to look finished
is not finished. Order of work:

1. **Tokens.** Colour and type roles from the sheet as CSS custom properties. Everything downstream
   references tokens only. `<skill>/assets/base.css` is a neutral foundation you may start from (reset,
   token names, fluid type steps, grid, focus and selection styles, the motion helpers); it has no look of
   its own.
2. **The hero (or the primary surface), exactly as the blueprint describes it,** at desktop and at phone
   width. Get the big thing big and the small things small before anything else exists.
3. **Each section from its blueprint,** with this project's content. Keep the geometry, change the
   subject. Neighbouring sections must not share a layout. **Carry the idea into every section,** pricing,
   FAQ and footer included: the commonest failure in the study, even among good sites, is a distinctive
   first screen followed by stock blocks.
4. **Imagery,** in this order of preference:
   1. the project's own;
   2. generated, if you have an image tool;
   3. **real pictures of the subject's world from the open collections,** whenever an honest one exists.
      Search them with `node <skill>/scripts/assets.mjs "<query>"` (Openverse, Wikimedia Commons, the Art
      Institute of Chicago and the Met; only licences that allow commercial use, by default). Search the
      inventory, not the category: its street in old postcards, an old map of the neighbourhood, its
      material up close, its trade in engravings, a museum object of its kind, a botanical plate, a star
      chart. Use them large and with intent: one archival photograph as the hero, an engraving enlarged
      into the surface's motif, the real map of the street as the contact section. Look at each before
      choosing; `--get <ref>` downloads it into `assets/` and records its source and licence, and
      `--credits` prints the credit line for the footer. A found picture shows the world around the client
      and is never presented as the client's own product, room, dish, person or team;
   4. **drawn in code from the subject itself,** for what no honest picture exists of (its objects, its
      tiles, its windows, its product's interface, made as one consistent flat graphic language in the
      palette's real colours);
   5. the photographs dealt on the sheet, only where an honestly generic picture fits (the sea for a sea
      house), never as a stand-in for the subject;
   6. type and colour alone.

   **The floor, which the inspector checks in `page` mode:** at least four real pictures on the surface,
   usually six to twelve (photographs, archival images, maps, engravings, footage, raster artwork; for
   software, its cropped interface fragments count too). SVG drawings do not count toward the floor: draw
   what no picture exists of, and still carry real pictures. Add one moving picture wherever an honest clip
   exists: search it with `assets.mjs --video "<query>"` and use it as a muted loop with a poster frame.
   Models skip pictures and footage because finding them is work; the surface fails without them. In
   `product` mode the floor is replaced by the interface-fragment rule in
   `references/product-surfaces.md` §5.

   `references/imagery.md` covers searching, licences and credits, video, drawing, crops and treatments.
5. **The live thing** from step 4, built into the section where it proves the claim (often the hero or the
   booking), with real content, a thumb-sized phone version and a plain fallback.
6. **Fullness.** Look at each desktop screen as a poster: one dominant thing and the content it carries. A
   screen that is mostly empty ground is an underbuilt section, not a rest; one deliberate rest per
   surface is the limit, and the inspector fails a page with two or more near-empty screens (in `product`
   mode, a legitimately sparse settings screen is allowed). Running text is in the full ink at 16px or
   more; grey is for secondary notes.
7. **States and semantics.** Real links and buttons, visible focus, alt text, loading / empty / error
   states for anything dynamic, a phone layout that is its own composition. `references/accessibility.md`
   is the checklist.

Read `references/type.md`, `references/colour.md` and `references/layout.md` when you need the detail
behind a decision; the laws below are the short form.

### 7. Gate

```bash
node <skill>/scripts/lint.mjs <source files or folder> [--surface page|product]
node <skill>/scripts/inspect.mjs <url or path/to/index.html> [--surface page|product]
```

`lint.mjs` scans source for banned patterns and stock phrases. `inspect.mjs` opens the surface in a real
browser at 1440, 768 and 390 pixels, measures it (headline line counts, type sizes, fonts actually loaded,
colours, rules, shadows, gradients, contrast, overflow, how many elements really move) and saves
screenshots to `.frontend-studio/inspect/`. Fix every `FAIL`. Treat each `WARN` as wrong unless you can
defend it to a designer in one sentence. Re-run until there are no `FAIL`s. Do not argue with the meter and
do not hide things from it. The inspector serves local files over a throwaway local server; if the surface
must also open straight from the file system, open `index.html` that way once before you finish.

### 8. Look

Passing the gate means nothing banned was measured. It does not mean the surface is good. Open the
screenshots the inspector lists (every viewport, with your image viewer or Read tool) and critique them
with `references/critique.md`: the fourteen passes, the Awwwards-weighted score, the caps. Write the
critique down in its format, fix the top three problems, run the inspector again, look again. Three rounds
at most.

Judge only the pictures. If a problem is visible in a screenshot, it is real, whatever the code says.

### 9. Move

Now build the motion layer. In `page` mode it is required, and it is more than one fade: the inspector
counts the elements that really move while the surface loads and is scrolled, and fails a page under eight
(it warns under sixteen). In `product` mode the floor is lower (feedback on controls and state transitions
matter more than entrances) but it is never zero. The layer has four parts:

1. **The signature move** named on the sheet: one, done well.
2. **An entrance for the parts of every section:** the heading, then the text, then the picture, staggered
   by 60–90ms, rising 16–32px with opacity, triggered once as the section enters. Not one fade for the
   whole block, and never content that stays hidden if the script fails.
3. **Feedback on every control:** press, hover and focus on buttons, links, cards and the live thing.
4. **One moving picture:** a found clip as a muted loop, a slow scale or drift on a photograph, or a
   scroll-linked move on the hero picture.

Transform, opacity and clip-path only; every move has a `prefers-reduced-motion` fallback that keeps the
content and drops the travel. A move that changes the colour or the layout of whole screens (colour by
chapter, a pinned story) is part of the composition, so build it in step 6 and let every look round see
it. `references/motion.md` has the tokens, tested vanilla recipes and the framework recipes (Framer
Motion, GSAP, CSS scroll-driven). Then run the inspector once more and check every screenshot for content
that failed to appear.

### 10. Report

Tell the user, briefly: the direction dealt (name and seed) and any redraws with reasons; the idea
sentence and the live thing; the final scores from your last critique round and what still falls short;
every found picture and clip with its title, creator, licence and source page (`assets.mjs --credits`
prints the list) and where its credit sits on the surface; which bundled photographs and which drawings
stand in for photography (so they can be replaced); and any sample content that must be swapped before
launch. Do not claim a check you did not run.

## House rules

These hold on every build in `page` mode, whatever the direction. `inspect.mjs` measures them. The right
column says how `product` mode treats each one; `references/product-surfaces.md` §5 gives the reasoning.

| Rule | Instead | In `product` mode |
| --- | --- | --- |
| **Headlines: two lines or fewer, at every width.** Every `h1`–`h6`, and the main line of the first screen whatever its tag. | Cut words. Then widen the measure. Size last. | Unchanged. |
| **Statements are paragraphs.** An intro sentence or a quotation set large is marked up as `<p>` or `<blockquote>`, stays at statement size (36px or less on desktop, 24px on a phone) and runs to about 25 words, three lines. | Larger than that it is a headline and the two-line rule applies. In blind tests jurors read a 42px sentence over four lines as a four-line headline. | Unchanged. |
| **No eyebrows.** No small label above a heading, no pill badge above the headline, no "New ·" chip. | Put the information in the heading or the first sentence, or drop it. | Falls to a warning: a field label or a panel title above a large figure is a working convention. A kicker above the screen's own title is still an eyebrow. |
| **No monospace** outside real code blocks. | The text face. Tabular figures where numbers align. | Allowed for literal data: IDs, timestamps, hashes, currency columns, log output. |
| **No index numbering.** No 01 / 02 / 03, no (001), no "Step 2". | Order shown by position, size, or the words. A real `<ol>` if order matters. | Allowed when the number is data (a rank, a line number, a row count), never as decoration. |
| **No thin rules.** No hairline dividers, no 1px outlined boxes, no grid lines, crosshairs or crop marks. | Space. A step in background tone. A change of scale. A filled shape. | Allowed inside tables, lists and form fields; not as page ornament between sections. |
| **No gradients.** Not as backgrounds, not on buttons, not in text. | Flat colour, or a real photograph. A neutral scrim under text on a photo is the one exception. | Unchanged. |
| **No shadows on things at rest.** No glows. | A tone step between surfaces. Shadows only on what truly floats: a menu, a dialog. | Allowed on things that really float above the surface: menus, dialogs, drawers, an active drag. |
| **No assistant palette.** No yellow-cream ground with terracotta or rust; no violet or indigo. | The dealt palette. | Unchanged. |
| **No picture on a saturated ground.** Not a photograph, not a clip, not a colour field behind an image. A ground that is both saturated and mid-tone turns every image on it to mud. | The picture goes into a neutral field; the coloured ground carries type and nothing else. The dealt palette names which field in its `pictures` line. | Unchanged. |
| **No tiny uppercase letter-spaced labels.** | Sentence case at a readable size. | Allowed for column headers and field labels at 12px or more, one case, one style. |
| **No icon-topped feature cards, no rows of identical cards.** | The dealt section blueprint. | Compact stat tiles and toolbars are legitimate; a wall of identical tiles is not. |
| **No glass.** No backdrop blur panels, no floating pill navigation. | A plain bar: wordmark, a few links, one action. | A single blurred sticky header is allowed. |
| **No emoji, no gradient blobs, no decorative shapes, no fake dashboards of grey bars.** | A real picture, a real interface fragment, or nothing. | Unchanged. |
| **No styled accent word** in a headline (italic, serif, coloured, underlined). | One face, one colour. The words carry the emphasis. | Unchanged. |
| **Two typefaces at most,** usually one. | The dealt type system. | Three at most: a text face, a heading face, and a data/mono face in the literal-data role above. |

Three places keep their own conventions and are left alone by the inspector: real code in
`<pre>`/`<code>` (monospace is correct there), real tables and form fields (they may have lines), and a
real interface fragment whose root carries the attribute `data-ui` (the product's own borders and menus;
see `references/imagery.md` §7).

Why these, honestly. Some are what the study measured: among the 247 sites, those the panel scored 7.5 or
higher used icon feature cards 1% of the time against 28% for sites under 6.5, pill badges 14% against
34%, gradients 22% against 52%, shadows 24% against 48%, tiny tracked caps 16% against 57%. Others are the
owner's taste and go against current gallery fashion: monospace labels, index numbers and hairline grids
are actually *more* common on award sites than on weak ones, which is exactly why generators imitate them
and why they now read as costume. They are banned here without exception in `page` mode.
`references/tells.md` keeps the dated registry.

Removing ornament leaves space. Never fill it with another ornament. Fill it with scale (make the main
thing larger), with the full content, with a picture made for this subject, or with a field of flat
colour. Leave it empty on purpose once per page at most.

## Laws of the craft

Short form. Numbers are from the study unless marked as house style.

**Type**
- Two or three sizes do the visible work: one very large, one small, nothing in between. Median
  headline-to-body ratio on the studied sites is 4.3; the best go far beyond (largest type: median 8.4vw
  on the top sites against 5.0vw on the weak ones).
- Display type: tracking -0.02 to -0.05em, leading 0.85–1.05. Text: 16–20px, leading 1.45–1.6, 45–75
  characters per line.
- Five sizes on a surface is the ceiling. One family is normal (a third of the studied sites); two is the
  limit.
- Left-aligned by default. Centre at most one moment.

**Space**
- One grid, one pair of tight margins (16–32px), used everywhere; large things run to the edges. Text
  blocks share two or three left edges on the whole surface.
- The gap between sections is clearly larger than any gap inside one: 120–220px on desktop.
- Each section has a different composition from its neighbours; none is a card grid.

**Colour**
- One ground, one ink, one accent. The accent appears on the action and perhaps one other thing.
- **The ink is the neutral value and the accent is the chromatic one.** When a two-tone palette sets both
  roles to the same colour, the accent has nothing left to mark and every word competes at once; the page
  reads as one flat wash. Keeping the pair two-tone does not require that.
- Running text in the full ink. A surface set in soft grey reads unfinished.
- Surfaces are separated by a small step in tone, never by a line (outside `product` mode) or a shadow.
- A section may change the whole field colour. Nothing fades into anything.
- Every palette needs at least one field, so a section can change its ground. A palette with no field can
  only produce bands.
- No photograph on a saturated mid-tone ground, however good the colour is. It reads as mud. Put the
  picture in a neutral field (`references/colour.md` §7).

**Imagery**
- One dominant image beats six small ones. On the top-scored sites the hero media covers at least half the
  first screen 68% of the time.
- Same crop ratios, same treatment, square corners unless the direction says otherwise (73% of the studied
  sites leave media square).
- No image is better than a placeholder, an icon, or an abstract shape. A picture drawn for this subject,
  in its colours and with care, is better than either. A real picture of its world, found and credited, is
  better still.
- Every found picture is downloaded into the project, credited on the surface and listed in the report.
  None is presented as the client's own.
- Nothing ever lies on top of a headline or a statement (the inspector fails it).

**Components**
- Buttons: flat, one fill colour, either square-cornered or fully round, decided once (top sites: 52%
  square, 23% pill; the 9–16px "soft" radius is the weak-site default). Most strong heroes have no button
  at all, or one.
- Navigation: wordmark, three to five plain links, one action. No bar chrome.
- The footer is a designed close, not a sitemap: on most strong sites the name returns at full width.

## Special cases

**An existing brand or design system.** Pass `--keep palette,type`, map the brand's colours and faces onto
the roles, and take only composition from the draw. The house rules still apply; if the brand itself
requires a banned device (its logo sits in a gradient, its accent is violet), keep the brand asset, say so
in the report, and pass `--allow <rule>` to the inspector for that rule only.

**Redesign or review of an existing surface.** Run `lint.mjs` and `inspect.mjs` on it first and report
what they find, then critique the screenshots with `references/critique.md`. For a redesign, draw a
direction and proceed from step 2, keeping the real content and working behaviour.

**A component or a single section, not a whole surface.** Skip the draw unless there is no direction to
follow. Match the surrounding design, apply the house rules and the laws, and still inspect the result.

**A design system or component library.** Treat each documented component as a section: it needs its own
composition, its own states, and a demonstration on realistic content rather than a grey placeholder.
`references/product-surfaces.md` §6 covers the extra rules for catalogue pages.

**Generative or visual art (posters, print, explorable canvas).** This is its own workflow, in
`references/visual-art.md`: name the movement, draw the conceptual seed, then create either a static piece
(PDF/PNG) or a seeded interactive one on the `assets/viewer.html` template. The house rules apply to the
typography and colour of the piece, not to its medium.

**No checkout, no form backend.** The primary button goes to the real destination when the brief names one.
Otherwise it opens an email with a written subject and body (`mailto:` with the visitor's choices filled
in), or, for a shop, it points at `#checkout` and the report says it must be wired before launch. Never
fake a payment form.

**No Chrome or Node 22.** Run `lint.mjs` (Node 18+), take screenshots with whatever browser tool you have,
and critique those. Say in the report that the inspector could not run.

**No network.** If `assets.mjs` reaches no source, draw the pictures and say in the report that the open
collections could not be searched.

## Files

| File | Read it when |
| --- | --- |
| `references/research.md` | The study: method, numbers, what the best and worst sites do. Cite it, do not guess. |
| `references/copy.md` | Writing the argument and the copy deck (steps 2 and 5). The two-line arithmetic, plus the persuasion frameworks (AIDA/PAS/FAB), CTAs, objection handling and proof types. |
| `references/type.md` | Setting type: scales, tracking, measure, loading fonts, pairing. |
| `references/colour.md` | Applying the palette: roles, proportions, tone steps, dark surfaces, contrast. |
| `references/layout.md` | Grid, margins, rhythm, section variety, navigation, footer, the phone composition. |
| `references/imagery.md` | Choosing, finding, crediting, cropping and treating pictures; what to do with none. |
| `references/motion.md` | Step 9. Budget, tokens, vanilla recipes, framework recipes (Framer Motion, GSAP, R3F, CSS scroll-driven), reduced motion. |
| `references/critique.md` | Step 8. How to look, how to score, what to fix first. |
| `references/tells.md` | The dated registry of generated-surface tells and what each is replaced by. |
| `references/product-surfaces.md` | `product` mode. What changes for dashboards, docs, tools and component libraries, and what does not. |
| `references/accessibility.md` | Step 6.7 / 9. Focus, semantics, motion safety, contrast, forms, targets. |
| `references/visual-art.md` | Generative and print work: the philosophy-first workflow and the viewer template. |
| `references/creative-patterns.md` | The pattern library, sorted into what survives the house rules and what is now a dated tell. |
| `scripts/draw.mjs` | Deals and reprints the direction; `--photos`, `--site <id>` for more references. |
| `scripts/assets.mjs` | Step 6.4: searches open collections for real pictures of the subject's world; `--get` downloads with the credit, `--credits` prints them. |
| `scripts/lint.mjs` · `scripts/inspect.mjs` | The gate. |
| `scripts/audit.mjs` | Checks the research library itself — every role legible, every surface visible, every accent distinct from its ink, every palette offering a field, every saturated ground saying where pictures go, every stylesheet link well formed. Run it before changing anything in `library/`. |
| `assets/base.css` · `assets/base.js` | An optional neutral foundation to build on. |
| `assets/viewer.html` | The template for seeded interactive generative art. |
| `library/` | The data the draw reads: directions, heroes, sections, type systems, palettes, photographs, studied sites, motions. Do not read it whole; use the script. |
| `evals/evals.json` | Briefs for testing the skill against a no-skill baseline. |
| `LICENSE-taste-skill` · `NOTICE.md` | Upstream licence, and exactly what came from where. |
| `CHANGELOG.md` | What this version changed, and the verification matrix behind the claims. |
