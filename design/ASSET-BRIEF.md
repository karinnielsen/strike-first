# Asset spec — Strike First

Functional requirements for any visual asset destined for this game. Design
direction is given separately, per asset. This document covers only what makes
an asset *usable*: format, palette, geometry and delivery.

Everything here is a hard requirement unless it says otherwise. The unusual one
is the format: the game is a **single self-contained HTML file**, so an asset
that cannot be inlined into it is unusable regardless of how it looks.

---

## 0. Where everything lives

Repository: `karinnielsen/strike-first` on GitHub, default branch `main`.

| What | Path |
| -- | -- |
| This spec | `design/ASSET-BRIEF.md` |
| The game — all of it | `index.html` |
| Colour palette | `index.html`, the `:root` block at the top of `<style>` |
| Wordmark and fire gradient | `index.html`, the `h1` rules below it |
| Board geometry — `CELL`, `COLS`, `ROWS` | `index.html`, top of the `<script>` |
| Balance constants | `index.html`, same block |
| How to work on the project | `CLAUDE.md` |
| Version history | `CHANGELOG.md` |
| Roadmap, design principles, open questions | The Linear project, linked from `CLAUDE.md` |

**The repository is private,** so a link to it resolves only for someone who has
been granted access. If the tool doing the drawing has repo access, work from
the files directly. If it does not, paste the contents of this spec in instead —
a raw file URL will not load for it.

If you can read the repo, `index.html` is the source of truth for any colour or
dimension. This spec is a copy of those values and can go stale.

---

## 1. Output format

**SVG, as editable source.** Not a PNG, not a rasterised trace, not a PNG
wrapped in an SVG.

Each asset is pasted directly into `index.html` as inline `<svg>` markup. There
is no build step and no asset pipeline. Therefore:

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

## 2. Size budget

**Under 20KB of SVG source per asset, target under 10KB.** The entire game is
currently ~37KB.

## 3. Colour

Use the existing palette. Values are the CSS custom properties in `index.html`.

| Token | Hex | Role |
| -- | -- | -- |
| `--bg` | `#09090b` | Page background |
| `--panel` | `#131316` | The board |
| `--line` | `#2a2a30` | Grid lines, borders |
| `--text` | `#ece6da` | Body text |
| `--dim` | `#7b7480` | Secondary text |
| `--gold` | `#e8b53a` | Rank, reward |
| `--red` | `#d3262f` | Gameplay red |
| `--brand` | `#ee3524` | The wordmark only |
| `--bone` | `#e8e2d6` | The snake |

The wordmark uses a fire gradient — the one place more than two colours appear
together. An asset locked up with the wordmark may use it; nothing else should.

```
linear-gradient(180deg, #ee3524 16%, #f4761c 55%, #f7c948 93%)
```

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

One typeface appears in the game: **Permanent Marker**, used for the wordmark
and nothing else. Everything else is system monospace.

Assets should avoid lettering. Where lettering is unavoidable it must be
outlined paths, per section 1.

## 5. Geometry

| Thing | Size |
| -- | -- |
| Play area | 420 × 420 px |
| Grid | 21 × 21 cells |
| One cell | 20 × 20 px |
| Wordmark | 68px, skewed −11°, small caps |

**Board assets must read at 20 × 20 px.** At that size only silhouette and one
strong colour break survive. Verify at actual size, not zoomed.

**Page assets** — anything outside the 420 × 420 board — have room for detail.

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

**Read this before drawing anything that appears inside the 420 x 420 play
area.** It overrides parts of section 1.

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
| **`viewBox="0 0 20 20"`**, artwork centred, drawn to fill it | One grid cell is exactly 20 x 20 px |
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

The snake's hood is 26px wide and its tongue reaches 18px ahead of the head
centre. They have never fitted inside one cell and they are not going to.

So head artwork is authored in a 20px box and **normalised by 1/1.8 about the
pivot `(10,10)`**, then scaled back up at draw time: `translate(cx, cy)`,
rotate for direction, `scale(1.8, 1.8)`, `translate(-10, -10)`. That restores
a 14 x 14px head with a 15 x 26px hood.

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

## 7a. EXPERIMENT: pixel art for the board

**Status: being tried, 8 September. Not yet decided.** If this wins it replaces
section 7 entirely for board assets. Section 7 still governs page assets like
the crest either way.

### Why

The game is a 1984 reference and the board is a 21 x 21 grid of 20px cells.
Vector artwork was integrated and, even scaled up, the rewards still did not
read at cell size — the detail that makes the artwork good is exactly what
twenty pixels cannot hold. Pixel art is the discipline invented for that
constraint rather than one fighting it.

The vector attempt is preserved on the branch `assets/vector-sprites` so the
two can be compared rather than remembered.

### Resolution — the decision everything else follows from

**Author at 10 x 10. It is rendered at 2x into the 20px cell.**

One art pixel becomes a 2 x 2 block on screen. This is the whole point: at
20 x 20 with one art pixel per screen pixel it is not pixel art, it is a small
picture with the same legibility problem we already have. Chunky pixels are
what make it read, and they are what the era actually looked like.

Ten by ten is not much room. That is the constraint doing its job — it forces
silhouette and one or two internal details, which is all that ever survived
anyway.

### Format — it still has to inline

The game is one self-contained HTML file with no build step and no asset
pipeline, so **PNG sprite sheets are unusable**. Deliver each sprite as a
palette and a grid of characters:

```js
egg: {
  palette: { '.': null, 's': '#f4e8cf', 'r': '#c9a227', 'h': '#ffffff' },
  rows: [
    '...rr...',
    '..rssr..',
    '.rshssr.',
    ...
  ]
}
```

* `.` is transparent, always
* One character per colour, chosen to hint at what it is
* Rows are equal length, and there are as many rows as columns
* This diffs cleanly in git, is readable by a human, is editable by hand, and
  is smaller than any image

### Colour

**Four to six colours per sprite, including transparent.** Pixel art reads by
restraint; a gradient dithered across ten shades at this size is mud.

The palette in section 3 still applies, and so does the rule about raising a
new hue — with one clarification learned the hard way: **also raise an existing
palette colour being used for a new meaning.** Gold means rank and reward here,
so gold used for something else is a change worth flagging even though the hex
is already in the file.

### What each sprite needs

| Sprite | Notes |
| --- | --- |
| Egg | Must not read as a snake segment. The snake is bone and is most of what moves; contrast against the background is necessary and not sufficient |
| Rotten egg | **The largest thing on the board.** Keeps a non-colour cue — the tilt and the crack — so it reads as wrong without relying on green |
| Mouse | Must not be confusable with either egg. Faces the way it travels; it is mirrored in code, so draw it facing right only |
| Snake head | See below |
| Snake body | One block, single colour, recoloured at runtime. One segment wears the belt |
| Snake tail | The pointed tip. Rotated in code to trail the body |

### The snake head

**Rotation is free here.** The head only ever faces four directions, and a 90°
rotation of a pixel grid is lossless — so draw it **facing right only** and the
code will turn it. Four separate sprites are not needed.

The head still needs to arrive as **separable parts**, for the same reasons as
before: the eyes blink, become crosses on defeat, and the tongue flicks and
holds out while queasy. Deliver `head`, `hood`, `eyes-open`, `eyes-blink`,
`eyes-defeated`, `tongue`, `markings` as separate grids sharing one coordinate
space.

The hood may exceed the cell. It always has — it is 26px wide today, and a
cobra that fits neatly inside its own square does not look like a cobra. Say
what box you have drawn it in and the code will scale to match.

### Motion

The head shudders after a rotten egg. **That shudder will be quantised to whole
art pixels** rather than moving smoothly, because sub-pixel movement destroys a
pixel grid. Nothing to do about it in the artwork; noted so the movement is not
a surprise.

## 8. Per-asset requirements

Design direction is supplied separately. These are the functional targets.

### Cobra crest for the title lockup — UNR-86

* Locks up with the wordmark; may use the fire gradient
* Drawn at roughly 300–400px wide, must survive scaling down
* Page asset, not a board asset

### Dojo crests — UNR-114

* A set of 2–4, constructed as a family: same weight, same treatment
* Roughly 200 × 200px each
* **Must be distinguishable in monochrome**, by silhouette and shape. Colour may
  reinforce the difference but cannot be the only carrier of it — see §3

### Character portraits — UNR-115

* Undated and least defined; requirements above apply, specifics to follow

### Board sprites — egg, rotten egg, mouse, snake head, snake body

* **Section 7 applies to all of these** — they are canvas assets, not DOM SVG
* `viewBox="0 0 20 20"`, flat fills, one path per colour
* The egg and the rotten egg should **rhyme**: same silhouette family, so the
  rotten one reads as a bad version of a thing you know rather than a new
  object. The current rotten egg is tipped over and cracked, which is what
  tells you it is wrong before the colour does — keep a non-colour signal
* The mouse must not be confusable with either egg at 20px
* The snake head and body: see "The snake is not a picture" above

## 9. How to deliver

Same every time, so a request can be one line rather than a page.

**Push a branch. Never main.**

* Branch name `assets/<what-it-is>`, e.g. `assets/pixel-sprites`
* **One commit.** No force-pushing, no rewriting history
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

1. The optimised `.svg` — ids prefixed, text outlined, no external references
2. A PNG preview at intended display size; for board assets, a second at 20 × 20px
3. A note listing anything in this spec that was broken, and why
