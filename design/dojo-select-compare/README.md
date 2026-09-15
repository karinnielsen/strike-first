# Dojo select mock (UNR-114)

A working mock of the dojo select screen, layered onto a copy of the real game.
Not shipped: nothing here touches `index.html`.

```bash
python3 design/dojo-select-compare/build.py   # writes game.html (gitignored)
python3 -m http.server 8765                   # from the repo root
```

Then <http://localhost:8765/design/dojo-select-compare/game.html>. Links at top
right switch the art, replay the screen and show the flip nudge again.
`?seconds=`, `?max=` and `?art=` are documented at the top of `select.js`.

The crest PNGs are read from `design/leaderboard-compare/crests/`, which is
untracked; they are the large files from PR #6 (`assets/dojo-crests`).

## Settled on 15 September

**The screen**
- A screen of its own, not a box in the canvas. The crest stays on top; board,
  stats and hints step aside.
- Shown on the first visit only, then remembered. The start screen carries
  "Dojo: Miyagi-Do · change". Again never shows it.
- 30 seconds on the clock, labelled TIME, yellow for the last five. Stopped
  while the tab is hidden. When it runs out, the highlighted dojo is chosen:
  "Too slow. Sensei chose for you."
- The highlight starts on the remembered dojo, or a random one for a new
  player, never always Cobra Kai.
- Spacing is the board's: 10px inside a group, 52px between groups.

**The cards**
- Art is PR #6's higher-density crests, sized to the window and capped at
  180px so the cards never outweigh the crest. The 18px badges scaled up were
  rejected as too chunky. Shipped art needs transparent PNGs of about 300px in
  the game palette from Astra; the mock strips the backgrounds itself.
- Front: crest, dojo name, creed (no quote marks). Back: place, team score,
  students, top student, and the sensei - always the dojo's founder: John
  Kreese, Mr. Miyagi, Johnny Lawrence. Stats are fixture data; the real screen
  reads them from `dojo_players`.
- The highlighted card lights in its dojo's colour, as does the room behind.
  Steady, never pulsing; no scale or lift, which blurred the text.
- Flip: ↑ ↓ on a keyboard, or the "↻ flip" button under each card, since a tap
  on the card picks. 3D only while turning, flat and sharp at rest. A card turns
  face-up again when the highlight leaves. Until someone has flipped a card,
  the lit one turns a little, once.
- Choose with ← →, Tab / Shift+Tab (wrapping), hover; pick with Enter, Space,
  click or tap.

**The confirm lands like a kick** - chamber (card draws back, others fade),
strike (the band snaps out of the card, 120ms, accelerating), impact (the name
holds oversized for a beat, the band flashes and gives), settle, hold a second,
then the band closes to a line and the start screen fades in. No page shake: it
caused motion sickness. Welcome lines: "Welcome to Cobra Kai.", "Wax on, wax
off.", "Eagle Fang. Badass."

## Still open

- The kick's timing has not been judged at real speed.
- Eagle Fang's creed and welcome line are the weakest copy.
- A hit sound on impact would do more than any timing change; held with the
  sound work in Choose your fighter.
- Nothing is built into `index.html` yet.
