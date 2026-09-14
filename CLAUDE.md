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

- **Ask before changing Linear configuration.** Workflow states, project
  structure, views. Creating a *new* label counts. *Applying* existing labels to
  issues does not — use them freely.
- **Three tiers, and the line between them is commitment.**
  - `Idea` — blue sky. Written down so it isn't lost, not committed to. Most
    things live here and that's correct.
  - `Backlog` — committed in earnest. In practice: it sits in a milestone that
    has a target date.
  - `Todo` — being worked on now.

  Promotion is always a deliberate decision, never drift. That's what stops the
  backlog becoming a graveyard, and it's why an idea landing in `Idea` costs
  nothing.
- **Always assign new issues to Karin.** She is the only member of the team, so
  an unassigned issue is never correct. Set `assignee: "me"` on creation.
- **The label set is deliberately small and complete:** Feature, Improvement,
  Bug, Chore, Design, Delight, plus Money (revenue-related) cutting across
  them. Apply them freely; ask before creating a new one.
- **Projects here are whole products, not features.** One workspace, several
  products, so the usual mapping shifts down a rung: Project = a product,
  Issue = a feature.
- **Milestones are the plan.** The project description in Linear carries the
  goals, the design principles, the sequencing and why it's in that order. It's
  the source of truth for *what we're building and when*; this file covers *how
  to work on it*. Read both.

## Design principles for the game

These came out of building v0.1.0 and are worth holding to.

**A reward only matters if it can be refused.** Food that is strictly better
with no cost isn't a decision — you always take it and nothing about how you
play changes. Every reward needs a cost, a risk or a deadline.

**Tie mechanics to player actions, not wall-clock time.** A mouse that lives six
seconds is trivial at high speed and brutal at low speed. `MOUSE_LIFE` counts
*moves*, which keeps "can I reach it?" the same question all game and stops
timers running while paused.

**The belt band owns rank colour.** Rank is worn as a single band on the
snake, and nothing else may take on a belt's colour there. The body's baseline
is bone at every rank, which leaves it free to carry condition: it turns green
while queasy, and at green belt the band briefly blends in — a trade accepted
because condition is temporary and rank is also named in the header. The
reasoning is in the comment above `SICK_GREEN`. This replaced an older rule,
"red means losing points and nothing else", which the red belt made untenable;
the minus popup still shows red, always beside its sign.

**One loud voice.** The wordmark is the only thing allowed to shout, and
everything else in the game keeps the monospace. As of v0.3.1 that voice is
*drawn* rather than set — the crest's lettering is outlined into the artwork
and there is no display face in the page at all. Reaching for one again would
be adding a second voice, not restoring the first.

**Update and draw stay separate.** `update()` decides what is true; `draw()`
only shows it. Never mix them.

**Respect the original rules of Snake by default.** Deviating is allowed but has
to be argued for. Someone who knows Snake shouldn't have to relearn it.

**Karate references respect the real world,** specifically Tang Soo Do. The belt
ladder is white, orange, green, brown, red, Cho Dan Bo (blue), then *midnight
blue* rather than black — black symbolises an end, and learning never stops.
Red sits near the top, which is what forced the colour rule above.

**Cobra behaviour is modelled on real cobras.** What they actually eat and do.
Realism is a source of mechanics, not decoration.

**Less is more.** Challenge Karin when she goes too far. She's asked for this
explicitly. But it governs what *ships*, not what gets written down. The `Idea`
status exists so ideas can be captured without committing to them, so a big
backlog isn't scope creep. Promoting things out of `Idea` without a reason is.

**Go close to the series.** Recognisable names, factions and look are the point.
The risk to a free, non-commercial fan project is low and the realistic worst
case is a takedown, not a lawsuit. Two things keep it that way: stay
non-commercial, and don't ship the actual soundtrack — write original music in
the same register instead, which also keeps the single-file property.

The full set, including the ones about recognisable references and how sound is
used, lives in the Linear project description.

## Versioning

Four things move together, always:

1. the `VERSION` constant at the top of the script in `index.html`
2. a new entry in `CHANGELOG.md`
3. the **Current version** line in `README.md`
4. an annotated git tag, e.g. `git tag -a v0.2.0 -m "..."`

The README line is the newest of the four, and it is in the list precisely
because it was the one that broke. It read v0.1.0 until 12 September, through
two releases that changed it. The other three never drifted once — the
invariant is what kept them honest — so the fix was to put the fourth thing
*inside* the invariant rather than to try to remember harder.

Read the numbers in game terms: **major** when it plays differently enough to be
a new thing, **minor** for a new mechanic or mode, **patch** for balance, art
and fixes.

**Artwork is a patch, however much of it there is.** This used to be ambiguous:
`CHANGELOG.md` said minor meant "new mechanic, mode or content", which made a
pile of commissioned artwork arguable either way. Settled 12 September — the
two files now say the same thing. v0.3.1 replaced the wordmark with a drawn
crest, retired gold for electric yellow across the whole palette and made the
board artwork legible, and it was still a patch, because nothing played
differently afterwards. The test is what the player has to *do*.

A corollary worth knowing: the milestones in Linear each name the version they
ship as, all the way to v1.0.0. Spending a minor early means renumbering every
milestone behind it, so reach for a patch when the rule allows one.

## Keep the README true as you go

The version line is the mechanical half. The rest of the README rots a
different way: it describes the game, and the game keeps changing.

**A change a player can see carries its README update in the same commit.** A
food, a control, a rank, a mode, the board — if a player would notice it, the
README is part of that diff, not a job for later. Internals don't count: a
renamed token, a refactor or a comment changes nothing the README claims.

Same commit rather than at release, because that is the one moment someone
definitely knows what changed. By release time they don't. That is how the
README came to describe *apples* when the game had served eggs since v0.2.0,
and to list belt ranks under "Next" as white-through-black three days after
belts shipped ending in midnight blue.

Release is the backstop, not the mechanism. And deliberately **not** every
merge: this project commits straight to main, so per-merge would mean per-
commit, and a check that is almost always a no-op gets rubber-stamped until it
stops being a check at all.

## Running it

The board is **21 x 21 cells at 30px**, so a 630px canvas. The grid is the
game; the cell size is only how large it is drawn. Changing `CELL` changes
nothing about how it plays.

No build step. Serve the folder and open the file:

```bash
python3 -m http.server 8765
```

Then <http://localhost:8765/>. The `snake` configuration in
`.claude/launch.json` does the same thing.

There are tests too, and they need no setup beyond **Node 15 or newer** —
`test.js` uses `||=`, so an older Node dies with a bare `SyntaxError` that
looks nothing like a version problem:

```bash
node test.js
```

They cover the pure-ish logic: the speed curve, collisions, growth, scoring,
the mouse countdown and the input rules. They can't tell you whether the game
is *fun* — that still needs playing. New logic should arrive as functions that
take arguments and return answers, because those need no harness at all.

Running means *playing* it — click through the start screen and drive it with
real key events, not by calling internals directly.

## Show two versions rather than describing the difference

When a change is visual, or a matter of feel, **build both and put them side by
side**. It is the fastest way to settle a question that prose cannot, and Karin
has asked for it to happen more often.

`design/demo/` has the tooling: an autopilot that plays the game by itself, so
she can inspect without being distracted by playing, and notes on building a
comparison. Three rules that came out of using it:

* **Judge at actual size.** Magnified views flatter detail that dissolves at
  real size.
* **Change one variable.** Comparing artwork and cell size at once tells you
  nothing about either.
* **Never scale two versions to fit side by side** if they differ in size —
  that erases the thing being compared.

Keep the losing version on a branch. `assets/pixel-sprites` is a complete
pixel-art alternative to the board artwork that shipped, including a better egg
than the one on `main`.

## Say when another tool is the right one

Don't grind at something badly when a different tool does it properly. Name the
tool and hand it over. Karin has asked for this explicitly.

Known weak spots, worst first:

- **Detailed artwork.** Can't draw. The cobra crest proved it twice, and the
  rotten egg took three attempts. Karin has ChatGPT/Astra credits — send
  crests, portraits and any real illustration there, then drop the file in.
  See UNR-86, UNR-114, UNR-115. Small shapes drawn straight into canvas are
  fine; anything that needs to look *drawn* is not.
- **Judging whether it's fun.** Can drive the game with real key events and
  confirm it *works*, but has no sense of whether it *feels* good. Balance,
  difficulty and how a reward lands need human playtesting. This is the reason
  several issues say "decided from play, not arithmetic".
- **Composing music.** Can write Web Audio oscillator code and get pleasant
  short effects. A theme that actually lands is a different skill — a music
  generator or a DAW.
- **Motion feel.** Can write the animation. Judging whether the timing feels
  right wants a human eye or a reference to match.

Things worth doing *here* rather than elsewhere: contrast and colour-blindness
checks (Chrome DevTools emulates vision deficiencies), factual research before
writing specifics into a spec, and anything structural in the code.

## Gotchas that have already cost time

Notes specific to one machine — its toolchain, firewall and simulator — live
in `CLAUDE.local.md`, which is gitignored and loads alongside this file.

**The room above the score is load-bearing, and it lives in two places.** The
floating `+N` rises 24px out of the score counter and collides with whatever
sits above it. In the stacked layout that's the crest, so its bottom margin is
68px. In the side-by-side layout for short screens (v0.3.2) the stats have a
column of their own and the `+N` rises into the top of *that*, so the crest's
margin drops to 16px and the room moves to 52px of `padding-top` on the stats
list. Both are deliberately fixed rather than fluid: the popup is a fixed size
and travels a fixed distance, so the room it needs doesn't shrink on a small
screen. Touch either layout's header or stats and measure the clearance in
both — don't eyeball it.

**`localStorage` is per-origin.** The best score doesn't follow the game across
ports, machines or to a published URL. That's expected, not a bug.

**Don't hand-code detailed SVG illustrations.** A cobra crest was attempted
twice as inline paths and rejected both times. Detailed artwork wants to be
drawn in a vector editor and dropped in as a file. See UNR-86.

**Linear can close issues from git, without asking — but not reliably.**
A merged pull request closes the issue its branch is named after — `unr-90-...`
closes UNR-90. And a commit pushed to `main` whose message says `Closes UNR-N`
(or `Fixes`) *can* close that issue too, no PR needed: UNR-128 went Done three
seconds after its direct-to-main commit, and UNR-129 closed from a local merge
commit. But on 14 September UNR-84 and UNR-85 did not close from merge commits
worded exactly the same way, and both had to be closed by hand. So treat the
keyword as a hope, not a mechanism: after pushing, check the status, and close
it yourself if it hasn't moved. For work that only partly addresses an issue,
keep the ID out of the branch name and write `Part of UNR-N` rather than
`Closes`, since when the keyword does fire, it fires on partial work too.

**Balance lives in named constants** at the top of the script. Change those
rather than scattering numbers through the code.

**Everything in the drawing code was authored for a 20px cell.** Cells are
30px now, and `CELL_SCALE` is what bridges that. Anything hand-drawn in canvas
coordinates — the rotten egg's fumes, its halo — must multiply by it, not just
the artwork. Getting this wrong looks exactly like a feature having been
deleted: the fumes were scaled while the shell was not, so the shell grew
around them and hid them completely.

**The test harness's fake canvas has to match the real page.** It is 630px so
that `630 / CELL(30)` gives 21 columns. A harness that disagrees with the page
about the size of the grid is worse than no harness.

**Board art is drawn into a canvas, not the DOM.** An SVG file cannot be placed
on it. `Path2D` takes SVG path data directly, which is the way in — so board
artwork is only usable if it reduces to a short list of path strings, each with
one flat fill. The crest is different: that one is a DOM element and can be a
normal inline SVG. `design/ASSET-BRIEF.md` §7 covers this.

**Detail below about two pixels wide does not exist at cell size.** It does not
merely fail to render, it muddies the silhouette that does. A delivered mouse
had ten paths and read *better* with five. If removing a path improves the
read, it was never detail.
