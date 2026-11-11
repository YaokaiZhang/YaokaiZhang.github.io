import { profile } from '../data/profile.js';
import { esc, icons } from '../lib.js';

export function header(active) {
  const cur = (k) => (active === k ? ' aria-current="page"' : '');
  return `
    <a class="brand" href="#/">${esc(profile.name)}</a>
    <nav class="site-nav" aria-label="Main">
      <a href="#/"${cur('about')}>About</a>
      <a href="#/work"${cur('work')}>Work</a>
      <a class="hide-sm" href="${profile.links.github}" target="_blank" rel="noopener">GitHub</a>
      <button class="theme-toggle" id="theme-toggle" aria-label="Switch colour theme"></button>
    </nav>`;
}

/** Light/dark toggle. Remembers the choice; otherwise follows the system. */
export function bindTheme(root) {
  const btn = root.querySelector('#theme-toggle');
  if (!btn) return;
  const sysDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = () => (document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : sysDark());
  const paint = () => { btn.innerHTML = isDark() ? icons.sun : icons.moon; };
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    paint();
    window.dispatchEvent(new Event('themechange'));
  });
  paint();
}

export { icons };
