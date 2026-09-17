# Strike First

Snake, as a dojo. Eat eggs, chase mice, dodge rotten ones and earn your belt.

**[Play it in your browser →](https://karinnielsen.github.io/strike-first/)**

[![The Strike First cobra crest beside a game board, with a snake wearing an orange belt, a mouse and an egg](og-image.png)](https://karinnielsen.github.io/strike-first/)

One HTML file of code, no build step and nothing to install — open it and play.
Beside it sit a few images: the dojo crests and the sharing preview. Its one
outside connection is a hosted database for scores. Made for desktop and tablet.

Current version: **v0.5.5** — see [CHANGELOG.md](CHANGELOG.md).

## Play

- **Arrow keys** or **WASD** to move
- **Space** or **Esc** to pause — the game calls it mercy. Continuing bows
  you back in, so you have a moment to find the snake again
- **R** for a rematch, once you have lost. There is no restart mid-run: the way
  out of a run is mercy, then **Quit**
- **M** to turn sound off or on, on any screen — the title included, where it
  mutes without starting the game
- **B** between runs for the All Valley Rankings

Every menu works the same way: **↑ ↓**, **W S** or **Tab** to move, **Enter**
or **Space** to choose, or point and click.

In the top-right corner of every screen, for mouse or finger: the **speaker**
turns sound off or on, and **❚❚** calls mercy during a run.

On a tablet or any touch screen:

- **Swipe on the board** to turn. The turn happens as your finger moves, and
  right-then-up in one unbroken stroke rounds a corner
- **The ❚❚ button** in the top-right corner for mercy, beside the speaker for
  sound
- Tap a menu row to choose it

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

### The title screen

The game opens the way an arcade cabinet does: the crest, large and alone,
a blinking **Press start**, and along the foot, who made it and *free play*.
Any key, click or tap presses start, and does nothing else, so Space here
never also starts a run. A touch screen is told to tap rather than press a
key. It shows every time the page loads. With reduced motion it holds still
instead of blinking.

Pressing start puts the menu in its place, under the crest:

- **Arcade** is the real game, and the only one whose runs count: choose your
  dojo, then fight
- **Practice** goes straight into a run and keeps nothing — no rankings, no
  hi-score, no belt
- **Rankings** opens the All Valley Rankings without playing

Arcade is lit every time the menu opens. The lit row blinks its marker, and
with reduced motion it holds still.

### Dojo select

Every Arcade run counts for a dojo, so choosing Arcade opens the select:
**Cobra Kai**, **Miyagi-Do** or **Eagle Fang**, each a card with its crest. It
is an arcade select screen, so there are 30 seconds on the clock, and when it
runs out the lit dojo is chosen for you. The first time, the highlight starts on a
random dojo, so no dojo is everyone's default; after that it starts on yours.

- **← →** or **Tab** to choose, **Enter** or **Space** to bow in
- **↑ ↓** to flip a card. The back shows where the dojo stands, its team score,
  its students, its top student and its sensei. On a touch screen, tap a card
  to choose it and tap its turned-down corner to flip it

Choosing lands like a kick, and the dojo's creed comes up with its name, and
the fight begins. The select opens every time you choose Arcade — choosing your
side is part of the ritual — but a **Rematch** skips it.

Once you have a dojo, you wear its crest in the header, beside your belt.

### The bow

Every run opens with a bow, the way every lost one closes with one. The snake
dips its head, draws back, and its first step is a strike. Half a second, and
the snake does not move until it is over, so it never eats into your reaction
time. Press a direction during it and that is your first move, straight away.

Continuing from mercy bows too, because the board has been covered and you
need a moment to find the snake. The bow is the same length at every level,
since the faster the game, the more you need it. A direction cuts it short
here as well, but never to less than one step. With reduced motion the head
holds still for the same half second instead of bowing.

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

Under the verdict is a menu that sits in the same place on every defeat:
**Rematch**, **Rankings** and **Main menu**. After a Practice run it is
**Practice**, **Arcade** and **Main menu** instead — the title's own menu — with no signing and no board.

**Quit** from mercy is a forfeit, and it counts. The heading reads
**FORFEIT**, and everything else goes as it would after a defeat. A run
quit with nothing scored has nothing to record, and goes straight back to
the title.

After a new hi-score in Arcade, the defeat screen asks you to **sign the
board** with three letters, the way an arcade cabinet did. The first time
they read **AAA**, after that last time's initials, so signing again is
Enter or a single tap on **Sign**, and typing over them starts afresh. The
next empty slot blinks yellow. There is no skip, as there never was on a
cabinet. **Sign** with fewer than three letters buzzes. A short list of rude
initials is refused, in the page and in the database, with a note under the
letters. On a tablet, tap the letters to bring up the keyboard. Signing saves
the run to a shared leaderboard. If the save fails, the menu comes up anyway,
and the board shows without your row.

The database only takes runs the game could have produced. A run's score,
length, moves and time are tied together by the rules, so a score typed in
by hand is refused, while every run actually played is accepted, however
good. Scores are also rate limited, so nobody can flood the board. A run
pumped up in the page itself is **DISQUALIFIED** instead of defeated, the
way a referee calls *shil kyuk*: the bout does not count, the score goes to
nothing and the hi-score it set is taken back.

### The board

The defeat screen shows the leaderboard whenever there is nothing to sign, and
once you have signed. It is a podium: the top three, then the run
above yours, yours in yellow, and the run below. If you are fifth or higher it
is just the top five. Each row is the place, the initials, the dojo's pixel
badge, the belt and the score. Your run is the one you just signed, or your last signed run
if this one wasn't a hi-score.

Every score counts for you and for your dojo. A run counts for the dojo you
were in when you signed it, even if you change later.

When the board is drawn small, the runs either side of yours are left out
rather than squeezing the rest. If the leaderboard can't be reached, there is
no board, and nothing else waits for it.

### All Valley Rankings

The whole board, on a screen of its own. Open it from the title's menu or the defeat
screen's, or with **B** — never during a run, and not while you are signing. **Esc**, **B** or **back** returns you to where you were.

It is the top ten, then a gap and your run with the ones either side of it if
you are further down. The columns are named along the top — rank, name,
dojo, belt, score — and the top three places are picked out in bone.

Choose **All**, **Cobra Kai**, **Miyagi-Do** or **Eagle Fang** along the top
with **← →** or **Tab**, or by tapping. Filtered to a dojo, the places count
within that dojo, so its best run is 1st, and the dojo's crest sits above the
list. Each dojo's team score is on the back of its card in dojo select. On All each row carries its dojo's badge; filtered, the badge is left off,
because every row would repeat it.

It scrolls like a page, so on a tablet a swipe scrolls the rankings and never
steers a snake behind them.

### Sound

80s/90s arcade sound, generated in the page from square and pulse waves rather
than shipped as audio files. A blip for an egg, a squeak and a ding for a
mouse, a burp for a rotten egg, a quick run of chords for a promotion, a
long fall for defeat, and a blip and a chord as you move through a menu and
choose. A promotion replaces the sound of the food that earned
it. Nothing plays until you press start.

Turn it off with **M**, or with the speaker in the top-right corner of every
screen. The game remembers the choice.

### The crest

Between runs the cobra in the crest flicks its tongue, the way a real snake
smells the air: in pairs, at uneven pauses. It holds still while you play, so
the only thing moving above the board is something worth looking at. Reduced
motion turns it off.

## Next

Each is a milestone, and each ships as a version.

- **Dojo recruitment** — a challenge link that points at your place on the board
- **Choose your fighter** — pick a character
- **Forbidden techniques** — secrets, and modes you earn rather than pick
- **Sekai Taikai** — the world stage: accounts behind the initials, and one day
  multiplayer

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

No framework and nothing to install, same as the game. The harness reads
`index.html`, pulls the inline script out and runs it against a stubbed
browser, so the game stays a single file with nothing to install.

201 tests, covering the grid, the speed curve, collisions, growth, scoring, the
visitor countdown, the input rules for keys and swipes, how a run becomes a
score record, and the initials entry, including a check that the page and
the database refuse the same initials and hold the same limits on a run.
A bot plays the game's own loop, including the luckiest run the rules allow,
to check that no real run is ever refused. None of them touch the network. They cannot tell you
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
- **minor** — a new mechanic or mode, or a new step in the player's journey:
  a screen they pass through, or a choice every player makes
- **patch** — balance tuning, art, copy and bug fixes within the screens that
  already exist

**Artwork is a patch, however much of it there is.** v0.3.1 replaced the
wordmark with a drawn crest, moved the whole palette and made the board
artwork legible, and it was still a patch, because it added no step to the
journey and nothing played differently afterwards.

### Files

- `index.html` — the entire game, in ten commented sections
- `db/scores.sql` — the scores table and the rules that stop the page's public
  key doing anything but submitting and reading scores, and refusing runs no
  game could produce. The record of what the
  database looks like: change it here, then run the change in Supabase
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
