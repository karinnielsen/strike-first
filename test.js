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
    width: 658,          // (658 - 2 * BOARD_BLEED(14)) / CELL(30) = 21 columns, same as the real page
    height: 658,
    style: { setProperty() {}, removeProperty() {}, getPropertyValue: () => '' },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    appendChild() {},
    setAttribute() {},
    remove() {},
    addEventListener() {},
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    dataset: {},
    focus() {},
    blur() {},
    append() {},
    replaceChildren() {},
    insertRow: () => makeElement(),
    createTHead: () => makeElement(),
    createTBody: () => makeElement(),
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
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
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
  clearTimeout: () => {},
  // Kept, not run, so a test can tick dojo select's clock by hand.
  setInterval: (fn) => { sandbox.lastInterval = fn; return 0; },
  clearInterval: () => {},
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  performance: { now: () => 0 },
  // The tests run as if served from your own machine, which is what they
  // are: that means the sandbox database, never the real board.
  location: { hostname: 'localhost', href: 'http://localhost:8765/' },
  // The window, a laptop's worth, for the code that sizes dojo select.
  innerWidth: 1280,
  innerHeight: 800,
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
  ROTTEN_LIFE, WARNING_MOVES, QUEASY_MOVES, ROTTEN_EXIT_MOVES,
  LEVELS, TURN_QUEUE_MAX, SWIPE_MIN, swipeDirection, queueTurn,
  update, reset, isOccupied, stepDelay, mixColour, KEYS, addScore, queasiness,
  levelFor,
  MOUSE_CRAMP, MOUSE_NEAR, MOUSE_FAR, MOUSE_SLACK, MOUSE_FLOOR, MOUSE_TWITCH,
  openSides, mouseSquare, mouseClock, mouseIdle, spawn, visitorShows, routeMoves,
  FROG_POINTS, FROG_GROWTH, FROG_BELT, FROG_SHARE, FROG_HOP, FROG_BREATH, FROG_BREATH_DEPTH,
  PREY, UNLOCKS, frogsCome, frogSquare, frogHopTo, frogBreath, promote,
  FROG_SLACK, FROG_FLOOR, frogClock,
  TONGUE_GAP_MIN, TONGUE_GAP_MAX, nextFlickIn,
  SCORE_SERVICES, SCORE_TARGET, serviceFor, BEFORE_LAUNCH,
  get tongueOut() { return tongueOut }, set tongueOut(v) { tongueOut = v },
  get flickAt() { return flickAt }, set flickAt(v) { flickAt = v },
  ROTTEN_COOLDOWN, BELT_STRETCH, ROTTEN_GAP, beltStretch, routeSquares, besideSquares,
  rottenSquare, maybeSpawnVisitor, VISITOR_CHANCE, ROTTEN_SHARE,
  get sinceRotten() { return sinceRotten }, set sinceRotten(v) { sinceRotten = v },
  get guardedBelts() { return guardedBelts }, set guardedBelts(v) { guardedBelts = v },
  BELTS, beltFor, promotionFor,
  BONE_BODY, DUSTY_TAIL, SICK_GREEN, blend, bodyColour, BELT_SEGMENT,
  QUEASY_SHAKE, queasyShake,
  TONGUE_DOUBLE, TONGUE_PAUSE_MIN, TONGUE_PAUSE_MAX, tongueFlickPlan,
  TONGUE_FLICK_MS, TONGUE_POSES, tonguePoseAt, tonguePose, CREST_LEAN_MAX, crestLean,
  DEFEAT_LINES, defeatLine, defeatPool, fillLine, showVerdict,
  BOW_MS, bowPose, bowElapsed,
  DEFEAT_MS, DEFEAT_HOLD_MS, defeatRecoil, defeatDrain, defeatJolt, defeatBow, canRestart,
  get defeat() { return defeat },
  get mode() { return mode }, set mode(v) { mode = v },
  menuStep, showOverlay, titleMenu, mercyMenu, signMenu, verdictMenu, forfeit, toTitle, playPractice,
  get startPressed() { return startPressed },
  SPRITE, SPRITE_SIZE, drawSprite,
  SOUNDS, startGame, toggleSound, setAudioMode, storedAudioMode, musicFor,
  AUDIO_MODES, AUDIO_KEY, MUSIC_TRACKS, soundBtn, soundTipEl,
  get audioMode() { return audioMode }, set audioMode(v) { audioMode = v },
  get musicOn() { return musicOn }, set musicOn(v) { musicOn = v },
  get muted() { return muted }, set muted(v) { muted = v },
  get audioCtx() { return audioCtx }, set audioCtx(v) { audioCtx = v },
  get bestAtStart() { return bestAtStart }, set bestAtStart(v) { bestAtStart = v },
  get best() { return best }, set best(v) { best = v },
  get moves() { return moves }, set moves(v) { moves = v },
  get runMs() { return runMs }, set runMs(v) { runMs = v },
  get pausedMs() { return pausedMs }, toggleMercy, gameOver, loop,
  POINTS_PER_MOVE, POINTS_PER_SQUARE, TIMING_SLACK, TIMING_SLACK_MS, fastestRun, plausibleRun,
  SCORE_SERVICE, DOJO_IDS, runDuration, scoreRecord, runRecord, scoreRequest, submitScore,
  wantsInitials, cleanInitials, BLOCKED_INITIALS, signInitials, hideInitials,
  currentDojo, commitDojo, dojoOrNull, DOJO_KEY, DOJO_BESTS_KEY, seedDojoBests, dojoBest,
  get dojoBestAtStart() { return dojoBestAtStart },
  get dojoBests() { return dojoBests }, set dojoBests(v) { dojoBests = v }, DOJO_SECONDS, DOJO_CREEDS, DOJO_SENSEIS,
  DOJO_GLOWS, dojoStart, dojoStep, dojoBacks, closeDojoSelect,
  get dojoPhase() { return dojoPhase }, get dojoAt() { return dojoAt },
  get entry() { return entry }, set entry(v) { entry = v },
  get titling() { return titling }, pressStart,
  get lastRunId() { return lastRunId }, get lastDefeatLine() { return lastDefeatLine },
  BOARD_TEAM, PODIUM, PODIUM_REACH, boardRequests, neighbourRequest,
  podiumRows, dojoStandings, studentsLabel, readRows, fetchBoard, loadBoard,
  dropBoard, dueBoard, DOJO_BADGES, badgeSvg, ordinal,
  RANKINGS_TOP, RANKINGS_FILTERS, rankingsAllowed, rankingsRequests, rankingsNearRequests,
  rankingRows, fetchRankings, openRankings, closeRankings, filterRankings, rankingsEmpty,
  get rankingsOpen() { return rankingsOpen }, get rankingsAt() { return rankingsAt },
  get board() { return board }, get boardDue() { return boardDue },
  get boardShown() { return !boardEl.hidden },
  backFrom, goBack, get backShown() { return !backHud.hidden }, crestEl, titleScreenEl,
  verdictItems, challengeUrl, challengeText, challengeRun, challengeIdFrom,
  get lastRunShown() { return lastRunShown }, rivalRequest, rivalFrom, rivalLine, loadRival,
  isPhone, PHONE_MAX, ON_PHONE, rivalEl, MENU_LABELS,
  playArcade, showToBeat, markToBeat, toBeatEl, rivalScoreEl, get beaten() { return beaten },
  get rival() { return rival }, set rival(v) { rival = v },
  STARS_SHOWN_FROM, starCountText, starsFrom, fetchStars, loadStars,
  FEEDBACK_KINDS, FEEDBACK_MAX, FEEDBACK_CONTEXT_MAX, SIDE_BY_SIDE, screenName, directionName,
  feedbackContext, feedbackRow, feedbackRequest, submitFeedback, openFeedback, closeFeedback,
  pickFeedbackKind, get feedbackOpen() { return feedbackOpen }, get feedbackKind() { return feedbackKind },
  get feedbackContextNow() { return feedbackContextNow }, set titling(v) { titling = v }
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

// For code that returns a promise. They run alongside the rest and the
// report waits for them, so a hanging one shows up as a missing result.
const pending = [];

function testAsync(name, fn) {
  pending.push(Promise.resolve().then(fn).then(
    () => { passed++; console.log('  pass  ' + name); },
    (err) => {
      failed++;
      console.log('  FAIL  ' + name);
      console.log('        ' + err.message);
    }
  ));
}

// For async tests that share the game's state, such as the open initials
// entry: each waits for the one before, pass or fail.
let inOrder = Promise.resolve();
function testAsyncInOrder(name, fn) {
  const run = inOrder.then(() => fn(), () => fn());
  inOrder = run;
  testAsync(name, () => run);
}

// Code that warns on purpose, run without the noise.
async function quietly(fn) {
  const warn = console.warn;
  console.warn = () => {};
  try { return await fn(); } finally { console.warn = warn; }
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


// First of the tests that press keys, because the game opens on the title
// screen and every key before start belongs to it.
describe('the title screen', () => {
  test('the game opens on it', () => {
    is(game.titling, true, 'titling');
  });

  // Someone playing in an office has to be able to silence the game
  // before it makes a sound, without that also starting it. Two presses
  // now, not one, because M cycles through music on the way to silence.
  test('M reaches silence and does not press start', () => {
    game.setAudioMode('effects');
    pressKey('m');
    is(game.titling, true, 'still on the title');
    pressKey('M');
    is(game.muted, true, 'silent after two, capital M too');
    is(game.titling, true, 'still on the title');
    game.setAudioMode('effects');          // leave it as the next test expects
  });

  test('any key opens the menu in its place, and does nothing else', () => {
    game.phase = 'ready';
    pressKey(' ');
    is(game.startPressed, true, 'menu up');
    is(game.titling, true, 'still on the title');
    is(game.titleMenu.at, 0, 'Arcade lit');
    is(game.phase, 'ready', 'phase - Space must not also start a run');
  });

  test('pressing start again does nothing', () => {
    game.pressStart();
    is(game.titleMenu.at, 0, 'Arcade still lit');
  });

  test('the menu moves with arrows, W and S, and Tab, and wraps', () => {
    pressKey('ArrowDown');
    is(game.titleMenu.at, 1, 'down');
    pressKey('s');
    is(game.titleMenu.at, 2, 's');
    pressKey('Tab');
    is(game.titleMenu.at, 0, 'Tab wraps');
    pressKey('w');
    is(game.titleMenu.at, 2, 'w wraps');
    pressKey('ArrowUp');
    pressKey('ArrowUp');
    is(game.titleMenu.at, 0, 'back on Arcade');
    is(game.menuStep(0, -1, 3), 2, 'menuStep wraps back');
    is(game.menuStep(2, 1, 3), 0, 'menuStep wraps on');
  });

  test('Arcade opens dojo select, with no dojo chosen yet', () => {
    is(game.currentDojo(), null, 'no dojo yet');
    pressKey('Enter');
    is(game.titling, false, 'left the title');
    is(game.mode, 'arcade', 'mode');
    is(game.dojoPhase, 'open', 'dojo select');
  });
});


// Straight after the title screen, because the select it opened is still
// up and every key belongs to it until it closes.
describe('dojo select', () => {
  test('keys choose, wrapping at either end, and never start a run', () => {
    const start = game.dojoAt;
    pressKey('ArrowRight');
    is(game.dojoAt, game.dojoStep(start, 1), 'right');
    pressKey('ArrowLeft');
    pressKey('ArrowLeft');
    is(game.dojoAt, game.dojoStep(start, -1), 'left twice from one right');
    pressKey('r');
    is(game.phase, 'ready', 'r does not restart behind the select');
  });

  test('Esc leaves without choosing, and the clock cannot bow you in', () => {
    is(game.backShown, true, 'the corner control is up');
    const tick = sandbox.lastInterval;
    pressKey('Escape');
    is(game.dojoPhase, 'closed', 'closed');
    is(game.titling, true, 'back on the title');
    is(game.titleMenu.at, 0, 'Arcade lit');
    is(game.currentDojo(), null, 'nothing committed');
    for (let i = 0; i < game.DOJO_SECONDS + 1; i++) tick();
    is(game.phase, 'ready', 'no run, however long the clock would have run');
    is(game.backShown, false, 'nothing to go back to on the title');
    pressKey('Enter');
    is(game.dojoPhase, 'open', 'and Arcade opens it again');
  });

  // Which sound fires when, as in the sound tests; how they sound is judged
  // by ear. The clock is silent: a tick was cut by ear. The harness has no
  // cards, so the whoosh and the thwack are checked in the browser, and the
  // clock stops one short of zero, where sensei would pick. UNR-136.
  test('the cards blip like a menu, and the clock runs silent', () => {
    const heard = [], real = Object.assign({}, game.SOUNDS);
    for (const name in game.SOUNDS) game.SOUNDS[name] = (...a) => heard.push([name, ...a].join(' '));
    game.audioCtx = {};
    try {
      pressKey('ArrowRight');
      const tick = sandbox.lastInterval;
      for (let i = 0; i < game.DOJO_SECONDS - 1; i++) tick();
    } finally {
      Object.assign(game.SOUNDS, real);
      game.audioCtx = null;
    }
    is(heard, ['cursor'], 'heard');
  });

  test('closing it goes straight into the fight', () => {
    game.commitDojo('eagle-fang');
    game.closeDojoSelect();
    is(game.dojoPhase, 'closed', 'closed');
    is(game.currentDojo(), 'eagle-fang', 'the dojo chosen');
    is(game.phase, 'bowing', 'the run has begun');
  });

  test('the highlight starts on your dojo, or a random one', () => {
    is(game.dojoStart('miyagi-do', 0.99), 1, 'yours, whatever the dice say');
    is(game.dojoStart(null, 0), 0, 'random, low');
    is(game.dojoStart(null, 0.99), 2, 'random, high');
    is(game.dojoStart('dragon', 0.5), 1, 'an unknown dojo counts as none');
  });

  test('a step wraps both ways', () => {
    is(game.dojoStep(2, 1), 0, 'right from the end');
    is(game.dojoStep(0, -1), 2, 'left from the start');
  });

  test('only a known dojo is committed, and it is remembered', () => {
    game.commitDojo('dragon');
    is(game.currentDojo(), 'eagle-fang', 'unknown ignored');
    game.commitDojo('miyagi-do');
    is(game.currentDojo(), 'miyagi-do', 'chosen');
    is(sandbox.localStorage.getItem(game.DOJO_KEY), 'miyagi-do', 'remembered');
  });

  test('every dojo has a creed, a sensei and a light', () => {
    for (const dojo of game.DOJO_IDS) {
      if (!game.DOJO_CREEDS[dojo] || !game.DOJO_SENSEIS[dojo] || !game.DOJO_GLOWS[dojo]) {
        throw new Error(`${dojo} is missing something`);
      }
    }
  });

  test('the creeds keep the house style: sentence case, full stops', () => {
    for (const creed of Object.values(game.DOJO_CREEDS)) {
      if (!/^[A-Z][^A-Z]*(\. [A-Z][^A-Z]*)*\.$/.test(creed)) throw new Error(`not house style: ${creed}`);
    }
  });

  test('a card back reads from the same rows as the board', () => {
    const players = [
      { dojo: 'cobra-kai', initials: 'JLR', best: 260, place: 1, students: 14 },
      { dojo: 'cobra-kai', initials: 'KAR', best: 200, place: 2, students: 14 },
      { dojo: 'miyagi-do', initials: 'DAN', best: 254, place: 1, students: 9 }
    ];
    const backs = game.dojoBacks(players);
    is(backs['cobra-kai'], { rank: '1st', team: '460', students: '14', top: 'JLR · 260' }, 'cobra kai');
    is(backs['miyagi-do'].rank, '2nd', 'miyagi-do');
    is(backs['eagle-fang'], { rank: '—', team: '—', students: '0', top: '—' }, 'a dojo with nobody');
  });

  test('a card back with no database is blank, not wrong', () => {
    is(game.dojoBacks(null)['cobra-kai'], { rank: '—', team: '—', students: '—', top: '—' }, 'blank');
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
    is(game.phase, 'dying', 'phase');
  });

  test('running into the top wall ends the game', () => {
    freshGame({
      snake: [{x: 10, y: 0}, {x: 10, y: 1}],
      direction: {x: 0, y: -1}
    });
    game.update();
    is(game.phase, 'dying', 'phase');
  });

  test('running into your own body ends the game', () => {
    freshGame({
      snake: [{x: 5, y: 5}, {x: 6, y: 5}, {x: 6, y: 6}, {x: 5, y: 6}]
    });
    game.update();   // heading right, straight into the second segment
    is(game.phase, 'dying', 'phase');
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

  // UNR-181. It was on the board in the last frame, so reaching it counts.
  test('a mouse reached on its last move is still caught', () => {
    freshGame({ visitor: {kind: 'mouse', x: 6, y: 5, life: 1, facing: 1} });
    game.update();
    is(game.score, game.MOUSE_POINTS, 'score');
    is(game.visitor, null, 'visitor');
  });

  test('a rotten egg reached on its last move still counts', () => {
    freshGame({ visitor: {kind: 'rotten', x: 6, y: 5, life: 1, facing: 1} });
    game.update();
    is(game.queasy, game.QUEASY_MOVES, 'queasy');
    is(game.visitor, null, 'visitor');
  });
});


describe('the warning flash', () => {
  // UNR-181. The board is drawn once per step, so the flash has to be
  // counted in moves: a wall-clock flash stalled for many moves at a time.
  const mouse = life => ({kind: 'mouse', x: 0, y: 0, life, born: 30, facing: 1});

  test('steady until the warning starts', () => {
    for (let life = 10; life <= 30; life++) is(game.visitorShows(mouse(life)), true, 'life ' + life);
  });

  test('then alternates every move', () => {
    for (let life = 1; life < 10; life++) {
      is(game.visitorShows(mouse(life)), life % 2 === 1, 'life ' + life);
    }
  });

  test('the last move before it bolts shows it', () => {
    is(game.visitorShows(mouse(1)), true, 'life 1');
  });

  test('a rotten egg warns for the flat count', () => {
    const rotten = life => ({kind: 'rotten', x: 0, y: 0, life, born: game.ROTTEN_LIFE, facing: 1});
    is(game.visitorShows(rotten(game.WARNING_MOVES)), true, 'before the warning');
    is(game.visitorShows(rotten(game.WARNING_MOVES - 1)), game.WARNING_MOVES % 2 === 0, 'first warning move');
  });
});


describe('the mouse: where it lands, and for how long', () => {
  // UNR-159. A mouse in open board asks nothing of you; these are the three
  // things that turn it back into a decision.

  test('it lands tight: a pocket or a wall, never out in the open', () => {
    freshGame();
    const sides = [];
    for (let i = 0; i < 200; i++) sides.push(game.openSides(game.mouseSquare()));
    is(sides.every(n => n <= game.MOUSE_CRAMP + 1), true, 'never four open sides');
    is(sides.filter(n => n === game.MOUSE_CRAMP).length > 100, true, 'usually a pocket');
  });

  test('never a dead end, because a mouse you cannot survive is a tease', () => {
    freshGame();
    for (let i = 0; i < 200; i++) {
      is(game.openSides(game.mouseSquare()) >= 2, true, 'a way in and a way out');
    }
  });

  test('the clock is set from the distance, so the route always exists', () => {
    freshGame();
    for (let i = 0; i < 200; i++) {
      const spot  = game.mouseSquare();
      const head  = game.snake[0];
      const steps = Math.abs(spot.x - head.x) + Math.abs(spot.y - head.y);
      is(game.mouseClock(spot) >= steps, true, 'reachable in the time given');
    }
  });

  test('a close mouse still gets the floor, a far one gets more', () => {
    freshGame({ snake: [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}] });
    is(game.mouseClock({x: 11, y: 10}), game.MOUSE_FLOOR, 'one step away: the floor');
    is(game.mouseClock({x: 10, y: 20}),
       Math.max(game.MOUSE_FLOOR, Math.ceil(10 * game.MOUSE_SLACK)), 'ten away: scaled');
    const near = game.mouseClock({x: 13, y: 10});   //  3 steps, so the floor
    const far  = game.mouseClock({x:  0, y:  0});   // 20 steps, so well over it
    is(far > near, true, 'further is longer');
  });

  test('it is a race: the clock is far shorter than the old flat sixty', () => {
    freshGame();
    const clocks = [];
    for (let i = 0; i < 200; i++) clocks.push(game.mouseClock(game.mouseSquare()));
    const mean = clocks.reduce((a, b) => a + b, 0) / clocks.length;
    is(mean < 40, true, 'well under the sixty it replaced');
    is(clocks.every(c => c >= game.MOUSE_FLOOR), true, 'never under the floor');
  });

  test('a spawned mouse remembers the clock it was given', () => {
    freshGame();
    game.visitor = null;
    game.spawn('mouse', {x: 5, y: 15});
    is(game.visitor.life, game.visitor.born, 'starts full');
    is(game.visitor.born, game.mouseClock({x: 5, y: 15}), 'from the distance');
  });

  test('it twitches on your moves, not on the clock', () => {
    freshGame();
    game.visitor = null;
    game.spawn('mouse', {x: 5, y: 15});
    game.visitor.beat = 0;
    const tilts = [];
    for (let m = 0; m < game.MOUSE_TWITCH * 2 + 1; m++) {
      game.moves = m;
      tilts.push(game.mouseIdle().tilt);
    }
    is(tilts.filter(t => t !== 0).length, 3, 'once per MOUSE_TWITCH moves');
    is(tilts[0] !== 0 && tilts[game.MOUSE_TWITCH] !== 0, true, 'on the beat');
    is(Math.sign(tilts[0]) === -Math.sign(tilts[game.MOUSE_TWITCH]), true,
       'alternating sides');
    is(tilts.slice(1, game.MOUSE_TWITCH).every(t => t === 0), true, 'still between');
  });
});


describe('the route to a mouse', () => {
  // UNR-183. The clock came from the straight-line distance, which ignores
  // the body; late in a run a third of mice could not be caught in time.
  const route = (snake, dir, spot, owed = 0) =>
    game.routeMoves(snake, dir, owed).get(spot.x + ',' + spot.y);

  test('on an open board it is the straight-line distance', () => {
    const snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    is(route(snake, {x: 1, y: 0}, {x: 14, y: 13}), 7, 'seven moves');
  });

  test('the head cannot turn straight back on itself', () => {
    const snake = [{x: 10, y: 10}, {x: 9, y: 10}];
    is(route(snake, {x: 1, y: 0}, {x: 8, y: 10}), 4, 'round, not through');
  });

  test('a wall of body is walked around', () => {
    // A column of body at x = 11 from y = 0 to 15, head beside it at the top.
    const snake = [];
    for (let y = 0; y <= 15; y++) snake.push({x: 11, y});
    snake.unshift({x: 10, y: 0});
    const d = route(snake, {x: 0, y: 1}, {x: 12, y: 0});
    is(d > 2, true, 'longer than the two squares it looks');
    is(d <= 2 + 2 * 16, true, 'no longer than going round the end');
  });

  test("the tail's square is free once the tail has moved on", () => {
    // Coiled so the only way to (5,6) is where the tail is now.
    const snake = [{x: 5, y: 5}, {x: 4, y: 5}, {x: 4, y: 6}];
    is(route(snake, {x: 1, y: 0}, {x: 4, y: 6}), 2, 'on the second move, once the tail has gone');
    const owed = route(snake, {x: 1, y: 0}, {x: 4, y: 6}, 5);
    is(owed === undefined || owed >= 7, true, 'not while it still grows');
  });

  test('a square sealed off by the body has no route', () => {
    // A ring of body around (1,1) in the corner, head outside it.
    const ring = [{x: 3, y: 3}, {x: 3, y: 2}, {x: 3, y: 1}, {x: 3, y: 0},
                  {x: 2, y: 0}, {x: 2, y: 2}, {x: 1, y: 2}, {x: 0, y: 2}];
    const snake = [{x: 4, y: 3}, ...ring];
    is(route(snake, {x: 1, y: 0}, {x: 1, y: 1}, 0) > 0, true, 'reachable once the ring moves on');
    const moves = game.routeMoves([{x: 4, y: 3}, ...ring], {x: 1, y: 0}, 0);
    is(moves.has('4,3'), false, 'never the head itself');
  });

  test('a mouse never lands where it cannot be reached in time', () => {
    for (let run = 0; run < 20; run++) {
      freshGame();
      // A long body snaking across the board, as late in a run.
      const snake = [];
      for (let y = 2; y < 19; y += 2) {
        for (let x = 2; x < 19; x++) snake.push({x: y % 4 ? x : 20 - x, y});
      }
      game.snake = snake;
      game.direction = {x: 1, y: 0};
      const spot = game.mouseSquare();
      if (!spot) continue;
      is(route(game.snake, game.direction, spot) <= game.mouseClock(spot), true, 'in time');
    }
  });

  test('if nowhere is reachable, no mouse comes', () => {
    freshGame({ snake: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}] });
    game.direction = {x: 0, y: -1};    // facing the top wall, boxed in
    game.snake = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}];
    game.grow = 400;                   // and the body never moves out of the way
    is(game.mouseSquare(), null, 'no square');
  });
});


describe('where visitors appear', () => {
  test('a mouse lands inside its band, never at your feet', () => {
    freshGame();
    for (let i = 0; i < 300; i++) {
      const spot = game.mouseSquare();
      const steps = game.routeMoves(game.snake, game.direction, game.grow).get(spot.x + ',' + spot.y);
      is(steps >= game.MOUSE_NEAR && steps <= game.MOUSE_FAR, true, 'in the band, along the route');
    }
  });

  test('a spawned visitor is always reachable and always has a life', () => {
    freshGame({ egg: {x: 6, y: 5} });
    // Checked at the MOMENT IT APPEARS, not on every step afterwards. A
    // mouse's clock is set from where your head was when it arrived; you
    // are then free to walk away from it, and a run where you do is not a
    // broken spawn. Asserting it every step made this test fail about one
    // run in eight.
    let already = null;
    for (let i = 0; i < 120; i++) {
      if (game.phase !== 'playing') break;
      if (game.visitor && game.visitor !== already) {
        already = game.visitor;
        const head = game.snake[0];
        const steps = Math.abs(game.visitor.x - head.x)
                    + Math.abs(game.visitor.y - head.y);
        const life = game.visitor.kind === 'mouse' ? game.visitor.born : game.ROTTEN_LIFE;
        is(steps <= life, true, 'reachable in the time it was given');
      }
      if (game.visitor) is(game.visitor.life > 0, true, 'alive');
      game.update();
    }
  });
});


// Where a rotten egg lands, and when. UNR-155.
describe('rotten egg placement', () => {
  // Pin the dice, so a test can say what happens on a roll that brings
  // nothing, or on one that brings a rotten egg.
  function withRandom(value, fn) {
    const math = vm.runInContext('Math', sandbox);
    const real = math.random;
    math.random = () => value;
    try { fn(); } finally { math.random = real; }
  }
  const NOTHING = 0.99;   // above VISITOR_CHANCE: no visitor comes
  const ROTTEN  = 0;      // under both odds: a visitor, and it's rotten
  const same = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y;

  test('a belt stretch is the last few points before a belt score', () => {
    is(game.beltStretch(10), 15, '10 is closing in on orange');
    is(game.beltStretch(14), 15, '14 too');
    is(game.beltStretch(9), null, '9 is not yet');
    is(game.beltStretch(15), null, 'on the belt itself is past it');
    is(game.beltStretch(0), null, 'white never counts');
    is(game.beltStretch(272), 275, 'midnight blue counts');
    is(game.beltStretch(275), null, 'nothing after midnight blue');
  });

  test('in the way means on a shortest route, and never right beside the egg', () => {
    const head = {x: 3, y: 4}, egg = {x: 12, y: 16};
    const route = game.routeSquares(head, egg);
    is(route.length > 0, true, 'there are squares');
    for (const s of route) {
      is(Math.abs(s.x - head.x) + Math.abs(s.y - head.y) +
         Math.abs(s.x - egg.x) + Math.abs(s.y - egg.y), 21, 'on a shortest route');
      is(Math.abs(s.x - egg.x) + Math.abs(s.y - egg.y) >= 2, true, 'not beside the egg');
    }
  });

  test('beside the egg means the side that faces the head', () => {
    is(game.besideSquares({x: 5, y: 5}, {x: 10, y: 8}), [{x: 9, y: 8}, {x: 10, y: 7}], 'at an angle');
    is(game.besideSquares({x: 5, y: 8}, {x: 10, y: 8}), [{x: 9, y: 8}], 'in line');
  });

  test('no rotten egg until the cooldown has passed', () => {
    freshGame({ egg: {x: 15, y: 15} });
    game.sinceRotten = game.ROTTEN_COOLDOWN - 1;
    withRandom(ROTTEN, () => game.maybeSpawnVisitor());
    is(game.visitor, null, 'nothing, and not a mouse in its place');
  });

  test('the cooldown is a minimum, so the usual odds still apply after it', () => {
    freshGame({ egg: {x: 15, y: 15} });
    game.sinceRotten = game.ROTTEN_COOLDOWN + 5;
    withRandom(NOTHING, () => game.maybeSpawnVisitor());
    is(game.visitor, null, 'a roll that brings nothing still brings nothing');
  });

  test('away from a belt, a rotten egg lands in the way', () => {
    for (let i = 0; i < 100; i++) {
      freshGame({ egg: {x: 15, y: 15}, score: 20 });
      game.sinceRotten = game.ROTTEN_COOLDOWN;
      game.maybeSpawnVisitor();
      if (!game.visitor || game.visitor.kind !== 'rotten') continue;
      const route = game.routeSquares(game.snake[0], game.egg);
      is(route.some(s => same(s, game.visitor)), true, 'on the route');
    }
  });

  test('closing in on a belt brings a rotten egg beside the egg, once', () => {
    freshGame({ egg: {x: 15, y: 15}, score: 12 });
    game.sinceRotten = game.ROTTEN_COOLDOWN;
    withRandom(NOTHING, () => game.maybeSpawnVisitor());
    is(game.visitor && game.visitor.kind, 'rotten', 'guaranteed, whatever the dice say');
    const beside = game.besideSquares(game.snake[0], game.egg);
    is(beside.some(s => same(s, game.visitor)), true, 'beside the egg, facing the head');

    game.visitor = null;
    game.sinceRotten = game.ROTTEN_COOLDOWN;
    withRandom(NOTHING, () => game.maybeSpawnVisitor());
    is(game.visitor, null, 'not guaranteed twice for the same belt');
  });

  test('with nowhere that matters to go, no rotten egg comes and the belt keeps its one', () => {
    // The egg right in front of the head: no room beside it or in the way.
    freshGame({ egg: {x: 6, y: 5}, score: 12 });
    game.sinceRotten = game.ROTTEN_COOLDOWN;
    is(game.rottenSquare(true), null, 'nowhere');
    withRandom(ROTTEN, () => game.maybeSpawnVisitor());
    is(game.visitor, null, 'not dropped on a random square instead');
    is(game.guardedBelts, [], 'still owed');
  });

  test('the guaranteed one still waits for the cooldown', () => {
    freshGame({ egg: {x: 15, y: 15}, score: 12 });
    game.sinceRotten = game.ROTTEN_COOLDOWN - 1;
    withRandom(NOTHING, () => game.maybeSpawnVisitor());
    is(game.visitor, null, 'nothing yet');
    is(game.guardedBelts, [], 'and the belt is still owed one');
  });

  test('never close to the head, and never boxing the egg in', () => {
    for (let i = 0; i < 100; i++) {
      // The egg in a corner, with one of its two sides under the snake.
      freshGame({ snake: [{x: 6, y: 6}, {x: 0, y: 1}], egg: {x: 0, y: 0} });
      const spot = game.rottenSquare(true);
      is(same(spot, {x: 1, y: 0}), false, 'the egg keeps an open side');
      const head = game.snake[0];
      is(Math.abs(spot.x - head.x) + Math.abs(spot.y - head.y) >= game.ROTTEN_GAP, true, 'not on top of the head');
    }
  });

  test('eating the egg sends its rotten egg away, blinking, UNR-180', () => {
    freshGame({ egg: {x: 6, y: 5}, visitor: {kind: 'rotten', x: 12, y: 12, life: 30, facing: 1} });
    game.sinceRotten = 7;
    withRandom(NOTHING, () => game.update());
    is(game.visitor && game.visitor.leaving, true, 'leaving, not gone at once');
    is(game.visitor.life, game.ROTTEN_EXIT_MOVES, 'for a few moves');
    for (let i = 0; i < game.ROTTEN_EXIT_MOVES; i++) withRandom(NOTHING, () => game.update());
    is(game.visitor, null, 'gone once they are up');
    is(game.sinceRotten, 0, 'cooldown restarted');
  });

  test('a leaving rotten egg can still be eaten', () => {
    freshGame({ score: 10, visitor: {kind: 'rotten', x: 6, y: 5, life: 3, facing: 1, leaving: true} });
    const before = game.score;
    game.update();
    is(game.score, before + game.ROTTEN_POINTS, 'it still costs you');
    is(game.visitor, null, 'eaten');
  });

  test('eggs and mice count towards the cooldown', () => {
    freshGame({ egg: {x: 6, y: 5} });
    withRandom(NOTHING, () => game.update());
    is(game.sinceRotten, 1, 'an egg');
    freshGame({ visitor: {kind: 'mouse', x: 6, y: 5, life: 30, facing: 1} });
    game.update();
    is(game.sinceRotten, 1, 'a mouse');
  });

  test('a rotten egg eaten or expired restarts the cooldown', () => {
    freshGame({ visitor: {kind: 'rotten', x: 6, y: 5, life: 30, facing: 1} });
    game.sinceRotten = 9;
    game.update();
    is(game.sinceRotten, 0, 'eaten');
    freshGame({ visitor: {kind: 'rotten', x: 18, y: 18, life: 1, facing: 1} });
    game.sinceRotten = 9;
    game.update();
    is(game.sinceRotten, 0, 'expired');
  });

  test('a new run starts with the cooldown and every belt owed', () => {
    game.sinceRotten = 9;
    game.guardedBelts = [15, 35];
    game.reset();
    is(game.sinceRotten, 0, 'cooldown');
    is(game.guardedBelts, [], 'belts');
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


describe('swipes - touch steering, see UNR-89', () => {
  const min = game.SWIPE_MIN;

  test('a finger that has barely moved is not a swipe', () => {
    is(game.swipeDirection(min - 1, 0, min), null, 'short horizontal');
    is(game.swipeDirection(0, -(min - 1), min), null, 'short vertical');
    is(game.swipeDirection(0, 0, min), null, 'no movement');
  });

  test('each of the four directions', () => {
    is(game.swipeDirection(min, 0, min),  {x:  1, y:  0}, 'right');
    is(game.swipeDirection(-min, 0, min), {x: -1, y:  0}, 'left');
    is(game.swipeDirection(0, min, min),  {x:  0, y:  1}, 'down - screen y grows downwards, like the grid');
    is(game.swipeDirection(0, -min, min), {x:  0, y: -1}, 'up');
  });

  test('a diagonal swipe goes the way it was mostly going', () => {
    is(game.swipeDirection(40, -15, min), {x: 1, y: 0}, 'mostly right');
    is(game.swipeDirection(-10, -35, min), {x: 0, y: -1}, 'mostly up');
  });

  // A swipe must never be able to do something a key press can't. The
  // rules live in queueTurn, and both inputs go through it.
  test('a swipe obeys the same rules as a key', () => {
    freshGame();                                         // heading right
    game.queueTurn(game.swipeDirection(-min, 0, min));   // straight back
    is(game.turnQueue, [], 'U-turn refused');

    game.queueTurn(game.swipeDirection(0, -min, min));   // up
    game.queueTurn(game.swipeDirection(-min, 0, min));   // then left
    is(game.turnQueue, [{x: 0, y: -1}, {x: -1, y: 0}], 'corner in one stroke');
  });

  test('swiping does nothing unless the game is playing', () => {
    freshGame();
    game.phase = 'paused';
    game.queueTurn(game.swipeDirection(0, -min, min));
    is(game.turnQueue, [], 'queue');
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
  const inPool = (name, line) =>
    game.DEFEAT_LINES[name].some(l => l.split(/\{[^}]+\}/).every(part => line.includes(part)));

  test('a wall death gets a wall line', () => {
    is(inPool('wall', game.defeatLine('wall', 20, 60, 0)), true, 'from the wall pool');
  });

  test('eating yourself gets a self line', () => {
    is(inPool('self', game.defeatLine('self', 20, 60, 0)), true, 'from the self pool');
  });

  test('scoring nothing gets its own line, whatever killed you', () => {
    for (const cause of ['wall', 'self']) {
      is(inPool('nothing', game.defeatLine(cause, 0, 40, 0)), true, 'from the nothing pool');
    }
  });

  // Never sneer at somebody's best ever run.
  test('a new hi-score outranks how you died', () => {
    for (const cause of ['wall', 'self']) {
      is(inPool('record', game.defeatLine(cause, 90, 50, 0)), true, 'from the record pool');
    }
  });

  test('a new hi-score just short of a belt says which belt and how close', () => {
    // Green is from 35, so 33 is two points off it
    is(game.defeatPool('wall', 33, 20).pool, 'nearBelt', 'pool');
    is(game.defeatLine('wall', 33, 20, 0), 'Green belt was two points away.', 'line');
  });

  test('one point is a point, not points', () => {
    is(game.defeatLine('wall', 34, 20, 0), 'Green belt was one point away.', 'singular');
  });

  test('falling a few short of the hi-score is a near miss', () => {
    is(game.defeatPool('wall', 57, 60).pool, 'nearBest', 'three short');
    is(game.defeatPool('wall', 56, 60).pool, 'wall', 'four short is just a wall');
    is(game.defeatLine('self', 58, 60, 0), 'Two points from your hi-score. That close.', 'line');
  });

  test('matching the hi-score exactly is a tie, not a near miss', () => {
    is(game.defeatPool('wall', 60, 60).pool, 'tie', 'pool');
  });

  test('there is no near miss until there is a hi-score worth missing', () => {
    is(game.defeatPool('wall', 5, 7).pool, 'wall', 'hi-score of 7');
  });

  test('the same line never lands twice in a row', () => {
    for (let roll = 0; roll < 1; roll += 0.05) {
      const first  = game.defeatLine('wall', 20, 60, roll);
      const second = game.defeatLine('wall', 20, 60, roll, first);
      is(second !== first, true, 'reroll at ' + roll.toFixed(2));
    }
  });

  test('every roll from 0 up to 1 lands on a real line', () => {
    let bad = null;
    for (let roll = 0; roll < 1; roll += 0.001) {
      if (!inPool('wall', game.defeatLine('wall', 20, 60, roll))) bad = roll;
    }
    is(bad, null, 'no roll fell off the end');
  });

  test('a roll of exactly 1 is still safe', () => {
    is(inPool('wall', game.defeatLine('wall', 20, 60, 1)), true, 'in the pool');
  });

  test('an unknown cause still returns a line rather than nothing', () => {
    is(typeof game.defeatLine(undefined, 20, 60, 0.5), 'string', 'type');
  });

  // The house style, asserted rather than trusted, on every line as the
  // player would read it - blanks filled with the longest belt name and
  // the widest number. See design/MICROCOPY.md.
  test('every line obeys the dojo voice', () => {
    const all = Object.values(game.DEFEAT_LINES).flat()
      .map(l => game.fillLine(l, 3, 'Cho Dan Bo'));
    const contracted = all.filter(l => /\w'\w/.test(l));
    const shouting   = all.filter(l => l.includes('!'));
    const unpunctued = all.filter(l => !l.endsWith('.'));
    const rambling   = all.filter(l => l.split(/\s+/).length > 9);
    const unfilled   = all.filter(l => l.includes('{'));
    is(contracted.length, 0, 'no contractions: ' + contracted.join(' / '));
    is(shouting.length,   0, 'no exclamation marks: ' + shouting.join(' / '));
    is(unpunctued.length, 0, 'all end in a full stop: ' + unpunctued.join(' / '));
    is(rambling.length,   0, 'none over nine words: ' + rambling.join(' / '));
    is(unfilled.length,   0, 'no blanks left: ' + unfilled.join(' / '));
  });

  // Only a tampered page can be disqualified, so an honest run must never
  // see these - the scores tests prove that side. This proves the other.
  test('a run no game could produce is disqualified, and its hi-score taken back', () => {
    freshGame();
    game.gameOver('wall', {x: 21, y: 5});
    game.best = 20;
    game.bestAtStart = 20;
    game.score = 999999;                        // typed into the console
    game.best = 999999;
    game.moves = 50;
    game.runMs = 20000;
    game.showVerdict();
    is(game.DEFEAT_LINES.disqualified.includes(game.lastDefeatLine), true, 'a disqualified line');
    is(game.score, 0, 'the bout does not count');
    is(game.best, 20, 'hi-score back where it was');
    is(sandbox.localStorage.getItem('strikeFirstBest'), '20', 'and remembered that way');
    is(game.entry, null, 'nothing to sign');
  });

  test('an honest run is defeated, not disqualified', () => {
    freshGame();
    game.gameOver('wall', {x: 21, y: 5});
    game.bestAtStart = 50;
    game.best = 50;
    game.moves = 50;
    game.runMs = 20000;
    game.showVerdict();
    is(game.DEFEAT_LINES.disqualified.includes(game.lastDefeatLine), false, 'a defeat line');
  });

  test('"record" is not a word the dojo uses', () => {
    const all = Object.values(game.DEFEAT_LINES).flat().filter(l => /record/i.test(l));
    is(all.length, 0, 'say hi-score: ' + all.join(' / '));
  });
});


describe('the defeat sequence', () => {
  test('dying does not show the verdict at once', () => {
    freshGame({ snake: [{x: 20, y: 10}, {x: 19, y: 10}] });
    game.update();
    is(game.phase, 'dying', 'phase');
    is(game.defeat.cause, 'wall', 'cause');
  });

  test('the hit-stop holds the head against what it hit', () => {
    is(game.defeatRecoil(0, false), 0, 'at impact');
    is(game.defeatRecoil(game.DEFEAT_HOLD_MS - 1, false), 0, 'end of hold');
    is(game.defeatRecoil(200, false) > 0, true, 'then knocked back');
  });

  test('the recoil stays inside the square', () => {
    let most = 0;
    for (let ms = 0; ms < 2000; ms += 5) most = Math.max(most, game.defeatRecoil(ms, false));
    is(most < 0.5, true, 'at most ' + most.toFixed(2) + ' of a cell');
  });

  test('the tail goes to ash before the neck', () => {
    is(game.defeatDrain(550, 1) > game.defeatDrain(550, 0), true, 'tail first');
    is(game.defeatDrain(0, 1), 0, 'nothing at impact');
    is(game.defeatDrain(game.DEFEAT_MS, 0) > 0, true, 'all drained by the verdict');
  });

  test('reduced motion keeps the flash and drain but nothing moves', () => {
    const j = game.defeatJolt(40, {x: 1, y: 0}, true);
    is(j.x === 0 && j.y === 0, true, 'no jolt');
    is(game.defeatRecoil(200, true), 0, 'no recoil');
    is(game.defeatBow(650, true), 1, 'no bow');
  });

  test('restart is refused while the key that killed you is still down', () => {
    freshGame({ snake: [{x: 20, y: 10}, {x: 19, y: 10}] });
    game.update();
    is(game.canRestart(), false, 'locked at impact');
  });
});


// The first prey a belt unlocks. UNR-201.
describe('the frog, UNR-201', () => {
  // Feed Math.random a list of rolls, one per call, the last repeating.
  function withRolls(rolls, fn) {
    const math = vm.runInContext('Math', sandbox);
    const real = math.random;
    let i = 0;
    math.random = () => rolls[Math.min(i++, rolls.length - 1)];
    try { fn(); } finally { math.random = real; }
  }
  const brown = () => game.BELTS.find(b => b.name === game.FROG_BELT).from;
  const frog  = (x, y, more) => ({kind: 'frog', x, y, life: 30, born: 30, facing: 1, beat: 0, ...more});
  const saved = game.best;

  test('frogs come from Brown belt, going by the best score', () => {
    game.best = brown() - 1;
    is(game.frogsCome(), false, 'one point short');
    game.best = brown();
    is(game.frogsCome(), true, 'at Brown');
    game.best = saved;
  });

  // 0.4 brings a visitor, isn't rotten, and is under the frog's share.
  test('below Brown the same roll brings a mouse, from Brown a frog', () => {
    freshGame({ egg: {x: 15, y: 15} });
    game.best = brown() - 1;
    withRolls([0.4], () => game.maybeSpawnVisitor());
    is(game.visitor && game.visitor.kind, 'mouse', 'below Brown');
    freshGame({ egg: {x: 15, y: 15} });
    game.best = brown();
    withRolls([0.4], () => game.maybeSpawnVisitor());
    is(game.visitor && game.visitor.kind, 'frog', 'at Brown');
    game.best = saved;
  });

  test('a roll over the frog share still brings a mouse at Brown', () => {
    freshGame({ egg: {x: 15, y: 15} });
    game.best = brown();
    withRolls([0.4, 0.4, 0.9, 0.4], () => game.maybeSpawnVisitor());
    is(game.visitor && game.visitor.kind, 'mouse', 'mouse');
    game.best = saved;
  });

  test('eating a frog scores ten, grows two, and clears the slot', () => {
    freshGame({ visitor: frog(6, 5) });
    game.update();
    is(game.score, game.FROG_POINTS, 'score');
    is(game.FROG_POINTS, 10, 'double a mouse');
    is(game.snake.length + game.grow, 3 + game.FROG_GROWTH, 'length owed');
    is(game.visitor, null, 'visitor');
  });

  test('it hops one square every six moves, and sits still in between', () => {
    freshGame({ visitor: frog(15, 5) });
    for (let i = 1; i < game.FROG_HOP; i++) {
      game.update();
      is([game.visitor.x, game.visitor.y, game.visitor.hopping], [15, 5, false], 'move ' + i);
    }
    game.update();
    const v = game.visitor;
    is(Math.abs(v.x - 15) + Math.abs(v.y - 5), 1, 'one square');
    is(v.hopping, true, 'drawn mid-hop on that move');
    game.update();
    is(game.visitor.hopping, false, 'and sitting again on the next');
  });

  // It moves, so the mouse's clock was too short to catch it in play.
  test('a frog stays longer than a mouse would on the same square', () => {
    freshGame();
    for (const spot of [{x: 7, y: 5}, {x: 15, y: 5}, {x: 18, y: 18}]) {
      const frogLife  = game.frogClock(spot);
      const mouseLife = game.mouseClock(spot);
      is(frogLife > mouseLife, true, JSON.stringify(spot) + ': ' + frogLife + ' vs ' + mouseLife);
    }
    is(game.frogClock({x: 7, y: 5}), game.FROG_FLOOR, 'close by, the floor');
    game.spawn('frog', {x: 15, y: 5});
    is(game.visitor.born, game.frogClock({x: 15, y: 5}), 'a frog arrives on its own clock');
  });

  test('a frog you land on is caught before it can hop', () => {
    freshGame({ visitor: frog(6, 5, { life: 25 }) });   // this move is its sixth
    game.update();
    is(game.score, game.FROG_POINTS, 'caught');
  });

  test('a hop never lands on the snake, the egg or off the board', () => {
    freshGame({ snake: [{x: 3, y: 0}, {x: 2, y: 0}, {x: 1, y: 0}], egg: {x: 0, y: 2} });
    const penned = frog(0, 0);
    game.visitor = penned;
    is(game.frogHopTo(penned, 0), {x: 0, y: 1}, 'the one open side');
    is(game.frogHopTo(penned, 0.99), {x: 0, y: 1}, 'whatever the roll');
    game.egg = {x: 0, y: 1};
    is(game.frogHopTo(penned, 0), null, 'nowhere open: it stays put');
  });

  test('it warns before it leaves, like a mouse', () => {
    is(game.visitorShows({kind: 'frog', life: 3, born: 30}), true, 'odd move, shown');
    is(game.visitorShows({kind: 'frog', life: 2, born: 30}), false, 'even move, hidden');
    is(game.visitorShows({kind: 'frog', life: 20, born: 30}), true, 'before the warning');
  });

  test('a breath lasts eight moves and rises seven per cent', () => {
    is(game.frogBreath(0), 1, 'rest');
    is(Math.abs(game.frogBreath(4) - 1.07) < 1e-9, true, 'top');
    is(game.frogBreath(8), 1, 'rest again');
  });

  test('promotion to Brown says frogs now come, and no other belt says anything', () => {
    is(game.UNLOCKS[game.FROG_BELT], 'frogs now come to your dojo', 'Brown');
    is(Object.keys(game.UNLOCKS), [game.FROG_BELT], 'only Brown, for now');
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
  // The hazard must not outgrow the egg. It was once the biggest thing on
  // the board, to make up for its tilt, and in play that read as too big:
  // the fumes already make it findable. The legibility test below keeps
  // it from shrinking too far the other way. See UNR-155.
  test('the rotten egg is drawn no larger than the good one', () => {
    const egg    = 12.8 * game.SPRITE_SIZE.egg.scale;
    const rotten = 13.6 * game.SPRITE_SIZE.rottenEgg.scale;
    is(rotten <= egg, true, 'rotten ' + rotten.toFixed(1) + ' vs egg ' + egg.toFixed(1));
  });

  // A reward you cannot read is not a reward. These should carry about
  // the weight of a snake segment, which is 18px.
  test('every food is drawn at a legible size', () => {
    const heights = {
      egg:       12.8 * game.SPRITE_SIZE.egg.scale,
      rottenEgg: 13.6 * game.SPRITE_SIZE.rottenEgg.scale,
      mouse:     14.8 * game.SPRITE_SIZE.mouse.scale,
      frog:      11.5 * game.SPRITE_SIZE.frog.scale
    };
    const small = Object.entries(heights).filter(([, h]) => h < 15);
    is(small.length, 0, 'too small: ' + JSON.stringify(small));
  });

  test('the mouse keeps only the paths that survive cell size', () => {
    is(game.SPRITE.mouse.length, 5, 'mouse paths');
  });

  // The two poses swap on the step the frog hops, so they must paint the
  // same parts in the same order and the same colours.
  test('the frog has four paths in both poses, matching layer for layer', () => {
    is(game.SPRITE.frog.length, 4, 'sitting paths');
    is(game.SPRITE.frog.map(l => l.fill).join(), game.SPRITE.frogHop.map(l => l.fill).join(), 'same fills in order');
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
describe("the snake's own tongue", () => {
  // UNR-160. It used to be on a wall-clock window, which the speed curve
  // change on 8 September quietly halved the sampling rate of. Counted in
  // moves, the rhythm is the same at every level.

  test('the gap is always inside its range', () => {
    for (let i = 0; i < 200; i++) {
      const gap = game.nextFlickIn(Math.random());
      is(gap >= game.TONGUE_GAP_MIN && gap <= game.TONGUE_GAP_MAX, true, 'in range');
    }
    is(game.nextFlickIn(0), game.TONGUE_GAP_MIN, 'the shortest wait');
    is(game.nextFlickIn(0.9999), game.TONGUE_GAP_MAX, 'the longest');
  });

  test('it flicks on your moves, and for exactly one of them', () => {
    freshGame({ egg: {x: 20, y: 20} });
    game.flickAt = game.moves + 1;
    game.update();
    is(game.tongueOut, true, 'out on the booked move');
    game.update();
    is(game.tongueOut, false, 'and away again the next');
  });

  test('over a run it keeps a steady rhythm, never a metronome', () => {
    freshGame({ snake: [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}],
                direction: {x: 1, y: 0}, egg: {x: 0, y: 0} });
    const flicks = [];
    // Round and round a small square in the middle of the board, so the run
    // lasts long enough to watch the rhythm rather than dying at a wall.
    for (let i = 0; i < 400 && game.phase === 'playing'; i++) {
      if (i % 4 === 3) game.queueTurn({x: -game.direction.y, y: game.direction.x});
      game.update();
      if (game.tongueOut) flicks.push(game.moves);
    }
    is(game.phase, 'playing', 'still alive after 400 moves');
    is(flicks.length > 5, true, 'it flicks more than a handful of times');
    const gaps = flicks.slice(1).map((m, i) => m - flicks[i]);
    is(gaps.every(g => g >= game.TONGUE_GAP_MIN && g <= game.TONGUE_GAP_MAX), true,
       'every gap inside the range');
    is(new Set(gaps).size > 1, true, 'not the same gap every time');
  });

  test('a fresh run starts with the tongue in', () => {
    game.reset();
    is(game.tongueOut, false, 'in');
    is(game.flickAt >= game.TONGUE_GAP_MIN, true, 'with a flick booked');
  });
});


describe('the board tongue lashes, in steps, UNR-160', () => {
  test('a flick is two poses that swing opposite ways', () => {
    const first = game.tonguePose(0), second = game.tonguePose(1);
    is(first.reach, 1, 'all the way out');
    is(second.reach < first.reach, true, 'then half back');
    is(first.lash === -second.lash && first.lash !== 0, true, 'thrown one way, then the other');
  });

  test('and is back in after two moves', () => {
    is(game.tonguePose(2), null, 'in');
    is(game.tonguePose(-1), null, 'not before');
  });

  test('the board is drawn on the step and nowhere else', () => {
    is(/requestAnimationFrame\(playingFrame\)/.test(html), false, 'no per-frame drawing during a run');
  });
});

describe('the crest lean', () => {
  test('upright over the middle column', () => {
    is(game.crestLean(10, game.COLS), 0, 'lean');
  });

  test('leans furthest at the edges, left negative', () => {
    is(game.crestLean(0, game.COLS), -game.CREST_LEAN_MAX, 'left edge');
    is(game.crestLean(game.COLS - 1, game.COLS), game.CREST_LEAN_MAX, 'right edge');
  });

  test('moves under a degree per column', () => {
    is(game.crestLean(11, game.COLS) < 1, true, 'one column');
  });
});

describe('the crest tongue', () => {
  test('mostly flicks in pairs, sometimes once', () => {
    is(game.tongueFlickPlan(0, 0).flicks, 2, 'flicks');
    is(game.tongueFlickPlan(game.TONGUE_DOUBLE, 0).flicks, 1, 'flicks');
  });

  test('starts and ends a flick with the mouth closed', () => {
    is(game.tonguePoseAt(-1, 1), 0, 'pose before');
    is(game.tonguePoseAt(0, 1), 1, 'pose at the start');
    is(game.tonguePoseAt(game.TONGUE_FLICK_MS, 1), 0, 'pose after one flick');
  });

  test('reaches full length, then goes back in', () => {
    is(game.tonguePoseAt(100, 1), 5, 'pose mid-flick');
    is(game.tonguePoseAt(230, 1), 1, 'pose on the way in');
  });

  test('a double flick runs the sequence twice', () => {
    is(game.tonguePoseAt(game.TONGUE_FLICK_MS, 2), 1, 'second flick starts');
    is(game.tonguePoseAt(game.TONGUE_FLICK_MS * 2, 2), 0, 'pose after both');
  });

  test('the pose table ends closed, at the length of a flick', () => {
    const last = game.TONGUE_POSES[game.TONGUE_POSES.length - 1];
    is(last[0], game.TONGUE_FLICK_MS, 'last entry time');
    is(last[1], 0, 'last pose');
  });

  test('pauses anywhere between the shortest and longest wait', () => {
    is(game.tongueFlickPlan(0, 0).pauseMs, game.TONGUE_PAUSE_MIN, 'pause');
    is(game.tongueFlickPlan(0, 1).pauseMs, game.TONGUE_PAUSE_MAX, 'pause');
    const middle = game.tongueFlickPlan(0, 0.5).pauseMs;
    is(middle > game.TONGUE_PAUSE_MIN && middle < game.TONGUE_PAUSE_MAX, true, 'in between');
  });
});


// The sounds themselves are judged by ear.
// What can be tested is WHICH sound fires, and when. Each one is swapped
// for a spy that writes down its name.
describe('sound', () => {
  function listen(fn) {
    const heard = [];
    const real = Object.assign({}, game.SOUNDS);
    for (const name in game.SOUNDS) game.SOUNDS[name] = () => heard.push(name);
    try { fn(); } finally { Object.assign(game.SOUNDS, real); }
    return heard;
  }

  test('nothing plays before the player has pressed anything', () => {
    freshGame();
    game.audioCtx = null;
    is(listen(() => game.addScore(game.EGG_POINTS, 'egg')), [], 'heard');
  });

  // Node has no Web Audio, so starting has to be safe without it rather
  // than taking the game down with it.
  test('starting a game without Web Audio still starts it', () => {
    game.audioCtx = null;
    game.startGame();
    is(game.phase, 'bowing', 'phase');
  });

  test('each food plays its own sound', () => {
    freshGame();
    game.audioCtx = {};
    game.best = 1000;
    is(listen(() => {
      game.addScore(game.EGG_POINTS, 'egg');
      game.addScore(game.MOUSE_POINTS, 'mouse');
      game.addScore(game.ROTTEN_POINTS, 'rotten');
    }), ['egg', 'mouse', 'rotten'], 'heard');
    game.audioCtx = null;
  });

  // Two sounds at once would be neither.
  test('a promotion replaces the sound of the food that earned it', () => {
    freshGame({ score: 10 });
    game.audioCtx = {};
    game.best = 14;
    is(listen(() => game.addScore(game.MOUSE_POINTS, 'mouse')), ['promotion'], 'heard');
    game.audioCtx = null;
  });

  test('defeat plays once, on the way out', () => {
    freshGame();
    game.audioCtx = {};
    game.snake = [{x: 0, y: 5}, {x: 1, y: 5}, {x: 2, y: 5}];
    game.direction = {x: -1, y: 0};
    is(listen(() => game.update()), ['defeat'], 'heard');
    game.audioCtx = null;
  });

  test('muted, nothing plays at all', () => {
    freshGame();
    game.audioCtx = {};
    game.muted = true;
    game.best = 1000;
    is(listen(() => game.addScore(game.MOUSE_POINTS, 'mouse')), [], 'heard');
    game.muted = false;
    game.audioCtx = null;
  });

  // One control, three states, cycled so that ONE press turns music on -
  // which is the press a new player is most likely to want. UNR-138.
  test('M cycles effects, then music, then silence, and saves the choice', () => {
    game.setAudioMode('effects');
    is([game.muted, game.musicOn], [false, false], 'effects only to start');

    pressKey('m');
    is(game.audioMode, 'all', 'one press turns music on');
    is([game.muted, game.musicOn], [false, true], 'both playing');
    is(sandbox.localStorage.getItem(game.AUDIO_KEY), 'all', 'saved');

    pressKey('m');
    is(game.audioMode, 'off', 'the next press is silence');
    is([game.muted, game.musicOn], [true, false], 'nothing playing');

    pressKey('m');
    is(game.audioMode, 'effects', 'and round again');
  });

  // Nothing on the speaker itself says whether music is on, so every press
  // says it in words, on every device. Found in play, 21 September.
  test('a press says the new state under the speaker', () => {
    game.setAudioMode('effects');
    const added = [], list = game.soundBtn.classList, add = list.add;
    list.add = (c) => added.push(c);
    try { pressKey('m'); } finally { list.add = add; }
    is(added, ['tell'], 'flashed');
    is(game.soundTipEl.textContent, 'music on', 'in words');
    pressKey('m');
    pressKey('m');
  });

  // Where music plays is decided by the screen, never by the player: the
  // player only decides whether it is allowed at all. UNR-138.
  const screen = (over) => ({
    phase: 'ready', dojoPhase: 'closed', rankingsOpen: false,
    titling: false, startPressed: true, ...over,
  });

  test('music plays on every screen that is not a run', () => {
    is(game.musicFor(screen({ titling: true })), 'arrival', 'the start menu');
    is(game.musicFor(screen({ dojoPhase: 'open' })), 'arrival', 'dojo select');
    is(game.musicFor(screen({ dojoPhase: 'opening' })), 'arrival', 'still fading in');
    is(game.musicFor(screen({ rankingsOpen: true })), 'rankings', 'the board');
    is(game.musicFor(screen({ phase: 'over', rankingsOpen: true })), 'rankings', 'the board, after a defeat');
  });

  // Seen after every run, so music there would grate. 21 September.
  test('the verdict is silent', () => {
    is(game.musicFor(screen({ phase: 'over' })), null, 'the verdict');
  });

  // The effects own a run, and the defeat needs to land before anything
  // else arrives. Mercy is still inside the fight, so it stays quiet too.
  test('a run, mercy and the moment of death are silent', () => {
    for (const phase of ['playing', 'bowing', 'paused', 'dying']) {
      is(game.musicFor(screen({ phase })), null, phase);
    }
  });

  // The crest is the screen you are on before you have pressed anything,
  // and a browser will not play audio there anyway.
  test('the title is silent until start is pressed', () => {
    is(game.musicFor(screen({ titling: true, startPressed: false })), null, 'before');
    is(game.musicFor(screen({ titling: true, startPressed: true })), 'arrival', 'after');
  });

  // On disk, not just named: a missing file fails silently in the page by
  // design, so this is the only place it would ever show. And small, since
  // everyone who turns music on downloads it. UNR-135.
  test('every track a screen can ask for exists, under 500KB', () => {
    for (const where of ['arrival', 'rankings']) {
      const file = path.join(__dirname, game.MUSIC_TRACKS[where]);
      is(fs.existsSync(file), true, where);
      is(fs.existsSync(file) && fs.statSync(file).size < 500 * 1024, true, `${where} size`);
    }
  });

  // Anyone who muted the game before v0.5.9 stays muted. The old flag is
  // read once and the new key owns it from then on.
  test('the old mute flag is carried over, once', () => {
    sandbox.localStorage.setItem(game.AUDIO_KEY, '');   // as good as absent
    sandbox.localStorage.setItem('strikeFirstMuted', '1');
    is(game.storedAudioMode(), 'off', 'a muted player stays muted');

    sandbox.localStorage.setItem('strikeFirstMuted', '0');
    is(game.storedAudioMode(), 'effects', 'everyone else gets effects');

    sandbox.localStorage.setItem(game.AUDIO_KEY, 'all');
    sandbox.localStorage.setItem('strikeFirstMuted', '1');
    is(game.storedAudioMode(), 'all', 'the new key wins once it exists');
  });

  test('toggling sound mid-run does not disturb play', () => {
    freshGame();
    const snake = JSON.stringify(game.snake);
    pressKey('m');
    is(game.phase, 'playing', 'phase');
    is(JSON.stringify(game.snake), snake, 'snake');
    is(game.turnQueue, [], 'no turn queued');
    pressKey('m');
  });
});


describe('the opening bow', () => {
  function bowing() {
    game.startGame();
  }

  test('the snake does not move while it bows', () => {
    bowing();
    const snake = JSON.stringify(game.snake);
    pressKey('m'); pressKey('m');
    is(JSON.stringify(game.snake), snake, 'snake');
    is(game.phase, 'bowing', 'phase');
  });

  test('a direction cuts the bow and is the first move, taken at once', () => {
    bowing();
    const head = game.snake[0];
    pressKey('ArrowUp');
    is(game.phase, 'playing', 'phase');
    is(game.snake[0], {x: head.x, y: head.y - 1}, 'head');
  });

  test('space during a bow calls mercy, and never restarts it', () => {
    bowing();
    const snake = JSON.stringify(game.snake);
    pressKey(' ');
    is(game.phase, 'paused', 'phase');
    is(JSON.stringify(game.snake), snake, 'snake');
  });

  test('starts and ends standing, so neither end jumps', () => {
    is(game.bowPose(0, false), {scale: 1, back: 0}, 'at 0');
    is(game.bowPose(game.BOW_MS, false), {scale: 1, back: 0}, 'at end');
  });

  test('dips, then draws back for the strike', () => {
    is(game.bowPose(180, false).scale < 1, true, 'dipped');
    is(game.bowPose(game.BOW_MS - 20, false).back > 0.25, true, 'drawn back');
  });

  test('reduced motion keeps the head still', () => {
    is(game.bowPose(400, true), {scale: 1, back: 0}, 'pose');
  });
});


describe('scores - how a run is measured, UNR-106', () => {
  // performance.now() is frozen at 0 in the fake browser. These tests move
  // it by hand, then put it back.
  const realNow = sandbox.performance.now;
  let clock = 0;
  const at = (ms) => { clock = ms; };

  test('every step taken is a move, the fatal one is not', () => {
    freshGame();
    game.update();
    game.update();
    is(game.moves, 2, 'two steps');
    game.snake = [{x: 20, y: 5}, {x: 19, y: 5}, {x: 18, y: 5}];
    game.update();   // into the wall
    is(game.moves, 2, 'still two');
  });

  test('a run lasts from its first move to its death', () => {
    sandbox.performance.now = () => clock;
    freshGame();
    at(1000); game.update();
    at(1260); game.update();
    at(1520); game.gameOver('wall', {x: 21, y: 5});
    is(game.runMs, 520, 'no bow, no start screen');
    sandbox.performance.now = realNow;
  });

  test('time spent in mercy does not count', () => {
    sandbox.performance.now = () => clock;
    freshGame();
    at(0);     game.update();
    at(100);   game.toggleMercy();
    is(game.phase, 'paused', 'paused');
    at(60100); game.toggleMercy();
    at(60300); game.gameOver('self', {x: 5, y: 5});
    is(game.runMs, 300, 'a minute of mercy taken out');
    sandbox.performance.now = realNow;
  });

  // Found walking v0.5.10: mercy in the first bow was subtracted from a run
  // that had not started, and the honest run came out disqualified.
  test('mercy before the first move takes nothing off the run', () => {
    sandbox.performance.now = () => clock;
    freshGame({ phase: 'bowing' });
    at(0);     game.toggleMercy();
    at(5000);  game.toggleMercy();
    is(game.pausedMs, 0, 'nothing to take out');
    game.phase = 'playing';
    at(6000);  game.update();
    at(6260);  game.update();
    at(6520);  game.gameOver('wall', {x: 21, y: 5});
    is(game.runMs, 520, 'the run as played');
    sandbox.performance.now = realNow;
  });

  test('dying before moving lasts nothing', () => {
    is(game.runDuration(null, 5000, 0), 0, 'no first move');
    is(game.runDuration(1000, 900, 0), 0, 'never negative');
  });

  const run = {
    initials: 'kar', dojo: 'cobra-kai', score: 40, best: 70,
    length: 30, moves: 412, durationMs: 81234
  };

  test('a run becomes the row the database stores', () => {
    is(game.scoreRecord(run), {
      initials: 'KAR', dojo: 'cobra-kai', score: 40, belt: 'Brown',
      length: 30, moves: 412, duration_ms: 81234, version: game.VERSION
    }, 'row');
  });

  test('belt comes from best, and best is at least this run', () => {
    is(game.scoreRecord({ ...run, score: 40, best: 0 }).belt, 'Green', 'a first run');
  });

  test('refuses what the database would refuse', () => {
    const bad = [
      { initials: 'KA' }, { initials: 'K4R' }, { initials: 'KARI' },
      { dojo: 'karate-kid' }, { dojo: undefined },
      { score: -1 }, { score: 2.5 }, { length: 2 }, { moves: -1 },
      { durationMs: NaN }, { best: undefined }
    ];
    for (const change of bad) {
      is(game.scoreRecord({ ...run, ...change }), null, JSON.stringify(change));
    }
  });

  test('every dojo is one the database knows', () => {
    const sql = fs.readFileSync(path.join(__dirname, 'db/scores.sql'), 'utf8');
    for (const id of game.DOJO_IDS) is(sql.includes(`'${id}'`), true, id);
  });

  test('the run just played, straight from the game', () => {
    freshGame();
    game.update();
    game.update();
    game.gameOver('wall', {x: 21, y: 5});
    const row = game.runRecord('abc', 'miyagi-do');
    is([row.initials, row.moves, row.length], ['ABC', 2, 3], 'from state');
  });

  test('the request carries the public key and nothing else', () => {
    const { url, options } = game.scoreRequest({ score: 1 }, game.SCORE_SERVICE);
    is(url, game.SCORE_SERVICE.url + '/rest/v1/scores', 'url');
    is(options.method, 'POST', 'method');
    is(options.headers.apikey, game.SCORE_SERVICE.key, 'apikey');
    is('Authorization' in options.headers, false, 'no bearer token');
    is(options.body, '{"score":1}', 'body');
  });

  test('only publishable keys are ever in the page', () => {
    is(game.SCORE_SERVICE.key.startsWith('sb_publishable_'), true, 'publishable');
    for (const [name, service] of Object.entries(game.SCORE_SERVICES)) {
      is(service.key.startsWith('sb_publishable_'), true, name + ' publishable');
      is(service.url.startsWith('https://'), true, name + ' over https');
    }
    is(/sb_secret_|service_role/.test(html), false, 'no secret key');
  });

  // UNR-162. The board people see must never be written to by someone
  // testing, whichever machine or device they are testing from.
  test('your own machine and your own network get the sandbox', () => {
    for (const host of ['localhost', '127.0.0.1', '::1', '',
                        'karins-mac.local', '192.168.1.23', '10.0.0.4',
                        '172.16.5.9', '172.31.255.255']) {
      is(game.serviceFor(host, false), 'sandbox', host || 'file://');
    }
  });

  test('after launch, anywhere else is the real board', () => {
    for (const host of ['karinnielsen.github.io', 'strike-first.example.com',
                        '172.15.0.1', '172.32.0.1', '11.0.0.1', '193.168.1.1']) {
      is(game.serviceFor(host, false), 'production', host);
    }
  });

  // Before launch nothing wrote to the real board, the published link
  // included, so its first scores were made by players.
  test('before launch, everything is the sandbox, published link included', () => {
    for (const host of ['karinnielsen.github.io', 'localhost', 'anything.example']) {
      is(game.serviceFor(host, true), 'sandbox', host);
    }
  });

  // Flipped at v1.0.0. The published game keeps real scores; a copy run
  // here still writes to the sandbox.
  test('launched: the published link is the real board, a local copy is not', () => {
    is(game.BEFORE_LAUNCH, false, 'launched');
    is(game.serviceFor('karinnielsen.github.io'), 'production', 'published');
    is(game.SCORE_TARGET, 'sandbox', 'the test run itself');
  });

  test('the two databases are different places', () => {
    is(game.SCORE_SERVICES.sandbox.url === game.SCORE_SERVICES.production.url,
       false, 'different url');
    is(game.SCORE_SERVICES.sandbox.key === game.SCORE_SERVICES.production.key,
       false, 'different key');
  });

  test('the tests themselves run against the sandbox', () => {
    is(game.SCORE_TARGET, 'sandbox', 'never the real board');
    is(game.SCORE_SERVICE.url, game.SCORE_SERVICES.sandbox.url, 'the sandbox url');
  });

  const reply = (ok, body) => async () => ({
    ok, status: ok ? 201 : 400,
    json: async () => body, text: async () => JSON.stringify(body)
  });

  testAsync('scores: a saved score comes back with its id', async () => {
    const saved = await game.submitScore(game.scoreRecord(run), reply(true, [{ id: 7 }]));
    is(saved, { id: 7 }, 'row');
  });

  testAsync('scores: a refused score is null, not an error', async () => {
    is(await quietly(() => game.submitScore(game.scoreRecord(run), reply(false, {}))), null, 'refused');
  });

  testAsync('scores: no network is null, not an error', async () => {
    const offline = async () => { throw new Error('offline'); };
    is(await quietly(() => game.submitScore(game.scoreRecord(run), offline)), null, 'offline');
  });

  testAsync('scores: an invalid run is never sent', async () => {
    let sent = false;
    await game.submitScore(null, async () => { sent = true; });
    is(sent, false, 'not sent');
  });
});


describe('scores you can trust', () => {
  const sql = fs.readFileSync(path.join(__dirname, 'db', 'scores.sql'), 'utf8');
  const constant = (name) => {
    const found = sql.match(new RegExp(`\\b${name}\\s+constant\\s+[a-z\\[\\]]+\\s*:=\\s*([^;]+);`));
    if (!found) throw new Error(`${name} not found in db/scores.sql`);
    const value = found[1].trim();
    const list = value.match(/^array\[(.*)\]$/);
    if (!list) return Number(value);
    return list[1].split(',').map(item => {
      item = item.trim();
      return item.startsWith("'") ? item.slice(1, -1) : Number(item);
    });
  };

  test('an egg and a frog in a row is the most a move or a square can earn', () => {
    is(game.POINTS_PER_MOVE, 5.5, 'per move');
    is(game.POINTS_PER_SQUARE, 5.5, 'per square');
  });

  test('the page and the database hold the same numbers', () => {
    is(constant('levels_from'), game.LEVELS.map(l => l.from), 'level thresholds');
    is(constant('levels_ms'), game.LEVELS.map(l => l.ms), 'level delays');
    is(constant('belt_names'), game.BELTS.map(b => b.name), 'belt names');
    is(constant('belt_from'), game.BELTS.map(b => b.from), 'belt thresholds');
    is(constant('board_cells'), game.COLS * game.ROWS, 'board');
    is(constant('points_per_move'), game.POINTS_PER_MOVE, 'points per move');
    is(constant('points_per_square'), game.POINTS_PER_SQUARE, 'points per square');
    is(constant('timing_slack'), game.TIMING_SLACK, 'slack');
    is(constant('timing_slack_ms'), game.TIMING_SLACK_MS, 'slack ms');
  });

  test('the fastest run climbs the curve as steeply as the score allows', () => {
    is(game.fastestRun(0, 3), 0, 'no moves');
    is(game.fastestRun(10, 3), 2600, 'no growth, so level 1 throughout');
    is(game.fastestRun(2, 5), 485, 'eleven points at most, so level 2 on the second move');
    is(game.fastestRun(1e9, 441) > 0, true, 'a huge claim still answers');
  });

  const honest = { score: 40, length: 30, moves: 412, durationMs: 81234 };

  test('a forged run is refused', () => {
    const forged = [
      { score: 999999 },
      { score: 999999, length: 999999, moves: 999999 },
      { length: 500 },                          // more than the board
      { moves: 20 },                            // grew faster than it moved
      { score: 149 },                           // more than 5.5 a square
      { durationMs: 1000 }                      // faster than the curve
    ];
    for (const change of forged) {
      is(game.plausibleRun({ ...honest, ...change }), false, JSON.stringify(change));
    }
    is(game.plausibleRun(honest), true, 'the honest one');
  });

  test('the limits are inclusive, so the best possible run is allowed', () => {
    is(game.plausibleRun({ ...honest, score: 148.5 }), true, 'five and a half a square exactly');
    is(game.plausibleRun({ ...honest, moves: 27 }), true, 'a square a move exactly');
    const fastest = game.fastestRun(honest.moves, honest.length);
    is(game.plausibleRun({ ...honest, durationMs: fastest }), true, 'the curve exactly');
  });

  // The heartbeat, driven by the tests: the game's own loop() and its own
  // timers, with a clock that jumps straight to each beat. Timers never fire
  // early, so this is the fastest a real browser could possibly play it.
  const DIRS = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
  const onBoard = (p) => p.x >= 0 && p.y >= 0 && p.x < game.COLS && p.y < game.ROWS;

  // How many squares the snake could still reach from here. A flood fill
  // over a flat grid, because it runs three times a move for thousands.
  const cells = new Uint8Array(21 * 21);
  const stack = new Int32Array(21 * 21);
  function room(from) {
    const cols = game.COLS, rows = game.ROWS;
    cells.fill(0);
    for (const p of game.snake) cells[p.y * cols + p.x] = 1;
    let top = 0, count = 0;
    stack[top++] = from.y * cols + from.x;
    cells[from.y * cols + from.x] = 1;
    while (top) {
      const at = stack[--top], x = at % cols, y = (at - x) / cols;
      count++;
      if (x > 0        && !cells[at - 1])    { cells[at - 1] = 1;    stack[top++] = at - 1; }
      if (x < cols - 1 && !cells[at + 1])    { cells[at + 1] = 1;    stack[top++] = at + 1; }
      if (y > 0        && !cells[at - cols]) { cells[at - cols] = 1; stack[top++] = at - cols; }
      if (y < rows - 1 && !cells[at + cols]) { cells[at + cols] = 1; stack[top++] = at + cols; }
    }
    return count;
  }

  // A bot that keeps as much room as it can, then heads for the food.
  function steer() {
    const head = game.snake[0];
    const dir = game.direction;
    const target = game.visitor && game.visitor.kind === 'mouse' ? game.visitor : game.egg;
    let choice = null, best = -Infinity;
    for (const d of DIRS) {
      if (d.x === -dir.x && d.y === -dir.y) continue;
      const next = {x: head.x + d.x, y: head.y + d.y};
      if (!onBoard(next) || game.snake.some(p => p.x === next.x && p.y === next.y)) continue;
      const value = room(next) * 1000 - Math.abs(next.x - target.x) - Math.abs(next.y - target.y);
      if (value > best) { best = value; choice = d; }
    }
    if (choice && (choice.x !== dir.x || choice.y !== dir.y)) game.queueTurn(choice);
    return choice || dir;
  }

  // As lucky as the dice could ever be: the egg lands right in front of
  // you, it always brings a mouse, and the mouse lands in front of you too.
  function luck(dir) {
    const head = game.snake[0];
    const next = {x: head.x + dir.x, y: head.y + dir.y};
    const same = (p) => p.x === next.x && p.y === next.y;
    if (!onBoard(next) || game.snake.some(same)) return;
    if (game.visitor) {
      game.visitor.kind = 'mouse';
      if (!same(game.egg)) Object.assign(game.visitor, next);
    } else {
      Object.assign(game.egg, next);
    }
  }

  function playOut({ lucky = false, mercy = 0, maxMoves = 2000 }) {
    const saved = [sandbox.performance.now, sandbox.setTimeout, sandbox.clearTimeout];
    let clock = 0;
    let timer = null;
    sandbox.performance.now = () => clock;
    sandbox.setTimeout = (fn, ms) => { timer = { fn, at: clock + ms }; return 1; };
    sandbox.clearTimeout = () => { timer = null; };
    try {
      game.reset();
      game.phase = 'playing';
      game.loop();                                  // the first move, on the beat
      while ((game.phase === 'playing' || game.phase === 'bowing') && game.moves < maxMoves) {
        if (game.phase === 'playing' && Math.random() < mercy) {
          clock += Math.random() * (timer.at - clock);
          game.toggleMercy();
          clock += Math.random() * 3000;
          game.toggleMercy();
        }
        const dir = steer();
        const before = game.score;
        if (lucky) luck(dir);
        clock = timer.at;
        const beat = timer;
        timer = null;
        beat.fn();
        const spot = lucky && game.score === before + game.EGG_POINTS && !game.visitor
          && game.mouseSquare();                    // null when nowhere is reachable
        if (spot) {
          game.visitor = { kind: 'mouse', life: game.mouseClock(spot), facing: 1,
                           born: game.mouseClock(spot), beat: 0, ...spot };
        }
      }
      if (game.phase !== 'dying') {                 // out of patience, not out of room
        clock = timer.at;
        game.gameOver('wall', {x: -1, y: 0});
      }
      return { score: game.score, length: game.snake.length, moves: game.moves, durationMs: game.runMs };
    } finally {
      [sandbox.performance.now, sandbox.setTimeout, sandbox.clearTimeout] = saved;
      game.phase = 'ready';
    }
  }

  // Checked without the slack, so the arithmetic itself is what is tested.
  const strictly = (run) =>
    run.length - 3 <= run.moves &&
    run.score <= game.POINTS_PER_SQUARE * (run.length - 3) &&
    run.durationMs >= game.fastestRun(run.moves, run.length);

  // Continue bows back in, UNR-149. A fake clock and heartbeat, so the
  // moment of the next move can be read off rather than waited for.
  function afterContinue(check, score = 0) {
    const saved = [sandbox.performance.now, sandbox.setTimeout, sandbox.clearTimeout];
    let clock = 500;
    let timer = null;
    sandbox.performance.now = () => clock;
    sandbox.setTimeout = (fn, ms) => { timer = { fn, ms }; return 1; };
    sandbox.clearTimeout = () => { timer = null; };
    try {
      freshGame();
      game.score = score;
      game.toggleMercy();
      game.toggleMercy();
      check({ at: (ms) => { clock = 500 + ms; }, beat: () => timer });
    } finally {
      [sandbox.performance.now, sandbox.setTimeout, sandbox.clearTimeout] = saved;
      game.phase = 'ready';
    }
  }

  test('continuing from mercy bows before the next move', () => {
    afterContinue(({ beat }) => {
      is(game.phase, 'bowing', 'bowing');
      is(beat() && beat().ms, game.BOW_MS, 'the whole bow');
    });
  });

  test('the bow after mercy is as long at level 9 as at level 1', () => {
    const top = game.LEVELS[game.LEVELS.length - 1].from;
    afterContinue(({ beat }) => {
      is(game.stepDelay(), game.LEVELS[game.LEVELS.length - 1].ms, 'at level 9');
      is(beat() && beat().ms, game.BOW_MS, 'the whole bow');
    }, top);
  });

  test('a direction straight after Continue still waits out one step', () => {
    afterContinue(({ at, beat }) => {
      const head = game.snake[0];
      const step = game.stepDelay();
      at(10);
      pressKey('ArrowUp');
      is(game.snake[0], head, 'not yet');
      is(beat() && beat().ms, step - 10, 'moves on the step');
      at(step);
      beat().fn();
      is(game.phase, 'playing', 'phase');
      is(game.snake[0], {x: head.x, y: head.y - 1}, 'head');
    });
  });

  test('a direction once a step has passed is the move, at once', () => {
    afterContinue(({ at }) => {
      const head = game.snake[0];
      at(game.stepDelay() + 1);
      pressKey('ArrowUp');
      is(game.phase, 'playing', 'phase');
      is(game.snake[0], {x: head.x, y: head.y - 1}, 'head');
    });
  });

  test('every run the game plays is accepted, mercy or not', () => {
    for (let i = 0; i < 10; i++) {
      const run = playOut({ mercy: i % 2 ? 0.3 : 0, maxMoves: 800 });
      if (!strictly(run) || !game.plausibleRun(run)) throw new Error('refused ' + JSON.stringify(run));
    }
  });

  test('the luckiest run the rules allow is accepted, mercy or not', () => {
    let top = 0;
    for (let i = 0; i < 4; i++) {
      const run = playOut({ lucky: true, mercy: i % 2 ? 0.5 : 0 });
      if (!strictly(run) || !game.plausibleRun(run)) throw new Error('refused ' + JSON.stringify(run));
      top = Math.max(top, run.score);
    }
    is(top > 275, true, 'lucky enough to reach midnight blue, got ' + top);
  });
});


describe('initials', () => {
  test('only a new hi-score asks for them', () => {
    is(game.wantsInitials(12, 11), true, 'beat it');
    is(game.wantsInitials(11, 11), false, 'matched it');
    is(game.wantsInitials(5, 40), false, 'short of it');
    is(game.wantsInitials(0, 0), false, 'scored nothing');
    is(game.wantsInitials(1, 0), true, 'a first run with any points');
  });

  test('the hi-score from before per-dojo bests goes to the dojo you have', () => {
    is(game.seedDojoBests(null, 'cobra-kai', 90), { 'cobra-kai': 90 }, 'seeded');
    is(game.seedDojoBests(null, null, 90), {}, 'no dojo yet');
    is(game.seedDojoBests(null, 'cobra-kai', 0), {}, 'nothing scored');
    is(game.seedDojoBests('{"eagle-fang":12}', 'cobra-kai', 90), { 'eagle-fang': 12 }, 'stored wins');
    is(game.seedDojoBests('junk', 'cobra-kai', 90), { 'cobra-kai': 90 }, 'unreadable, seeded again');
  });

  // The bug: one hi-score for every dojo kept a new dojo's runs unsigned.
  test('switching dojo asks for initials on the first run that scores', () => {
    const [first, second] = game.DOJO_IDS;
    // A run the page would accept: a snake long enough for the points,
    // and all the moves and time it could need.
    const endRun = (points) => {
      game.gameOver('wall', {x: 21, y: 5});
      game.score = points;
      game.snake = Array.from({ length: 3 + Math.ceil(points / game.POINTS_PER_SQUARE) }, (_, i) => ({ x: i % 21, y: 5 }));
      game.moves = 400;
      game.runMs = 600000;
      game.best = Math.max(game.best, points);   // as addScore() moves it
      game.showVerdict();
    };
    game.mode = 'arcade';
    game.dojoBests = {};

    game.commitDojo(first);
    game.startGame();
    endRun(30);
    is(game.entry !== null, true, 'the first dojo asks');
    is(game.dojoBest(first), 30, 'and keeps its best');
    game.hideInitials();

    game.commitDojo(second);
    game.startGame();
    is(game.dojoBestAtStart, 0, 'the new dojo starts from nothing');
    endRun(10);
    is(game.entry !== null, true, 'below the first dojo\'s best, the new dojo still asks');
    is(game.dojoBest(second), 10, 'its own best');
    is(JSON.parse(sandbox.localStorage.getItem(game.DOJO_BESTS_KEY)), { [first]: 30, [second]: 10 }, 'remembered');
    game.hideInitials();

    game.commitDojo(first);
    game.startGame();
    endRun(20);
    is(game.entry, null, 'short of the first dojo\'s best, nothing to sign');
    is(game.dojoBest(first), 30, 'which keeps its best');
  });

  test('anything typed becomes three capitals at most', () => {
    is(game.cleanInitials('kar'), 'KAR', 'lower case');
    is(game.cleanInitials('k 4-r!z'), 'KRZ', 'junk removed');
    is(game.cleanInitials('abcdef'), 'ABC', 'cut to three');
    is(game.cleanInitials(null), '', 'nothing');
  });

  test('the page and the database block the same initials', () => {
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'scores.sql'), 'utf8');
    const list = sql.match(/initials not in \(([^)]*)\)/);
    const inDatabase = list ? list[1].match(/[A-Z]{3}/g).sort().join(' ') : '';
    is([...game.BLOCKED_INITIALS].sort().join(' '), inDatabase, 'blocklists');
  });

  test('blocked initials never become a score record', () => {
    const run = { dojo: 'cobra-kai', score: 10, best: 10, length: 8, moves: 40, durationMs: 9000 };
    is(game.scoreRecord({ ...run, initials: 'KKK' }), null, 'blocked');
    is(game.scoreRecord({ ...run, initials: 'wtf' }).initials, 'WTF', 'cheek is allowed');
  });

  test('blocked initials cannot be signed', () => {
    game.entry = { value: 'KYS', focus() {}, blur() {}, style: { setProperty() {} } };
    game.signInitials();
    is(game.entry && game.entry.value, 'KYS', 'still open, not signed');
    game.entry = null;
  });

  // A run that just ended, with the initials field open on it.
  const signable = (initials) => {
    freshGame({ score: 12 });
    // Long enough, and played slowly enough, to have scored twelve.
    game.snake = Array.from({ length: 7 }, (_, i) => ({ x: 10 - i, y: 5 }));
    game.moves = 40;
    game.runMs = 12000;
    game.best = 12;
    game.phase = 'over';
    game.entry = { value: initials, focus() {}, blur() {}, style: { setProperty() {} } };
  };

  testAsyncInOrder('signing sends the run, under your dojo, and keeps its id', async () => {
    signable('KAR');
    game.commitDojo('eagle-fang');
    let body = null;
    const send = async (url, options) => {
      if (options.method === 'POST') body = JSON.parse(options.body);
      return { ok: true, status: 201, json: async () => [{ id: 42 }] };
    };
    const saving = game.signInitials(send);
    is(game.entry, null, 'entry closed while saving, so it cannot send twice');
    await saving;
    is([body.initials, body.dojo, body.score], ['KAR', 'eagle-fang', 12], 'row sent');
    is(game.lastRunId, 42, 'id kept');
    is(sandbox.localStorage.getItem('strikeFirstLastRun'), '42', 'id remembered');
  });

  // Signed as a dojo's best, below the hi-score: the challenge must quote
  // this run, which is the one its link points at.
  testAsyncInOrder('signing keeps the score and dojo a challenge will quote', async () => {
    signable('KAR');
    game.best = 120;
    game.commitDojo('miyagi-do');
    await game.signInitials(async () => ({ ok: true, status: 201, json: async () => [{ id: 43 }] }));
    is(game.lastRunShown, { score: 12, dojo: 'miyagi-do' }, 'kept');
    is(JSON.parse(sandbox.localStorage.getItem('strikeFirstLastRunShown')), { score: 12, dojo: 'miyagi-do' }, 'remembered');
    const run = game.challengeRun(game.lastRunShown, game.best, 'cobra-kai');
    is(game.challengeText(run.score, run.dojo), 'I scored 12 for Miyagi-Do. Beat it.', 'quoted');
    game.dropBoard();
  });

  // With no skip, asking again would trap an offline player on the entry.
  testAsyncInOrder('a failed save goes straight to the menu, and does not ask again', async () => {
    signable('KAR');
    await quietly(() => game.signInitials(async () => { throw new Error('offline'); }));
    is(game.entry, null, 'no entry');
    is(game.boardDue, true, 'the table, without your row, is due');
    game.dropBoard();
  });

  testAsyncInOrder('a save that fails after the next run started reopens nothing', async () => {
    signable('KAR');
    let fail;
    const saving = game.signInitials(() => new Promise((_, reject) => { fail = reject; }));
    game.hideInitials();                       // Again pressed
    fail(new Error('offline'));
    await quietly(() => saving);
    is(game.entry, null, 'no entry over the new run');
  });

  test('while initials are open, game keys do not restart', () => {
    freshGame();
    game.phase = 'over';
    game.entry = { value: '', focus() {}, blur() {}, style: { setProperty() {} } };
    pressKey('r');
    pressKey(' ');
    is(game.phase, 'over', 'still on the verdict');
    is(game.entry.value, 'R', 'r went into the initials');
    game.entry = null;
  });
});


describe('repeat play, UNR-137', () => {
  test('R does nothing mid-run, paused or not', () => {
    freshGame();
    pressKey('r');
    is(game.phase, 'playing', 'playing');
    game.toggleMercy();
    pressKey('r');
    is(game.phase, 'paused', 'paused');
  });

  test('R is Rematch on the verdict', () => {
    freshGame();
    game.phase = 'over';
    pressKey('r');
    is(game.phase, 'bowing', 'a new run');
  });

  test('Esc calls mercy and answers it, like Space', () => {
    freshGame();
    pressKey('Escape');
    is(game.phase, 'paused', 'called');
    is(game.mercyMenu.at, 0, 'Continue lit');
    pressKey('Escape');
    is(game.phase, 'bowing', 'answered, and bowing back in');
  });

  test('in mercy, Space picks the lit row', () => {
    freshGame();
    pressKey(' ');
    is(game.phase, 'paused', 'called');
    pressKey(' ');
    is(game.phase, 'bowing', 'Continue, bowing back in');
  });

  test('Quit with nothing scored goes to the title, on the mode you played', () => {
    freshGame();
    game.mode = 'practice';
    pressKey(' ');
    pressKey('ArrowDown');
    pressKey('Enter');
    is(game.titling, true, 'on the title');
    is(game.titleMenu.at, 1, 'Practice lit');
    is(game.phase, 'ready', 'no run');
    game.playPractice();                       // off the title again, for the tests after
    is(game.titling, false, 'left the title');
    is(game.phase, 'bowing', 'Practice starts at once');
    game.mode = 'arcade';
  });

  test('Quit with points is a forfeit, which counts', () => {
    freshGame({ score: 5 });
    game.toggleMercy();
    game.forfeit();
    is(game.phase, 'over', 'a verdict, not a death');
    is(game.defeat.cause, 'forfeit', 'cause');
    game.hideInitials();
  });

  test('Practice keeps no hi-score and no belt', () => {
    freshGame({ score: 20 });
    game.mode = 'practice';
    game.best = 3;
    game.addScore(game.EGG_POINTS, 'egg');
    is(game.score, 21, 'the run still scores');
    is(game.best, 3, 'hi-score untouched');
    game.mode = 'arcade';
  });

  test('the verdict offers Rankings after Arcade, and Arcade after Practice', () => {
    freshGame();
    game.phase = 'over';
    game.showOverlay('DEFEATED', '');
    is(game.verdictMenu.items, ['rematch', 'rankings', 'menu'], 'Arcade');
    game.mode = 'practice';
    game.showOverlay('DEFEATED', '');
    is(game.verdictMenu.items, ['practice', 'arcade', 'menu'], 'Practice');
    game.mode = 'arcade';
  });

  test('Enter on the verdict is Rematch, with no dojo select', () => {
    freshGame();
    game.phase = 'over';
    game.showOverlay('DEFEATED', '');
    pressKey('Enter');
    is(game.phase, 'bowing', 'a new run');
    is(game.dojoPhase, 'closed', 'no select');
  });

  test('SIGN refuses short of three letters, and Esc does not skip', () => {
    freshGame();
    game.phase = 'over';
    game.entry = { value: 'KA', focus() {}, blur() {}, style: { setProperty() {} } };
    pressKey('Enter');
    is(game.entry && game.entry.value, 'KA', 'still signing');
    pressKey('Escape');
    is(game.entry && game.entry.value, 'KA', 'no skip');
    game.entry = null;
  });
});


describe('the board', () => {
  // A run as the leaderboard view returns it.
  const at = (place, id = 100 + place) =>
    ({ id, initials: 'AAA', dojo: 'cobra-kai', score: 300 - place, belt: 'White', place });
  const top = [1, 2, 3, 4, 5].map(p => at(p));
  const places = (rows) => rows.map(r => r === null ? '-' : r.you ? r.place + '*' : r.near ? r.place + '~' : r.place);

  test('far down: the podium, a gap, then either side of you', () => {
    const you = at(17);
    is(places(game.podiumRows(top, [at(16), you, at(18)], you)), [1, 2, 3, '-', '16~', '17*', '18~'], 'rows');
  });

  test('on the podium or just under it: only the top five', () => {
    is(places(game.podiumRows(top, [], top[1])), [1, '2*', 3, 4, 5], 'second');
    is(places(game.podiumRows(top, [], top[4])), [1, 2, 3, 4, '5*'], 'fifth');
  });

  test('sixth: no row repeats and the gap still shows', () => {
    const you = at(6);
    is(places(game.podiumRows(top, [at(5), you, at(7)], you)), [1, 2, 3, '-', '5~', '6*', '7~'], 'rows');
  });

  test('last: only the run above you', () => {
    const you = at(9);
    is(places(game.podiumRows(top, [at(8), you], you)), [1, 2, 3, '-', '8~', '9*'], 'rows');
  });

  test('no run of yours: the top three, nothing highlighted', () => {
    is(places(game.podiumRows(top, [], null)), [1, 2, 3], 'rows');
    is(places(game.podiumRows(top.slice(0, 2), [], null)), [1, 2], 'a young board');
  });

  test('initials are not unique: yours is found by id', () => {
    const you = { ...at(2), id: 999 };
    const rows = game.podiumRows([at(1), you, at(3)], [], you);
    is(rows.filter(r => r.you).map(r => r.id), [999], 'one highlight');
  });

  test('dojos: best three summed, every dojo listed, best first', () => {
    const player = (dojo, best, place, students) => ({ dojo, initials: 'AAA', best, place, students });
    const standings = game.dojoStandings([
      player('cobra-kai', 50, 1, 9), player('cobra-kai', 40, 2, 9), player('cobra-kai', 30, 3, 9),
      player('miyagi-do', 200, 1, 1),
      player('cobra-kai', 20, 4, 9)                // off the team
    ], game.BOARD_TEAM);
    is(standings, [
      { dojo: 'miyagi-do', total: 200, students: 1, place: 1 },
      { dojo: 'cobra-kai', total: 120, students: 9, place: 2 },
      { dojo: 'eagle-fang', total: 0, students: 0, place: 3 }
    ], 'standings');
  });

  test('dojos level on points share a place', () => {
    const player = (dojo, best) => ({ dojo, initials: 'AAA', best, place: 1, students: 1 });
    const standings = game.dojoStandings([player('cobra-kai', 90), player('miyagi-do', 90), player('eagle-fang', 40)], 3);
    is(standings.map(d => d.place), [1, 1, 3], 'places');
  });

  test('places in words', () => {
    is([1, 2, 3, 4, 11, 12, 13, 21, 22, 101].map(game.ordinal),
      ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '101st'], 'ordinals');
  });

  test('every dojo has a badge, on the 18px grid, in the palette', () => {
    const palette = ['#ffff00', '#7a7a00', '#ece6da', '#7b7480', '#2a2a30', '#d3262f'];
    for (const dojo of game.DOJO_IDS) {
      const paths = game.DOJO_BADGES[dojo];
      is(Array.isArray(paths) && paths.length > 0, true, dojo + ' has a badge');
      for (const [fill, d] of paths) {
        is(palette.includes(fill), true, `${dojo} fill ${fill}`);
        const numbers = d.match(/-?\d+/g).map(Number);
        is(numbers.every(n => Number.isInteger(n) && Math.abs(n) <= 18), true, `${dojo} stays on the grid`);
      }
      is(game.badgeSvg(dojo).startsWith('<svg viewBox="0 0 18 18"'), true, dojo + ' svg');
    }
  });

  test('students, counted in words', () => {
    is([0, 1, 12].map(game.studentsLabel), ['no students yet', '1 student', '12 students'], 'labels');
  });

  test('the requests read the views, and only your run by id', () => {
    const ask = game.boardRequests(game.SCORE_SERVICE, 42);
    const rest = game.SCORE_SERVICE.url + '/rest/v1/';
    is(ask.top.startsWith(rest + 'leaderboard?') && ask.top.includes('order=place&limit=5'), true, 'top');
    is(ask.dojos.startsWith(rest + 'dojo_players?') && ask.dojos.includes('place=lte.3'), true, 'dojos');
    is(ask.you.endsWith('&id=eq.42'), true, 'yours');
    is(game.boardRequests(game.SCORE_SERVICE, null).you, null, 'no run, no request');
    is(game.neighbourRequest(game.SCORE_SERVICE, 17).includes('place=gte.16&place=lte.18'), true, 'neighbours');
  });

  // A pretend database answering the board's reads.
  const database = (runs, players = []) => async (url, options) => {
    const q = new URL(url);
    let rows = q.pathname.endsWith('dojo_players') ? players : runs;
    for (const [key, value] of q.searchParams) {
      const [op, n] = value.split('.');
      if (op === 'eq') rows = rows.filter(r => r[key] === Number(n));
      if (op === 'gte') rows = rows.filter(r => r[key] >= Number(n));
      if (op === 'lte') rows = rows.filter(r => r[key] <= Number(n));
    }
    if (q.searchParams.get('limit')) rows = rows.slice(0, Number(q.searchParams.get('limit')));
    return { ok: options.headers.apikey === game.SCORE_SERVICE.key, status: 200, json: async () => rows };
  };
  const forty = Array.from({ length: 40 }, (_, i) => at(i + 1));

  testAsyncInOrder('board: loads the podium and your neighbourhood', async () => {
    const loaded = await game.fetchBoard(117, database(forty));
    is(places(loaded.rows), [1, 2, 3, '-', '16~', '17*', '18~'], 'rows');
    is(loaded.you.id, 117, 'you');
  });

  testAsyncInOrder('board: a run the database has lost is no highlight, not an error', async () => {
    const loaded = await game.fetchBoard(5000, database(forty));
    is(places(loaded.rows), [1, 2, 3], 'rows');
  });

  testAsyncInOrder('board: offline is no board, not an error', async () => {
    is(await quietly(() => game.fetchBoard(117, async () => { throw new Error('offline'); })), null, 'offline');
  });

  testAsyncInOrder('board: never shown alongside the initials entry', async () => {
    freshGame();
    game.phase = 'over';
    game.entry = { value: 'KAR', focus() {}, blur() {}, style: { setProperty() {} } };
    await game.loadBoard(117, database(forty));
    game.dueBoard();
    is(game.board !== null, true, 'loaded');
    is(game.boardShown, false, 'hidden while the entry is open');
    game.entry = null;
    game.dueBoard();
    is(game.boardShown, true, 'shown once it closes');
    game.dropBoard();
    is(game.boardShown, false, 'gone on Again');
  });

  testAsyncInOrder('board: a load overtaken by the next run lands nowhere', async () => {
    const held = [];
    const loading = game.loadBoard(117, (url, options) =>
      new Promise(r => held.push(() => r(database(forty)(url, options)))));
    game.dropBoard();                          // Again pressed
    // Answer everything, including the neighbours asked for after the first three.
    for (let i = 0; i < 10; i++) {
      while (held.length) held.shift()();
      await new Promise(r => setImmediate(r));
    }
    await loading;
    is(game.board, null, 'nothing kept');
  });

});


describe('All Valley Rankings, UNR-134', () => {
  const DOJOS = ['cobra-kai', 'miyagi-do', 'eagle-fang'];
  // Forty runs, dojos taking turns: Cobra Kai holds places 1, 4, 7 ...
  const runs = Array.from({ length: 40 }, (_, i) =>
    ({ id: 100 + i + 1, initials: 'AAA', dojo: DOJOS[i % 3], score: 300 - i, belt: 'White', place: i + 1 }));
  const places = (rows) => rows.map(r => r === null ? '-' : r.you ? r.place + '*' : r.place);

  // A pretend database for the views, with the filters the rankings use.
  const database = (rows, players = []) => async (url, options) => {
    const q = new URL(url);
    let out = q.pathname.endsWith('dojo_players') ? players : rows;
    for (const [key, value] of q.searchParams) {
      const [op, ...rest] = value.split('.');
      const v = rest.join('.');
      const want = /^\d+$/.test(v) ? Number(v) : v;
      if (op === 'eq') out = out.filter(r => r[key] === want);
      if (op === 'lt') out = out.filter(r => r[key] < want);
      if (op === 'gt') out = out.filter(r => r[key] > want);
      if (op === 'lte') out = out.filter(r => r[key] <= want);
    }
    const order = q.searchParams.get('order');
    if (order) out = [...out].sort((a, b) => order.endsWith('.desc') ? b.place - a.place : a.place - b.place);
    if (q.searchParams.get('limit')) out = out.slice(0, Number(q.searchParams.get('limit')));
    return { ok: options.headers.apikey === game.SCORE_SERVICE.key, status: 200, json: async () => out };
  };

  test('opens between runs only, never over an entry', () => {
    const between = { titling: false, dojoPhase: 'closed', entry: null, signing: null };
    is(['ready', 'over', 'playing', 'paused', 'dying', 'bowing']
      .map(phase => game.rankingsAllowed({ ...between, phase })), [true, true, false, false, false, false], 'phases');
    is(game.rankingsAllowed({ ...between, phase: 'over', entry: {} }), false, 'initials open');
    is(game.rankingsAllowed({ ...between, phase: 'over', signing: {} }), false, 'signing');
    is(game.rankingsAllowed({ ...between, phase: 'ready', titling: true }), false, 'title screen');
    is(game.rankingsAllowed({ ...between, phase: 'ready', dojoPhase: 'open' }), false, 'dojo select');
  });

  test('All first, then every dojo', () => {
    is(game.RANKINGS_FILTERS, [null, ...game.DOJO_IDS], 'filters');
  });

  test('the requests: a top ten, filtered by dojo when asked', () => {
    const all = game.rankingsRequests(game.SCORE_SERVICE, null, 42);
    is(all.top.includes('order=place&limit=10') && !all.top.includes('dojo='), true, 'all');
    is(all.you.endsWith('&id=eq.42'), true, 'yours, by id');
    is(game.rankingsRequests(game.SCORE_SERVICE, 'miyagi-do', null).top.includes('&dojo=eq.miyagi-do'), true, 'dojo');
    is(game.rankingsRequests(game.SCORE_SERVICE, null, null).you, null, 'no run, no request');
    is(game.rankingsNearRequests(game.SCORE_SERVICE, null, 17).ahead, null, 'All needs no counting');
    is(game.rankingsNearRequests(game.SCORE_SERVICE, 'eagle-fang', 17).ahead.includes('select=id&dojo=eq.eagle-fang&place=lt.17'), true, 'counting');
  });

  test('rows: in the top ten, no gap; below it, a gap and your neighbourhood', () => {
    const top = runs.slice(0, 10);
    is(places(game.rankingRows(top, [], top[3])), [1, 2, 3, '4*', 5, 6, 7, 8, 9, 10], 'inside');
    is(places(game.rankingRows(top, [runs[15], runs[16], runs[17]], runs[16])),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '-', 16, '17*', 18], 'below');
    // 11th: the run above you is already on the list, so it is not repeated.
    is(places(game.rankingRows(top, [runs[9], runs[10], runs[11]], runs[10])),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '-', '11*', 12], 'just below');
    is(places(game.rankingRows(top, [], null)), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'no run');
  });

  test('an empty list says so, and asks your own dojo to go first', () => {
    is(game.rankingsEmpty(null, 'cobra-kai'), 'No one has fought yet.', 'all');
    is(game.rankingsEmpty('eagle-fang', 'cobra-kai'), 'No student of Eagle Fang has fought yet.', 'another dojo');
    is(game.rankingsEmpty('eagle-fang', 'eagle-fang'), 'Be the first to fight for Eagle Fang.', 'yours');
  });

  testAsyncInOrder('rankings: an empty dojo is an empty list, not an error', async () => {
    const loaded = await game.fetchRankings('eagle-fang', null, database(runs.filter(r => r.dojo !== 'eagle-fang')));
    is(loaded.rows, [], 'no rows');
  });

  testAsyncInOrder('rankings: All places you in the tournament', async () => {
    const loaded = await game.fetchRankings(null, 117, database(runs));
    is(places(loaded.rows), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '-', 16, '17*', 18], 'rows');
  });

  testAsyncInOrder('rankings: a dojo counts places within itself', async () => {
    // Cobra Kai's runs hold places 1, 4, 7 ... so its 10th is place 28.
    const top = await game.fetchRankings('cobra-kai', null, database(runs));
    is(places(top.rows), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'numbered 1 to 10');
    is(top.rows.every(r => r.dojo === 'cobra-kai'), true, 'only the dojo');
    is(top.rows[9].score, 300 - 27, 'its tenth is the tournament 28th');
    // Place 37 is Cobra Kai's 13th.
    const far = await game.fetchRankings('cobra-kai', 137, database(runs));
    is(places(far.rows), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '-', 12, '13*', 14], 'your neighbourhood, in dojo places');
    is(far.rows.slice(-3).map(r => r.id), [134, 137, 140], 'the dojo runs either side');
  });

  testAsyncInOrder('rankings: another dojo has no you in it', async () => {
    const loaded = await game.fetchRankings('miyagi-do', 137, database(runs));
    is(loaded.rows.some(r => r && r.you), false, 'no highlight');
    is(loaded.rows.includes(null), false, 'no gap');
  });

  testAsyncInOrder('rankings: offline is a message, not an error', async () => {
    is(await quietly(() => game.fetchRankings(null, 117, async () => { throw new Error('offline'); })), null, 'offline');
  });

  testAsyncInOrder('rankings: B opens them on the verdict, and no key reaches the game behind', async () => {
    freshGame();
    game.phase = 'over';
    game.entry = null;
    pressKey('b');
    is(game.rankingsOpen, true, 'open');
    pressKey('ArrowRight');
    is(game.rankingsAt, 1, 'a dojo');
    pressKey('Tab');
    pressKey('ArrowLeft');
    pressKey('a');
    is(game.rankingsAt, 0, 'back to All');
    pressKey('ArrowLeft');
    is(game.rankingsAt, 3, 'wraps');
    pressKey('r');
    pressKey(' ');
    is(game.phase, 'over', 'no restart behind the rankings');
    pressKey('ArrowUp');
    pressKey('w');
    is(game.turnQueue, [], 'no turn queued');
    pressKey('Escape');
    is(game.rankingsOpen, false, 'Esc goes back');
    pressKey('b');
    pressKey('b');
    is(game.rankingsOpen, false, 'B goes back too');
    await quietly(() => new Promise(r => setImmediate(r)));
  });

  testAsyncInOrder('rankings: never during a run', async () => {
    freshGame();
    pressKey('b');
    is(game.rankingsOpen, false, 'playing');
    game.phase = 'paused';
    game.openRankings();
    is(game.rankingsOpen, false, 'paused');
  });

  testAsyncInOrder('back: the verdict goes to the main menu; a run and signing have none', async () => {
    freshGame();
    is(game.goBack(), false, 'none in a run');
    pressKey('Escape');
    is(game.phase, 'paused', 'so Esc is still mercy');
    game.phase = 'over';
    game.entry = { value: 'KA', focus() {}, blur() {}, style: { setProperty() {} } };
    is(game.goBack(), false, 'none while signing');
    game.entry = null;
    game.mode = 'arcade';
    pressKey('Escape');
    is(game.titling, true, 'the verdict goes to the title');
    is(game.phase, 'ready', 'and the run is gone');
    is(game.titleMenu.at, 0, 'Arcade lit, as Main menu does');
  });

  // Last, because it leaves the game on the title. Straight after the one
  // above, which leaves it there with Arcade lit.
  testAsyncInOrder('dojo select: no key picks a dojo while it is still fading in, UNR-164', async () => {
    const fades = [];
    const fade = () => {
      let done;
      fades.push(() => done());
      return { finished: new Promise(r => { done = r; }), cancel() {} };
    };
    game.crestEl.animate = game.titleScreenEl.animate = fade;
    const had = game.currentDojo();
    try {
      pressKey('Enter');
      is(game.dojoPhase, 'opening', 'Arcade starts the fade');
      is(fades.length, 2, 'crest and title fading');
      for (const key of ['Enter', ' ', 'ArrowRight', 'Escape']) pressKey(key);
      is(game.dojoPhase, 'opening', 'still fading, nothing picked');
      is(game.currentDojo(), had, 'nothing committed');
      is(game.goBack(), false, 'no back before it is seen');
      fades.forEach(f => f());
      await new Promise(r => setImmediate(r));
      is(game.dojoPhase, 'open', 'on screen, choosing');
      is(game.backShown, true, 'and back is up');
      pressKey('Escape');
      is(game.titling, true, 'Esc leaves it as usual');
    } finally {
      delete game.crestEl.animate;
      delete game.titleScreenEl.animate;
    }
  });
});

describe('back', () => {
  const at = { titling: false, dojoPhase: 'closed', rankingsOpen: false, phase: 'ready', entry: null };
  test('only on the screens you can leave', () => {
    is(game.backFrom({ ...at, titling: true }), null, 'title');
    is(game.backFrom({ ...at, dojoPhase: 'open' }), 'dojo', 'dojo select');
    is(game.backFrom({ ...at, dojoPhase: 'opening' }), null, 'dojo select still fading in');
    is(game.backFrom({ ...at, dojoPhase: 'choosing' }), null, 'a dojo already chosen');
    is(game.backFrom({ ...at, rankingsOpen: true }), 'rankings', 'rankings');
    is(game.backFrom({ ...at, rankingsOpen: true, phase: 'over' }), 'rankings', 'rankings over a verdict');
    is(game.backFrom({ ...at, phase: 'over' }), 'verdict', 'verdict');
    is(game.backFrom({ ...at, phase: 'over', entry: {} }), null, 'signing');
    is(['playing', 'bowing', 'paused', 'dying'].map(phase => game.backFrom({ ...at, phase })),
      [null, null, null, null], 'a run');
  });
});


describe('challenge a friend, UNR-116', () => {
  test('the verdict offers a challenge only once there is a signed run', () => {
    is(game.verdictItems('arcade', null), ['rematch', 'rankings', 'menu'], 'no run yet');
    is(game.verdictItems('arcade', 42), ['rematch', 'challenge', 'rankings', 'menu'], 'a signed run');
    is(game.verdictItems('practice', 42), ['practice', 'arcade', 'menu'], 'never from Practice');
    is(game.MENU_LABELS.challenge, 'Challenge a friend', 'says what it does');
  });

  test('the link points at the run, through the challenge page', () => {
    is(game.challengeUrl({ origin: 'https://karinnielsen.github.io', pathname: '/strike-first/' }, 42),
       'https://karinnielsen.github.io/strike-first/challenge/?vs=42', 'published');
    is(game.challengeUrl({ origin: 'http://localhost:8765', pathname: '/' }, 7),
       'http://localhost:8765/challenge/?vs=7', 'local, so the sandbox board');
    is(game.challengeUrl({ origin: 'http://localhost:8765', pathname: '/index.html' }, 7),
       'http://localhost:8765/challenge/?vs=7', 'served as a file name, not a folder');
  });

  test('a challenge says the score and the dojo it was scored for', () => {
    is(game.challengeText(42, 'cobra-kai'), 'I scored 42 for Cobra Kai. Beat it.', 'text');
    is(game.challengeText(42, null), 'I scored 42. Beat it.', 'no dojo chosen yet');
    is(game.challengeText(42, 'no-such-dojo'), 'I scored 42. Beat it.', 'not a dojo');
    is(game.challengeRun(null, 90, 'cobra-kai'), { score: 90, dojo: 'cobra-kai' }, 'signed before scores were kept');
    is(game.challengeRun({ score: 12, dojo: 'eagle-fang' }, 90, 'cobra-kai'), { score: 12, dojo: 'eagle-fang' }, 'the run itself');
  });

  test('the challenge page carries its own preview card and forwards', () => {
    const page = fs.readFileSync(path.join(__dirname, 'challenge', 'index.html'), 'utf8');
    is(/property="og:title" content="[^"]*challenged/.test(page), true, 'a title of its own');
    is(/property="og:title" content="[^"]*Karate snake game/.test(page), false, 'not the game\'s title');
    is(page.includes("location.replace('../' + location.search"), true, 'forwards, keeping ?vs=');
    is(page.includes('name="robots" content="noindex"'), true, 'kept out of search');
  });

  // Slack picks its cropped thumbnail layout unless twitter:image is there
  // beside the card type, whatever og:image says. UNR-185.
  test('both pages offer the card to Slack as well', () => {
    const challenge = fs.readFileSync(path.join(__dirname, 'challenge', 'index.html'), 'utf8');
    for (const [where, page] of [['game', html], ['challenge', challenge]]) {
      const og = page.match(/property="og:image" content="([^"]+)"/);
      const twitter = page.match(/name="twitter:image" content="([^"]+)"/);
      is(twitter && twitter[1], og && og[1], `${where}: the same image both ways`);
      is(/name="twitter:card" content="summary_large_image"/.test(page), true, `${where}: shown large`);
      is(/property="og:site_name"/.test(page), false, `${where}: no site name under the title`);
    }
  });

  test('a link is read back to a run id, or to nothing', () => {
    is(game.challengeIdFrom('?vs=42'), 42, 'plain');
    is(game.challengeIdFrom('?utm_source=x&vs=42'), 42, 'among other parameters');
    is(game.challengeIdFrom('?vs=42&fbclid=abc'), 42, 'before other parameters');
    is(game.challengeIdFrom(''), null, 'no link');
    is(game.challengeIdFrom(undefined), null, 'no search at all');
    for (const bad of ['?vs=0', '?vs=-3', '?vs=abc', '?vs=4.2', '?vs=42x', '?vs=', '?versus=42']) {
      is(game.challengeIdFrom(bad), null, bad);
    }
  });

  test('the score comes from the board, never the link', () => {
    is(game.rivalRequest({ url: 'https://db' }, 42),
       'https://db/rest/v1/scores?select=initials,dojo,score&id=eq.42', 'request');
    const row = { initials: 'KAR', dojo: 'cobra-kai', score: 47 };
    is(game.rivalFrom([row]), row, 'a good row');
    is(game.rivalFrom([]), null, 'a wiped board');
    is(game.rivalFrom(null), null, 'offline');
    is(game.rivalFrom([{ ...row, dojo: 'nowhere' }]), null, 'unknown dojo');
    is(game.rivalFrom([{ ...row, initials: '<b>' }]), null, 'odd initials');
  });

  test('the friend is told how they did, in the dojo voice', () => {
    const rival = { initials: 'KAR', dojo: 'cobra-kai', score: 47 };
    is(game.rivalLine(rival, 48), "You beat KAR's 47.", 'beaten');
    is(game.rivalLine(rival, 47), "KAR's 47 still stands.", 'a tie does not beat it');
    is(game.rivalLine(rival, 3), "KAR's 47 still stands.", 'short');
    is(game.rivalLine(null, 48), '', 'no challenge, no line');
    is(game.rivalLine(rival, 48, 'practice'), 'Beaten in practice. It does not count.', 'Practice never settles it');
    is(game.rivalLine(rival, 3, 'practice'), '', 'short in Practice: nothing to correct');
    for (const line of [game.rivalLine(rival, 48), game.rivalLine(rival, 3), game.rivalLine(rival, 48, 'practice')]) {
      if (line.split(' ').length > 9 || !line.endsWith('.') || /n't|!/.test(line)) {
        throw new Error(`breaks the dojo voice: ${line}`);
      }
    }
  });

  testAsync('an unknown run on the board is no challenge, not an error', async () => {
    const send = async () => ({ ok: true, json: async () => [] });
    await game.loadRival(999, send);
    is(game.rival, null, 'rival');
  });

  test('any other overlay clears the challenge line', () => {
    freshGame();
    game.rival = { initials: 'KAR', dojo: 'cobra-kai', score: 47 };
    game.showOverlay('MERCY', '');
    is(game.rivalEl.textContent, '', 'cleared by any other overlay');
    game.rival = null;
  });

  test('the challenge outlives a Practice session', () => {
    freshGame();
    const rival = { initials: 'KAR', dojo: 'cobra-kai', score: 47 };
    game.rival = rival;
    game.playPractice();
    game.toTitle();
    game.mode = 'arcade';
    is(game.rival, rival, 'still there for Arcade');
    game.rival = null;
  });

  test('the score to beat is on screen for the whole Arcade run', () => {
    freshGame();
    game.rival = { initials: 'KAR', dojo: 'cobra-kai', score: 47 };
    game.playArcade();
    game.commitDojo('cobra-kai');
    game.closeDojoSelect();
    is(game.toBeatEl.hidden, false, 'shown once a challenge is loaded');
    is(String(game.rivalScoreEl.textContent), '47', "the rival's score, not yours");
    game.playPractice();
    is(game.toBeatEl.hidden, true, 'Practice cannot settle a challenge');
    game.rival = null;
    game.mode = 'arcade';
    game.showToBeat();
    is(game.toBeatEl.hidden, true, 'no challenge, no target');
    game.toTitle();   // Arcade left the dojo select open, and the suite shares one game
  });

  test('the target is beaten, and unbeaten again if the score falls back', () => {
    freshGame();
    game.rival = { initials: 'KAR', dojo: 'cobra-kai', score: 5 };
    game.mode = 'arcade';
    game.score = 5;
    game.addScore(0, 'egg');
    is(game.beaten, false, 'a tie does not beat it, as in the verdict');
    game.addScore(1, 'egg');
    is(game.beaten, true, 'one point past it');
    game.addScore(-3, 'rotten');
    is(game.beaten, false, 'a rotten egg puts it back out of reach');
    game.addScore(9, 'mouse');
    is(game.beaten, true, 'and passing it again is another crossing');
    game.mode = 'practice';
    game.markToBeat();
    is(game.beaten, false, 'Practice cannot beat it');
    game.rival = null;
    game.mode = 'arcade';
    game.markToBeat();
  });

  test('a phone is judged by the short side of its screen', () => {
    is(game.isPhone(390, 844), true, 'iPhone upright');
    is(game.isPhone(844, 390), true, 'iPhone on its side');
    is(game.isPhone(744, 1133), false, 'iPad mini');
    is(game.isPhone(1440, 900), false, 'laptop');
    is(game.ON_PHONE, false, 'the harness is not a phone');
  });
});

describe('the star count', () => {
  test('hidden below ten, then written as GitHub writes it', () => {
    is(game.starCountText(0), null, 'none');
    is(game.starCountText(9), null, 'nine');
    is(game.starCountText(10), '10', 'ten');
    is(game.starCountText(999), '999', '999');
    is(game.starCountText(1299), '1.2k', 'thousands');
    is(game.starCountText(null), null, 'unknown');
  });

  test('?stars= fakes the count', () => {
    is(game.starsFrom('?stars=42'), 42, 'alone');
    is(game.starsFrom('?vs=7&stars=3'), 3, 'with a challenge');
    is(game.starsFrom('?vs=7'), null, 'absent');
    is(game.starsFrom(undefined), null, 'no search at all');
  });

  const github = (body, ok = true) => async () => ({ ok, json: async () => body });

  testAsync('reads the count from GitHub', async () => {
    is(await game.fetchStars(github({ stargazers_count: 12 })), 12, 'count');
  });

  testAsync('offline, refused or odd is no count, not an error', async () => {
    is(await game.fetchStars(async () => { throw new Error('offline'); }), null, 'offline');
    is(await game.fetchStars(github({ message: 'rate limit' }, false)), null, 'rate limited');
    is(await game.fetchStars(github({})), null, 'no count in it');
  });

  testAsync('a faked count never calls GitHub', async () => {
    let asked = false;
    await game.loadStars('?stars=42', async () => { asked = true; });
    is(asked, false, 'asked');
  });
});

describe('feedback, UNR-197', () => {
  const sql = fs.readFileSync(path.join(__dirname, 'db', 'scores.sql'), 'utf8');

  test('the kinds and the limit match the database', () => {
    const kinds = sql.match(/kind\s+text check \(kind in \(([^)]*)\)\)/);
    is(kinds && kinds[1].split(',').map(k => k.trim().slice(1, -1)), game.FEEDBACK_KINDS, 'kinds');
    const max = sql.match(/char_length\(message\) <= (\d+)/);
    is(max && Number(max[1]), game.FEEDBACK_MAX, 'limit');
    const bytes = sql.match(/octet_length\(context::text\) <= (\d+)/);
    is(bytes && Number(bytes[1]) > game.FEEDBACK_CONTEXT_MAX, true, 'context fits');
  });

  test('side by side is the stylesheet\'s own query', () => {
    is(html.includes('@media ' + game.SIDE_BY_SIDE + ' {'), true, 'same query');
  });

  test('every screen has a name', () => {
    const base = { titling: false, startPressed: false, dojoPhase: 'closed', rankingsOpen: false, phase: 'ready', entry: null };
    const cases = [
      [{ titling: true }, 'title'],
      [{ titling: true, startPressed: true }, 'title menu'],
      [{ dojoPhase: 'open' }, 'dojo select'],
      [{ rankingsOpen: true }, 'rankings'],
      [{ phase: 'over', entry: {} }, 'initials'],
      [{ phase: 'playing' }, 'run'],
      [{ phase: 'bowing' }, 'bow'],
      [{ phase: 'paused' }, 'mercy'],
      [{ phase: 'dying' }, 'defeat'],
      [{ phase: 'over' }, 'verdict']
    ];
    for (const [change, name] of cases) is(game.screenName({ ...base, ...change }), name, name);
  });

  test('directions read as words', () => {
    is(['up', 'down', 'left', 'right'].map(k => game.directionName(game.KEYS[
      { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[k]])),
       ['up', 'down', 'left', 'right'], 'words');
    is(game.directionName(null), null, 'none');
  });

  test('a kind alone, or a line alone, is a report', () => {
    is(game.feedbackRow({ kind: 'bug' }).kind, 'bug', 'kind');
    const line = game.feedbackRow({ message: '  turns lag  ' });
    is([line.kind, line.message], [null, 'turns lag'], 'line, trimmed');
    is(line.version, game.VERSION, 'version');
  });

  test('nothing, or only spaces, is not a report', () => {
    is(game.feedbackRow({}), null, 'nothing');
    is(game.feedbackRow({ message: '   ' }), null, 'spaces');
    is(game.feedbackRow({ kind: 'rant' }), null, 'unknown kind');
  });

  test('a long line is cut to the limit, not refused', () => {
    const row = game.feedbackRow({ kind: 'idea', message: 'a'.repeat(900) });
    is(row.message.length, game.FEEDBACK_MAX, 'cut');
  });

  test('a context too large to store is sent without its detail', () => {
    const row = game.feedbackRow({ kind: 'bug', context: { screen: 'run', browser: 'x'.repeat(5000) } });
    is(row.context, { screen: 'run', oversized: true }, 'trimmed');
  });

  test('the context describes the game and fits', () => {
    const wasTitling = game.titling;
    game.titling = false;
    freshGame({ direction: { x: 0, y: -1 }, turnQueue: [{ x: 1, y: 0 }] });
    const context = game.feedbackContext();
    game.titling = wasTitling;
    is([context.screen, context.heading, context.turns, context.length], ['run', 'up', ['right'], 3], 'the run');
    for (const field of ['mode', 'belt', 'layout', 'window', 'input', 'touch', 'browser']) {
      is(field in context, true, field);
    }
    is(JSON.stringify(context).length < game.FEEDBACK_CONTEXT_MAX, true, 'fits');
  });

  test('the request asks for nothing back and carries only the public key', () => {
    const { url, options } = game.feedbackRequest({ kind: 'fun' }, game.SCORE_SERVICE);
    is(url, game.SCORE_SERVICE.url + '/rest/v1/feedback', 'url');
    is(options.headers.Prefer, 'return=minimal', 'no read');
    is(options.headers.apikey, game.SCORE_SERVICE.key, 'apikey');
    is('Authorization' in options.headers, false, 'no bearer token');
  });

  const reply = (ok) => async () => ({ ok, status: ok ? 201 : 400, text: async () => '' });

  testAsync('feedback: a sent report is true', async () => {
    is(await game.submitFeedback(game.feedbackRow({ kind: 'fun' }), reply(true)), true, 'sent');
  });

  testAsync('feedback: a refused report is false, not an error', async () => {
    is(await quietly(() => game.submitFeedback(game.feedbackRow({ kind: 'fun' }), reply(false))), false, 'refused');
  });

  testAsync('feedback: no network is false, not an error', async () => {
    const offline = async () => { throw new Error('offline'); };
    is(await quietly(() => game.submitFeedback(game.feedbackRow({ kind: 'fun' }), offline)), false, 'offline');
  });

  testAsync('feedback: an empty report is never sent', async () => {
    let sent = false;
    await game.submitFeedback(null, async () => { sent = true; });
    is(sent, false, 'not sent');
  });

  test('F mid-run calls mercy, and the report remembers the run', () => {
    const wasTitling = game.titling;
    game.titling = false;
    game.entry = null;
    freshGame();
    pressKey('f');
    is(game.feedbackOpen, true, 'open');
    is(game.phase, 'paused', 'mercy');
    is(game.feedbackContextNow.screen, 'run', 'the screen it was opened from');

    // Keys are the card's: an arrow neither steers nor resumes.
    pressKey('ArrowUp');
    pressKey(' ');
    is([game.phase, game.turnQueue.length], ['paused', 0], 'nothing reaches the game');

    pressKey('Escape');
    is(game.feedbackOpen, false, 'Esc closes');
    is(game.phase, 'paused', 'still in mercy: Continue is the way back');
    game.toggleMercy();
    game.titling = wasTitling;
  });

  test('choosing a kind twice unchooses it', () => {
    game.pickFeedbackKind('idea');
    is(game.feedbackKind, 'idea', 'chosen');
    game.pickFeedbackKind('idea');
    is(game.feedbackKind, null, 'unchosen');
  });
});

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

// A test whose promise never settles leaves nothing for Node to wait on,
// and Node then exits 0 without printing a report - which looks like a
// pass. Found when a fake network answered one request of three.
let reported = false;
process.on('exit', () => {
  if (reported) return;
  console.log('\nFAIL  a test never finished, so there is no report');
  process.exitCode = 1;
});

Promise.all(pending).then(() => {
  reported = true;
  console.log('\n' + '-'.repeat(40));
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
});
