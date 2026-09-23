# Microcopy

How the game talks, and every string it says. Read this before adding text a
player will see.

## 1. Two voices

Ask: *is the game having a character, or being a machine?* If someone could
say it while making you do press-ups, it's the dojo voice.

**The dojo voice:** the game as a sensei. Defeat lines, the promotion,
overlay titles.

- **No contractions.** "The wall does not move." The formality is the joke;
  contract it and the authority drains out.
- **Second person, imperative or declarative.** Never "you can", never
  "try to".
- **Nine words or fewer.** Most land at four or five.
- **Full stops,** even on fragments. "Humbling."
- **Never an exclamation mark.** They beg.
- **Never explain the joke.**

**The utility voice:** the game as an interface. Hints, labels, the footer.

- Contractions are fine.
- Lowercase: `arrows / wasd · space = mercy`.
- No personality. A witty utility string is in the wrong voice.
- Labels are one word where possible: `score`, `level`, `belt`.

## 2. Locked vocabulary

The same idea always gets the same word. Changing one is a decision, not a
preference.

| Idea | We say | Never |
| -- | -- | -- |
| Best score ever | **hi-score** | best, high score, record |
| Difficulty tier in a run | **level** | stage, wave, round |
| Rank across runs | **belt** | rank, grade, tier |
| Pausing | **mercy** | pause, break |
| The mode that counts | **Arcade** | Play, Ranked |
| The mode that doesn't | **Practice** | Free play, Training |
| Again, after Arcade | **Rematch** | Retry, Play again |
| Again, after Practice | **Practice** | Again, Rematch |
| Back to the title | **Main menu** | Menu, Home, Exit |
| Dying | **DEFEATED** | Game Over, You died |
| Quitting from mercy | **FORFEIT** | Quit, Gave up |
| A run the rules couldn't produce | **DISQUALIFIED** | Cheater, Invalid |
| Crossing a belt threshold | **promotion** | level up, unlock |
| The play area | **the mat** in prose, **the board** in code | grid, arena |

`hi-score` is the arcade-cabinet word, and it's short enough to leave room in
the header for a `belt` label. `mercy` is a joke, a mechanic and a reference
at once: protect it.

## 3. Spelling and punctuation

- British English: `colour`, `centre`.
- No Oxford comma unless a sentence needs it.
- `·` separates items in a hint, never `|` or `-`.

## 4. Capitals

**Never Title Case,** anywhere: `Main menu`, not `Main Menu`. Strings are
written in sentence case and capitalised by CSS when shown, so the source
stays a normal word.

**Voice caps** are volume: large, bold, letter-spaced. They're rationed to
**one per screen**:

- screen headings: `DEFEATED`, `DISQUALIFIED`, `FORFEIT`, `MERCY`,
  `CHOOSE YOUR DOJO`, `ALL VALLEY RANKINGS`
- the promotion: `GREEN BELT`

Anything new that wants voice caps has to work out what it's competing with
first.

**Other capitals** are texture, not volume, and don't count against that:

- menu rows and `Press start`
- belt and dojo names on the header, cards and rankings

| Element | Rule | Example |
| -- | -- | -- |
| Menu rows | Sentence case in the markup. No helper text under a row | `Main menu` |
| Defeat lines | Sentence case, always a full stop | `The wall does not move. You do.` |
| Header labels, hints | Lowercase | `score`, `hi-score` |
| Belt names in prose | First word only | `Midnight blue` |

## 5. Karate and cobras

- **Tang Soo Do, accurately.** Real accuracy makes better lines: a ladder
  ending in midnight blue rather than black is a better story, and it was
  free.
- **Cobras behave like cobras.**
- **Go close to the series, but write our own lines.** Nod, never quote:
  "The wall swept your leg" is ours, the leg sweep is theirs.

Three devices carry the series' register without borrowing a line:

1. **Negating a feeling by decree:** the dojo declares some emotion doesn't
   exist here. Pick a fresh noun.
2. **The dismissive comparison:** this is a dojo, not a [soft thing].
3. **Self-deflation:** the game may undercut its own solemnity.

## 6. Defeat lines

The biggest writing surface, and the one players see most.

- **Know how they died.** Wall and self-collision get different lines.
- **Never sneer at a good run.** A new hi-score gets a warm line.
- **Blame gently, with a way forward.** Harsh, not cruel.
- **Survive the twentieth run.** Never the same line twice in a row.
- **A near miss outranks a joke.** A few points short of the hi-score, or of
  the next belt, gets a line saying by how much. Numbers are words:
  `two points`.

42 lines live in `DEFEAT_LINES`, five of them for a disqualified run.
`test.js` enforces the dojo voice: a line that contracts, shouts, runs long
or drops its full stop fails.

## 7. Rules from elsewhere

- **Nothing covers the board during a run.** Copy lives in the header, in an
  overlay when stopped, or below the board.
- **Colour means rank.** Never use a colour word for anything else, and
  never let colour carry what a string could.
- **Rank is always named in words,** not only shown as a swatch.

## 8. Every string

| String | Where | Voice |
| -- | -- | -- |
| `Strike First` | wordmark, page title | — |
| `Press start` / `any key` / `tap to start` | title | Utility |
| `@pushinpixls 2026` / `Star` / `free play` | title foot. The star's count shows from 10 | Utility |
| `Arcade` / `Practice` / `Rankings` | title menu | Utility |
| `Choose your dojo` | dojo select heading | Utility |
| `← → or tab to choose · ↑ ↓ to flip · enter to bow in` | dojo select | Utility |
| `tap a dojo to bow in · tap its corner to flip` | dojo select, touch | Utility |
| `dojo rank` `team score` `students` `top` `Sensei` | a dojo card's back. Never `place` or `of 3` | Utility |
| `Too slow. Sensei chose for you.` | dojo select, clock ran out | Dojo |
| `MERCY` / `Continue` / `Quit` | mercy | Dojo |
| `DEFEATED` / a defeat line / `Rematch` `Rankings` `Main menu` | defeat after Arcade | Dojo |
| `Practice` `Arcade` `Main menu` | defeat after Practice | Utility |
| `FORFEIT` / the same menu | quitting from mercy | Dojo |
| `DISQUALIFIED` / a disqualified line / the same menu | a tampered run | Dojo |
| `Sign` / `The dojo will not print that.` | initials | Dojo |
| `<BELT> BELT` | promotion | Dojo |
| `All Valley Rankings` | rankings heading | Utility |
| `Challenge a friend` / `Link copied` | defeat, once you've signed a run | Utility |
| `KAR of Cobra Kai challenges you to Snake.` / `Score to beat: 47` | title, from a challenge link. No belt: they've never played | Utility |
| `You beat KAR's 47.` / `KAR's 47 still stands.` | defeat, on a challenge | Dojo |
| `Beaten in practice. It does not count.` | Practice beat the challenge | Dojo |
| `Beat my score in Strike First, a karate Snake game.` | the shared message | Utility |
| `A karate Snake game, made for a keyboard or a tablet.` + `Accept the challenge on a bigger screen.` or `Play it on a bigger screen.` / `Send it to myself` | phone landing | Utility |
| `score` `level` `hi-score` `belt` | header | Utility |
| `arrows / wasd · space = mercy · m = sound · b = rankings` | footer | Utility |
| `swipe to move · ❚❚ = mercy` | footer, touch | Utility |
| `mercy` | touch pause button's accessible name | Utility |
| `f feedback` / `feedback` | corner key tip / accessible name | Utility |
| `Send feedback` / `Bug` `Idea` `Fun` / `say more (optional)` / `Send` | feedback card | Utility |
| `Sent with the game's state and your browser type.` / `enter to send · esc to close` | feedback card | Utility |
| `sending…` / `Not sent. Check your connection and try again.` | feedback card | Utility |
| `Heard. Thank you.` | toast, feedback sent | Dojo |

## Appendix: dojo voices (not built)

The plan: once you belong to a dojo, defeat lines, the promotion and mercy
come from its sensei. Today everyone hears the one house voice.

**A dojo changes attitude, not grammar.** Every dojo keeps the dojo voice's
rules and the locked vocabulary. The one exception: Eagle Fang uses
contractions.

| | Cobra Kai | Miyagi-Do | Eagle Fang |
| -- | -- | -- | -- |
| Values | aggression, commitment | balance, patience | guts, instinct |
| Blames you for | hesitating | rushing, greed | playing it safe |
| Praises | a greedy run | a long calm run | anything reckless that worked |
| Register | cold, clipped, drill sergeant | quiet teacher; kind but honest | loud, blunt, a bit out of date |
| Leans on | negating a feeling | nature and craft, fresh images | the dismissive comparison |
| Hit the wall | `The wall struck first. Remember that.` | `The wall was patient. Be patient too.` | `Walls don't dodge, genius. Turn.` |
| New hi-score | `Your best. Now make it look easy.` | `Your best yet. Rest, then begin again.` | `Now that's what I'm talking about.` |

If a line could move to another dojo's column unnoticed, it has no voice yet.

Open questions:

- Which strings change with the dojo? The creed-like lines read oddly to a
  Miyagi-Do student.
- `test.js` will need a per-dojo exception for Eagle Fang's contractions,
  not a looser rule for everyone.

Parked welcome lines, for a moment like switching dojos: `Welcome to Cobra
Kai.` / `Eagle Fang. Badass.` (`Wax on, wax off.` is the series' own line,
so it can't ship.)
