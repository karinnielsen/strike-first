# UNR-129: crest tongue flick — Claude review

Issue: https://linear.app/unrulylabs/issue/UNR-129/crest-tongue-flick

Review assets and motion before integrating with game events. This branch adds
artwork and a preview only; it does not change the live game or its version.

## Files

- `strike-first-tongue-poses.svg`: six named groups, flat fills, no dependencies.
- `strike-first-tongue-preview.html`: standalone browser preview with the full
  crest at 400px, a 250ms flick, and 4x slower replay. Open locally in a browser.
  Its embedded artwork is a preview snapshot; the SVG above is the asset source.

## Coordinate and layering contract

Source: `design/title-crest/strike-first-red.svg`, blob
`ead5a5ba5cf271bba31066ff64284ddd5b3e930d`.

The root viewBox is `0 0 1000 360`. Each new group carries the original cobra
transform `translate(326 0) scale(.278)`. Append groups at the root SVG level.
If inserting inside `#sf-red-crest-cobra`, strip the new group transforms to
avoid double scaling. Every pose has the same 20-unit-wide root at y=298,
x=628..648, in cobra coordinates.

Keep `throat-closed` permanently visible beneath the active tongue. All five
tongue groups start with `display="none"`. Set exactly one to `inline` per pose;
set all to `none` for the retracted state. Do not crossfade: it produces ghost forks.

The preview removes these seven original paths from the cobra group, matching
by full path data from the verified source, before inserting the new groups.
For integration, verify these prefixes and their full paths; do not depend on
child indices, which can change when comments or metadata are inserted:

| Source path begins | Meaning |
| --- | --- |
| `m 632,299` | Original tongue |
| `m 650.4,298.4` | Separate original red sliver |
| `m 541,393` | Lowest affected throat row |
| `m 743,344` | Middle row, right half |
| `m 536,344` | Middle row, left half |
| `m 750,291` | Upper row, right half |
| `m 530,290` | Upper row, left half |

Removing the superseded yellow paths avoids antialiased remnants around the
black backing. The replacement group includes black backing and three joined
yellow rows. Leave all other cobra paths and the lettering unchanged.

## Timing and event handoff

Normal-speed sequence (start time in milliseconds):

| Time | Pose |
| --- | --- |
| 0 | tongue-1 |
| 20 | tongue-2 |
| 45 | tongue-3 |
| 70 | tongue-4 |
| 100 | tongue-5 |
| 135 | tongue-4 |
| 165 | tongue-3 |
| 195 | tongue-2 |
| 225 | tongue-1 |
| 250 | hidden |

The preview uses elapsed time and requestAnimationFrame, cancels the old
animation on retrigger, and resets to closed when the tab becomes hidden.
Comments sit beside the timing and replay logic. Preview autoplay runs once;
it is not a proposed idle loop. Choose the actual game-event triggers with
Karin; no trigger actions were specified yet. Respect reduced motion in the
production implementation. Avoid tying this cosmetic timing to game moves.

## Review points and deliberate tradeoffs

- The tongue stem is 20 units wide; fork tips taper below 20 intentionally.
  A literal minimum everywhere makes the forks blunt. At 250px crest width the
  stem is only about 1.4px, so judge at both 250px and 400px, not just zoomed in.
- These are stylized front-view poses based on the requested motion sequence,
  not a biomechanical validation. Check whether the upward sweep reads as a
  tongue rather than a moustache, especially during slow replay.
- The affected throat rows are reconstructed with continuous central contours;
  they are not exact copies of the original split shapes. Review the row
  spacing and the closed mouth before accepting the repair.
- The preview's 4x slow option is for inspection, not production timing.
- Validate against the current in-game crest before wiring in the asset. The
  preview uses the source design file, not an edited copy of game `index.html`.

## Validation performed

SVG structure checked: exactly six group IDs, original viewBox and transform,
only paths/groups, permitted flat fills, no strokes, filters, masks, clipping,
text, or raster images. Inspected rendered pose crops during artwork creation.
Both preview replay speeds were exercised with a simulated animation clock:
correct pose at each boundary and all tongues hidden at completion. This is
not an end-to-end test of game integration or a browser visual sign-off.

When shipping the integration, follow `CLAUDE.md` for README, changelog,
version and tag updates. Those release changes do not belong in this asset-only
review handoff.
