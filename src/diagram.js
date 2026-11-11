import { esc } from './lib.js';

/**
 * Draw a project's pipeline as an SVG flow. Used as the cover when a project has
 * no screenshot. Colours come from CSS variables so it follows the theme.
 */
export function pipelineSVG(project) {
  const steps = project.pipeline;
  const n = steps.length;
  const W = 1600, H = 1000;
  const padX = 150, top = 200;
  const gap = (W - padX * 2) / (n - 1);
  const ys = steps.map((_, i) => top + 260 + Math.sin((i / (n - 1)) * Math.PI * 1.25) * -120);

  const path = steps.map((_, i) => {
    const x = padX + i * gap, y = ys[i];
    if (i === 0) return `M${x},${y}`;
    const px = padX + (i - 1) * gap, py = ys[i - 1];
    const cx = (px + x) / 2;
    return `C${cx},${py} ${cx},${y} ${x},${y}`;
  }).join(' ');

  const wrap = (t, max = 14) => {
    const words = t.split(' '); const lines = []; let cur = '';
    words.forEach((w) => { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur);
    return lines;
  };

  const nodes = steps.map((s, i) => {
    const x = padX + i * gap, y = ys[i];
    const lines = wrap(s.name);
    const below = i % 2 === 0;
    const ty = below ? y + 78 : y - 58 - (lines.length - 1) * 40;
    return `
      <g class="dg-node" style="--k:${i}">
        <circle cx="${x}" cy="${y}" r="26" fill="var(--paper)" stroke="var(--signal)" stroke-width="5"/>
        <circle cx="${x}" cy="${y}" r="9" fill="var(--signal)"/>
        <text x="${x}" y="${ty}" text-anchor="middle" font-size="36" font-weight="650" fill="var(--ink)" letter-spacing="-0.5">
          ${lines.map((l, j) => `<tspan x="${x}" dy="${j ? 40 : 0}">${esc(l)}</tspan>`).join('')}
        </text>
      </g>`;
  }).join('');

  return `<svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(project.name)} pipeline: ${esc(steps.map((s) => s.name).join(', '))}" font-family="var(--font)">
    <path d="${path}" fill="none" stroke="var(--hair)" stroke-width="5"/>
    <path class="dg-flow" d="${path}" fill="none" stroke="var(--signal)" stroke-width="5" stroke-dasharray="14 22" stroke-linecap="round"/>
    ${nodes}
  </svg>`;
}

/** The cover media for a project: its screenshot, or the drawn pipeline. */
export function coverOf(project) {
  return project.cover || { type: 'diagram', svg: pipelineSVG(project) };
}

/** TTS Context Lab cover: posterior sharpening — wide prior to a narrow peak on the target voice. */
export function sharpeningSVG() {
  const base = 790, T = 1090, maxH = 560, N = 6;
  const op = [0.55, 0.32, 0.46, 0.6, 0.78, 1];
  const r = (v) => Math.round(v * 10) / 10;
  const curve = (i) => {
    const t = i / (N - 1);
    const mu = T - 430 * (1 - t) ** 1.5;          // mean drifts onto the target
    const sg = 205 * (36 / 205) ** t;             // width shrinks geometrically
    const h = maxH * (36 / sg) ** 0.72;           // peak grows as it narrows
    const g = (x) => Math.exp(-0.5 * ((x - mu) / sg) ** 2);
    const e = g(mu + 3 * sg);                     // lift so ±3σ tails meet the baseline
    const pts = [];
    for (let j = 0; j <= 160; j++) {
      const x = mu - 3 * sg + (6 * sg * j) / 160;
      pts.push(`${r(x)},${r(base - (h * (g(x) - e)) / (1 - e))}`);
    }
    return 'M' + pts.join('L');
  };
  const ds = Array.from({ length: N }, (_, i) => curve(i));
  const paths = ds.map((d, i) => `<path class="ts-curve" style="--k:${i}" pathLength="1" d="${d}" fill="none" stroke="var(${i ? '--signal' : '--graphite'})" stroke-opacity="${op[i]}" stroke-width="${i === N - 1 ? 6 : 4}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  return `<svg class="dg ts" viewBox="0 0 1600 1000" role="img" aria-label="Posterior sharpening: as prompt context grows, the predicted voice distribution narrows from a wide prior onto the target voice" font-family="var(--font)">
    <line x1="0" y1="${base}" x2="1600" y2="${base}" stroke="var(--hair)" stroke-width="3"/>
    <path class="ts-fill" d="${ds[N - 1]}Z" fill="var(--signal)" fill-opacity=".1"/>
    <g class="ts-target">
      <line x1="${T}" y1="${base}" x2="${T}" y2="176" stroke="var(--ink)" stroke-opacity=".55" stroke-width="3" stroke-dasharray="10 12"/>
      <text x="${T}" y="142" text-anchor="middle" font-size="34" font-weight="550" letter-spacing="-0.3" fill="var(--graphite)">target voice</text>
    </g>
    ${paths}
    <circle class="ts-target" cx="${T}" cy="${base}" r="9" fill="var(--signal)"/>
  </svg>`;
}
