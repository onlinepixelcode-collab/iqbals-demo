/* =====================================================================
   HASH ROUTER · works from any subfolder with no server rewrites.
   Each route: { render(params, query) → html, mount(root, params, query) → cleanup? }
   ===================================================================== */
import { $ } from './lib/ui.js';
import { gsap, resetMotion, setupReveals, setupThemes, setupMagnetic, scrollTo, lenis, ScrollTrigger } from './lib/motion.js';
import { setActiveNav, closeCart, closeMenu } from './components/shell.js';
import { closeModal, reduceMotion } from './lib/ui.js';

import * as Home from './views/home.js';
import * as Shop from './views/shop.js';
import * as Product from './views/product.js';
import * as Checkout from './views/checkout.js';
import * as Account from './views/account.js';
import * as Extras from './views/extras.js';
import * as Contact from './views/contact.js';
import * as F from './views/features.js';
import * as Admin from './views/admin.js';
import * as Game from './views/game.js';
import * as Studio from './views/studio.js';

const TITLE = "Iqbal's Meat & Deli";
const ROUTES = [
  { path: '', nav: '', title: `${TITLE} · Premium NIHT Halaal Butchery in Benoni & Lenasia`, view: Home },
  { path: 'home/:section', nav: '', title: TITLE, view: Home },
  { path: 'shop', nav: 'shop', title: `Shop · ${TITLE}`, view: Shop },
  { path: 'wishlist', nav: 'shop', title: `Wishlist · ${TITLE}`, view: Shop, params: { wishlist: true } },
  { path: 'product/:id', nav: 'shop', title: TITLE, view: Product },
  { path: 'checkout', nav: 'shop', title: `Checkout · ${TITLE}`, view: Checkout },
  { path: 'success/:id', nav: 'shop', title: `Order confirmed · ${TITLE}`, view: { render: Checkout.renderSuccess, mount: Checkout.mountSuccess } },
  { path: 'login', nav: 'account', title: `Sign in · ${TITLE}`, view: { render: Account.renderAuth, mount: Account.mountAuth }, params: { mode: 'login' } },
  { path: 'register', nav: 'account', title: `Create account · ${TITLE}`, view: { render: Account.renderAuth, mount: Account.mountAuth }, params: { mode: 'register' } },
  { path: 'account', nav: 'account', title: `My account · ${TITLE}`, view: { render: Account.renderAccount, mount: Account.mountAccount } },
  { path: 'weekly-box', nav: 'weekly-box', title: `Iqbal’s Weekly Box · ${TITLE}`, view: { render: Extras.renderBox, mount: Extras.mountBox } },
  { path: 'recipes', nav: 'recipes', title: `Recipes · ${TITLE}`, view: { render: Extras.renderRecipes, mount: Extras.mountRecipes } },
  { path: 'guide', nav: 'guide', title: `Cooking guide · ${TITLE}`, view: { render: Extras.renderGuide, mount: Extras.mountGuide } },
  { path: 'contact', nav: 'contact', title: `Contact · ${TITLE}`, view: Contact },
  { path: 'eid', nav: 'eid', title: `Eid & Ramadan pre-orders · ${TITLE}`, view: { render: F.renderEid, mount: F.mountEid } },
  { path: 'functions', nav: 'more', title: `Functions & catering · ${TITLE}`, view: { render: F.renderFunctions, mount: F.mountFunctions } },
  { path: 'delivery', nav: 'more', title: `Delivery areas · ${TITLE}`, view: { render: F.renderDelivery, mount: F.mountDelivery } },
  { path: 'meal-planner', nav: 'more', title: `Meal planner · ${TITLE}`, view: { render: F.renderPlanner, mount: F.mountPlanner } },
  { path: 'rewards', nav: 'more', title: `Iqbal’s Rewards · ${TITLE}`, view: { render: F.renderRewards } },
  { path: 'cut-studio', nav: 'studio', title: `Cut Studio · ${TITLE}`, view: Studio },
  { path: 'game', nav: 'more', title: `Flying Steak game · ${TITLE}`, view: Game },
  { path: 'admin', nav: '', title: `Shop admin · ${TITLE}`, view: Admin },
  { path: 'cut-to-order', nav: 'guide', title: `Cut to order · ${TITLE}`, view: { render: Extras.renderCut, mount: Extras.mountCut } },
];

function match(hash) {
  const [pathPart, qs = ''] = hash.replace(/^#\/?/, '').split('?');
  const segs = pathPart.split('/').filter(Boolean);
  for (const r of ROUTES) {
    const rs = r.path.split('/').filter(Boolean);
    if (rs.length !== segs.length) continue;
    const params = { ...(r.params || {}) };
    if (rs.every((s, i) => (s.startsWith(':') ? ((params[s.slice(1)] = decodeURIComponent(segs[i])), true) : s === segs[i]))) return { route: r, params, query: new URLSearchParams(qs) };
  }
  return { route: ROUTES[0], params: {}, query: new URLSearchParams(qs), notFound: segs.length > 0 };
}

let cleanup = null;
let current = null;
let first = true;

export function navigate(hash, { replace = false } = {}) {
  if (replace) history.replaceState(null, '', hash);
  else if (location.hash !== hash) {
    location.hash = hash;
    return;
  }
  render();
}

/* Page change: a quick, quiet fade (the big loader only plays on arrival). */
/* Page change: a quick puff of freezer mist rolls across, the page swaps behind it. */
async function curtain(dir) {
  const app = $('#app');
  const fr = $('#frost');
  if (reduceMotion() || !fr) return;
  const puffs = fr.querySelectorAll('i');
  if (dir === 'in') {
    gsap.set(fr, { opacity: 0, display: 'block' });
    gsap.fromTo(puffs, { scale: 0.4, yPercent: 60, opacity: 0 }, { scale: 1.25, yPercent: 0, opacity: 1, duration: 0.42, ease: 'power2.out', stagger: 0.025 });
    gsap.to(app, { opacity: 0, duration: 0.25, ease: 'power1.in' });
    await gsap.to(fr, { opacity: 1, duration: 0.3, ease: 'power1.out' });
  } else {
    gsap.fromTo(app, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' });
    gsap.to(puffs, { yPercent: -40, scale: 1.6, duration: 0.6, ease: 'power1.out', stagger: 0.02 });
    await gsap.to(fr, { opacity: 0, duration: 0.55, ease: 'power2.inOut' });
    gsap.set(fr, { display: 'none' });
  }
}

async function render() {
  const { route, params, query, notFound } = match(location.hash || '#/');
  const app = $('#app');

  // same page, just a section jump (e.g. #/home/branches while on home)
  if (current && current.view === Home && route.view === Home && params.section) {
    scrollTo('#' + params.section);
    return;
  }

  closeCart();
  closeMenu();
  closeModal();
  if (!first) await curtain('in');

  cleanup?.();
  cleanup = null;
  resetMotion();
  document.documentElement.dataset.theme = 'light';
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);

  app.innerHTML = notFound
    ? `<section class="success"><div class="wrap"><h1 class="h-lg">Page not found</h1><p class="lead" style="margin:20px auto 30px">That page has gone the way of last week’s specials.</p><a class="btn" href="#/">Back home</a></div></section>`
    : route.view.render(params, query);
  document.title = route.title;
  setActiveNav(route.nav);
  current = route;

  if (!notFound) cleanup = route.view.mount?.(app, params, query) || null;
  setupReveals(app);
  setupThemes(app);
  setupMagnetic(document);
  requestAnimationFrame(() => ScrollTrigger.refresh());

  if (!first) {
    await curtain('out');
    app.focus({ preventScroll: true });
  }
  first = false;
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  render();
}
