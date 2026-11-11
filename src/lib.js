// Small helpers shared by every page. No framework: pages return HTML strings
// and an optional cleanup function.

export const BASE = import.meta.env.BASE_URL;
export const asset = (src) => (/^(https?:)?\/\//.test(src) ? src : BASE + src.replace(/^\//, ''));

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Wrap each character in a span so headlines can animate letter by letter. */
export function splitChars(text) {
  let i = 0;
  return text.split(' ')
    .map((word) => `<span class="w">${[...word].map((c) => `<span class="ch" style="--i:${i++}" aria-hidden="true">${esc(c)}</span>`).join('')}</span>`)
    .join('<span class="sp"> </span>');
}

export const icons = {
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>',
};

/**
 * Render one media item: { type: 'image' | 'video' | 'diagram', src, alt, fit }.
 * Videos autoplay muted and loop; images are lazy unless `eager`.
 */
export function media(m, { eager = false, cls = '' } = {}) {
  if (!m) return '';
  const fit = m.fit === 'contain' ? ' contain' : '';
  const style = [m.bg && `background:${m.bg}`, m.ar && `--ar:${m.ar}`].filter(Boolean).join(';');
  const st = style ? ` style="${style}"` : '';
  if (m.type === 'video') {
    return `<div class="media${fit} ${cls}"${st}><video src="${asset(m.src)}" ${m.poster ? `poster="${asset(m.poster)}"` : ''} muted loop playsinline preload="${eager ? 'auto' : 'metadata'}" aria-label="${esc(m.alt || '')}"></video></div>`;
  }
  if (m.type === 'diagram') return `<div class="media contain ${cls}">${m.svg}</div>`;
  return `<div class="media${fit} ${cls}"${st}><img src="${asset(m.src)}" alt="${esc(m.alt || '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>`;
}

/** Fade/slide elements with [data-reveal] in as they enter the viewport. */
export function observeReveals(root) {
  const items = root.querySelectorAll('[data-reveal]');
  if (reducedMotion()) { items.forEach((n) => n.classList.add('is-in')); return () => {}; }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );
  items.forEach((n) => io.observe(n));
  return () => io.disconnect();
}

/** Play videos only while visible; saves battery and keeps GIF-like loops smooth. */
export function autoplayVideos(root) {
  const vids = root.querySelectorAll('video');
  if (!vids.length) return () => {};
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting && !v.closest('.lens-layer:not(.is-active)')) v.play().catch(() => {});
    else v.pause();
  }), { threshold: 0.25 });
  vids.forEach((v) => io.observe(v));
  return () => io.disconnect();
}

/** Count numbers up once they come into view: "0.942" → animates from 0 keeping decimals. */
export function countUp(root) {
  const nodes = root.querySelectorAll('[data-count]');
  if (reducedMotion()) return () => {};
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const n = e.target;
    const raw = n.textContent;
    const m = raw.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] || '').length;
    const commas = num.includes(',');
    const t0 = performance.now();
    const dur = 1100;
    const fmt = (v) => { let s = v.toFixed(decimals); if (commas) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals }); return pre + s + post; };
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      n.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick); else n.textContent = raw;
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  nodes.forEach((n) => io.observe(n));
  return () => io.disconnect();
}

/** Run `fn` on scroll/resize, throttled to animation frames. */
export function onScroll(fn) {
  let raf = 0;
  const handler = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fn(); }); };
  window.addEventListener('scroll', handler, { passive: true });
  window.addEventListener('resize', handler);
  fn();
  return () => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler); cancelAnimationFrame(raf); };
}
