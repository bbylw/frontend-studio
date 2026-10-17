# frontend-studio skill — 现存问题（2.2.1）

> 版本：`github.com/bbylw/frontend-studio` @ `4ef4ef2`（CHANGELOG 2.2.1）。
> 测试环境：Windows / Git Bash / Node v24.20.0 / 本机 Chrome。
> 只收当前版本仍存在、并已用最小复现确认的问题。每条给出代码位置与原文、可直接粘贴运行的复现、预期输出和证伪条件。你跑出的结果与"预期"不符，该条即不成立。

## 背景（写给没用过这个 skill 的读者）

frontend-studio 是一个做网页的 agent skill。`scripts/` 下有四个零依赖的 Node 脚本：

| 脚本 | 作用 |
|---|---|
| `draw.mjs` | 从 `library/*.json` 里随机"发牌"，生成一份设计方向表（direction sheet），内容包括方向、首屏、各段落蓝图、字体、配色和动效。会给蓝图附 "Adjusted for this page" 注记 |
| `assets.mjs` | 搜索并下载自由许可的图片，把署名信息记进 `assets/credits.json`。`--credits` 打印页脚署名 HTML 和报告用清单 |
| `lint.mjs` | 对源码做静态正则扫描，报 FAIL/WARN。有 FAIL 时退出码为 1 |
| `inspect.mjs` | 用本机 Chrome 渲染页面，逐屏截图并测量，报 FAIL/WARN |

`lint` 和 `inspect` 都有 `--surface page|product` 两种模式。product 指仪表盘、后台这类工作界面，部分规则在这个模式下放宽。

SKILL.md:317-319 规定："Fix every `FAIL`. Treat each `WARN` as wrong unless you can defend it to a designer in one sentence. … Do not argue with the meter and do not hide things from it."

## 复现约定

- 先设 `SKILL` 为 skill 根目录（含 `SKILL.md` 的那一层）的绝对路径，例如 `export SKILL="$HOME/frontend-studio"`。
- 除特别说明外，每条都在新的空目录里运行。复现脚本里已经写了 `cd "$(mktemp -d)"`。
- 全部可以离线运行。第 1 条另附一个需要联网的"真实流程"版本，可选。
- `inspect.mjs` 需要本机装有 Chrome、Edge 或 Chromium。
- 运行 `draw.mjs` 时要带上 `FRONTEND_STUDIO_HISTORY="$PWD/h.json"`。不带的话，它会写进你自己的 `~/.frontend-studio/history.json`，而历史会影响以后的发牌。在同一 seed、空历史下，发牌结果是确定的。
- macOS 没有 `md5sum`，换成 `md5 -r`。

## 总览

| # | 类型 | 位置 | 一句话 | 严重度 |
|---|---|---|---|---|
| 1 | 逻辑 bug | `scripts/assets.mjs:844` | 同一张图记录了两次，且其中一份文件已删除时，`--credits` 会把仍在使用的那份的署名一起丢掉，不给任何提示 | 中 |
| 2 | 代码与文档矛盾 | `scripts/inspect.mjs:201-202` 对比 `references/motion.md:475-476`、`creative-patterns.md:77`、`scripts/draw.mjs:423` | `long-pin` 在钉住第 3 屏时就告警，而文档和发牌注记都说"3 屏可以，超过 3 屏才告警"。库里有蓝图照做就会触发 | 中 |
| 3 | 检测盲区（漏报） | `scripts/lib/probe.mjs:602` | `long-pin` 只统计 h1–h6/p/blockquote。渲染完全相同的页面，把常驻大字换成 `<div>` 或 `<span>` 就不再告警 | 低 |
| 4 | 代码与代码、文档与文档矛盾 | `scripts/lint.mjs:101` 对比 `scripts/lib/rules.mjs:33`；`references/product-surfaces.md:115/121/128` 对比 `references/tells.md:9-17` | product 模式下，inspect 把 eyebrow 和 micro-label 降为 WARN，lint 仍判 FAIL。同一文件在同一模式下，两个 gate 工具结论相反，两份文档也各执一词 | 中 |

---

## 1. `assets.mjs --credits` 先按 ref 去重、再检查文件是否存在，导致仍在使用的图片署名被静默丢掉

**位置**：`scripts/assets.mjs:844`

```js
const uniq = list.filter((c, i) => list.findIndex((x) => x.ref === c.ref) === i && existsSync(resolve(c.file)));
```

**机制**

- `credits.json` 的每条记录有 `file`（本地文件）和 `ref`（来源图片 id）。`recordCredit`（`assets.mjs:717`）只替换 `file` 相同的旧条目，新条目追加在末尾。
- 因此，同一张图用不同文件名下载两次（先 `--get <ref>`，再 `--get <ref> --name hero`），会留下两条 `ref` 相同的记录，旧的在前。
- `--credits` 想同时做两件事：同一张图只署一次名（按 `ref` 去重），以及跳过已删除的文件（`existsSync`）。但两个条件写在同一个 `filter` 里：
  - `findIndex` 只认第一条。第一条的文件已删除，被 `existsSync` 剔掉。
  - 第二条的文件还在，却因为"不是第一条"被去重剔掉。
  - 结果这张图一条署名都不剩。
- 整个过程不报警告，退出码是 0。如果这是页面上唯一的图，会打印 "No pictures recorded … yet"，退出码 1。
- 复现里用的图是 CC BY-SA，`creditRequired: true`。丢掉署名就是违反许可，也违反 SKILL.md:445 的要求："Every found picture is downloaded into the project, credited on the surface and listed in the report."

**复现（离线 A/B 对照：两份 credits.json 只差条目顺序）**

```bash
cd "$(mktemp -d)" && mkdir assets
cat > mk.cjs <<'EOF'
// node mk.cjs old-first|hero-first  ->  assets/credits.json
const e = (file, ref, title, creator) => ({ file, media: 'image', ref, title, creator,
  license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', creditRequired: true,
  page: 'https://commons.wikimedia.org/wiki/File:' + title.replace(/ /g, '_') + '.jpg', via: 'Wikimedia Commons',
  credit: `"${title}" by ${creator}, CC BY-SA 4.0, via Wikimedia Commons` });
const alfama = (file) => e(file, 'commons:152563473', 'Alfama, Lisbon (DSC03371)', 'Matti Blume');
const other = e('assets/b.jpg', 'commons:1', 'Other picture', 'Someone');
const lists = {
  'old-first':  [alfama('assets/old-name.jpg'), alfama('assets/hero.jpg'), other],
  'hero-first': [alfama('assets/hero.jpg'), alfama('assets/old-name.jpg'), other],
};
require('node:fs').writeFileSync('assets/credits.json', JSON.stringify(lists[process.argv[2]], null, 1));
EOF
echo x > assets/hero.jpg; echo x > assets/b.jpg      # assets/old-name.jpg 故意不存在
for o in old-first hero-first; do
  echo "=== $o"; node mk.cjs $o; node "$SKILL/scripts/assets.mjs" --credits; echo "exit=$?"
done
```

**预期输出（节选）**

```text
=== old-first
<p class="credits">Pictures: <a href="https://commons.wikimedia.org/wiki/File:Other_picture.jpg">“Other picture”</a> by Someone, ... via Wikimedia Commons.</p>
- assets/b.jpg: "Other picture" by Someone, CC BY-SA 4.0, via Wikimedia Commons. https://commons.wikimedia.org/wiki/File:Other_picture.jpg
exit=0
=== hero-first
<p class="credits">Pictures: <a href="...Alfama,_Lisbon_(DSC03371).jpg">“Alfama, Lisbon (DSC03371)”</a> by Matti Blume, ...; <a href="...Other_picture.jpg">“Other picture”</a> by Someone, ...</p>
- assets/hero.jpg: "Alfama, Lisbon (DSC03371)" by Matti Blume, CC BY-SA 4.0, via Wikimedia Commons. ...
- assets/b.jpg: "Other picture" by Someone, CC BY-SA 4.0, via Wikimedia Commons. ...
exit=0
```

`old-first` 是自然流程产生的顺序。这时 `assets/hero.jpg` 存在且有记录，但 Alfama 的署名从页脚和报告清单里同时消失，也没有任何提示。

**真实流程复现（可选，需要能访问 Wikimedia Commons）**

```bash
cd "$(mktemp -d)"
node "$SKILL/scripts/assets.mjs" --get commons:152563473              # 存为 assets/alfama-lisbon-dsc03371.jpg
node "$SKILL/scripts/assets.mjs" --get commons:152563473 --name hero   # 同一张图另存为 assets/hero.jpg，credits.json 追加第二条
rm assets/alfama-*.jpg                                                 # 页面只用 hero.jpg，删掉旧文件
node "$SKILL/scripts/assets.mjs" --credits; echo "exit=$?"
```

预期：输出 `No pictures recorded in assets/credits.json yet. Download them with --get <ref> first.`，`exit=1`。而此时 `assets/hero.jpg` 和它的记录都还在。

**证伪**：`old-first` 的输出里如果出现 "Alfama"，本条不成立。

**修复建议**：先按文件是否存在过滤，再按 ref 去重。我在 scripts 副本上验证过，改后两种顺序都输出完整的两条署名：

```js
const live = list.filter((c) => existsSync(resolve(c.file)));
const uniq = live.filter((c, i) => live.findIndex((x) => x.ref === c.ref) === i);
```

另有一条改进建议（不算缺陷）：对已记录但文件不存在的条目打印一行提示，便于发现手工改名的情况。

---

## 2. `long-pin` 的阈值：代码在第 3 屏就告警，文档都说"超过 3 屏才告警"

**规则在做什么**

- `inspect.mjs` 每滚动一个视口高度截一帧（`scrollTo({ top: i*h })`，`inspect.mjs:158`）。
- 每帧收集完全处于视口内的大字（`probe.mjs:602`）。
- 同一段文字连续出现在 3 帧或以上，就报 WARN `long-pin`。只在宽度 ≥1100 时检查。

**各处说法**

| 出处 | 原文 | 含义 |
|---|---|---|
| `scripts/inspect.mjs:201-202` | `filter(([, r]) => r.best >= 3)`；fix 文案 "A pinned element earns two screens" | 3 屏就告警 |
| `references/motion.md:475-476` | "A pinned section earns two or three screens (the inspector warns past three)" | 3 屏可以，超过才告警 |
| `references/creative-patterns.md:77` | "The inspector warns past three pinned screens" | 同上 |
| `scripts/draw.mjs:423`（作为 "Adjusted for this page" 注记印进方向表） | "hold a pin for two or three screens at most, … (the inspector checks all three)" | 最多 3 屏 |
| `library/directions.json:164`（方向表 §10） | "A pin longer than three screens … read in blind tests as a stuck page." | 超过 3 屏才算问题 |

**后果**

- 库蓝图 `library/sections.json:2566`，即 "Pinned sentence, photographs pass"，原文是 "A wrapper 300svh tall … holds one sentence … at clamp(36px, 4.6vw, 68px) … The sentence is a paragraph, not a heading"。
- 照做正好钉 3 屏，必然 WARN。draw 给它附的注记（"two or three screens at most"）也允许 3 屏。
- 按 SKILL.md:317-319，agent 只有两条路：违背蓝图和注记，或者背着一个"默认视为错误"的 WARN 交付。

**2b. `draw.mjs:423` 的注记正则漏掉了两张钉得更久的蓝图**

注记的触发条件是：文本里出现 "three/four/five/six viewports|screens" 或 "300–600svh"。下面两张蓝图都把同一标题钉住远超 3 屏，却不会触发这条注记：

- `library/sections.json:2713`，"Pinned title, portraits pass"：原文 "about 90svh per person, up to six people"，最后一张肖像之后还有 40svh 空白。
- `library/heroes.json:87`，"Pinned title over portraits"：原文 "further portraits … replace the first, five to eight in all, … before the layer releases"。

同一张方向表里还同时印着另外三句：

- "Keep the pinned run under six screens"（`library/motions.json:20`）
- "under six viewports"（`directions.json:164`）
- "Five to eight in the pinned run"（`directions.json:156`）

**复现 (a)：原文对照**

```bash
grep -n "warns past three" "$SKILL/references/motion.md" "$SKILL/references/creative-patterns.md"
grep -noE "r\.best >= 3|A pinned element earns two screens" "$SKILL/scripts/inspect.mjs"
grep -noE "hold a pin for two or three screens at most" "$SKILL/scripts/draw.mjs"
```

**复现 (b)：分别钉住 2 屏和 3 屏**

```bash
cd "$(mktemp -d)"
cat > pin.cjs <<'EOF'
// node pin.cjs <包裹层高度,单位svh> <常驻大字的标签>  ->  pin-<h>-<tag>.html
const [h, tag] = process.argv.slice(2);
const sec = (i) => `<section style="min-height:100svh;padding:40px"><h2 style="font-size:40px;margin:0">Chapter number ${i}</h2><p style="font-size:18px">Ordinary content after the pinned section.</p></section>`;
const pinned = `<${tag} style="display:block;margin:0;font-size:96px;font-weight:400;line-height:1.1">One pinned statement</${tag}>`;
require('node:fs').writeFileSync(`pin-${h}-${tag}.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>pin</title></head><body style="margin:0;font-family:Georgia,serif"><div style="height:${h}svh"><div style="position:sticky;top:0;height:100svh;padding:40px;box-sizing:border-box">${pinned}</div></div>${Array.from({ length: 5 }, (_, i) => sec(i + 1)).join('')}</body></html>`);
EOF
lp() {
  node "$SKILL/scripts/inspect.mjs" pin-$1-$2.html --widths 1440 --out out-$1-$2 --json > r-$1-$2.json
  node -e 'const r=require(process.argv[1]); const f=r.findings.filter(x=>x.id==="long-pin"); console.log(process.argv[2].padEnd(9), f.length ? f.map(x=>x.level+" "+x.message).join(" / ") : "(no long-pin finding)")' "./r-$1-$2.json" "$1 $2"
}
for run in "200 p" "300 p"; do set -- $run; node pin.cjs $1 $2; lp $1 $2; done
```

预期：

```text
200 p     (no long-pin finding)
300 p     WARN The same large text stays on screen for 3 screens in a row: "One pinned statement"
```

**复现 (c)：一张真实方向表里同时出现两个 pin 段落和 "under six"**

在 (b) 的同一目录里继续运行：

```bash
FRONTEND_STUDIO_HISTORY="$PWD/h.json" node "$SKILL/scripts/draw.mjs" --sector culture --brief "photography festival" --direction pinned-poster --seed 12345 > sheet.md
grep -noE "^### [0-9]\. [a-z]+ — .*|wrapper 300svh tall|up to six people|two or three screens at most|under six (screens|viewports)|Five to eight in the pinned run|A pin longer than three screens" sheet.md
```

预期输出包含以下几处：

- `### 1. intro — Pinned sentence, photographs pass (pinned)`。它下面有 "wrapper 300svh tall" 和 "two or three screens at most" 注记。
- `### 4. about — Pinned title, portraits pass (pinned)`。它下面有 "up to six people"，但在下一个 `###` 之前没有 "two or three screens at most" 注记。这就是 2b。
- "under six screens"、"under six viewports"、"Five to eight in the pinned run"、"A pin longer than three screens"。

输出里还会有 `### 2. gallery — Full-bleed sequence, text interlocked (full-bleed)`，下面同样有 "wrapper 300svh tall" 和那条注记。这一段钉住的是照片，没有大字，long-pin 不检查它，与本条无关。

**复现 (d)：2b 的正则检查（正则抄自 `draw.mjs:423`）**

```bash
node -e '
const re1 = /(?:sticky|pinned|pins?\b|stays? (?:fixed|put|in place))/i;
const re2 = /\b(?:three|four|five|six) (?:to (?:four|five|six) )?(?:viewports|screens)\b|\b[3-6]00svh\b/i;
for (const [f, name] of [["sections", "Pinned sentence, photographs pass"], ["sections", "Pinned title, portraits pass"], ["heroes", "Pinned title over portraits"]]) {
  const e = require(process.argv[1] + "/library/" + f + ".json").find((x) => x.name === name);
  const t = [e.blueprint, e.mobile, e.headline].filter(Boolean).join(" ");
  console.log(name.padEnd(34), "pin note:", re1.test(t) && re2.test(t));
}' "$SKILL"
```

预期：

```text
Pinned sentence, photographs pass  pin note: true
Pinned title, portraits pass       pin note: false
Pinned title over portraits        pin note: false
```

**证伪**：满足以下任一项，本条不成立：(b) 中 `300 p` 没有 long-pin；(a) 中某份文档写的是 "warns at three"。

**修复建议**：先由作者定一个数，然后统一所有出处。

- 若 3 屏合法：把 `inspect.mjs:201` 改为 `r.best > 3`，fix 文案改为 "two or three screens"。
- 若 3 屏就该告警：
  - 改 motion.md:475-476、creative-patterns.md:77、draw.mjs:423 的注记和 directions.json:164 的措辞。
  - 把写着 300svh 的蓝图改成 200svh。
  - 扩展 draw.mjs:423 的正则，覆盖 "per person, up to six" 和 "five to eight" 这类写法。
  - 删掉 "under six" 这两处。

---

## 3. `long-pin` 只认 h1–h6/p/blockquote：渲染完全相同，换个标签就不告警

**位置**：`scripts/lib/probe.mjs:602`，每帧大字列表的选择器：

```js
document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, blockquote')   // 再要求 fontSize >= 32、完全在视口内、至少 4 个字符
```

同一文件里，给 `covered-text`、`clipped-text`、`pinned-over-picture` 三项检查（`inspect.mjs:192-196`）取数的循环（`probe.mjs:544`）用的是更宽的集合：`'h1, h2, h3, h4, h5, h6, p, blockquote, li, a, button, span, div'`。

**复现**：在第 2 条复现 (b) 的同一目录里继续运行，需要用到其中的 `pin.cjs` 和 `lp`：

```bash
for run in "600 p" "600 div" "600 span"; do set -- $run; node pin.cjs $1 $2; lp $1 $2; done
md5sum out-600-*/desktop-fold.jpg out-600-*/desktop-page-0[12].jpg | sort
```

**预期**

```text
600 p     WARN The same large text stays on screen for 6 screens in a row: "One pinned statement"
600 div   (no long-pin finding)
600 span  (no long-pin finding)
```

md5 分成三组，每组三个哈希相同，说明三种标签的首屏截图和逐屏截图逐字节一致。`pin.cjs` 已经用 `display:block; margin:0; font-weight:400` 抹平了各标签的默认样式。

**后果**

- 同一段钉了 6 屏的大字，写成 `<p>` 报 WARN，写成 `<div>` 或 `<span>` 则完全不报。6 屏已经超过任何一处文档写的上限，包括 "under six"。
- 规则是否生效取决于标签，而不取决于页面实际呈现的样子。

**证伪**：满足以下任一项，本条不成立：`600 div` 或 `600 span` 也报 long-pin；三组截图的哈希不同。

**修复建议**：

- 改用与 `probe.mjs:544` 相同的选择器，只保留直接含文字的元素，避免容器和子元素重复计数。
- 如果只追踪语义文本是有意为之，请在 motion.md 里写明。

**复现注意**：规则按文字串匹配连续帧，所以 `pin.cjs` 里其余段落的标题各不相同（"Chapter number 1…5"）。如果都用同一个标题，相同标题会在相邻帧里重复出现，凑出一个与 pin 无关的"常驻"。

---

## 4. product 模式下 eyebrow 和 micro-label 放不放宽：inspect 放宽，lint 不放宽，两份文档各说一套

**两种说法**

`references/product-surfaces.md` 第 5 节（:113-133）是一张表，逐条写明 product 模式放宽哪些规则，下文简称 §5。

| 立场 | 出处 | 原文 |
|---|---|---|
| 放宽为 WARN | `references/product-surfaces.md:121` | "No eyebrows" → "**Relaxed to a warning**"："A panel title above a large figure, or a `<label>` above its control, is a working convention" |
| 放宽为 WARN | `references/product-surfaces.md:128` | "No tiny uppercase tracked labels" → "**Relaxed to column headers and field labels, 12px+, one style**" |
| 放宽为 WARN | `scripts/lib/rules.mjs:29-33`（inspect 的判定） | 注释："… a small panel title above a large figure — fall from FAIL to WARN"。`RELAXED` 数组里有 `'micro-label'` 和 `'eyebrow'` |
| 不放宽 | `scripts/lint.mjs:101` | `const RELAXED = surface === 'product' ? new Set(['mono', 'numbering', 'hairline', 'outlined-box', 'shadow']) : new Set();` |
| 不放宽 | `scripts/lint.mjs:7-9`（文件头）和 `:157`（product 模式下打印的说明） | 都只列 monospace、rank and count numbers、rules inside tables and lists、shadow |
| 不放宽 | `references/tells.md:12-17` | product 下合法的只有 "monospace in the literal-data role, numbers that are real data, rules inside tables and lists, a shadow on something that truly floats, compact tiles"。"Everything else in this file still applies in both modes: gradients, glow, emoji, the assistant palette, eyebrows, … are banned everywhere." |

下面三句话都声称某个工具与某份文档一致。对照上表，三句都不成立：

- `product-surfaces.md:115`："`inspect.mjs --surface product` and `lint.mjs --surface product` implement exactly this."（"this" 指上面的 §5 表）。对 lint 不成立。
- `tells.md:9-10`："**banned** means the inspector fails the page"。按 tells.md:16-17，eyebrow 在 product 模式下仍是 banned，inspect 就该判 FAIL，实际只判 WARN。
- `lint.mjs:9`："The list and its reasoning: references/product-surfaces.md §5"。可 lint 的列表与 §5 不一致。

lint 共有 12 条 FAIL 级规则（`lint.mjs:73-85`）。§5 说 product 下放宽、lint 却没放宽的，只有这两条：

- `eyebrow`（`lint.mjs:79`）：只看类名，匹配 eyebrow、kicker、overline、section-label 等。
- `micro-label`（`lint.mjs:80`）：匹配同时含 `uppercase`、`tracking-*` 和 `text-xs` 的 Tailwind 类串，`text-xs` 即 12px。

**复现**

```bash
cd "$(mktemp -d)"
cat > dash.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Ledger</title>
<style>
body{margin:0;font:16px/1.5 Georgia,serif;color:#111;background:#fff}
main{padding:40px}
.overline{font-size:14px;margin:0 0 6px}
h2{font-size:40px;margin:0 0 32px}
th,td{text-align:left;padding:6px 32px 6px 0}
.text-xs{font-size:12px;line-height:16px}
.uppercase{text-transform:uppercase}
.tracking-widest{letter-spacing:.1em}
</style></head><body><main>
<section><p class="overline">Revenue this month</p><h2>48,210 EUR</h2></section>
<table><thead><tr>
<th class="text-xs uppercase tracking-widest">Date</th>
<th class="text-xs uppercase tracking-widest">Client</th>
<th class="text-xs uppercase tracking-widest">Amount</th>
</tr></thead><tbody><tr><td>1 Oct</td><td>Studio Nord</td><td>1,200 EUR</td></tr></tbody></table>
</main></body></html>
EOF
for s in page product; do echo "=== lint --surface $s"; node "$SKILL/scripts/lint.mjs" dash.html --surface $s; echo "exit=$?"; done
for s in page product; do
  node "$SKILL/scripts/inspect.mjs" dash.html --surface $s --widths 1440 --json > insp-$s.json
  node -e 'const r=require(process.argv[1]); for (const f of r.findings) if (/^(eyebrow|micro-label)$/.test(f.id)) console.log(process.argv[2].padEnd(8), f.level, f.id, "|", f.message);' "./insp-$s.json" "$s"
done
```

`dash.html` 只含两种会被报的写法，都是 §5 点名的合法写法：

- 大数字上方的面板标题，14px，sentence case（product-surfaces.md:121）。
- 三个表格列头，12px、全大写、加字距、样式统一（product-surfaces.md:128）。

`<style>` 里的 `.text-xs`、`.uppercase`、`.tracking-widest` 按 Tailwind 的取值模拟，目的是让 inspect 渲染出与加载 Tailwind 时相同的样子。三个类各占一行，lint 的 micro-label 正则不会匹配这些 CSS 行，下面的输出里它也只报了 :14-16。

**预期**

lint 在 page 和 product 两种模式下的 FAIL 完全相同，两次都是 `exit=1`。product 模式只在末尾多一行 "Product mode: …" 说明，那行不提 eyebrow 和 micro-label：

```text
FAIL
  [eyebrow] Eyebrow / kicker label above a heading.  (2×)
      dash.html:5  .overline{
      dash.html:12  class="overline
  [micro-label] Tiny uppercase letter-spaced label.  (3×)
      dash.html:14  text-xs uppercase tracking-widest
      dash.html:15  text-xs uppercase tracking-widest
      dash.html:16  text-xs uppercase tracking-widest

RESULT: 5 FAIL, 0 WARN — fix the FAILs before rendering.
```

inspect 输出最后四行：

```text
page     FAIL eyebrow | 1 eyebrow/kicker label(s) above headings: "Revenue this month" above "48,210 EUR"
page     FAIL micro-label | 3 tiny uppercase letter-spaced labels (e.g. "Date", "Client", "Amount").
product  WARN eyebrow | 1 eyebrow/kicker label(s) above headings: "Revenue this month" above "48,210 EUR" — tolerated in product mode while it stays in its documented role (references/product-surfaces.md §5).
product  WARN micro-label | 3 tiny uppercase letter-spaced labels (e.g. "Date", "Client", "Amount"). — tolerated in product mode while it stays in its documented role (references/product-surfaces.md §5).
```

结论：

- inspect 从 page 切到 product，两条都由 FAIL 降为 WARN。
- lint 切换模式后，这两条毫无变化。
- 同一文件在 product 模式下：inspect 判 WARN，lint 判 FAIL。

**后果**

- SKILL.md:307-317（"### 7. Gate"）把 lint 和 inspect 一起当作关卡，并要求 "Fix every `FAIL`"。照 §5 做 product 界面的 agent，会在 lint 这一关拿到 FAIL。
- 能让 lint 通过的办法都不是照文档做事该有的结果：
  - 删掉这些标签，违背 §5。
  - 把类名改成 lint 不认识的名字（eyebrow 规则只看类名），或者不用 Tailwind 类、改写成自定义 CSS。页面一点没变，只是躲过了检测，接近 SKILL.md:319 说的 "hide things from it"。
  - 在每一行加 lint 末尾提示的 `fs-ignore` 注释。
- Tailwind 后台常见的表头写法，如 `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`，正好命中 lint 的 micro-label。

**证伪**：满足以下任一项，本条不成立：`lint --surface product` 不对 :5/:12 或 :14-16 报 FAIL；inspect `--surface product` 对这两项报 FAIL。

**修复建议**：先定 product 模式下这两条放不放宽，再统一代码和文档。

- 若放宽（与 §5、inspect 一致）：
  - 在 `lint.mjs:101` 的 `RELAXED` 里加入 `'eyebrow'` 和 `'micro-label'`。也可以只对 `<th>`、`<label>` 所在行放宽 micro-label，类似 `lint.mjs:124` 对表格选择器里的 hairline 的豁免。
  - 同步改 `lint.mjs:7-9`、`:157` 和 `tells.md:12-17`。
- 若不放宽：
  - 从 `rules.mjs:33` 去掉这两项。
  - 改 product-surfaces.md:121 和 :128。
  - 把 product-surfaces.md:115 的 "implement exactly this" 改成如实描述。
