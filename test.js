// =====================================================================
//  Strike First - tests
// =====================================================================
// Run with:  node test.js
//
// No framework, no dependencies, no build step. Same rules as the game.
// About 60 lines of harness, then the tests themselves.
//
// WHY THIS FILE LOOKS ODD
//
// The game is one HTML file with one inline <script>. Nothing is exported,
// and every function reads the game's state straight out of variables that
// live alongside it. That is fine for a game you run in a browser, and it
// is exactly what makes it awkward to test: there is no seam to grab.
//
// So this harness makes one. It reads index.html, pulls the script out,
// bolts a few lines on the end that hand out references to the internals,
// and runs the whole thing in a fake browser.
//
// The lesson worth taking from that: this is the cost of logic that reads
// global state instead of taking arguments. A function like
//
//     function beltFor(score) { ... }
//
// needs none of this scaffolding, because you can just call it. The belt
// work and the input-buffering work are both about to add functions like
// that. Write them as functions that take what they need and return an
// answer, and testing them is free.
// =====================================================================

const fs = require('fs');
const vm = require('vm');
const path = require('path');


// ---- a fake browser, just enough of one -----------------------------
// Every DOM thing the game touches, stubbed to do nothing useful but not
// throw. The canvas context is a Proxy: any method the game calls that we
// haven't thought of comes back as a no-op instead of crashing.

function makeCanvasContext() {
  return new Proxy({}, {
    get: (store, key) => (key in store ? store[key] : () => {}),
    set: (store, key, value) => ((store[key] = value), true)
  });
}

function makeElement() {
  const el = {
    textContent: '',
    className: '',
    offsetWidth: 0,
    width: 420,          // 420 / CELL(20) = 21 columns, same as the real page
    height: 420,
    style: { setProperty() {}, removeProperty() {}, getPropertyValue: () => '' },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    appendChild() {},
    remove() {},
    addEventListener() {},
    getContext: () => makeCanvasContext()
  };
  el.parentElement = el;   // addScore() reaches for scoreEl.parentElement
  return el;
}

// Keydown handlers get captured rather than discarded, so the tests can
// fire fake key presses at the real input code.
const handlers = {};

const sandbox = {
  document: {
    getElementById: () => makeElement(),
    createElement: () => makeElement(),
    addEventListener: (type, fn) => { (handlers[type] ||= []).push(fn); }
  },
  localStorage: (() => {
    const store = new Map();
    return {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v))
    };
  })(),
  // The game ends by calling loop(), which re-arms itself with setTimeout.
  // Swallowing the timer stops it spinning forever inside the test run.
  setTimeout: () => 0,
  Math,
  Date,
  console
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;


// ---- load the game --------------------------------------------------

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) {
  console.error('Could not find the <script> block in index.html.');
  process.exit(1);
}

// The epilogue is the seam. `let` and `const` at the top level of a script
// don't land on the global object, so we can't reach them from outside.
// Appending this puts a hatch in the same scope as the declarations.
const epilogue = `
globalThis.game = {
  get snake()         { return snake },         set snake(v)         { snake = v },
  get direction()     { return direction },     set direction(v)     { direction = v },
  get turnQueue()     { return turnQueue },     set turnQueue(v)     { turnQueue = v },
  get egg()           { return egg },           set egg(v)           { egg = v },
  get visitor()       { return visitor },       set visitor(v)       { visitor = v },
  get grow()          { return grow },          set grow(v)          { grow = v },
  get queasy()        { return queasy },        set queasy(v)        { queasy = v },
  get score()         { return score },         set score(v)         { score = v },
  get phase()         { return phase },         set phase(v)         { phase = v },
  COLS, ROWS, CELL, VERSION,
  EGG_POINTS, MOUSE_POINTS, ROTTEN_POINTS, EGG_GROWTH, MOUSE_GROWTH,
  MOUSE_LIFE, ROTTEN_LIFE, WARNING_MOVES, QUEASY_MOVES,
  LEVELS, REACH_BUDGET, TURN_QUEUE_MAX,
  update, reset, isOccupied, stepDelay, mixColour, KEYS, addScore, queasiness,
  levelFor, reachableSquare,
  BELTS, beltFor, promotionFor,
  get best() { return best }, set best(v) { best = v }
};`;

vm.createContext(sandbox);
vm.runInContext(match[1] + epilogue, sandbox);
const game = sandbox.game;


// ---- the smallest test runner that is still worth having ------------

let passed = 0;
let failed = 0;
let group = '';

function describe(name, fn) { group = name; console.log('\n' + name); fn(); }

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  pass  ' + name);
  } catch (err) {
    failed++;
    console.log('  FAIL  ' + name);
    console.log('        ' + err.message);
  }
}

function is(actual, expected, what) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${what || 'value'}: expected ${e}, got ${a}`);
}

// Put the board in a known state. Every test starts from here, so no test
// can be affected by what another one did.
function freshGame(state = {}) {
  game.reset();
  game.phase = 'playing';
  game.snake = state.snake || [{x: 5, y: 5}, {x: 4, y: 5}, {x: 3, y: 5}];
  game.direction = state.direction || {x: 1, y: 0};
  game.turnQueue = state.turnQueue || [];
  game.egg = state.egg || {x: 15, y: 15};
  game.visitor = state.visitor === undefined ? null : state.visitor;
  game.score = state.score || 0;
  game.grow = 0;
}

function pressKey(key) {
  const event = { key, preventDefault() {} };
  for (const fn of handlers.keydown || []) fn(event);
}


// =====================================================================
//  Tests
// =====================================================================

describe('the grid', () => {
  test('is 21 squares across and down', () => {
    is(game.COLS, 21, 'columns');
    is(game.ROWS, 21, 'rows');
  });
});


describe('levels - how fast the game runs', () => {
  test('a fresh run opens on level 1', () => {
    freshGame({ score: 0 });
    is(game.levelFor(0), 1, 'level');
    is(game.stepDelay(), game.LEVELS[0].ms, 'ms per move');
  });

  test('the level climbs with the score', () => {
    is(game.levelFor(game.LEVELS[1].from), 2, 'at the level 2 threshold');
    is(game.levelFor(game.LEVELS[2].from), 3, 'at the level 3 threshold');
  });

  test('a score just short of a threshold stays on the level below', () => {
    is(game.levelFor(game.LEVELS[1].from - 1), 1, 'level');
  });

  test('every level is faster than the one before it', () => {
    for (let i = 1; i < game.LEVELS.length; i++) {
      is(game.LEVELS[i].ms < game.LEVELS[i - 1].ms, true,
         `level ${i + 1} faster than ${i}`);
      is(game.LEVELS[i].from > game.LEVELS[i - 1].from, true,
         `level ${i + 1} starts later than ${i}`);
    }
  });

  test('it caps at the last level however high the score goes', () => {
    const last = game.LEVELS.length;
    is(game.levelFor(100000), last, 'level');
    is(game.stepDelay.call(null), game.stepDelay(), 'stable');
    freshGame({ score: 100000 });
    is(game.stepDelay(), game.LEVELS[last - 1].ms, 'ms per move');
  });

  test('the opening pace is unhurried enough to read three foods', () => {
    is(game.LEVELS[0].ms >= 240, true, 'level 1 is at least 240ms');
  });
});


describe('mixColour - the fade along the tail', () => {
  test('t=0 gives the first colour', () => {
    is(game.mixColour([10, 20, 30], [200, 200, 200], 0), 'rgb(10,20,30)');
  });

  test('t=1 gives the second colour', () => {
    is(game.mixColour([10, 20, 30], [200, 200, 200], 1), 'rgb(200,200,200)');
  });

  test('halfway gives the midpoint', () => {
    is(game.mixColour([0, 0, 0], [100, 200, 50], 0.5), 'rgb(50,100,25)');
  });
});


describe('isOccupied - can something spawn here?', () => {
  test('a square under the snake is occupied', () => {
    freshGame();
    is(game.isOccupied({x: 4, y: 5}), true);
  });

  test('the egg square is occupied', () => {
    freshGame({ egg: {x: 12, y: 12} });
    is(game.isOccupied({x: 12, y: 12}), true);
  });

  test('the visitor square is occupied', () => {
    freshGame({ visitor: {kind: 'mouse', x: 8, y: 2, life: 30, facing: 1} });
    is(game.isOccupied({x: 8, y: 2}), true);
  });

  test('an empty square is free', () => {
    freshGame();
    is(game.isOccupied({x: 19, y: 1}), false);
  });
});


describe('update - moving one step', () => {
  test('the head advances one square in the current direction', () => {
    freshGame();
    game.update();
    is(game.snake[0], {x: 6, y: 5}, 'head');
  });

  test('the snake stays the same length when it eats nothing', () => {
    freshGame();
    const before = game.snake.length;
    game.update();
    is(game.snake.length, before, 'length');
  });

  test('eating an egg grows the snake by one', () => {
    freshGame({ egg: {x: 6, y: 5} });
    const before = game.snake.length;
    game.update();
    is(game.snake.length, before + 1, 'length');
  });

  test('eating an egg scores a point', () => {
    freshGame({ egg: {x: 6, y: 5} });
    game.update();
    is(game.score, game.EGG_POINTS, 'score');
  });

  test('eating a mouse scores five and clears the slot', () => {
    freshGame({ visitor: {kind: 'mouse', x: 6, y: 5, life: 30, facing: 1} });
    game.update();
    is(game.score, game.MOUSE_POINTS, 'score');
    is(game.visitor, null, 'visitor');
  });
});


describe('update - dying', () => {
  test('running into the right wall ends the game', () => {
    freshGame({ snake: [{x: 20, y: 10}, {x: 19, y: 10}] });
    game.update();
    is(game.phase, 'over', 'phase');
  });

  test('running into the top wall ends the game', () => {
    freshGame({
      snake: [{x: 10, y: 0}, {x: 10, y: 1}],
      direction: {x: 0, y: -1}
    });
    game.update();
    is(game.phase, 'over', 'phase');
  });

  test('running into your own body ends the game', () => {
    freshGame({
      snake: [{x: 5, y: 5}, {x: 6, y: 5}, {x: 6, y: 6}, {x: 5, y: 6}]
    });
    game.update();   // heading right, straight into the second segment
    is(game.phase, 'over', 'phase');
  });
});


describe('the visitor countdown', () => {
  test('loses one life per move, not per second', () => {
    freshGame({ visitor: {kind: 'mouse', x: 18, y: 18, life: 10, facing: 1} });
    game.update();
    is(game.visitor.life, 9, 'life');
  });

  test('leaves when its life runs out', () => {
    freshGame({ visitor: {kind: 'mouse', x: 18, y: 18, life: 1, facing: 1} });
    game.update();
    is(game.visitor, null, 'visitor');
  });

  test('a rotten egg goes off too', () => {
    freshGame({ visitor: {kind: 'rotten', x: 18, y: 18, life: 1, facing: 1} });
    game.update();
    is(game.visitor, null, 'visitor');
  });
});


describe('where visitors appear', () => {
  test('never further away than the snake could get in time', () => {
    freshGame();
    for (let i = 0; i < 300; i++) {
      const spot = game.reachableSquare(game.MOUSE_LIFE);
      const head = game.snake[0];
      const steps = Math.abs(spot.x - head.x) + Math.abs(spot.y - head.y);
      is(steps <= Math.floor(game.MOUSE_LIFE * game.REACH_BUDGET), true,
         'within reach');
    }
  });

  test('a spawned visitor is always reachable and always has a life', () => {
    freshGame({ egg: {x: 6, y: 5} });
    for (let i = 0; i < 120; i++) {
      if (game.phase !== 'playing') break;
      if (game.visitor) {
        const head = game.snake[0];
        const steps = Math.abs(game.visitor.x - head.x)
                    + Math.abs(game.visitor.y - head.y);
        const life = game.visitor.kind === 'mouse' ? game.MOUSE_LIFE : game.ROTTEN_LIFE;
        is(steps <= life, true, 'reachable within its whole life');
        is(game.visitor.life > 0, true, 'alive');
      }
      game.update();
    }
  });
});


describe('the food roster', () => {
  test('a mouse costs you more length than an egg', () => {
    is(game.MOUSE_GROWTH > game.EGG_GROWTH, true, 'mouse grows you more');
  });

  test('eating a mouse lengthens the snake over two steps, not one', () => {
    freshGame({ visitor: {kind: 'mouse', x: 6, y: 5, life: 30, facing: 1} });
    const before = game.snake.length;
    game.update();                       // eats it
    is(game.snake.length, before + 1, 'after the first step');
    game.update();
    is(game.snake.length, before + game.MOUSE_GROWTH, 'after the second');
  });

  test('a rotten egg takes points off', () => {
    freshGame({
      score: 10,
      visitor: {kind: 'rotten', x: 6, y: 5, life: 30, facing: 1}
    });
    game.update();
    is(game.score, 10 + game.ROTTEN_POINTS, 'score');
  });

  test('a rotten egg is worth negative points, so the popup goes red', () => {
    is(game.ROTTEN_POINTS < 0, true, 'rotten is a loss');
  });

  test('a rotten egg does NOT change your length', () => {
    freshGame({ visitor: {kind: 'rotten', x: 6, y: 5, life: 30, facing: 1} });
    const before = game.snake.length;
    game.update();
    game.update();
    is(game.snake.length, before, 'length');
  });

  test('a rotten egg turns the snake green for a while', () => {
    freshGame({ visitor: {kind: 'rotten', x: 6, y: 5, life: 30, facing: 1} });
    is(game.queasy, 0, 'not queasy to begin with');
    game.update();
    is(game.queasy, game.QUEASY_MOVES, 'queasy straight after');
    is(game.queasiness(), 1, 'fully green');
  });

  test('being green wears off over your moves, not over seconds', () => {
    freshGame({ visitor: {kind: 'rotten', x: 6, y: 5, life: 30, facing: 1} });
    game.update();                                  // eats it
    for (let i = 0; i < game.QUEASY_MOVES; i++) game.update();
    is(game.queasy, 0, 'recovered');
    is(game.queasiness(), 0, 'back to normal');
  });

  test('a mouse does not make the snake ill', () => {
    freshGame({ visitor: {kind: 'mouse', x: 6, y: 5, life: 30, facing: 1} });
    game.update();
    is(game.queasy, 0, 'queasy');
  });

  test('the score never goes below zero', () => {
    freshGame({
      score: 1,
      visitor: {kind: 'rotten', x: 6, y: 5, life: 30, facing: 1}
    });
    game.update();
    is(game.score, 0, 'score');
  });

  test('eating an egg clears the slot for a new one somewhere else', () => {
    freshGame({ egg: {x: 6, y: 5} });
    game.update();
    is(game.egg.x === 6 && game.egg.y === 5, false, 'egg moved');
  });

  test('there is only one visitor slot, so never three things at once', () => {
    freshGame({ egg: {x: 6, y: 5} });
    for (let i = 0; i < 200; i++) game.update();
    const things = 1 + (game.visitor ? 1 : 0);
    is(things <= 2, true, 'at most two things on the board');
  });

  test('nothing is ever placed on top of the snake', () => {
    freshGame({ egg: {x: 6, y: 5} });
    for (let i = 0; i < 60; i++) {
      if (game.phase !== 'playing') break;
      const onSnake = (t) => !!t && game.snake.some(p => p.x === t.x && p.y === t.y);
      is(onSnake(game.egg), false, 'egg clear of the snake');
      is(onSnake(game.visitor), false, 'visitor clear of the snake');
      game.update();
    }
  });
});


describe('input', () => {
  test('a legal turn is queued', () => {
    freshGame();                 // heading right
    pressKey('ArrowUp');
    is(game.turnQueue, [{x: 0, y: -1}], 'queue');
  });

  test('wasd works the same as the arrows', () => {
    freshGame();
    pressKey('w');
    is(game.turnQueue, [{x: 0, y: -1}], 'queue');
  });

  test('a straight U-turn is refused', () => {
    freshGame();                 // heading right
    pressKey('ArrowLeft');
    is(game.turnQueue, [], 'queue');
  });

  test('turns are ignored unless the game is playing', () => {
    freshGame();
    game.phase = 'paused';
    pressKey('ArrowUp');
    is(game.turnQueue, [], 'queue');
  });

  // ---- the fix, see UNR-98 ------------------------------------------
  // Heading right, you press up then left to round a corner. Both land
  // inside one step. Left used to be checked against the CURRENT
  // direction, still right, so it read as a U-turn and was thrown away.
  // Now it's checked against the up that's already queued, so it stands.
  test('a fast corner turn keeps both presses', () => {
    freshGame();                 // heading right
    pressKey('ArrowUp');
    pressKey('ArrowLeft');
    is(game.turnQueue, [{x: 0, y: -1}, {x: -1, y: 0}], 'queue');
  });

  test('and the snake actually rounds the corner', () => {
    freshGame({ snake: [{x: 5, y: 5}, {x: 4, y: 5}, {x: 3, y: 5}] });
    pressKey('ArrowUp');
    pressKey('ArrowLeft');
    game.update();
    is(game.snake[0], {x: 5, y: 4}, 'after the first step, up');
    game.update();
    is(game.snake[0], {x: 4, y: 4}, 'after the second step, left');
  });

  test('holding a key does not fill the queue', () => {
    freshGame();                 // heading right
    pressKey('ArrowRight');
    pressKey('ArrowRight');
    pressKey('ArrowRight');
    is(game.turnQueue, [], 'queue');
  });

  test('the queue is capped', () => {
    freshGame();                 // heading right
    pressKey('ArrowUp');         // queued
    pressKey('ArrowLeft');       // queued, now full
    pressKey('ArrowDown');       // would fit the rules, but there's no room
    is(game.turnQueue.length, game.TURN_QUEUE_MAX, 'queue length');
  });

  test('a queued turn still cannot reverse the snake', () => {
    freshGame();                 // heading right
    pressKey('ArrowUp');         // queued
    pressKey('ArrowDown');       // opposite the queued up, so refused
    is(game.turnQueue, [{x: 0, y: -1}], 'queue');
  });

  test('a turn queued before the step is consumed by it', () => {
    freshGame();
    pressKey('ArrowUp');
    game.update();
    is(game.turnQueue, [], 'queue');
    is(game.direction, {x: 0, y: -1}, 'direction');
  });
});


describe('belts', () => {
  test('a new player starts at white', () => {
    is(game.beltFor(0), 1, 'rank');
    is(game.BELTS[0].name, 'White', 'name');
  });

  test('every threshold promotes exactly at its own number', () => {
    for (let i = 0; i < game.BELTS.length; i++) {
      is(game.beltFor(game.BELTS[i].from), i + 1, game.BELTS[i].name);
    }
  });

  test('one point short of a threshold is still the belt below', () => {
    for (let i = 1; i < game.BELTS.length; i++) {
      is(game.beltFor(game.BELTS[i].from - 1), i, 'below ' + game.BELTS[i].name);
    }
  });

  test('the ladder is ordered, so every belt is reachable', () => {
    const ascending = game.BELTS.every(
      (belt, i) => i === 0 || belt.from > game.BELTS[i - 1].from
    );
    is(ascending, true, 'thresholds ascend');
  });

  test('the top belt caps - nothing outranks midnight blue', () => {
    const top = game.BELTS.length;
    is(game.beltFor(100000), top, 'rank');
    is(game.BELTS[top - 1].name, 'Midnight blue', 'name');
  });

  test('every belt has a distinct colour', () => {
    const seen = new Set(game.BELTS.map(b => b.colour));
    is(seen.size, game.BELTS.length, 'distinct colours');
  });
});


describe('promotion', () => {
  test('crossing a threshold on a personal best earns the belt', () => {
    const belt = game.promotionFor(14, 15);
    is(belt && belt.name, 'Orange', 'name');
  });

  test('a personal best that crosses nothing promotes nobody', () => {
    is(game.promotionFor(15, 16), null, 'promotion');
  });

  // The rule that keeps rank honest. Matching your record is not beating
  // it, so it cannot promote you however high the number is.
  test('equalling your best is not a promotion', () => {
    is(game.promotionFor(15, 15), null, 'promotion');
  });

  test('a worse run never promotes, even from a low best', () => {
    is(game.promotionFor(100, 20), null, 'promotion');
  });

  test('a breakthrough skips ranks and awards the highest reached', () => {
    const belt = game.promotionFor(0, 300);
    is(belt.name, 'Midnight blue', 'name');
  });

  test('a first run past the first threshold promotes off white', () => {
    const belt = game.promotionFor(0, 15);
    is(belt.name, 'Orange', 'name');
  });
});


describe('rank comes from best, not the current run', () => {
  test('a huge run does not change rank until it becomes your best', () => {
    game.best = 0;
    is(game.beltFor(game.best), 1, 'still white mid-run');

    // Whatever the run scores, rank is a function of `best` alone.
    game.score = 200;
    is(game.beltFor(game.best), 1, 'unchanged by the live score');
  });
});


describe('version', () => {
  test('matches the changelog', () => {
    const changelog = fs.readFileSync(path.join(__dirname, 'CHANGELOG.md'), 'utf8');
    const latest = changelog.match(/## \[(\d+\.\d+\.\d+)\]/);
    is(game.VERSION, latest && latest[1], 'version');
  });
});


// ---- report ---------------------------------------------------------

console.log('\n' + '-'.repeat(40));
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
