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
    style: {},
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
  get nextDirection() { return nextDirection }, set nextDirection(v) { nextDirection = v },
  get food()          { return food },          set food(v)          { food = v },
  get mouse()         { return mouse },         set mouse(v)         { mouse = v },
  get score()         { return score },         set score(v)         { score = v },
  get phase()         { return phase },         set phase(v)         { phase = v },
  COLS, ROWS, CELL, VERSION,
  APPLE_POINTS, MOUSE_POINTS, MOUSE_LIFE,
  START_DELAY, SPEED_UP, FASTEST,
  update, reset, isOccupied, stepDelay, mixColour, KEYS
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
  game.nextDirection = state.nextDirection || game.direction;
  game.food = state.food || {x: 15, y: 15};
  game.mouse = state.mouse === undefined ? null : state.mouse;
  game.score = state.score || 0;
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


describe('stepDelay - how fast the game runs', () => {
  test('opens at the starting pace', () => {
    freshGame({ score: 0 });
    is(game.stepDelay(), game.START_DELAY);
  });

  test('speeds up as the score climbs', () => {
    freshGame({ score: 10 });
    is(game.stepDelay(), game.START_DELAY - 10 * game.SPEED_UP);
  });

  test('never goes below the floor, however high the score', () => {
    freshGame({ score: 10000 });
    is(game.stepDelay(), game.FASTEST);
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

  test('the apple square is occupied', () => {
    freshGame({ food: {x: 12, y: 12} });
    is(game.isOccupied({x: 12, y: 12}), true);
  });

  test('the mouse square is occupied', () => {
    freshGame({ mouse: {x: 8, y: 2, life: 30, facing: 1} });
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

  test('eating an apple grows the snake by one', () => {
    freshGame({ food: {x: 6, y: 5} });
    const before = game.snake.length;
    game.update();
    is(game.snake.length, before + 1, 'length');
  });

  test('eating an apple scores a point', () => {
    freshGame({ food: {x: 6, y: 5} });
    game.update();
    is(game.score, game.APPLE_POINTS, 'score');
  });

  test('eating the mouse scores five and clears it', () => {
    freshGame({
      food: {x: 15, y: 15},
      mouse: {x: 6, y: 5, life: 30, facing: 1}
    });
    game.update();
    is(game.score, game.MOUSE_POINTS, 'score');
    is(game.mouse, null, 'mouse');
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


describe('the mouse countdown', () => {
  test('loses one life per move, not per second', () => {
    freshGame({ mouse: {x: 18, y: 18, life: 10, facing: 1} });
    game.update();
    is(game.mouse.life, 9, 'life');
  });

  test('leaves when its life runs out', () => {
    freshGame({ mouse: {x: 18, y: 18, life: 1, facing: 1} });
    game.update();
    is(game.mouse, null, 'mouse');
  });
});


describe('input', () => {
  test('a legal turn is accepted', () => {
    freshGame();                 // heading right
    pressKey('ArrowUp');
    is(game.nextDirection, {x: 0, y: -1}, 'nextDirection');
  });

  test('wasd works the same as the arrows', () => {
    freshGame();
    pressKey('w');
    is(game.nextDirection, {x: 0, y: -1}, 'nextDirection');
  });

  test('a straight U-turn is refused', () => {
    freshGame();                 // heading right
    pressKey('ArrowLeft');
    is(game.nextDirection, {x: 1, y: 0}, 'nextDirection');
  });

  test('turns are ignored unless the game is playing', () => {
    freshGame();
    game.phase = 'paused';
    pressKey('ArrowUp');
    is(game.nextDirection, {x: 1, y: 0}, 'nextDirection');
  });

  // ---- the real bug, see UNR-98 -------------------------------------
  // Two turns inside one step. Heading right, you press Up then Left to
  // round a corner. Both land before the next update().
  //
  // Up is stored. Left is then checked against `direction`, which is
  // still right, so it reads as a U-turn and gets thrown away - even
  // though by the time it would apply the snake is heading up, and left
  // would be a perfectly good turn.
  //
  // The snake misses the corner. It does NOT die: nothing here can ever
  // set a heading opposite to the current one, so a reversal is
  // impossible. The defect is a dropped input, not a death.
  //
  // This test documents what happens today. When the input queue lands,
  // flip it to expect {x:-1, y:0} and it becomes the test for the fix.
  test('a fast corner turn loses the second press (known defect)', () => {
    freshGame();                 // heading right
    pressKey('ArrowUp');
    pressKey('ArrowLeft');
    is(game.nextDirection, {x: 0, y: -1}, 'nextDirection');
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
