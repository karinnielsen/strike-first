# Strike First

Snake, as a dojo. Eat eggs, chase mice, dodge rotten ones and earn your belt.

**[Play it in your browser →](https://karinnielsen.github.io/strike-first/)**

[![The Strike First cobra crest beside a game board, with a snake wearing an orange belt, a mouse and an egg](og-image.png)](https://karinnielsen.github.io/strike-first/)

One HTML file, no build step, no dependencies, and it fetches nothing — open it
and play. Made for desktop and tablet.

Current version: **v0.4.3** — see [CHANGELOG.md](CHANGELOG.md).

## Play

- **Arrow keys** or **WASD** to move
- **Space** to pause — the game calls it mercy
- **R** to restart
- **M** to turn sound off or on

On a tablet or any touch screen:

- **Swipe on the board** to turn. The turn happens as your finger moves, and
  right-then-up in one unbroken stroke rounds a corner
- **The ❚❚ button** under the crest for mercy — or at the foot of the scores,
  when they sit beside the board
- Tap the button on the board to start, continue or go again, and **sound on**
  under it to mute

The board is 21×21 squares, drawn at 30px a square. The grid is the game; the
cell size is only how large it is drawn.

The whole board fits on screen on an iPad in either orientation and in
ordinary laptop and desktop windows. In a tall window the crest, scores and
board stack. In a short or landscape one — a landscape iPad, a laptop, a
1080p browser — the crest sits on top and the scores become a list beside the
board. When there isn't room for the board at full size, the crest shrinks
first and then the board, but never below 20px a square.

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
difference is the message: you see the value before you read it. A loss is
red and always carries its minus sign, so it never relies on colour alone.

### Defeat

About a second on the board before the verdict. The moment of impact holds
still so you can see the mistake, the snake is knocked back off whatever it
hit, the colour drains out of it from the tail up, and it bows its head. Then
a line in the dojo's voice, picked for how you died: the wall, your own tail,
scoring nothing, a new hi-score, or falling a few points short of your
hi-score or the next belt. The same line never comes up twice in a row.

Space, **R** or a tap skips it once the first moment has passed, so the key you
were hammering when you died does not restart the game by accident. Reduced
motion keeps the flash and the drain, and nothing moves.

### Sound

80s/90s arcade sound, generated in the page from square and pulse waves rather
than shipped as audio files. A blip for an egg, a squeak and a ding for a
mouse, a burp for a rotten egg, a quick run of chords for a promotion, and a
long fall for defeat. A promotion replaces the sound of the food that earned
it. Nothing plays until you start a game.

Turn it off with **M**, or with the **sound on** button on the start, mercy
and defeat screens. The game remembers the choice.

### The crest

Between runs the cobra in the crest flicks its tongue, the way a real snake
smells the air: in pairs, at uneven pauses. It holds still while you play, so
the only thing moving above the board is something worth looking at. Reduced
motion turns it off.

## Next

Each is a milestone, and each ships as a version.

- **Make it sing** — sound and motion, built once the layout has settled
- **Dojo recruitment** — a challenge link that carries your score and belt
- **Choose your fighter** — pick a dojo, then a character
- **Forbidden techniques** — secrets, and modes you earn rather than pick
- **The All Valley** — a tournament: accounts, and a leaderboard that outlives
  one browser

## How it's made

Strike First is a first game, started on 7 September 2026 to learn how games
are actually built — loops, state, input, timing, balance — and built with
[Claude Code](https://claude.com/claude-code). The process is part of the
work, so it is all in the repo:

- **The commit history** says why each change was made, not only what changed,
  including the one that was reverted
- **[`CLAUDE.md`](CLAUDE.md)** holds the working agreements and the design
  principles the game is held to — among them, *a reward only matters if it
  can be refused*
- **[`design/`](design/)** keeps the specs, the tooling used to judge how it
  looks, and the options that lost, beside notes on why they lost

### Tuning

All the balance lives in named constants in section 2 of the script. Change
those rather than scattering numbers through the code.

| Constant | What it does |
| --- | --- |
| `LEVELS` | the nine speed tiers, as `{ from: score, ms: delay }` |
| `BELTS` | the seven ranks and the best score each one needs |
| `EGG_POINTS` / `MOUSE_POINTS` / `ROTTEN_POINTS` | what each food is worth |
| `EGG_GROWTH` / `MOUSE_GROWTH` | how much length each one costs you |
| `VISITOR_CHANCE` | odds that an egg brings a visitor along |
| `ROTTEN_SHARE` | how many of those visitors are rotten |
| `MOUSE_LIFE` / `ROTTEN_LIFE` | how many of *your moves* each one stays for |
| `WARNING_MOVES` | moves left when a visitor starts flashing |
| `REACH_BUDGET` | how far a visitor may spawn, as a fraction of its life |
| `QUEASY_MOVES` | how long the snake looks ill after a rotten egg |

Everything that could have been a timer counts **your moves** instead. Seconds
would make a mouse trivial at high speed and brutal at low speed; counting
moves keeps "can I reach it?" the same question all game, and stops anything
expiring while the game is paused.

### Tests

```bash
node test.js
```

No framework and no dependencies, same as the game. The harness reads
`index.html`, pulls the inline script out and runs it against a stubbed
browser, so the game stays a single file with nothing to install.

97 tests, covering the grid, the speed curve, collisions, growth, scoring, the
visitor countdown and the input rules for keys and swipes. They cannot tell you
whether the game is *fun* — that still needs playing.

Needs Node 15 or newer.

### Running it locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8765
```

### Versioning

The version lives in four places and they move together:

1. the `VERSION` constant at the top of the script in `index.html`,
   which renders in the footer
2. a new entry in `CHANGELOG.md`
3. the **Current version** line at the top of this file
4. an annotated git tag, e.g. `git tag -a v0.3.1 -m "..."`

A test fails if the first three disagree.

Read the numbers in game terms:

- **major** — the game plays differently enough to be a new thing
- **minor** — a new mechanic or mode
- **patch** — balance tuning, art, copy, bug fixes

**Artwork is a patch, however much of it there is.** v0.3.1 replaced the
wordmark with a drawn crest, moved the whole palette and made the board
artwork legible, and it was still a patch, because nothing played differently
afterwards. The test is what the player has to do, not how much changed.

### Files

- `index.html` — the entire game, in nine commented sections
- `favicon.svg`, `apple-touch-icon.png`, `og-image.png` — the tab icon, the
  home-screen icon and the link preview. Not part of the game: it plays
  without them. The PNGs are rendered from the game by
  `design/share/card.html`, so rebuild them there when the board or crest
  changes
- `test.js` — the test harness and the tests
- `CHANGELOG.md` — every version, and what changed for the player
- `CLAUDE.md` — how to work on the project
- `design/` — specs, tooling and decision records; see its
  [README](design/README.md)

## Credits and licence

An unofficial, non-commercial fan homage to *The Karate Kid* and *Cobra Kai*.
It is not affiliated with or endorsed by their owners, and those names and
characters belong to them.

The code is released under the [MIT licence](LICENSE).
