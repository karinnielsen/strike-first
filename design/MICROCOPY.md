# Microcopy and tone of voice — Strike First

Every user-facing string in the game, and how to write the next one. Read this
before adding any text the player will see.

The game has **two voices**. Almost every question about a string answers itself
once you work out which one you are in.

---

## 1. The two voices

### The dojo voice

The game as a sensei, addressing you. Used for anything with attitude: defeat
lines, the promotion moment, overlay titles, the motto, the start button.

* **No contractions.** "The wall does not move", never "doesn't". The formality
  is the joke engine — a rule being stated, not a remark being made. Contract it
  and the authority drains out, which is the only thing making it funny.
* **Second person, imperative or declarative.** Never "you can", never "try to".
* **Nine words or fewer.** Most land at four or five. Nine rather than eight
  because the dojo's signature construction — declaring that some feeling does
  not exist here — spends eight words before the punchline can start. The rule
  was eight until a line worth keeping broke it.
* **Full stops.** Even on fragments. "Humbling." is a sentence here.
* **Never an exclamation mark.** They beg. This voice does not beg.
* **Never explain the joke.** No second clause telling the player what the first
  clause meant.

### The utility voice

The game as an interface, telling you how to work it. Used for the controls
hint, the footer, labels, anything purely functional.

* **Contractions are fine.** This voice sounds like a person, not a rank.
* **Lowercase.** `arrows / wasd · space = mercy · r = restart`
* **No personality at all.** If a utility string is being witty it has wandered
  into the wrong voice. Get out of the way.
* **Labels are one word where possible:** `score`, `level`, `belt`.

### Telling them apart

Ask: *is this the game having a character, or the game being a machine?* If
someone could plausibly say it while making you do press-ups, it is the dojo
voice.

---

## 2. Vocabulary — locked terms

The same idea gets the same word every time. These are decided; changing one is
a deliberate decision, not a preference.

| The pattern | We say | Never |
| -- | -- | -- |
| Best score ever | **hi-score** | best, high score, top score, record |
| Difficulty tier inside a run | **level** | stage, wave, round, speed |
| Persistent rank across runs | **belt** | rank, grade, tier, badge |
| Pausing | **mercy** | pause, break, hold |
| Starting a run | **Enter the dojo** | Play, Start, Begin |
| Restarting after death | **Again** | Retry, Play again, Try again |
| Dying | **DEFEATED** | Game Over, You died, Wasted |
| Crossing a belt threshold | **promotion** | level up, rank up, unlock |
| The play area | **the mat** in prose, **the board** in code | grid, arena, field |

`hi-score` is the arcade string — it is what appears on a cabinet — and it is
also what buys the header room for an explicit `belt` label. Measured: "high
score" plus a belt label exactly fills the row at the top rank.

`mercy` for pause is the single best word in the game. It is a joke, a
mechanic and a reference at once. Protect it.

---

## 3. Spelling and punctuation

* **British English**, matching the author and the code comments. `colour`,
  `apologise`, `centre`.
* No Oxford comma unless a sentence genuinely needs one to be read correctly.
* `·` as the separator in the footer hint, not `|` or `-`.

---

## 4. Capitalisation

**Never Title Case.** Not on buttons, not on headings, not anywhere. It is an
American interface convention and it fights the sentence-case register the rest
of the writing uses. `Enter the dojo`, never `Enter The Dojo`.

Capitals are used for exactly two different reasons, and confusing them is how
a screen ends up shouting in three places at once.

### Voice caps — the game raising its voice

Full capitals, letter-spaced, large. This is volume, and it is rationed.

* Overlay titles: `DEFEATED`, `MERCY`
* The promotion announcement: `GREEN BELT`

That is the entire list. **A screen gets one of these or none.** If something
new wants voice caps, work out what it is competing with first.

### Typographic caps — texture, not volume

Small, dim, letter-spaced. Reads as a tag rather than a shout, and does not
count against the one-per-screen rule above.

* The belt name in the header: `GREEN`

Applied in CSS with `text-transform`, never typed in capitals in the source, so
the underlying string stays a normal word and can be reused anywhere.

### Everything else

| Element | Rule | Example |
| -- | -- | -- |
| **Buttons and CTAs** | Sentence case. First word capitalised, nothing else | `Enter the dojo`, `Again`, `Continue` |
| Overlay body text | Sentence case, full stop if it is a sentence | `Press space to fight on` |
| Defeat lines | Sentence case, always a full stop | `The wall does not move. You do.` |
| Header labels | Lowercase, always | `score`, `level`, `hi-score`, `belt` |
| Footer hint | Lowercase, always | `arrows / wasd · space = mercy · r = restart` |
| Belt names in prose | Capitalise the first word only | `Midnight blue`, not `Midnight Blue` |

**Buttons never take caps of either kind.** A button sits directly under an
overlay title that is already shouting; putting the button in capitals too
makes the player choose which one to read, and they will choose neither.

`Midnight blue` capitalises only the first word because it is a colour rather
than a title. The other six ranks are single words, so it never comes up
elsewhere.

---

## 5. Karate and cobra references

* **Tang Soo Do, accurately.** The belt ladder, the terminology and the
  structure are real. Accuracy is a source of better lines, not a constraint —
  the real ladder ending in midnight blue rather than black is a better story
  than a generic one, and it was free.
* **Cobras behave like cobras.** What they eat, how they hood, how they strike.
* **Go close to the series, but write our own lines.** The names, the register
  and the swagger are the point. The actual dialogue is not ours to use, and
  original phrasing in the same voice is better work anyway.

Three devices from the source material carry the register without borrowing a
single line:

1. **Negating a feeling by decree** — the dojo declares that some emotion does
   not exist here. The construction is the joke engine; pick a fresh noun.
2. **The dismissive comparison** — this is a karate dojo, not a [soft thing].
3. **Self-deflation** — the creed is treated as paint on a wall by the
   characters themselves. The game is allowed to undercut its own solemnity.

---

## 6. Writing a defeat line

Defeat lines are the largest writing surface in the game and the one the player
sees most, so they get their own rules.

* **Know how they died.** Wall and self-collision are different failures and
  deserve different lines. A line that names the actual mistake is worth three
  generic ones.
* **Never sneer at a good run.** A death on a new hi-score gets a warm line.
  The player just did the best thing they have ever done here; the game
  acknowledging that matters more than a joke.
* **Blame the player, gently, and always with a way forward.** "Turn earlier.
  That is the entire lesson." The dojo is harsh, not cruel.
* **They have to survive the twentieth run.** Either write enough of them, or
  make them specific enough that the right one landing feels intentional.

---

## 7. Rules inherited from elsewhere

These are not copy rules but they constrain copy, so they are repeated here.

* **Nothing may obscure the gameplay canvas.** No text over the play area while
  a run is live. Copy lives in the header, in an overlay when the game is
  stopped, or below the board.
* **Colour means rank.** Never use a colour word to mean anything else, and
  never rely on a colour to carry information a string could carry.
* **Rank is always named in words**, not only shown as a swatch.

---

## 8. Current strings

The complete inventory, so nothing drifts unnoticed.

| String | Voice |
| -- | -- |
| `Strike First` — wordmark, page title | — |
| `Strike hard. No mercy.` — start overlay | Dojo |
| `arrows or wasd to move` — start overlay | Utility |
| `Enter the dojo` — start button | Dojo |
| `MERCY` / `Press space to fight on` / `Continue` — pause | Dojo |
| `DEFEATED` / a defeat line / `Again` — defeat | Dojo |
| `<BELT> BELT` — promotion announcement | Dojo |
| `score` `level` `hi-score` `belt` — header labels | Utility |
| `arrows / wasd · space = mercy · r = restart` — footer | Utility |
| Belt names — header and promotion | — |

Sixteen defeat lines live in `DEFEAT_LINES` in `index.html`, grouped by how you
died. The house style above is asserted in `test.js` rather than trusted: a new
line that contracts, shouts, runs long or forgets its full stop fails the build.
