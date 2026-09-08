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

**The repository is private.** A URL to it will not resolve for an external
tool, and neither will a raw file link. Paste the contents of this spec directly
into whatever is doing the drawing; the paths above are for a person or an agent
that already has the repo checked out.

If you need to confirm a colour or a dimension rather than trusting this
document, `index.html` is the source of truth — this spec is a copy and can go
stale.

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

## 7. Per-asset requirements

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

## 8. Deliverables

1. The optimised `.svg` — ids prefixed, text outlined, no external references
2. A PNG preview at intended display size; for board assets, a second at 20 × 20px
3. A note listing anything in this spec that was broken, and why
