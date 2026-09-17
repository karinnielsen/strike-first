
// --- DEMO AUTOPILOT, scratch tooling only, never committed -----------
// Plays the game by dispatching REAL key events, so it goes through the
// game's own input handling rather than reaching past it. Whatever you
// see the demo do, a player could do.
(function () {
  const key = k => document.dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true }));

  const KEY_FOR = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft',
                    '0,1': 'ArrowDown',  '0,-1': 'ArrowUp' };

  // Shortest path to the target that does not run through the snake.
  // Plain breadth-first: the board is 21x21, there is nothing to optimise.
  function firstStepTowards(goal) {
    const head = snake[0];
    const blocked = new Set(snake.map(s => s.x + ',' + s.y));
    if (visitor && visitor.kind === 'rotten') {
      blocked.add(visitor.x + ',' + visitor.y);      // never eat that
    }
    const seen = new Set([head.x + ',' + head.y]);
    let frontier = [{ x: head.x, y: head.y, first: null }];

    while (frontier.length) {
      const next = [];
      for (const cell of frontier) {
        for (const d of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]) {
          const nx = cell.x + d.x, ny = cell.y + d.y, id = nx + ',' + ny;
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          if (seen.has(id) || blocked.has(id)) continue;
          const first = cell.first || d;
          if (nx === goal.x && ny === goal.y) return first;
          seen.add(id);
          next.push({ x: nx, y: ny, first });
        }
      }
      frontier = next;
    }
    return null;
  }

  // Nothing reachable: just survive. Any neighbour that is not a wall or
  // a body part will do.
  function anySafeStep() {
    const head = snake[0];
    const blocked = new Set(snake.map(s => s.x + ',' + s.y));
    for (const d of [direction, {x:-direction.y,y:direction.x},
                     {x:direction.y,y:-direction.x}]) {
      const nx = head.x + d.x, ny = head.y + d.y;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (blocked.has(nx + ',' + ny)) continue;
      return d;
    }
    return null;
  }

  // Between runs it plays Practice, through the menus like anyone would:
  // press start, down to Practice, choose; after a defeat, Practice again.
  // Practice posts nothing, so a demo never lands on the real board.
  setInterval(() => {
    if (titling) {
      if (!startPressed || titleMenu.items[titleMenu.at] === 'practice') key('Enter');
      else key('ArrowDown');
      return;
    }
    if (phase === 'over') { key('Enter'); return; }
    if (phase !== 'playing') return;

    // Chase the mouse when there is one - it is worth five times as much
    // and it expires. Otherwise the egg.
    const goal = (visitor && visitor.kind === 'mouse') ? visitor : egg;
    const step = firstStepTowards(goal) || anySafeStep();
    if (!step) return;

    const k = KEY_FOR[step.x + ',' + step.y];
    if (k) key(k);
  }, 70);
})();
