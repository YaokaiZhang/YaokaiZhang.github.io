import { projects } from '../data/projects.js';
import { esc, splitChars, media, icons, autoplayVideos, observeReveals, reducedMotion } from '../lib.js';
import { coverOf } from '../diagram.js';

let lastIndex = 0; // remember the carousel position when coming back from a case study
let nudged = false; // hint the swipe once per page load

export function renderHome(app) {
  const facts = (p) => `<span>${esc(p.kind)}</span>`;

  app.innerHTML = `
    <section class="showcase" aria-label="Selected work">
      <div class="stage" id="stage">
        <div class="stage-copy">
          <div class="bigname-wrap" id="bigname-wrap" aria-live="polite"></div>
          <div class="stage-meta" id="stage-meta">
            ${projects.map((p, i) => `
              <div class="is-hidden" data-i="${i}">
                <p class="tagline">${esc(p.tagline)}</p>
                <p class="facts">${facts(p)}</p>
                <a class="open-case" href="#/work/${p.slug}" tabindex="-1">Open <span class="arrow">${icons.arrowRight}</span></a>
              </div>`).join('')}
          </div>
        </div>
        <div class="lens-wrap">
          <a class="lens" id="lens" href="#/work/${projects[0].slug}" aria-label="Open case study" draggable="false">
            ${projects.map((p, i) => `<div class="lens-layer" data-i="${i}">${media(coverOf(p), { eager: i < 2 })}</div>`).join('')}
          </a>
        </div>
      </div>

      <div class="rail-row">
        <div class="rail" id="rail" role="tablist" aria-label="Projects">
          ${projects.map((p, i) => `<button role="tab" data-i="${i}" aria-selected="false">${esc(p.shortName || p.name)}</button>`).join('')}
          <span class="rail-bar" id="rail-bar"></span>
        </div>
        <div class="rail-arrows">
          <button class="step-btn" id="prev" aria-label="Previous project">${icons.arrowLeft}</button>
          <button class="step-btn step-next" id="next" aria-label="Next project">${icons.arrowRight}</button>
        </div>
      </div>
    </section>

    <section class="index wrap" aria-labelledby="index-title">
      <h2 class="section-title" id="index-title" data-reveal>Index</h2>
      <ul class="index-list">
        ${projects.map((p, i) => `
          <li data-reveal style="--d:${i * 50}ms">
            <a class="index-row" href="#/work/${p.slug}">
              <h3>${esc(p.name)}</h3>
              <span class="kind">${esc(p.kind)}</span>
              <span class="go">${icons.arrowRight}</span>
            </a>
          </li>`).join('')}
      </ul>
    </section>
  `;

  const wrap = app.querySelector('#bigname-wrap');
  const metas = [...app.querySelectorAll('#stage-meta > div')];
  const layers = [...app.querySelectorAll('.lens-layer')];
  const tabs = [...app.querySelectorAll('#rail button')];
  const bar = app.querySelector('#rail-bar');
  const rail = app.querySelector('#rail');
  const lens = app.querySelector('#lens');
  let current = -1;
  let busy = 0;

  // shrink the headline until it fits its column (long names, narrow screens)
  function fit(el) {
    el.style.fontSize = '';
    const max = wrap.clientWidth;
    const w = el.scrollWidth;
    if (w > max) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * (max / w) * 0.98}px`;
  }

  function moveBar(i) {
    const t = tabs[i];
    bar.style.width = `${t.offsetWidth}px`;
    bar.style.transform = `translateX(${t.offsetLeft}px)`;
    const target = t.offsetLeft - rail.clientWidth / 2 + t.offsetWidth / 2;
    rail.scrollTo({ left: target, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  function show(i, dir = 1) {
    i = (i + projects.length) % projects.length;
    if (i === current) return;
    const p = projects[i];
    const prev = current;
    current = i;
    lastIndex = i;

    // headline: old letters fly out, new ones rise in
    const old = wrap.querySelector('.bigname:not(.is-out)');
    if (old) { old.classList.remove('is-in'); old.classList.add('is-out'); setTimeout(() => old.remove(), 900); }
    const name = document.createElement('a');
    name.className = 'bigname' + (p.name.length > 14 ? ' is-long' : '');
    name.href = `#/work/${p.slug}`;
    name.setAttribute('aria-label', p.name);
    name.innerHTML = splitChars(p.name);
    wrap.appendChild(name);
    fit(name);
    requestAnimationFrame(() => requestAnimationFrame(() => name.classList.add('is-in')));

    metas.forEach((m, k) => {
      m.classList.toggle('is-hidden', k !== i);
      m.querySelector('a').tabIndex = k === i ? 0 : -1;
    });

    // media: incoming layer wipes in from the direction of travel
    layers.forEach((l, k) => {
      l.classList.remove('is-leaving');
      if (k === prev) { l.classList.remove('is-active'); l.classList.add('is-leaving'); }
      else if (k !== i) l.classList.remove('is-active');
    });
    const inc = layers[i];
    inc.classList.toggle('from-left', dir < 0);
    inc.style.transition = 'none';
    inc.classList.remove('is-active');
    void inc.offsetWidth;
    inc.style.transition = '';
    inc.classList.add('is-active');
    clearTimeout(busy);
    busy = setTimeout(() => layers.forEach((l, k) => k !== i && l.classList.remove('is-leaving')), 1050);

    layers.forEach((l, k) => { const v = l.querySelector('video'); if (v) { if (k === i) v.play().catch(() => {}); else v.pause(); } });

    lens.href = `#/work/${p.slug}`;
    lens.setAttribute('aria-label', `Open the ${p.name} case study`);
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    moveBar(i);
  }

  const next = () => show(current + 1, 1);
  const prev = () => show(current - 1, -1);
  app.querySelector('#next').addEventListener('click', next);
  app.querySelector('#prev').addEventListener('click', prev);
  tabs.forEach((t, k) => t.addEventListener('click', () => show(k, k > current ? 1 : -1)));

  // keyboard: arrows anywhere on the page while the showcase is visible
  const onKey = (e) => {
    if (e.target.closest('input, textarea')) return;
    if (window.scrollY > window.innerHeight * 0.6) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };
  window.addEventListener('keydown', onKey);

  // swipe / drag on the stage: the cover and headline follow the pointer, then snap
  const stage = app.querySelector('#stage');
  let sx = 0, sy = 0, down = false, moved = false, horiz = null;
  const setDrag = (dx) => stage.style.setProperty('--drag', `${dx}px`);
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    down = true; moved = false; horiz = null; sx = e.clientX; sy = e.clientY;
  });
  stage.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (horiz === null && Math.hypot(dx, dy) > 8) {
      horiz = Math.abs(dx) > Math.abs(dy);
      if (horiz) { stage.classList.add('is-dragging'); stage.setPointerCapture(e.pointerId); }
    }
    if (horiz) setDrag(Math.sign(dx) * Math.min(Math.abs(dx), 220) * 0.45);
  });
  const end = (e) => {
    if (!down) return; down = false;
    stage.classList.remove('is-dragging');
    setDrag(0);
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (horiz && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { moved = true; dx < 0 ? next() : prev(); }
    else if (horiz && Math.abs(dx) > 8) moved = true;
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  stage.addEventListener('dragstart', (e) => e.preventDefault());

  // first visit: nudge the cover once so it reads as swipeable
  let nudgeT = 0;
  if (!nudged && !reducedMotion()) {
    nudged = true;
    nudgeT = setTimeout(() => { stage.classList.add('nudge'); setTimeout(() => stage.classList.remove('nudge'), 1600); }, 1400);
  }

  // horizontal trackpad swipes
  let wheelLock = 0;
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLock < 700) return;
    wheelLock = now;
    e.deltaX > 0 ? next() : prev();
  };
  stage.addEventListener('wheel', onWheel, { passive: false });

  const onResize = () => { moveBar(current); const n = wrap.querySelector('.bigname:not(.is-out)'); if (n) fit(n); };
  window.addEventListener('resize', onResize);

  show(lastIndex, 1);
  const stopVideos = autoplayVideos(app);
  const stopReveal = observeReveals(app);

  return () => {
    clearTimeout(nudgeT);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    stopVideos(); stopReveal();
  };
}
