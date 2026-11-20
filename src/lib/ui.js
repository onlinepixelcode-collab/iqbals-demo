/* Small UI helpers shared by every view. */
import { u } from '../config/site.js';

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function money(n) {
  const v = Math.round(n * 100) / 100;
  const [int, dec] = v.toFixed(2).split('.');
  return `R ${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${dec === '00' ? '' : '.' + dec}`;
}

export const weightLabel = (kg) => (kg < 1 ? `${Math.round(kg * 1000)} g` : `${+kg.toFixed(2)} kg`);

export const img = (id, w = 900, alt = '', cls = '') =>
  `<img src="${u(id, w)}" alt="${esc(alt)}" loading="lazy" decoding="async" class="${cls}" width="${w}" height="${Math.round(w * 0.75)}">`;

/* ---------------- ICONS ---------------- */
const i = (p, vb = '0 0 24 24') => `<svg viewBox="${vb}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
export const ICON = {
  cart: i('<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>'),
  heart: i('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>'),
  user: i('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  home: i('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'),
  shop: i('<path d="M4 9h16l-1 11H5L4 9Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>'),
  chat: i('<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 10h8M8 13h5"/>'),
  close: i('<path d="M6 6l12 12M18 6 6 18"/>'),
  plus: i('<path d="M12 5v14M5 12h14"/>'),
  minus: i('<path d="M5 12h14"/>'),
  arrow: i('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  search: i('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
  phone: i('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>'),
  pin: i('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  clock: i('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8Z"/></svg>',
  check: i('<path d="m5 12 5 5 9-10"/>'),
  truck: i('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>'),
  shield: i('<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
  knife: i('<path d="M3 14 15 2l3 3-9 9H3Z"/><path d="M9 14l3 3-4 4-3-3"/>'),
  flame: i('<path d="M12 21c4 0 7-2.6 7-7 0-4-3-6-4-9-1 2-2.5 3-4 3 0-2 .5-3.5 1-5C7 5 5 9 5 14c0 4.4 3 7 7 7Z"/>'),
  box: i('<path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1c-.2.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>',
  instagram: i('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>'),
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4a22 22 0 0 0-2.5-.1c-2.5 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8Z"/></svg>',
  google: '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
  menu: i('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  filter: i('<path d="M4 6h16M7 12h10M10 18h4"/>'),
  eye: i('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
  send: i('<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>'),
  calendar: i('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  card: i('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>'),
  bank: i('<path d="M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>'),
  cash: i('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>'),
  pause: i('<path d="M9 5v14M15 5v14"/>'),
  skip: i('<path d="M5 5l10 7-10 7V5ZM19 5v14"/>'),
  edit: i('<path d="M4 20h4L19 9l-4-4L4 16v4Z"/>'),
  bell: i('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2Z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  gift: i('<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8Zm0 0s2-5 4.5-3.5S15 8 12 8Z"/>'),
  game: i('<path d="M6.5 7.5h11a4.6 4.6 0 0 1 4.4 5.9l-1 3.4a2.4 2.4 0 0 1-4 1l-2.3-2.3H9.4l-2.3 2.3a2.4 2.4 0 0 1-4-1l-1-3.4a4.6 4.6 0 0 1 4.4-5.9z"/><path d="M8 10.5v3.5M6.25 12.25h3.5"/><circle cx="15.6" cy="11.2" r=".9" fill="currentColor" stroke="none"/><circle cx="17.8" cy="13.4" r=".9" fill="currentColor" stroke="none"/>'),
  moon: i('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>'),
  trash: i('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
};

/* ---------------- TOAST ---------------- */
export function toast(msg, kind = 'ok') {
  const root = $('#toasts');
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="toast__dot"></span>${msg}`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 500);
  }, 3200);
}

/* ---------------- MODAL ---------------- */
let lastFocus = null;
export function openModal(html, { wide = false, onMount } = {}) {
  const root = $('#modal');
  lastFocus = document.activeElement;
  root.innerHTML = `<div class="modal__scrim" data-close></div>
    <div class="modal__panel ${wide ? 'modal__panel--wide' : ''}" role="dialog" aria-modal="true">
      <button class="modal__x icon-btn" data-close aria-label="Close">${ICON.close}</button>
      <div class="modal__body" data-lenis-prevent>${html}</div>
    </div>`;
  root.classList.add('is-open');
  document.documentElement.classList.add('no-scroll');
  root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
  const panel = root.querySelector('.modal__panel');
  setTimeout(() => panel.querySelector('button, a, input, select')?.focus(), 50);
  onMount?.(panel);
  return panel;
}
export function closeModal() {
  const root = $('#modal');
  if (!root.classList.contains('is-open')) return;
  root.classList.remove('is-open');
  document.documentElement.classList.remove('no-scroll');
  setTimeout(() => (root.innerHTML = ''), 400);
  lastFocus?.focus?.();
}

/* ---------------- FLY TO CART ---------------- */
export function flyToCart(fromEl, imgSrc) {
  if (reduceMotion() || !fromEl) return;
  const targets = $$('[data-cart-target]').filter((t) => t.offsetParent !== null);
  const target = targets[0];
  if (!target) return;
  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'fly';
  if (imgSrc) dot.style.backgroundImage = `url("${imgSrc}")`;
  dot.style.left = a.left + a.width / 2 - 32 + 'px';
  dot.style.top = a.top + a.height / 2 - 32 + 'px';
  document.body.appendChild(dot);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  dot.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 140}px) scale(.8)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.15)`, opacity: 0.4 },
    ],
    { duration: 850, easing: 'cubic-bezier(.6,0,.3,1)' }
  ).onfinish = () => {
    dot.remove();
    target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
  };
}

/* ---------------- OPEN NOW ---------------- */
function saNow() {
  // South Africa has no DST: SAST is always UTC+2
  const d = new Date();
  return new Date(d.getTime() + (d.getTimezoneOffset() + 120) * 60000);
}
const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const fmt12 = (t) => {
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
};
export function openStatus(branch) {
  const now = saNow();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = branch.hours[day];
  if (today && mins >= toMin(today[0]) && mins < toMin(today[1])) {
    const left = toMin(today[1]) - mins;
    return { open: true, label: left <= 60 ? `Open · closes in ${left} min` : `Open now · until ${fmt12(today[1])}` };
  }
  for (let k = 0; k < 8; k++) {
    const d = (day + k) % 7;
    const h = branch.hours[d];
    if (!h) continue;
    if (k === 0 && mins >= toMin(h[0])) continue;
    const when = k === 0 ? 'today' : k === 1 ? 'tomorrow' : DAYS[d];
    return { open: false, label: `Closed · opens ${when} ${fmt12(h[0])}` };
  }
  return { open: false, label: 'Closed' };
}
export const hoursTable = (branch) =>
  [3, 4, 5, 6, 0, 1, 2].map((d) => ({ day: DAYS[d], h: branch.hours[d] ? `${fmt12(branch.hours[d][0])} – ${fmt12(branch.hours[d][1])}` : 'Closed', today: saNow().getDay() === d }));

/* ---------------- CONFETTI (brand colours) ---------------- */
export function confetti(duration = 3200) {
  if (reduceMotion()) return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const resize = () => {
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
  };
  resize();
  const colors = ['#9b1515', '#f4ec3c', '#ffffff', '#e0202a', '#1f1c1c'];
  const parts = Array.from({ length: 180 }, () => ({
    x: Math.random() * c.width,
    y: -Math.random() * c.height * 0.6,
    w: (6 + Math.random() * 8) * dpr,
    h: (8 + Math.random() * 10) * dpr,
    vy: (2 + Math.random() * 4) * dpr,
    vx: (Math.random() - 0.5) * 3 * dpr,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.2,
    col: colors[(Math.random() * colors.length) | 0],
    gingham: Math.random() < 0.2,
  }));
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, c.width, c.height);
    parts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      if (p.gingham) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w / 2, p.h / 2);
        ctx.fillRect(0, 0, p.w / 2, p.h / 2);
      }
      ctx.restore();
    });
    if (t - t0 < duration) requestAnimationFrame(frame);
    else c.remove();
  })(t0);
}

export function debounce(fn, ms = 200) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}
