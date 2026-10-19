#!/usr/bin/env node
// frontend-studio / mock — render a cheap, single-file sketch of the dealt direction.
//
//   node mock.mjs [--out DIR] [--init] [--json]
//
// Why this exists: a full build is the expensive artifact in the run. Until now the first thing a
// person saw was the finished page, so a direction they did not want cost the whole build to discover.
// This renders the same direction as one static HTML file — real palette, real type, the hero at its
// blueprint size, one skeleton per section in the argument order — in a few seconds. Approve or redraw
// here, then build once.
//
// It reads `.frontend-studio/direction.json` (written by draw.mjs) and `mock.json` (the words, which
// this script never invents). Palette, type and hero geometry come from the sheet, so what is on screen
// is the dealt direction and not a set of colours picked by hand.
//
// Deliberately absent, because each one costs time and none of them is needed to answer "is this the
// direction?": photographs, footage, motion, interactive states, real body copy, responsive polish
// beyond the two breakpoints the sketch uses. Do not run inspect.mjs on the output — it is a sketch,
// and the gate's floors (four pictures, a motion layer) belong to the build.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) {
  console.log(`usage:
  node mock.mjs [--out DIR] [--init] [--json]

  reads   .frontend-studio/direction.json   (the dealt direction, from draw.mjs)
          mock.json                         (the words; written for you on the first run)
  writes  mockup.html                       (one static file, Tailwind Play CDN, no build step)

  --init   rewrite mock.json from the sheet, discarding edits
  --out    where to write (default: the sheet's directory)
  --json   print the derived config and write nothing`);
  process.exit(0);
}
const flag = (name, def) => { const i = args.indexOf('--' + name); return i === -1 ? def : args[i + 1]; };
const asJson = args.includes('--json');

// ---- find the sheet, the same way inspect.mjs does
const here = resolve('.');
const candidates = [
  join(here, '.frontend-studio', 'direction.json'),
  join(here, 'direction.json'),
];
let sheetPath = candidates.find((p) => existsSync(p));
let sheet = null;
if (sheetPath) { try { sheet = JSON.parse(readFileSync(sheetPath, 'utf8')); } catch { sheet = null; } }
if (!sheet) {
  console.error('No direction sheet found. Run draw.mjs first — it writes .frontend-studio/direction.json.');
  console.error('  node draw.mjs --sector <sector> --brief "..." --sections <roles>');
  process.exit(2);
}

const outDir = resolve(String(flag('out', dirname(sheetPath))));
mkdirSync(outDir, { recursive: true });

// ---- what the sheet gives us
const pal = sheet.palette || null;
const typ = sheet.type || null;
const hero = sheet.hero || null;
const surface = sheet.surface || sheet.input?.surface || 'page';
const roles = sheet.input?.sections?.length ? sheet.input.sections : (sheet.sections || []).map((s) => s.role);
const brief = sheet.input?.brief || '';

// The hero's display size. Blueprints state it three different ways, so try in order of how much the
// sheet actually commits to: a clamp written for the headline, a vw figure for the headline, then the
// type system's own head step. Never silently: the run prints which of the three was used, because a
// sketch whose headline is sized from a fallback is judging a composition the sheet did not specify.
function heroSize() {
  const b = hero?.blueprint || '';
  const anchor = b.search(/headline|wordmark|the name|title/i);
  const near = (m) => anchor >= 0 && Math.abs(m.index - anchor) < 220;
  if (b) {
    const clamps = [...b.matchAll(/clamp\([^()]*\)/g)];
    const hit = clamps.find(near) || null;
    if (hit) return { value: hit[0], source: 'the hero blueprint (clamp)' };
    const vw = [...b.matchAll(/(\d{1,2}(?:\.\d+)?)\s*vw/g)].filter(near);
    if (vw.length) {
      const n = Math.max(...vw.map((m) => parseFloat(m[1])));
      return { value: `clamp(2rem, ${n}vw, 15rem)`, source: `the hero blueprint (${n}vw, capped so it cannot overflow)` };
    }
  }
  // A section-heading step is the wrong register for a hero, so the last resort is a display size of its
  // own, labelled as such. The sheet still decides the family and the tracking; only the size is a default.
  return { value: 'clamp(2.6rem, 8vw, 8rem)', source: 'a display default — neither the blueprint nor the type system stated a hero size' };
}
const { value: heroPx, source: heroPxSource } = heroSize();

const paletteTokens = pal ? [
  ['bg', pal.bg], ['surface', pal.surface], ['ink', pal.ink], ['muted', pal.muted],
  ['accent', pal.accent], ['accent-ink', pal.accentInk],
  ...(pal.fields || []).flatMap((f, i) => [[`field${i + 1}`, f.bg], [`field${i + 1}-ink`, f.ink]].filter(([, v]) => v)),
].filter(([, v]) => v) : [];

const fontFamilies = typ ? {
  display: [typ.display?.family, ...(typ.display?.family ? ['Georgia', 'serif'] : [])].filter(Boolean),
  text: [typ.text?.family, 'system-ui', 'sans-serif'].filter(Boolean),
} : null;
const fontLinks = typ ? [...new Set([typ.display?.css, typ.text?.css].filter(Boolean).flatMap((c) => c.split('\n')))].filter(Boolean) : [];

// ---- the words: mock.json, never invented here
const mockPath = join(outDir, 'mock.json');
const starter = {
  note: 'Fill every string. Short on purpose: a headline, one sentence, one action, one line per section. The sketch exists so the direction can be judged in seconds; write the full content later, in step 5.',
  headline: 'HEADLINE — the real one, two lines at most',
  lead: 'One sentence that says what this is.',
  action: 'The one action',
  sections: roles.map((r) => ({ role: r, heading: `HEADING — ${r}`, line: 'One line of real text for this section.' })),
};
let mock = starter;
if (existsSync(mockPath) && !args.includes('--init')) {
  try { mock = JSON.parse(readFileSync(mockPath, 'utf8')); } catch { mock = starter; }
} else {
  writeFileSync(mockPath, JSON.stringify(starter, null, 1) + '\n');
}

const placeholder = (v) => !v || /^HEADLINE —|^HEADING —/.test(String(v)) || /^One line of real text|^One sentence that says|^The one action/.test(String(v));
const pending = [mock.headline, mock.lead, mock.action, ...(mock.sections || []).flatMap((s) => [s.heading, s.line])].filter(placeholder).length;

if (asJson) {
  console.log(JSON.stringify({ sheet: sheetPath, surface, heroSize: { value: heroPx, source: heroPxSource }, palette: paletteTokens, fonts: fontFamilies, roles, mock }, null, 1));
  process.exit(0);
}

// ---- section skeletons. Geometry only: no photographs, no motion, no states.
const section = (s) => (mock.sections || []).find((x) => x.role === s) || { role: s, heading: `HEADING — ${s}`, line: '' };
const pad = 'px-6 md:px-12 lg:px-20';
const block = (cls = '') => `<div class="bg-[var(--sketch-block)] ${cls}"></div>`;

function skeleton(role) {
  const s = section(role);
  const h = `<h2 class="font-display text-[clamp(1.6rem,2.6vw,2.6rem)] leading-[1.08] tracking-[-0.015em]">${esc(s.heading)}</h2>`;
  const line = s.line ? `<p class="mt-5 max-w-[56ch] text-ink/85">${esc(s.line)}</p>` : '';
  switch (role) {
    case 'intro': case 'about': case 'manifesto':
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-12">
        <div class="md:col-span-5">${h}</div><div class="md:col-span-6 md:col-start-7">${line ||
          '<p class="text-ink/85">Two short paragraphs of real text belong here.</p><p class="mt-4 text-ink/85">The second one carries the detail.</p>'}</div></div></section>`;
    case 'list': case 'menu': case 'table': case 'records': case 'schedule': case 'lineup': case 'line-up':
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto max-w-[1200px]">
        ${h}<div class="mt-10 divide-y divide-ink/15 border-t border-ink/15">
        ${['Item one', 'Item two', 'Item three', 'Item four', 'Item five'].map((n, i) => `<div class="flex items-baseline justify-between gap-6 py-4">
          <span class="text-[1.05rem]">${n}</span><span class="font-text text-ink/70">${['£4.50', '£6.00', '£3.20', '£7.80', '£5.40'][i]}</span></div>`).join('')}
        </div>${line}</div></section>`;
    case 'showcase': case 'panel': case 'work': case 'case-studies':
      return `<section class="bg-[var(--sketch-surface)] text-ink ${pad} py-20 md:py-28"><div class="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-12">
        <div class="md:col-span-7">${block('aspect-[4/3] w-full')}</div>
        <div class="md:col-span-5">${h}${line}</div></div></section>`;
    case 'gallery': case 'specimens':
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto max-w-[1200px]">
        ${h}<div class="mt-10 grid gap-6 md:grid-cols-3">${[0, 1, 2].map(() => block('aspect-[3/2] w-full')).join('')}</div>${line}</div></section>`;
    case 'features': {
      const items = [1, 2, 3];
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto max-w-[1200px]">${h}
        <div class="mt-10 grid gap-8 md:grid-cols-3">${items.map(() => `<div><p class="font-display text-[1.15rem]">A capability</p><p class="mt-2 text-ink/75">One sentence on what it does for the visitor.</p></div>`).join('')}</div>${line}</div></section>`;
    }
    case 'proof': case 'testimonial':
      return `<section class="bg-[var(--sketch-field)] text-[var(--sketch-field-ink)] ${pad} py-20 md:py-28"><div class="mx-auto max-w-[900px]">
        <p class="font-display text-[clamp(1.5rem,3vw,2.6rem)] leading-[1.15]">A quotation in the subject's own words, set at scale so it carries the section.</p>
        <p class="mt-6 text-sm opacity-80">Name, role</p></div></section>`;
    case 'stats':
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-3">
        ${['412', '08', '24'].map((n, i) => `<div><p class="font-display text-[clamp(2.4rem,5vw,4rem)] leading-none">${n}</p><p class="mt-3 text-ink/75">${['tonnes landed', 'vessels', 'hours'][i]}</p></div>`).join('')}
        </div></section>`;
    case 'pricing':
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto max-w-[1200px]">${h}
        <div class="mt-10 grid gap-10 md:grid-cols-2">${['One price', 'Another'].map((n, i) => `<div class="border-t border-ink/20 pt-6">
          <p class="font-display text-[2rem] leading-none">${['£90', '£160'][i]}</p><p class="mt-2">${n}</p>
          <p class="mt-4 text-ink/75">What it includes, in one line.</p></div>`).join('')}</div>${line}</div></section>`;
    case 'faq':
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto max-w-[900px]">${h}
        <div class="mt-10 space-y-7">${['A real question', 'Another question', 'A third'].map((q) => `<div>
          <p class="font-display text-[1.15rem]">${q}</p><p class="mt-2 text-ink/75">A direct answer in one or two sentences.</p></div>`).join('')}</div></div></section>`;
    case 'cta':
      return `<section class="bg-[var(--sketch-field)] text-[var(--sketch-field-ink)] ${pad} py-24 md:py-32"><div class="mx-auto max-w-[1200px]">
        <p class="font-display text-[clamp(2rem,4.4vw,4rem)] leading-[1.02] tracking-[-0.02em]">${esc(s.heading)}</p>
        ${s.line ? `<p class="mt-5 max-w-[48ch] opacity-90">${esc(s.line)}</p>` : ''}
        <span class="mt-9 inline-flex min-h-[48px] items-center bg-[var(--sketch-accent)] px-6 text-[var(--sketch-accent-ink)]">${esc(mock.action)}</span>
        </div></section>`;
    case 'contact': case 'booking':
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-2">
        <div>${h}${line}</div><div class="space-y-4"><div class="h-11 w-full bg-[var(--sketch-surface)]"></div><div class="h-11 w-full bg-[var(--sketch-surface)]"></div><div class="h-28 w-full bg-[var(--sketch-surface)]"></div>
        <span class="inline-flex min-h-[48px] items-center bg-[var(--sketch-accent)] px-6 text-[var(--sketch-accent-ink)]">${esc(mock.action)}</span></div></div></section>`;
    case 'footer':
      return `<footer class="bg-[var(--sketch-field)] text-[var(--sketch-field-ink)] ${pad} py-14"><div class="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-3">
        <p class="font-display text-[1.4rem]">${esc(mock.headline.split(/[.,—]/)[0].trim())}</p>
        <p class="opacity-80">Where it is, when it is open</p><p class="opacity-80">Two or three links</p></div></footer>`;
    default:
      return `<section class="bg-bg text-ink ${pad} py-20 md:py-28"><div class="mx-auto max-w-[1200px]">${h}${line}</div></section>`;
  }
}
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }

const mediaLed = /photo|image|media|film|portrait|picture/i.test(hero?.blueprint || '');
const fieldToken = paletteTokens.find(([k]) => k === 'field1');
const heroBackground = fieldToken ? 'var(--sketch-field)' : 'var(--sketch-surface)';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(mock.headline === starter.headline ? 'Direction sketch' : mock.headline)}</title>
<!--
  A SKETCH, NOT THE BUILD.

  Direction ${esc(sheet.direction?.id || '?')} · ${esc(pal?.name || 'kept palette')} · ${esc(typ?.name || 'kept type')} · ${esc(surface)} surface
  Generated by scripts/mock.mjs from .frontend-studio/direction.json. Palette, type and the hero size below
  come from the dealt sheet. The words come from mock.json.

  Absent on purpose: photographs, footage, motion, interactive states, full body copy. Each costs time and
  none of them answers the question this file exists to ask. Do not run inspect.mjs on it.
-->
${fontLinks.join('\n')}
<script src="https://cdn.tailwindcss.com"></script>
<script>
  // Real tokens, straight from the palette the draw dealt. If a colour looks wrong here it is wrong in
  // the palette, which is exactly what this sketch is for.
  tailwind.config = { theme: { extend: {
    colors: { ${paletteTokens.map(([k, v]) => `'${k}': '${v}'`).join(', ')} },
    fontFamily: ${JSON.stringify(fontFamilies || {})},
  }}};
</script>
<style>
  :root {
    --sketch-accent: ${pal?.accent || '#111'};
    --sketch-accent-ink: ${pal?.accentInk || '#fff'};
    --sketch-surface: ${pal?.surface || '#eee'};
    --sketch-field: ${pal?.fields?.[0]?.bg || pal?.surface || '#e6e4df'};
    --sketch-field-ink: ${pal?.fields?.[0]?.ink || pal?.ink || '#111'};
    --sketch-block: color-mix(in oklab, ${pal?.muted || '#888'} 22%, transparent);
  }
  .sketch-flag { position: fixed; right: 14px; bottom: 14px; z-index: 50; font: 11px/1.4 ui-monospace, monospace;
    letter-spacing: .06em; text-transform: uppercase; color: ${pal?.ink || '#111'}; opacity: .55;
    background: ${pal?.bg || '#fff'}; padding: 6px 10px; }
</style>
</head>
<body class="bg-bg font-text text-ink antialiased">

<header class="${pad} flex items-center justify-between bg-bg py-6">
  <span class="font-display text-[1.15rem]">${esc((mock.headline || 'The name').split(/[.,—]/)[0].trim().slice(0, 28))}</span>
  <nav class="flex items-center gap-6 text-[0.95rem] text-ink/80">
    <span>Work</span><span>About</span><span>Contact</span>
    <span class="inline-flex min-h-[44px] items-center bg-accent px-5 text-accent-ink">${esc(mock.action)}</span>
  </nav>
</header>

<!-- The hero, at the size its own blueprint states. -->
<section class="min-h-[86svh] bg-bg ${pad} pb-20 pt-10 md:flex md:flex-col md:justify-end">
  <div class="mx-auto w-full max-w-[1400px]">
    <h1 class="font-display leading-[0.98] tracking-[-0.03em]" style="font-size:${heroPx}">${esc(mock.headline)}</h1>
    <div class="mt-8 grid gap-6 md:grid-cols-12 md:items-end">
      <p class="md:col-span-5 text-[1.05rem] leading-[1.55] text-ink/85">${esc(mock.lead)}</p>
      ${mediaLed ? `<div class="md:col-span-6 md:col-start-7">${block('aspect-[16/10] w-full')}<p class="mt-2 text-sm text-ink/60">photograph — its subject and crop are the build's decision</p></div>` : ''}
    </div>
  </div>
</section>

${(mock.sections || roles.map((r) => ({ role: r }))).map((s) => skeleton(s.role)).join('\n')}

<div class="sketch-flag">sketch · structure and colour only</div>
</body>
</html>
`;

writeFileSync(join(outDir, 'mockup.html'), html);

const rel = (p) => p.replace(process.cwd(), '.').replace(/\\/g, '/');
console.log(`FRONTEND-STUDIO · MOCK   ${rel(outDir)}/mockup.html`);
console.log(`  direction   ${sheet.direction?.id || '?'} · ${pal?.name || 'kept palette'} · ${typ?.name || 'kept type'} · ${surface}`);
console.log(`  hero size   ${heroPx}   — from ${heroPxSource}`);
console.log(`  sections    ${(mock.sections || []).map((s) => s.role).join(' · ')}`);
console.log(`  words from  ${rel(mockPath)}`);
console.log('');
if (pending) {
  console.log(`  ${pending} string(s) in mock.json are still placeholders. Fill them, run this again, then open mockup.html.`);
  console.log('  A sketch with placeholder words cannot be judged, and the whole point is to judge it before building.');
} else {
  console.log('  Open mockup.html and look at it. This is the checkpoint: get a yes, then build.');
}
