import { projects } from '../data/projects.js';
import { esc, splitChars, media, icons, observeReveals, autoplayVideos, countUp, onScroll, reducedMotion } from '../lib.js';
import { coverOf } from '../diagram.js';

export function renderProject(app, slug) {
  const i = projects.findIndex((p) => p.slug === slug);
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  const cover = coverOf(p);
  const steps = p.pipeline;

  const link = (l) => `<a class="pill${l.primary ? ' solid' : ''}" href="${l.href}" target="_blank" rel="noopener">${l.href.includes('github.com') && !l.href.includes('.pdf') ? icons.github : icons.doc}${esc(l.label)}</a>`;

  const facts = p.context.facts?.length ? `
    <div class="ctx-facts">
      ${p.context.facts.map((f, k) => `<div data-reveal style="--d:${k * 80}ms"><strong data-count>${esc(f.value)}</strong><span>${esc(f.label)}</span></div>`).join('')}
    </div>` : '';

  const highlight = (h, k) => `
    <article class="hl" data-reveal>
      <h3>${esc(h.title)}</h3>
      <div class="hl-body">
        ${h.metric ? `<div class="hl-metric"><strong data-count>${esc(h.metric)}</strong><span>${esc(h.metricLabel || '')}</span></div>` : ''}
        <p>${esc(h.text)}</p>
      </div>
    </article>`;

  const figure = (g, k) => `
    <figure class="${g.wide ? 'wide' : ''}" data-reveal="clip">
      ${media(g)}
      ${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}
    </figure>`;

  app.innerHTML = `
    <article class="project">
      <header class="p-hero wrap">
        <a class="back" href="#/work" aria-label="All work">${icons.arrowLeft}</a>
        <h1 class="p-title${p.name.length > 14 ? ' is-long' : ''}" aria-label="${esc(p.name)}">${splitChars(p.name)}</h1>
        <div class="p-sub">
          <p class="p-tagline" data-reveal>${esc(p.tagline)}</p>
          <dl class="p-meta" data-reveal style="--d:120ms">
            <dt>Type</dt><dd>${esc(p.kind)}</dd>
            <dt>Keywords</dt><dd>${p.stack.map(esc).join(', ')}</dd>
          </dl>
          <div class="p-links" data-reveal style="--d:200ms">${p.links.map(link).join('')}</div>
        </div>
        <figure class="p-cover" data-reveal="clip">
          ${media(cover, { eager: true })}
        </figure>
      </header>

      <section class="chapter wrap" aria-labelledby="ctx-h">
        <div class="ctx">
          <div class="ctx-side">
            <h2 id="ctx-h">${esc(p.context.heading)}</h2>
          </div>
          <div class="ctx-body" id="ctx-body">
            ${p.context.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}
          </div>
        </div>
        ${facts}
      </section>

      <section class="chapter wrap" aria-labelledby="pipe-h">
        <div class="pipe" id="pipe" style="height:${(steps.length + 1) * 62}vh">
          <div class="pipe-sticky">
            <h2 class="chapter-label" id="pipe-h">Pipeline</h2>
            <div class="pipe-grid">
              <ol class="pipe-steps" id="pipe-steps">
                <span class="pipe-track" aria-hidden="true"></span><span class="pipe-fill" id="pipe-fill" aria-hidden="true"></span>
                ${steps.map((s, k) => `<li class="pipe-step" data-k="${k}">${esc(s.name)}</li>`).join('')}
              </ol>
              <div class="pipe-detail">
                ${steps.map((s, k) => `
                  <div class="pipe-card" data-k="${k}">
                    <h3>${esc(s.name)}</h3>
                    <p>${esc(s.text)}</p>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter wrap" aria-labelledby="hl-h">
        <h2 class="chapter-label" id="hl-h">Highlights</h2>
        <div class="hl-list">${p.highlights.map(highlight).join('')}</div>
        ${p.caveat ? `<p class="p-note">${esc(p.caveat)}</p>` : ''}
      </section>

      ${p.gallery.length ? `
      <section class="chapter wrap" aria-label="Screens and figures">
        <div class="gallery">${p.gallery.map(figure).join('')}</div>
      </section>` : ''}

      <nav class="next wrap" aria-label="Next project">
        <a href="#/work/${next.slug}">
          <span class="next-name">${esc(next.name)} ${icons.arrowRight}</span>
        </a>
      </nav>
    </article>
  `;

  // --- context: light up the paragraph being read ---
  const paras = [...app.querySelectorAll('#ctx-body p')];
  // --- pipeline: scrub through steps while the section is pinned ---
  const pipe = app.querySelector('#pipe');
  const stepEls = [...app.querySelectorAll('.pipe-step')];
  const cards = [...app.querySelectorAll('.pipe-card')];
  const fill = app.querySelector('#pipe-fill');
  let activeStep = -1;

  const setStep = (k) => {
    if (k === activeStep) return;
    activeStep = k;
    stepEls.forEach((el, j) => { el.classList.toggle('is-active', j === k); el.classList.toggle('is-past', j < k); });
    cards.forEach((c, j) => c.classList.toggle('is-active', j === k));
    const a = stepEls[0], b = stepEls[k];
    if (a && b) fill.style.height = `${b.offsetTop + b.offsetHeight / 2 - (a.offsetTop + a.offsetHeight / 2)}px`;
  };
  setStep(0);
  stepEls.forEach((el, k) => el.addEventListener('click', () => {
    const r = pipe.getBoundingClientRect();
    const span = pipe.offsetHeight - window.innerHeight;
    window.scrollTo({ top: window.scrollY + r.top + span * ((k + 0.5) / steps.length), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }));

  const stopScroll = onScroll(() => {
    const vh = window.innerHeight;
    // reading highlight: the paragraph nearest 42% of the viewport is lit
    if (window.innerWidth > 820) {
      let best = 0, bestD = Infinity;
      paras.forEach((el, k) => { const r = el.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh * 0.42); if (d < bestD) { bestD = d; best = k; } });
      paras.forEach((el, k) => el.classList.toggle('is-lit', k === best));
    }
    // pipeline progress
    const r = pipe.getBoundingClientRect();
    const span = pipe.offsetHeight - vh;
    if (span > 0) {
      const prog = Math.min(0.999, Math.max(0, -r.top / span));
      setStep(Math.floor(prog * steps.length));
    }
  });

  const stops = [observeReveals(app), autoplayVideos(app), countUp(app), stopScroll];
  return () => stops.forEach((s) => s());
}
