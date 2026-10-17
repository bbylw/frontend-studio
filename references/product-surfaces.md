# Product surfaces

`product` mode. Dashboards, admin panels, tool UIs, data tables, settings screens, documentation sites,
design systems and component libraries.

The original scope of this skill included these and treated them as variations of a landing page. The
study behind this version shows that most of the ornament rules that make a marketing page good are wrong
for a working surface: a table needs its lines, a metric needs its monospace, a settings screen is
legitimately sparse, and a wall of compact tiles can be the correct answer. So the ornament rules relax.
**Everything else stays**, and that is the point of this file: dashboards are the single largest source of
forgettable, interchangeable interfaces, and the reason is never the ornament budget. It is that nobody
decided anything.

## Contents

1. What changes, and what does not
2. Inventory: the software's equivalents of "its street"
3. Where the idea comes from in a product surface
4. Copy for product surfaces
5. The house rules, rule by rule, with the reasoning
6. Design systems and component catalogues
7. The picture floor, replaced
8. Density, tables, states and error copy
9. How product surfaces fail

## 1. What changes, and what does not

**Changes:** the ornament budget (lines, monospace, numbering, tiles, shadows on floating things), the
picture floor, the motion floor, and the emptiness rule.

**Does not change — the procedural core, in full:**

- **Inventory the subject.** Read step 1 of `SKILL.md`.
- **Argue the screen as claims.** Every panel exists because it proves something the reader needs. A
  chart nobody reads is a deleted section.
- **Draw a direction.** `--sector dashboard|docs|component|dev-tool|saas|ai-product`.
- **Find the idea, and pass the competitor test.** "Clean and modern" fails here exactly as it fails on a
  landing page.
- **One live thing.** On a product surface this is usually the product working on real-looking data.
- **Two or three type sizes, far apart.** A dashboard with nine near-equal font sizes is the most common
  failure in the category, and it is the same failure as on a marketing page.
- **One accent, under 5% of any screen.** A status colour system is not an accent; see §5.
- **Build still first, then gate, then look at your own screenshots, then move.**
- **Hierarchy: one dominant thing per screen.** On a working surface that is usually the primary panel or
  the primary figure, not the header.

If you skip the core and only relax the rules, you have produced a template. That is the failure this
file exists to prevent.

## 2. Inventory: the software's equivalents of "its street"

Same discipline as a shop front: eight to twelve things that belong to this product and to no competitor.

| For a shop | For software |
| --- | --- |
| Its name and what the name means | The product's name, and the real word its domain uses (a ledger, a manifest, a roster, a queue) |
| Its street and door number | The industry's existing artefacts: the printed form, the report, the invoice, the log, the ticket, the manifest it replaces |
| The numbers in the brief | The real shape of the data: how many rows, columns, entities, states; the one figure that matters and its unit |
| Its constraint | The product's constraint: read-only, audited, offline, single-account, one-way, real-time, batch |
| Its materials and colours | The domain's colour conventions and where they come from (a chart palette, a status system, a map) |
| Its rituals and hours | The user's workflow: what they do at 9am, what they do once a month, the bulk action, the export |
| Its printed things | The real output the tool produces: the export, the PDF, the receipt, the diff |

Then look for the constraint that makes this tool what it is and could not be removed. That constraint is
usually the best idea on the screen (see §3).

## 3. Where the idea comes from in a product surface

The idea sentence in `SKILL.md` step 4 works unchanged:

> On this surface, **[something that belongs to the subject]** becomes **[the device the direction calls for]**.

The first blank, for software, is usually one of these:

- **Its output as material.** A ledger product shows a real, complete ledger — ruled, totalled, tabular —
  as the hero, not a grey chart. An invoicing tool's hero is an actual invoice you can read.
- **Its object.** Find the physical or conceptual shape of its data and make it the composition: a
  calendar, a swimlane, a map, a queue, a tree, a diff, a stack of statements, a column of periods.
- **Its artefact.** The industry already has a printed object this software replaces. Dress the interface
  as that object and the whole thing stops looking generic at once.
- **Its constraint.** Read-only becomes the design: nothing editable, every number a settled statement.
  Real-time becomes the design: the timestamp is the largest thing on the screen.
- **Its unit.** The one figure the user actually watches, made enormous, with everything else in support.
- **Its decision.** What the user came to decide, shown as the composition: two options and their
  consequences, not a settings form.

**The competitor test for software:** put the nearest tool in the same category into the sentence. If it
still works — a bar chart of monthly revenue is every finance tool — the idea belongs to the category.
Keep looking.

## 4. Copy for product surfaces

`copy.md` Part B (AIDA, PAS, emotional triggers) does not apply to a working surface. Its Part A does,
plus the software equivalents:

| Surface text | Its job | Rules |
| --- | --- | --- |
| Screen title | Say where the user is, in one to three words | A noun, sentence case, no "Welcome to your…" |
| Section heading | Say what the block is | "Invoices", not "Your invoice activity at a glance" |
| Column header | Name the field exactly as the domain does | No invented synonyms; sentence case; one unit, in the header, once |
| Empty state | Say what is missing and what to do | "No invoices yet — import a CSV or create one." Never an illustration of a sad folder |
| Error message | Say what happened, which value, and what to do | "Amount (row 12): must be a number. Line totals will not add up until it is fixed." No "Something went wrong." |
| Confirmation | Say what will happen, irreversibly if so, and name the action on the button | "Delete 34 invoices? This cannot be undone." Button: "Delete 34" |
| Helper text | Only where the field is genuinely ambiguous | One line, muted, under the control — and it is not an eyebrow (§5) |
| Button | Name the action | "Export CSV", not "Submit"; "Apply filters", not "Go" |
| Loading | Say what is loading and how long it takes | After about a second, a progress statement, not a spinner forever |
| Numbers | Real, and adding up | Trailing figures must reconcile across the screen; a total that does not equal its parts is the fastest way to lose trust |

**No marketing voice inside the product.** "Supercharge your workflow" belongs on the landing page, not
in a toolbar. The register of a working surface is the register of a well-printed form: exact, quiet,
consistent. Let the typeface and the composition carry the character.

## 5. The house rules, rule by rule, with the reasoning

`inspect.mjs --surface product` and `lint.mjs --surface product` implement exactly this.

| Rule in `page` mode | In `product` mode | Why |
| --- | --- | --- |
| Headlines ≤ 2 lines | **Unchanged, FAIL** | A dashboard title wrapping to three lines pushes the working area off the first screen. |
| Statements are paragraphs | **Unchanged** | An oversized intro sentence still reads as a headline. |
| No eyebrows | **Relaxed to a warning** | A panel title above a large figure, or a `<label>` above its control, is a working convention — the detector cannot tell it from a decorative kicker, so it warns. A kicker above the screen's own title is still an eyebrow. |
| No monospace | **Relaxed to allowed, in the literal-data role** | IDs, timestamps, hashes, currency columns and log output are genuinely tabular and genuinely literal. Monospace as a *voice* — a mono nav label, a mono caption, a mono "technical" kicker — is still banned. |
| No index numbering | **Relaxed where the number is data** | Row numbers, ranks, line numbers and counts are information. `01 / 02 / 03` decorating a list of three features is still banned. |
| No thin rules | **Relaxed inside tables, lists and fields** | A table without its rules is unreadable, and a `divide-y` list is often the correct dense form. Hairlines as *page ornament* between sections are still banned. |
| No gradients | **Unchanged, FAIL** | There is no case for them here either. If a chart needs a gradient fill to read, the chart is wrong. |
| No shadows at rest | **Relaxed to things that float** | Menus, dialogs, drawers, popovers, a dragged row and a sticky header cast a shadow; a resting panel does not. |
| No assistant palette | **Unchanged, FAIL** | Violet and cream-and-terracotta read as generated in a product too. |
| No tiny uppercase tracked labels | **Relaxed to column headers and field labels, 12px+, one style** | Dense tables need a compact label row. One style, consistent, sentence case where it fits. |
| No icon-topped feature cards | **Relaxed to compact tiles and toolbars** | A row of stat tiles is a legitimate dense form; twenty identical cards in a grid is not. |
| No glass | **Relaxed to one blurred sticky header** | Sticky chrome over scrolling data genuinely benefits. Glass *cards* are still a tell. |
| No emoji / blobs / fake dashboards | **Unchanged, FAIL** | A fake dashboard of grey bars is worse in a product than anywhere else. |
| No styled accent word | **Unchanged** | — |
| ≤ 2 typefaces | **Relaxed to 3** | The third is the literal-data face from the monospace row. It counts as one role, used one way. |

Two more rules that only exist in `product` mode:

- **Every control must do something a visitor can see.** A filter that does not filter, a tab that reveals
  nothing, a button with no handler — remove it or wire it. A dead control is a tell of a mock-up.
- **The numbers must reconcile.** Totals equal their parts, percentages sum sensibly, dates are ordered,
  units are stated once. Jurors and users both check, and a wrong figure invalidates the whole screen.

## 6. Design systems and component catalogues

A component catalogue is a public page that happens to be about software. Treat each documented component
as a section:

- **Its own composition,** not the same card repeated for each component. A button specimen, a form
  specimen and a data-table specimen do not look alike.
- **Real content in every specimen.** A component demonstrated on "Lorem ipsum" is a component nobody has
  seen work. Use the product's own vocabulary and real-looking values.
- **Every state shown once,** in this order of prominence: default, hover, focus, active, disabled,
  loading, error, empty. Focus states are the ones catalogues forget and the ones that matter most.
- **The scale, the spacing and the radius stated as numbers,** once, in one place. If the catalogue says
  16px and the product uses 14px, the catalogue is already wrong.
- **The catalogue's own chrome follows the house rules.** It is very easy to build a beautiful car and a
  generic showroom.
- **One live thing:** a specimen the reader can actually operate (type in the field, toggle the switch,
  sort the table) is worth more than a screenshot of it.

## 7. The picture floor, replaced

`page` mode requires four real pictures. A dashboard has none and should have none. In `product` mode the
rule becomes:

- **Show the real interface, built in HTML, at true size, with believable content** — real labels, numbers
  that add up, one item hovered or selected, correct alignment. This is `imagery.md` §7, and it is the
  product-surface equivalent of a photograph of the thing. Mark the fragment's root with `data-ui` so the
  inspector judges the page around it and not its own control borders.
- **A fake dashboard of grey bars is worse than no image.** Grey rectangles standing in for text are the
  single clearest generated-surface tell.
- **Photographs still belong** wherever there is a real world around the software: the place, the people,
  the material, the trade the tool serves. Use the open collections (`assets.mjs`) exactly as in `page`
  mode, and credit them. A tool for a fishing fleet may legitimately carry one archival photograph of the
  harbour.
- **Drawings beat screenshots** for abstract concepts: the shape of the data, the flow of the process, the
  parts of the system, drawn as one consistent flat graphic language in the palette's colours
  (`imagery.md` §8). Do not download a stock "isometric technology illustration".

## 8. Density, tables, states and error copy

**Density.** Compact is not crowded. Row height 36–44px, 12–16px vertical padding in cells, one gutter
value reused everywhere. Dense information needs *more* alignment discipline, not less: pick the anchor
lines and keep them.

**Tables.** Right-align numbers and use `font-variant-numeric: tabular-nums`, so columns scan vertically.
Left-align text. Keep the header row visible when scrolling (sticky). Sort direction shown on the active
column, and only one column sorted. Zebra striping is a substitute for good rows and column spacing; use
it only when the rows are very wide.

**States.** Every list, table and panel has four: loading (a skeleton of the real shape, never a spinner
covering the layout), empty (what is missing and what to do), error (what failed and what to do), and
full. `accessibility.md` §5 has the ARIA for the dynamic ones.

**Motion in `product` mode.** The floor is lower than on a marketing page, and the priorities invert:
feedback on controls and transitions between states matter far more than entrance choreography. Interactive
latency budgets are in `motion.md` Part A §2: press 100–160ms, hover 150–200ms, menus 150–250ms, dialogs
250–450ms. **Never animate a value the user is reading** — a KPI that counts up every time you glance at
it is noise. And never animate layout properties in a data grid; a table that reflows on every keystroke is
unusable.

**Charts.** One message per chart. No 3-D, no gradients, no drop shadows, no decorative gridlines. Label
the axis the reader needs and no more. Colour carries meaning once, in a legend or directly on the series.
The palette's accent is not a chart colour; a chart series palette is a separate, documented thing.

## 9. How product surfaces fail

The same list as `layout.md` §9, translated:

- **The catalogue's own template.** Swap the logo and the screen could be any tool in the category. (The
  most common failure, exactly as in the study.)
- **A distinctive header, then a stock widget grid** — KPI tiles, a line chart, a table, a settings pane,
  in that order, deciding nothing.
- **Nine near-equal type sizes,** so nothing leads.
- **A grey placeholder where content should be** — grey bars, "Chart", "Image here".
- **Empty screens that are empty by accident,** not as a rest: a filter panel with three controls on an
  otherwise blank page.
- **Nothing states what the screen is for** and what the primary action is.
- **The numbers do not reconcile.**
- **Dead controls.**
- **Accent colour spread over statuses, badges, links, headers and charts at once,** so it means nothing.
- **The phone is the desktop squeezed:** a horizontally scrolling table with no alternative, a sidebar
  that covers the content, touch targets under 44px.
