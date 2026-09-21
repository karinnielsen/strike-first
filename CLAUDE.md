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
repos, changing Linear configuration. Issue statuses and the two kinds of
comment under Linear below don't need asking.

**When genuinely unsure whether she wants discussion or action, ask.** She has
said explicitly that she prefers being asked.

**Shell commands must match the allowlist, or every one of them prompts her.**
`.claude/settings.json` allows `git`, `gh`, `node`, `grep` and the rest by
their first word. A command that starts differently doesn't match, and she
gets asked. That includes `cd x; …`, `a; b` or `a && b`, and `git -C <path> …`.
So: one plain command per call, run from the repo root (the working directory
already is), with no `cd` and no `-C`. Use Read and Grep rather than
`cat`/`grep` chains. Settled 21 September, after a session prompted on nearly
every step. The allowlist was fine; the commands were the problem.

**Anything added to the stack has to be safe to test from the outset.** When
the game starts talking to something new — a database, a hosted service, an
API, an integration — the way to exercise it *without touching anything real,
shared or public* arrives with it, in the same piece of work. Not once it
hurts.

Settled 18 September, after testing against the one live database for three
days and finally writing a junk score onto the board people are about to be
shown (see the gotcha below, and UNR-162). The reason it is a rule rather than
a note is that the damage always lands at the worst moment: the thing that
exercises a new dependency hardest is the release walk-through, which happens
precisely when the real one is about to matter. Retrofitting a sandbox is also
never cheaper later — it is the same work, done after it has already cost
something.

In practice that means asking, before the first commit that writes or calls
out: what does this look like when it is *me* running it, and how do I tell
that apart from the real thing?

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
- **Once work starts, the status follows the code.** The three tiers above are
  about commitment and stop at `Todo`; these are about what exists.
  - `In Progress` — being built right now.
  - `In Review` — written and committed on the branch, waiting for the merge.
    This is what "in the release" looks like on the board.
  - `Done` — set by merging the issue's pull request, or by hand if it
    didn't move.

  Settled 17 September, because four issues whose code was committed were
  still sitting in `Backlog` and `Todo`, so the board didn't show what was
  built. It also makes the merge check mechanical: everything `In Review`
  should be `Done` afterwards, and whatever isn't gets closed by hand.
- **Traceability is the point of Linear here, not prose.**
  - One issue per branch, named `unr-N-short-slug`. Release branches such as
    `wax-on-wax-off` only receive merges from issue branches.
  - **Every issue branch merges through a GitHub pull request,** never a local
    merge: `gh pr create`, then `gh pr merge --merge`. The PR is what closes
    the issue (see the gotcha below).
  - An issue ID goes only where it should link. Any mention in a branch, PR
    or commit links it, so never cite an ID for context. A release PR lists
    one `Closes UNR-N` line per issue.
  - No matching issue: ask before creating one.
- **Write to be skimmed.** One person, so no knowledge transfer to do.
  - New issue: a title, then two to five lines covering the problem and "done
    when". Reasoning goes in the commit message, next to the code.
  - Two kinds of comment, and no others. At `In Review`: what changed and how
    it was checked, at most three bullets. A handoff, only when work stops
    unfinished: status, blocker, next step, three lines.
  - Don't rewrite old verbose issues. Trim one only when touching it anyway.
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

**Grey is only for styling that carries no information.** Grey on black
is hard to read, so anything a player needs to read is bone: labels, hints,
keys, unlit menu rows, column headings. `--dim` is left for things like
the version line and the title's credit. A number beside its label is the
pale `--value`, so it still leads. Settled 17 September.

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
a new thing, **minor** for a new mechanic or mode, or a new step in the
player's journey (a screen they pass through, or a choice every player
makes), **patch** for balance, art, copy and fixes within the screens that
already exist.

**The journey counts, settled 17 September.** The rule used to ask only
what the player has to *do*, and by that test character select came out a
patch. Karin reversed it: character select changes the onboarding journey
and touches many screens a player sees directly, so if the rule called that
a patch, the rule was wrong. The title screen and arrival had been kept as
patches on 16 September under the old wording. Past versions aren't
renumbered.

**Artwork is a patch, however much of it there is.** This used to be ambiguous:
`CHANGELOG.md` said minor meant "new mechanic, mode or content", which made a
pile of commissioned artwork arguable either way. Settled 12 September — the
two files now say the same thing. v0.3.1 replaced the wordmark with a drawn
crest, retired gold for electric yellow across the whole palette and made the
board artwork legible, and it was still a patch, because nothing played
differently afterwards. Artwork on screens that already exist is a patch;
artwork that arrives with a new step is part of that step's minor.

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

Release is the backstop, not the mechanism.

**A hook enforces it, because remembering didn't.** It kept being dropped even
with this section in place: on 15 September the branch saved runs to the
database while the README still said signing only remembered your initials.
`.githooks/commit-msg` refuses a commit that stages `index.html` without
`README.md`, unless the message carries a line saying why not:

    README: unchanged - a refactor, nothing a player sees

It fires only when the game itself changed, which is what keeps it from
being the almost-always-no-op check that gets rubber-stamped. Skipping is
still allowed; it just has to be a written decision. Merges are exempt. It
needs enabling once per clone — `git config core.hooksPath .githooks` — and
never bypass it with `--no-verify`.

## Walk every journey before a release

**Before tagging a release, play every path a player can take, end to end,
with real input.** Not just the screen that changed. The title, dojo select
on a first visit and on a return, the start screen, a run, mercy, defeat,
initials, rankings and back again. Use keyboard, mouse and touch, and both
the stacked and the side-by-side layout.

Checking each change on its own screen is how flawed work reached production
on 17 September. v0.5.3 and v0.5.4 each passed where they were changed, but
nobody walked the whole way through. Pressing M on the title started the
game instead of muting it. The start screen had become a pile of controls
that didn't belong together. **Enter the dojo** read as if it opened dojo
select, when it actually started a run. Nobody knew the game existed yet, so
it cost nothing, but that won't stay true.

When reporting a release as ready, say which journeys were walked. **A
journey that wasn't walked** (the real iPad is the usual one) **is a decision
for Karin before release,** not a footnote after it.

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

## Keeping the session cheap

Measured on 8 September: 70% of the cost was re-reading the conversation, once
per turn, 600 times. What sat in that context: screenshots 34%, Linear echoes
31%, my own writing 29%, shell 6%. **Reading files was 0.1%** — file volume is
not the problem in a five-file repo, so nothing to gain from ignore rules.

- **Screenshots are ~5k tokens each and get re-read every turn afterwards.**
  Only take one to judge how something *looks*. To check whether something
  *works*, read the page as text or assert in `test.js`. Use the `scale`
  parameter when a rough look will do.
- **Every Linear write echoes the whole issue back.** Compose the edit once
  and save once, rather than saving then patching the wording twice. Prefer
  `list_issues` with `fields` over `get_issue` when only a status is needed.
- **Hand low-brow work to a cheaper subagent** — bulk search, sweeping a large
  file for facts, mechanical verification across many places. *But size it
  first:* spawning an agent costs more than the work when the work is one
  command with three lines of output. Delegate when a task reads a lot to
  produce a little. Don't delegate judgement, design, or anything where being
  wrong is expensive and hard to spot.
- **A fresh session is the biggest single saving.** This file and the Linear
  project description exist so one can start cold without re-deriving
  anything. Use them: end a long session and begin again rather than dragging
  a morning of screenshots into the afternoon.

## Gotchas that have already cost time

Notes specific to one machine — its toolchain, firewall and local database —
live in `CLAUDE.local.md`, which is gitignored and loads alongside this file.
Karin works on more than one machine, and that file exists only on the one
that wrote it, so anything true of every clone belongs here instead.

**The iPad simulator is slower than the game.** iPad Safari is tested in the
iOS simulator (serve with the `snake` launch config and open
`http://localhost:8765/`). Each tap or swipe the simulator tool
sends arrives later than one game step lasts, so at real speed the snake hits
the wall before a swipe lands, which looks exactly like broken input. Test
swipes on a **temporary copy** that overrides `stepDelay()` to about 2500ms
and writes `phase`, `direction`, `turnQueue` and `scrollY` into the version
line, read it from screenshots, then delete the copy. The simulator's
`inspect` doesn't work on Safari web content, so that readout is the only
cheap way to see state.

Two smaller traps with it. **Rotating needs Karin:** sending ⌘← to Simulator
needs a macOS Accessibility permission, which is off limits, so ask her to
rotate. And **opening a second URL adds a Safari tab bar**, pushing the page
down about 35pt, so measure tap positions again.

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

**The game is no longer dependency-free.** Since UNR-106 it talks to one hosted
Supabase database, with plain `fetch` against its REST API — no client library,
still one file, no build step. `db/scores.sql` is the record of the schema:
change it there first, then Karin runs it in the SQL Editor. Only the
*publishable* key (`sb_publishable_…`) may appear in the page; a test fails if
a secret key does. The page's rules are only suggestions — what the public key
may do is decided by grants and row-level security in the SQL.

To check those permissions without leaving rows behind, send an insert that
breaks a `check` constraint: an allowed insert fails with `23514`, a forbidden
one with `42501`, and neither writes anything. Updates and deletes should
always come back `42501`.

**There is one database, and testing has been writing to it since 15 September.**
The sandbox should have arrived with the database, in `c4ad96e`, and didn't.
Three days later a release walk-through pressed Enter on a signing screen that
was already filled in with `AAA`, and put a real row on the live board — score
6, Cobra Kai. It can't be taken back from the page, because the publishable key
may not delete; it needs the SQL Editor or the v1.0 wipe.

The lesson isn't "be careful with Enter" — it is the rule at the top of this
file, about testing stack additions safely from the outset. Having a sandbox
from `c4ad96e` would also have solved the next problem for free: from the
moment the repo invites contributors, every one of them running the game
locally writes to the real board too. UNR-162 is the fix, and it sits in Wax
on, wax off rather than in Dojo recruitment for that reason.

**The Browser tool sends an empty key name for some keys**, so the game
never sees them. Checked 17 September: `space`/`Space`, `Return` and `Down`
all arrive as `""`. Use the browser's own key names, which do arrive:
`Enter`, `ArrowDown`, `Escape`, `Tab` and letters. Space has no name that
works, so to press mercy dispatch a real `KeyboardEvent('keydown', {key: ' '})`
at the document, which still goes through the game's own input handler. If
a walk-through seems to ignore a key, log `event.key` before suspecting the
game.

**Don't hand-code detailed SVG illustrations.** A cobra crest was attempted
twice as inline paths and rejected both times. Detailed artwork wants to be
drawn in a vector editor and dropped in as a file. See UNR-86.

**Only a merged pull request closes a Linear issue. Commit messages don't.**
When a PR merges, Linear closes the issue its branch is named after:
`unr-90-...` closes UNR-90. A `Closes UNR-N` line in a *commit* message does
nothing here. Linear never even attaches the commit to the issue. Checked 18
September: every closure that worked came from a PR (UNR-90 from #1, UNR-129
from #5), and every one merged without a PR missed: UNR-84, 85, 137, the
seven at the v0.5.6 merge, and UNR-164. UNR-128 went Done three seconds after
its commit was *made*, too soon for a push to reach Linear, so a session
almost certainly closed it by hand. That one case is where the old belief
that keywords "sometimes" work came from.

So merge issue branches through a PR, and after the merge check the status
anyway. Because the branch name is what closes it, a merged branch closes its
issue even when the work is partial, so split an issue until each branch
closes a whole one. Where splitting isn't worth it, leave the ID out of the
branch name and write `Part of UNR-N` rather than `Closes`.

**The page has one stylesheet, so a class name is global.** A new class can
pick up rules written for a different screen, and it looks exactly like a
layout bug rather than a naming one. On 17 September the rankings table
broke twice this way: a column called `initials` became a centred grid
from the initials entry, and renamed to `name` it turned big, uppercase and
letter-spaced from the dojo filter. Before naming a class, search the
`<style>` block for it.

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
