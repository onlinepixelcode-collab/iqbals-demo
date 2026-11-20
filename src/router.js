/* =====================================================================
   HASH ROUTER · works from any subfolder with no server rewrites.
   Each route: { render(params, query) → html, mount(root, params, query) → cleanup? }
   ===================================================================== */
import { $ } from './lib/ui.js';
import { gsap, resetMotion, setupReveals, setupThemes, setupMagnetic, scrollTo, lenis, ScrollTrigger } from './lib/motion.js';
import { setActiveNav, closeCart } from './components/shell.js';
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
async function curtain(dir) {
  const app = $('#app');
  if (reduceMotion()) return;
  if (dir === 'in') await gsap.to(app, { opacity: 0, y: 12, duration: 0.22, ease: 'power2.in' });
  else await gsap.fromTo(app, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity' });
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
