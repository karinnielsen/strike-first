# Board sprites — Claude review handoff

For [UNR-119](https://linear.app/unrulylabs/issue/UNR-119/drawn-board-sprites-egg-rotten-egg-mouse-snake).

Prepared against `design/ASSET-BRIEF.md` blob `bba34f3121434b6d547b89054cad97560bbb2465`, at main commit `58852969ebc30f525aff10788cbfc219ba7225c9`.

## Review status

Karin selected four design families: good egg, rotten egg **A / implemented green**, the latest slimmer-faced mouse, and the cobra with its approved head and latest rear-only tail taper. Those selections were made before the new flat-fill canvas requirements.

This directory contains **canvas-format adaptations for review**, not a claim that the flatter appearance has already been approved. The game has not been edited or integrated. No release version or tag has been created. Claude should review the assets and integration constraints before acceptance; do not merge automatically or close UNR-119 on the strength of this handoff alone.

## What changed to meet the updated spec

| Family | Selected study failed new spec because | Prepared adaptation |
| --- | --- | --- |
| Good egg | CSS pulse and a wrapper group | Same two filled shapes, no CSS or group. Keep pulse in game code. |
| Rotten egg A | Gradient, filter, opacity, group rotation and animated vapor | Same rotated shell and crack geometry, baked transform, four flat layers. Green base stays `#a8c341`. Runtime vapor remains separate. |
| Mouse | Gradients, strokes, ellipses, animation, more than 11 graphical elements | Ten filled paths. Shapes merged into visual layers; strokes outlined, ellipses converted to paths. Selected slim face, ears, nose and body preserved. Glints removed; shading simplified. |
| Snake | Gradients, strokes, 40px viewBox, DOM animation, missing standalone body | Named head/hood/eyes/pupils/tongue/markings, alternate eye states, single-fill body and tail. All sources now use 20px viewBoxes. |

**Visual trade-off:** smooth radial shading is replaced with a small number of flat colour regions. A soft blurred vapor cloud cannot be preserved by filter-free opaque path artwork alone. Retain the runtime vapor implementation for initial integration; `rotten-vapor.svg` is an optional contour for a later canvas effect, not an exact reproduction of the approved blurred study.

## Files and draw calls

| Asset | Paths | Use |
| --- | ---: | --- |
| `egg.svg` | 2 | Baseline reward |
| `rotten-egg.svg` | 4 | Hazard shell; vapor is runtime code |
| `mouse.svg` | 10 | Mouse reward; nose is separately named |
| `snake-head.svg` | 11 | Ordinary head, including optional tongue |
| `snake-eyes-blink.svg` | 2 | Replaces open-eye paths while blinking |
| `snake-eyes-defeated.svg` | 2 | Replaces open-eye paths on defeat |
| `snake-body.svg` | 1 | Single recolourable block |
| `snake-tail.svg` | 1 | Selected rear-only tip taper |
| `rotten-vapor.svg` | 1 | Optional runtime effect contour |

Each SVG is under 10KB, has only named `<path>` children with opaque `#rrggbb` fills, and contains no dependencies, gradients, filters, strokes, masks, text, raster, transforms, or animation. `paths.json` duplicates the path data mechanically, in paint order, for direct `Path2D` integration. Do not draw alternate eye states on top of open eyes.

Do not batch paths solely by fill colour: paint order and runtime part visibility matter. Separate eyes/tongue can share a fill while remaining separate animation parts, as required by section 7.

## Coordinate and animation contracts

### Egg and mouse

Pivot is `(10,10)`. Preserve the existing egg scale `1 + Math.sin(now / 200) * 0.10`. Existing shell bounds stay 10.2 × 12.8px. Mouse can mirror about x=10 to respect `visitor.facing`; optional nose twitch is an inward translation of at most 0.22px horizontally and 0.16px vertically, not object movement. Retain visitor lifetime, warning flashing, points and growth from the game.

### Rotten egg

Tilt is baked into its paths at the selected −0.5 radians about `(10,11)`; **do not rotate it again**. The shell uses the selected envelope; the 20px viewBox does not mean enlarge the shell to fill the cell. Original shell base is `#a8c341`; original vapor colour is `#b2d65c` (`rgba(178,214,92,alpha)`). The dark fracture remains a non-colour cue. Flat shadow/highlight tones are intentional approximations of the selected shading.

### Snake head — important scale contract

The original game’s hood is 26px wide and its tongue reaches 18px ahead of the head centre including its round cap. They never fitted inside a 20px cell. Karin explicitly asked to preserve their dimensions and tongue geometry.

To deliver all paths inside `viewBox="0 0 20 20"` without changing those runtime dimensions, head and alternate eye paths are normalized by **1/1.8 around pivot `(10,10)`**. When using these paths, apply `translate(cx,cy)`, direction rotation, `scale(1.8,1.8)`, then `translate(-10,-10)`. This restores the approved 14 × 14px head, 15 × 26px hood, hood offset and tongue extents. Do not render the head as an unscaled 20px sprite. `snake-head-runtime-36px.png` demonstrates the intended 36px source frame; `snake-head-20px.png` is the required source-size preview.

This is a documented coordinate adapter, not a proposed head enlargement. All head parts are separate and rotate/shudder together. Review this contract before integration because a naive 20px rendering shrinks the head.

Prefer keeping the existing `drawTongue` unchanged: 2px red stroke, 6px shaft, 3px fork with ±2.5px endpoints, 280ms every 2600ms while playing, held out for a treat directly ahead or while queasy. If keeping it, omit the supplied tongue path and draw the native tongue in unscaled gameplay coordinates. The supplied filled outline is an alternative, not an additional tongue.

Preserve existing blinking, defeat crosses, queasy shudder/reduced-motion handling, condition tinting and paint order. Blink/defeat paths align to the new eye centres. Hide iris and pupil paths for the selected state; retain the eye surrounds if desired. These state changes must remain under the game’s runtime control.

### Body and tail — spacing is unchanged

Body is normalized to a full 20px square, with corner radius one third of its size. At runtime preserve:

```js
const t = i / (snake.length - 1);
const size = (CELL - 2) - t * 7;
const inset = (CELL - size) / 2;
```

Draw the body with scale `size/20` inside its existing centred cell. Continue to derive colour from `bodyColour(t, queasiness())` or the belt’s runtime colour. Neither shape contains shading that would fight those values.

Tail already has 11 × 11px bounds at x/y `4.5–15.5`; **draw at scale 1, not `11/20`**. Its whole body-facing semicircle is identical to the previous radius-5.5 circle; only the rear changes. Rotate it using the vector from the last segment to the penultimate segment, not the head’s current direction. Source assumes the penultimate segment is to the right. Grid centres remain 20px apart. Visible gaps grow as segments shrink, exactly as in the current implementation; do not introduce equal edge gaps.

## Validation performed

- Structural checks: 9 SVGs, 34 total paths; every file under 12 paths and under 10KB.
- Geometry parsed and bounds checked: all source paths within 0–20; no path transforms left to interpret.
- Native Canvas `Path2D`: every path parsed and all nine assets rendered at 20px using `@napi-rs/canvas`.
- Actual-size visual inspection and deuteranopia approximation: `review-sheet.png`. The mouse remains distinct from both eggs; crack/tilt distinguishes the rotten egg without green. Tiny facial detail is not relied on for gameplay.
- Source palette and body geometry checked against pinned `index.html`.
- Unmodified baseline game tests: **85 passed, 0 failed**. This establishes the base, not integrated-sprite behaviour.
- `validation.json` records exact path counts, byte sizes and bounds. `verify.cjs` repeats structural/manifest checks and optional native Path2D rendering.

The deuteranopia preview uses a full-severity matrix in linear RGB as an approximation; it is a visual check, not a claim of universal accessibility. The dim tail should retain its existing gameplay colour treatment. Keep rank labels/non-colour rank cues in the game.

## Remaining acceptance gates for Claude

1. Accept the flat appearance versus the selected shaded studies, especially the mouse and vapor trade-off.
2. Integrate using cached Path2D instances, keeping `update()` and `draw()` separate. Paste data into the single HTML file; do not fetch these SVGs at runtime.
3. Check all four snake directions, corners at the tail, blinking, defeat, tongue triggers, queasy shudder, reduced motion and every belt.
4. Check 20px native rendering and mobile scaling against the board, and compare actual draw cost. Path counts are bounded but integrated frame time has not been measured.
5. Run `node test.js` after integration and play with real input. Existing tests cannot prove the visual/runtime integration by themselves.
6. Only after review/acceptance, merge and release using the project’s normal version/changelog/tag procedure.

## Spec exceptions / interpretation

- Existing mouse browns/pink and original rotten green, selected by Karin, are outside the short CSS token table; they are present in gameplay code and were expressly retained. Intermediate flat shading colours approximate the selected studies. No zombie-green alternative is included.
- Existing snake overhang is preserved through the 1.8 coordinate adapter above. The SVG source complies with 20px bounds; the rendered hood/tongue retain their pre-existing overhang rather than being forcibly shrunk into one cell.
- Motion is supplied as an integration contract, not SVG animation. Smooth blur/gradient appearance has **not** been claimed compliant or silently retained.
