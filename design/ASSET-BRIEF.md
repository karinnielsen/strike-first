# Asset brief

What makes artwork *usable* in Strike First: format, palette, geometry and
delivery. Design direction comes separately, per request. Everything here is
a hard requirement unless it says otherwise.

The game is one HTML file with no build step, so artwork gets in one of two
ways: inlined as vector path data, or as a pixel-art image in `assets/`. An
asset that fits neither can't be used, however good it looks.

`index.html` is the source of truth for every colour and size. This brief
copies them and can drift.

## 0. Where things live

Repo: `karinnielsen/strike-first`, branch `main`.

| What | Where |
| -- | -- |
| The whole game | `index.html` |
| Palette | `:root` at the top of the `<style>` in `index.html` |
| Belt colours | `BELTS` in `index.html` |
| Board size: `CELL`, `COLS`, `ROWS` | top of the `<script>` in `index.html` |
| Board sprites | `SPRITE` in `index.html` |
| Wordmark | inline `<svg>` in `h1.crest` |
| Dojo crests | `assets/crests/` (320px WebP) |
| Dojo badges (18px) | `DOJO_BADGES` in `index.html` |

## 1. Format

Each request says which route it takes.

### Inline SVG

For logos, marks and sprites. Deliver the raw `.svg`, not a PNG or a traced
bitmap.

| Requirement | Why |
| -- | -- |
| No external references: fonts, `<image href>`, CSS | Nothing outside the file resolves |
| Text converted to outlines | Fonts won't load |
| No embedded raster, including base64 | Blows the budget, won't scale |
| `viewBox` on the root, no fixed `width`/`height` | Sized in CSS |
| Every id prefixed and unique, e.g. `crest-grad-1` | It shares one document with everything else |
| Few paths, no auto-trace | It's read and edited by hand |

### Pixel art in `assets/`

For large, detailed art that can't be path data, like the dojo crests.

| Requirement | Why |
| -- | -- |
| **Pixel art** in the dojo crests' family: fine square pixels, stepped contours, restrained shading | Big images on screen together must look drawn by one hand |
| A **lossless PNG master** at the requested size | The WebP that ships is made from it |
| **Transparent background, alpha only 0 or 255** | A soft fringe turns into a halo on near-black |
| No lettering, frame, glow, blur, gradient or shadow | The page draws the frame and glow |
| Square canvas, subject centred | Cards are square |

Integration converts the master to WebP at quality 90. The dojo crests went
from 3.8MB of PNG to 155KB this way.

## 2. Size budget

- **Inline:** under 20KB of SVG per asset, aim for 10KB. The page is about
  300KB, and the title crest (the one allowed exception) is a big share.
- **Raster:** under 70KB per WebP, aim for 50KB. The dojo crests are
  39–66KB. The master PNG has no budget.

## 3. Colour

Use the existing palette.

| Token | Hex | Role |
| -- | -- | -- |
| `--bg` | `#09090b` | Page background |
| `--panel` | `#131316` | The board |
| `--line` | `#2a2a30` | Grid lines, borders |
| `--text` | `#ece6da` | Text: bone |
| `--dim` | `#8a838f` | Only styling with no information, like the version line |
| `--value` | `#fff7b8` | Numbers beside their labels |
| `--yellow` | `#ffff00` | Reward, and what the screen asks you to do. Never rank |
| `--yellow-deep` | `#7a7a00` | Yellow's shadow side |
| `--burnt` | `#7a3000` | A heading's shadow side, where yellow burns to orange |
| `--red` | `#d3262f` | Points lost |
| `--brand` | `#ee3524` | The wordmark only |
| `--bone` | `#e8e2d6` | The snake |

`#7b7480`, an older mid grey, is still allowed inside artwork.

Rank owns the belt colours, and they're effectively the whole colour budget:

| Belt | Hex |
| -- | -- |
| White | `#e8e2d6` |
| Orange | `#f4761c` |
| Green | `#46a86c` |
| Brown | `#9c6438` |
| Red | `#d3262f` |
| Cho Dan Bo (blue) | `#3f7fd0` |
| Midnight blue | `#324791` |

Each dojo has its own light: Cobra Kai `#ffff00`, Miyagi-Do `#d3262f`,
Eagle Fang `#ece6da`.

- **Ask before adding a hue.** Colour encodes rank, so a new one is a
  system change. Name it and what it distinguishes, and get a decision.
- **Ask before reusing a palette colour for a new meaning, too.** It can
  collide with what it already means.
- **To separate two elements, prefer shape, weight or texture.** They cost
  nothing.
- **Everything sits on near-black `#09090b`.** Use bone, not pure white.
  Art that only works on light is rejected.

## 4. Lettering

The game has no display typeface: the wordmark is outlined into the crest,
and everything else is system monospace. Avoid lettering. Where it's
unavoidable, outline it.

## 5. Geometry

| Thing | Size |
| -- | -- |
| Board | 630 × 630px, never below 420 × 420 on short screens |
| Grid | 21 × 21 cells |
| Cell | 30 × 30px, never below 20 × 20 |
| Board art authoring box | 20 × 20, scaled at draw time by `CELL_SCALE` |
| Dojo select card art | square, 120–160 CSS px |
| Rankings row icon | exactly 18 × 18px |

- **Board art must read at 20 × 20px,** the smallest a cell gets. Only a
  silhouette and one strong colour break survive. Check at actual size,
  not zoomed.
- **Page art** (anything off the board) has room for detail.
- **Nothing covers the board during a run.** Art is either drawn inside a
  cell, or lives off the board entirely.

## 6. Accessibility

Check every asset for:

- contrast against the board
- a deuteranopia simulation, which removes the red/green split the belts
  rely on
- no two parts told apart by hue alone
- working as a still image, since the OS can turn motion off

## 7. Board art

**Read this before drawing anything that appears on the board.** It
overrides parts of §1.

The board is a `<canvas>`, not SVG. What works is `Path2D`, which takes SVG
path data:

```js
const EGG = new Path2D('M10 3 C13 3 15 6 15 9 ...');
ctx.fillStyle = '#f4e8cf';
ctx.fill(EGG);
```

So a board asset must reduce to a short list of path strings, each with one
flat colour.

| Requirement | Why |
| -- | -- |
| **`viewBox="0 0 20 20"`**, centred, filling it | One cell |
| **Flat fills only:** no gradients, filters, blend modes | `Path2D` carries shape only. Fill is set in code |
| **One `<path>` per colour,** with a plain `fill="#rrggbb"` | Each fill is one draw call |
| **Under 12 paths,** fewer is better | Each is drawn every step |
| **No `<use>`, `<defs>`, `<mask>`, `<clipPath>`, `<text>`, `<image>`** | None survive into `Path2D` |
| **Strokes converted to fills** | Canvas strokes differently |
| Absolute path commands preferred | Easier to adjust by hand |

- **Delete any path that doesn't change what you see at 20px.** Fine detail
  muddies the silhouette. The first mouse had ten paths and read better
  with five.
- **Check against the snake, not just the background.** The snake is bone
  and fills much of the board. The first egg used the snake's exact bone
  and vanished into its body.

### The head is bigger than a cell

The hood is 26 units wide and the tongue reaches 18 units ahead, so the head
can't fit in 20 × 20. Author it in the 20px box, **normalised by 1/1.8 about
`(10,10)`**. At draw time it's scaled back: `translate(cx, cy)`, rotate,
`scale(1.8)`, `translate(-10, -10)`. Drawing it as a plain 20px sprite
shrinks it, which is wrong.

### The snake is parts, not a picture

- **The head** faces right, pivoting on the cell's centre. It rotates, its
  eyes blink (crosses on defeat), its tongue flicks (and stays out while
  queasy), its hood flares, and it shudders after something rotten. Supply
  named paths: `head`, `hood`, `eye-left`, `eye-right`, `tongue`,
  `markings`. Anything fused into the outline can't animate.
- **The body** darkens and shrinks towards the tail in code. Supply one body
  block and one tail tip, one flat fill each. Baked-in shading fights the
  code.
- **One body segment wears the belt,** recoloured by rank, so the body block
  must be a single shape.

## 7a. Pixel art for the board: tried, lost

The full set is on the branch `assets/pixel-sprites`. Vector won on 9
September. The real problem was 20px cells; at 30px, vector read fine. Pixel
art also needs whole-number scaling, which a board that shrinks to fit
can't promise.

## 8. What's been commissioned

Nothing is open.

| Asset | Status |
| -- | -- |
| Cobra crest for the title | Shipped v0.3.1 |
| Board sprites: egg, rotten egg, mouse, head, body | Shipped v0.3.1 as vector. Sources on `asset-review/board-sprites` |
| Dojo crests and 18px badges | Shipped v0.5.0. Sources and prompts in draft PR #6 |
| Character portraits | Dropped 18 September. Spec on `mock/character-select` |

The dojo crests are the reference for any new pixel art. Keep these rules
for any redraw:

- **The egg and rotten egg rhyme:** same silhouette family. The rotten one
  is tipped over and cracked, a non-colour signal.
- **The mouse can't be mistaken for either egg** at cell size.
- **The dojo crests differ by silhouette,** in monochrome. The 18px badges
  are drawn natively at that size, since the crests shrunk were illegible.

## 9. How to deliver

**Push a branch. Never `main`.**

- Name the branch after the Linear issue in the request, `unr-N-short-slug`,
  from `main`. Linear closes the issue when the PR from that branch merges.
- One commit to start. Review rounds add commits. No force-pushing.
- Add files under `design/<what-it-is>/` only. Don't touch `index.html`,
  `test.js` or anything else: integration is done separately.
- Open a **draft** PR and stop. No version bump, tag or merge.

Integration always needs decisions the art can't make alone.

Send back:

1. Inline: the optimised `.svg`. Pixel art: the lossless PNG master.
2. A PNG preview at display size. For board art, another at 20 × 20px.
3. A short `README.md` beside the files listing anything in this brief you
   couldn't meet, and why. It has caught real problems twice: the head scale
   conflict, and a blurred cloud that couldn't be path data.
