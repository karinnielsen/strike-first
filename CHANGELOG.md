# Changelog

All notable changes to Strike First are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For a game, read the version parts as:

- **major** — the game plays differently enough to be a new thing
- **minor** — a new mechanic or mode
- **patch** — balance tuning, art, copy, bug fixes

Artwork is a patch, however much of it there is. The test is what the player
has to *do*, not how much changed. Settled 12 September, when v0.3.1 shipped a
new wordmark, a new palette and legible board artwork and was still a patch.

## [Unreleased]

## [0.5.0] — 2026-09-16

The All Valley: pick a dojo, sign the board, and every score counts for your
dojo as well as for you. A new thing to do, so it is a minor. The milestone's
last two pieces, scores you can trust and the full board, follow as patches,
since neither changes what the player does.

### Added
- **A title screen.** The game opens the way an arcade cabinet does: the crest
  large and alone, a blinking *Press start* in the wordmark's offset lettering,
  and along the foot, *@pushinpixls 2026* and *free play*. Any key, click or
  tap presses start and does nothing else. A touch screen is told to tap.
  Chosen from mocks over keeping the crest above the select screens.
- **Dojo select.** The first time you press start you choose Cobra Kai,
  Miyagi-Do or Eagle Fang, on an arcade select screen with 30 seconds on the
  clock; when it runs out, the lit dojo is chosen for you. Each card carries
  its crest, drawn by Astra, and flips to show where the dojo stands, its
  team score, students, top student and founding sensei. The pick lands like
  a kick with the dojo's creed under its name. The choice is remembered, and
  the start screen offers to change it.
- **Sign the board.** After a new hi-score the defeat screen asks for three
  initials, arcade style. Last time's come back filled in, a short list of
  rude ones is refused in the page and in the database, and signing saves the
  run to a shared leaderboard under your dojo.
- **The board on the defeat screen.** A podium - the top three, then the runs
  either side of yours - with each dojo's pixel badge, and under it the dojos,
  each scored as its best three players. When drawn small it comes down to
  your neighbourhood and your dojo's standing.
- **Scores that outlive the browser.** Runs are stored in a hosted database.
  The page's public key can only add a score and read them back.

### Changed
- The game is no longer one file on its own: beside it sit the three dojo
  crests, as 320px WebP, fetched only when the select might be shown.

## [0.4.6] — 2026-09-15

Reduced motion now covers the whole game. Nothing plays differently, and no
one without the setting sees a change, so it is a patch.

### Changed
- **Score feedback under reduced motion.** The `+N` fades in and out where it
  appears instead of rising and growing, keeping its size, colour and sign.
  The score counter turns briefly yellow instead of swelling. Chosen over
  keeping the swell, side by side.
- **The egg holds still** under reduced motion. Its pulse was decoration.

With these, everything that moves either stops or calms when the setting is
on: arrival, the opening bow, the defeat, the queasy shiver, the tongue
flicks, the promotion ring, the button pulse, and now the score and the egg.
The snake's own movement stays, because it is the game.

## [0.4.5] — 2026-09-14

The game arrives now, instead of simply being there. Nothing plays
differently, so it is a patch.

### Added
- **Arrival.** Once per session, on page load: the crest settles and flicks
  its tongue, the mat's grid lights outward from the spawn, and the snake
  slides in from the left wall one cell at a time, then the egg and the menu.
  1.4 seconds. It ends on the start screen exactly as it is without one, and
  any key, click or tap jumps there first and then does what it would have
  done anyway. Reduced motion skips it. Chosen from four candidates side by
  side, kept on `options/arrival`.

## [0.4.4] — 2026-09-14

Every run is a bout now, bowed into as well as out of. Nothing plays
differently, so it is a patch.

### Added
- **An opening bow.** Every run opens with a bow, the way every lost one
  closes with one: the snake dips its head, draws back, and its first step
  snaps forward as a strike. Half a second. The snake does not move until it
  is over, so it never costs reaction time, and a direction pressed during it
  cuts it short and is taken as the first move at once. Reduced motion skips
  it. Chosen from four candidates side by side, kept on `options/start-bow`.

## [0.4.3] — 2026-09-14

Losing gets a moment. The snake's last mistake plays out on the board before
the verdict, and the verdict knows how close you came. Nothing plays
differently, so it is a patch.

### Added
- **A defeat sequence.** About a second on the board before the verdict: the
  impact holds still, yellow sparks fly from the point of contact, the snake
  is knocked back, drains to ash from the tail up and bows. Space, R or a tap
  skips it after the first 300ms. Reduced motion keeps the flash and the
  drain without the movement.
- **Near-miss defeat lines.** Ending within three points of your hi-score, or
  of the next belt on a new hi-score, says so and by how much.
- **More defeat lines,** thirty-seven in all, with nods to the series.

### Changed
- **The same defeat line never appears twice in a row.**
- **The overlay's button stands apart** from the title and line above it,
  on every screen, so the verdict and the call to action read as two things.
- "A record and a corpse" is now "A hi-score and a corpse", because the dojo
  does not say record.

## [0.4.2] — 2026-09-14

The game makes noise. Arcade sound effects for everything that happens in a
run, and a way to turn them off that is remembered. Nothing plays
differently, so it is a patch.

### Added
- **Sound effects** in an 80s/90s arcade register, generated in the page from
  square and pulse waves and noise, so the game is still one file: a blip for
  an egg, a squeak and ding for a mouse, a burp for a rotten egg, arpeggiated
  chords for a promotion (in place of the food's sound, never over it) and a
  two-octave fall for defeat. Nothing plays until a game has been started.
  The candidates they were picked from are in `design/sound-options.html`.
- **Mute.** Press M, or use the sound on / sound off button under the
  overlay's main button, which is also how a tablet mutes: mercy brings the
  overlay up mid-run. The choice is remembered.

### Changed
- **The keyboard hint wraps between controls,** never inside one. In the
  side-by-side layout it used to split "r" from "= restart".

## [0.4.1] — 2026-09-14

The crest comes alive. Between runs the cobra flicks its tongue, the way a
real snake smells the air. Nothing plays differently, so it is a patch.

### Added
- **The crest cobra flicks its tongue** on the start, mercy and defeat
  screens: mostly in pairs, at uneven pauses. It holds still for the whole
  run, so nothing moves above the board while you play. Reduced motion turns
  it off.

### Changed
- **The crest's mouth is closed at rest.** The tongue was always out; now it
  only shows during a flick, drawn as five poses with a redrawn throat. The
  artwork and its notes are in `design/title-crest/`.

## [0.4.0] — 2026-09-14

Plays anywhere. The game has a link: open it in a browser on a desktop or a
tablet and play, with nothing to download or send around. This ships the
milestone that touch controls, the fitted layout and the link preview in
v0.3.2 were building towards. The game itself plays exactly as it did.

### Added
- **A playable link** at <https://karinnielsen.github.io/strike-first/>. The
  link preview, tab icon and home-screen icon from v0.3.2 now have somewhere
  to point.
- **An MIT licence** for the code, and a note that this is an unofficial,
  non-commercial fan homage.

### Changed
- **The repository is public.** The README now opens with the link and a
  picture of the game, lists what is coming next, and says where the process
  lives: the commit history, `CLAUDE.md` and `design/`.

## [0.3.2] — 2026-09-14

It plays on a tablet, and the whole board fits on the screen you have.
Nothing about the game changes — same board, same rules, new ways to reach
it.

### Added
- **Touch controls, so it plays on a tablet.** Swipe on the board to steer;
  the turn lands while your finger is still moving, and one stroke can round
  a corner. A mercy button sits under the crest, never on the board. Swipes
  obey exactly the same rules as keys. Touch screens get instructions that
  say swipe rather than naming keys they don't have.
- **A tab icon.** The cobra's hood from the crest, cropped close so it still
  reads as a hood at sixteen pixels. Also the home-screen icon on a tablet.
- **A link preview.** Pasting the link somewhere shows the crest and a line
  saying what it is beside a board in play, with a real title and
  description, rather than a bare URL.
  It points at the published address, so it shows up once the game is live.

### Changed
- **The whole board fits on short and landscape screens.** Stacked, the page
  is 971px tall, so a landscape iPad, a laptop window or a 1080p browser cut
  off the bottom of the board. When it doesn't fit, the crest sits centred on
  top, the board below it on the left and the stats as a list beside it. The
  crest shrinks first, then the board, never below 20px cells. Chosen by the
  space available, not the device.

### Fixed
- **Pages that fit no longer scroll on iPad Safari.** It centred against a
  height that included the hidden toolbar.
- **The board has a visible edge again**, and the start overlay no longer
  darkens it away.

## [0.3.1] — 2026-09-12

The game gets its face. A drawn cobra crest where the typed wordmark was,
and one yellow doing the work two were doing before. Nothing plays
differently — this is all art.

### Added
- **Drawn artwork on the board.** The egg, the rotten egg, the mouse and the
  cobra's head are commissioned illustration rather than shapes hand-coded into
  canvas, and the snake finishes in a pointed tail that trails the body.
- **The board is drawn half as large again** — 30px cells instead of 20px, on
  the same 21×21 grid. Nothing about the game changes: same distances, same
  speed curve, same difficulty. At 20px the artwork simply could not be read.
- **The primary button looks like a button on a cabinet.** A solid slab edge
  under it, no blur, borrowing the language the wordmark already uses; it
  travels down onto that shadow when you press it, the way a real key does; and
  a slow warm bloom calls you back to it. Bold, because the overlay title above
  it is bold and a lighter button read as the lesser of the two — which is
  backwards for the one thing the screen is asking you to do.
- The button finally has a **visible focus ring**. Keyboard users were getting
  whatever the browser decided.
- **The cobra crest.** The wordmark is a drawn lockup now — the hood above and
  through the words, the lettering outlined into the artwork rather than set in
  a display face. It is the first thing on the page and it says what the game
  is before you have read a word.

### Changed
- **Electric yellow is the system yellow.** The dojo has one colour instead of
  two: the yellow on the cobra is the same yellow as the primary button, the
  overlay title and the `+5`. The old gold was a generic arcade gold sitting
  next to a very specific one, and carrying two yellows where only one meant
  anything was one too many. Rank is untouched — a belt has always worn its
  own colour, and none of the seven is yellow.

### Removed
- **The last thing this page fetched.** The display face existed for exactly
  one line of CSS, the title, and the crest's lettering is drawn — so the
  webfont and its three `<link>` tags are gone with it. The game now requests
  nothing at all: "one self-contained HTML file, no dependencies" is literally
  true rather than nearly true.

## [0.3.0] — 2026-09-08

Earn your belt. Score becomes a rank you hold rather than a number you lose,
the snake wears it, and beating your own record is now a moment that happens
while you are still playing.

### Added
- **Belts.** A rank you hold across runs, derived from your best score ever
  rather than the run you are in. You are promoted only by beating your own
  record, and only by beating it by enough to cross a threshold — so a small
  personal best doesn't promote you and a breakthrough does. Seven ranks
  following the real Tang Soo Do ladder: white, orange, green, brown, red,
  Cho Dan Bo, midnight blue. Red sits near the top, which inverts what most
  people expect, and the last belt is midnight blue rather than black because
  black symbolises an end.
- The snake **wears its belt** as a single coloured band one segment behind the
  head. A belt is literally a band around a body, so it needs no explaining,
  and it leaves the rest of the snake free to show condition instead. At white
  belt the band is bone, so you visibly have no belt until you earn one.
- The same swatch annotates **best** in the header. Your best score is what
  produces your rank, so putting them together makes the link visible without
  a tutorial — and it's what connects "my snake has an orange block" to "I am
  an orange belt".
- **Your rank is named in words in the header, always.** Roughly one man in
  twelve can't separate the brown and red belts, and those are consecutive
  ranks — so without a name, the promotion someone most wants to see is the one
  they can't see. The swatch stays the quick read for everyone else; the name is
  what makes it unambiguous. Verified against a deuteranopia simulation rather
  than by eye.
- The header row is split into two clusters: **score and level are live** and
  move while you play; **hi-score and belt are standing** and a bad run can't
  take them away. Every item reads label-then-value, so the row has one grammar
  rather than three. `best` became `hi-score` — the arcade string, and what
  bought the width for an explicit `belt` label. The name carries the
  information and the colour reinforces it, never the other way round: seven
  hues can't be told apart under a colour vision deficiency.
- **The promotion moment.** Crossing a threshold pulses a ring around the board
  in your new belt colour and names the rank below the board. It fires mid-run,
  while you're still playing — peripheral vision reads motion better than text,
  and your eyes are on the snake, so the alert reaches you without the board
  ever being covered. Honours the reduced-motion preference.
- **Defeat lines that know how you died.** Sixteen of them, grouped into four
  cases: you hit a wall, you ate yourself, you scored nothing, or you died on a
  new record. A line that names your actual mistake is worth three generic ones.
  The record lines are warm rather than cutting — somebody who has just beaten
  their own best deserves acknowledgement, not a joke at their expense.
- A microcopy and tone-of-voice guide at `design/MICROCOPY.md`: two voices, the
  locked vocabulary, capitalisation, and how to write a defeat line. The house
  style is asserted in the tests, so a line that contracts, shouts or runs long
  fails the build rather than being noticed later.

### Changed
- The start screen's controls line is lowercase, matching the footer and the
  utility voice. It was the one string in the game with no voice at all.
- The defeat screen no longer repeats your score. It is still in the header
  where you have been watching it all run, so the screen gets one thing to say
  and it may as well be worth reading.
- **Eating a rotten egg is much harder to miss.** The whole body turns green
  now, not just the head — one square changing colour at the end of a moving
  snake was nothing. The head also shudders while the queasiness lasts, fading
  out as it wears off, which is skipped for anyone who has asked for reduced
  motion.
- The rule about rank and colour is narrower than it first looked. **The band
  owns rank colour; the body is free to use colour for condition,** because the
  body's baseline is bone at every rank. The green was briefly removed on the
  grounds that it collided with the green belt — that objection was written
  when the belt was going to colour the whole snake, and stopped applying once
  rank moved onto a single band. At green belt the band does blend into a
  queasy body for a few moves, which is a fair trade: condition is temporary
  and urgent, rank is permanent and also in the header.
- **Your best score now updates the moment you pass it**, rather than when you
  die. That's what lets a promotion land mid-run, which is the whole point of
  it — you find out while you're still trying not to die, not afterwards.

## [0.2.0] — 2026-09-08

The core loop. Three foods filling three roles, never more than two on the
board, and a speed ramp you can see. The scoring dynamic is settled, which is
what belts get built on next.

### Added
- **Eggs** replace apples as the baseline food. Cobras raid nests; they don't
  eat fruit. Same rule, same behaviour, different sprite, so nothing to relearn.
- **Rotten eggs**, worth -3 points. The first thing in the game that punishes
  you rather than rewarding you, and the first use of the red popup styling
  that the "red means losing points" rule was written for. Eating one costs
  points but not length, deliberately: taking length off would be a *relief*
  late in a run, which is the opposite of a punishment.
- Only ever two things on the board — the egg plus at most one visitor, which
  is either a mouse or a rotten egg. Enforced by there being a single slot
  rather than by anyone remembering the rule, so every decision stays binary.
- The snake **turns green and sticks its tongue out** for a while after eating
  a rotten egg, then recovers. Measured in your moves rather than seconds, so
  it lasts the same number of decisions at every speed. You get to watch
  yourself regret it, rather than only seeing a number go down.

### Changed
- **Levels.** The speed ramp is now visible tiers rather than an invisible
  continuous slope, shown in the header beside score and best. A run gets a
  rhythm: settle in, master a pace, get pushed.
- The opening pace is slower, 260ms a move rather than 200. There are three
  things to read on the board now instead of two, and the old opening was too
  brisk for that.
- A mouse now costs **2 length** instead of 1, so taking one is a real
  decision rather than pure upside. Confirmed by play before release.
- **Visitors only appear somewhere you could actually reach them.** Whether
  you catch a mouse is now about whether it's worth the length and the risk
  of boxing yourself in, not about whether it happened to spawn across the
  board. Missing one should be a decision that went wrong, never bad luck.
- `MOUSE_LIFE` raised to 60 moves. It was cut to 45 on the arithmetic that
  the longest crossing is 40 moves; playing it showed that assumes you spot
  the mouse instantly and travel in a straight line, and you do neither.
- Score is floored at zero. A negative score reads as broken, and belt
  thresholds are all defined upwards from nothing.

### Fixed
- Turns are queued instead of overwriting each other, so a fast two-key corner
  no longer loses the second press. Previously a turn was checked against the
  direction you were travelling rather than the one it would actually follow,
  so rounding a corner quickly threw the second press away as a U-turn.

## [0.1.0] — 2026-09-07

First playable version.

### Added
- **A grid-based snake game** in a single self-contained HTML file, with wall
  and self collision, pause, restart and a persisted best score.
- **Apples** worth 1 point, always exactly one on the board.
- **Mice** worth 5 points, appearing after roughly two apples in five, expiring
  after a set number of player moves and flashing before they bolt.
- **Floating score popups**, sized and coloured by value, with red reserved for
  losses.
- **A progressive speed-up**, from 200ms per move down to a 70ms floor.
- **Cobra styling** for the snake: hooded head, tapering tail, direction-aware
  eyes, blinking, a flicking tongue and X eyes on defeat.
- **A black-and-gold dojo theme** with a brush-script wordmark on a fire
  gradient.
- **The version number** in the footer.

[Unreleased]: https://github.com/karinnielsen/strike-first/compare/v0.4.6...HEAD
[0.4.6]: https://github.com/karinnielsen/strike-first/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/karinnielsen/strike-first/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/karinnielsen/strike-first/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/karinnielsen/strike-first/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/karinnielsen/strike-first/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/karinnielsen/strike-first/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/karinnielsen/strike-first/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/karinnielsen/strike-first/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/karinnielsen/strike-first/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/karinnielsen/strike-first/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/karinnielsen/strike-first/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/karinnielsen/strike-first/releases/tag/v0.1.0
