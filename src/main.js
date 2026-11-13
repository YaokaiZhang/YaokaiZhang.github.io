import './styles/main.css';
import { projects } from './data/projects.js';
import { profile } from './data/profile.js';
import { renderHome } from './pages/home.js';
import { renderProject } from './pages/project.js';
import { renderAbout } from './pages/about.js';
import { header, bindTheme } from './pages/chrome.js';
import { reducedMotion } from './lib.js';
import { initInk } from './ink.js';

// Hash routes work on GitHub Pages without any server rewrites:
//   #/                about me (landing)
//   #/work            carousel + index
//   #/work/<slug>     case study

try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch {}

const ink = initInk();
window.addEventListener('themechange', () => ink.redraw());
const app = document.getElementById('app');
const head = document.getElementById('site-header');
let cleanup = null;
let first = true;

function parse() {
  const [, section = '', slug = ''] = (location.hash.replace(/^#/, '') || '/').split('/');
  if (section === 'work' && projects.some((p) => p.slug === slug)) return { page: 'project', slug };
  if (section === 'work') return { page: 'home' };
  return { page: 'about' };
}

function render() {
  const r = parse();
  const swap = () => {
    cleanup?.();
    head.innerHTML = header(r.page === 'about' ? 'about' : 'work');
    bindTheme(head);
    if (r.page === 'project') {
      cleanup = renderProject(app, r.slug);
      document.title = `${projects.find((p) => p.slug === r.slug).name} — ${profile.name}`;
    } else if (r.page === 'about') {
      cleanup = renderAbout(app);
      document.title = profile.name;
    } else {
      cleanup = renderHome(app);
      document.title = `Work — ${profile.name}`;
    }
    window.scrollTo(0, 0);
    if (!first) app.focus({ preventScroll: true });
    first = false;
  };
  if (!first && document.startViewTransition && !reducedMotion() && document.visibilityState === 'visible') {
    const vt = document.startViewTransition(swap);
    vt.ready.catch(() => {}); vt.finished.catch(() => {});
  } else swap();
}

window.addEventListener('hashchange', render);
window.addEventListener('scroll', () => head.classList.toggle('is-scrolled', window.scrollY > 8), { passive: true });
render();
