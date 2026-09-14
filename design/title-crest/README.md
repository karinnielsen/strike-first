# Title crest

The wordmark: a cobra rising through the words *Strike First*, with the lettering
outlined into the artwork. It is the one loud voice in the game, and since v0.3.1
it is a drawing rather than a typeface. Tracked as UNR-86.

Two colourways were delivered and reviewed side by side:

| File | Lettering | Result |
| --- | --- | --- |
| `strike-first-red.svg` | solid brand red, `#ee3524` | **Shipped** in v0.3.1, inlined in `index.html` |
| `strike-first-gradient.svg` | the old fire gradient, `#ee3524 → #f4761c → #f7c948` | Not chosen |

The PNGs beside each are proofs at the intended display size, 400 × 144px on the
game's background.

Solid red won from a side-by-side. The gradient's letters shade down into
orange-yellow, which put them in the same colour family as the cobra sitting
between the words and cost the lockup its separation. Red keeps the split clean:
red is the wordmark, yellow is the snake.

## Where it breaks the asset brief, and why

Recorded because each was a deliberate decision rather than an oversight.

- **Size.** Each SVG is about 47KB, against the brief's 20KB ceiling. The
  supplied cobra alone was 94KB and was simplified for this composition while
  keeping its individual scales. Hitting the budget would have meant a different,
  plainer cobra, and the cobra is the point.
- **Path count.** The cobra has 190 paths, well past the brief's preference for a
  small hand-editable set. It is vector geometry with outlined text, not an
  embedded bitmap, so it still inlines and still scales.
- **Palette.** The cobra keeps electric yellow, black, white and red from its
  reference. That yellow went on to become the game's one system yellow in the
  same release, so the crest set the palette rather than breaking it.
- **Originality.** An earlier version of the brief asked for an original crest.
  That was superseded by the project's decision to stay close to the series,
  which is recorded in the Linear project.

## Integration notes

- It is a DOM element, not a canvas sprite, so it is ordinary inline SVG.
- The SVG titles itself "Strike First - cobra crest", which is right for the
  file on its own and wrong as the name of the page. So the artwork is hidden
  from the accessibility tree and the `h1` carries the name.
- The space below it is load-bearing: the floating `+N` over the score rises
  into it. See the gotchas in `CLAUDE.md` before changing the header.
