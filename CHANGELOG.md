# Changelog

What changed in each release of Strike First.

## [1.0.5] — 2026-09-22

### Changed
- Side by side, the crest is half again as large, the score list sits
  level with the board rather than stranded at the top, and the two
  columns stand further apart.

## [1.0.4] — 2026-09-22

### Fixed
- Slack cropped a pasted link's card into a small square, slicing the
  wordmark. It now shows the card whole, and stops repeating the game's
  name under its own title.

## [1.0.3] — 2026-09-22

### Changed
- A challenge link now looks like a challenge: its own preview card, and a
  message naming the dojo you fight for.
- The game's own link leads with what it is and what you do in it.
- Killed the tagline on the preview image. The crest and the board say it.

## [1.0.2] — 2026-09-22

### Fixed
- Late in a run, a mouse could be out of reach before its time ran out.
  Its time now comes from the real route around your body.

## [1.0.1] — 2026-09-22

### Fixed
- A fleeing mouse flashed so slowly it could vanish for moves at a time. It
  now blinks once a move.
- A mouse reached on its last move gave nothing.

## [1.0.0] — 2026-09-22

The All Valley opens. Scores are real from here.

### Added
- **The leaderboard is live.** Every signed run lands on the real board, which
  starts empty.
- **Challenge a friend.** Send a link to your best run. Your friend sees the
  score to beat, and their run lands on the same board. On a desktop it copies
  *"I scored N… Beat it."* with the link; on a tablet it opens the share sheet.
- **A landing page for phones:** the crest, the challenge, and a way to send
  the link to a bigger screen.
- **A Star button** for the GitHub repo on the title screen.

### Changed
- **The verdict shows the podium first,** then the menu. The menu stays put
  while the podium loads.
- **Every menu is centred,** with the ▶ beside the lit row.
- **Landscape puts the crest and stats beside the board,** with the board on
  the right for the hand that swipes.
- **The crest flicks its tongue during a run,** not only between them.
- **A rotten egg blinks out** over a few moves instead of vanishing.
- **The snake's tongue lashes,** and is drawn to the board's scale.
- **Beating a challenge in Practice** says it doesn't count.

### Fixed
- The rankings filter showed no selection on All or Eagle Fang.
- The snake's tongue was mostly hidden by its head.

## [0.5.13] — 2026-09-21

### Changed
- **Promotion plays in the theme's key,** climbing through E minor to land on
  E major.

## [0.5.12] — 2026-09-21

### Changed
- **Headings burn from yellow to orange,** so they lead the menus under them.

## [0.5.11] — 2026-09-21

### Added
- **Dojo select has sound:** a blip as the lit card moves, a whoosh as a card
  turns, a thwack as your pick lands.

## [0.5.10] — 2026-09-21

The music arrives.

### Added
- **A theme,** looping quietly on the menus, dojo select and the rankings.
  Off until you turn it on.
- **The speaker says its state** — music off, music on, sound off — on every
  change.

### Changed
- Music fades in and out instead of cutting. The verdict is silent.

### Fixed
- Music that was on stayed silent on the main menu.
- Mercy during the opening bow disqualified an honest run.

## [0.5.9] — 2026-09-20

### Added
- **Music is off until you ask for it.** **M** and the speaker step through
  effects only, effects and music, then silence.
- **Column names on the defeat board:** rank, name, dojo, belt, score.

### Fixed
- The defeat board's columns now line up like the rankings'.

## [0.5.8] — 2026-09-20

### Changed
- **Picking a dojo is instant:** the card flashes and the run starts, instead
  of a three-second banner.
- **Search-friendly title:** "Strike First — Browser Snake Game | Play Free
  Online".

## [0.5.7] — 2026-09-18

### Fixed
- Enter during the fade into dojo select picked a dojo you never saw.

## [0.5.6] — 2026-09-18

Back to basics before inviting anyone in.

### Changed
- **Rotten eggs get in your way,** on your route to the egg, and right beside
  it when a belt is close. Never unfairly close to your head.
- **Mice have to be earned.** They land in tight spots, against walls and in
  corners, with just enough moves to reach them.
- **Continuing from mercy bows you back in:** the same half second at every
  level.
- **Easier to read:** lighter grey, larger header, and bone for anything a
  player needs to read.
- **One way back,** top-left, on every screen you can leave. **Esc** presses
  it.

### Fixed
- The rankings filter slid under the corner buttons on narrow screens.
- The snake had stopped flicking its tongue.
- The cobra's hood was cut off at the edge of the board.

## [0.5.5] — 2026-09-17

The game gets its menus.

### Added
- **A title menu:** Arcade, Practice, Rankings. Arrows, Tab, mouse or tap.
- **Practice:** straight into a run that keeps nothing.
- **Quit from mercy is a forfeit,** and it counts.

### Changed
- **Arcade opens dojo select every time.** Rematch skips it.
- **Mercy and the verdict are menus:** Continue / Quit, and Rematch /
  Rankings / Main menu.
- **Signing is an arcade entry:** three letters, one Sign button.
- **R is Rematch on the verdict,** and does nothing mid-run.

### Killed
- The start screen on the board, and the arrival animation that led to it.
- Skip on signing, Again, and the dojo totals under the defeat board.

## [0.5.4] — 2026-09-17

### Added
- **A speaker and a pause button** in the top-right corner of every screen.
  Hover names their keys.

### Changed
- **M mutes anywhere,** the title included.

## [0.5.3] — 2026-09-17

### Added
- **All Valley Rankings:** the top ten and your neighbourhood, on its own
  screen, filtered by dojo. Open it with **B**.

## [0.5.2] — 2026-09-16

### Added
- **Disqualified.** A tampered run is called out, and doesn't count.

## [0.5.1] — 2026-09-16

### Added
- **Scores you can trust.** The board refuses runs the game couldn't have
  produced, and rate-limits submissions.

## [0.5.0] — 2026-09-16

The All Valley: pick a dojo, sign the board, score for your dojo.

### Added
- **A title screen,** arcade-cabinet style. Press start.
- **Dojo select:** Cobra Kai, Miyagi-Do or Eagle Fang, 30 seconds on the
  clock. Flip a card to see how the dojo stands.
- **Sign the board** with three initials after a new hi-score.
- **A shared leaderboard,** with a podium on the defeat screen and every dojo
  scored by its best three.

## [0.4.6] — 2026-09-15

### Changed
- **Reduced motion covers the whole game,** score feedback and the egg
  included.

## [0.4.5] — 2026-09-14

### Added
- **An arrival animation** on first load.

## [0.4.4] — 2026-09-14

### Added
- **An opening bow:** every run starts with a strike.

## [0.4.3] — 2026-09-14

### Added
- **A defeat sequence:** sparks, knock-back, and the snake drains to ash.
- **Near-miss lines** when you fall just short, and 37 defeat lines in all.

## [0.4.2] — 2026-09-14

### Added
- **Arcade sound effects,** generated in the page.
- **Mute** with **M**, remembered.

## [0.4.1] — 2026-09-14

### Added
- **The crest flicks its tongue** between runs.

## [0.4.0] — 2026-09-14

Plays anywhere.

### Added
- **A link:** <https://karinnielsen.github.io/strike-first/>. Nothing to
  install.
- **MIT licence.** An unofficial, non-commercial fan homage.

## [0.3.2] — 2026-09-14

### Added
- **Touch controls:** swipe to steer, on a tablet.
- **A tab icon and a link preview.**

### Changed
- **The whole board fits** on short and landscape screens.

### Fixed
- Pages that fit scrolled on iPad Safari.

## [0.3.1] — 2026-09-12

The game gets its face.

### Added
- **The cobra crest.**
- **Drawn artwork** for the egg, rotten egg, mouse and the cobra's head, on a
  board half as large again.
- **A cabinet-style button** you can see focus on.

### Changed
- **One yellow,** shared by the crest, the button and the score.

### Killed
- The web font. The game fetches nothing.

## [0.3.0] — 2026-09-08

Earn your belt.

### Added
- **Belts,** from white to midnight blue, following Tang Soo Do. Earned by
  beating your own hi-score by enough.
- **The snake wears its belt,** and the header names it.
- **A promotion ring,** mid-run, the moment you cross a belt.
- **Defeat lines that know how you died.**

### Changed
- **A rotten egg turns the whole snake green** and makes it shudder.
- **Your hi-score updates as you pass it,** not when you die.

## [0.2.0] — 2026-09-08

The core loop.

### Added
- **Eggs** replace apples. Cobras raid nests.
- **Rotten eggs,** worth −3.
- **Never more than two things on the board.**

### Changed
- **Levels:** visible speed tiers.
- **A slower start,** 260ms a move.
- **A mouse costs 2 length.**
- **Visitors only land where you can reach them.**
- Score never goes below zero.

### Fixed
- A fast two-key corner lost the second turn.

## [0.1.0] — 2026-09-07

First playable version: a cobra-styled snake with apples, mice, score
popups and a speed-up, in one HTML file.

[1.0.0]: https://github.com/karinnielsen/strike-first/compare/v0.5.13...v1.0.0
[0.5.13]: https://github.com/karinnielsen/strike-first/compare/v0.5.12...v0.5.13
[0.5.12]: https://github.com/karinnielsen/strike-first/compare/v0.5.11...v0.5.12
[0.5.11]: https://github.com/karinnielsen/strike-first/compare/v0.5.10...v0.5.11
[0.5.10]: https://github.com/karinnielsen/strike-first/compare/v0.5.9...v0.5.10
[0.5.9]: https://github.com/karinnielsen/strike-first/compare/v0.5.8...v0.5.9
[0.5.8]: https://github.com/karinnielsen/strike-first/compare/v0.5.7...v0.5.8
[0.5.7]: https://github.com/karinnielsen/strike-first/compare/v0.5.6...v0.5.7
[0.5.6]: https://github.com/karinnielsen/strike-first/compare/v0.5.5...v0.5.6
[0.5.5]: https://github.com/karinnielsen/strike-first/compare/v0.5.4...v0.5.5
[0.5.4]: https://github.com/karinnielsen/strike-first/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/karinnielsen/strike-first/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/karinnielsen/strike-first/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/karinnielsen/strike-first/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/karinnielsen/strike-first/compare/v0.4.6...v0.5.0
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
