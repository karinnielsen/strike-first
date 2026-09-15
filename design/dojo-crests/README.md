# Approved square dojo artwork — review handoff

Part of UNR-114. This revision supersedes the rejected simplified SVG crests and their proofs. Those files have been removed from the current PR.

## Approved visual direction

- `cobrakai-square.png`: original-style detailed cobra and coil; all lettering, slogan band and enclosing rings removed.
- `miyagido-square.png`: detailed bonsai and sun only; no lettering.
- `eaglefang-square.png`: detailed front-facing eagle head only; no banner or lettering.

These are the exact three generated square PNGs approved in the conversation, supplied unchanged for Claude to review. Preserve the recognisable original artwork, organic detail and text-free compositions. Do not use the earlier geometric redraws.

## Palette intent

Near-black #09090b background; electric yellow #ffff00; game red #d3262f; bone #ece6da; muted grey #7b7480. Cobra uses yellow/red, Miyagi-Do uses a red sun with bone foliage and grey trunk, Eagle Fang uses bone/yellow/red. Reuse of yellow and red inside dojo artwork was explicitly raised before the user accepted this direction. Generated PNGs have antialiasing and colour variation; exact palette compliance is not yet verified.

## Production work outstanding

These are raster visual references, NOT production SVG sources. They do not meet the original editable-SVG/no-bitmap contract or its under-20KB source budget. Do not embed them in an SVG and call that vector delivery.

Before integration: establish a faithful editable-vector treatment, enforce the exact palette, balance perceived size and padding, and check 200px plus 24px use. Separate optical reductions may still be needed at 24px. Square canvases do not by themselves guarantee safe circular cropping. No actual-size or accessibility approval is claimed for this revision.

Pixel-art alternatives are being explored separately; they are not the approved replacement in this PR.

Only design/dojo-crests/ changes. No game edits, version bump, tag or merge. This update adds one replacement commit to the existing PR, preserving history rather than force-pushing.
