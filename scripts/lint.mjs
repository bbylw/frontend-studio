#!/usr/bin/env node
// frontend-studio / lint — static scan of source files for the tells this skill bans.
// Catches them before a render, plus the ones a render cannot see (copy habits, motion values).
//
//   node lint.mjs [files or directories ...] [--surface page|product] [--json]
//
// --surface product tolerates the patterns a working interface legitimately needs — monospace in the
// literal-data role, rank and count numbers, panel titles and field labels, compact column-header labels,
// rules inside tables and lists, a shadow on something that floats — and keeps banning the rest. The list
// and its reasoning: references/product-surfaces.md §5.
//
// Exit code 1 when any FAIL is found. Zero dependencies.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, extname, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) {
  console.log('usage: node lint.mjs [files or directories ...] [--surface page|product|art] [--allow rule,rule] [--json]');
  process.exit(0);
}
const asJson = args.includes('--json');
const surfaceAt = args.indexOf('--surface');
const allowAt = args.indexOf('--allow');
// -1 means the flag is absent. `surfaceAt + 1` would then be 0, which is a real path argument: the
// guard below is only applied when the flag is actually present, or the first path is silently dropped.
const flagValueIndices = new Set([
  ...(surfaceAt !== -1 ? [surfaceAt, surfaceAt + 1] : []),
  ...(allowAt !== -1 ? [allowAt, allowAt + 1] : []),
]);
const roots = args.filter((a, i) => !a.startsWith('--') && !flagValueIndices.has(i));
if (!roots.length) roots.push('.');

let savedSheet = null;
const sheetCandidates = [
  ...roots.flatMap((r) => {
    const p = resolve(r);
    return [join(p, '.frontend-studio', 'direction.json'), join(dirname(p), '.frontend-studio', 'direction.json')];
  }),
  join(process.cwd(), '.frontend-studio', 'direction.json'),
];
for (const p of sheetCandidates) {
  if (existsSync(p)) {
    try { savedSheet = JSON.parse(readFileSync(p, 'utf8')); break; } catch {}
  }
}
const sheetSurface = savedSheet?.surface || savedSheet?.input?.surface || (savedSheet?.direction?.id === 'generative-art' ? 'art' : null);
const surfaceArg = surfaceAt !== -1 ? String(args[surfaceAt + 1] || '').toLowerCase() : '';
const surface = ['product', 'art', 'page'].includes(surfaceArg)
  ? surfaceArg
  : ['product', 'art', 'page'].includes(sheetSurface)
    ? sheetSurface
    : 'page';
const allowArg = allowAt !== -1 ? String(args[allowAt + 1] || '').split(',').map((s) => s.trim()).filter(Boolean) : [];
const allow = new Set([...allowArg, ...(Array.isArray(savedSheet?.allow) ? savedSheet.allow : [])]);

const EXT = new Set(['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.mdx']);
const SKIP = new Set(['node_modules', '.git', '.next', '.nuxt', '.svelte-kit', 'dist', 'build', 'out', '.vercel', '.frontend-studio', 'coverage', '.turbo', 'vendor']);

const files = []; const tooBig = [];
const walk = (p) => {
  let st; try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) { for (const f of readdirSync(p)) if (!SKIP.has(f) && !f.startsWith('.')) walk(join(p, f)); }
  else if (EXT.has(extname(p)) && !/\.min\.|lock|\.d\.ts$/.test(p)) { if (st.size < 4000000) files.push(p); else tooBig.push(p); }
};
for (const r of roots) {
  try { statSync(resolve(r)); } catch { console.error(`Not found: ${r}`); process.exit(2); }
  walk(resolve(r));
}
if (!files.length) { console.error(`No source files (${[...EXT].join(' ')}) under: ${roots.join(', ')}`); process.exit(2); }
if (tooBig.length) console.error(`Skipped (over 4 MB, check by hand): ${tooBig.join(', ')}`);

// Each rule: [level, id, regex, message]. Tested per line. `code` lines (inside <pre>/<code>) skip the mono rule.
const R = [
  ['FAIL', 'mono', /\bfont-mono\b|font-family\s*:[^;{}]*(mono\b|monospace|Courier|Consolas|Menlo|Monaco)|(JetBrains|Geist|IBM\+?Plex|Space|DM|Roboto|Fragment|Azeret|Red\+?Hat|Martian|Commit|Departure|Fira)[+_ ]?Mono|Geist_Mono|GeistMono|Fira[+ ]Code|ui-monospace/i, 'Monospace type. Only literal code may be monospace.'],
  ['FAIL', 'gradient', /(linear|radial|conic)-gradient\(|\bbg-(gradient|linear|radial|conic)-|\b(from|via)-(?!\[?0)[a-z]+-\d{2,3}\b/, 'Gradient fill. Use a flat colour or a real image (a neutral scrim over a photo is the one exception).'],
  ['FAIL', 'gradient-text', /bg-clip-text|background-clip\s*:\s*text|text-transparent/, 'Gradient / clipped text. Use solid colour.'],
  ['FAIL', 'shadow', /box-shadow\s*:\s*(?!none|0 0 #0000|var\(--tw)|\bshadow(-(sm|md|lg|xl|2xl|inner|\[[^\]]+\]))?(?=["'\s`])(?<!-shadow)|drop-shadow\(|\bdrop-shadow(-|\b)|text-shadow\s*:\s*(?!none)/, 'Shadow. Elements at rest carry none; only real overlays (menu, dialog, sticky bar) may.'],
  ['FAIL', 'numbering', />\s*[(\[]?0[1-9][)\]]?\.?\s*<|["'`]\s*0[1-9]\s*["'`]|decimal-leading-zero|>\s*(Step|Phase|No\.?|Chapter)\s*0?\d\s*</i, 'Decorative index numbering (01 / 02 / 03).'],
  ['WARN', 'numbering', /padStart\(\s*2\s*,\s*["']0["']\s*\)/, 'Zero-padding in script. Fine for a clock, a date or a price; if it builds 01 / 02 / 03 labels, remove it.'],
  ['FAIL', 'eyebrow', /class(Name)?\s*=\s*["'`{][^"'`}]*\b(eyebrow|kicker|overline|pretitle|pre-title|suptitle|sup-title|tagline-label|section-label|section-tag)\b|\.(eyebrow|kicker|overline|pretitle|section-label|section-tag)\b\s*[{,]/i, 'Eyebrow / kicker label above a heading.'],
  ['FAIL', 'micro-label', /(?=[^"'`]*\buppercase\b)(?=[^"'`]*\btracking-(wide|wider|widest|\[[^\]]+\])\b)(?=[^"'`]*\btext-(xs|\[1[0-3]px\]|\[0?\.[67]\d*rem\])\b)[^"'`]+/, 'Tiny uppercase letter-spaced label.'],
  ['FAIL', 'purple', /\b(bg|text|from|to|via|border|ring|fill|stroke|shadow|decoration|outline)-(purple|violet|indigo|fuchsia)-\d{2,3}\b|#(6366f1|8b5cf6|7c3aed|a855f7|4f46e5|a78bfa|818cf8|9333ea|6d28d9|c084fc)\b/i, 'Indigo / violet — the generated-page accent.'],
  ['FAIL', 'claude-palette', /#(d97757|da7756|c15f3c|cc785c|bd5d3a|f0eee6|faf9f5|f5f4ed|eeece2|e8e6dc)\b/i, 'Claude-brand cream / terracotta colour.'],
  ['FAIL', 'emoji', /[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}\u{2600}-\u{26FF}]/u, 'Emoji used as UI.'],
  ['FAIL', 'lorem', /lorem ipsum|dolor sit amet/i, 'Placeholder copy shipped.'],
  ['FAIL', 'hairline', /<hr\b|\bdivide-[xy](-\d|\b)|\b(h|w)-px\b|border-(top|bottom|left|right)\s*:\s*(0?\.5|1)px|\bborder-[tblrxy](?![-\w])|\bborder-[tblrxy]-(?!0\b|none)\[?1?(px)?\]?(?=["'\s`])|height\s*:\s*1px/, 'Thin rule / divider line. Separate with space, tone or scale; lines belong to real tables and form fields.'],
  ['WARN', 'outlined-box', /border\s*:\s*1px\s+solid|\bborder\b(?=[^"'`]*\brounded)/, 'A 1px outlined box. Prefer a filled surface or no box.'],
  ['WARN', 'glass', /backdrop-blur|backdrop-filter\s*:/, 'Backdrop blur. One sticky bar at most; glass cards are a tell.'],
  ['WARN', 'copy', /\b(unlock|unleash|supercharge|seamless(ly)?|elevate|empower(s|ing)?|revolutioni[sz]e|game[- ]chang(er|ing)|cutting[- ]edge|next[- ]gen(eration)?|world[- ]class|best[- ]in[- ]class|all[- ]in[- ]one|effortless(ly)?|blazing(ly)?[- ]fast|lightning[- ]fast|reimagin(e|ed|ing)|delve|tapestry|leverage|synergy|streamline|robust|holistic|turbocharge|transform the way|take your .{1,30} to the next level|say goodbye to|in today'?s|the future of|built for the modern|not just .{1,40}[,—-] (it'?s|but)|more than (just )?a)\b/i, 'Stock marketing phrase. Say the specific thing the product does.'],
  ['WARN', 'cta-copy', />\s*(Learn more|Get started|Click here|Read more|Discover more|Explore now|Submit)\s*</i, 'Generic button label. Name the action or the thing ("Book a table", "See the plans").'],
  ['WARN', 'default-font', /family=(Inter|Poppins|Montserrat|Roboto|Open\+Sans|Space\+Grotesk|Instrument\+Serif|Playfair\+Display|Plus\+Jakarta\+Sans|Outfit|Sora|Lato|Nunito|Raleway)\b|font-family\s*:\s*["']?(Inter|Poppins|Montserrat|Roboto|Space Grotesk|Instrument Serif|Playfair Display|Plus Jakarta Sans|Outfit|Sora)\b|from ["']next\/font\/google["'].*\b(Inter|Poppins|Montserrat|Space_Grotesk|Instrument_Serif|Playfair_Display|Plus_Jakarta_Sans|Outfit|Sora)\b|\b(Inter|Poppins|Space_Grotesk|Instrument_Serif|Playfair_Display)\s*\(\s*\{/, 'A default typeface. Use the faces named by the drawn direction.'],
  ['WARN', 'transition-all', /transition\s*:\s*all\b|\btransition-all\b/, 'transition: all. Name the properties (transform, opacity).'],
  ['WARN', 'ease-in', /(?<![-\w])ease-in(?!-out)\b/, 'ease-in on UI feels sluggish. Use a strong ease-out for enters and exits.'],
  ['WARN', 'scale-zero', /scale\(\s*0\s*\)|\bscale-0\b/, 'Entering from scale(0). Start at 0.95–0.98 with opacity 0.'],
  ['WARN', 'h-screen', /\bh-screen\b|height\s*:\s*100vh/, '100vh jumps on mobile. Use 100svh / 100dvh.'],
  ['WARN', 'bounce', /animate-(bounce|ping|pulse)\b/, 'Looping attention animation (bounce / ping / pulse dot).'],
];

const findings = [];
// In product mode these fall from FAIL to WARN: they are legitimate inside a working interface, and only
// a designer looking at the screen can tell "a table's rules" from "a decoration". The rule still speaks.
const RELAXED = surface === 'product' ? new Set(['mono', 'numbering', 'eyebrow', 'micro-label', 'hairline', 'outlined-box', 'shadow']) : new Set();
let emDashes = 0;
const cssVars = new Map();
const fileEntries = files.map((file) => {
  const text = readFileSync(file, 'utf8');
  const localVars = new Map();
  for (const m of text.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;}"'`\r\n]+)/g)) {
    localVars.set(m[1], m[2].trim());
    cssVars.set(m[1], m[2].trim());
  }
  return { file, lines: text.split(/\r?\n/), localVars };
});
for (const { file, lines, localVars } of fileEntries) {
  const rel = relative(process.cwd(), file).split('\\').join('/');
  let inCode = false; let selector = ''; let pending = '';
  const resolveVars = (str) => {
    let out = str;
    for (let pass = 0; pass < 3 && /var\(/i.test(out); pass++) {
      out = out.replace(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\)/gi, (full, name, fb) => {
        const val = localVars.get(name) ?? cssVars.get(name) ?? (fb ? fb.trim() : null);
        return val != null ? val : full;
      });
    }
    return out;
  };
  const isScrim = (rawG) => {
    let g = resolveVars(rawG);
    if (/var\(/i.test(g)) return false;
    let mixAlpha = false;
    g = g.replace(/color-mix\(\s*in\s+[a-z0-9-]+(?:\s+(?:shorter|longer|increasing|decreasing)\s+hue)?\s*,((?:[^()]+|\([^()]*\))+)\)/gi, (_, inner) => {
      if (/\btransparent\b/i.test(inner)) mixAlpha = true;
      return inner;
    });
    if (/color-mix\(/i.test(g)) return false;
    const to255 = (v) => (/%/.test(v) ? parseFloat(v) * 2.55 : parseFloat(v));
    const rgbs = [...g.matchAll(/rgba?\(([^)]+)\)/gi)].map((mm) => mm[1].split(/[,\s/]+/).filter(Boolean));
    const hsls = [...g.matchAll(/hsla?\(([^)]+)\)/gi)].map((mm) => mm[1].split(/[,\s/]+/).filter(Boolean));
    const lchs = [...g.matchAll(/(ok)?lch\(([^)]+)\)/gi)].map((mm) => ({ ok: !!mm[1], c: mm[2].split(/[,\s/]+/).filter(Boolean) }));
    const labs = [...g.matchAll(/(ok)?lab\(([^)]+)\)/gi)].map((mm) => ({ ok: !!mm[1], c: mm[2].split(/[,\s/]+/).filter(Boolean) }));
    const colorFns = [...g.matchAll(/(?<![a-z-])color\(([^)]+)\)/gi)].map((mm) => mm[1].split(/[,\s/]+/).filter(Boolean));
    const hexes = [...g.matchAll(/#([0-9a-f]{3,8})\b/gi)].map((mm) => mm[1]);
    const withoutFns = g.replace(/(?:rgba?|hsla?|oklch|oklab|lch|lab|color)\([^)]+\)|#[0-9a-f]{3,8}\b/gi, ' ');
    const named = [...withoutFns.matchAll(/\b(black|white)\b/gi)].map((mm) => mm[1]);
    if (!rgbs.length && !hsls.length && !lchs.length && !labs.length && !colorFns.length && !hexes.length && !named.length) return false;
    const rgbNeutral = rgbs.every((c) => { const n = c.slice(0, 3).map(to255); return n.length === 3 && n.every(Number.isFinite) && Math.max(...n) - Math.min(...n) <= 14; });
    const hslNeutral = hsls.every((c) => c.length >= 3 && (c[1] === 'none' || parseFloat(c[1]) <= 5 || parseFloat(c[2]) === 0 || parseFloat(c[2]) === 100));
    const lchNeutral = lchs.every(({ ok, c }) => c.length >= 3 && (c[1] === 'none' || parseFloat(c[1]) <= (ok ? 0.02 : 2) || parseFloat(c[0]) === 0));
    const labNeutral = labs.every(({ ok, c }) => c.length >= 3 && [c[1], c[2]].every((v) => v === 'none' || Math.abs(parseFloat(v)) <= (ok ? 0.02 : 2)));
    const colorNeutral = colorFns.every((c) => {
      if (!/^(srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020)$/i.test(c[0] || '')) return false;
      const n = c.slice(1, 4).map((v) => (/%/.test(v) ? parseFloat(v) / 100 : parseFloat(v)));
      return n.length === 3 && n.every(Number.isFinite) && Math.max(...n) - Math.min(...n) <= 0.055;
    });
    const hexNeutral = hexes.every((h) => {
      const expand = h.length === 3 || h.length === 4 ? [...h].map((ch) => ch + ch).join('') : h;
      if (expand.length !== 6 && expand.length !== 8) return false;
      const r = parseInt(expand.slice(0, 2), 16), gr = parseInt(expand.slice(2, 4), 16), b = parseInt(expand.slice(4, 6), 16);
      return Math.max(r, gr, b) - Math.min(r, gr, b) <= 14;
    });
    if (!rgbNeutral || !hslNeutral || !lchNeutral || !labNeutral || !colorNeutral || !hexNeutral) return false;
    const alphaLt1 = (v) => v !== undefined && (/%/.test(v) ? parseFloat(v) < 100 : parseFloat(v) < 1);
    const hasAlpha = mixAlpha
      || /\btransparent\b/i.test(withoutFns)
      || rgbs.some((c) => alphaLt1(c[3]))
      || hsls.some((c) => alphaLt1(c[3]))
      || lchs.some(({ c }) => alphaLt1(c[3]))
      || labs.some(({ c }) => alphaLt1(c[3]))
      || colorFns.some((c) => alphaLt1(c[4]))
      || hexes.some((h) => (h.length === 4 && h[3].toLowerCase() !== 'f') || (h.length === 8 && h.slice(6).toLowerCase() !== 'ff'));
    const stripped = withoutFns.replace(/\b(to|top|bottom|left|right|deg|rad|turn|grad|in|srgb|srgb-linear|display-p3|oklab|oklch|lab|lch|hsl|hwb|shorter|longer|increasing|decreasing|hue|transparent|black|white)\b|[-+\d.%px,\s/]/gi, '');
    return hasAlpha && !/[a-z()]/i.test(stripped);
  };
  lines.forEach((line, i) => {
    // track the CSS selector we are inside, so rules scoped to [data-ui] (interface fragments) keep their own lines
    if (line.includes('{')) {
      const openAt = line.lastIndexOf('{');
      const closeBefore = line.lastIndexOf('}', openAt);
      selector = (closeBefore === -1 ? pending : '') + line.slice(closeBefore + 1, openAt);
      pending = '';
    } else if (!line.includes('}')) pending = (pending + ' ' + line).slice(-300);
    const inUi = /data-ui/.test(selector) || /data-ui/.test(line);
    if (/<(pre|code)\b/i.test(line)) inCode = true;
    const codeLine = inCode || /<(pre|code|kbd|samp)\b/i.test(line);
    if (/<\/(pre|code)>/i.test(line)) inCode = false;
    if (line.length <= 2000 && !/fs-ignore/.test(line)) {
      if (!/^\s*(\/\/|\/\*|\*|<!--)/.test(line)) emDashes += (line.replace(/\/\/.*$|\/\*.*?\*\/|<!--.*?-->/g, '').match(/—/g) || []).length; // comments are not copy
      for (const [level, id, re, message] of R) {
        if (allow.has(id)) continue;
        if (id === 'mono' && (codeLine || /(^|[\s,>+~(])(pre|code|kbd|samp)\b|code/i.test(selector))) continue; // real code may be monospace
        if ((id === 'hairline' || id === 'outlined-box') && /(^|[\s,>+~(])(table|thead|tbody|tfoot|tr|td|th|input|textarea|select|fieldset)\b/i.test(selector)) continue; // real tables and form fields keep their lines
        if (inUi && (id === 'hairline' || id === 'outlined-box' || id === 'shadow')) continue;
        if (id === 'hairline' && /sr-only|visually-hidden|clip(-path)?\s*:|outline/i.test(line + selector)) continue; // screen-reader helpers and focus outlines are not rules
        if ((id === 'copy' || id === 'cta-copy' || id === 'emoji') && /^\s*(\/\/|\/\*|\*|import |@import|<!--)/.test(line)) continue;
        if (id === 'gradient' && !/(radial|conic)-gradient\(|\bbg-(?:gradient-(?:radial|conic)|radial-|conic-)/i.test(line)) {
          const lineGradCount = (line.match(/linear-gradient\(/gi) || []).length;
          let cssOk = true;
          if (lineGradCount > 0) {
            const chunk = lines.slice(i, i + 6).join(' ');
            const grads = [...chunk.matchAll(/linear-gradient\(((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+)\)/gi)].filter((m) => m.index < line.length);
            cssOk = grads.length === lineGradCount && grads.every((m) => isScrim(m[1]));
          }
          const hasTw = /\bbg-(gradient|linear)-|\b(from|via)-(?!\[?0)[a-z]+-\d{2,3}\b/.test(line);
          let twOk = true;
          if (hasTw) {
            const dirCount = (line.match(/\bbg-(?:gradient|linear)-/g) || []).length;
            const stops = [...line.matchAll(/(?<![-\w])(from|via|to)-([^\s"'`;<>]+)/g)].filter((m) => !/^\d+%$/.test(m[2]));
            const fromCount = stops.filter((m) => m[1] === 'from').length;
            let twAlpha = false;
            const stopOk = (val) => {
              if (val === 'transparent') { twAlpha = true; return true; }
              const m = val.match(/^(?:(black|white)|(?:neutral|zinc|stone|gray|grey)-\d{2,3})(?:\/(\d+(?:\.\d+)?%?|\[\d+(?:\.\d+)?%?\]))?$/);
              if (m) {
                if (m[2]) {
                  const raw = m[2].replace(/^\[|\]$/g, '');
                  if (/%/.test(raw) ? parseFloat(raw) < 100 : parseFloat(raw) < (raw.includes('.') ? 1 : 100)) twAlpha = true;
                }
                return true;
              }
              const arb = val.match(/^\[([^\]]+)\]$/)?.[1]?.replace(/_/g, ' ');
              if (arb && isScrim(`${arb}, transparent`)) {
                if (isScrim(`${arb}, #000`)) twAlpha = true;
                return true;
              }
              return false;
            };
            twOk = stops.length > 0 && fromCount >= dirCount && stops.every((m) => stopOk(m[2])) && twAlpha;
          }
          if ((lineGradCount > 0 || hasTw) && cssOk && twOk) continue;
        }
        const m = line.match(re);
        if (m) findings.push({ level: RELAXED.has(id) && level === 'FAIL' ? 'WARN' : level, id, file: rel, line: i + 1, match: m[0].trim().slice(0, 70), message: RELAXED.has(id) ? message + ' Tolerated in product mode while it stays in its documented role.' : message });
      }
    }
    if (line.lastIndexOf('}') > line.lastIndexOf('{')) { selector = ''; pending = ''; }
  });
}
if (emDashes > 4 && !allow.has('em-dash')) findings.push({ level: 'WARN', id: 'em-dash', file: '(all files)', line: 0, match: `${emDashes} em dashes`, message: 'Em-dash habit. Use a full stop or a comma; keep at most one or two on a page.' });

if (asJson) { console.log(JSON.stringify({ files: files.length, findings }, null, 1)); process.exit(findings.some((f) => f.level === 'FAIL') ? 1 : 0); }

const byId = new Map();
for (const f of findings) { const k = f.level + ' ' + f.id; if (!byId.has(k)) byId.set(k, []); byId.get(k).push(f); }
console.log(`FRONTEND-STUDIO · LINT   ${files.length} file(s)   [surface ${surface}]`);
if (!findings.length) console.log('\nNo banned patterns in source. Now run inspect.mjs on the rendered page.');
for (const lvl of ['FAIL', 'WARN']) {
  const keys = [...byId.keys()].filter((k) => k.startsWith(lvl));
  if (!keys.length) continue;
  console.log(`\n${lvl}`);
  for (const k of keys) {
    const list = byId.get(k);
    console.log(`  [${list[0].id}] ${list[0].message}  (${list.length}×)`);
    for (const f of list.slice(0, 6)) console.log(`      ${f.file}:${f.line}  ${f.match}`);
    if (list.length > 6) console.log(`      … ${list.length - 6} more`);
  }
}
const fails = findings.filter((f) => f.level === 'FAIL').length;
console.log(`\nRESULT: ${fails} FAIL, ${findings.length - fails} WARN${fails ? ' — fix the FAILs before rendering.' : ''}`);
console.log('Interface fragments marked data-ui keep their own borders and shadows. Any other line that must keep a flagged pattern for a real reason can carry the comment fs-ignore.');
if (surface === 'product') console.log('Product mode: monospace in the literal-data role, rank and count numbers, panel titles and field labels, compact column-header labels, rules inside tables and lists, and shadows on things that float are warnings now, not failures. Gradients, glow, emoji and the assistant palette are still failures.');
process.exit(fails ? 1 : 0);
