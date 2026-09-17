# Demo and comparison tooling

Scratch tooling for **looking at the game without playing it**, and for putting
two versions side by side. Both exist because judging how something looks is
the half of this project that specification cannot settle — see the A/B
comparison note in the project's working agreements.

Nothing here is shipped. `index.html` never imports it.

## autopilot.js

Plays the game by itself. Append it inside the game's own `<script>` and it
drives with **real key events**, through the game's own input handling — so
anything the demo does, a player could do. It chases the mouse when one is on
the board (worth five times an egg, and it expires), otherwise the egg, avoids
the rotten egg entirely, and plays Practice through the menus: press start,
Practice, and Practice again after every defeat. Practice posts nothing, so a
demo never reaches the real leaderboard.

Breadth-first pathfinding on a 21×21 grid. There is nothing to optimise.

## Building a demo copy

```bash
python3 - <<'PY'
auto = open('design/demo/autopilot.js').read()
h = open('index.html').read()
open('/tmp/demo.html','w').write(h.replace('</script>', auto + '\n</script>', 1))
PY
python3 -m http.server 8791 --directory /tmp
```

Then open <http://localhost:8791/demo.html>.

## Building a side-by-side comparison

Make one demo copy per version — usually one per git branch — put them in
iframes next to each other, and **do not scale them to fit**. Two versions
that differ in size are not comparable once you have shrunk them both to the
same width; let the row scroll instead.

Three things learned from doing this:

* **Judge at actual size first.** Magnified views flatter detail that
  dissolves at real size, and real size is the only size that ships.
* **Change one variable.** Comparing artwork *and* cell size at once tells you
  nothing about either.
* **Let it play itself.** Gameplay is a distraction when the question is how
  something looks.

## Freezing the board to inspect one thing

Set `phase = 'ready'` and call `draw()`. Update stops, drawing continues, and
the board holds still while you place whatever you want to look at:

```js
phase = 'ready';
snake = [{x:3,y:14},{x:2,y:14},{x:1,y:14}];
direction = {x:1, y:0};
egg = {x:4, y:7};
visitor = {kind:'rotten', x:9, y:7, life:999, facing:1};
document.getElementById('overlay').classList.add('hidden');
draw();
```
