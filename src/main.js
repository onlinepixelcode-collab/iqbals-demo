/* =====================================================================
   IQBAL'S MEAT & DELI · APP ENTRY
   Loader → shell → router. Custom cursor + smooth scroll.
   ===================================================================== */
import './styles/main.css';
import { IMG } from './config/site.js';
import { $, reduceMotion, isTouch } from './lib/ui.js';
import { initSmoothScroll, setupChrome, gsap } from './lib/motion.js';
import { initShell } from './components/shell.js';
import { initProductEvents } from './components/product.js';
import { initChat } from './components/chat.js';
import { startRouter } from './router.js';
import { ICON } from './lib/ui.js';

document.body.classList.add('is-loading');

/* ---------------- PRELOADER ---------------- */
function runLoader() {
  return new Promise((resolve) => {
    const loader = $('#loader');
    // the full intro plays only on the first page load of a visit (per browser session)
    if (document.documentElement.classList.contains('intro-seen')) {
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      requestAnimationFrame(() => { window.dispatchEvent(new Event('site:ready')); resolve(); });
      return;
    }
    try { sessionStorage.setItem('iqbals.intro', '1'); } catch (e) { /* storage blocked: intro just plays again */ }
    const count = $('#loaderCount');
    const rm = reduceMotion();
    const minTime = rm ? 300 : 2900;
    const start = performance.now();
    let ready = false;
    // wait for the fonts only (photos lazy-load later); never block longer than 4 s
    (document.fonts?.ready ?? Promise.resolve()).then(() => (ready = true));
    setTimeout(() => (ready = true), 4000);

    // the client's real logo fades in over the drawn badge once it has loaded
    const real = new Image();
    real.onload = () => {
      real.className = 'loader__logo';
      $('.loader__stage', loader).appendChild(real);
    };
    real.src = IMG.logo;
    real.alt = '';

    let shown = 0;
    // setInterval (not rAF) so the loader still completes in background tabs
    const iv = setInterval(() => tick(performance.now()), 16);
    function tick(now) {
      const t = Math.min(1, (now - start) / minTime);
      const target = ready ? Math.max(t, shown / 100 + 0.02) * 100 : Math.min(92, t * 100);
      shown += (Math.min(100, target) - shown) * 0.12 + 0.15;
      shown = Math.min(100, shown);
      count.textContent = String(Math.floor(shown)).padStart(3, '0');
      if (shown >= 99.9 && ready && t >= 1) {
        count.textContent = '100';
        loader.classList.add('is-cut');
        setTimeout(() => loader.classList.add('is-open'), rm ? 0 : 420);
        setTimeout(() => {
          document.body.classList.remove('is-loading');
          window.dispatchEvent(new Event('site:ready'));
          resolve();
        }, rm ? 50 : 650);
        setTimeout(() => loader.classList.add('is-done'), rm ? 100 : 1800);
        clearInterval(iv);
      }
    }
  });
}

/* ---------------- CUSTOM CURSOR ---------------- */
function initCursor() {
  if (isTouch() || reduceMotion()) return;
  const el = $('#cursor');
  const label = $('.cursor__label', el);
  document.body.classList.add('has-cursor');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    xTo(pos.x);
    yTo(pos.y);
    el.classList.add('is-on');
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor="view"], .add-btn, .add-mini, a, button, [role="button"], input[type=range], label.check, .chip');
    el.classList.remove('is-view', 'is-hover');
    if (!t) return;
    if (t.matches('[data-cursor="view"]')) {
      el.classList.add('is-view');
      label.textContent = 'VIEW';
    } else if (t.matches('.add-btn, .add-mini, [data-add]')) {
      el.classList.add('is-view');
      label.innerHTML = ICON.knife; // cleaver over add-to-cart
    } else el.classList.add('is-hover');
  });
}

/* ---------------- BOOT ---------------- */
initSmoothScroll();
initShell();
initProductEvents();
initChat();
setupChrome();
initCursor();
startRouter();
runLoader();
