# Design

Specs, tooling and decision records. Nothing here ships: `index.html` never
loads any of it. Options that lost are kept, so a decision can be checked
against the real alternative.

| | |
| --- | --- |
| [`ASSET-BRIEF.md`](ASSET-BRIEF.md) | What commissioned artwork must meet. Hand it to the drawing tool |
| [`MICROCOPY.md`](MICROCOPY.md) | The game's voice, locked vocabulary, and every string |
| [`demo/`](demo/) | An autopilot that plays the game, for looking without playing |
| [`sound-review.html`](sound-review.html) | Every effect as it ships, with the music underneath |
| [`sound-options.html`](sound-options.html) | Candidates for each effect. Audition changes here first |
| [`share/card.html`](share/card.html) | Renders `og-image.png` and `apple-touch-icon.png`. Rebuild when the board or crest changes |
| [`title-crest/`](title-crest/) | The wordmark's colourways and tongue poses |
| [`favicon/`](favicon/) | Tab icon candidates. Open `compare.html` from a local server |
| [`star-link/`](star-link/) | The title's GitHub star: plain link against a button |
| [`font-options.html`](font-options.html) | Typefaces for the first wordmark. Historical |

On branches: `asset-review/board-sprites` (sources for the board art that
shipped) and `assets/pixel-sprites` (the pixel-art set that lost, see
`ASSET-BRIEF.md` §7a).

## Title crest

A cobra rising through *Strike First*, lettering outlined into the art.
Shipped in v0.3.1 as `strike-first-red.svg`, inlined in `index.html`.

- **Red won over the gradient,** side by side. The gradient shaded the
  letters into the cobra's orange-yellow, and the lockup lost its
  separation. Red is the wordmark, yellow is the snake.
- **It breaks the asset brief on purpose:** about 47KB and 190 paths. A
  plainer cobra would have fitted, and the cobra is the point.
- **It's hidden from the accessibility tree.** The `h1` carries the name.
- **The space below it is load-bearing.** See the gotchas in `CLAUDE.md`.

### Tongue flick

Shipped in v0.4.1. Whenever a run isn't live, the crest flicks its tongue,
singly or in pairs, every 1.8 to 6.5 seconds. Timing is in `TONGUE_POSES`.

- The poses are in `strike-first-tongue-poses.svg`, inlined as
  `sf-red-crest-throat` and `sf-red-crest-tongue-1` to `-5`. The throat is
  always visible. Show one tongue at a time, **never crossfade** (it leaves
  ghost forks).
- Each group carries the cobra's transform, `translate(326 0) scale(.278)`.
  Inside `#sf-red-crest-cobra`, drop it or it scales twice.
- The poses replaced seven original paths, starting `m 632,299`,
  `m 650.4,298.4`, `m 541,393`, `m 743,344`, `m 536,344`, `m 750,291` and
  `m 530,290`. Match by path data, never by child index.
- The stem is about 1.4px at a 250px crest. Judge at 250px and 400px.

## Favicon

`/favicon.svg` is the crest's cobra cropped to the hood (C in
`compare.html`). It beat the board's head sprite (A) and the whole cobra (B)
as the only one that reads at 16px. `compare.html` points at the live file,
so it can't drift.

## Music

One track, `assets/music.m4a`: *Iron Resolve*, a 48-second loop from Astra,
mixed from its stems without drums or lead. It plays on the start menu, dojo
select and rankings. It's silent on the title before start, and during a run,
mercy and the verdict. Music is off until the sound button asks for it.

`MUSIC_TRACKS` keeps separate names for the menus and rankings, so a second
track is a one-line change. A prompt, if the rankings want their own:

> Instrumental 1980s synthwave, slow, around 85 BPM, E minor. Sparse: pad,
> slow arpeggio, soft bass, minimal percussion. Reflective, like reading a
> scoreboard after the fight. Seamless loop, 45 seconds, no vocals.

- **No music from the series or its games,** and no vocals.
- **Deliver the highest-quality export** and don't pre-encode it. It gets
  trimmed to a loop and encoded as AAC, mono, about 80kbps, under 500KB.

## Demo tooling

`demo/autopilot.js` plays Practice by itself with real key events. It
chases the mouse, else the egg, and avoids the rotten egg. Practice posts
no scores. Build a copy:

```bash
python3 - <<'PY'
auto = open('design/demo/autopilot.js').read()
h = open('index.html').read()
open('/tmp/demo.html','w').write(h.replace('</script>', auto + '\n</script>', 1))
PY
python3 -m http.server 8791 --directory /tmp
```

Then open <http://localhost:8791/demo.html>. To compare versions, make one
copy per branch and put them in iframes side by side. **Never scale them
to fit,** judge at actual size, and change one thing at a time.

To freeze the board and inspect one thing, set `phase = 'ready'`, place
things, and call `draw()`:

```js
phase = 'ready';
snake = [{x:3,y:14},{x:2,y:14},{x:1,y:14}];
direction = {x:1, y:0};
egg = {x:4, y:7};
visitor = {kind:'rotten', x:9, y:7, life:999, facing:1};
document.getElementById('overlay').classList.add('hidden');
draw();
```

`demo/build-trailer.js` builds a copy that records a run, which is how the
README's gif was made. `trailer.js`'s header says how.
