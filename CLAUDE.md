# Working on Strike First

How this repo is worked on with Claude Code: the rules a session follows,
and the traps it would otherwise fall into. The reasons behind each rule are
in the git history of this file.

Also read:

- `README.md`: what the game is.
- `CONTRIBUTING.md`: setup, the file map and the rules of the code.
- The Linear project description: goals, milestones and sequencing. It is the
  source of truth for *what* gets built and *when*.
- `CLAUDE.local.md`: notes for one machine (gitignored). Anything true on
  every clone belongs here instead.

## Working rules

- **Ask before acting.** "Is there a way…", "what about…" and "could we…" get
  an answer and a proposal, not an implementation. Exploring is never a
  request to build. When unsure, ask.
- **Confirm before anything outward-facing:** committing, pushing, creating
  repos, changing Linear configuration. Issue statuses and the two kinds of
  Linear comment don't need confirming.
- **Less is more.** Push back on scope. This governs what ships; writing an
  idea down costs nothing.
- **Show two versions rather than describing the difference.** Change one
  variable, judge at actual size, and never shrink two versions to fit side
  by side. Keep the losing version on a branch (e.g. `assets/pixel-sprites`).
- **Say when another tool is the right one.** Detailed artwork goes to
  ChatGPT or Astra; never hand-code an illustration as SVG. Fun, music and
  motion feel are judged by a play test or a specialist tool. Contrast
  checks, research and structural code belong here.
- **Anything new in the stack arrives with a safe way to test it.** Before
  the first commit that writes to or calls something new, define what a
  local run looks like and how it is told apart from the real thing.
- **Shell commands must match the allowlist** in `.claude/settings.json`, or
  they prompt. Each part of `a && b` is checked separately. Never use
  `git -C`. A command that keeps prompting belongs in the shared file, not in
  "always allow".
- **Docs and comments read as specs:** what is true, what to do, and why.
  Never write about people ("X wants", "X's call").
- **A commit message is one line:** what changed, in the present tense.
  Reasoning worth keeping goes where it will be read again: a comment beside
  the code, a rule in this file, or the Linear issue. Older commits keep
  their long messages.

## Linear

Workspace **Unruly labs** (`UNR`), project
[Strike First](https://linear.app/unrulylabs/project/strike-first-3ec05fe538aa).

- **Statuses:**

  | Status | Means |
  | --- | --- |
  | `Idea` | Written down, not committed to |
  | `Backlog` | Committed: in a milestone with a date |
  | `Todo` | Chosen to be worked on now |
  | `In Progress` | Being built |
  | `In Review` | Committed on the branch, waiting for the merge |
  | `Done` | The PR has merged |

  Promotion out of `Idea` is always deliberate. Once work starts, the status
  follows the code.
- **One issue per branch,** named `unr-N-short-slug`. Every branch merges
  through a PR (`gh pr create`, then `gh pr merge --merge`), never locally. A
  release branch only receives merges from issue branches.
- **Only a merged PR closes an issue,** by its branch name. `Closes UNR-N` in
  a commit does nothing. Check the status after merging. For partial work,
  leave the ID out of the branch name and write `Part of UNR-N`.
- **An issue ID goes only where it should link,** never as context. A release
  PR lists one `Closes UNR-N` per issue.
- **New issues:** ask first if none matches, and set `assignee: "me"`. A
  title, then two to five lines: the problem, and "done when".
- **Two kinds of comment, no others:**
  - At `In Review`: what changed and how it was checked, in at most three
    bullets.
  - A handoff when work stops unfinished: status, blocker and next step, in
    three lines.
- **Labels:** Feature, Improvement, Bug, Chore, Design, Delight, and Money
  across them. Apply them freely; ask before creating one.
- **Ask before changing configuration:** workflow states, project structure,
  views.
- **Leave old verbose issues alone,** unless you're touching one anyway: then
  trim it.

## Design principles

The full set, with the reasoning, is in the Linear project description.

- **A reward only matters if it can be refused.** Every reward needs a cost,
  a risk or a deadline.
- **Count the player's moves, not wall-clock time.** Otherwise things get
  easier or harder with speed, and timers run while paused.
- **The belt band owns rank colour.** The body shows condition instead.
- **One loud voice:** the drawn crest. Everything else keeps the monospace.
- **Grey only for styling that carries no information.** Anything a player
  reads is bone.
- **`update()` decides, `draw()` shows.**
- **Respect Snake's original rules** unless there's an argument for changing
  them.
- **Karate follows Tang Soo Do.** The belts go white, orange, green, brown,
  red, Cho Dan Bo (blue), then midnight blue rather than black: learning
  never ends.
- **Cobras behave like real cobras.** Realism is a source of mechanics.
- **Go close to the series,** but stay non-commercial and never ship the
  actual soundtrack.

## Versioning

Four things move together: the `VERSION` constant in `index.html`, a
`CHANGELOG.md` entry, the **Current version** line in `README.md`, and an
annotated tag (`git tag -a vX.Y.Z -m "..."`).

| Bump | When |
| --- | --- |
| Major | It plays like a new thing |
| Minor | A new mechanic or mode, or a new step in the journey: a screen players pass through, or a choice every player makes |
| Patch | Balance, art, copy and fixes on existing screens. Artwork is a patch however much there is, unless it arrives with a new step |

Each Linear milestone names its version, so spending a minor early renumbers
every milestone after it. Reach for a patch when the rule allows one.

## The README

- **A change a player can see updates the README in the same commit.**
  Internals don't count.
- `.githooks/commit-msg` refuses a commit that stages `index.html` without
  `README.md`, unless the message has a line such as
  `README: unchanged - a refactor, nothing a player sees`. Never use
  `--no-verify`.
- The README is a landing page: terse, tables, no time claims.

## Running and testing

- **Serve it** with the `snake` config in `.claude/launch.json`.
- **Running it means playing it,** with real key events, not calling
  internals.
- **A new feature ends with a play-test link,** given unasked, that opens the
  game ready to test it. `design/play.html` sets the state, then loads the
  game: `?best=110` sets the best score, and so the belt (Red). Give a second
  link for the moment that leads into it, such as one point short of the
  promotion that unlocks it. If the page can't set up what the feature needs,
  extend it.
- **Demo recordings are staged, not played.** Set the state, cue each beat
  and seed `Math.random`; the game still draws every frame. A bot that plays
  until the right moments happen to line up is slow and rarely gets the
  shot. The README gif comes
  from `design/demo/shoot.js`.
- **`design/` is gitignored** apart from its two specs, so on a fresh clone
  the play-test page and the demo script have to be written first.
- **`node test.js` needs Node 15+.** An older Node fails with a bare
  `SyntaxError`.

## Before a release

**Walk every journey end to end, with real input:**

- the title
- dojo select, on a first visit and on a return
- a run, mercy and defeat
- initials, Challenge a friend and rankings, then back again
- a challenge link opened on a phone

Use keyboard, mouse and touch, in both the stacked and the side-by-side
layout. Checking only the changed screen is how broken releases shipped.

When reporting ready, say which journeys were walked. **A journey that wasn't
walked** (usually the real iPad) **is raised before release,** not noted
after it.

## Keeping the session cheap

- **Screenshots cost ~5k tokens and are re-read every turn.** Take one only
  to judge looks, and use `scale`. To check that something works, read the
  page as text or assert it in `test.js`.
- **Every Linear write echoes the whole issue.** Compose once, save once. Use
  `list_issues` with `fields` to check a status.
- **Hand bulk, low-judgement reading to a cheaper subagent,** but only when
  it's bigger than a single command.
- **A fresh session is the biggest saving.**

## Gotchas

### Scores

- **There are two score databases.** Local, `file://` and private-network
  runs use the sandbox; only the published site writes to production
  (`serviceFor()`).
- **`db/scores.sql` is the schema.** Change it there first, then run it by
  hand in each project's SQL Editor.
- **Only a publishable key may appear in the page.** A test enforces it.
- **Free projects pause after a quiet week,** so `keep-scores-awake.yml`
  reads production daily. Run by hand, it defaults to the sandbox.
- **To check permissions without writing a row,** send an insert that breaks
  a `check` constraint. An allowed insert fails with `23514`, a forbidden one
  with `42501`. Updates and deletes should always return `42501`.
- **`localStorage` is per-origin,** so the best score doesn't follow the game
  across ports, machines or the published URL. That's expected.

### Testing in a browser

- **The Browser tool sends an empty key** for `space`, `Return` and `Down`.
  Use `Enter`, `ArrowDown`, `Escape`, `Tab` and letters. For space, dispatch
  `KeyboardEvent('keydown', {key: ' '})` at the document. If a key seems
  ignored, log `event.key` first.
- **The Browser pane's scaled viewport emulation misplaces clicks.** Use the
  keyboard, or test the mouse at desktop size.
- **A hidden Browser pane pauses animations and slows timers** (an app window
  off screen reports `visibilityState: hidden`). Walk journeys there only
  while it's visible; otherwise drive headless Chrome over CDP.
- **The iPad simulator is slower than one game step,** so swipes look broken.
  - Test on a temporary copy with `stepDelay()` at ~2500ms, writing `phase`,
    `direction`, `turnQueue` and `scrollY` into the version line.
  - `inspect` doesn't work on Safari content.
  - Rotating needs a person at the Mac.
  - A second URL adds a tab bar about 35pt tall, so measure tap positions
    again.

### Drawing and layout

- **The board is 21×21 cells at 30px.** `CELL` only changes how large it's
  drawn. The test harness's fake canvas must match: 630px, so 21 columns.
- **Drawing code was authored for a 20px cell.** Anything hand-drawn in
  canvas coordinates is multiplied by `CELL_SCALE`.
- **The board draws on the step only.** Every-frame drawing was reverted
  because it felt less responsive on the Intel Mac. Don't bring it back
  without a play test there.
- **Board art is drawn into the canvas,** so it has to reduce to a short list
  of `Path2D` strings with one flat fill each. The crest is a DOM SVG. See
  `design/ASSET-BRIEF.md` §7.
- **Detail under about 2px doesn't exist at cell size.** If removing a path
  improves how it reads, it was never detail.
- **The room above the score is load-bearing.** The `+N` popup rises 24px.
  Stacked, the crest's bottom margin is 68px; side by side, the stats have
  52px of `padding-top` under the crest. Both are fixed on purpose: measure
  both layouts after touching either.
