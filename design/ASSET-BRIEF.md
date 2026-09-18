# Asset spec — Strike First

Functional requirements for any visual asset destined for this game. Design
direction is given separately, per asset. This document covers only what makes
an asset *usable*: format, palette, geometry and delivery.

Everything here is a hard requirement unless it says otherwise. The unusual one
is the format. The game is one HTML file with no build step. Small artwork is
inlined into it as path data, and the only files beside it are the large
pixel-art images in `assets/`, fetched in the background (§1a). An asset that
fits neither route is unusable regardless of how it looks.

---

## 0. Where everything lives

Repository: `karinnielsen/strike-first` on GitHub, default branch `main`.

| What | Path |
| -- | -- |
| This spec | `design/ASSET-BRIEF.md` |
| The game — all of it | `index.html` |
| Colour palette | `index.html`, the `:root` block at the top of `<style>` |
| Wordmark — the cobra crest | `index.html`, the inline `<svg>` in `h1.crest` |
| Board geometry — `CELL`, `COLS`, `ROWS` | `index.html`, top of the `<script>` |
| Dojo crests as shipped (320px WebP) | `assets/crests/` |
| Dojo crest sources, prompts and 18px badges | PR #6, branch `assets/dojo-crests`, `design/dojo-crests/` |
| Dojo badges as shipped (18px path data) | `index.html`, `DOJO_BADGES` |
| Belt colours | `index.html`, `BELTS` |
| Balance constants | `index.html`, section 2 of the `<script>` |
| How to work on the project | `CLAUDE.md` |
| Version history | `CHANGELOG.md` |
| Roadmap, design principles, open questions | The Linear project, linked from `CLAUDE.md` |

If the tool doing the drawing can read GitHub, work from the files directly. If
it cannot, paste the contents of this spec in instead.

If you can read the repo, `index.html` is the source of truth for any colour or
dimension. This spec is a copy of those values and can go stale.

---

## 1. Output format

There are two routes into the game. Each asset's section in §8 says which one
it takes.

**Inline: SVG, as editable source.** For logos, marks and small sprites. Not a
PNG, not a rasterised trace, not a PNG wrapped in an SVG.

Each inline asset is pasted directly into `index.html` as `<svg>` markup or path
data. There is no build step and no asset pipeline. Therefore:

| Requirement | Why |
| -- | -- |
| No external references of any kind — no linked fonts, no `<image href>`, no external CSS | Nothing resolves; the file must stand alone |
| All text converted to outlines | Font references will not resolve |
| No embedded raster, including base64 `<image>` payloads | Blows the size budget and defeats scaling |
| Texture via vector shapes, `<filter>` or `<pattern>` only | Same |
| `viewBox` on the root, no hardcoded `width`/`height` | The game scales it in CSS |
| All ids prefixed and unique, e.g. `crest-grad-1` | The SVG lands in a shared document; bare ids like `a` or `gradient1` collide |
| Path count kept low; no auto-trace output | The file is read and edited by hand |

Deliver the raw `.svg`. A PNG preview alongside is useful for checking but is
not the deliverable.

### 1a. Raster: pixel art in `assets/`

For large, detailed pixel art that cannot be path data, such as the dojo crests
since v0.5.0. The file sits beside the game and is fetched
in the background before the screen that shows it.

| Requirement | Why |
| -- | -- |
| **Pixel art,** in the same family as the dojo crests: fine square pixels, stair-stepped contours, restrained pixel shading | Every large image on screen at once has to look drawn by one hand |
| Deliver a **lossless PNG master** at the size §8 gives | The shipped WebP is made from it at integration, so it has to be clean |
| **Transparent background, alpha only 0 or 255** | The card's glow shows through; a part-transparent fringe turns to a halo on near-black |
| No lettering, frame, banner, glow, blur, smooth gradient or drop shadow | The page draws the frame and the glow, in the dojo's light |
| Square canvas, subject centred with the margins §8 gives | Cards are square, and the art is sized in CSS |

Integration, not the artist, turns the master into the file that ships: WebP,
quality 90, at the size in §8. The dojo crests went 3.8MB of PNG to 155KB this
way.

## 2. Size budget

**Inline: under 20KB of SVG source per asset, target under 10KB.** The whole
game is about 275KB of HTML, and the title crest (the one inline asset allowed
over budget, see `design/title-crest/README.md`) is a large share of it.

**Raster: under 70KB per shipped WebP, target under 50KB.** The three dojo
crests are 40–68KB each. The master PNG has no budget, since it doesn't ship.

## 3. Colour

Use the existing palette. Values are the CSS custom properties in `index.html`.

| Token | Hex | Role |
| -- | -- | -- |
| `--bg` | `#09090b` | Page background |
| `--panel` | `#131316` | The board |
| `--line` | `#2a2a30` | Grid lines, borders |
| `--text` | `#ece6da` | Body text, bone |
| `--dim` | `#8a838f` | Only styling that carries no information: the version line, the title's credit |
| `--value` | `#fff7b8` | Numbers beside their labels |
| `--yellow` | `#ffff00` | Reward, and the one thing the screen is asking you to do. Never rank |
| `--yellow-deep` | `#7a7a00` | The shadow side of yellow |
| `--red` | `#d3262f` | Points lost |
| `--brand` | `#ee3524` | The wordmark only |
| `--bone` | `#e8e2d6` | The snake |

Artwork palettes have used `#7b7480` as a mid grey since before `--dim` was
lightened. It is still allowed inside artwork.

Rank is carried by the belt colours, which live in `BELTS` in the script rather
than in this table. Those seven hues are effectively the whole colour budget:

| Belt | Hex |
| -- | -- |
| White | `#e8e2d6` |
| Orange | `#f4761c` |
| Green | `#46a86c` |
| Brown | `#9c6438` |
| Red | `#d3262f` |
| Cho Dan Bo (blue) | `#3f7fd0` |
| Midnight blue | `#324791` |

Each dojo has its own light, used for its card, the room and the banner:
Cobra Kai `#ffff00`, Miyagi-Do `#d3262f`, Eagle Fang `#ece6da`.

### Adding a hue requires approval

**If an asset needs a colour not in the table above, ask before using it.**

Colour in this game carries meaning: it encodes rank across seven belts, and
that is effectively the whole colour budget. A new hue is not forbidden, but it
is a system-level change that has to be checked against the belt ladder and the
loss signalling before it ships. Flag it, name the hue and what it distinguishes,
and get a decision. Do not introduce one silently.

Where a new colour is being reached for purely to separate two elements, prefer
shape, weight, or texture instead — those cost nothing.

### Background assumption

**All assets are drawn on near-black, `#09090b`.** Pure white is too bright; use
bone `#ece6da`. Artwork that only works on a light background will be rejected.

## 4. Typography

No display typeface appears in the game. The wordmark's lettering is outlined
into the crest artwork, and everything else is system monospace.

Assets should avoid lettering. Where lettering is unavoidable it must be
outlined paths, per section 1.

## 5. Geometry

| Thing | Size |
| -- | -- |
| Play area | 630 × 630 px, shrinking to no less than 420 × 420 on short screens |
| Grid | 21 × 21 cells |
| One cell | 30 × 30 px, and never below 20 × 20 |
| Authoring box for board art | 20 × 20, scaled up at draw time by `CELL_SCALE` |
| Wordmark | The cobra crest, inline SVG, sized in CSS |
| Art on a dojo select card | Square, 120–160 CSS px, fitted to the window |
| Icon slot on a rankings row | 18 × 18 px, exactly |

**Board assets must read at 20 × 20 px,** the smallest a cell is ever drawn. At
that size only silhouette and one strong colour break survive. Verify at actual
size, not zoomed.

**Page assets** — anything outside the board — have room for detail.

### Nothing may obscure the gameplay canvas

No asset is placed over the play area while a run is live. An asset is either a
game object drawn at cell size *inside* the board, or it lives outside the board
entirely. There is no overlay case.

## 6. Accessibility checks

Every asset is checked before it ships:

* Contrast against the board colour
* Under a deuteranopia simulation — it collapses the red/green distinction the
  belt ladder depends on
* No two elements of the same asset distinguished by hue alone
* Complete as a static image; motion may be disabled by the OS preference

## 7. Assets drawn on the board are different

**Read this before drawing anything that appears inside the play area.** It overrides parts of section 1.

The board is an HTML `<canvas>`, painted with drawing commands. It is not
inline SVG and nothing in it is a DOM element. An SVG file cannot simply be
placed there.

What works is `Path2D`, which accepts SVG **path data** directly:

```js
const EGG = new Path2D('M10 3 C13 3 15 6 15 9 ...');
ctx.fillStyle = '#f4e8cf';
ctx.fill(EGG);
```

So a board asset is useful to us if, and only if, it survives being reduced to
a short list of path strings, each filled with one flat colour.

### Extra requirements for board assets

| Requirement | Why |
| -- | -- |
| **`viewBox="0 0 20 20"`**, artwork centred, drawn to fill it | The authoring box. It is one cell, scaled to whatever size the cell is drawn |
| **Flat fills only.** No gradients, no filters, no blend modes, no opacity on a gradient stop | `Path2D` carries geometry only. Fills are set in code, one at a time |
| **Each colour is its own `<path>`** with a plain `fill="#rrggbb"` | Every distinct fill becomes one `fillStyle` + one `fill()` in code |
| **Under 12 paths per asset**, fewer is better | Each path is a draw call, sixty times a second |
| **No `<use>`, `<defs>`, `<mask>`, `<clipPath>`, `<text>`, `<image>`** | None of it survives the trip into `Path2D` |
| **Strokes converted to filled outlines** | Canvas strokes a path differently; a filled shape is unambiguous |
| Absolute path commands preferred | Easier to read and adjust by hand afterwards |

**Test it at 20 x 20 px before sending it.** Not zoomed. At that size a shape
gets a silhouette and about one internal detail. Anything more is noise that
costs draw calls and legibility.

**Delete any path that does not change what you see at 20px.** This is not a
size budget, it is a legibility rule: fine detail does not merely fail to
render, it muddies the silhouette that does. If removing a path improves the
read, it was never detail. The first delivered mouse had ten paths and read
better with five.

**Check every board object against the SNAKE, not only the background.** The
snake is most of what moves on the board and it is bone white. The first
delivered egg was filled with the exact bone the snake uses and became
indistinguishable from a body segment at cell size. Contrast against `#131316`
is necessary and not sufficient.

### The head is the exception to 20 x 20

Measured in the 20px authoring box, the snake's hood is 26 units wide and its
tongue reaches 18 units ahead of the head centre. They have never fitted inside one cell and they are not going to.

So head artwork is authored in a 20px box and **normalised by 1/1.8 about the
pivot `(10,10)`**, then scaled back up at draw time: `translate(cx, cy)`,
rotate for direction, `scale(1.8, 1.8)`, `translate(-10, -10)`. That restores
a 14 x 14 head with a 15 x 26 hood, in the same units.

Rendering the head as a plain 20px sprite shrinks it and is wrong. This
adapter exists because the 20px rule and the approved head dimensions
genuinely conflict, and the head is the thing that wins.

### The snake is not a picture

The snake is drawn as a row of separate squares, and almost everything about it
changes at runtime. It cannot be delivered as a single illustration.

**The head** is redrawn every frame and must be supplied as parts:

* It **rotates** to face four directions. Draw it facing **right**, with the
  pivot at the centre of the cell
* The **eyes blink**, and become crosses on defeat
* The **tongue** flicks in and out, and stays out while the snake is queasy
* The **hood** flares behind the head
* It **shudders** when the snake has eaten something rotten

So supply the head as separately named paths — `head`, `hood`, `eye-left`,
`eye-right`, `tongue`, `markings` — not one merged shape. Anything fused into
the head outline cannot be animated and will be thrown away.

**The body segments** shrink and darken from the shoulders to the tail tip,
and that ramp is computed in code. Supply one body block and one tail-tip
block as plain shapes with a single flat fill each; the fill is replaced at
runtime and any baked-in shading will fight it.

**One body segment carries the belt**, in a colour that changes with the
player's rank. So the body block must be a single recolourable shape. A block
with two tones in it cannot wear a belt.

## 7a. Pixel art for the board — tried, not chosen

**Decided 9 September: vector won.** Kept here as a record of the experiment,
not as a requirement. The complete pixel-art alternative lives on the branch
`assets/pixel-sprites`.

### What was tried

Vector artwork did not read at 20px cells. Pixel art is the discipline invented
for exactly that constraint, so a full set was commissioned to the same brief:
authored at 10 x 10, rendered at 2x into the cell, delivered as a palette plus a
grid of characters so it could still be inlined without a build step.

### Why it lost

The problem was never the style, it was the cell. Dropping phones from the
project allowed 30px cells on the same 21 x 21 grid, and at 30px the vector
artwork became legible immediately.

At that point pixel art's own constraint started to cost: it has to scale by
whole numbers or it turns to mush, and a board that shrinks to fit short screens
cannot promise a whole-number scale. Vector has no such limit.

### What carries over

One rule from the experiment applies to everything: **raise an existing palette
colour being used for a new meaning,** not only a new hue. A colour already in
the file can still collide with what it means elsewhere.

## 8. Per-asset requirements

Design direction is supplied separately. These are the functional targets.

### Cobra crest for the title lockup — UNR-86

**Delivered, shipped in v0.3.1.** See `design/title-crest/`.

* Locks up with the wordmark, lettering outlined into the artwork
* Drawn at roughly 300–400px wide, must survive scaling down
* Page asset, not a board asset

### Dojo crests — UNR-114

**Delivered, shipped in v0.5.0.** Sources, the generation prompt and the 18px
badges are in PR #6. This set is the reference for any large pixel art that
follows.

* Cobra Kai, Miyagi-Do and Eagle Fang, drawn as a family in higher-density pixel
  art (about 160 logical pixels across)
* Shipped as 320px WebP in `assets/crests/`, shown at 120–160 CSS px on the
  dojo select cards
* The rankings use a separate badge for each, **drawn natively at 18 × 18**,
  because the large crests shrunk to 18px were illegible
* **Distinguishable in monochrome**, by silhouette. Colour reinforces the
  difference but never carries it alone (see §3)

### Character portraits — UNR-115

**Dropped, 18 September,** before anything was drawn. Its spec is kept on the
branch `mock/character-select`.

### Board sprites — egg, rotten egg, mouse, snake head, snake body

**Delivered, shipped in v0.3.1** as vector artwork. The paths are inlined in
`SPRITE` in the script; the delivered files are on the branch
`asset-review/board-sprites`.

* **Section 7 applies to all of these** — they are canvas assets, not DOM SVG
* `viewBox="0 0 20 20"`, flat fills, one path per colour
* The egg and the rotten egg should **rhyme**: same silhouette family, so the
  rotten one reads as a bad version of a thing you know rather than a new
  object. The current rotten egg is tipped over and cracked, which is what
  tells you it is wrong before the colour does — keep a non-colour signal
* The mouse must not be confusable with either egg at cell size
* The snake head and body: see "The snake is not a picture" above

## 9. How to deliver

Same every time, so a request can be one line rather than a page.

**Push a branch. Never main.**

* **Name the branch after the Linear issue** given in the request,
  `unr-N-short-slug`, and branch from the release branch it names, or
  `main` if it names none. Linear closes the
  issue when the PR from that branch merges, and a branch with any other
  name closes nothing. (Earlier deliveries used `assets/<what-it-is>`; don't.)
* **Open the draft PR against the branch you started from**
* **One commit to start.** Review rounds add commits. No force-pushing, no
  rewriting history
* **Add files under `design/<what-it-is>/` only.** Do not modify `index.html`,
  `test.js`, `CHANGELOG.md`, `CLAUDE.md`, or anything else in the repo — the
  integration is done separately and by hand
* Do not bump a version, create a tag, or merge anything
* Open it as a draft PR and stop there

The reason for the last two: integration always needs decisions the artwork
cannot make on its own. Every batch so far has needed at least one — a colour
that collided with something, a level of detail that did not survive cell
size, a coordinate contract that had to be written down.

**Say what you had to break.** A short `README.md` in the same directory
listing anything in this spec you could not meet, and why. That has been more
useful than the artwork twice now: the head scale conflict was found that way,
and so was the fact that a blurred vapor cloud cannot be a filter-free path.

## 10. What to send back

1. Inline assets: the optimised `.svg` — ids prefixed, text outlined, no
   external references. Raster assets: the lossless PNG master (§1a)
2. A PNG preview at intended display size; for board assets, a second at 20 × 20px
3. A note listing anything in this spec that was broken, and why
