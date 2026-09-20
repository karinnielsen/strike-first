# Music brief

For a music generator or a DAW. Claude can write the Web Audio to play a
track and can encode it for shipping, but a theme that lands is a different
skill — see "Say when another tool is the right one" in `CLAUDE.md`.

Covers UNR-135 (select screen music) and the intro half of UNR-111.

## Settle this first: which register

The game's eight sound effects are 8-bit arcade — square and pulse waves, a
noise channel, hard pitch steps, no reverb. A modern game soundtrack is
produced synthwave: real drums, wide pads, guitar. **Those two do not sit
together on their own**, and that is the whole point of UNR-153.

Two ways to go, and it has to be one of them:

**A. Chiptune.** Music comes down to meet the effects. Keeps the game one
coherent arcade cabinet, and `design/sound-options.html` already speaks this
language. Risk: it may read as smaller than the references do.

**B. Produced synthwave.** Music stays full, and the eight effects get
re-tuned upward to match — still short and punchy, but with body rather than
bare oscillators. Closer to the reference tracks. Costs the second stage of
UNR-153 rather than getting it free.

Karin picks by ear against the references. Everything below works either way.

## What each track has to do

The rule settled 20 September: **music plays on every screen that isn't a
run, and stops when the snake moves.**

| Screen | Job |
|---|---|
| Start menu | The arrival. First thing anyone hears from a shared link. Confident, not frantic — the player is choosing, not fighting |
| Dojo select | Continues the arrival. There is a 30-second clock running, so it can carry a little pressure |
| Rankings | People sit and read here. Same world, lower heat |
| A run | Silence. The effects own it |
| Defeat | Silence at the moment of death. Music returns on the verdict |

One track can cover all four. Two — one bright for start and select, one
cooler for rankings — is the version worth trying if one feels thin.

## Prompts to paste

**Track 1 — start and dojo select**

> Instrumental 1980s arcade synthwave, mid-tempo around 110 BPM, minor key.
> Punchy analogue bass line, bright lead synth over gated drums, a hint of
> east-Asian pentatonic melody. Confident and a little ridiculous — a martial
> arts tournament about to start. Builds once and holds. Seamless loop, 45
> seconds, no vocals, no spoken word.

**Track 2 — rankings (only if one track feels thin)**

> Instrumental 1980s synthwave, slow, around 85 BPM, same minor key as track
> 1. Sparse: pad, slow arpeggio, soft bass, minimal percussion. Reflective —
> reading a scoreboard after the fight. Seamless loop, 45 seconds, no vocals.

For chiptune (option A), add to either: *chiptune, NES/arcade soundchip,
square and pulse waves, triangle bass, noise percussion, no live instruments.*

## Never

- **No soundtrack from the Cobra Kai games or series.** Settled 8 September
  and re-confirmed 20 September. Recorded music is detected mechanically,
  unlike names and visual homage, and v1 is a public launch. Original only,
  same register.
- **No vocals or lyrics.** Shi-jak (UNR-111) is the only voice in the game,
  and it is a shout, not singing.

## Delivery

Drop the generator's **highest quality export** into the repo root and say so.
Claude does the rest:

- trims to a seamless loop
- encodes mono, ~96kbps, target under 500KB per track
- lands it in `assets/` beside the crests, never as a data URI in the page
- fetches it only when music is turned on (UNR-138)

Do not pre-encode. A generator's own "small" export is usually the wrong
trade, and re-encoding a lossy file twice sounds worse than doing it once.
