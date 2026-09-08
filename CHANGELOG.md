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
- A mouse now costs **2 length** instead of 1, so taking one is a real
  decision rather than pure upside. Provisional, needs playtesting.
- `MOUSE_LIFE` cut from 65 moves to 45. The longest trip across the board is
  40 moves, so the far corner becomes a genuine gamble rather than a
  formality. Provisional, needs playtesting.
- Score is floored at zero. A negative score reads as broken, and belt
  thresholds are all defined upwards from nothing.

### Fixed
- Turns are queued instead of overwriting each other, so a fast two-key corner
  no longer loses the second press. Previously a turn was checked against the
  direction you were travelling rather than the one it would actually follow,
  so rounding a corner quickly threw the second press away as a U-turn.

### Planned
See the [project roadmap](https://linear.app/unrulylabs/project/strike-first-3ec05fe538aa)
for what's coming and in what order. It moves faster than this file.

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
