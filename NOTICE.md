# Provenance and attribution

`frontend-studio` is a derivation. It keeps its own name, scope and reference set, and is built on
material from a second skill. This file records exactly what came from where, so a later reader can
tell an imported decision from a local one.

## Upstream

**taste-skill** — <https://github.com/Leonxlnx/taste-skill>, MIT, Copyright (c) 2026 Leonxlnx.
The licence text is kept verbatim in `LICENSE-taste-skill`. Nothing in that file was modified.

## Imported from taste-skill

| Item | State |
| --- | --- |
| `scripts/lib/cdp.mjs`, `scripts/lib/probe.mjs` | Imported; `probe.mjs` extended (see `CHANGELOG.md`): `checkVisibility` / closed-`<details>` filtering, full-document contrast measurement, `picture-on-colour`, and `canvasArt` detection. |
| `scripts/lib/rules.mjs` | Imported, then extended (see `CHANGELOG.md`): surface modes (`page`, `product`, `art`), `picture-on-colour`, and the mode-gated rules. |
| `scripts/inspect.mjs` | Imported, then extended: `--surface`, `--max-screens`, a surface mode read from the direction sheet, canvas redraw motion tracking, and a mode-aware motion floor. |
| `scripts/lint.mjs` | Imported, then extended: `--surface` (with direction-sheet fallback and per-finding downgrade) and the `fs-ignore` escape comment (upstream name: `taste-ignore`). |
| `scripts/draw.mjs` | Imported, then extended: three new sectors, their default section orders, their role aliases, `--surface`, and the product-mode sheet text. |
| `scripts/assets.mjs` | Imported, then fixed (`--name` extension stripping and stream drain); the request User-Agent was rebranded to `frontend-studio-assets/2.0`, keeping the upstream URL for attribution. |
| `library/directions.json`, `heroes.json`, `sections.json`, `type.json`, `palettes.json`, `photos.json`, `sites.json`, `motions.json` | Imported as the research library, then extended with two directions, three hero blueprints and the product-surface sectors. |
| `assets/base.css`, `assets/base.js` | Imported; only the header comment was rebranded. |
| `assets/viewer.html` | Imported as a scaffold, then largely rewritten (see `CHANGELOG.md`). |
| `references/copy.md` (Part A), `references/motion.md` (Part A), `references/research.md`, `references/type.md`, `references/colour.md`, `references/layout.md`, `references/imagery.md`, `references/critique.md`, `references/tells.md` | Imported, with local additions (see `CHANGELOG.md`). |
| `evals/evals.json` | Imported. |

## Written here, not imported

- `scripts/audit.mjs` — the library gate. `lint.mjs` and `inspect.mjs` came from upstream and keep a build
  honest; nothing was keeping the data honest, which is how it came to hold palettes with nowhere to put a
  photograph and palettes whose accent was the same colour as its ink. Exit 1 on any FAIL.
- `references/product-surfaces.md`, `references/accessibility.md`, `references/visual-art.md` — written for
  this fork.

## Kept from the original frontend-studio

The skill's name and its wider scope: **product surfaces** (dashboards, admin panels, tool UIs,
settings screens, design systems, component libraries) and **generative / visual art**, neither of
which the upstream skill covered. Two reference documents survived the merge by being folded into
their upstream counterparts rather than kept beside them: the original copywriting notes became
`references/copy.md` Part B, and the original motion recipes became `references/motion.md` Part B.

## The dividing line

Upstream is an art-direction skill for **public pages**. Its rules are correct there and wrong on a
working interface: a data table needs its rules, a metric is legitimately monospaced, a rank is
legitimately numbered, a panel title above a figure is a convention rather than a kicker. Rather than
weaken those rules for everyone, this fork makes the distinction explicit and checkable, through the
`page` / `product` surface mode. Every relaxation is listed in `references/product-surfaces.md` §5 and
printed in the tool's own output, so it can never be silent. The ban list both modes share is
unchanged: no gradients, no glow, no emoji, no assistant palette.
