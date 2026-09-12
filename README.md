# Strike First

A browser Snake game with a karate-dojo theme. One HTML file, no build step,
no dependencies, nothing to install — open it and play.

Current version: **v0.3.1** — see [CHANGELOG.md](CHANGELOG.md).

## Play

Open `index.html` in any browser.

- **Arrow keys** or **WASD** to move
- **Space** to pause — the game calls it mercy
- **R** to restart

The board is 21×21 squares, drawn at 30px a square. The grid is the game; the
cell size is only how large it is drawn.

## What's in it

### Three foods, three roles

Never more than two things on the board at once — the egg, plus at most one
visitor. That keeps every decision binary, which is the most anyone can answer
at seventy milliseconds a move.

| | Worth | Costs you | Sticks around |
| --- | --- | --- | --- |
| **Egg** | 1 | 1 length | always exactly one, never expires |
| **Mouse** | 5 | **2 length** | 60 of your moves |
| **Rotten egg** | **−3** | leaves you queasy for 14 moves | 45 of your moves |

Roughly two eggs in five bring a visitor along, and about two in five of those
are rotten. Visitors flash when they are about to leave.

The mouse costing two squares rather than one is the point of it. A reward that
is strictly better with no cost isn't a decision — you take it every time and
nothing about how you play changes. Five points for two squares is a real
question late in a run.

A mouse is always **reachable when it spawns**, so missing one is a decision
that went wrong rather than bad luck.

A rotten egg deliberately costs you no length. Taking length *off* would be a
relief late in a run, which is the opposite of a punishment.

### Levels, and belts

These are different things and they live in different places.

- A **level** is difficulty within a run. Nine tiers, from an unhurried 260ms a
  move down to a 70ms floor, shown in the header. It resets when you die.
- A **belt** is a rank you hold across runs, shown on the snake as a single
  band and named in the header. It comes from your **best score ever**, so you
  are promoted only by beating your own record by enough to cross a threshold.

Seven ranks, following the real Tang Soo Do ladder: white, orange, green,
brown, red, Cho Dan Bo blue, then **midnight blue** rather than black — black
symbolises an end, and the idea is that learning never stops.

Promotion can land mid-run, while you are still trying not to die. It is rare
by design and it is the best moment the game has.

### Score feedback

A small `+1` for an egg, a big electric-yellow `+5` for a mouse. The size
difference is the message: you see the value before you read it. Losses are
red, and red means nothing else.

## Tuning

All the balance lives in named constants near the top of the script. Change
those rather than scattering numbers through the code.

| Constant | What it does |
| --- | --- |
| `LEVELS` | the nine speed tiers, as `{ from: score, ms: delay }` |
| `EGG_POINTS` / `MOUSE_POINTS` / `ROTTEN_POINTS` | what each food is worth |
| `EGG_GROWTH` / `MOUSE_GROWTH` | how much length each one costs you |
| `VISITOR_CHANCE` | odds that an egg brings a visitor along |
| `ROTTEN_SHARE` | how many of those visitors are rotten |
| `MOUSE_LIFE` / `ROTTEN_LIFE` | how many of *your moves* each one stays for |
| `WARNING_MOVES` | moves left when a visitor starts flashing |
| `REACH_BUDGET` | how far a visitor may spawn, as a fraction of its life |
| `QUEASY_MOVES` | how long the snake looks ill after a rotten egg |
| `BELTS` | the seven ranks and the best-score each one needs |

Everything that could have been a timer counts **your moves** instead. Seconds
would make a mouse trivial at high speed and brutal at low speed; counting
moves keeps "can I reach it?" the same question all game, and stops anything
expiring while the game is paused.

## Next

See the [project roadmap](https://linear.app/unrulylabs/project/strike-first-3ec05fe538aa)
for what's coming and in what order. It moves faster than this file.

## Tests

```bash
node test.js
```

No framework and no dependencies, same as the game. The harness reads
`index.html`, pulls the inline script out and runs it against a stubbed
browser, so the game stays a single file with nothing to install.

91 tests, covering the grid, the speed curve, collisions, growth, scoring, the
visitor countdown and the input rules. They cannot tell you whether the game is
*fun* — that still needs playing.

Needs Node 15 or newer.

## Versioning

The version lives in three places and they move together:

1. the `VERSION` constant at the top of the script in `index.html`,
   which renders in the footer
2. a new entry in `CHANGELOG.md`
3. an annotated git tag, e.g. `git tag -a v0.3.1 -m "..."`

Read the numbers in game terms:

- **major** — the game plays differently enough to be a new thing
- **minor** — a new mechanic or mode
- **patch** — balance tuning, art, copy, bug fixes

**Artwork is a patch, however much of it there is.** v0.3.1 replaced the
wordmark with a drawn crest, moved the whole palette and made the board
artwork legible, and it was still a patch, because nothing played differently
afterwards. The test is what the player has to do, not how much changed.

## Files

- `index.html` — the entire game, heavily commented
- `test.js` — the test harness and the tests
- `design/ASSET-BRIEF.md` — what a commissioned asset has to satisfy
- `design/MICROCOPY.md` — the game's voice, and the rules that keep it honest
- `design/demo/` — an autopilot that plays the game by itself, for looking at
  it without being distracted by playing, and notes on building a side-by-side
- `design/title-crest/` — the crest that shipped, and the colourway that didn't
- `design/font-options.html` — side-by-side of the brush typefaces considered
  for the wordmark
