# Design

The working archive: the specs the game is held to, the tooling used to judge
how it looks, and the options that were considered and not chosen. Nothing in
here ships. `index.html` never loads any of it.

Losing options are kept on purpose. A decision is easier to trust, and cheaper
to revisit, when the alternative is still there to look at.

## Specs — current, and kept true

| | |
| --- | --- |
| [`ASSET-BRIEF.md`](ASSET-BRIEF.md) | What any commissioned artwork has to satisfy: format, palette, geometry, delivery |
| [`MICROCOPY.md`](MICROCOPY.md) | The game's voice, and the rules that keep every line in it |

## Tooling

| | |
| --- | --- |
| [`demo/`](demo/) | An autopilot that plays the game by itself, and how to build a side-by-side comparison |
| [`sound-options.html`](sound-options.html) | Three candidates for each sound effect, and a button that plays your picks as a run. The ones in the game are marked. Audition changes here before making them in `index.html` |
| [`share/card.html`](share/card.html) | Renders `og-image.png` and `apple-touch-icon.png` from the game itself. Rebuild them here when the board or crest changes |

## Decision records

Each folder holds the options compared and says which one shipped and why.

| | |
| --- | --- |
| [`title-crest/`](title-crest/) | The wordmark: two colourways of the cobra crest |
| [`favicon/`](favicon/) | Three candidates for the tab icon |
| [`font-options.html`](font-options.html) | The brush typefaces considered for the first wordmark. Historical: the game has used no display face since v0.3.1 |

Two sets of artwork live on branches rather than in this folder:

- `asset-review/board-sprites` — the delivered source files for the board
  artwork that shipped, with previews at cell size. The paths themselves are
  inlined in `index.html`
- `assets/pixel-sprites` — the complete pixel-art alternative that lost to
  vector. See `ASSET-BRIEF.md` §7a
