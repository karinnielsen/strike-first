
// ---- MOCK: dojo select as a screen of its own (UNR-114). Not shipped. ----
// The crest stays; everything else - board, stats, hints - steps aside and
// the select takes the page. The art is sized to the window, not the board.
// ?art=hd      PR #6's higher-density pixel crests (default)
// ?art=square  PR #6's original square crests
// ?art=pixel   the 18px badges scaled up by a whole number - too chunky, rejected
// ?seconds=N   countdown length, default 30
// ?fresh=1     forget that a card was ever flipped, to see the nudge again
addEventListener('load', () => {
  const q = new URLSearchParams(location.search);
  const art = q.get('art') || 'hd';
  const SECONDS = Number(q.get('seconds')) || 30;
  const still = REDUCED_MOTION.matches;
  const FILES = { 'cobra-kai': 'cobrakai', 'miyagi-do': 'miyagido', 'eagle-fang': 'eaglefang' };
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  if (q.get('fresh')) { try { localStorage.removeItem('mockFlipped'); } catch {} }

  // Each dojo's voice and standing. Draft copy. The standing is fixture data;
  // the real screen would read it from dojo_players, as the board already does.
  // The sensei named is each dojo's founder: one clear rule, where Cobra Kai
  // alone has had three senseis.
  const DOJO = {
    'cobra-kai':  { glow: '255, 255, 0',   creed: 'Strike first. Strike hard. No mercy.', welcome: 'Welcome to Cobra Kai.',
                    sensei: 'John Kreese',    place: '1st of 3', team: 726, students: 14, top: 'JLR · 260' },
    'miyagi-do':  { glow: '211, 38, 47',   creed: 'Karate is for defence only.',          welcome: 'Wax on, wax off.',
                    sensei: 'Mr. Miyagi',     place: '2nd of 3', team: 708, students: 9,  top: 'DAN · 254' },
    'eagle-fang': { glow: '236, 230, 218', creed: 'Fear does not exist. Neither do rules.', welcome: 'Eagle Fang. Badass.',
                    sensei: 'Johnny Lawrence', place: '3rd of 3', team: 248, students: 3,  top: 'MIG · 248' },
  };

  const style = document.createElement('style');
  style.textContent = `
    body.selecting .scores, body.selecting #stage, body.selecting #hint, body.selecting #version { display: none; }
    body.selecting .wrap { display: block; width: 100vw; box-sizing: border-box; position: relative; z-index: 1; }
    body.selecting h1.crest { margin: 0 0 52px; }

    /* The room takes on the highlighted dojo's light, from below, like a stage. */
    .dojo-aura {
      position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0;
      background: radial-gradient(ellipse 70% 55% at 50% 72%, rgba(var(--glow), .16), transparent 70%);
      transition: opacity .35s;
    }
    body.selecting .dojo-aura { opacity: 1; }

    /* Three groups - what to do, the choice, how - 52px apart, and 10px
       inside each, the same rhythm as the board. */
    .dojo-select { display: grid; justify-items: center; text-align: center; gap: 52px; }
    .dojo-select[hidden] { display: none; }
    .dojo-select .group { display: grid; justify-items: center; gap: 10px; }
    .dojo-select h2 {
      margin: 0; font-size: 26px; letter-spacing: 6px; color: var(--yellow); text-transform: uppercase;
      text-shadow: 0 0 18px rgba(255,255,0,.35);
    }
    .dojo-select .time { display: grid; justify-items: center; gap: 2px; }
    .dojo-select .time small { font-size: 11px; letter-spacing: 4px; color: var(--dim); }
    .dojo-select .count { font-size: 44px; font-weight: bold; line-height: 1.05; color: var(--text); font-variant-numeric: tabular-nums; }
    .dojo-select .count.late { color: var(--yellow); text-shadow: 0 0 16px rgba(255,255,0,.5); }
    .dojo-select .count.beat { animation: beat .35s ease-out; }
    @keyframes beat { from { transform: scale(1.35); } to { transform: scale(1); } }
    .dojo-select .how { margin: 0; font-size: 13px; color: var(--dim); }

    /* ---- the cards ---- */
    .dojo-select ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, auto); gap: var(--gap); }
    .dojo-select li {
      display: grid; justify-items: center; gap: 12px;
      color: var(--dim); transition: color .15s, transform .3s, opacity .3s;
    }
    /* No scale and no lift: scaled text renders between pixels and blurs. */
    .dojo-select li.on { color: rgb(var(--glow)); }

    .dojo-select .pick { all: unset; display: block; cursor: pointer; }
    .dojo-select .pick:focus-visible { outline: none; }
    /* The card turns as a whole - frame, glow and all - like a real one. It is
       only 3D while it turns (see turn()); at rest it is flat and sharp, and
       flipped just means which face is showing. */
    .dojo-select .card { display: grid; }
    .dojo-select .face.back, .dojo-select li.flipped .face.front { visibility: hidden; }
    .dojo-select li.flipped .face.back { visibility: visible; }
    .dojo-select li.tease .card { animation: tease .9s ease-in-out; }
    @keyframes tease { 35% { transform: perspective(900px) rotateY(-32deg); } 65% { transform: perspective(900px) rotateY(8deg); } }

    .dojo-select .face {
      grid-area: 1 / 1; box-sizing: border-box;
      display: grid; justify-items: center; align-content: start; gap: 18px;
      padding: 24px 20px 18px;
      border: 3px solid transparent; border-radius: 12px;
      transition: border-color .15s, box-shadow .15s;
    }
    .dojo-select .face.back { align-content: center; gap: 16px; background: rgba(9, 9, 11, .55); }
    .dojo-select li.on .face {
      border-color: rgb(var(--glow));
      box-shadow: 0 0 32px rgba(var(--glow), .4), inset 0 0 22px rgba(var(--glow), .14);
    }

    .dojo-select .name { font-size: 20px; letter-spacing: 3px; text-transform: uppercase; }
    .dojo-select .art { width: var(--art); height: var(--art); filter: brightness(.4) grayscale(.6); transition: filter .15s; }
    .dojo-select .art svg, .dojo-select .art img { display: block; width: 100%; height: 100%; }
    .dojo-select li.on .art { filter: none; }

    /* Each dojo's creed sits on its own card, so it reads as that dojo's style.
       Three lines are always reserved so the cards stay level. */
    .dojo-select .creed {
      max-width: max(var(--art), 160px); min-height: calc(3 * 1.4em); margin-top: -4px;
      font-size: 14px; line-height: 1.4; letter-spacing: .5px; text-wrap: balance;
      color: var(--dim); transition: color .15s;
    }
    .dojo-select li.on .creed { color: var(--text); }

    /* The back is the stats list the short-screen layout already uses:
       label left, value right, a line under each. */
    .dojo-select .stats { margin: 0; width: max(var(--art), 160px); font-size: 13px; }
    .dojo-select .stats div {
      display: flex; justify-content: space-between; align-items: baseline;
      padding: 9px 0; border-bottom: 1px solid var(--line);
    }
    .dojo-select .stats dt { color: var(--dim); white-space: nowrap; }
    .dojo-select .stats dd { white-space: nowrap; margin: 0 0 0 12px; font-weight: bold; color: var(--text); font-size: 15px; }
    .dojo-select .sensei { display: grid; gap: 4px; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--dim); }
    .dojo-select .sensei b { font-size: 16px; letter-spacing: 1px; text-transform: none; color: rgb(var(--glow)); }

    /* The flip control, for fingers and mice: a tap on the card itself picks.
       Under the card rather than on it, so it never crowds either face. */
    .dojo-select .flip {
      all: unset; cursor: pointer; padding: 6px 12px; border-radius: 999px;
      font-size: 12px; letter-spacing: 1px; color: var(--dim); border: 1px solid var(--line);
      transition: color .15s, border-color .15s;
    }
    .dojo-select li.on .flip { color: rgb(var(--glow)); border-color: rgba(var(--glow), .5); }
    .dojo-select .flip:hover { background: rgba(var(--glow), .15); }

    /* Arrival: the title slams, then each dojo drops in on a beat. Filled
       backwards only, so the lift on the lit card still applies afterwards. */
    .dojo-select.arrive h2 { animation: slam .45s cubic-bezier(.2, 1.6, .4, 1) both; }
    .dojo-select.arrive li { animation: drop .5s cubic-bezier(.2, 1.4, .4, 1) backwards; }
    .dojo-select.arrive li:nth-child(1) { animation-delay: .35s; }
    .dojo-select.arrive li:nth-child(2) { animation-delay: .55s; }
    .dojo-select.arrive li:nth-child(3) { animation-delay: .75s; }
    @keyframes slam { from { transform: scale(2.6); opacity: 0; letter-spacing: 30px; } }
    @keyframes drop { from { transform: translateY(-60px) scale(.8); opacity: 0; } }

    /* The pick is choreographed in choose(), one beat at a time. Here only
       the part CSS can own: the other two dojos step out of the way. */
    .dojo-select.chosen li:not(.picked) { opacity: 0; transition: opacity .25s ease-out; }
    .dojo-select.chosen .flip { opacity: 0; }

    /* Pinned to the window and outside .wrap, so nothing the page does can
       re-anchor it. Centred by the grid, not a transform, because choose()
       animates its transform. */
    .dojo-verdict { position: fixed; inset: 0; z-index: 5; pointer-events: none; display: grid; align-content: center; }
    .dojo-verdict[hidden] { display: none; }
    .dojo-verdict .band {
      display: grid; justify-items: center; gap: 10px;
      padding: 28px 16px 32px; background: rgba(9, 9, 11, .9);
      border-block: 2px solid rgba(var(--glow), .7);
    }
    .dojo-verdict b {
      font-size: clamp(40px, 8vw, 96px); letter-spacing: .12em; color: rgb(var(--glow)); text-transform: uppercase;
      text-shadow: 0 0 30px rgba(var(--glow), .6), 0 6px 0 rgba(0,0,0,.8);
    }
    .dojo-verdict span { font-size: 16px; color: var(--text); }

    /* No turning and no slams: the back simply replaces the front. */
    @media (prefers-reduced-motion: reduce) {
      .dojo-select *, .dojo-verdict * { animation: none !important; transition: none !important; }
      .dojo-select li.on { transform: none; }
    }

    .dojo-line { margin: 0; font-size: 13px; color: var(--dim); }
    .dojo-line a { color: var(--dim); text-decoration: underline; cursor: pointer; }

    .mock-switch { position: fixed; top: 8px; right: 12px; font-size: 12px; color: var(--dim); z-index: 9; }
    .mock-switch a { color: var(--dim); margin-left: 8px; }
    .mock-switch a.cur { color: var(--text); }
  `;
  document.head.appendChild(style);

  const aura = document.createElement('div');
  aura.className = 'dojo-aura';
  document.body.prepend(aura);

  const artFor = (id) => art === 'pixel' ? badgeSvg(id)
    : `<img alt="" src="/design/leaderboard-compare/crests/${FILES[id]}-${art === 'hd' ? 'pixel-high-density' : 'square'}.png">`;

  const panel = document.createElement('section');
  panel.className = 'dojo-select';
  panel.innerHTML = `
    <div class="group"><h2>Choose your dojo</h2>
      <div class="time"><small>TIME</small><div class="count"></div></div></div>
    <ul>${DOJO_IDS.map(id => { const d = DOJO[id]; return `
      <li style="--glow:${d.glow}">
        <button class="pick" type="button" data-dojo="${id}" aria-label="${DOJO_NAMES[id]}">
          <span class="card">
            <span class="face front">
              <span class="art">${artFor(id)}</span>
              <span class="name">${DOJO_NAMES[id]}</span>
              <span class="creed">${d.creed}</span>
            </span>
            <span class="face back" aria-hidden="true">
              <span class="name">${DOJO_NAMES[id]}</span>
              <dl class="stats">
                <div><dt>place</dt><dd>${d.place}</dd></div>
                <div><dt>team score</dt><dd>${d.team}</dd></div>
                <div><dt>students</dt><dd>${d.students}</dd></div>
                <div><dt>top</dt><dd>${d.top}</dd></div>
              </dl>
              <span class="sensei">Sensei<b>${d.sensei}</b></span>
            </span>
          </span>
        </button>
        <button class="flip" type="button" tabindex="-1" aria-label="flip ${DOJO_NAMES[id]}">↻ flip</button>
      </li>`; }).join('')}</ul>
    <div class="group"><p class="how">← → or tab to choose · ↑ ↓ to flip · enter to bow in</p></div>`;
  document.querySelector('header').after(panel);

  const verdict = document.createElement('div');
  verdict.className = 'dojo-verdict';
  verdict.hidden = true;
  verdict.innerHTML = '<div class="band"><b></b><span></span></div>';
  document.body.appendChild(verdict);

  // The PNGs carry an opaque, not-quite-black ground. Knock it out to
  // transparent here, in the mock only; shipped art should arrive transparent.
  for (const img of panel.querySelectorAll('.art img')) {
    const src = new Image();
    src.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 600;
      const g = c.getContext('2d'); g.drawImage(src, 0, 0, 600, 600);
      const d = g.getImageData(0, 0, 600, 600), px = d.data;
      for (let i = 0; i < px.length; i += 4) {
        const m = Math.max(px[i], px[i + 1], px[i + 2]);
        px[i + 3] = m <= 18 ? 0 : m >= 34 ? 255 : Math.round((m - 18) / 16 * 255);
      }
      g.putImageData(d, 0, 0);
      img.src = c.toDataURL();
    };
    src.src = img.getAttribute('src');
    img.removeAttribute('src');
  }

  const sw = document.createElement('div');
  sw.className = 'mock-switch';
  sw.innerHTML = 'mock art:' + [['hd', 'hi-density'], ['square', 'square']]
    .map(([k, l]) => `<a class="${k === art ? 'cur' : ''}" href="?art=${k}">${l}</a>`).join('') +
    ' <a href="#" id="mock-replay">replay</a> <a href="?fresh=1">nudge again</a>';
  document.body.appendChild(sw);

  // Size the art from the room actually left once everything else is laid out,
  // but never so large the cards outweigh the crest (400x144), which stays the
  // loudest thing on the page. ?max=N to try other caps.
  const ART_MAX = Number(q.get('max')) || 180;
  function fit() {
    if (panel.hidden) return;
    panel.style.setProperty('--art', '0px');
    const rest = document.querySelector('.wrap').getBoundingClientRect().height;
    const byHeight = innerHeight - rest - 24;
    const gap = Math.max(16, Math.min(56, innerWidth * 0.035));
    const byWidth = (innerWidth - 48 - gap * 2) / 3 - 60;
    const room = Math.min(byHeight, byWidth);
    const px = art === 'pixel' ? 18 * Math.max(6, Math.min(18, Math.floor(room / 18)))
      : Math.round(Math.max(120, Math.min(ART_MAX, room)));
    panel.style.setProperty('--art', px + 'px');
    panel.style.setProperty('--gap', gap + 'px');
    panel.dataset.px = px;
  }
  addEventListener('resize', fit);

  const cards = [...panel.querySelectorAll('li')];
  const picks = cards.map(li => li.querySelector('.pick'));
  const countEl = panel.querySelector('.count');
  const ov = document.getElementById('overlay');
  const line = document.createElement('p');
  line.className = 'dojo-line';
  ov.insertBefore(line, document.getElementById('play-btn'));

  let at = -1, left, timer, open = false;

  function highlight(i) {
    const next = (i + cards.length) % cards.length;
    if (next === at) return;
    if (at >= 0 && cards[at].classList.contains('flipped')) turn(cards[at]);   // face-up again as the highlight leaves
    at = next;
    const id = DOJO_IDS[at];
    cards.forEach((c, j) => c.classList.toggle('on', j === at));
    if (open) picks[at].focus({ preventScroll: true });   // keyboard focus follows the highlight
    aura.style.setProperty('--glow', DOJO[id].glow);
  }
  function flip(i) {
    if (!open) return;
    highlight(i);
    turn(cards[at]);
    store.set('mockFlipped', '1');
  }
  // Half a turn away, swap the face while it is edge-on, half a turn back.
  // 3D only for those 400ms, so nothing at rest sits in a blurred 3D layer.
  function turn(li) {
    if (still) { li.classList.toggle('flipped'); return; }
    if (li.turning) return;
    li.turning = true;
    const card = li.querySelector('.card');
    const edge = (deg) => ({ transform: `perspective(900px) rotateY(${deg}deg)` });
    card.animate([edge(0), edge(90)], { duration: 170, easing: 'ease-in' }).finished
      .then(() => { li.classList.toggle('flipped'); return card.animate([edge(-90), edge(0)], { duration: 230, easing: 'ease-out' }).finished; })
      .finally(() => { li.turning = false; });
  }
  function tick() {
    countEl.textContent = left;
    countEl.classList.toggle('late', left <= 5);
    if (left <= 5) { countEl.classList.remove('beat'); void countEl.offsetWidth; countEl.classList.add('beat'); }
  }
  function openSelect() {
    open = true; at = -1;
    const r = DOJO_IDS.indexOf(store.get('mockDojo'));
    cards.forEach(c => c.classList.remove('picked', 'on', 'flipped', 'tease'));
    panel.classList.remove('chosen');
    verdict.hidden = true;
    left = SECONDS; tick();
    document.body.classList.add('selecting');
    panel.hidden = false;
    fit();
    panel.classList.remove('arrive'); void panel.offsetWidth; panel.classList.add('arrive');
    // The highlight lands once the dojos have arrived. Until someone has
    // flipped a card, the lit one turns a little, once, to show that it can.
    setTimeout(() => {
      if (!open || at >= 0) return;
      highlight(r >= 0 ? r : Math.floor(Math.random() * 3));
      if (!still && !store.get('mockFlipped')) setTimeout(() => open && cards[at].classList.add('tease'), 700);
    }, still ? 0 : 1100);
    clearInterval(timer);
    timer = setInterval(() => {
      if (document.hidden) return;          // stopped while the tab is hidden
      left -= 1; tick();
      if (left <= 0) choose(at < 0 ? 0 : at, true);
    }, 1000);
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const SETTLE = 'cubic-bezier(.2, .8, .2, 1)';   // firm arrival, no overshoot
  const band = verdict.querySelector('.band');
  const vName = verdict.querySelector('b');
  const vLine = verdict.querySelector('span');

  // The pick lands like a kick, in beats:
  //   chamber  the card draws back, the others step away    (anticipation)
  //   strike   the band snaps out of the card, accelerating  (fast, ease-in)
  //   impact   a split-second freeze, a flash, the band gives (hit-stop)
  //   settle   the name comes down to size, the line follows
  //   hold     a moment to read it
  //   leave    band closes to a line, the select fades, the start screen fades in
  // The impact lives on the band, never the page: no shake.
  async function choose(i, timedOut) {
    if (!open) return;
    highlight(i);
    open = false; clearInterval(timer);
    const li = cards[i], id = DOJO_IDS[i], glow = DOJO[id].glow;
    li.classList.add('picked');
    panel.classList.add('chosen');
    store.set('mockDojo', id);
    verdict.style.setProperty('--glow', glow);
    vName.textContent = DOJO_NAMES[id] + '!';
    vLine.textContent = timedOut ? 'Too slow. Sensei chose for you.' : DOJO[id].welcome;

    if (still) { verdict.hidden = false; await wait(1400); return close(id); }

    // chamber
    const card = li.querySelector('.card');
    await card.animate([{ transform: 'none', filter: 'none' }, { transform: 'scale(.94)', filter: 'brightness(1.35)' }],
      { duration: 150, easing: 'cubic-bezier(.3, 0, .2, 1)', fill: 'forwards' }).finished;

    // strike
    verdict.hidden = false;
    vName.style.opacity = 0; vLine.style.opacity = 0;
    const c = card.getBoundingClientRect(), bb = band.getBoundingClientRect();
    const dy = (c.top + c.height / 2) - (bb.top + bb.height / 2);
    li.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: 'linear', fill: 'forwards' });
    await band.animate([
      { transform: `translateY(${dy}px) scaleY(${c.height / bb.height})`,
        clipPath: `inset(0px ${c.left}px 0px ${innerWidth - c.right}px round 12px)` },
      { transform: 'none', clipPath: 'inset(0px 0px 0px 0px round 0px)' },
    ], { duration: 120, easing: 'cubic-bezier(.6, 0, 1, .5)', fill: 'both' }).finished;

    // impact: the name is already there, oversized, and holds for a beat
    // before it settles - that held frame is what reads as contact.
    vName.style.opacity = ''; vLine.style.opacity = '';
    band.animate([{ transform: 'scaleY(1.1)' }, { transform: 'none' }], { duration: 220, easing: SETTLE });
    band.animate([{ backgroundColor: `rgba(${glow}, .55)`, borderColor: `rgb(${glow})` },
                  { backgroundColor: 'rgba(9, 9, 11, .9)', borderColor: `rgba(${glow}, .7)` }],
      { duration: 320, easing: 'ease-out' });
    const settle = vName.animate([
      { opacity: 1, transform: 'scale(1.14)' },
      { opacity: 1, transform: 'scale(1.14)', offset: .22 },
      { opacity: 1, transform: 'none' },
    ], { duration: 280, easing: SETTLE, fill: 'both' });
    const follow = vLine.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
      { duration: 260, delay: 220, easing: SETTLE, fill: 'both' });
    await Promise.all([settle.finished, follow.finished]);

    await wait(1000);   // hold

    const out = { duration: 280, easing: 'ease-in', fill: 'forwards' };
    await Promise.all([
      band.animate([{ clipPath: 'inset(0% 0px 0% 0px)' }, { clipPath: 'inset(50% 0px 50% 0px)' }], out).finished,
      vName.animate([{ opacity: 1 }, { opacity: 0 }], { ...out, duration: 180 }).finished,
      vLine.animate([{ opacity: 1 }, { opacity: 0 }], { ...out, duration: 180 }).finished,
      panel.animate([{ opacity: 1 }, { opacity: 0 }], out).finished,
    ]);
    close(id);
    for (const el of [document.getElementById('stage'), document.querySelector('.scores'), document.getElementById('hint')]) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: 'ease-out' });
    }
  }
  function close(id) {
    panel.hidden = true;
    verdict.hidden = true;
    document.body.classList.remove('selecting');
    // Drop the pick's own animations (not the CSS ones), so the next visit starts clean.
    for (const el of [panel, band, vName, vLine, ...cards, ...cards.map((c) => c.querySelector('.card'))]) {
      el.getAnimations().filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition)).forEach((a) => a.cancel());
    }
    line.innerHTML = `Dojo: ${DOJO_NAMES[id]} \u00b7 <a>change</a>`;
    line.querySelector('a').onclick = openSelect;
  }

  cards.forEach((c, i) => {
    c.addEventListener('mouseenter', () => open && highlight(i));
    c.addEventListener('animationend', (e) => e.animationName === 'tease' && c.classList.remove('tease'));
    picks[i].addEventListener('click', () => choose(i));
    c.querySelector('.flip').addEventListener('click', () => flip(i));
  });
  document.getElementById('mock-replay').onclick = (e) => { e.preventDefault(); openSelect(); };

  // Ahead of the game's own handler, and swallowed while the select is up.
  window.addEventListener('keydown', (e) => {
    if (!open) return;
    const k = e.key;
    const from = at < 0 ? 0 : at;
    if (k === 'ArrowLeft' || k === 'a') highlight(from - 1);
    else if (k === 'ArrowRight' || k === 'd') highlight(at < 0 ? 0 : at + 1);
    // Tab walks the dojos too, and wraps rather than leaving the screen.
    else if (k === 'Tab') highlight(at < 0 ? 0 : at + (e.shiftKey ? -1 : 1));
    else if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'w' || k === 's') flip(from);
    else if (k === 'Enter' || k === ' ') choose(from);
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);

  openSelect();
});
