# Strike First

A browser Snake game with a karate-dojo theme. One HTML file, no build step,
no dependencies, nothing to install — open it and play.

Current version: **v0.3.1** — see [CHANGELOG.md](CHANGELOG.md).

## Play

Open `index.html` in any browser.

- **Arrow keys** or **WASD** to move
- **Space** to pause
- **R** to restart

## What's in it

- **Apples** — 1 point. There's always exactly one on the board.
- **Mice** — 5 points. Appear after roughly two apples in five, and scurry off
  if you take too long. They flash when they're about to bolt.
- **Floating score feedback** — a small `+1` for an apple, a big electric-yellow `+5` for a
  mouse. The size difference is the point: you see the value before you read it.
- The snake speeds up as your score climbs, and your best score is remembered.

## Tuning

All the balance lives in a handful of named constants near the top of the
script. They're the first thing to change if it feels too easy or too mean.

| Constant | What it does |
| --- | --- |
| `START_DELAY` | Level-1 speed, in ms per move. Higher is gentler. |
| `SPEED_UP` | ms shaved off per food eaten |
| `FASTEST` | the speed cap, however high you score |
| `APPLE_POINTS` / `MOUSE_POINTS` | what each food is worth |
| `MOUSE_CHANCE` | odds that an apple flushes out a mouse |
| `MOUSE_LIFE` | how many of *your moves* a mouse sticks around for |
| `MOUSE_WARNING` | moves left when it starts flashing |

`MOUSE_LIFE` counts moves rather than seconds deliberately. Seconds would make
mice trivially easy at high speed and brutal at low speed; counting moves keeps
"can I reach it?" the same question all game, and stops a mouse escaping while
the game is paused.

Current values are tuned generous for playtesting — the longest possible trip
across the board is 40 moves, and a mouse gives you 65.

## Next

- Belt ranks (white through black) driven by score, with the snake's colour
  showing your current rank
- "No Mercy" as a mode you unlock by rank
- Sound

## Tests

```bash
node test.js
```

No framework and no dependencies, same as the game. The harness reads
`index.html`, pulls the inline script out and runs it against a stubbed
browser, so the game stays a single file with nothing to install.

Covers the grid, the speed curve, collisions, growth, scoring, the mouse
countdown and the input rules. One test deliberately documents a known
defect rather than a correct behaviour, and says so.

## Versioning

The version lives in three places and they move together:

1. the `VERSION` constant at the top of the script in `index.html`,
   which renders in the footer
2. a new entry in `CHANGELOG.md`
3. a git tag, e.g. `git tag -a v0.1.0 -m "..."`

Read the numbers as: **major** when the game plays differently enough to be a
new thing, **minor** for a new mechanic or mode, **patch** for balance tuning,
art and fixes.

## Files

- `index.html` — the entire game, heavily commented
- `design/font-options.html` — side-by-side of the brush typefaces considered
  for the wordmark
