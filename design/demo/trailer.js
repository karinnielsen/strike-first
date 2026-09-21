
// --- TRAILER RECORDER, scratch tooling only, never shipped ------------
// Appended inside the game's own <script> by design/demo/build-trailer.js,
// like autopilot.js. Press Record, share this tab WITH its audio, and it
// plays one Arcade run by itself through real key events - title, dojo
// select, a run that climbs to a promotion near top speed, the crash and
// the verdict - then saves the recording as a .webm in Downloads.
//
// The promotion lands late on purpose: the local hi-score is set just
// under a belt, so it arrives when the game is fast and busy. That's the
// stretch the README gif is cut from. UNR-177.
(function () {
  const PROMOTE_AT = Number(new URLSearchParams(location.search).get('belt')) || 65;   // brown
  const COAST_MOVES = 14;       // moves after the promotion before it lets go
  const TAIL_MS = 3500;         // verdict left on screen before stopping

  // The game has already read these by the time this runs, so set the
  // live values as well as the stored ones.
  // ?fresh starts from nothing: white belt, first promotion at 15.
  best = new URLSearchParams(location.search).has('fresh') ? 0 : PROMOTE_AT - 1;
  localStorage.setItem('strikeFirstBest', String(best));
  bestEl.textContent = best;
  showBestBelt();
  setAudioMode('all');
  commitDojo('cobra-kai');

  // It eats one rotten egg on purpose, late: the queasy green and the red
  // minus are part of what the game is. Near a belt the game always puts
  // one beside the egg, so it arrives in the fast stretch.
  const ROTTEN_FROM = PROMOTE_AT - 12;
  let ateRotten = false;
  let chaseFrom = null;

  const key = k => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const KEY_FOR = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };

  function firstStepTowards(goal) {
    const head = snake[0];
    const blocked = new Set(snake.map(s => s.x + ',' + s.y));
    if (visitor && visitor.kind === 'rotten' && goal !== visitor) blocked.add(visitor.x + ',' + visitor.y);
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

  // How many squares the head could still reach after stepping `d`. A
  // step into a pocket smaller than the snake is a slow death, which is
  // how the second recording ended at 51. The tail is left out of the
  // walls, since it moves on as the head does.
  function roomAfter(d) {
    const head = snake[0];
    const start = { x: head.x + d.x, y: head.y + d.y };
    if (start.x < 0 || start.y < 0 || start.x >= COLS || start.y >= ROWS) return 0;
    const walls = new Set(snake.slice(0, -1).map(s => s.x + ',' + s.y));
    if (walls.has(start.x + ',' + start.y)) return 0;
    const seen = new Set([start.x + ',' + start.y]);
    const stack = [start];
    while (stack.length && seen.size <= snake.length * 2) {
      const c = stack.pop();
      for (const e of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]) {
        const nx = c.x + e.x, ny = c.y + e.y, id = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || walls.has(id) || seen.has(id)) continue;
        seen.add(id);
        stack.push({ x: nx, y: ny });
      }
    }
    return seen.size;
  }

  // The chosen step if it leaves room to live, otherwise the roomiest one.
  function safe(step) {
    if (step && roomAfter(step) > snake.length) return step;
    const options = [direction, {x:-direction.y,y:direction.x}, {x:direction.y,y:-direction.x}];
    return options.reduce((best, d) => (roomAfter(d) > roomAfter(best) ? d : best), options[0]);
  }

  function anySafeStep() {
    const head = snake[0];
    const blocked = new Set(snake.map(s => s.x + ',' + s.y));
    for (const d of [direction, {x:-direction.y,y:direction.x}, {x:direction.y,y:-direction.x}]) {
      const nx = head.x + d.x, ny = head.y + d.y;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (blocked.has(nx + ',' + ny)) continue;
      return d;
    }
    return null;
  }

  // Steers until COAST_MOVES after the promotion, then lets go, so the
  // snake runs into whatever is ahead: a real defeat, not a staged one.
  let promotedAtMove = null;
  let steeredAt = -1;
  function steer() {
    if (phase !== 'playing') return;
    // One decision per move, and only once the last one has been taken.
    // Pressing every 40ms piled turns up in the game's queue, so the snake
    // acted on decisions a step or two stale - and died at 51, then 44.
    if (moves === steeredAt || turnQueue.length) return;
    steeredAt = moves;
    if (score >= PROMOTE_AT && promotedAtMove === null) promotedAtMove = moves;
    if (promotedAtMove !== null && moves - promotedAtMove >= COAST_MOVES) return;
    if (queasy > 0) ateRotten = true;
    let wantRotten = !ateRotten && score >= ROTTEN_FROM && visitor && visitor.kind === 'rotten';
    // The first recording circled for nine seconds instead of eating it,
    // and it didn't reproduce. Whatever the cause, a chase that hasn't
    // landed in 30 moves is abandoned, so the trailer never dawdles.
    if (wantRotten) {
      if (chaseFrom === null) chaseFrom = moves;
      if (moves - chaseFrom > 30) { ateRotten = true; wantRotten = false; }
    }
    const goal = wantRotten || (visitor && visitor.kind === 'mouse') ? visitor : egg;
    const step = safe(firstStepTowards(goal) || anySafeStep());
    const k = step && KEY_FOR[step.x + ',' + step.y];
    if (k) key(k);
  }

  async function perform(recorder) {
    await wait(1500); key('Enter');            // press start: the menu
    await wait(1500); key('Enter');            // Arcade: dojo select
    await wait(2500); key('Enter');            // bow in
    // ?play=me: Karin plays and the recording just waits for the defeat.
    const pilot = new URLSearchParams(location.search).get('play') === 'me' ? 0 : setInterval(steer, 10);
    while (phase !== 'over') await wait(100);
    clearInterval(pilot);
    await wait(TAIL_MS);
    recorder.stop();
  }

  // The run without recording, for checking the pilot.
  window.trailerDryRun = () => perform({ stop() { window.trailerDone = true; } });

  const button = document.createElement('button');
  button.textContent = '● Record trailer';
  button.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:99;padding:10px 16px;' +
    'font:bold 14px ui-monospace,monospace;background:#d3262f;color:#fff;border:0;border-radius:6px;cursor:pointer';
  document.body.append(button);

  button.addEventListener('click', async () => {
    audio();                                   // sound needs this click
    const stream = await navigator.mediaDevices.getDisplayMedia({
      // Light enough for a 2017 Intel Mac: at full Retina size, 60fps and
      // VP9, encoding starved the page and the snake answered keys late.
      video: { displaySurface: 'browser', frameRate: { ideal: 30, max: 30 }, width: { max: 1920 }, height: { max: 1320 } },
      audio: true, preferCurrentTab: true, selfBrowserSurface: 'include', systemAudio: 'include'
    });
    button.remove();
    const chunks = [];
    const type = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8e6 });
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
      a.download = 'strike-first-trailer.webm';
      a.click();
    };
    recorder.start(1000);
    await wait(800);                           // let the capture settle
    perform(recorder);
  });
})();
