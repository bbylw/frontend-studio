# frontend-studio skill — lint 的三处误罚、库与闸门的互相矛盾（2.2.6）

> 版本：`github.com/bbylw/frontend-studio` @ `89a7585`（CHANGELOG 2.2.6 + 其后的 `tagAt` 重构提交）。
> 测试环境：Windows / Git Bash / Node v24.20.0 / 本机 Chrome。
> 只收当前版本仍存在、并已用最小复现确认的问题。每条给出代码位置与原文、可直接粘贴运行的复现、**实测输出**和证伪条件。你跑出的结果与"实测"不符，该条即不成立。
> 前三份清单都已修完并删除：`git show 20d7bcc:skill-bugs-for-review.md`、`84d4e51:skill-aesthetics-for-review.md`、`4cb8336:skill-scrim-and-library-gaps-for-review.md`。
>
> 这份的来源不同：不是继续撞 2.2.6 改动的边界，而是**用 2.2.6 实战建了五个完整页面**（渡轮、字体铸坊、天文台控制台、爵士再版厂牌、瓷砖修复生成艺术），让五个互不知情的建页者各自撞墙，再把撞到的东西逐条复现。所以下面第 1、3、4、6、7 条都落在 2.2.6 没碰过的代码上——它们躲过了前三轮，因为那几轮全在查 scrim 与 Tailwind，没人拿一句普通英文去撞闸门。

## 背景（写给没用过这个 skill 的读者）

产出要过两道闸：

| 工具 | 作用 |
|---|---|
| `scripts/lint.mjs` | 对源码做静态正则扫描，报 FAIL/WARN；有 FAIL 退出码 1 |
| `scripts/inspect.mjs` | 本机 Chrome 渲染，逐屏截图并测量：`metrics.surfaces.gradients` / `scrims`、图片计数、对比度、每屏填充率、动效 |

`SKILL.md:376` 与 `references/imagery.md:217` 把"中性 scrim"（照片上文字下方 40–55% 黑到透明的盖底）定为渐变禁令的唯一例外；2.2.3–2.2.6 一路在给这个例外补路。本文档第 2、5 条测它的残余边界，其余各条与 scrim 无关。

## 复现约定

- 先设 `SKILL` 为 skill 根目录（含 `SKILL.md` 那层）的绝对路径，例如 `export SKILL="$HOME/frontend-studio"`。
- 每条都在新空目录里跑，块内已写 `cd "$(mktemp -d)"`。
- 第 2、3、4、5 条的 inspect 部分需要本机 Chrome/Edge/Chromium；其余可完全离线。
- 第 1 条的版本回溯需要这是个工作树（用 `git archive`）。
- 本机环境设了 `NODE_TLS_REJECT_UNAUTHORIZED=0`，跑复现会多一行 Node TLS 警告，与 skill 无关。

## 总览

| # | 类型 | 位置 | 一句话 | 严重度 |
|---|---|---|---|---|
| 1 | lint 误罚 | `scripts/lint.mjs:77` | `shadow` 规则里 `var\(--tw)` 的右括号未转义，否定前瞻提前闭合，Tailwind 分支泄漏成顶层备选：**任何英文散文里的 "shadow" 一词都判 FAIL** | 高 |
| 2 | lint 误罚 + 两闸分裂 | `scripts/lint.mjs:273`、`:280` | 手写 Tailwind 风格 shim 时，CSS 选择器 `.bg-linear-to-t{…}` 与只带方向类的元素各罚一次，而运行时判同一页为合法 scrim | 中 |
| 3 | inspect 误罚 | `scripts/lib/probe.mjs:441` | `data-ui` 子树里的 `<img>` 不计入 `realPictures`：四张真照片被算成 0 张照片 + 1 个界面碎片，照样 `FAIL few-pictures` | 中 |
| 4 | 库与闸门矛盾 | `library/motions.json:28` 对比 `scripts/inspect.mjs:205`、`scripts/lib/probe.mjs:605` | 库把 curtain footer 当招牌动效发出，照它做的页面必吃 `FAIL covered-text` + `WARN long-pin` | 中 |
| 5 | 口径不对称 | `scripts/lint.mjs:199`、`:210` 对比 `:203-204` | 同一支暖白纸色：写成 `#f3efe4`（通道差 15）两闸同罚，写成其精确 OK 换算 `oklch(0.952 0.015 90)` 两闸同放 | 低-中 |
| 6 | 死代码 | `scripts/lint.mjs:46`、`scripts/inspect.mjs:46` | 两处都用 `direction.id === 'generative-art'` 推断 art 表面，而库里 22 个方向没有这个 id，`draw.mjs` 也拒绝它 | 低 |
| 7 | 覆盖缺口 | `scripts/lib/probe.mjs:337`（`b.area >= W * H * 0.02`） | 6px 高的彩色品牌条 lint 罚得到、运行时看不见：小面积装饰渐变只有静态闸能发现 | 低 |

第 8 条（判断类，非实锤）见文末。

---

## 1. lint 把英文单词 "shadow" 判成 FAIL

**位置**：`scripts/lint.mjs:77`

```js
['FAIL', 'shadow', /box-shadow\s*:\s*(?!none|0 0 #0000|var\(--tw)|\bshadow(-(sm|md|lg|xl|2xl|inner|\[[^\]]+\]))?(?=["'\s`])(?<!-shadow)|drop-shadow\(|\bdrop-shadow(-|\b)|text-shadow\s*:\s*(?!none)/, 'Shadow. Elements at rest carry none; only real overlays (menu, dialog, sticky bar) may.'],
```

**机制**

- 作者想写的是 `var\(--tw\)`，实际写的是 `var\(--tw)`：`\(` 是转义的字面左括号，紧跟的 `)` 未转义，于是**它闭合的是 `(?!` 那个否定前瞻**，不是 `var(`。
- 前瞻因此只覆盖 `none|0 0 #0000|var\(--tw` 三项，后面的 `\bshadow(-(sm|md|lg|xl|2xl|inner|\[…\]))?(?=["'\s`])(?<!-shadow)` 从"排除项"变成了**顶层备选分支**。
- 该分支的必需部分只剩 `\bshadow` + 一个可选后缀 + "后面是引号/空白/反引号"。所以散文里任何独立单词 `shadow` 都命中，且注释行不豁免（对比 `:243` 的 em-dash 计数是显式剥注释的）。

**复现**

```bash
cd "$(mktemp -d)"
cat > prose.html <<'EOF'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>prose</title>
<style>body{margin:0;font:16px/1.6 system-ui;color:#141414;background:#f6f4ef;padding:64px;max-width:70ch}</style></head>
<body>
<h1>Notes from the tide desk</h1>
<p>The morning shadow reaches the third step, and by six the whole reach is in shadow except the water.</p>
<p>Keep the drop shadow off the panels; a text shadow on the caption was tried and looked cheap.</p>
<p>There is a gradient of opinion about the glass case, and the timetable is set in mono with wide tracking.</p>
<p>Colours on the shelf: a purple mooring rope, a violet buoy, an indigo sail, one fuchsia flag.</p>
</body></html>
EOF
echo "### lint：四句普通英文散文，页面里没有任何 CSS 阴影声明"
node "$SKILL/scripts/lint.mjs" prose.html --surface page 2>&1 | grep -E "^RESULT|html:"
echo
echo "### 机制：把 shadow 规则的正则从源码取出，按顶层 | 切开后逐个测"
cat > alt-probe.cjs <<'EOF'
const fs = require('node:fs');
const src = fs.readFileSync(process.argv[2] + '/scripts/lint.mjs', 'utf8');
const line = src.split(/\r?\n/).find((l) => l.includes("'FAIL', 'shadow'"));
const body = line.match(/'FAIL', 'shadow', \/(.*)\/,/)[1];
const alts = []; let depth = 0; let cur = ''; let inClass = false;
for (let i = 0; i < body.length; i++) {
  const ch = body[i];
  if (ch === '\\') { cur += ch + body[++i]; continue; }
  if (inClass) { cur += ch; if (ch === ']') inClass = false; continue; }
  if (ch === '[') { inClass = true; cur += ch; continue; }
  if (ch === '(') depth++;
  if (ch === ')') depth--;
  if (ch === '|' && depth === 0) { alts.push(cur); cur = ''; continue; }
  cur += ch;
}
alts.push(cur);
console.log('顶层备选分支数：', alts.length);
const prose = 'The morning shadow reaches the third step.';
alts.forEach((a, i) => {
  let hit = null;
  try { hit = prose.match(new RegExp(a)); } catch (e) { hit = null; }
  console.log(`  [${i}] ${JSON.stringify(a.slice(0, 64))}  ->  散文 ${hit ? 'MATCH ' + JSON.stringify(hit[0]) : 'no'}`);
});
EOF
node alt-probe.cjs "$SKILL"
echo
echo "### 该误判不是 2.2.6 引入的：同一页在五个历史版本上的结果"
PAGE="$PWD/prose.html"; REPO="$SKILL"
cd "$REPO"
for c in e4e561b 4ef4ef2 6d2ea4d 30fc41c 0f061e3; do
  d="$(mktemp -d)"; git archive "$c" scripts | tar -x -C "$d"
  printf '%-9s ' "$c"; node "$d/scripts/lint.mjs" "$PAGE" --surface page 2>&1 | grep -E '^RESULT'
done
```

**实测**

```
      prose.html:6  shadow
      prose.html:7  shadow
RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.

顶层备选分支数： 5
  [0] "box-shadow\\s*:\\s*(?!none|0 0 #0000|var\\(--tw)"  ->  散文 no
  [1] "\\bshadow(-(sm|md|lg|xl|2xl|inner|\\[[^\\]]+\\]))?(?=[\"'\\s`])(?<!-sh"  ->  散文 MATCH "shadow"
  [2] "drop-shadow\\("  ->  散文 no
  [3] "\\bdrop-shadow(-|\\b)"  ->  散文 no
  [4] "text-shadow\\s*:\\s*(?!none)"  ->  散文 no

e4e561b   RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.
4ef4ef2   RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.
6d2ea4d   RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.
30fc41c   RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.
0f061e3   RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.
```

注意第 7 行那句含 `drop shadow` 与 `text shadow`（都是空格、不是连字符）也被罚——命中的同样是分支 [1] 的裸 `shadow`，不是 `drop-shadow` 分支。

**证伪条件**：若这个页面 `RESULT: 0 FAIL`，或分支 [1] 对散文显示 `no`，本条不成立。

**修法有个坑**：只把括号补成 `var\(--tw\)` 会把 `shadow-*` 这条 Tailwind 检测分支一起吞回前瞻内部，等于顺手删掉功能。正确做法是前瞻收紧 + 给 class 上下文单独一条分支（例如要求同一行存在 `class=` / `style=` 或 `box-shadow:`）。同类泄漏请顺手扫一遍所有含 `(?!` 的规则：`alt-probe.cjs` 换个规则名即可复用。

**现实影响**：`shadow` 是设计类文案的高频词。本轮五页里两页中招：渡轮页的图注 "the whole reach in shadow"（最终稿用 `fs-ignore` 压住，`v226-ferry/index.html:731`），以及天文台控制台建页阶段的一条 HTML 注释——该页最终产物里已检索不到这条注释，所以这一半来自建页回报，无法从产物复核。

---

## 2. 手写 Tailwind 风格 shim 被误罚两处，而运行时判它合法

**位置**：`scripts/lint.mjs:273`、`:280`、`:300`（`return` 行）

```js
const twMatches = [...line.matchAll(/\bbg-(?:gradient|linear)-|\b(?:from|via)-(?!\[?0)[a-z]+-\d{2,3}\b/gi)];
…
const stops = [...twText.matchAll(/(?<![-\w])(from|via|to)-([^\s"'`;<>]+)/g)].filter((m) => !/^\d+%$/.test(m[2]));
…
return stops.length > 0 && fromCount >= dirCount && stops.every((m) => stopOk(m[2])) && twAlpha;
```

**机制**

- `twMatches` 在整行里找 `bg-linear-`，**不区分它出现在 `class=` 属性里还是 CSS 选择器里**。于是定义工具类的那行 `.bg-linear-to-t{…}` 也进了 Tailwind 分支。
- 该分支要求 `stops.length > 0`，即标签里必须有字面 `from-*/to-*` 色标。用 CSS 自定义属性供给颜色的 shim 没有字面色标，直接判 FAIL——尽管同一行的 CSS 侧已经由 `isScrim` 认下这个中性渐变。
- 结果：静态闸罚两处（定义行 + 只带方向类的使用行），运行时闸判同一页是合法 scrim。

**复现**

```bash
cd "$(mktemp -d)"
cat > shim.html <<'EOF'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>shim</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#f4f2ec;background:#1d2b23}
.scrim{--g-from:rgba(0,0,0,0.55);--g-to:transparent}
.bg-linear-to-t{background-image:linear-gradient(to top,var(--g-from),var(--g-to))}
.shot{position:relative;min-height:60svh;padding:64px}
h1{font-size:56px;line-height:1.05;margin:0}
</style></head>
<body>
<div class="shot scrim bg-linear-to-t"><h1>Text over a photograph, dimmed by a neutral fade</h1></div>
</body></html>
EOF
echo "### lint：定义行与使用行各判一次 FAIL"
node "$SKILL/scripts/lint.mjs" shim.html --surface page 2>&1 | grep -E "^RESULT|html:"
echo
echo "### inspect：同一页在运行时被判为合法 scrim"
node "$SKILL/scripts/inspect.mjs" shim.html --surface page --widths 1440 --out out --json > r.json 2>/dev/null
node -e 'const r=require("./r.json");const s=r.viewports[0].metrics.surfaces;
console.log("gradients",s.gradients,"scrims",s.scrims,"| gradient findings:",r.findings.filter(f=>f.id==="gradient").length);'
```

**实测**

```
      shim.html:6  bg-linear-
      shim.html:11  bg-linear-
RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.

gradients 0 scrims 1 | gradient findings: 0
```

**证伪条件**：若 lint 报 0 FAIL，或 inspect 也数出 `gradients 1`（即两闸都认为它是装饰渐变），本条不成立。

**版本定位**：`git archive 0f061e3`（2.2.5）跑同一页同样 2 FAIL，**不是 2.2.6 的回归**，是 2.2.4 引入 Tailwind 分支时的遗留。

**现实影响**：本机取不到 Tailwind v4 Play CDN（jsdelivr / unpkg 均不可达），建页者只能自备同名工具类——正是这条路径被误罚。唯一出路是行尾 `fs-ignore`，而这个豁免在面向建页者的 `SKILL.md` 与 `references/` 里**一个字都没提**（repo 内它只作为实现细节出现在 `lint.mjs:242`、`:333` 以及 `CHANGELOG.md`/`NOTICE.md` 的注记里）：建页者既没被文档告知它存在，也没被告知何时该用它。

---

## 3. `data-ui` 会吞掉真照片，四张照片的页面仍判 `few-pictures`

**位置**：`scripts/lib/probe.mjs:441`（照片跳过）、`:459`（碎片计数）

```js
for (const el of all) {
  if (el.closest('[data-ui]') || el.closest('svg') || isHidden(el)) continue;
```

**机制**

- 计照片的循环整体跳过 `data-ui` 子树里的元素，`<img>` 也不例外。
- `data-ui` 的语义在 `SKILL.md:390` 与 `references/imagery.md:230-233`：只给"裁切下来的界面碎片"，且明说"把标题或整个 section 包进去会失败"。实测恰恰相反——把四张照片包进去不会失败，只是照片被清零：闸门没有校验它包的是不是界面。
- `rules.mjs:141` 的地板是 `pics < 4`（照片数 + 界面碎片数），此处 `0 + 1 = 1`，于是 `FAIL few-pictures`。
- 反向也成立，但机制不是"照片数量"：`probe.mjs:459` 把**每个可见的 `data-ui` 根元素**（宽 ≥300、高 ≥200）各计 1 个界面碎片，不看里面装了什么。四个空 wrapper 即可把 `pics` 凑到 4、让 `few-pictures` 消失（下面第二段的实测）。

**复现**

```bash
cd "$(mktemp -d)"
# one 1x1 PNG, stretched by CSS — naturalWidth > 0, so the probe counts the element as a photograph
printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' > p.b64
base64 -d p.b64 > a.png; cp a.png b.png; cp a.png c.png; cp a.png d.png
cat > ui-pics.html <<'EOF'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>data-ui pictures</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#f6f4ef}
header{padding:64px}
h1{font-size:56px;line-height:1.05;margin:0 0 16px}
p{max-width:62ch;font-size:19px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:0 64px 64px}
img{display:block;width:100%;height:320px;object-fit:cover}
</style></head>
<body>
<header><h1>Four photographs, all marked as interface</h1><p>Nothing here is a cropped product screenshot. Each element is a full photograph laid out in a two-column grid; the only difference from an ordinary gallery is the data-ui attribute on the wrapper.</p></header>
<div class="grid" data-ui>
  <img src="a.png" alt="Harbour wall at dusk">
  <img src="b.png" alt="Chart plotter screen">
  <img src="c.png" alt="River steps at low water">
  <img src="d.png" alt="Ferry approach from the pier">
</div>
</body></html>
EOF
node "$SKILL/scripts/inspect.mjs" ui-pics.html --surface page --widths 1440 --out out --json > r.json 2>/dev/null
node -e 'const r=require("./r.json");const m=r.viewports[0].metrics;const p=m.page||m;
console.log("realPictures",p.realPictures,"| uiPictures",p.uiPictures,"| few-pictures findings:",r.findings.filter(f=>f.id==="few-pictures").length);
console.log("FAILs:",r.findings.filter(f=>f.level==="FAIL").map(f=>f.id).join(", ")||"(none)");'
echo
echo "### 反向：四个空 data-ui wrapper 也算四个界面碎片"
cat > empty-ui.html <<'EOF'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>empty data-ui</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#f6f4ef}
header{padding:64px}
h1{font-size:48px;line-height:1.05;margin:0 0 12px}
p{max-width:62ch;font-size:19px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:0 64px 64px}
.box{width:100%;height:260px;border:1px solid #ccc}
</style></head>
<body>
<header><h1>Four empty fragments</h1><p>There are no images and no interface content anywhere on this page; the four boxes carry only the attribute.</p></header>
<div class="grid">
  <div class="box" data-ui></div><div class="box" data-ui></div>
  <div class="box" data-ui></div><div class="box" data-ui></div>
</div>
</body></html>
EOF
node "$SKILL/scripts/inspect.mjs" empty-ui.html --surface page --widths 1440 --out out-empty --json > r-empty.json 2>/dev/null
node -e 'const r=require("./r-empty.json");const m=r.viewports[0].metrics;const p=m.page||m;
console.log("empty data-ui: realPictures",p.realPictures,"| uiPictures",p.uiPictures,"| few-pictures findings:",r.findings.filter(f=>f.id==="few-pictures").length);
console.log("FAILs:",r.findings.filter(f=>f.level==="FAIL").map(f=>f.id).join(", ")||"(none)");'
```

**实测**

```
realPictures 0 | uiPictures 1 | few-pictures findings: 1
FAILs: few-pictures, still-page

empty data-ui: realPictures 0 | uiPictures 4 | few-pictures findings: 0
FAILs: still-page
```

（`still-page` 是我这个复现页没有动效，与本条无关。）

**证伪条件**：若 `realPictures` 为 4，或 `few-pictures` 不触发，或四个空 wrapper 仍报 `few-pictures`，本条不成立。

**修法方向**：`data-ui` 只应豁免它**自己**那一块矩形，而不是整棵子树；或在 `probe` 里对 `data-ui` 内的 `<img>` 单独计数并保留在 `realPictures` 里。同时给 `uiPictures` 加内容校验，空 wrapper 不应算碎片。`probe.mjs:427` 的 `uiAbuse` 已经拦"包了 h1 或高过 1.6 屏"的滥用，但拦不住"包了几张照片"，也拦不住空 wrapper。

---

## 4. 库发出的招牌动效 curtain footer，被自家闸门判 FAIL

**位置**：`library/motions.json:28-30`（由 `library/directions.json:329`、`library/heroes.json:215` 作为招牌动效发出）对比 `scripts/inspect.mjs:205` 与 `scripts/lib/probe.mjs:605`

```js
// motions.json:28-30 —— "Build with a sticky footer at the bottom and a main element with its own background and a higher stacking order. No JavaScript."
// inspect.mjs:205 —— if (coveredText.length …) findings.push({ level: 'FAIL', id: 'covered-text', …
```

**机制**

- 库要求的实现方式，正是让 footer 在 `main` 之下、由 `main` 的底色盖住。
- `probe.mjs:605` 用命中测试统计"大字被别的元素盖住的采样点比例"，阈值 `hidden / total >= 0.2`。幕布式 footer 的大字在除最后一屏外的每一屏都是 100% 被盖住。
- 于是忠实执行库蓝图的建页者必吃一个 FAIL，外加 `long-pin` WARN（同一行大字在四屏里都在屏上）。唯一的自洽出路是给 footer 文字加 `visibility` 门控——而库的说明里没提这一点。

**复现**

```bash
cd "$(mktemp -d)"
cat > curtain.html <<'EOF'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>curtain repro</title>
<style>
  body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#f6f4ef}
  main{position:relative;z-index:2;background:#f6f4ef}
  .screen{min-height:100svh;padding:64px;display:grid;align-content:center}
  h1{font-size:64px;line-height:1.02;margin:0 0 18px}
  p{max-width:62ch;font-size:19px;margin:0}
  footer{position:sticky;bottom:0;z-index:1;background:#1d2b23;color:#f3efe6;padding:64px}
  footer h2{font-size:56px;line-height:1.05;margin:0 0 12px}
</style></head>
<body>
<main>
  <section class="screen"><div><h1>Blue Atlas Records</h1><p>A jazz reissue label working from tape boxes in a Lisbon back room. Every sleeve carries the session date, the matrix numbers and the plant that pressed it, set in the same two faces since 2009.</p></div></section>
  <section class="screen"><div><h1>Catalogue</h1><p>Forty-one reissues, six of them first releases from private tapes. The listing runs by year, then by the engineer who made the master, which is how most people here look things up.</p></div></section>
  <section class="screen"><div><h1>Series two</h1><p>The next eight titles are cut in spring. Subscribers receive the test pressings a month before the run ships, with the note that came out of the box.</p></div></section>
</main>
<footer><h2>Blue Atlas</h2><p>Rua do Século, Lisbon · orders@blueatlus.example</p></footer>
</body></html>
EOF
echo "### 库把它当招牌动效发出"
node -e 'const m=require(process.argv[1]+"/library/motions.json").find(x=>x.id==="curtain-footer");console.log(m.description);' "$SKILL"
( cd "$SKILL" && grep -n '"motion": "curtain-footer"' library/directions.json library/heroes.json )
echo
echo "### inspect：照库做的 curtain footer 被自家闸门判罚"
node "$SKILL/scripts/inspect.mjs" curtain.html --surface page --widths 1440 --out out --json > r.json 2>/dev/null
node -e 'const r=require("./r.json");
for(const f of r.findings) if(["covered-text","long-pin"].includes(f.id)) console.log(f.level,f.id,"|",f.message.slice(0,110));'
```

**实测**

```
The page content slides up like a sheet to uncover the footer waiting beneath it, so the last screen is revealed rather than scrolled to. Build with a sticky footer at the bottom and a main element with its own background and a higher stacking order. No JavaScript.
library/directions.json:329:  "motion": "curtain-footer",
library/heroes.json:215:  "motion": "curtain-footer",

FAIL covered-text | Large text lies under another element at some scroll position: "Blue Atlas" (screen 3, 100% hidden)
WARN long-pin | The same large text stays on screen for 4 screens in a row: "Blue Atlas"
```

**证伪条件**：若 inspect 不报 `covered-text`（说明闸门已识别幕布式 footer），或库里已不再发出 `curtain-footer`，本条不成立。

**修法方向**：要么在 `probe` 的命中测试里排除"被一个不透明、z 序更高、且自身铺满视口的页面级 `main` 盖住"的情形；要么在 `motions.json` 的说明里补一句"footer 内的大字需 `visibility` 门控到露出时再亮"，并同步 `long-pin` 的口径。二者取一，别留着互相矛盾。

---

## 5. 同一支暖白纸色，写成 hex 罚、写成 oklch 放

**位置**：`scripts/lint.mjs:199`（rgb 通道差 ≤ 14）与 `:210`（hex 同一标尺）对比 `:203-204`（OK 系彩度 ≤ 0.04）

**机制**：2.2.6 把 OK 系彩度上限从 0.02 抬到 0.04（并让运行时对 lch/lab token 免做 rgb 通道差检查，因为转换会在近白端截断放大差值），但 rgb/hex 一侧仍是 14/255。`#f3efe4` 的精确 OK 换算是 `oklch(0.952 0.015 90)`：彩度 0.015，远在 0.04 界内；同一支颜色写成 hex，通道差 15，越线。两闸各自内部是一致的（下面实测两边同结论），不一致的是**政策**。

**复现**

```bash
cd "$(mktemp -d)"
cat > warm-hex.html <<'EOF'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>warm hex</title>
<style>
.wash{background:linear-gradient(to top, #f3efe4, transparent)}
</style></head>
<body><div class="wash">text over a warm paper wash</div></body></html>
EOF
sed 's|#f3efe4|oklch(0.952 0.015 90 / 0.9)|' warm-hex.html > warm-oklch.html
echo "### 同一支暖白纸色，两种写法"
node -e 'const h="#f3efe4",n=parseInt(h.slice(1),16);console.log("hex 通道差 =",Math.max((n>>16)&255,(n>>8)&255,n&255)-Math.min((n>>16)&255,(n>>8)&255,n&255),"（上限 14）")'
for f in warm-hex warm-oklch; do
  printf '%-12s lint    ' "$f"; node "$SKILL/scripts/lint.mjs" "$f.html" --surface page 2>&1 | grep -E '^RESULT'
  node "$SKILL/scripts/inspect.mjs" "$f.html" --surface page --widths 1440 --out "out-$f" --json > "r-$f.json" 2>/dev/null
  printf '%-12s inspect ' "$f"; node -e 'const r=require("./r-'$f'.json");const s=r.viewports[0].metrics.surfaces;
console.log("gradients",s.gradients,"scrims",s.scrims,"| gradient findings:",r.findings.filter(f=>f.id==="gradient").length);'
done
```

**实测**

```
hex 通道差 = 15 （上限 14）
warm-hex     lint    RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
warm-hex     inspect gradients 1 scrims 0 | gradient findings: 1
warm-oklch   lint    RESULT: 0 FAIL, 0 WARN
warm-oklch   inspect gradients 0 scrims 1 | gradient findings: 0
```

**证伪条件**：若两种写法结论相同，本条不成立。

**这是取舍题不是 bug**：要么承认"近中性暖色只允许在 OK 空间里写"，在 `references/colour.md` 写明；要么把 hex/rgb 一侧的容差按同一感知标尺抬到相当的位置（约 20/255）。现在的状态是：建页者换种写法就能翻案，而唯一的豁免 `fs-ignore` 在文档里根本没提（见第 2 条）。

---

## 6. 用 `direction.id === 'generative-art'` 推断 art 表面的分支永远不命中

**位置**：`scripts/lint.mjs:46`、`scripts/inspect.mjs:46`

```js
const sheetSurface = savedSheet?.surface || savedSheet?.input?.surface || (savedSheet?.direction?.id === 'generative-art' ? 'art' : null);
```

**复现**

```bash
cd "$(mktemp -d)"
echo "### 库里有没有 generative-art 这个方向"
node -e 'const d=require(process.argv[1]+"/library/directions.json");
console.log("方向总数",d.length,"| 匹配 /art|generat/ 的 id:",d.map(x=>x.id).filter(i=>/art|generat/i.test(i)).join(", ")||"(无)");' "$SKILL"
echo
echo "### 但 lint 与 inspect 都拿它推断 art 表面"
( cd "$SKILL" && grep -n "generative-art" scripts/lint.mjs scripts/inspect.mjs )
echo
echo "### draw 侧这个入口不存在"
FRONTEND_STUDIO_HISTORY="$(mktemp -d)/h.json" node "$SKILL/scripts/draw.mjs" --direction generative-art --sector culture --brief "probe" 2>&1 | head -2
echo
echo "### 文档实际给的入口是 --surface art"
grep -n -- "--surface art" "$SKILL/SKILL.md" | cut -c1-150 | head -3
```

**实测**

```
方向总数 22 | 匹配 /art|generat/ 的 id: (无)

scripts/lint.mjs:46:const sheetSurface = savedSheet?.surface || savedSheet?.input?.surface || (savedSheet?.direction?.id === 'generative-art' ? 'art' : null);
scripts/inspect.mjs:46:const sheetSurface = savedSheet?.surface || savedSheet?.input?.surface || (savedSheet?.direction?.id === 'generative-art' ? 'art' : null);

No direction with id generative-art. List them with --list directions.

478:typography and colour of the piece, not to its medium (`inspect.mjs` and `lint.mjs` accept `--surface art`
```

**证伪条件**：若 `directions.json` 里出现该 id，或 `draw.mjs --direction generative-art` 能发出方向单，本条不成立。

**说明**：影响很小（`savedSheet.surface` 通常已经给了值），但它是一条永远走不到的推断，会让人以为存在"art 方向"这个入口。本轮我给建页者的指令就照着它写了 `--direction generative-art`，结果对方报回"文档指向的入口在库里不存在"——**这条错误归因是我的指令造成的，不是文档的问题**；文档在 `SKILL.md:475-478` 说的是 `--surface art`。删掉死分支，或真的补一个 art 方向，二选一。

---

## 7. 6px 的彩色品牌条：静态闸罚得到，运行时看不见

**位置**：`scripts/lib/probe.mjs:337`

```js
else if (b.area >= W * H * 0.02) {
```

**复现**

```bash
cd "$(mktemp -d)"
cat > thinbar.html <<'EOF'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>thin bar</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#f6f4ef}
header{padding:64px}
h1{font-size:56px;line-height:1.05;margin:0 0 16px}
p{max-width:62ch;font-size:19px}
.brandbar{height:6px;background:linear-gradient(90deg,#2f4f6f,#7a3b8f)}
</style></head>
<body>
<div class="brandbar"></div>
<header>
  <h1>Thin brand bar</h1>
  <p>A six-pixel chromatic rule across the top of the page. The static gate sees it; the runtime surface count does not, because the probe only samples fields covering at least two percent of the viewport.</p>
  <p>More copy so the page has substance and the measurement walk has something to read: the bar sits above the fold, and small fields are skipped on purpose.</p>
</header>
</body></html>
EOF
echo "### lint"
node "$SKILL/scripts/lint.mjs" thinbar.html --surface page 2>&1 | grep -E "^RESULT|html:"
echo "### inspect"
node "$SKILL/scripts/inspect.mjs" thinbar.html --surface page --widths 1440 --out out --json > r.json 2>/dev/null
node -e 'const r=require("./r.json");const s=r.viewports[0].metrics.surfaces;
console.log("gradients",s.gradients,"scrims",s.scrims,"| gradient findings:",r.findings.filter(f=>f.id==="gradient").length);'
```

**实测**

```
      thinbar.html:8  linear-gradient(
RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
gradients 0 scrims 0 | gradient findings: 0
```

**证伪条件**：若 inspect 也报出 `gradients 1` 或 gradient finding，本条不成立。

**说明**：2% 面积门槛本身是合理的性能/噪声取舍（本轮渡轮页正是靠它没被小色块干扰）。这条只是要**写下来**：渐变禁令的运行时覆盖范围是"占视口 2% 以上的面"，小面积装饰渐变只有 lint 能抓。`references/tells.md` 里"banned = 闸门判 FAIL"的定义（2.2.4 已按 surface 改写）在这里仍会让人以为两道闸等价。

---

## 8. 判断类（非实锤，供权衡）

- **product 模式的 eyebrow 信噪比**：统计块的小标题会被 `eyebrow` 记成 WARN。本轮天文台控制台有六个统计块标题进了 WARN 列表（我的复跑按 id 去重后显示 `eyebrow` 在其中）。2.2.4 把 product 模式降为 WARN 是对的，但"面板标题 vs 装饰 kicker"仍不可分，`references/tells.md:15-17,51` 的说法（这类 kicker 由 review 判、不由闸门判）与 WARN 列表的实际噪声不匹配。
- **平板视口高度模型**：`inspect.mjs:153` 是 `const h = HEIGHT[w] || Math.round(w * 0.625);`，834 宽因此只有 521 高；而 `probe.mjs:427` 的 `uiAbuse` 判据是"元素高过 `H * 1.6`"，即 834px。一张真实的数据表套 `data-ui` 很容易越线，建页者被迫把 `data-ui` 从表格上摘掉。模型本身自洽，但对平板偏苛。

---

## 附录 A：2.2.6 四项改动在真实页面上的正面验证（供上游确认没白改）

五页实战顺带把 2.2.6 的改动全跑了一遍，**四项全部生效**：

| 改动 | 证据 |
|---|---|
| Tailwind 跨行 class（`tagAt`） | 铸坊页：跨行 prettier class、属性逐行、v3 `bg-gradient-to-t`、v4 `bg-linear-to-t`、`from-black/[0.35]` 全部放行；故意留的 `from-red-500/50` 精确报在该行，无连坐 |
| `hwb()` 中性色标 | 唱片页：`hwb(0 100% 0% / .55)`、`hwb(0 0% 100% / .62)` 记为 scrim；彩色 `hwb(28 60% 8% / .68)` 序列化成 `rgba(235,191,153,.68)`（通道差 82），两闸同罚 |
| 超过 6 行的渐变声明 | 渡轮页：9 行 7 色标的中性 fade 通过；同屏夹具 `scrims 6 / gradients 1` |
| 彩度上限 0.04 + 运行时 lch 豁免 | 渡轮页：`oklch(28% 0.03 80)` 两闸同放，0.05 两闸同罚 |

## 附录 B：本轮五页

| 页面 | 表面 | lint | inspect(1440) | gradients/scrims |
|---|---|---|---|---|
| 渡轮（dense-tiles） | page | 0 FAIL / 0 WARN | 0 FAIL / 1 WARN | 0 / 3 |
| 字体铸坊（name-as-monument） | page | 1 FAIL（故意测试件） | 0 FAIL / 2 WARN | 0 / 4 |
| 天文台控制台 | product | 0 FAIL / 1 WARN | 0 FAIL / 3 WARN | 0 / 2 |
| 爵士再版厂牌 | page | 1 FAIL（故意测试件） | 1 FAIL / 1 WARN | 1 / 2 |
| 瓷砖修复（art） | art | 0 FAIL / 0 WARN | 0 FAIL / 0 WARN | 0 / 1 |

两条与工具无关但值得记的建页观察：本机取不到 Tailwind v4 Play CDN（jsdelivr / unpkg 均 000 不可达），所以"用 Tailwind 建页"这条路在离线机器上必然退化成自备 shim——正是第 2 条的触发路径；另外 `clamp(2.5rem,1.2rem+5vw,5.5rem)` 这类 `+` 两侧缺空格的写法会被浏览器整条丢弃、字号静默回落，两道闸都看不见（CSS 规范问题，非工具缺陷，但值得进 `pitfalls`）。
