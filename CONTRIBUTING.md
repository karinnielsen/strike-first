# Contributing

Thanks for helping. Start with an
[open starter issue](https://github.com/karinnielsen/strike-first/labels/good%20first%20issue).

## Setup

No build step and nothing to install.

```bash
git config core.hooksPath .githooks   # once per clone
python3 -m http.server 8765           # then open http://localhost:8765/
node test.js                          # Node 15+
```

Scores you make locally go to a **sandbox** database, never the live board.
The version line says `sandbox scores` when that's the case.

## Where things are

| Path | What |
| --- | --- |
| `index.html` | The whole game, in one file with numbered, commented sections |
| `test.js` | Tests. They load the script from `index.html` and run it against a fake browser |
| `db/scores.sql` | Database schema and access rules |
| `design/` | Specs: the copy rules (`MICROCOPY.md`) and the art constraints (`ASSET-BRIEF.md`) |

## Rules of the code

- **Balance lives in named constants** in section 2. Tune those; don't scatter numbers.
- **Count moves, not seconds.** Anything that expires uses the player's moves.
- **`update()` decides, `draw()` shows.** Never mix them.
- **New logic arrives as pure functions** with a test in `test.js`.
- **The stylesheet is global.** Search `<style>` before naming a new class.
- **Stick to Snake's rules** unless you can argue for changing them.

## Pull requests

- One change per PR, against `main`.
- `node test.js` passes. CI runs it on every PR.
- The commit message says *why*, not only what.
- A change players can see updates `README.md` in the same commit. The
  commit hook and CI both check this. If the README really doesn't need to
  change, add a line such as
  `README: unchanged - a refactor, nothing a player sees`.
  Don't use `--no-verify`.
- Don't bump the version. That happens at release.
