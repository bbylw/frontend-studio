# frontend-studio skill — 美学与测量问题（2.2.2）

> 版本：`github.com/bbylw/frontend-studio` @ `e6c52cc`（CHANGELOG 2.2.2）。
> 测试环境：Windows / Git Bash / Node v24.20.0 / 本机 Chrome。
> 只收当前版本仍存在、并已用最小复现确认的问题。每条给出代码位置与原文、可直接粘贴运行的复现、预期输出和证伪条件。你跑出的结果与"预期"不符，该条即不成立。
> 上一份清单（4 条脚本 bug）已在 2.2.2 修完，存于 git 历史 `20d7bcc:skill-bugs-for-review.md`。这份是其后用三个全新 build（music / architecture / health 各一页）做美学测试时测出的，关注的是 **taste 机器本身**：闸门测不到的美学缺陷、文档与代码的矛盾、库里的口味冲突。

## 背景（写给没用过这个 skill 的读者）

frontend-studio 是一个做网页的 agent skill。产出要过两道闸：

| 工具 | 作用 |
|---|---|
| `scripts/lint.mjs` | 对源码做静态正则扫描，报 FAIL/WARN。有 FAIL 时退出码 1 |
| `scripts/inspect.mjs` | 用本机 Chrome 渲染页面，逐屏截图并测量：标题行数、字号、实际加载的字体、颜色、规则线、阴影、渐变、对比度、溢出、**每屏填充率 `filled`**、首屏按钮、动效数量、图片数量 |

SKILL.md:307-319 要求修掉所有 FAIL，并把每个 WARN 当作错误除非能一句话辩护。过闸之后还要按 `references/critique.md` 看自己的截图打分（14 个观察 pass + 加权分 + 一票否决的 caps）。

本文档的 7 条分三类：

- **测量盲区**（1、2）：页面的视觉事实与闸门读数不符——要么空屏测成满，要么一个无障碍构件被当成首屏按钮。
- **代码与文档矛盾**（3、4、7）：文档允许的写法被测量器或扫描器判罪；文档印的数量与实际不符。
- **库与口味冲突**（5、6）：`library/` 里的蓝图或方向文字规定了 SKILL.md 从未提及的装置，或对同一个名字给出互相过定的尺寸指令。

## 复现约定

- 先设 `SKILL` 为 skill 根目录（含 `SKILL.md` 的那一层）的绝对路径，例如 `export SKILL="$HOME/frontend-studio"`。
- 除特别说明外，每条都在新的空目录里运行。复现脚本里已经写了 `cd "$(mktemp -d)"`。
- 全部可以离线运行。`inspect.mjs` 需要本机装有 Chrome、Edge 或 Chromium。
- 运行 `draw.mjs` 时要带上 `FRONTEND_STUDIO_HISTORY="$PWD/h.json"`，避免写进你自己的 `~/.frontend-studio/history.json`。
- 这台测试机的环境里设了 `NODE_TLS_REJECT_UNAUTHORIZED=0`，所以跑复现会多出一行 Node 的 TLS 警告，与 skill 无关。

## 总览

| # | 类型 | 位置 | 一句话 | 严重度 |
|---|---|---|---|---|
| 1 | 测量盲区 | `scripts/lib/probe.mjs:589-598` 对比 `scripts/inspect.mjs:197,211`、`SKILL.md:430` | `filled` 测的是色阶与文字行矩形，不是内容：内容完全相同的空屏，加一个色阶就测成 1.0；暗色页面上所有屏天然读低，而空屏 FAIL 要两屏低于 0.2 才触发 | 中 |
| 2 | 测量盲区 | `scripts/lib/probe.mjs:56-58,305-309,505` 对比 `scripts/lib/rules.mjs:133` | 藏在视口外（`top:-60px`）的 skip link 被算作首屏按钮，`first-action` 可以被一个无障碍构件单独满足 | 中 |
| 3 | 代码与文档矛盾 | `scripts/lib/rules.mjs:143` 对比 `SKILL.md:344-345` | step 9 明确允许"照片上的慢 drift / scroll-linked"作为那一个动图，inspect 却对任何零视频页报 `no-footage` | 中 |
| 4 | 代码与文档矛盾 | `scripts/lint.mjs:75` 对比 `SKILL.md:376`、`references/imagery.md:217-218` | 文档允许的中性 scrim 在 CSS 里就是 `linear-gradient(`，扫描器一律判 FAIL，唯一出路是 `fs-ignore` | 中 |
| 5 | 库与口味冲突 | `library/sections.json`（`proof-names-off-both-edges`）对比 `references/creative-patterns.md:81`、`SKILL.md` | 库会发一条 40 秒 translateX 的名字跑马灯；SKILL.md 全文 0 次提到跑马灯 | 低 |
| 6 | 文档内部过定 | `library/directions.json:27,52` 对比 `library/heroes.json:178` 及其 blueprint | "名字即纪念碑"方向对超过 12 字符的两词名字给出三套互相过定的尺寸指令，建页者要花一轮 look 调和 | 低 |
| 7 | 代码小缺陷 | `scripts/draw.mjs:232-234` 对比 `:275` | `--options 3` 的表头无条件印 "3 directions dealt"，`--tone` 把池子滤到只剩 2 个时仍然印 3 | 低 |

---

## 1. `filled` 测的是色阶和文字行矩形，不是内容：空屏加一个色阶就测成满，暗色页面整体读低

**位置**：`scripts/lib/probe.mjs:589-598`，每屏填充率的采样：

```js
if (textRects.some((r) => x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 4 && y <= r.bottom + 4)) { filled++; continue; }
let el = document.elementFromPoint(x, y);
for (let i = 0; el && i < 6 && el !== document.body && el !== document.documentElement; i++, el = el.parentElement) {
  if (/^(IMG|VIDEO|CANVAS|PICTURE|svg|IFRAME)$/.test(el.tagName) || el.closest('svg')) { filled++; break; }
  if (cs.backgroundImage !== 'none') { filled++; break; }
  const bg = cs.backgroundColor; if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') { if (bg !== pageBg) filled++; break; }
```

消费它的规则在 `scripts/inspect.mjs:197,211`：

```js
const empty = frameChecks.map((f, i) => ({ f, i })).filter(({ f }) => f && f.filled < 0.2);
...
if (w >= 1100 && surface === 'page' && !isArt && empty.length >= 2 && !allow.includes('empty-screens')) findings.push({ level: 'FAIL', id: 'empty-screens', ...
```

**机制**

- 一个采样点命中以下任一即算"有内容"：文字行矩形（还向外膨胀 6px/4px）、任何 IMG/VIDEO/CANVAS/SVG、任何 `backgroundImage`、**任何与 body 背景不同的 backgroundColor**。
- 最后一条意味着：给 section 加一个色阶——正是 `SKILL.md:430` 推荐的分区方式（"Surfaces are separated by a small step in tone, never by a line"）——整屏就测成 1.0，与屏上有没有内容无关。
- 反过来，在暗色或无色阶的页面上，只有文字和图片计入。本工作区三个真实 build 的实测：暗色的 `aes-room40` 十二屏里五屏读 0.18–0.33，其中一屏 0.18 已低于 FAIL 线，但因为只有一屏，`empty.length >= 2` 不成立，不报；浅色的 `aes-ferraz` 中段四屏每屏只有一张小图版加两行字，读 0.49–0.59，同样不报。 split-stage 的 `aes-meridian` 每屏 0.62–0.79，是对照组：问题出在蓝图，不出在建页的人。
- 后果：SKILL.md:42-46 自己警告过"blind jurors 每次都选更丰富的那页，哪怕它带着 tells"，`critique.md` pass 11 也要求逐屏检查空洞——但闸门对这条完全不设防，look 轮是唯一防线，而 look 轮看的是缩略拼图。

**复现**

```bash
cd "$(mktemp -d)"
cat > mk-sparse.cjs <<'EOF'
// node mk-sparse.cjs transparent|tone|dark  ->  sparse-<mode>.html
// 三个页面内容完全相同：六屏，每屏一张 320x210 的线画图版 + 一行 13px 灰 meta + 一行 17px 正文。只有底色不同。
const mode = process.argv[2];
const body = mode === 'dark' ? '#101318' : '#f7f6f2';
const ink = mode === 'dark' ? '#e8e6e2' : '#141414';
const mut = mode === 'dark' ? '#8b8f96' : '#6d6d6d';
const sec = mode === 'tone' ? 'background:#efeee9;' : mode === 'dark' ? 'background:#101318;' : '';
const plate = (i) => `<section style="min-height:100svh;${sec}padding:120px 64px;box-sizing:border-box">
<svg width="320" height="210" viewBox="0 0 320 210" role="img" aria-label="drawing ${i}"><rect x="40" y="30" width="120" height="120" fill="none" stroke="${ink}" stroke-width="4"/><line x1="10" y1="180" x2="310" y2="180" stroke="${ink}" stroke-width="6"/></svg>
<p style="font:13px/1.4 system-ui;color:${mut};margin:10px 0 0">Project ${i}, somewhere, 20${16 + i}</p>
<p style="font:17px/1.5 system-ui;color:${ink};margin:8px 0 0;max-width:58ch">Two sentences of caption about drawing ${i}, no more than that, set at body size in the full ink of this ground.</p>
</section>`;
require('node:fs').writeFileSync(`sparse-${mode}.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>sparse</title></head><body style="margin:0;background:${body};font-family:system-ui">${[1, 2, 3, 4, 5, 6].map(plate).join('')}</body></html>`);
EOF
for m in transparent tone dark; do
  node mk-sparse.cjs $m
  node "$SKILL/scripts/inspect.mjs" sparse-$m.html --surface page --widths 1440 --out out-$m --json > r-$m.json 2>/dev/null
  node -e 'const [f,l]=process.argv.slice(1); const r=require(f); const v=r.viewports.find(x=>x.width===1440);
    const es=r.findings.filter(x=>x.id==="empty-screens");
    console.log(l.padEnd(12), "filled", JSON.stringify(v.filled), " empty-screens:", es.length?es.map(x=>x.level).join(","):"(none)");' "./r-$m.json" "$m"
done
```

**预期**

```text
transparent  filled [0.07,0.07,0.07,0.07,0.07,0.07]  empty-screens: FAIL
tone         filled [1,1,1,1,1,1]  empty-screens: (none)
dark         filled [0.07,0.07,0.07,0.07,0.07,0.07]  empty-screens: FAIL
```

三个页面的文字与图版逐字节相同（只有底色不同）。打开 `out-transparent/desktop-page-01.jpg` 和 `out-tone/desktop-page-01.jpg` 对照：内容一模一样空，`tone` 却测成六屏全满、一声不吭；`transparent` 与 `dark` 读数相同，说明暗色偏置来自"有没有色阶"，不是来自颜色本身。

注意预期里 `transparent`/`dark` 触发了 FAIL——这正是要点：**这个规则只在页面诚实地不设色阶时才工作**。而 SKILL.md:430 教给建页者的分区方式恰好是色阶，于是按文档做事的页面会让这条规则永久失声；不按文档做事（纯色一片）的页面才会被它抓到。

**证伪**：满足以下任一项，本条不成立：`tone` 的 filled 不全为 1；`transparent` 与 `dark` 的 filled 数组不同；`tone` 也报 empty-screens。

**修复建议**：让 `filled` 只统计文字与媒体（去掉 backgroundColor 那一支），色阶改由别的规则检查；或者保留色阶支但把 empty-screens 的判据换成"文字+媒体覆盖率"。阈值 0.2 需要随之重新校准。

---

## 2. 藏在视口外的 skip link 被算作首屏按钮，`first-action` 可以被一个无障碍构件单独满足

**位置**：`scripts/lib/probe.mjs:56-58` 的 `isHidden`，`:305-309` 的按钮收集，`:505` 的 `inHero`；消费方 `scripts/lib/rules.mjs:133`。

```js
// probe.mjs:56
const isHidden = (el) => {
  if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ checkVisibilityCSS: true, contentVisibilityAuto: false })) return true;
  const d = el.closest('details:not([open])');
  ...
// probe.mjs:305 起：收集 a / button / [role=button] / input[submit]
for (const el of document.querySelectorAll('a, button, [role="button"], input[type="submit"]')) {
  if (isHidden(el)) continue;
  const r = el.getBoundingClientRect(); if (r.height < 28 || ... ) continue;   // 只筛尺寸，不筛位置
...
// probe.mjs:505
buttons: { count: buttons.length, inHero: buttons.filter((b) => b.top < H).length, ...
// rules.mjs:133
if (m.buttons.inHero === 0 && !(art && mobile)) add('WARN', 'first-action', `No visible button in the first ...
```

**机制**

- `isHidden` 只查 `checkVisibility` 和关闭的 `<details>`。`checkVisibility` 对**定位到视口外**的元素返回 true——它不是 `display:none`、不是 `visibility:hidden`、opacity 也不是 0。
- 而 skip link 的通行写法正是定位出去：`position:absolute; top:-60px`，聚焦时再滑进来。它有实底背景、高度约 44px、宽度约 190px，全部落在按钮收集器的尺寸窗口内；`top = -60 < H`，于是计入 `inHero`。
- 后果一：`first-action`（"首屏没有可见按钮"）可以被一个用户看不见的 skip link 单独满足。后果二：`metrics.buttons` 的 `radius` / `height` 取的是全体按钮的众数，skip link 会污染这组统计。
- 真实案例：本工作区 `aes-meridian` 的 inspect 报告里 `metrics.buttons.heroLabels` 在 1440 和 390 两个宽度下都是 `["Skip to the content", "Book by telephone"]`。

**复现**

```bash
cd "$(mktemp -d)"
cat > skip.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>skip</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#f7f6f2}
.skip{position:absolute;left:24px;top:-60px;z-index:40;background:#141414;color:#f7f6f2;padding:12px 20px;font-size:16px;text-decoration:none}
.skip:focus{top:24px}
section{min-height:100svh;padding:80px 64px;box-sizing:border-box}
h1{font-size:64px;line-height:1;margin:0 0 24px}
.btn{display:inline-block;background:#141414;color:#f7f6f2;padding:16px 28px;text-decoration:none}
</style></head><body>
<a class="skip" href="#main">Skip to the content</a>
<section><h1>A place that fixes bikes</h1><p>Four benches, one compressor, Tuesday evenings. The first screen carries no action on purpose: the booking button lives four screens down, where the prices are.</p></section>
<section id="main"><h2>What we do</h2><p>Wheels trued, cables bled, frames faced. Nothing else.</p></section>
<section><h2>Evenings</h2><p>Tuesday 18:00 to 21:00, bring your own tube.</p></section>
<section><h2>Prices</h2><p>Labour 12 an hour, parts at cost.</p><p><a class="btn" href="mailto:bench@example.org">Book a bench</a></p></section>
</body></html>
EOF
node "$SKILL/scripts/inspect.mjs" skip.html --surface page --widths 1440,390 --out out-skip --json > r-skip.json 2>/dev/null
node -e 'const r=require(process.argv[1]);
for (const v of r.viewports) {
  const fa=r.findings.filter(f=>f.id==="first-action"&&f.width===v.width);
  console.log(v.width+"px  inHero "+v.metrics.buttons.inHero+"  heroLabels "+JSON.stringify(v.metrics.buttons.heroLabels)+"  first-action: "+(fa.length?fa[0].level:"(none)"));
}' "./r-skip.json"
```

页面故意把唯一的主行动按钮放在第四屏（价格处）。首屏只有标题和一段话。

**预期**

```text
1440px  inHero 1  heroLabels ["Skip to the content"]  first-action: (none)
390px  inHero 1  heroLabels ["Skip to the content"]  first-action: (none)
```

首屏肉眼没有任何按钮，`first-action` 却不报——因为那个 `top:-60px` 的 skip link 替它答了题。

**证伪**：满足以下任一项，本条不成立：`heroLabels` 里不含 "Skip to the content"；`first-action` 报 WARN。

**修复建议**：按钮收集器里加位置筛：`if (r.bottom < 0 || r.top > H) continue;`（`inHero` 再要求 `r.top >= 0`）。同一行筛子也能顺带修掉"停在页面最底部的回顶按钮被算进首屏"这类情况。

---

## 3. step 9 允许 drift 作为"那一个动图"，inspect 却对任何零视频页报 `no-footage`

**位置**：`scripts/lib/rules.mjs:143`：

```js
if (!m.page.videoCount) add('WARN', 'no-footage', 'No video anywhere on the page.', 'Look for one honest clip with scripts/assets.mjs --video (the place, the material, the process) and use it as a muted loop with a poster frame. Defend its absence only if no clip fits the subject.');
```

对比 `SKILL.md:344-345`（step 9 的第四件）：

> 4. **One moving picture:** a found clip as a muted loop, a slow scale or drift on a photograph, or a
>    scroll-linked move on the hero picture.

**机制**

- 文档给"那一个动图"列了三种合法做法：找来的片子、照片上的慢 scale/drift、hero 照片上的 scroll-linked 移动。后两种不需要任何 `<video>`。
- 规则只看 `videoCount`。于是按文档选了 drift 的页面永远背一条 WARN，而它的 fix 文案又只给两条路：找片子，或者辩护"没有片子适合这个 subject"——可页面已经按文档做了 drift，这条 WARN 实际上在要求文档没要求的东西。
- 本工作区三个真实 build 全部背着这条 WARN 交付，辩护理由都是"开放图库里没有诚实的片子"（听音吧搜到的是铁路转盘与航天器 turntable；建筑事务所搜到的是化装民俗节；诊所搜到的是实验室大鼠跑台）。

**复现**

```bash
cd "$(mktemp -d)"
cat > make-png.cjs <<'EOF'
// node make-png.cjs  ->  p1.png p2.png p3.png p4.png  (480x300 纯色)
const zlib = require('node:zlib'), fs = require('node:fs');
const T=[...Array(256)].map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc=(b)=>{let c=0xffffffff;for(const x of b)c=T[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
const W=480,H=300;
[70,110,150,190].forEach((s,i)=>{
  const raw=Buffer.alloc(H*(W*3+1));
  for(let y=0;y<H;y++){raw[y*(W*3+1)]=0;for(let x=0;x<W;x++){const o=y*(W*3+1)+1+x*3;raw[o]=s;raw[o+1]=s;raw[o+2]=s+20;}}
  const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=2;
  fs.writeFileSync(`p${i+1}.png`,Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
});
console.log('wrote p1.png p2.png p3.png p4.png');
EOF
node make-png.cjs
cat > drift.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>drift</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#ffffff}
header{padding:64px}
header p{max-width:60ch}
h1{font-size:64px;line-height:1;margin:0 0 16px}
.btn{display:inline-block;background:#141414;color:#ffffff;padding:14px 24px;text-decoration:none}
figure{margin:0;position:relative;overflow:hidden;height:60svh}
figure img{width:100%;height:100%;object-fit:cover;animation:drift 24s ease-in-out infinite alternate}
@keyframes drift{from{transform:scale(1)}to{transform:scale(1.08)}}
section{padding:80px 64px}
.rise{opacity:0;transform:translateY(24px);animation:rise .7s ease-out forwards}
.rise:nth-child(2){animation-delay:.08s}.rise:nth-child(3){animation-delay:.16s}.rise:nth-child(4){animation-delay:.24s}
.rise:nth-child(5){animation-delay:.32s}.rise:nth-child(6){animation-delay:.4s}.rise:nth-child(7){animation-delay:.48s}
.rise:nth-child(8){animation-delay:.56s}.rise:nth-child(9){animation-delay:.64s}.rise:nth-child(10){animation-delay:.72s}
.rise:nth-child(11){animation-delay:.8s}.rise:nth-child(12){animation-delay:.88s}.rise:nth-child(13){animation-delay:.96s}
.rise:nth-child(14){animation-delay:1.04s}.rise:nth-child(15){animation-delay:1.12s}.rise:nth-child(16){animation-delay:1.2s}
@keyframes rise{to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){figure img,.rise{animation:none;opacity:1;transform:none}}
</style></head><body>
<header><h1>Four grey fields</h1><p>A minimal page whose only moving picture is the slow drift SKILL.md step 9 allows in place of a clip.</p><p><a class="btn" href="mailto:bench@example.org">Ask about the fields</a></p></header>
<figure><img src="p1.png" alt="a grey field"></figure>
<section>
<p class="rise">One.</p><p class="rise">Two.</p><p class="rise">Three.</p><p class="rise">Four.</p>
<p class="rise">Five.</p><p class="rise">Six.</p><p class="rise">Seven.</p><p class="rise">Eight.</p>
<p class="rise">Nine.</p><p class="rise">Ten.</p><p class="rise">Eleven.</p><p class="rise">Twelve.</p>
<p class="rise">Thirteen.</p><p class="rise">Fourteen.</p><p class="rise">Fifteen.</p><p class="rise">Sixteen.</p>
</section>
<section><figure><img src="p2.png" alt="a second grey field"></figure></section>
<section><figure><img src="p3.png" alt="a third grey field"></figure></section>
<section><figure><img src="p4.png" alt="a fourth grey field"></figure></section>
</body></html>
EOF
node "$SKILL/scripts/inspect.mjs" drift.html --surface page --widths 1440 --out out-drift --json > r-drift.json 2>/dev/null
node -e 'const r=require(process.argv[1]);
if(!r.findings.length) console.log("(no findings)");
for(const f of r.findings) console.log(f.level, f.id, "|", f.message.slice(0,110));
console.log("motion elements @1440:", r.viewports.find(v=>v.width===1440).motion.elements);' "./r-drift.json"
```

页面有四张真图（满足图片下限）、16 个入场动效加一个 24 秒的照片 drift（满足动效下限，且 reduced-motion 下保留内容），没有任何 `<video>`。

**预期**

```text
wrote p1.png p2.png p3.png p4.png
WARN no-footage | No video anywhere on the page.
motion elements @1440: 20
```

只有这一条 WARN：页面已经做了文档允许的 drift，仍然因为零视频被记一笔。

**证伪**：满足以下任一项，本条不成立：输出里没有 `no-footage`；SKILL.md step 9 的第四件不列 drift / scroll-linked 两种无片做法。

**修复建议**：让 probe 报告"有没有在动的图片"（对 `img`/`figure` 取 computed animation 或 scroll-linked 的 transform 变化），规则改成"既无 clip 也无在动的图片"才 WARN；或者把 SKILL.md:344 改成如实描述：page 模式期望一个 clip，drift 只是退路。

---

## 4. 文档允许的中性 scrim 在 CSS 里就是 `linear-gradient(`，扫描器一律判 FAIL

**位置**：`scripts/lint.mjs:75`：

```js
['FAIL', 'gradient', /(linear|radial|conic)-gradient\(|\bbg-(gradient|linear|radial|conic)-|\b(from|via)-(?!\[?0)[a-z]+-\d{2,3}\b/, 'Gradient fill. Use a flat colour or a real image (a neutral scrim over a photo is the one exception).'],
```

对比 `SKILL.md:376` 同一行的"代替做法"列：

> | **No gradients.** Not as backgrounds, not on buttons, not in text. | Flat colour, or a real photograph. **A neutral scrim under text on a photo is the one exception.** | Unchanged. |

和 `references/imagery.md:217-218`：

> For text on a photograph, a neutral scrim covering only the text area: a solid block at 40–55% black,
> or **a fade from 55% black to transparent over the lower third**. Never a coloured overlay.

**机制**

- 规则自己的 message 承认 scrim 是唯一例外，imagery.md 还给出了渐隐式 scrim 的配方；但"从 55% 黑渐隐到透明"在 CSS 里只能写成 `linear-gradient(...)`。
- 正则的第一支就是字面的 `(linear|radial|conic)-gradient(`，没有任何例外分支。源码级扫描器看不到"这个渐变是不是中性的、是不是只盖文字区"。
- 于是按文档做 scrim 的建页者拿到 FAIL，唯一出路是行尾 `fs-ignore`——而 SKILL.md:319 说不要对闸门藏东西。改做实底色块（文档的另一种 scrim）可以过，但那就失去了渐隐，照片与文字之间会出现一条硬边。

**复现**

```bash
cd "$(mktemp -d)"
cat > scrim.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>scrim</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#f7f6f2}
.shot{position:relative;height:70svh;overflow:hidden}
.shot img{width:100%;height:100%;object-fit:cover}
.scrim{position:absolute;left:0;right:0;bottom:0;padding:32px 64px;
  background:linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0));}
.scrim h1{font-size:56px;line-height:1.05;margin:0;color:#fff}
</style></head><body>
<div class="shot"><img src="p1.png" alt="a grey field"><div class="scrim"><h1>The name over the picture</h1></div></div>
</body></html>
EOF
node "$SKILL/scripts/lint.mjs" scrim.html --surface page
```

**预期**

```text
FAIL
  [gradient] Gradient fill. Use a flat colour or a real image (a neutral scrim over a photo is the one exception).  (1×)
      scrim.html:7  linear-gradient(

RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
```

lint 印的是正则匹配到的片段（`linear-gradient(`）和它所在的行号。判 FAIL 的那条 message 自己写着"scrim 是唯一例外"。

**证伪**：满足以下任一项，本条不成立：这条 scrim 不报 FAIL；SKILL.md:376 或 imagery.md:217 不承认渐隐式 scrim。

**修复建议**：给正则加中性 scrim 的例外分支，例如允许 `linear-gradient(` 后面只跟黑/白的 rgba 或 hsl 停止色：`linear-gradient\((?![^)]*(?:#[0-9a-f]{3,8}|hsl|(?!rgba\(\s*0,\s*0,\s*0)[a-z]))` 一类的负向断言；或者在 lint 里对"停止色全为黑或白且带 alpha"的渐变放行。

---

## 5. 库会发一条 40 秒的名字跑马灯，而 SKILL.md 全文不提跑马灯

**位置**：`library/sections.json` 的 `proof-names-off-both-edges` 蓝图原文：

> A full-bleed band in a flat colour, about 34vh tall, holding a single line of names that is cropped by
> both viewport edges. The names are set at 8vw in the display weight, `white-space: nowrap`, separated by
> a solid round dot one third of the cap height, and **the line moves slowly to the left (a CSS `translateX`
> animation over 40 seconds on a duplicated track, paused under `prefers-reduced-motion`)**.

对比 `references/creative-patterns.md:81`：

> | **Kinetic marquee** | One line of very large type travelling sideways is the direction's own move | One marquee per page, pause on hover, stop under reduced motion, and the text must be readable at speed. |

而 `SKILL.md` 里 `marquee` 出现 0 次；house rules（SKILL.md:368-385）与 `references/tells.md` 都没有把它列为禁项或 tell。

**机制**

- 这张蓝图是 `proof` 角色的可发选项之一。抽到它的 build 会拿到一条规定好的跑马灯；想要去掉，只能走 SKILL.md:167-170 的 `--alternatives proof` / `--redraw section:proof=<id>`，而文档给 redraw 列的理由是"与已声明的品牌约束矛盾，或需要不存在的资产"——"我的口味禁跑马灯"要stretch 成"品牌约束"才用得上。
- 本工作区 `aes-ferraz` 的 build 就抽到了它，靠 `--alternatives` 换成了 `proof-recognition-table` 才避开。
- 这不是代码 bug：库与 creative-patterns 是自洽的（跑马灯作为签名动作合法）。问题是 SKILL.md 的 house rules 与 tells 对跑马灯只字不提，读 SKILL.md 做事的 agent 没有任何依据知道这是一条需要主动拒绝的蓝图。

**复现**

```bash
node -e '
const S = process.argv[1];
const e = require(S + "/library/sections.json").find((x) => x.id === "proof-names-off-both-edges");
console.log("blueprint:", (e.blueprint.match(/[^.]*translateX[^.]*\./) || ["(not found)"])[0].trim());
' "$SKILL"
sed -n '81p' "$SKILL/references/creative-patterns.md"
echo "SKILL.md marquee mentions: $(grep -c -i marquee "$SKILL/SKILL.md")"
```

**预期**

```text
blueprint: The names are set at 8vw in the display weight, `white-space: nowrap`, separated by a solid round dot one third of the cap height, and the line moves slowly to the left (a CSS `translateX` animation over 40 seconds on a duplicated track, paused under `prefers-reduced-motion`).
| **Kinetic marquee** | One line of very large type travelling sideways is the direction's own move | One marquee per page, pause on hover, stop under reduced motion, and the text must be readable at speed. |
SKILL.md marquee mentions: 0
```

**证伪**：满足以下任一项，本条不成立：该蓝图不含 translateX 移动带；SKILL.md 提到 marquee（计数 ≥ 1）。

**修复建议**：二选一并写明白。若跑马灯合法：在 SKILL.md 的 house rules 或 tells 里加一行，说明 travelling band 只在作为方向签名动作时合法、且一页至多一条（与 creative-patterns.md:81 对齐）。若非法：把这张蓝图从 `proof` 的默认池移到需要显式 `--alternatives` 才出现的位置，或直接在蓝图里去掉移动。

---

## 6. "名字即纪念碑"方向对两词名字给出三套互相过定的尺寸指令

**位置**：`library/directions.json:27`（`name-as-monument` 的 idea）、`:52`（同方向的 pitfalls），对比 `library/heroes.json:178`（`film-title-on-bottom-edge` 的 headline 字段）及其 blueprint。

**复现**

```bash
node -e '
const S = process.argv[1];
const dir = require(S + "/library/directions.json").find((d) => d.id === "name-as-monument");
const her = require(S + "/library/heroes.json").find((x) => x.id === "film-title-on-bottom-edge");
console.log("directions idea     :", (dir.idea.match(/[^.]*as wide as the viewport[^.]*\./) || ["(not found)"])[0].trim());
console.log("directions pitfalls :", (dir.pitfalls.match(/[^.]*12 characters[^.]*\./) || ["(not found)"])[0].trim());
console.log("heroes headline     :", her.headline);
console.log("heroes blueprint    :", (her.blueprint.match(/clamp\(150px.*?margins\./) || ["(not found)"])[0].trim());
' "$SKILL"
```

**预期**

```text
directions idea     : Set it so large that it becomes architecture: as wide as the viewport, cropped by an edge, or stacked to fill the screen.
directions pitfalls : If the name has more than about 12 characters, stack it on two lines or crop it with the viewport edge; never drop below 12vw.
heroes headline     : The name of the place: one word of up to about 12 characters at 17.5vw, or two words stacked on a phone.
heroes blueprint    : clamp(150px, 17.5vw, 290px) and sized to span the full width between 32px margins.
```

**机制**

- 四句话对"名字怎么放"给了三套指令：idea 说"和视口一样宽、或被边裁掉、或叠起来填满整屏"；pitfalls 说"超过 12 字符就叠两行或裁边，不得低于 12vw"；hero 的 headline 字段说"一个 ≤12 字符的词、17.5vw，**两词叠行只发生在手机上**"；hero 的 blueprint 说"一行、clamp(150px, 17.5vw, 290px)、撑满 32px 边距之间的全宽"。
- 对一个 12 字符以上的两词名字（例如 "Atelier Ferraz"，14 字符），在桌面宽度下：headline 字段不允许叠行（叠行只给手机），blueprint 要求一行撑满全宽（14 字符撑满 1376px 需要远超 290px 的字号，突破 clamp 上限），pitfalls 又要求叠行且不低于 12vw。三条不能同时成立。
- 后果是建页者必须自己裁决优先级并花一轮 look 验证。本工作区 `aes-ferraz` 的 build 在第一轮截图里发现导航与注记被压住或裁掉，才 settle 成"两行、18.5/19.6vw 上限、照片带与墨色场分成两块"。
- SKILL.md:158-178 给的优先级是"house rules → direction → palette/type → hero blueprint"，但 idea 与 pitfalls 同属 direction 一层，互相冲突时这串优先级不给答案。

**证伪**：满足以下任一项，本条不成立：四句中任何一句已改到与其余三句相容；或存在一个字号能同时满足"一行撑满 1376px"与"≤290px"。

**修复建议**：把尺寸规则收成一条：≤12 字符一行、用 clamp；超过 12 字符叠两行、用 clamp 下限且不低于 12vw；删掉 idea 里的 "as wide as the viewport / stacked to fill the screen"，或把它限定在 ≤12 字符的情形。

---

## 7. `--options 3` 的表头无条件印 3，`--tone` 把池子滤到 2 个时仍然印 3

**位置**：`scripts/draw.mjs:232-234` 与 `:275`：

```js
// :232
const n = Math.max(2, Math.min(5, Number(opt('options')) || 3));
const options = dealOptions(input, n);
console.log(`# ${n} directions dealt for this brief\n`);
// :275（dealOptions 内部）
if (input.tone) { const toned = pool.filter((d) => (d.tones || []).includes(input.tone)); if (toned.length >= 2) pool = toned; }
```

**机制**

- 表头印的是**请求的** `n`，不是 `options.length`。`--tone` 会把池子滤到带该 tone 的方向；当只剩 2 个时（`toned.length >= 2` 才替换池子），实际发 2 个，表头仍说 3。
- SKILL.md:124-127 让建页者"把每一个都对着 inventory 比一遍，选能承载 subject 的那个"。表头说 3 而只列 2，会让建页者以为漏印了一个，或怀疑自己命令写错。
- 本工作区 `aes-room40` 的 build 就遇到：`--sector music --tone quiet --options 3` 印着 "# 3 directions dealt"，下面只有 `contact-sheet` 和 `dark-room` 两个。

**复现**

```bash
cd "$(mktemp -d)"
export FRONTEND_STUDIO_HISTORY="$PWD/h.json"
node "$SKILL/scripts/draw.mjs" --sector music --brief "a vinyl listening bar in a tenement flat" --tone quiet --options 3 > opts.txt 2>/dev/null
head -1 opts.txt
echo "option blocks listed: $(grep -c '^## ' opts.txt)"
grep '^## ' opts.txt
```

**预期**

```text
# 3 directions dealt for this brief
option blocks listed: 2
## `dark-room` — The dark room
## `contact-sheet` — The contact sheet
```

（两个方向的先后以发牌为准；要点是计数 3 对 2。）

**证伪**：表头数字与 `^## ` 块数一致，本条不成立。

**修复建议**：表头改印实际数量：`console.log(\`# ${options.length} directions dealt for this brief\n\`)`；若过滤后不足请求数，加一行说明是哪个参数滤的。
