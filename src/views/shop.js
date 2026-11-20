/* SHOP · filters, instant search, sort, quick view */
import { IMG } from '../config/site.js';
import { PRODUCTS, CATEGORIES, unitPrice } from '../data/products.js';
import { $, $$, ICON, img, debounce } from '../lib/ui.js';
import { gsap, setupTilt } from '../lib/motion.js';
import { cardHTML } from '../components/product.js';
import { state, setBranch } from '../lib/store.js';
import { BRANCHES } from '../config/site.js';

const PREPS = ['Cubed', 'Minced', 'Curry pieces', 'Washed & cut', 'Marinated', 'Steaks', 'Chops'];
const MAXP = 500;

export function render(params, query) {
  const wish = params?.wishlist;
  return `
  <section class="page-hero" data-theme="light">
    <div class="photo" data-parallax="8">${img(wish ? IMG.marbled : IMG.counter, 1600, '')}</div>
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><span>${wish ? 'Wishlist' : 'Shop'}</span></nav>
      <h1 class="h-xl" data-split>${wish ? 'Your <span class="it">favourites.</span>' : 'The <span class="it">counter.</span>'}</h1>
      <p class="lead" style="margin-top:20px">${wish ? 'Everything you’ve saved, ready when you are.' : 'Every cut, every pie, every masala. All NIHT certified halaal, cut to order and ready for delivery or collection.'}</p>
    </div>
  </section>
  <div class="wrap shop" data-theme="light">
    <aside class="filters" id="filters" aria-label="Filters" ${wish ? 'hidden' : ''}>
      <div><h4>Category</h4><div class="chips">
        <button class="chip" data-cat="">All</button>
        ${CATEGORIES.map((c) => `<button class="chip" data-cat="${c.id}">${c.name}</button>`).join('')}</div></div>
      <div><h4>Max price</h4><input class="range" type="range" min="30" max="${MAXP}" step="10" value="${MAXP}" id="fPrice" aria-label="Maximum price">
        <div class="price-out"><span>R 30</span><span id="fPriceOut">Any</span></div></div>
      <div><h4>Preparation</h4><div class="chips">${PREPS.map((p) => `<button class="chip" data-prep-f="${p}" aria-pressed="false">${p}</button>`).join('')}</div></div>
      <div><h4>Show</h4><label class="check"><input type="checkbox" id="fSpecial"> Specials only</label></div>
      <button class="btn btn--ghost btn--sm" id="fReset">Reset filters</button>
    </aside>
    <div>
      <div class="shop__bar">
        <div class="search">${ICON.search}<label class="sr" for="q">Search products</label><input class="input" id="q" type="search" placeholder="Search ribeye, rotis, wors…" autocomplete="off"></div>
        <label class="branch-pick">${ICON.pin}<span>Shopping at</span><select id="branchPick" aria-label="Branch">${BRANCHES.map((b) => `<option value="${b.id}" ${state.branch === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select></label>
        <label class="sr" for="sort">Sort</label>
        <select class="select" id="sort"><option value="pop">Most popular</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="az">Name A–Z</option></select>
        <button class="btn btn--ghost btn--sm" id="fToggle" style="display:none">${ICON.filter} Filters</button>
      </div>
      <p class="shop__count" id="count" aria-live="polite"></p>
      <div class="grid" id="grid"></div>
    </div>
  </div>`;
}

export function mount(root, params, query) {
  const wish = params?.wishlist;
  const f = { cat: query.get('cat') || '', q: query.get('q') || '', max: MAXP, preps: [], special: false, sort: 'pop' };
  const grid = $('#grid', root);
  const q = $('#q', root);
  q.value = f.q;
  if (query.get('focus') === 'search') setTimeout(() => q.focus(), 700);

  const toggle = $('#fToggle', root);
  if (innerWidth <= 1180 && !wish) toggle.style.display = 'inline-flex';
  toggle.addEventListener('click', () => $('#filters', root).classList.toggle('is-open'));

  const syncChips = () => {
    $$('[data-cat]', root).forEach((c) => c.classList.toggle('is-on', c.dataset.cat === f.cat));
    $$('[data-prep-f]', root).forEach((c) => {
      const on = f.preps.includes(c.dataset.prepF);
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on);
    });
  };

  const apply = () => {
    const term = f.q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (wish) return state.wishlist.includes(p.id);
      if (f.cat && p.category !== f.cat) return false;
      if (unitPrice(p) > f.max) return false;
      if (f.special && !p.special) return false;
      if (f.preps.length && !f.preps.some((x) => (p.preps || []).some((y) => y.toLowerCase().includes(x.toLowerCase().split(' ')[0])))) return false;
      if (term) {
        const hay = `${p.name} ${p.cut} ${p.desc} ${p.category} ${p.best}`.toLowerCase();
        if (!term.split(/\s+/).every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    const by = {
      pop: (a, b) => (b.tags.includes('popular') - a.tags.includes('popular')) || (!!b.special - !!a.special),
      low: (a, b) => unitPrice(a) - unitPrice(b),
      high: (a, b) => unitPrice(b) - unitPrice(a),
      az: (a, b) => a.name.localeCompare(b.name),
    }[f.sort];
    list = [...list].sort(by);
    $('#count', root).textContent = `${list.length} product${list.length === 1 ? '' : 's'}${f.cat ? ' in ' + CATEGORIES.find((c) => c.id === f.cat).name : ''}${term ? ` matching “${f.q}”` : ''}`;
    grid.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : wish
        ? `<div class="empty" style="grid-column:1/-1"><h3>No favourites yet</h3><p>Tap the ♥ on any product to save it here.</p><a class="btn" href="#/shop">Browse the shop</a></div>`
        : `<div class="empty" style="grid-column:1/-1"><h3>Nothing matches that</h3><p>Try a different search or reset the filters. Or ask the butcher, we can probably cut it for you.</p><a class="btn" href="#/cut-to-order">Request a special cut</a></div>`;
    if ($$('.pcard', grid).length) gsap.from($$('.pcard', grid), { y: 30, opacity: 0, duration: 0.6, stagger: 0.03, ease: 'power3.out', clearProps: 'transform,opacity' });
    setupTilt(grid, '.pcard');
    syncChips();
  };

  $$('[data-cat]', root).forEach((c) => c.addEventListener('click', () => { f.cat = c.dataset.cat; apply(); }));
  $$('[data-prep-f]', root).forEach((c) => c.addEventListener('click', () => {
    const v = c.dataset.prepF;
    f.preps = f.preps.includes(v) ? f.preps.filter((x) => x !== v) : [...f.preps, v];
    apply();
  }));
  const price = $('#fPrice', root);
  const setP = () => price.style.setProperty('--p', ((price.value - 30) / (MAXP - 30)) * 100 + '%');
  setP();
  price.addEventListener('input', () => {
    f.max = Number(price.value);
    $('#fPriceOut', root).textContent = f.max >= MAXP ? 'Any' : `R ${f.max}`;
    setP();
    apply();
  });
  $('#fSpecial', root).addEventListener('change', (e) => { f.special = e.target.checked; apply(); });
  $('#sort', root).addEventListener('change', (e) => { f.sort = e.target.value; apply(); });
  $('#branchPick', root).addEventListener('change', (e) => { setBranch(e.target.value); apply(); });
  q.addEventListener('input', debounce(() => { f.q = q.value; apply(); }, 120));
  $('#fReset', root).addEventListener('click', () => {
    Object.assign(f, { cat: '', q: '', max: MAXP, preps: [], special: false });
    q.value = '';
    price.value = MAXP;
    setP();
    $('#fPriceOut', root).textContent = 'Any';
    $('#fSpecial', root).checked = false;
    apply();
  });
  apply();
}
