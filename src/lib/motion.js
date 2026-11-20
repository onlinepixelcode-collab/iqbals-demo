/* =====================================================================
   MOTION · Lenis smooth scroll + GSAP ScrollTrigger helpers.
   Every effect checks prefers-reduced-motion and degrades to static.
   ===================================================================== */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { $, $$, reduceMotion, isTouch } from './ui.js';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export let lenis = null;

export function initSmoothScroll() {
  if (reduceMotion()) return;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollTo(target, opts = {}) {
  const el = typeof target === 'string' ? $(target) : target;
  if (lenis) lenis.scrollTo(el ?? 0, { offset: -70, duration: 1.4, ...opts });
  else if (el && el.scrollIntoView) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
  else window.scrollTo(0, typeof target === 'number' ? target : 0);
}
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();

/* ---------------- split text into masked lines of words ---------------- */
export function splitLines(el) {
  if (el.dataset.splitDone) return $$('.line > span', el);
  const html = el.innerHTML;
  // keep <br> as hard breaks, wrap each word in a span, measure, then group by line
  const parts = html.split(/<br\s*\/?>/i);
  el.innerHTML = parts
    .map((part) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = part;
      const out = [];
      tmp.childNodes.forEach((n) => {
        if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((w) => (w.trim() ? out.push(`<span class="w">${w}</span>`) : w && out.push(' ')));
        else out.push(`<span class="w">${n.outerHTML}</span>`);
      });
      return `<span class="line"><span>${out.join('')}</span></span>`;
    })
    .join('');
  el.dataset.splitDone = '1';
  return $$('.line > span', el);
}

/* ---------------- section reveals ---------------- */
export function setupReveals(root = document) {
  const rm = reduceMotion();

  $$('[data-split]', root).forEach((el) => {
    const lines = splitLines(el);
    if (rm) return;
    gsap.from(lines, {
      yPercent: 110, rotate: 3, duration: 1.2, ease: 'power4.out', stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  if (rm) return;

  $$('[data-reveal]', root).forEach((el) => {
    const kids = el.dataset.reveal === 'stagger' ? [...el.children] : [el];
    gsap.from(kids, {
      y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  $$('[data-clip]', root).forEach((el) => {
    const dir = el.dataset.clip || 'up';
    const from = { up: 'inset(100% 0 0 0)', left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)', center: 'inset(15% 15% 15% 15% round 40px)' }[dir];
    gsap.fromTo(el, { clipPath: from }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.5, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
    const im = el.querySelector('img');
    if (im) gsap.from(im, { scale: 1.35, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  $$('[data-parallax]', root).forEach((el) => {
    const amt = parseFloat(el.dataset.parallax) || 12;
    gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  $$('[data-scale]', root).forEach((el) => {
    gsap.fromTo(el, { scale: 0.86, borderRadius: '60px' }, { scale: 1, borderRadius: '28px', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 30%', scrub: true } });
  });

  $$('[data-count]', root).forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split('.')[1] || '').length;
    const obj = { v: 0 };
    el.textContent = (0).toFixed(dec);
    gsap.to(obj, {
      v: end, duration: 2.2, ease: 'power3.out',
      onUpdate: () => (el.textContent = obj.v.toFixed(dec)),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ---------------- section colour shifts (charcoal → maroon → parchment) ---------------- */
export function setupThemes(root = document) {
  const secs = $$('[data-theme]', root);
  if (!secs.length) {
    document.documentElement.dataset.theme = 'light';
    return;
  }
  document.documentElement.dataset.theme = secs[0].dataset.theme;
  secs.forEach((s) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => self.isActive && (document.documentElement.dataset.theme = s.dataset.theme),
    });
  });
}

/* ---------------- magnetic buttons ---------------- */
export function setupMagnetic(root = document) {
  if (reduceMotion() || isTouch()) return;
  $$('.magnetic', root).forEach((el) => {
    const strength = 0.35;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.6, ease: 'power3.out' });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
  });
}

/* ---------------- 3D tilt cards ---------------- */
export function setupTilt(root = document, sel = '[data-tilt]') {
  if (reduceMotion() || isTouch()) return;
  $$(sel, root).forEach((el) => {
    const max = parseFloat(el.dataset.tilt) || 8;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: px * max * 2, rotateX: -py * max * 2, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' }));
  });
}

/* ---------------- scroll progress bar + header behaviour ---------------- */
export function setupChrome() {
  const bar = $('#progress');
  const header = $('#header');
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    header.classList.toggle('is-solid', y > 40);
    header.classList.toggle('is-hidden', y > 400 && y > last && !document.documentElement.classList.contains('no-scroll'));
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Kill all ScrollTriggers + inline GSAP styles (used between routes) */
export function resetMotion() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.getChildren(true, true, false).forEach((t) => t.scrollTrigger && t.kill());
}
