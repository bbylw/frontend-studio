# Words

Copy is the first design decision. A headline that needs four lines cannot be rescued by typography,
and a page of slogans cannot be rescued by layout. Write the page as plain text before any markup.

## Contents

Part A — the words themselves

1. Write the argument first
2. The two-line headline (with the character budget)
3. Headline shapes that work
4. Supporting line, body, buttons
5. Proof without inventing it
6. Things that read as generated
7. Micro-typography

Part B — persuasion, for surfaces whose job is to sell

8. The four jobs of marketing copy
9. Frameworks: AIDA, PAS, FAB, BAB
10. Calls to action
11. Emotional triggers, used sparingly
12. Objection handling
13. Proof types and where they go
14. Section-by-section copy guide

Part B is for landing pages, marketing sites and product pages. A documentation page, a dashboard or a
component catalogue does none of this: their copy is the content itself (see §14, and
`product-surfaces.md` §4 for the software equivalents). Never let Part B override Part A — an AIDA
headline that runs to four lines has already failed.

## 1. Write the argument first

Answer in one line each, in a scratch note:

- Who is reading, and what do they already know?
- What is this, said the way its maker would say it to a friend?
- What single thing should the reader believe after one screen?
- What would make them believe it (a picture of the thing, a number, a name, a demonstration)?
- What do they do next?

Then list the page as claims, one per section, each with its proof:

```
1. It is a three-legged oak stool, made to order.             → the stool, large
2. Each seat is cut from one board, so the grain is yours.    → three close-ups
3. It takes six weeks, and you can follow it.                 → the stages, photographed
4. It costs 240 and is delivered by the maker.                → price, button
```

A section with no claim is filler; delete it. This is also how you escape the stock order of
hero, logos, features, testimonial, pricing, call to action: the order of the argument is the order of
the page.

## 2. The two-line headline

A headline is a title. It is held in one glance. On the studied gallery sites the hero headline has a
median of 5 words and 70% sit on one or two lines at desktop width. Every headline on your page, at
every viewport, fits in **two lines or fewer**. `inspect.mjs` measures this at 1440, 768 and 390 pixels
and fails the page otherwise.

The constraint is arithmetic, so do it before you fall in love with a sentence:

```
characters per line ≈ line width in px ÷ (font size in px × k)

k ≈ 0.40  condensed faces
k ≈ 0.50  most grotesks and serifs at display size, tight tracking
k ≈ 0.58  wide / extended faces, all-caps settings
```

| Where | Line width | Size | Per line | Two-line budget |
| --- | --- | --- | --- | --- |
| Phone 390, 20px gutters | 350px | 44px | ~16 | **~32 characters** |
| Phone 390, 20px gutters | 350px | 34px | ~21 | ~42 characters |
| Tablet 768 | 690px | 64px | ~22 | ~44 characters |
| Desktop, 12-col measure | 1100px | 104px | ~21 | ~42 characters |
| Desktop, half width | 620px | 72px | ~17 | ~34 characters |

So a hero headline of **about 32 characters or fewer** (four to six words) survives everywhere at a
confident size. Up to about 42 works if the phone size comes down to the mid-30s. Past that you are
writing a sentence; move the rest into the supporting line.

Controlling the break:

- Give the headline a `max-width` in `ch` so it breaks where you intend, and add
  `text-wrap: balance` so two lines come out even.
- Where the break matters (it usually does), author it: `Stools for<br> small kitchens`. Check the
  phone screenshot; if an authored line wraps there, hide the `<br>` under a breakpoint or shorten.
- Never fix a long headline only by shrinking it. A timid 28px headline of nine words is worse than
  five words at 64px.
- Avoid a single orphan word on line two. Rebalance by cutting a word, not by nudging the width.

Section headings follow the same rule and are shorter: two to five words.

**A statement is not a headline.** An intro sentence or a quotation set large (the manifesto line
after the hero, a testimonial) is a paragraph: mark it up as `<p>` or `<blockquote>`, keep it to about
25 words, and set it at statement size, which the inspector takes as 36px or less on desktop, 32px on
a tablet and 24px on a phone. It may then run to about three lines (four on a phone). Set larger than
that, or marked up as a heading, or placed as the main line of the first screen, it is a headline and
gets two lines. In blind judging, a sentence set big over three or more lines was read as a long
headline every time, whatever its markup; if the words matter that much, cut them to a two-line
headline instead.

## 3. Headline shapes that work

All seen repeatedly on the gallery sites. Pick the plainest one that is true.

- **The name.** The brand or the person, set very large, with a one-line description elsewhere.
  Strongest when the name is short and the subject is visual (studios, restaurants, hotels, people).
- **What it is.** "A vinyl shelf in your pocket." "Furniture for small rooms." Category, stated with
  one specific word.
- **The claim.** "Your bank won't do this." One sentence a competitor could not sign.
- **The instruction.** "Understand your money." Verb first, short.
- **The place or the moment.** "Antarctica." "Lisbon, since 1984." For hospitality, events, travel.

Shapes to avoid, because they are the average of every landing page:

- The mad-lib: "The AI-powered platform for modern teams".
- The tricolon: "Fast. Simple. Secure." or "Plan. Build. Ship."
- The correction: "It's not just a tool, it's a workflow". Also "More than a …".
- "X, reimagined / redefined / made simple". "Welcome to …". "Meet …" for a product nobody has met.
- A question the reader did not ask.
- A headline that needs its colon: "Ledgerly: invoicing for freelancers". Drop the name, it is in the
  navigation.
- One word of the headline styled differently (italic, serif, coloured, underlined, in a pill).

Sentence case. No full stop unless the direction's voice uses them everywhere.

## 4. Supporting line, body, buttons

**Supporting line.** One sentence, at most about 22 words, that says concretely what the thing is and
who it is for. It is where the detail cut from the headline goes. It never repeats the headline in
other words.

**Body.** Short paragraphs of plain statements. Prefer the specific noun and the real number: "ships
in a week" over "fast delivery"; "38 seats" over "intimate". Read every sentence and ask whether a
different company could print it unchanged; if so, sharpen it or cut it.

**Buttons.** Name the action or the thing: "Book a table", "See the plans", "Download for Mac".
One to three words. The primary action keeps one name everywhere on the page. One primary button per
screen; a second action is a plain text link. No arrow glyph on every link and button; at most one
arrow, on the primary action, if the direction uses arrows at all.

**Navigation.** The wordmark, up to five plain links, one action. Link labels are single nouns.

## 5. Proof without inventing it

Never invent customers, quotes from named people, press logos, user counts, ratings or benchmarks.
Invented proof is both dishonest and a recognised tell.

When the brief supplies no proof, use what is true by construction:

- Show the thing itself, large. A real demonstration outranks any quote.
- State how it works, specifically.
- Use facts from the brief (price, place, year, materials, what is included).
- If a testimonial or logo section is explicitly requested and no real ones exist, build the section
  with plainly fictional sample content and say so in your final report so it is replaced before
  launch. Do not put real company names or real people in it.

**Sample details are different from proof, and they are expected.** Where the brief gives the shape of
the content but not every detail (six rooms "from €140", "a short menu", twelve speakers), write the
full set of plausible details: each room with a name, a bed, a view and its own rate; each dish with
its price; each speaker with a talk title. A design can only be judged at its real density, and a page
that shows one rate where six rooms exist looks unfinished. List every sample detail in the report so
the client confirms or replaces it.

## 6. Things that read as generated

`lint.mjs` flags most of these.

- Verbs and adjectives of the genre: unlock, unleash, supercharge, elevate, empower, streamline,
  seamless, effortless, robust, cutting-edge, next-generation, world-class, all-in-one, blazing fast.
- Labels pretending to be editorial: "Field notes", "The details", "Our philosophy", "Quietly trusted
  by". A section heading can simply be "Pricing".
- Furniture text: locale or time strips, "Est. 2024", coordinates, version stamps, "Scroll", "(Scroll
  to explore)", fake photo credits, status lines such as "Available for work" with a dot, strings of
  words separated by middle dots or slashes.
- The em dash as a habit. One or two on a page read as writing; ten read as a model. Use a full stop.
- Explainer captions that narrate the design: "A clean, minimal layout for…".
- Step labels that duplicate numbers: "Step 1", "Phase 02".
- Three parallel items everywhere: three features, three stats, three steps. Use the number the
  content has.

## 7. Micro-typography

- Curly quotes and apostrophes (“ ” ’), a real ellipsis (…), an en dash for ranges (9–5).
- Non-breaking space between a number and its unit, and before the last short word of a headline
  when it would otherwise orphan (`&nbsp;`).
- `font-variant-numeric: tabular-nums` where numbers line up in columns (prices, tables).
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- No all-caps for anything longer than three words; if you set caps, add 0.02–0.06em tracking.
- No text under 13px. No centred paragraphs longer than three lines. No justified text.

---

# Part B — persuasion

For surfaces whose job is to move someone to act. Frameworks are scaffolds, not scripts: pick the one
whose argument matches the brief, then write the section list with §1's claim-and-proof table. A
framework that produces sections with no claim is the stock sequence arriving by another road.

## 8. The four jobs of marketing copy

Every line on a selling surface does one of these, and nothing else:

1. **Grab attention** — the headline's job, and only the headline's.
2. **Create desire** — show the after-state, not the mechanism.
3. **Remove friction** — price, effort, risk, doubt, one at a time.
4. **Prompt action** — one named action, repeated verbatim.

If a line serves none of the four, cut it. If a whole section serves none, the section goes (that is §1's
rule again, arriving from the other side).

## 9. Frameworks

Pick by what the subject is and what the reader already believes.

| Framework | Shape | Use when |
| --- | --- | --- |
| **AIDA** | Attention → Interest → Desire → Action | Landing pages, launches, email. The default when the reader does not yet know the product exists. |
| **PAS** | Problem → Agitate → Solution | Pain-driven products: the reader already feels the problem and needs it named sharply. Agitate means "state the cost of the status quo concretely", not "pile on adjectives". |
| **FAB** | Feature → Advantage → Benefit | Product pages and comparisons where the capability is real and specific. FAB fails the moment a feature is generic; keep it for genuine differences. |
| **BAB** | Before → After → Bridge | Transformations (a service, a course, a health product). The Bridge is the product; the Before must be recognisable, not caricatured. |

Two rules that override the framework:

- **The order of the argument is the order of the page** (§1). If PAS needs the solution before the
  pricing, so be it; do not staple a stock order onto a framework.
- **Length follows the claim count.** A three-claim product is a three-section page. Do not pad to look
  complete; the study's strongest sites carry as few as 200 words.

## 10. Calls to action

Name the action or the thing, in one to three words: "Book a table", "See the plans", "Download for Mac".
One primary action per screen, and it keeps one name across the whole surface — a button that says "Get
started" in the hero and "Sign up" in the footer is two different products to a reader.

| Instead of | Write |
| --- | --- |
| Submit / Send | Book my table / Reserve the room |
| Click here | See the full menu |
| Learn more / Read more | See how the kiln works |
| Sign up / Get started | Start my 14-day trial |
| Download | Download the price list |

The primary action is a real button on the first screen (a filled or solid-bordered control, 44px or
taller), not a link in the navigation. A second action is a plain text link. At most one arrow glyph on a
surface, on the primary action, if the direction uses arrows at all.

## 11. Emotional triggers, used sparingly

| Trigger | The honest form | The dishonest form, never used |
| --- | --- | --- |
| FOMO / scarcity | A real limit: "one batch a month", "twelve places" | Invented countdowns, "only 3 left" that is never true |
| Cost of delay | What the reader actually keeps losing | Threatening copy about a problem they do not have |
| Status | Who this is genuinely for | "Join 10,000+ teams" when nobody counted |
| Ease | "Ready in ten minutes" | "Effortless" |
| Frustration | The specific annoyance the product removes | "Tired of tools that deliver nothing?" |
| Hope | A concrete outcome with a number | A promise the product cannot keep |

One or two per surface, placed where the reader's doubt peaks. A trigger without a fact behind it is both
dishonest and the nearest thing to a generated-page signature. Everything here is subject to §5: **never
invent proof.**

## 12. Objection handling

Answer the objection before the reader has to think of it, in its own section if it deserves one, in a
FAQ if there are several. State the objection in the reader's words, then answer with a fact.

| Objection | Answer with |
| --- | --- |
| "Too expensive" | What it replaces, over what period (a real figure from the brief) |
| "Won't work for my case" | The closest real case; if there is none, say what it does not do |
| "No time to learn it" | The measured setup cost, or nothing |
| "What if it goes wrong" | The actual policy: returns, warranty, cancellation |
| "I need to think" | Nothing. Manufactured urgency is a tell. |
| "I already use X" | The one real difference, stated without disparaging X |

Where they sit: in the section whose claim raises the doubt, or in the FAQ if several. An objection
answered in a comparison table needs the table to be true — no straw-man columns.

## 13. Proof types and where they go

Weakest to strongest, for a public surface:

1. **Adjectives** — "premium", "trusted". Worth nothing; delete.
2. **A number about the maker** — years, seats, batch size, delivery time. Cheap, true, useful.
3. **The thing itself, shown large** — a real demonstration outranks any quote.
4. **A named person's quote** with their role and where they are from. Only if it is real.
5. **A case with before and after** and a measured result.
6. **A third-party fact** — an award, a certification, a press piece, a licence. Only if real.

A testimonial or logo section that the brief requests but cannot supply is built with **plainly fictional
sample content** and flagged in the report so it is replaced before launch — no real company names, no
real people, no real logos. A star rating with no source is invented proof and §5 forbids it.

## 14. Section-by-section copy guide

| Section | Its one job | Length | Failure mode |
| --- | --- | --- | --- |
| Hero headline | Say what this is, in a title of about five words | ≤ 2 lines | A slogan with no information, or a four-line sentence |
| Supporting sentence | Who it is for and the one concrete detail | ≤ 22 words | Repeating the headline in other words |
| Intro / manifesto | The claim that makes this different | ~25 words, statement size | Set at display size so it reads as a second headline |
| Features / how it works | What it does, one claim per row, with the specific noun | 1–3 sentences each | Three parallel items with generic verbs |
| Proof / testimonial | Remove the doubt a named source can settle | One quote, one line of attribution | Invented quotes, logo walls with no permission |
| Stats | The numbers from the brief that mean something | The real count of figures | Three numbers that all end in 0 and mean nothing |
| Pricing | What you get, what it costs, what is not included | Full, including the exclusions | One plan shown where several exist |
| FAQ | The real questions, answered plainly | 4–8, honest | Questions nobody asked, answered with slogans |
| CTA | The one action, named for what it does | One button, one sentence | "Get started" as the only text on the section |
| Footer | Practical facts and a designed close | Address, hours, contact, legal | Link-column sitemap with no design |

For a **product surface**, the same table in software terms — panel, table, inspector, empty state, error
copy, confirmation — is in `product-surfaces.md` §4.

