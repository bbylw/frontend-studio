# frontend-studio skill — 中性 scrim 白名单的边界，与库／文档的遗留矛盾（2.2.3）

> 版本：`github.com/bbylw/frontend-studio` @ `6d2ea4d`（CHANGELOG 2.2.3）。
> 测试环境：Windows / Git Bash / Node v24.20.0 / 本机 Chrome。
> 只收当前版本仍存在、并已用最小复现确认的问题。每条给出代码位置与原文、可直接粘贴运行的复现、预期输出和证伪条件。你跑出的结果与"预期"不符，该条即不成立。
> 上一份清单（7 条美学与测量问题）已在 2.2.3 修完，我逐块复跑确认过，原文存于 git 历史 `84d4e51:skill-aesthetics-for-review.md`。这份是其后做**对抗性验证**的产物：2.2.3 给 `scripts/lint.mjs` 的渐变规则新加了一个"中性 scrim 白名单"，我专门去测这个白名单的边界——第 1–3 条是它误伤或漏掉的情形。第 4、5 条是 2.2.2 起就存在、2.2.3 未处理的库与文档矛盾。

## 背景（写给没用过这个 skill 的读者）

frontend-studio 做网页，产出要过两道闸：

| 工具 | 作用 |
|---|---|
| `scripts/lint.mjs` | 对源码做静态正则扫描，报 FAIL/WARN。有 FAIL 时退出码 1 |
| `scripts/inspect.mjs` | 用本机 Chrome 渲染页面，逐屏截图并测量：标题行数、字号、颜色、规则线、阴影、渐变（`metrics.surfaces.gradients` / `scrims`）、对比度、溢出、每屏填充率、首屏按钮、动效、图片 |

"中性 scrim"指照片上文字下面那层盖底：`SKILL.md:376` 与 `references/imagery.md:217-218` 把它定为渐变禁令的**唯一例外**（"a fade from 55% black to transparent over the lower third"）。2.2.3 为它做了两件事：在 lint 里加白名单（`scripts/lint.mjs:129-154`），在运行时侧用 `scripts/lib/probe.mjs:340` 的 `exotic` 判定同一件事。本文档测的就是这两处的一致性。

本文档 5 条分两类：

- **白名单缺陷**（1、2、3）：白名单的**判定单位**、**可达性**、**色彩空间**各有一个洞。按文档写 scrim 的建页者仍会拿到 FAIL，唯一出路还是行尾 `fs-ignore`——而 `SKILL.md:319` 说不要对闸门藏东西。
- **库与文档矛盾**（4、5）：库蓝图与库自身的方向/动效文字互相冲突；`tells.md` 对"banned"的定义与 product 模式的真实行为不符。

## 复现约定

- 先设 `SKILL` 为 skill 根目录（含 `SKILL.md` 的那一层）的绝对路径，例如 `export SKILL="$HOME/frontend-studio"`。
- 除特别说明外，每条都在新的空目录里运行。复现脚本里已经写了 `cd "$(mktemp -d)"`。
- 第 3 条的 inspect 部分需要本机装有 Chrome、Edge 或 Chromium；其余各条可完全离线运行。
- 这台测试机的环境里设了 `NODE_TLS_REJECT_UNAUTHORIZED=0`，所以跑复现会多出一行 Node 的 TLS 警告，与 skill 无关。

## 总览

| # | 类型 | 位置 | 一句话 | 严重度 |
|---|---|---|---|---|
| 1 | 白名单缺陷 | `scripts/lint.mjs:130`（`lines.slice(i, i + 6)`）对比 `:154` | 白名单的判定单位是"这一行 + 后 5 行"的窗口，不是单条声明：合法 scrim 只要与任意非中性 `linear-gradient(` 同窗就连坐 FAIL | 中 |
| 2 | 白名单缺陷 | `scripts/lint.mjs:129` 的前置守卫 `!\bbg-(gradient\|linear\|…)-/` | Tailwind 惯用写法（v4 `bg-linear-to-t from-black/55`、v3 `bg-gradient-to-t`）命中守卫，白名单分支根本不执行，一律 FAIL | 中 |
| 3 | 白名单缺陷 | `scripts/lint.mjs:133` 对比 `scripts/lib/probe.mjs:340`、`scripts/lib/rules.mjs:89` | 白名单只认 rgb/hex/hsl：`oklch()`/`oklab()`/`color-mix()`/`var()`/裸颜色名写出的中性 scrim，两道闸**一致**判 FAIL | 中 |
| 4 | 库与文档矛盾 | `library/sections.json:2713`、`library/heroes.json:87` 对比 `library/directions.json:156,164`、`library/motions.json:20` | 两张库蓝图仍规定 5–6 屏的 pin，与同一张库的"两三屏"上限冲突（2.2.2 遗留，有注记缓解） | 低 |
| 5 | 文档内部矛盾 | `references/tells.md:9-10,17,49` 对比 `references/product-surfaces.md:121`、`scripts/lint.mjs:102` | `tells.md` 定义"**banned** = 闸门判 FAIL"，但 product 模式下 eyebrow 永远只能 WARN | 低 |

---

## 1. 白名单读的是 6 行窗口，合法 scrim 被邻近的装饰性渐变连坐

**位置**：`scripts/lint.mjs:129-154`：

```js
if (id === 'gradient' && !/(radial|conic)-gradient\(|\bbg-(gradient|linear|radial|conic)-|\b(from|via)-(?!\[?0)[a-z]+-\d{2,3}\b/.test(line)) {
  const chunk = lines.slice(i, i + 6).join(' ');
  const grads = [...chunk.matchAll(/linear-gradient\(((?:[^()]+|\([^()]*\))+)\)/gi)];
  const isScrim = (g) => { /* … 133-152 行：判定一段渐变串是不是中性黑/白 + alpha … */ };
  if (grads.length > 0 && grads.every((m) => isScrim(m[1]))) continue;
}
```

**机制**

- 白名单判定的不是"这一行这条声明"，而是"这一行 + 后面 5 行"拼成的窗口里的**所有** `linear-gradient(` 调用：`grads.every(isScrim)` 要求窗口内每一个都是中性 scrim。
- 于是窗口里只要有一条装饰性渐变（例如别处的彩色渐变），窗口里那条**合法**的中性 scrim 也一起判 FAIL。窗口只向后看（`slice(i, i + 6)`），所以"scrim 在前、彩色渐变在后且相距 5 行以内"必然中招。
- 现实后果：样式表里相邻写几条渐变（scrim 变体、或 scrim 与另一组件的渐变挨着）时，白名单静默失效。这是 2.2.3 新引入的行为——修之前所有 `linear-gradient(` 都 FAIL，所以谈不上"回归"，但白名单的覆盖面比作者以为的窄得多。

**复现**

```bash
cd "$(mktemp -d)"
cat > scrim-only.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>scrim</title>
<style>
.scrim{background:linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0));}
</style></head><body><div class="scrim"></div></body></html>
EOF
sed '4i .wash{background:linear-gradient(45deg, #ff0000, #0000ff);}' scrim-only.html > scrim-plus.html
echo "### scrim-only.html (single neutral scrim)"; node "$SKILL/scripts/lint.mjs" scrim-only.html --surface page 2>&1 | grep -E "RESULT|gradient|html:"
echo; echo "### scrim-plus.html (same scrim, one coloured gradient 1 line below)"; node "$SKILL/scripts/lint.mjs" scrim-plus.html --surface page 2>&1 | grep -E "RESULT|gradient|html:"
echo; echo "### files differ only by line 4:"; diff scrim-only.html scrim-plus.html
```

**预期**

```text
### scrim-only.html (single neutral scrim)
RESULT: 0 FAIL, 0 WARN

### scrim-plus.html (same scrim, one coloured gradient 1 line below)
  [gradient] Gradient fill. Use a flat colour or a real image (a neutral scrim over a photo is the one exception).  (2×)
      scrim-plus.html:3  linear-gradient(
      scrim-plus.html:4  linear-gradient(
RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.

### files differ only by line 4:
3a4
> .wash{background:linear-gradient(45deg, #ff0000, #0000ff);}
```

两个文件的第 3 行**逐字节相同**（`diff` 只报多了一行）；单独放时第 3 行通过，加了一行无关的彩色渐变后第 3 行被判 FAIL。

**证伪**：满足以下任一项，本条不成立：`scrim-only.html` 也报 FAIL；`scrim-plus.html` 里第 3 行没有出现在 FAIL 列表里；新加的那行与 scrim 相隔 ≥6 行时第 3 行仍然 FAIL（那样就是别的机制）。

**修复建议**：把判定单位从"行窗口"收缩到"单条声明"。最小改动是只把包含当前匹配的那一个 `linear-gradient(...)` 调用（或该行本身）交给 `isScrim`，而不是把 6 行拼起来；若要覆盖跨行的多行声明，就按 `;`/`}` 切规则块，而不是按行数切。

---

## 2. 前置守卫让 Tailwind 惯用写法结构性地进不了白名单

**位置**：`scripts/lint.mjs:129` 的守卫（与上条同一个 `if`）：

```js
if (id === 'gradient' && !/(radial|conic)-gradient\(|\bbg-(gradient|linear|radial|conic)-|\b(from|via)-(?!\[?0)[a-z]+-\d{2,3}\b/.test(line)) {
```

**机制**

- 这一行的意思是"**只有当这一行不像 Tailwind 渐变工具类时**，才进入白名单分支"。Tailwind 项目里按照文档做中性 scrim 的写法恰好命中它：
  - v4：`bg-linear-to-t from-black/55 to-transparent` → 命中 `\bbg-(gradient|linear|radial|conic)-`；
  - v3：`bg-gradient-to-t from-black/55 to-transparent` → 同上。
- 命中 → 整个白名单分支被跳过 → 直接落到下方的 `const m = line.match(re)`（`:156`）→ 因为同一行确实含有工具类片段而判 FAIL。扫描器读的是**作者源码**（class 列表），class 名里的 `from-black/55` 本身就是"中性黑 + alpha"，但工具看不到这一点。
- 一个可自查的痕迹：lint 打印的匹配片段是 `bg-linear-` / `bg-gradient-`，而不是 `linear-gradient(`——说明它走的是工具类分支，压根没进白名单。
- 编译后的形态由第 3 条覆盖：Tailwind 编译出的渐变停止色是现代色彩函数，运行时闸门同样判 FAIL。所以 v4 项目按文档做 scrim，**源码层和运行时层都过不了**。
  （说明：本条没有跑 Tailwind 构建；`hand.html` 与两个 class 文件不是"运行等价"的，它们等价的是**作者源码里那件东西**——一个中性黑 + alpha 的盖底。第 3 条测的才是编译产物的形态。）

**复现**

```bash
cd "$(mktemp -d)"
cat > hand.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>hand</title>
<style>
.scrim{background:linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0));}
</style></head><body><div class="scrim"></div></body></html>
EOF
cat > tw-v3.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>tw3</title></head>
<body><div class="bg-gradient-to-t from-black/55 to-transparent"></div></body></html>
EOF
cat > tw-v4.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>tw4</title></head>
<body><div class="bg-linear-to-t from-black/55 to-transparent"></div></body></html>
EOF
for f in hand tw-v3 tw-v4; do echo "### $f.html"; node "$SKILL/scripts/lint.mjs" $f.html --surface page 2>&1 | grep -E "RESULT|gradient|html:"; echo; done
```

**预期**

```text
### hand.html
RESULT: 0 FAIL, 0 WARN

### tw-v3.html
  [gradient] Gradient fill. Use a flat colour or a real image (a neutral scrim over a photo is the one exception).  (1×)
      tw-v3.html:2  bg-gradient-
RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.

### tw-v4.html
  [gradient] Gradient fill. Use a flat colour or a real image (a neutral scrim over a photo is the one exception).  (1×)
      tw-v4.html:2  bg-linear-
RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
```

注意打印的片段是工具类（`bg-gradient-` / `bg-linear-`），不是 `linear-gradient(`。

**证伪**：满足以下任一项，本条不成立：两个 Tailwind 文件也报 `RESULT: 0 FAIL`；把 `.wash` 那条彩色渐变放进窗口后工具类文件仍然通过（那样说明已是第 1 条的窗口机制在起作用，而不是守卫）。

**修复建议**：把守卫从"先排除工具类、再做白名单"改成"先做白名单、白名单不认才报"。工具类形式也要能进白名单判定（例如把 `from-black/55 to-transparent`、`from-white/40` 这类 token 还原成停止色再判中性）；做不到时，至少在 message 里明说"Tailwind 项目的中性 scrim 需要 `fs-ignore`"，而不是让作者以为白名单会接住它。

---

## 3. 白名单只认 rgb/hex/hsl：现代色彩空间写出的中性 scrim 两道闸一致判 FAIL

**位置**：`scripts/lint.mjs:133`（白名单第一行）、`:151-152`（裸颜色名），对比 `scripts/lib/probe.mjs:340-342` 与消费它的 `scripts/lib/rules.mjs:89`：

```js
// lint.mjs:133
if (/oklch|oklab|color\(|lab\(|lch\(|var\(/i.test(g)) return false;
// lint.mjs:151-152
const stripped = g.replace(/rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-f]{3,8}\b|\b(to|top|bottom|left|right|deg|rad|turn|grad|in|srgb|transparent)\b|[-+\d.%px,\s/]/gi, '');
return hasAlpha && !/[a-z]/i.test(stripped);
// probe.mjs:340-342（运行时）
const exotic = /oklch|oklab|color\(|lab\(|lch\(|hsl/.test(cs.backgroundImage);
const scrim = !exotic && stops.length > 0 && stops.every((c) => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]) <= 14) && stops.some((c) => c.length > 3 && c[3] < 1);
if (scrim) scrims++; else { gradients++; … }
// rules.mjs:89
if (s.gradients) add('FAIL', 'gradient', `${s.gradients} gradient fill(s): …`);
```

**机制**

- 白名单第 133 行把这些函数**整体**排除（不看参数）。运行时闸门用 `exotic` 做同样的排除，并把它们计入 `gradients`，而 `rules.mjs:89` 对任何 `gradients > 0` 直接 FAIL。
- 于是"中性黑 scrim"只要写成 `oklch(0% 0 0 / .55)`、`oklab(0% 0 0 / .55)`、`color-mix(in oklab, #000 55%, transparent)` 或 `var(--scrim)`，两道闸**一致**判 FAIL（一致，所以不是 lint/inspect 分叉，而是两边都漏）。
- 裸颜色名同理：`:151` 要求把字母全部剥掉，`white` 会留下字母，于是 `linear-gradient(to top, transparent, white)` 也 FAIL——而 `rgba(255,255,255,0.6)` 通过。这几种写法表达的是同一个中性盖底。
- 与第 2 条连起来看：现代调色板（把黑写成 `oklch(...)`）或使用 `color-mix` 的构建产物都会落到本条。本机实测的两种形态就是 `oklch(...)` 与 `color-mix(...)` 编译后的样子。

**复现**

```bash
cd "$(mktemp -d)"
cat > mk.cjs <<'EOF'
// 每个文件只含一条渐变声明，避免第 1 条的窗口连坐混淆归因
const fs = require('node:fs');
const forms = {
  'rgba-control': 'rgba(0,0,0,0.55), rgba(0,0,0,0)',
  'oklch':        'oklch(0% 0 0 / 0.55), oklch(0% 0 0 / 0)',
  'oklab':        'oklab(0% 0 0 / 0.55), oklab(0% 0 0 / 0)',
  'colormix':     'color-mix(in oklab, #000 55%, transparent), transparent',
  'var':          'var(--scrim-a), transparent',
  'named-colour': 'transparent, white',
};
for (const [name, stops] of Object.entries(forms)) {
  const css = name === 'var' ? ':root{--scrim-a:rgba(0,0,0,0.55)}' : '';
  fs.writeFileSync(`${name}.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${name}</title>\n<style>\n${css}\n.scrim{background:linear-gradient(to top, ${stops});}\n</style></head><body><div class="scrim"></div></body></html>`);
}
EOF
node mk.cjs
for f in rgba-control oklch oklab colormix var named-colour; do
  printf '%-14s %s\n' "$f" "$(node "$SKILL/scripts/lint.mjs" $f.html --surface page 2>&1 | grep -E '^RESULT')"
done

# 运行时闸门测同样两种形态（同一个中性黑盖底）
cat > runtime.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>runtime</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#ffffff}
header{padding:64px}
h1{font-size:56px;line-height:1.05;margin:0 0 16px}
.shot{position:relative;height:40svh;background:#5a5a5a}
.scrim{position:absolute;left:0;right:0;bottom:0;padding:24px 64px}
.scrim h2{font-size:40px;color:#fff;margin:0}
.scrim-oklch{background:linear-gradient(to top, oklch(0% 0 0 / 0.6), oklch(0% 0 0 / 0));}
.scrim-mix{background:linear-gradient(to top, color-mix(in oklab, #000 60%, transparent), transparent);}
</style></head><body>
<header><h1>Two neutral scrims</h1></header>
<div class="shot"><div class="scrim scrim-oklch"><h2>Oklch scrim</h2></div></div>
<div class="shot"><div class="scrim scrim-mix"><h2>Color-mix scrim</h2></div></div>
</body></html>
EOF
node "$SKILL/scripts/inspect.mjs" runtime.html --surface page --widths 1440 --out out --json > rt.json 2>/dev/null
node -e 'const r=require("./rt.json"); const s=r.viewports[0].metrics.surfaces;
console.log("gradients", s.gradients, "scrims", s.scrims);
console.log("samples:", JSON.stringify(s.gradientSamples));
for (const f of r.findings) if (f.id === "gradient") console.log(f.level, f.id, "|", f.message.slice(0, 150));'
```

**预期**

```text
rgba-control   RESULT: 0 FAIL, 0 WARN
oklch          RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
oklab          RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
colormix       RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
var            RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
named-colour   RESULT: 1 FAIL, 0 WARN — fix the FAILs before rendering.
```

运行时（同一个中性黑盖底，两种现代色彩空间）：

```text
gradients 2 scrims 0
samples: ["div.scrim.scrim-oklch → linear-gradient(to top, oklch(0 0 0 / 0.6), oklch(0 0 0 / 0))","div.scrim.scrim-mix → linear-gradient(to top, oklab(0 0 0 / 0.6), rgba(0, 0, 0, 0))"]
FAIL gradient | 2 gradient fill(s): div.scrim.scrim-oklch → linear-gradient(to top, oklch(0 0 0 / 0.6), oklch(0 0 0 / 0)) | div.scrim.scrim-mix → linear-gradient(to t
```

`scrims 0` 是关键：两个中性盖底都被算成装饰性渐变。（顺带一个实现细节：Chrome 把 `color-mix(in oklab, #000 60%, transparent)` 序列化成了 `oklab(0 0 0 / 0.6)`，所以运行时看到的是 `oklab(`。）

**证伪**：满足以下任一项，本条不成立：`rgba-control` 也 FAIL（那样是别的机制）；`oklch`/`oklab`/`colormix`/`var`/`named-colour` 中任一个不再 FAIL；`runtime.html` 的两个盖底在 inspect 里被记为 `scrims` 而非 `gradients`。

**修复建议**：两侧一起扩到现代色彩函数。中性判定其实不需要解析器：`oklch(L C H / a)` 与 `oklab(L a b / a)` 里第二、三个分量全为 0 就是中性黑/白，`color-mix(in oklab, #000 x%, transparent)` 的第一支已经写出了颜色，`hsl(H 0% L% / a)` 同理。`var()` 无法离线解析，可以保留 FAIL，但应在 message 里说明这是"无法确认中性"而不是"这是装饰渐变"，并给出出路（写成字面颜色，或 `fs-ignore`）。

---

## 4. 两张库蓝图仍规定 5–6 屏的 pin，与同一张库的"两三屏"上限冲突

**位置**：`library/sections.json:2713`（`about-pinned-title-portraits`）与 `library/heroes.json:87`（`pinned-title-over-portraits` 的 blueprint），对比 `library/directions.json:156,164`（`pinned-poster`）、`library/motions.json:20`（`pinned-story`）。

这是 2.2.2 的遗留：那一版把长 pin 的规则从"超过 3 屏就 WARN"改成了现行为（`r.best > 3`），并把方向/动效的文案改成"两三屏"，但**没有改蓝图本身**。

**复现**

```bash
cd "$(mktemp -d)"
cat > pins.cjs <<'EOF'
const S = process.argv[2];
const load = (f) => require(S + '/library/' + f);
const frag = (s, re) => (String(s).match(re) || ['(not found)'])[0];
const sec = load('sections.json').find((x) => x.id === 'about-pinned-title-portraits');
const her = load('heroes.json').find((x) => x.id === 'pinned-title-over-portraits');
const dir = load('directions.json').find((x) => x.id === 'pinned-poster');
const mot = load('motions.json').find((x) => x.id === 'pinned-story');
console.log('sections  about-pinned-title-portraits :', frag(sec.blueprint, /[^.]*(?:six people|per person)[^.]*\./));
console.log('heroes    pinned-title-over-portraits   :', frag(her.blueprint, /[^.]*five to eight in all[^.]*\./));
console.log('directions pinned-poster imagery        :', frag(dir.imagery, /[^.]*two or three[^.]*\./i));
console.log('directions pinned-poster pitfalls       :', frag(dir.pitfalls, /[^.]*pinned run[^.]*\./));
console.log('motions   pinned-story description      :', frag(mot.description, /[^.]*two or three screens[^.]*\./));
EOF
node pins.cjs "$SKILL"
```

**预期**

```text
sections  about-pinned-title-portraits : A wrapper tall enough for its portraits: about 90svh per person, up to six people.
heroes    pinned-title-over-portraits   :  As the page scrolls, further portraits of identical ratio and position replace the first, five to eight in all, each bringing its own flat ground colour sampled from the photograph, before the layer releases.
directions pinned-poster imagery        :  Two or three in the pinned run.
directions pinned-poster pitfalls       :  Hold the pinned run to two or three viewports or it feels like a trap.
motions   pinned-story description      :  Hold the pinned run to two or three screens.
```

前两行（库蓝图，5–6 屏）与后三行（同一张库的方向与动效，2–3 屏）对同一个装置给了互相冲突的数量。忠实照蓝图建的页面会被 `long-pin` 判 WARN。

**证伪**：满足以下任一项，本条不成立：两张蓝图不再规定 5–6 屏；或方向/动效不再要求两三屏；或 `pinned-poster` 与 `pinned-story` 已不与这两张蓝图搭配出现。

**缓解（已存在，但不等于修好）**：`scripts/draw.mjs:423` 的调整注记会在发牌时提醒"hold a pin for two or three screens at most"。注记条件是从源码原文里取出来测的（不重打正则）：

```bash
cat > note.cjs <<'EOF'
const fs = require('node:fs');
const S = process.argv[2];
const src = fs.readFileSync(S + '/scripts/draw.mjs', 'utf8');
const line = src.split(/\r?\n/).find((l) => /hold a pin for two or three/.test(l));
const cond = line.trim().match(/^if \((.*)\) notes\.push/)[1];
const fires = new Function('text', 'return ' + cond);
console.log('condition taken from draw.mjs source, not retyped:', cond.length, 'chars');
for (const [label, file, id] of [
  ['sections  about-pinned-title-portraits', 'sections.json', 'about-pinned-title-portraits'],
  ['heroes    pinned-title-over-portraits  ', 'heroes.json', 'pinned-title-over-portraits'],
]) {
  const e = require(S + '/library/' + file).find((x) => x.id === id);
  console.log(label, ' note fires on this text:', fires([e.blueprint, e.mobile, e.headline].join(' ')));
}
EOF
node note.cjs "$SKILL"
```

预期：

```text
condition taken from draw.mjs source, not retyped: 267 chars
sections  about-pinned-title-portraits  note fires on this text: true
heroes    pinned-title-over-portraits    note fires on this text: true
```

（这是对注记**条件**的测试，不是整条发牌流水线；条件为真说明照这两张蓝图发牌时注记会出现。）

**修复建议**：把两张蓝图的 pin 长度改到两三屏（`about-pinned-title-portraits` 的 "about 90svh per person, up to six people" → 两三个人、或 3 屏以内；`pinned-title-over-portraits` 的 "five to eight in all" → 两三个），与 `directions.json` / `motions.json` 用同一句措辞。注记是兜底，不是许可证。

---

## 5. `tells.md` 定义"banned = 闸门判 FAIL"，但 product 模式下 eyebrow 永远只能 WARN

**位置**：`references/tells.md:9-10`（状态定义）、`:17`（"banned everywhere" 的清单，含 decorative kickers）、`:49`（eyebrow 一行的状态列），对比 `references/product-surfaces.md:121` 与 `scripts/lint.mjs:102`：

```js
// lint.mjs:102
const RELAXED = surface === 'product' ? new Set(['mono', 'numbering', 'eyebrow', 'micro-label', 'hairline', 'outlined-box', 'shadow']) : new Set();
// lint.mjs:157 —— RELAXED.has(id) && level === 'FAIL' ? 'WARN' : level
```

`tells.md:9-10` 原文：

> `scripts/inspect.mjs` and `scripts/lint.mjs` detect most entries. Status: **banned** means the
> inspector fails the page; **warned** means it flags it and you need a reason.

`tells.md:17` 原文把 decorative kickers 列进"both modes 都仍适用"的一组；`:49` 把 eyebrow/kicker 标为 `banned`。而 `product-surfaces.md:121` 自己说：

> | No eyebrows | **Relaxed to a warning** | … A kicker above the screen's own title is still an eyebrow. |

**机制**

- 工具侧：`eyebrow` 在 product 模式下进了 `RELAXED`，所以 lint 与 inspect 都只会 WARN，**任何** product 页面的 eyebrow 都不可能 FAIL（lint.mjs:102,157；rules.mjs 的 RELAXED 同样是 `eyebrow`）。
- 文档侧：`product-surfaces.md:121` 明确保留了一种应当仍被禁的情形——"a kicker above the screen's own title is still an eyebrow"；而 `tells.md:17` 也说 decorative kickers 在两种模式下都 banned。既然 `tells.md:9-10` 把 banned 定义成"闸门判 FAIL"，这三处就不能同时为真。
- 这不是"工具坏了"：检测器确实无法从源码区分"面板标题"与"装饰性 kicker"，降级为 WARN 并要理由是可辩护的。问题是 `tells.md` 的定义句没跟上，读者按 `tells.md` 做判断时会以为 product 页上的装饰性 kicker 会被闸门拦下。

**复现**

```bash
cd "$(mktemp -d)"
cat > kicker.html <<'EOF'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>kicker</title>
<style>
body{margin:0;font:16px/1.5 system-ui;color:#141414;background:#ffffff}
.kicker{font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6d6d6d;margin:0 0 12px}
h1{font-size:56px;line-height:1.05;margin:0}
</style></head><body>
<main><p class="kicker">Field notes</p><h1>Nine months of rain</h1></main>
</body></html>
EOF
for s in page product; do printf '%-8s ' "$s"; node "$SKILL/scripts/lint.mjs" kicker.html --surface $s 2>&1 | grep -E '^RESULT'; done
node "$SKILL/scripts/inspect.mjs" kicker.html --surface product --widths 1440 --out out --json > k.json 2>/dev/null
node -e 'const r=require("./k.json");
for(const f of r.findings) if(f.id==="eyebrow") console.log("  ", f.level, f.id, "|", f.message.slice(0,80));'
```

这是个 kicker 直接压在**本屏标题**上方的页面——按 `product-surfaces.md:121` 的措辞它是"still an eyebrow"，即仍被禁。

**预期**

```text
page     RESULT: 2 FAIL, 0 WARN — fix the FAILs before rendering.
product  RESULT: 0 FAIL, 2 WARN
   WARN eyebrow | 1 eyebrow/kicker label(s) above headings: "Field notes" above "Nine months of ra
```

同一个文件、同一个 kicker：page 模式 FAIL，product 模式只 WARN（inspect 侧同样是 `WARN`，不是 `FAIL`）。

**证伪**：满足以下任一项，本条不成立：product 模式下这个 kicker 报 FAIL；`tells.md:9-10` 已经把 banned 的定义限定为"page 模式"；`tells.md:17` 不再声称 decorative kickers 在两种模式下都 banned。

**修复建议**：改 `tells.md:9-10` 的定义，承认 §5 的放松表：例如"**banned** means the inspector fails the page in `page` mode; entries in the §5 relaxation table are warnings under `--surface product`, and the reviewer decides"；并在 `:17` 或 `:49` 处把"kicker above the screen's own title 仍禁"写成"无法由检测器强制，需人工判定"。若坚持 kicker 在 product 下也应 FAIL，就得让 `eyebrow` 离开片面的 `RELAXED`（但那会误伤 `panel title` / `<label>`，因为检测器分不出来）——所以最小且诚实的修法是改文档。

---

## 附录（非问题，但会误导读多宽度报告的人）

`scripts/inspect.mjs:235-242` 会**按 `id` + `level` 跨视口去重**，把较窄视口的同一条 finding 折进最宽那条的 `alsoAt`：

```js
const merged = [];
for (const f of report.findings) {
  const same = merged.find((x) => x.id === f.id && x.level === f.level);
  if (same && f.id !== 'headline-lines' && f.id !== 'overflow') { same.alsoAt = [...(same.alsoAt || []), f.width]; continue; }
  merged.push(f);
}
report.findings = merged;
```

这是有意设计（"keep the widest occurrence, note the others"），不是缺陷。但要提醒：用 `--widths 1440,390` 跑、再按 `f.width === 390` 过滤脚本时，**390 上单独触发的 finding 会查不到**（它被折进了 1440 那条的 `alsoAt`）。本机实测：同一个 `skip.html` 在 `--widths 390` 下 390 能查到 `WARN first-action`，在 `--widths 1440,390` 下 390 一条都查不到、而 1440 那条带 `alsoAt: [390]`。核对逐视口行为时请用 `alsoAt` 或分宽度单独跑。