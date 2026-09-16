# Dojo select mock (UNR-114)

A working mock of the dojo select screen, layered onto a copy of the real game.
Not shipped: nothing here touches `index.html`.

```bash
python3 design/dojo-select-compare/build.py   # writes game.html (gitignored)
python3 -m http.server 8765                   # from the repo root
```

Then <http://localhost:8765/design/dojo-select-compare/game.html> and press
start. Links at top right switch the art, replay and show the flip nudge again.
`?seconds=`, `?max=` and `?art=` are documented at the top of `select.js`.

The crest PNGs are read from `design/leaderboard-compare/crests/`, which is
untracked; they are the large files from PR #6 (`assets/dojo-crests`).

## Settled on 15 and 16 September

**Where it sits**
- After the game's own title screen, which it hooks: press start opens the
  select. Title, then dojo select, then character select, then the game - the
  arcade order. The crest is not on the select at all, which is what gives it
  room; it returns above the board after. Chosen 16 Sept over the crest above
  the select, which is in commit cb28bee.
- Title fades out, the select fades in as one piece with the lit card already
  lit. It used to slam the heading and drop each card on a beat, which read as
  pieces popping in around a dead gap.
- Shown on the first visit only, then remembered. The start screen carries
  "Dojo: Miyagi-Do · change". Again never shows it.

**The screen**
- Three groups 80px apart: the heading and clock, the cards, the keys.
- The heading is the monospace set big and bold with the wordmark's hard
  offset and bloom, the same treatment as Press start.
- 30 seconds on the clock, 32px below the heading, with no TIME label - a big
  number counting down says what it is. Red for the last five. Stopped while
  the tab is hidden. When it runs out, the highlighted dojo is chosen: "Too
  slow. Sensei chose for you."
- The highlight starts on the remembered dojo, or a random one for a new
  player. Not always the middle: whichever card starts lit gets picked more,
  and dojos compete as teams.
- The keys line picks out the keys in bold bone against dim words.

**The cards**
- Art is PR #6's higher-density crests, sized to the window and capped at
  160px. The 18px badges scaled up were rejected as too chunky. Shipped art
  needs transparent PNGs of about 300px in the game palette from Astra; the
  mock strips the backgrounds itself.
- Front: badge and dojo name, centred in the card. No creed on the card - that
  was too much. Back: place, team score, students, top student, and the
  sensei - always the dojo's founder: John Kreese, Mr. Miyagi, Johnny
  Lawrence. Stats are fixture data; the real screen reads them from
  `dojo_players`.
- The highlighted card lights in its dojo's colour, as does the room behind.
  Steady, never pulsing; no scale or lift, which blurred the text.
- Flip: ↑ ↓ on a keyboard. On touch, since a tap on the card picks, the lit
  card has a turned-down corner that flips it, with a 44px hit area. The back
  keeps 36px clear at its foot so the fold never covers the sensei. Until
  someone has flipped a card, the lit one turns a little, once - that nudge is
  the tutorial. Chosen over a "↻ flip" button under every card, and over no
  back at all with the standing under the name. 3D only while turning, flat
  and sharp at rest. A card turns face-up again when the highlight leaves.
- Choose with ← →, Tab / Shift+Tab (wrapping), hover; pick with Enter, Space,
  click or tap.

**The confirm lands like a kick** - chamber (card draws back, others fade),
strike (the band snaps out of the card, 120ms, accelerating), impact (the name
holds oversized for a beat, the band flashes and gives), settle, hold, then the
band closes to a line and the start screen fades in. No page shake: it caused
motion sickness. The line under the name is the dojo's creed, said once as you
commit to it, so the hold is 1.8 seconds to read it (one second for "Too
slow"). The welcome lines this replaced are parked in `design/MICROCOPY.md`.

## Still open

- The kick's timing has not been judged at real speed.
- Eagle Fang's creed is the weakest copy.
- A hit sound on impact would do more than any timing change; held with the
  sound work in Choose your fighter.
- Nothing is built into `index.html` yet.
