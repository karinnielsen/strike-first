# Changelog

All notable changes to Strike First are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For a game, read the version parts as:

- **major** — the game plays differently enough to be a new thing
- **minor** — new mechanic, mode or content
- **patch** — balance tuning, art, copy, bug fixes

## [Unreleased]

### Planned
- Belt ranks (white through black) driven by score, with the snake's colour
  showing your current rank
- "No Mercy" as a mode unlocked by rank
- Sound

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
