import { profile } from '../data/profile.js';
import { esc, icons, asset, observeReveals, reducedMotion } from '../lib.js';

export function renderAbout(app) {
  app.innerHTML = `
    <article class="about wrap">
      <div class="a-main">
        <h1 class="a-title" data-reveal>About me</h1>
        <div class="a-text">
          ${profile.about.map((t, i) => `<p data-reveal style="--d:${100 + i * 120}ms">${esc(t)}</p>`).join('')}
        </div>
        <div class="a-contact" data-reveal style="--d:340ms">
          <a class="pill solid" href="#/work">See my work <span class="arrow">${icons.arrowRight}</span></a>
          <a class="pill" href="${profile.links.github}" target="_blank" rel="noopener">${icons.github}GitHub</a>
          ${profile.links.linkedin ? `<a class="pill" href="${profile.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
        </div>
        ${profile.facts ? `
        <details class="a-facts" data-reveal style="--d:460ms">
          <summary><span class="fx-mark" aria-hidden="true"></span>Outside work</summary>
          <div class="fx-body">
            <p>${esc(profile.facts.lead)}</p>
            <dl>${profile.facts.list.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v).replace(/\S+-\S+/g, (w) => `<span class="nw">${w}</span>`)}</dd></div>`).join('')}</dl>
          </div>
        </details>` : ''}
      </div>
      <div class="a-side">
        <figure class="polaroid" id="polaroid">
          <span class="tape" aria-hidden="true"></span>
          <div class="pol-shot">
            ${profile.photo ? `<img src="${asset(profile.photo)}" alt="${esc(profile.name)}" fetchpriority="high">` : ''}
            <span class="pol-glare" aria-hidden="true"></span>
          </div>
          <figcaption>hi, I'm ${esc(profile.name.split(' ')[0])}</figcaption>
        </figure>
      </div>
    </article>`;

  // the print tilts toward the pointer
  const pol = app.querySelector('#polaroid');

  const onMove = (e) => {
    if (reducedMotion() || e.pointerType === 'touch') return;
    const r = pol.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    pol.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`);
    pol.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`);
    pol.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    pol.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => { pol.style.removeProperty('--rx'); pol.style.removeProperty('--ry'); };
  pol.addEventListener('pointermove', onMove);
  pol.addEventListener('pointerleave', onLeave);

  return observeReveals(app);
}
