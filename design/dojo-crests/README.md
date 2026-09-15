# Dojo crests — UNR-114

Three dojos: Cobra Kai, Miyagi-Do and Eagle Fang Karate. Part of UNR-114.
Based on main at `a62210b3a10497c000556b2352fd47fc4f36663f`, with palette checked against its `index.html`.

## Files and intended use

| Dojo | Select screen SVG | Leaderboard SVG | Full / small source bytes |
| --- | --- | --- | --- |
| Cobra Kai | `cobrakai.svg` | `cobrakai-small.svg` | 2,203 / 752 |
| Miyagi-Do | `miyagido.svg` | `miyagido-small.svg` | 1,870 / 606 |
| Eagle Fang Karate | `eaglefang.svg` | `eaglefang-small.svg` | 2,121 / 734 |

Each `*-200.png` proves the full crest at 200 × 200px. Each `*-24.png` proves the corresponding small SVG at 24 × 24px. All PNG proofs have an opaque `#09090b` background. SVGs have transparent outer backgrounds and near-black internal knockouts; use them on `#09090b`.

Use the small SVG beside player initials. Do not shrink the framed crest to 24px: the framing and internal details consume too much of the silhouette. Both versions use a `0 0 200 200` viewBox; CSS sets the displayed size.

## Reference and drawing decisions

Worked from the three SVG attachments on UNR-114:

- Cobra Kai: `0bcfcf9f-1fdb-4fca-9548-10b535e6a3a1` — front-facing flared hood, raised throat, coiled base, fangs and forked tongue retained. Sharp eyes and precise throat bars give it a colder character.
- Miyagi-Do: `2223e611-4140-4bd8-a913-d887c8d2b1bc` — sun disc, broad layered bonsai foliage, twisting trunk and rooted base retained. Rounded foliage and open space keep it calm.
- Eagle Fang: `c513f248-7c0c-4278-af06-91302a48f959` — front-facing eagle, angry eyes, open beak and exaggerated fangs retained. Irregular angular feather edges give it the roughest silhouette.

The supplied sources are respectively 40,400, 106,730 and 243,155 bytes, with dense traced contours. The delivered drawings rebuild the reference motifs with a small set of editable paths; none of those traced path strings is reused. No raster tracing was performed.

Full crests share the same double circular frame, scale, bone fill and flat treatment. The internal silhouettes differ; leaderboard marks remove the shared framing to expose that distinction immediately. Lettering is omitted as encouraged by brief §4; dojo names belong in the select screen's existing UI typography. There is no live text or font dependency in the SVGs.

## Palette and exceptions

**No new hues and no size-budget exceptions.** Only `#ece6da` (existing body-text bone) and `#09090b` (existing background) are used. Bone remains neutral foreground across all three, rather than becoming a dojo-specific colour. Yellow, red, brand red and belt colours are not reassigned.

The templates' yellow/red Cobra Kai, orange/green/brown Miyagi-Do and coloured Eagle Fang treatments are intentionally translated into monochrome to meet the palette requirement. Tiny lettering, feather barbs and leaf texture are intentionally omitted to meet the path-count and readability requirements. The sun becomes an outlined disc so the bone tree remains separate without another hue.

All hard format, size, palette and delivery requirements are met. Fidelity is a simplified interpretation of the supplied emblems, not a reproduction of every contour or letter; visual approval remains with the reviewer.

## Validation

- Parsed all six SVGs: viewBox present, no fixed root width/height, no external references, bitmaps, scripts, live text or fonts.
- Checked all IDs for required prefix and uniqueness across all six SVGs, including full/small combinations.
- Full crests: 11 / 7 / 10 paths for Cobra Kai / Miyagi-Do / Eagle Fang, plus simple frame circles. Small marks: 4 / 2 / 3 paths.
- Rendered and visually inspected each supplied proof at its actual 200px or 24px size.
- Inspected a full-severity deuteranopia matrix simulation at both sizes. All identifying geometry is already monochrome and does not depend on red/green separation.
- Bone/background contrast is approximately 16:1; no information depends on a low-contrast accent.

Only asset sources, six PNG proofs and this note are delivered. No preview wrapper, runtime changes, version bump, tag or merge.
