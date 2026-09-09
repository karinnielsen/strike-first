# Changelog

All notable changes to Strike First are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For a game, read the version parts as:

- **major** — the game plays differently enough to be a new thing
- **minor** — new mechanic, mode or content
- **patch** — balance tuning, art, copy, bug fixes

## [Unreleased]

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

### Planned
See the [project roadmap](https://linear.app/unrulylabs/project/strike-first-3ec05fe538aa)
for what's coming and in what order. It moves faster than this file.

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
- Grid-based snake game in a single self-contained HTML file, with wall and
  self collision, pause, restart and a persisted best score
- Apples worth 1 point, always exactly one on the board
- Mice worth 5 points, appearing after roughly two apples in five, expiring
  after a set number of player moves and flashing before they bolt
- Floating score popups, sized and coloured by value; red reserved for losses
- Progressive speed-up, from 200ms per move down to a 70ms floor
- Cobra styling for the snake: hooded head, tapering tail, direction-aware
  eyes, blinking, a flicking tongue and X eyes on defeat
- Black-and-gold dojo theme with a brush-script wordmark on a fire gradient
- Version number displayed in the footer
