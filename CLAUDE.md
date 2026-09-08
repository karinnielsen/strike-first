# Working on Strike First

Context for any Claude Code session opening this repo. `README.md` covers what
the game is and how to play it; this file covers how to work on it.

## How Karin wants to work

**Ask before acting.** A question is a question. "Is there a way to…", "what
about…", "could we…" are requests for an answer and a proposal — not for an
implementation. This has been got wrong before: asked whether the game could be
made responsive, a previous session built the whole feature, versioned it,
committed and pushed it. It had to be reverted.

**Don't build unasked.** Propose, then wait. A request to explore, riff or
brainstorm is never a request to build.

**Confirm before anything outward-facing** — committing, pushing, creating
repos, changing Linear.

**When genuinely unsure whether she wants discussion or action, ask.** She has
said explicitly that she prefers being asked.

## Linear

Workspace **Unruly labs** (`UNR`). Project: **Strike First** —
<https://linear.app/unrulylabs/project/strike-first-3ec05fe538aa>

- **Ask before changing any Linear configuration.** Labels, workflow states,
  project structure, views. This includes *applying* existing labels to issues,
  not just creating new ones.
- **Everything unimplemented lives in the `Idea` status.** It's a backlog-type
  state ordered before `Backlog`. Issues reach `Backlog` and then `Todo` only as
  a deliberate decision — otherwise the backlog becomes a graveyard.
- **Always assign new issues to Karin.** She is the only member of the team, so
  an unassigned issue is never correct. Set `assignee: "me"` on creation.
- **The label set is deliberately small and complete:** Feature, Improvement,
  Bug, Chore, Design, Delight, plus Money (revenue-related) cutting across them.
  Don't add labels.
- **Projects here are whole products, not features.** One workspace, several
  products, so the usual mapping shifts down a rung: Project = a product,
  Issue = a feature.

## Design principles for the game

These came out of building v0.1.0 and are worth holding to.

**A reward only matters if it can be refused.** Food that is strictly better
with no cost isn't a decision — you always take it and nothing about how you
play changes. Every reward needs a cost, a risk or a deadline.

**Tie mechanics to player actions, not wall-clock time.** A mouse that lives six
seconds is trivial at high speed and brutal at low speed. `MOUSE_LIFE` counts
*moves*, which keeps "can I reach it?" the same question all game and stops
timers running while paused.

**Red means losing points. Nothing else.** The sign picks the colour in code, so
the rule can't be broken by whoever adds the next food type.

**One loud voice.** The brush display face belongs to the wordmark alone.

**Update and draw stay separate.** `update()` decides what is true; `draw()`
only shows it. Never mix them.

## Versioning

Three things move together, always:

1. the `VERSION` constant at the top of the script in `index.html`
2. a new entry in `CHANGELOG.md`
3. an annotated git tag, e.g. `git tag -a v0.2.0 -m "..."`

Read the numbers in game terms: **major** when it plays differently enough to be
a new thing, **minor** for a new mechanic or mode, **patch** for balance, art
and fixes.

## Running it

No build step. Serve the folder and open the file:

```bash
python3 -m http.server 8770
```

Then <http://localhost:8770/>.

Running means *playing* it — click through the start screen and drive it with
real key events, not by calling internals directly.

## Gotchas that have already cost time

**The 68px gap below the wordmark is load-bearing.** The floating `+N` rises
24px out of the score counter and collides with the title without it. It is
deliberately fixed rather than fluid: the popup is a fixed size and travels a
fixed distance, so the room it needs doesn't shrink on a small screen. Measure
the clearance after touching the header — don't eyeball it.

**`localStorage` is per-origin.** The best score doesn't follow the game across
ports, machines or to a published URL. That's expected, not a bug.

**Don't hand-code detailed SVG illustrations.** A cobra crest was attempted
twice as inline paths and rejected both times. Detailed artwork wants to be
drawn in a vector editor and dropped in as a file. See UNR-86.

**Balance lives in named constants** at the top of the script. Change those
rather than scattering numbers through the code.
