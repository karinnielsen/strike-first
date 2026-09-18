# Character select — journey and mock

UNR-166. The journey that the build (UNR-115) implements, and mocks to judge
it by. Placeholders stand in for Astra's portraits (UNR-167).

**Plan A, chosen 18 September.** Dojo select, then your dojo's three
fighters. A one-grid flow in the Street Fighter manner (B) was mocked and
dropped: getting it right would be a lot of work at this stage.

**No banners.** Karin found two in a row overkill, and a fighter changes
nothing about how the run plays. A pick is a beat on the card itself: it draws
back, flashes and holds for a frame, and the other cards step away. Then the
screen moves on:

* **Dojo → fighters:** the screen turns rather than handing over. The chosen
  crest flies up and lands as the badge in the dojo line, the heading changes
  its word in place without moving, and the three fighters are dealt in.
* **Fighter → run:** a short hold on the picked card, then the run.
* **Choosing:** one glowing frame slides to the lit card, like a fighting-game
  cursor, rather than each card lighting its own border.

Every beat's length is in `BEAT` at the top of the mock's script. Press `0` in
the mock for a quarter-speed replay. Walk it at `flow.html`.

**What a fighter changes, proposed:** only how you appear. Your best score
stays yours, and a signed score records the fighter who set it, so the
rankings row shows that fighter's face.

## The journey

```
First Arcade:  Title ─▶ Dojo select ─ pick ─▶ Character select ─ pick ─▶ the run
Every later:   Title ─────────────────────────▶ Character select ─ pick ─▶ the run
                             ▲                          │
                             └────────── back ──────────┘
```

**Arcade only.** Practice goes straight to a run today, without dojo select,
and it still does. The run uses the fighter you last chose, or none.

**Only the first Arcade run meets dojo select.** After that, Arcade opens on
your dojo's three fighters, and back is how you change dojo. Rematch skips
the select altogether: same dojo, same fighter, straight into the run. Main
menu, then Arcade, is the way to change fighter.

### Dojo select, changed at its end

The pick is the beat on the card; the band and the creed go. The screen then
turns into character select (see the top of this file). The dojo is committed
at the pick, as today. **The creed loses its moment:** where it lives now is
an open question.

### Character select

Dojo select's conventions, except where noted:

| | |
| -- | -- |
| Heading | **Choose your fighter**, in the heading style, with the 30-second clock under it |
| Cards | The chosen dojo's **three fighters**, in a row. Portrait above the name. All three in the dojo's light, and so is the room |
| Dojo | Badge and name above the heading, in the dojo's colour |
| Lit card | One frame slides to it, in the dojo's colour. Unlit cards are dimmed, as dojo cards are |
| Where the light starts | On the fighter you last chose, **if they belong to this dojo**. Otherwise on a random one |
| Keys | `←` `→` or `a` `d` to choose, `Tab` walks and wraps, `Enter` or `Space` to pick |
| Mouse and touch | Moving over a card lights it, a click or tap picks it |
| Keys line | `← →` or `tab` to choose · `enter` to bow in |
| **No card flip** | There's no back, no `↑` `↓`, no corner flap and no tease. One face per card |
| Clock runs out | Sensei chooses the lit fighter. The keys line reads "Too slow. Sensei chose for you." during the beat |
| Back | The top-left arrow or `Esc` returns to **dojo select**, with its clock restarted and your dojo lit. Nothing about the fighter is committed |
| The pick | The beat on the card, then the run. No banner |
| Keys before the screen shows | Ignored, as on dojo select since UNR-164: no pick before the cards are seen |

### What is remembered

* The fighter, in `localStorage`, beside the dojo. It is written at the pick,
  Sensei's included. Going back writes nothing.
* **A signed score carries the fighter,** so the rankings row can show the
  fighter's icon in its one icon slot, in place of the dojo badge (UNR-115, "On
  the rankings"). That means a new column in `db/scores.sql`. It is tried on the
  sandbox first, and the live board isn't touched before launch
  (`BEFORE_LAUNCH`).
* Scores signed before fighters existed have no fighter. Their row keeps the
  dojo badge.

## Questions for Karin

1. **The creed.** With the band gone, "Strike first. Strike hard. No mercy."
   isn't said anywhere. Drop it, or give it a quiet place, such as the keys
   line during the dojo pick?
2. **The fighter on the run.** Nothing on the board shows who you are today.
   This design keeps it that way: the fighter shows on the select and the
   rankings only. To be decided.
