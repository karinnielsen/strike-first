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
    width: 630,          // 630 / CELL(30) = 21 columns, same as the real page
    height: 630,
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

// The game asks whether the player wants reduced motion. In here they
// don't, so anything that moves is exercised by the tests rather than
// skipped. queasyShake is pure and gets tested directly either way.
sandbox.matchMedia = () => ({ matches: false, addEventListener() {} });

// The sprites are built as Path2D at load. Node has no such thing, and the
// canvas context here is a no-op Proxy anyway, so this just has to hold the
// path string without throwing. It also lets the tests assert that every
// sprite path is a real string rather than undefined.
sandbox.Path2D = class Path2D {
  constructor(d) { this.d = d; }
};


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
  BONE_BODY, DUSTY_TAIL, SICK_GREEN, blend, bodyColour, BELT_SEGMENT,
  QUEASY_SHAKE, queasyShake,
  DEFEAT_LINES, defeatLine,
  SPRITE, SPRITE_SIZE, drawSprite,
  get bestAtStart() { return bestAtStart }, set bestAtStart(v) { bestAtStart = v },
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


describe('rank moves mid-run', () => {
  // The point of the whole promotion moment: you find out while you are
  // still playing, not afterwards on the defeat screen.
  test('beating your best raises it on the spot', () => {
    game.best = 14; game.score = 14;
    game.addScore(1, 'egg');
    is(game.best, 15, 'best');
  });

  test('and the rank you wear follows immediately', () => {
    game.best = 14; game.score = 14;
    is(game.beltFor(game.best), 1, 'white before');
    game.addScore(1, 'egg');
    is(game.beltFor(game.best), 2, 'orange after');
  });

  test('a run below your best leaves your rank alone', () => {
    game.best = 50; game.score = 5;
    game.addScore(1, 'egg');
    is(game.best, 50, 'best');
    is(game.beltFor(game.best), 3, 'still green');
  });

  test('losing points cannot demote you', () => {
    game.best = 40; game.score = 40;
    game.addScore(-3, 'rotten');
    is(game.best, 40, 'best');
    is(game.beltFor(game.best), 3, 'rank');
  });
});


// 'rgb(1,2,3)' back into [1, 2, 3], so the colour rules can be asserted.
function channelsOf(colour) {
  return colour.match(/\d+/g).map(Number);
}


describe('the unwell snake', () => {
  test('a well snake is bone at the shoulders', () => {
    is(game.bodyColour(0, 0), 'rgb(' + game.BONE_BODY.join(',') + ')', 'colour');
  });

  test('a well snake is dusty at the tip', () => {
    is(game.bodyColour(1, 0), 'rgb(' + game.DUSTY_TAIL.join(',') + ')', 'colour');
  });

  // The rule the whole issue exists for. Being unwell borrows NOTHING
  // from the palette, so it cannot collide with a belt now or with
  // whatever claims a colour next. The old version tinted the snake
  // green, green is the third belt, and a green-belt player got no
  // signal at all.
  // Being unwell is a big, obvious change to the body - which is the
  // thing the ash version and the too-timid shiver both failed at.
  test('being unwell visibly changes the body', () => {
    const well = channelsOf(game.bodyColour(0, 0));
    const sick = channelsOf(game.bodyColour(0, 1));
    const shift = Math.max(...well.map((c, i) => Math.abs(c - sick[i])));
    is(shift > 60, true, 'unmistakable (largest channel shift ' + shift + ')');
  });

  // Rank lives on the band, so the body's baseline is bone at EVERY rank.
  // That is what makes a green tint legible whatever belt you hold, and
  // it is why the original collision no longer applies.
  test('the body starts from bone regardless of rank', () => {
    is(game.bodyColour(0, 0), 'rgb(' + game.BONE_BODY.join(',') + ')', 'shoulders');
    is(game.bodyColour(1, 0), 'rgb(' + game.DUSTY_TAIL.join(',') + ')', 'tip');
  });

  test('a well snake is perfectly still', () => {
    const shake = game.queasyShake(0, 1000);
    is(shake.x, 0, 'x');
    is(shake.y, 0, 'y');
  });

  test('a queasy snake shivers', () => {
    // Sampled across a stretch of time, because any single instant can
    // legitimately be the moment the wobble passes through zero.
    let moved = false;
    for (let now = 0; now < 400; now += 7) {
      const shake = game.queasyShake(1, now);
      if (Math.abs(shake.x) > 0.2 || Math.abs(shake.y) > 0.2) moved = true;
    }
    is(moved, true, 'moved');
  });

  test('the shiver never leaves the square the head is actually in', () => {
    let worst = 0;
    for (let now = 0; now < 2000; now += 3) {
      const shake = game.queasyShake(1, now);
      worst = Math.max(worst, Math.abs(shake.x), Math.abs(shake.y));
    }
    is(worst <= game.QUEASY_SHAKE, true, 'within amplitude');
    is(worst < game.CELL / 2, true, 'stays inside its own cell');
  });

  test('the shiver fades as the queasiness wears off', () => {
    const strong = Math.abs(game.queasyShake(1.0, 90).x);
    const weak   = Math.abs(game.queasyShake(0.2, 90).x);
    is(weak < strong, true, 'fades');
  });

  // Rank and condition live on different surfaces, so one cannot erase
  // the other. Being sick has never cost anybody their belt.
  test('the belt band is not a body segment, so it never drains', () => {
    is(game.BELT_SEGMENT > 0, true, 'the band is never the head');
  });
});


describe('defeat lines', () => {
  test('a wall death gets a wall line', () => {
    const line = game.defeatLine('wall', 20, false, 0);
    is(game.DEFEAT_LINES.wall.includes(line), true, 'from the wall pool');
  });

  test('eating yourself gets a self line', () => {
    const line = game.defeatLine('self', 20, false, 0);
    is(game.DEFEAT_LINES.self.includes(line), true, 'from the self pool');
  });

  test('scoring nothing gets its own line, whatever killed you', () => {
    for (const cause of ['wall', 'self']) {
      const line = game.defeatLine(cause, 0, false, 0);
      is(game.DEFEAT_LINES.nothing.includes(line), true, 'from the nothing pool');
    }
  });

  // Never sneer at somebody's best ever run.
  test('a new record outranks how you died', () => {
    for (const cause of ['wall', 'self']) {
      const line = game.defeatLine(cause, 90, true, 0);
      is(game.DEFEAT_LINES.record.includes(line), true, 'from the record pool');
    }
  });

  test('every roll from 0 up to 1 lands on a real line', () => {
    let bad = null;
    for (let roll = 0; roll < 1; roll += 0.001) {
      const line = game.defeatLine('wall', 20, false, roll);
      if (!game.DEFEAT_LINES.wall.includes(line)) bad = roll;
    }
    is(bad, null, 'no roll fell off the end');
  });

  test('a roll of exactly 1 is still safe', () => {
    const line = game.defeatLine('wall', 20, false, 1);
    is(game.DEFEAT_LINES.wall.includes(line), true, 'in the pool');
  });

  test('an unknown cause still returns a line rather than nothing', () => {
    is(typeof game.defeatLine(undefined, 20, false, 0.5), 'string', 'type');
  });

  test('the whole pool is reachable, so no line is dead copy', () => {
    for (const pool of Object.values(game.DEFEAT_LINES)) {
      const seen = new Set();
      for (let roll = 0; roll < 1; roll += 0.001) {
        seen.add(pool[Math.min(pool.length - 1, Math.floor(roll * pool.length))]);
      }
      is(seen.size, pool.length, 'all ' + pool.length + ' reachable');
    }
  });

  // The house style, asserted rather than trusted. See design/MICROCOPY.md.
  test('every line obeys the dojo voice', () => {
    const all = Object.values(game.DEFEAT_LINES).flat();
    const contracted = all.filter(l => /\w'\w/.test(l));
    const shouting   = all.filter(l => l.includes('!'));
    const unpunctued = all.filter(l => !l.endsWith('.'));
    const rambling   = all.filter(l => l.split(/\s+/).length > 9);
    is(contracted.length, 0, 'no contractions: ' + contracted.join(' / '));
    is(shouting.length,   0, 'no exclamation marks: ' + shouting.join(' / '));
    is(unpunctued.length, 0, 'all end in a full stop: ' + unpunctued.join(' / '));
    is(rambling.length,   0, 'none over nine words: ' + rambling.join(' / '));
  });
});


describe('sprites', () => {
  test('every sprite layer has a fill and real path data', () => {
    let bad = [];
    for (const [name, layers] of Object.entries(game.SPRITE)) {
      layers.forEach((l, i) => {
        if (typeof l.d !== 'string' || l.d.length < 10) bad.push(name + '[' + i + '] d');
        if (!/^(#|rgba?\()/.test(l.fill))              bad.push(name + '[' + i + '] fill');
        if (!l.path)                                    bad.push(name + '[' + i + '] Path2D');
      });
    }
    is(bad.join(', '), '', 'malformed layers');
  });

  // Built once at load, not per frame. These are painted sixty times a
  // second and reparsing a path string that often is pure waste.
  test('paths are built once, not rebuilt on every draw', () => {
    const before = game.SPRITE.egg[0].path;
    game.drawSprite('egg', 10, 10, 1);
    is(game.SPRITE.egg[0].path === before, true, 'same Path2D object');
  });

  // The rule the delivered mouse broke: at 20px a shape gets a silhouette
  // and about one internal detail. Ten paths read worse than five.
  // The hazard must be the biggest thing on the board. The tilt
  // foreshortens it, so at matching numbers it reads as the SMALLER of
  // the two, which is backwards for the thing you are meant to avoid.
  test('the rotten egg is drawn larger than the good one', () => {
    const egg    = 12.8 * game.SPRITE_SIZE.egg.scale;
    const rotten = 13.6 * game.SPRITE_SIZE.rottenEgg.scale;
    is(rotten > egg, true, 'rotten ' + rotten.toFixed(1) + ' vs egg ' + egg.toFixed(1));
  });

  // A reward you cannot read is not a reward. These should carry about
  // the weight of a snake segment, which is 18px.
  test('every food is drawn at a legible size', () => {
    const heights = {
      egg:       12.8 * game.SPRITE_SIZE.egg.scale,
      rottenEgg: 13.6 * game.SPRITE_SIZE.rottenEgg.scale,
      mouse:     14.8 * game.SPRITE_SIZE.mouse.scale
    };
    const small = Object.entries(heights).filter(([, h]) => h < 15);
    is(small.length, 0, 'too small: ' + JSON.stringify(small));
  });

  test('the mouse keeps only the paths that survive cell size', () => {
    is(game.SPRITE.mouse.length, 5, 'mouse paths');
  });

  // The regression that mattered. The snake is bone and it is most of what
  // moves on the board, so the baseline food must never share its colour.
  test('the egg is never the same colour as the snake', () => {
    const eggFill = game.SPRITE.egg[0].fill.toLowerCase();
    const bone    = 'rgb(' + game.BONE_BODY.join(',') + ')';
    is(eggFill === '#e8e2d6', false, 'egg is not bone');
    is(game.bodyColour(0, 0) === eggFill, false, 'egg differs from the body');
    is(eggFill, '#f4e8cf', 'the warm shell');
  });
});


// Four things move together, always: the VERSION constant, the CHANGELOG,
// the README's Current version line, and an annotated tag. Three of those
// are files, so three of them can be checked here.
//
// The tag deliberately is not. VERSION is bumped in the commit BEFORE the
// tag exists, so asserting it would fail every time in exactly the window
// where you are trying to cut a release.
//
// The README line is the reason this group exists at all: it said v0.1.0
// until 12 September, through two releases that changed it, while the
// other three never drifted once.
describe('version', () => {
  test('matches the changelog', () => {
    const changelog = fs.readFileSync(path.join(__dirname, 'CHANGELOG.md'), 'utf8');
    const latest = changelog.match(/## \[(\d+\.\d+\.\d+)\]/);
    is(game.VERSION, latest && latest[1], 'version');
  });

  test('matches the README', () => {
    const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
    const stated = readme.match(/Current version: \*\*v(\d+\.\d+\.\d+)\*\*/);
    is(game.VERSION, stated && stated[1], 'version');
  });
});


// ---- report ---------------------------------------------------------

console.log('\n' + '-'.repeat(40));
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
