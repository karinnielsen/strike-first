# UNR-86 — permanent title crest

Two reviewed options for the permanent header above the gameplay canvas:

- `strike-first-red.svg`: solid brand-red #ee3524 lettering.
- `strike-first-gradient.svg`: existing fire-gradient lettering (#ee3524 → #f4761c → #f7c948).

Both use the approved original Permanent Marker lettering and supplied cobra. The rejected script-font experiment is not included. Both have the latest spacing: the entire First word moves from x=591 to x=556 in the 1000×360 viewBox. Cobra, Strike and letter geometry are unchanged. PNG proofs are rendered at the intended 400×144px size on #09090b.

## Claude handoff

Choose one variant with Karin and inline it as the page title artwork. This is a DOM SVG page asset, not a canvas sprite. Keep it permanently in normal document flow above the scores and game canvas. Start with width:min(100%,400px), height:auto; this yields 400×144px, or 300×108px at narrower widths. Preserve aspect ratio.

Replace the existing title visually and preserve an accessible page heading. The SVGs contain their own accessible title; avoid duplicate spoken names when wrapping in an h1. IDs are separately prefixed per variant so they can safely coexist in a review page. All lettering is outlined and needs no font download. Background is transparent.

**Clearance is load-bearing:** retain the existing 68px bottom clearance initially, then measure against the floating +N score animation's 24px rise. Verify on mobile and desktop. Never overlap the live board or its controls. Keep the crest static; it is complete without motion. No gameplay integration is included in this commit.

## Spec exceptions / decisions before shipping

- Each SVG is approximately 47KB, above the brief's 20KB maximum. The detailed supplied cobra alone was originally 94KB. Its source was simplified for this composition, while preserving individual scales. Further reduction needs visual review; do not replace the cobra with a different drawing to hit the budget.
- The supplied cobra retains electric yellow #ffff00, black, white and red. These are the explicitly selected reference colours, outside parts of the game palette. Wordmark colours match the current game.
- The reused cobra has 190 paths from the earlier vector source, exceeding the preference for a small hand-editable path set. Text is outlined. This is vector geometry, not an embedded bitmap.
- The ticket's older originality constraint should be reconciled with Karin's later explicit direction to use this supplied cobra and the Cobra Kai reference. Do not silently redraw the approved art.

## Validation

Parsed both SVGs; confirmed identical path geometry and transforms between variants, unique IDs across the pair, no raster/live text/scripts/external references, and viewBox without fixed root dimensions. Visually inspected the gradient and red at 400px width. No changes outside this directory, no version bump, no integration or merge.
