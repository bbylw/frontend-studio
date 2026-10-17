# Accessibility

Nothing here is optional, and nothing here is in tension with the design rules — in the study the top
sites are not worse at usability than the rest, and the ways they fail (tiny text, hidden navigation,
text lost over busy pictures) are all avoidable. Accessibility is also the cheapest quality signal there
is: a surface with visible focus, honest alt text and 44px targets reads as made by someone who cares,
before anyone reads a word.

`inspect.mjs` measures the mechanical parts (contrast, text under 13px, horizontal overflow, touched or
clipped text, whether anything large sits on top of a headline). The rest is on you.

## 1. Colour and contrast

- Body text at least 4.5:1 against its ground; display type and large numerals at least 3:1.
- The drawn palettes meet 7:1 for ink on ground. The inspector **fails** anything under 2.6:1 and warns
  below the required ratio.
- Text over a photograph cannot be measured by the inspector — check it in the screenshots yourself. If
  there is no calm region, move the text off the image or add the neutral scrim from `colour.md` §7.
- Never use colour alone to carry meaning. A status is a colour **and** a word or a shape; a chart series
  is a colour **and** a label or a direct annotation.
- Focus and hover states raise contrast, never lower it. Do not fade disabled text to the point where it
  cannot be read — it still has to be legible enough to explain why it is disabled.

## 2. Type and reading

- Nothing meant to be read goes below 13px (`inspect.mjs` fails more than three such blocks). 16px is the
  body floor for running text.
- Measure 45–75 characters per line. The inspector warns past about 88.
- Do not centre paragraphs longer than three lines, and do not justify text.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs; `hyphens: none` on headings.
- Zoom to 200% must not break the layout: use relative units and a real grid, and check the 390px
  screenshot for overflow.
- `<html lang="…">` set correctly. Sentence case beats ALL CAPS for anything longer than three words.

## 3. Semantics

- One `<h1>`; headings nest in order, never skipping a level to get a size. If a heading needs to look
  smaller, style it — do not demote it.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`, and `<section>` with a heading or
  `aria-labelledby`. One `<main>`.
- Links are links (`<a href>`), buttons are buttons (`<button>`), and a control that navigates is not a
  `<div>` with a click handler. If it must be, it needs `role`, `tabindex="0"` and Enter/Space handling.
- Lists are `<ul>`/`<ol>`; a table of data is a real `<table>` with `<th scope>`, not a grid of divs.
- The order of the DOM is the order of reading. Do not reorder with CSS alone.
- Every interactive element has an accessible name. Icon-only buttons get `aria-label`; an SVG icon is
  `aria-hidden="true"` unless it is the only content.

## 4. Images and media

- `alt` describes what the picture shows, in plain words: "Hand-coloured engraving of a fig cut open,
  with its flowers and seeds". Not "image", not the file name, not a caption repeating the paragraph.
- A decorative repeat (the same ornament three times) gets `alt=""` and, if useful, `aria-hidden`.
- Always set `width` and `height` (or `aspect-ratio`) so nothing jumps while loading; `loading="lazy"`
  everywhere except the hero image, which gets `fetchpriority="high"`.
- A `background-image` that carries meaning cannot be read by assistive technology; if it means something,
  it is an `<img>`.
- Video that autoplays is muted, `playsinline`, has a poster frame, carries `aria-hidden="true"` when it is
  decoration, and stops under reduced motion (`imagery.md` §11 has the script).

## 5. Dynamic content

- `aria-live="polite"` on a region that updates on its own (a filtered count, a save confirmation). Use
  `assertive` only for errors the user must know now.
- Loading skeletons get `aria-busy="true"` on the container and a text alternative; never leave a screen
  reader in a region that changed silently.
- Toasts and inline validation messages are announced, tied to their field with `aria-describedby`, and
  appear next to the control, not only at the top of the form.
- `prefers-reduced-motion: reduce` means fewer and gentler, not none: keep opacity and colour changes,
  drop travel, scale, parallax and autoplay. Every recipe in `motion.md` is written so the reduced state
  is simply the finished state.
- Never flash content more than three times per second (seizure risk). No strobing, no rapid invert.

## 6. Forms

- A visible `<label>` for every field, tied with `for`/`id`. A placeholder is not a label.
- Label above the control; the hint text between them; the error below, in the error colour **and** words,
  with the reason and the fix (`product-surfaces.md` §4).
- Group related controls with `<fieldset>` and `<legend>` when the group needs a name.
- Do not block paste. Do not clear a field on error. Keep what the user typed.
- Mark required fields in text, not by colour alone. Validate on blur or submit, not on every keystroke.
- Errors are summarised at the top of a long form **and** attached to the field, with a link to it.

## 7. Keyboard and pointer

- Everything reachable operates works with the keyboard alone, in a sensible order, with a visible focus
  ring. Never `outline: none` without an equally visible replacement.
- Focus ring: `outline: 2px solid var(--accent); outline-offset: 2–3px`. Use `outline`, not `box-shadow`
  (a box-shadow ring disappears in forced-colours mode).
- A modal, dialog, drawer or menu traps focus while open, closes on `Esc`, and returns focus to the
  trigger on close. A morph animation (`motion.md` Part B §9) is a dialog and obeys this.
- Skip link to `<main>` as the first focusable element on a long page.
- Touch targets at least 44×44px, with at least 8px between them.
- Hover styles behind `@media (hover: hover) and (pointer: fine)` so touch devices do not fire hover on
  tap and leave it stuck.
- No custom cursor, no scroll hijacking, no drag-only interaction without a keyboard alternative.

## 8. The two-minute self-check

Before you report the work done, tab through the whole surface once with the mouse untouched, then:

- [ ] Focus is visible at every step and never lost.
- [ ] Every image has alt text you would be happy to read aloud.
- [ ] Every control has a name a screen reader would announce correctly.
- [ ] One `<h1>`, headings in order.
- [ ] Contrast passes on the real colours, including text over photographs.
- [ ] Reduced motion kills the travel and keeps the content.
- [ ] 390px: no horizontal overflow, no target under 44px, no text under 13px.
- [ ] Keyboard-only, the primary action is reachable without scrolling past the navigation.
