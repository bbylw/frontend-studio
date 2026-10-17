#!/usr/bin/env node
// frontend-studio / audit — check the research library itself, the way lint.mjs checks source.
//
//   node audit.mjs [--json] [--quiet]
//
// lint.mjs and inspect.mjs keep a build honest. Nothing was keeping the library honest, which is how it
// came to hold palettes whose surface steps were invisible, palettes with nowhere to put a photograph,
// and two type systems dealt under the same name. This script is that missing gate.
//
// What it checks, and why each one matters aesthetically rather than merely structurally:
//
//   palettes  every role must be legible (ink 7:1, muted 4.5:1, button ink 3.2:1); the surface must step
//             far enough from the ground to read as a surface at all; the accent must be distinguishable
//             from the ink, or it has no job; every palette must offer at least one field, or a section
//             has nowhere to go; a saturated mid-tone ground must declare where pictures go, because a
//             photograph laid straight on one reads as mud.
//   type      no duplicate system or display name (a sheet that prints a name twice with different
//             settings reads as a bug); each stylesheet link must be a well-formed Google Fonts or
//             Fontshare URL; no direction may ask for a type class the library cannot supply.
//   library   no duplicate ids; a direction must name a sector draw.mjs actually knows; a palette tag or
//             hero a direction asks for must exist; `seenIn` must point at a real studied site.
//
// Exit code 1 when any FAIL is found. Zero dependencies. Node 18+.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(here, '..', 'library');
const read = (n) => JSON.parse(readFileSync(join(LIB, n), 'utf8'));

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const quiet = args.includes('--quiet');

// ---- colour maths, the same definitions lint.mjs and inspect.mjs use so the three agree
const hex = (h) => { const n = parseInt(String(h).replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const sat = (h) => { const [r, g, b] = hex(h).map((v) => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  return mx === mn ? 0 : l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn); };
const light = (h) => { const [r, g, b] = hex(h).map((v) => v / 255); return (Math.max(r, g, b) + Math.min(r, g, b)) / 2; };
// a ground that is both saturated and mid-tone is the one photographs fight
const saturatedGround = (h) => sat(h) >= 0.22 && light(h) >= 0.22 && light(h) <= 0.78;

const findings = [];
const add = (level, id, where, message, fix) => findings.push({ level, id, where, message, fix });

// ---- load
const P = read('palettes.json'), T = read('type.json'), D = read('directions.json');
const H = read('heroes.json'), S = read('sections.json'), SI = read('sites.json'), MO = read('motions.json');
const dir = (d) => d.items || d.directions || d;
const dirs = dir(D);
const siteIds = new Set(SI.map((s) => s.id));
// SECTORS is read out of draw.mjs rather than copied, so the two cannot drift apart silently
const drawSrc = readFileSync(join(here, 'draw.mjs'), 'utf8');
const sectorLine = (drawSrc.match(/^const SECTORS = \[(.*?)\];/m) || [, ''])[1];
const SECTORS = [...sectorLine.matchAll(/'([^']+)'/g)].map((m) => m[1]);

const dupes = (list, key) => {
  const seen = new Map();
  for (const x of list) { const k = x[key]; seen.set(k, (seen.get(k) || 0) + 1); }
  return [...seen].filter(([, n]) => n > 1).map(([k, n]) => `${JSON.stringify(k)} ×${n}`);
};

// ================= palettes
for (const [k, n] of dupes(P, 'id').map((s) => [s, 1])) add('FAIL', 'duplicate-id', 'palettes', `palette id appears more than once: ${k}`, 'Ids are how the draw and the audit refer to an entry. Make it unique.');
for (const d of dupes(P, 'name')) add('FAIL', 'duplicate-name', 'palettes', `palette name appears more than once: ${d}`, 'Two palettes may not share a name: a sheet prints the name, and two identical names read as a bug.');
for (const p of P) {
  const at = `palettes/${p.id}`;
  for (const [role, floor] of [['ink', 7], ['muted', 4.5]]) {
    const c = ratio(p[role], p.bg);
    if (c < floor) add('FAIL', 'legibility', at, `${role} ${p[role]} on ground ${p.bg} is ${c.toFixed(2)}:1, below the ${floor}:1 floor`, 'Running text carries the argument. Darken or lighten the role until the ratio clears the floor.');
  }
  const btn = ratio(p.accentInk || '#ffffff', p.accent);
  if (btn < 3.2) add('FAIL', 'legibility', at, `button ink ${p.accentInk || '#ffffff'} on accent ${p.accent} is ${btn.toFixed(2)}:1`, 'The label on the one filled action has to be readable. Pick an accentInk that clears 3.2:1.');
  const step = ratio(p.bg, p.surface);
  if (step < 1.05) add('FAIL', 'invisible-surface', at, `surface ${p.surface} steps only ${step.toFixed(3)}:1 from ground ${p.bg}, so it is not a surface`, 'Raise the step to at least 1.05:1. A panel that cannot be seen is a panel that has to be outlined, and outlines are banned.');
  const inkAccent = ratio(p.ink, p.accent);
  if (inkAccent < 1.15) add('FAIL', 'accent-has-no-job', at, `ink ${p.ink} and accent ${p.accent} are ${inkAccent.toFixed(2)}:1 apart, so the accent cannot mark the action`, 'Move the ink to the neutral value of the palette and leave the chromatic value to the accent. Two-tone palettes do not need a third colour to gain a focal point.');
  if (!p.fields?.length) add('FAIL', 'no-field', at, 'the palette declares no field, so no section can change its ground', 'Add at least one field. A page that cannot change its ground is a page of bands.');
  (p.fields || []).forEach((f, i) => {
    if (!f.ink) return;
    const c = ratio(f.ink, f.bg);
    if (c < 4.5) add('FAIL', 'legibility', at, `field ${i + 1} ink ${f.ink} on ${f.bg} is ${c.toFixed(2)}:1, below 4.5:1`, 'A field is a whole section. Its type must be readable at size.');
  });
  if (saturatedGround(p.bg)) {
    if (!p.pictures) add('FAIL', 'mud', at, `ground ${p.bg} is a saturated mid-tone (${Math.round(sat(p.bg) * 100)}% saturation, ${Math.round(light(p.bg) * 100)}% light) and the palette says nothing about where pictures go`, 'Add a `pictures` line naming a neutral field, and add at least one neutral field for it to name. A photograph laid straight on this ground reads as mud.');
    else {
      const named = [...p.pictures.matchAll(/--field-(\d+)/g)].map((m) => Number(m[1]));
      if (!named.length) add('FAIL', 'mud', at, 'the `pictures` line names no field', 'Point it at a `--field-N` that exists in this palette.');
      for (const n of named) if (!p.fields?.[n - 1]) add('FAIL', 'mud', at, `the \`pictures\` line names --field-${n}, which does not exist (this palette has ${p.fields?.length || 0})`, 'Fix the index, or add the field.');
      const targets = named.map((n) => p.fields?.[n - 1]?.bg).filter(Boolean);
      if (targets.length && targets.some((b) => saturatedGround(b))) add('WARN', 'mud', at, `the field named for pictures is itself saturated (${targets.join(', ')}); photographs will still fight it`, 'Name a neutral field: saturation below about 12 percent, or a near-white or near-black.');
    }
  } else if (p.pictures) {
    add('WARN', 'mud', at, 'the palette carries a `pictures` line but its ground is not a saturated mid-tone', 'Remove the line, or widen its scope to a picture treatment that applies to a neutral ground too.');
  }
  for (const s of p.seenIn || []) if (!siteIds.has(s)) add('WARN', 'seenIn', at, `seenIn points at "${s}", which is not a studied site`, 'Fix the id, or drop it. The field is the library\'s only claim to evidence.');
}

// ================= type
for (const d of dupes(T, 'id')) add('FAIL', 'duplicate-id', 'type', `type system id appears more than once: ${d}`, 'Ids must be unique.');
for (const d of dupes(T, 'name')) add('FAIL', 'duplicate-name', 'type', `display name appears more than once: ${d}`, 'A sheet prints this name. Two systems under one name read as a bug, and the reader cannot tell which settings apply.');
const LINK_OK = /^<link[^>]+href="https:\/\/(fonts\.googleapis\.com\/css2\?|api\.fontshare\.com\/v2\/css\?)[^"]+"[^>]*>$/m;
for (const t of T) {
  const at = `type/${t.id}`;
  for (const role of ['display', 'text']) {
    const v = t[role] || {};
    if (!v.family) add('FAIL', 'type-shape', at, `${role}.family is missing`, 'A type system names both faces.');
    if (!v.weights?.length) add('WARN', 'type-shape', at, `${role}.weights is empty`, 'The draw cannot tell you what to request.');
    if (!v.settings) add('WARN', 'type-shape', at, `${role}.settings is missing`, 'Settings are the reason to pick this system over another in the same class.');
    if (!v.css || !LINK_OK.test(v.css)) add('FAIL', 'font-link', at, `${role}.css is not a well-formed Google Fonts or Fontshare stylesheet link`, 'One <link> per face, on the preconnect host that serves it. A broken link means the reader sees a fallback and believes the design is that fallback.');
  }
  // One family filling both roles is a legitimate, common choice, but the sheet prints the same name twice
  // and the reader has to be told it is the idea rather than an oversight. It is declared structurally:
  // `single: true`. An earlier version of this check read the note looking for words like "one", which
  // made the audit depend on English phrasing and pass or fail on how a sentence happened to be written.
  const oneFamily = (t.display.family || '').toLowerCase() === (t.text.family || '').toLowerCase();
  if (oneFamily && t.single !== true) add('FAIL', 'single-family', at, 'one family fills both the display and the text role without declaring `single: true`', 'Declare it. The sheet prints the family name twice, and without the declaration that reads as a mistake rather than a decision.');
  if (!oneFamily && t.single) add('FAIL', 'single-family', at, 'declares `single: true` but the display and the text are different families', 'Remove the flag, or make both roles the same family.');
  for (const s of t.seenIn || []) if (!siteIds.has(s)) add('WARN', 'seenIn', at, `seenIn points at "${s}", which is not a studied site`, 'Fix or drop it.');
}

// ================= directions, and what they ask the rest of the library for
const paletteTags = new Set(P.flatMap((p) => p.tags || []));
const typeClasses = new Set(T.map((t) => t.class));
const heroIds = new Set(H.map((h) => h.id));
for (const d of dupes(dirs, 'id')) add('FAIL', 'duplicate-id', 'directions', `direction id appears more than once: ${d}`, 'Ids must be unique.');
for (const d of dupes(dirs, 'name')) add('WARN', 'duplicate-name', 'directions', `direction name appears more than once: ${d}`, 'Directions are offered by name before they are dealt in full.');
for (const d of dirs) {
  const at = `directions/${d.id}`;
  if (!d.sectors?.length) add('FAIL', 'sector', at, 'the direction is offered in no sector, so it can never be dealt', 'Give it at least one sector.');
  for (const s of d.sectors || []) if (!SECTORS.includes(s)) add('FAIL', 'sector', at, `sector "${s}" is not one draw.mjs knows`, `draw.mjs declares: ${SECTORS.join(', ')}`);
  for (const c of d.typeClasses || []) if (!typeClasses.has(c)) add('FAIL', 'no-type', at, `type class "${c}" has no system in the library, so this direction can only deal a fallback`, 'Add a system in that class, or change the class.');
  for (const t of d.paletteTags || []) if (!paletteTags.has(t)) add('WARN', 'no-palette', at, `palette tag "${t}" is on no palette`, 'Tags are how a direction asks for colour. A tag nothing answers is a hole in the draw.');
  for (const h of d.heroes || []) if (!heroIds.has(h)) add('FAIL', 'no-hero', at, `hero "${h}" is not in heroes.json`, 'Fix the id, or add the hero.');
  if (d.motion && !MO.some((m) => m.id === d.motion)) add('WARN', 'no-motion', at, `motion "${d.motion}" is not in motions.json`, 'Fix the id, or drop it.');
  for (const s of d.seenIn || []) if (!siteIds.has(s)) add('WARN', 'seenIn', at, `seenIn points at "${s}", which is not a studied site`, 'Fix or drop it.');
}
for (const d of dupes(dirs, 'sector')) { /* no-op guard: dupes() is keyed on one field */ }
const seenSectors = new Set(dirs.flatMap((d) => d.sectors || []));
for (const s of SECTORS) if (!seenSectors.has(s)) add('WARN', 'coverage', 'directions', `sector "${s}" has no direction of its own and will be dealt something from elsewhere`, 'Acceptable for a near neighbour; add a direction when the sector gets its own briefs.');

// ================= heroes and sections
for (const [name, list] of [['heroes', H], ['sections', S], ['motions', MO]]) {
  for (const d of dupes(list, 'id')) add('FAIL', 'duplicate-id', name, `id appears more than once: ${d}`, 'Ids must be unique.');
  for (const d of dupes(list, 'name')) add('WARN', 'duplicate-name', name, `name appears more than once: ${d}`, 'The sheet prints names; two identical names read as one blueprint.');
  for (const x of list) for (const s of x.seenIn || []) if (!siteIds.has(s)) add('WARN', 'seenIn', `${name}/${x.id}`, `seenIn points at "${s}", which is not a studied site`, 'Fix or drop it.');
}
for (const h of H) for (const d of h.directions || []) if (!dirs.some((x) => x.id === d)) add('WARN', 'dangling', `heroes/${h.id}`, `lists direction "${d}", which does not exist`, 'Fix the id or drop the reference.');
for (const s of S) for (const d of s.directions || []) if (!dirs.some((x) => x.id === d)) add('WARN', 'dangling', `sections/${s.id}`, `lists direction "${d}", which does not exist`, 'Fix the id or drop the reference.');
for (const d of dupes(SI, 'id')) add('FAIL', 'duplicate-id', 'sites', `studied site id appears more than once: ${d}`, 'Every seenIn in the library points at these.');
for (const [name, list] of [['heroes', H], ['sections', S]]) for (const x of list) if (!x.blueprint) add('FAIL', 'blueprint', `${name}/${x.id}`, 'has no blueprint text', 'A blueprint is the whole reason to deal this instead of composing it from scratch.');

// ---- output
const fails = findings.filter((f) => f.level === 'FAIL');
const warns = findings.filter((f) => f.level === 'WARN');
if (asJson) {
  console.log(JSON.stringify({ palettes: P.length, type: T.length, directions: dirs.length, heroes: H.length, sections: S.length, sites: SI.length, findings }, null, 1));
  process.exit(fails.length ? 1 : 0);
}
const line = (s = '') => console.log(s);
line(`FRONTEND-STUDIO · AUDIT   ${relative(process.cwd(), LIB) || 'library'}   ${P.length} palettes · ${T.length} type systems · ${dirs.length} directions · ${H.length} heroes · ${S.length} sections · ${SI.length} sites`);
if (!quiet) {
  line('');
  line('  type classes      ' + [...new Set(T.map((t) => t.class))].sort().map((c) => `${c} ${T.filter((t) => t.class === c).length}`).join('  '));
  line('  sector coverage   ' + SECTORS.map((s) => `${s.slice(0, 4)} ${dirs.filter((d) => d.sectors?.includes(s)).length}`).join('  '));
  line('');
}
if (!findings.length) line('No findings. The library is internally consistent and legible.');
for (const [title, list] of [['FAIL — the library will hand out something that looks wrong', fails], ['WARN — worth a look', warns]]) {
  if (!list.length) continue;
  line(''); line(title);
  for (const f of list) line(`  [${f.id}] ${f.where}  ${f.message}\n      → ${f.fix}`);
}
line('');
line(`RESULT: ${fails.length} FAIL, ${warns.length} WARN${fails.length ? ' — fix the library before dealing a direction from it.' : ''}`);
process.exit(fails.length ? 1 : 0);
