/* Header, mobile menu, bottom nav, cart drawer and footer. */
import { BUSINESS, BRANCHES, DELIVERY, u } from '../config/site.js';
import { $, $$, ICON, money, weightLabel, esc, toast, openStatus } from '../lib/ui.js';
import { state, subscribe, cartLines, cartCount, cartSubtotal, setQty, removeLine, currentUser, subscribeNewsletter, pointsBalance } from '../lib/store.js';
import { logoWide, halaalSeal } from './brand.js';
import { PRODUCTS, CATEGORIES, unitPrice } from '../data/products.js';
import { stopScroll, startScroll } from '../lib/motion.js';

/* All the extra pages, shown in the Shop mega menu (desktop) and the mobile menu */
const SERVICES = [
  ['#/cut-studio', 'Cut Studio', 'Build your cut, watch it on the bandsaw', 'knife'],
  ['#/weekly-box', 'Weekly Box', 'Good meat delivered every week', 'box'],
  ['#/home/braai', 'Braai Builder', 'How much meat for your braai?', 'flame'],
  ['#/meal-planner', 'Meal planner', 'Plan the week, one shopping list', 'calendar'],
  ['#/functions', 'Functions & catering', 'Quotes for weddings & big braais', 'user'],
  ['#/recipes', 'Recipes', 'Biryani, curry, braai & more', 'chat'],
  ['#/guide', 'Cooking guide', 'Doneness & temperatures', 'clock'],
  ['#/delivery', 'Delivery areas', 'Check your fee & next slot', 'truck'],
  ['#/rewards', 'Iqbal’s Rewards', 'Earn points on every order', 'gift'],
  ['#/game', 'Flying Steak game', 'Play & win Rewards points', 'game'],
];
const MORE = SERVICES.map(([h, l, d]) => [h, l, d]);
const LINKS = [
  ['#/', 'Home', ''],
  ['#/cut-studio', 'Cut Studio', 'studio'],
  ['#/weekly-box', 'Weekly Box', 'weekly-box'],
  ['#/eid', 'Eid & Ramadan', 'eid'],
  ['#/contact', 'Contact', 'contact'],
];
const catFrom = (id) => Math.min(...PRODUCTS.filter((p) => p.category === id).map(unitPrice));
const catCount = (id) => PRODUCTS.filter((p) => p.category === id).length;

const MEGA_TOOLS = ['#/cut-studio', '#/weekly-box', '#/home/braai', '#/delivery', '#/recipes', '#/guide', '#/rewards'];
const priceTag = (p) => `${money(unitPrice(p))}${p.unit === 'kg' ? '<small>/kg</small>' : ''}`;
const picksFor = (id) => {
  const list = PRODUCTS.filter((p) => p.category === id);
  return [...list.filter((p) => p.tags.includes('popular')), ...list.filter((p) => !p.tags.includes('popular'))].slice(0, 3);
};
function megaPreview(id) {
  const c = id && CATEGORIES.find((x) => x.id === id);
  const items = c ? picksFor(id) : PRODUCTS.filter((p) => p.special).slice(0, 3);
  const head = c
    ? `<span class="mega__pv-kicker">Popular in</span><b class="mega__pv-title">${c.name}</b>`
    : `<span class="mega__pv-kicker mega__pv-kicker--hot">This week only</span><b class="mega__pv-title">Crazy <em>Specials</em></b>`;
  const foot = c
    ? `<a class="mega__pv-all" href="#/shop?cat=${c.id}">Shop all ${catCount(c.id)} ${c.name} ${ICON.arrow}</a>`
    : `<a class="mega__pv-all" href="#/home/specials">All ${PRODUCTS.filter((p) => p.special).length} specials · ends Sunday 6:30 PM ${ICON.arrow}</a>`;
  return `<div class="mega__pv-head">${head}</div>
    <ul class="mega__pv-list">${items.map((p) => `<li>
      <a class="mega__pv-item" href="#/product/${p.id}"><span class="photo"><img src="${u(p.img, 160)}" alt="" loading="lazy"></span>
        <span class="mega__pv-name"><b>${esc(p.name)}</b><small>${esc(p.cut)}</small></span>
        <span class="mega__pv-price">${p.special ? `<s>${money(p.price)}</s>` : ''}${priceTag(p)}</span></a>
      <button type="button" class="mega__pv-add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">${ICON.plus}</button>
    </li>`).join('')}</ul>${foot}`;
}

function megaHTML() {
  return `<div class="mega" id="mega" role="region" aria-label="Shop menu">
    <div class="mega__inner wrap">
      <div class="mega__main">
        <div class="mega__title"><span class="label">Shop by category</span><a href="#/shop" class="mega__all">Shop all ${PRODUCTS.length} products ${ICON.arrow}</a></div>
        <div class="mega__grid">${CATEGORIES.map((c, i) => `<a class="mega__cat" href="#/shop?cat=${c.id}" data-mcat="${c.id}" style="--i:${i}">
          <span class="photo"><img src="${u(c.img, 420)}" alt="" loading="lazy"></span>
          <span class="mega__cat-body"><b>${c.name}</b><small>${catCount(c.id)} items · from ${money(catFrom(c.id)).replace(/\.00$/, '')}</small></span>
          <span class="mega__cat-go" aria-hidden="true">${ICON.arrow}</span></a>`).join('')}</div>
      </div>
      <aside class="mega__pv" id="megaPv" aria-live="polite">${megaPreview(null)}</aside>
    </div>
    <div class="mega__tools"><div class="wrap">${SERVICES.filter(([h]) => MEGA_TOOLS.includes(h)).map(([h, l, , i]) => `<a href="${h}">${ICON[i]}<span>${l}</span></a>`).join('')}</div></div>
  </div>`;
}

export function renderHeader() {
  const header = $('#header');
  header.innerHTML = `
    <div class="nav">
      <a class="nav__brand" href="#/" aria-label="Iqbal's Meat & Deli home">${logoWide({ h: 50 })}</a>
      <nav class="nav__links" aria-label="Main">
        <a href="#/" data-nav="">Home</a>
        <div class="nav__shop"><a href="#/shop" class="nav__shop-btn" data-nav="shop" aria-expanded="false" aria-controls="mega">Shop <span class="nav__caret" aria-hidden="true">▾</span></a></div>
        ${LINKS.slice(1).map(([h, l, k]) => `<a href="${h}" data-nav="${k}">${l}</a>`).join('')}
      </nav>
      <div class="nav__actions">
        <a class="icon-btn hide-sm" href="#/shop?focus=search" aria-label="Search products" data-cursor="hover">${ICON.search}</a>
        <a class="icon-btn hide-sm" href="#/wishlist" aria-label="Wishlist">${ICON.heart}<span class="badge-count" data-wish-count></span></a>
        <span class="nav__me hide-sm" data-me></span>
        <button class="icon-btn" data-open-cart data-cart-target aria-label="Open cart">${ICON.cart}<span class="badge-count" data-cart-count></span></button>
        <button class="icon-btn nav__burger" data-burger aria-label="Open menu" aria-expanded="false">${ICON.menu}</button>
      </div>
    </div>
    ${megaHTML()}
    <div class="mega-scrim" id="megaScrim"></div>
    <div class="mnav" id="mnav" data-lenis-prevent aria-hidden="true"></div>`;

  /* mega menu: opens on hover (desktop) or click, closes on leave / Escape / link click */
  const btn = $('.nav__shop-btn', header);
  const mega = $('#mega', header);
  let tOpen = 0, tClose = 0;
  const open = () => { clearTimeout(tClose); header.classList.add('mega-open'); btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { clearTimeout(tOpen); header.classList.remove('mega-open'); btn.setAttribute('aria-expanded', 'false'); };
  const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hoverable) {
    [btn.parentElement, mega].forEach((el) => {
      el.addEventListener('mouseenter', () => { clearTimeout(tClose); tOpen = setTimeout(open, 90); });
      el.addEventListener('mouseleave', () => { clearTimeout(tOpen); tClose = setTimeout(close, 180); });
    });
  }
  btn.addEventListener('click', (e) => {
    if (!header.classList.contains('mega-open')) { e.preventDefault(); open(); }
    else if (!hoverable) { e.preventDefault(); close(); }
  });
  btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); mega.querySelector('a')?.focus(); } });
  mega.addEventListener('focusout', (e) => { if (!header.contains(e.relatedTarget)) close(); });
  mega.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  /* hover a category → preview its popular products (defaults to Crazy Specials) */
  const pv = $('#megaPv', header);
  let pvCur = null, pvT = 0;
  const showPv = (id) => {
    if (id === pvCur) return;
    pvCur = id;
    clearTimeout(pvT);
    pv.classList.add('is-swap');
    pvT = setTimeout(() => { pv.innerHTML = megaPreview(id); pv.classList.remove('is-swap'); }, 110);
    $$('[data-mcat]', mega).forEach((x) => x.classList.toggle('is-on', x.dataset.mcat === id));
  };
  $$('[data-mcat]', mega).forEach((el) => { el.addEventListener('mouseenter', () => showPv(el.dataset.mcat)); el.addEventListener('focus', () => showPv(el.dataset.mcat)); });
  btn.addEventListener('mouseenter', () => showPv(null));
  $('#megaScrim', header).addEventListener('click', close);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());
  window.addEventListener('hashchange', close);
  $('[data-burger]', header).addEventListener('click', () => ($('#mnav').classList.contains('is-open') ? closeMenu() : openMenu()));
}

/* ---------------- MOBILE MENU ---------------- */
const TILES = [
  ['#/', 'Home', 'home'], ['#/shop', 'Shop all', 'shop'], ['#/cut-studio', 'Cut Studio', 'knife'],
  ['#/weekly-box', 'Weekly Box', 'box'], ['#/eid', 'Eid & Ramadan', 'moon'], ['#/contact', 'Contact', 'phone'],
];
let mnavTab = 'menu';
function mnavHTML() {
  const me = currentUser();
  const sp = PRODUCTS.filter((p) => p.special);
  return `<div class="mnav__inner">
    <form class="mnav__search" role="search">${ICON.search}<label class="sr" for="mnavQ">Search products</label><input id="mnavQ" type="search" placeholder="Search ribeye, rotis, wors…" autocomplete="off"></form>
    <div class="mnav__tabs" role="tablist">
      <button role="tab" data-mtab="menu" aria-selected="${mnavTab === 'menu'}" class="${mnavTab === 'menu' ? 'is-on' : ''}">${ICON.menu} Menu</button>
      <button role="tab" data-mtab="cats" aria-selected="${mnavTab === 'cats'}" class="${mnavTab === 'cats' ? 'is-on' : ''}">${ICON.shop} Categories</button>
    </div>
    <div class="mnav__panel" data-mpanel="menu" ${mnavTab === 'menu' ? '' : 'hidden'}>
      <a class="mnav__me" href="${me ? '#/account' : '#/login'}"><span class="mnav__av">${me ? esc(me.name[0]) : ICON.user}</span>
        <span><b>My Butcher</b><small>${me ? `Welcome back, ${esc(me.name.split(' ')[0])} · ${pointsBalance()} Rewards points` : 'Sign in or register · orders, re-order & rewards'}</small></span>${ICON.arrow}</a>
      <nav class="mnav__grid" aria-label="Main">${TILES.map(([h, l, i], k) => `<a href="${h}" style="--i:${k}">${ICON[i]}<span>${l}</span></a>`).join('')}</nav>
      <p class="mnav__label">Services &amp; tools</p>
      <ul class="mnav__list">${SERVICES.filter(([h]) => !['#/cut-studio', '#/weekly-box'].includes(h)).map(([h, l, dsc, i]) => `<li><a href="${h}">${ICON[i].replace('<svg', '<svg class="mnav__ico"')}<span><b>${l}</b><small>${dsc}</small></span>${ICON.arrow}</a></li>`).join('')}</ul>
      <p class="mnav__label">Our branches</p>
      <div class="mnav__branches">${BRANCHES.map((b) => { const st = openStatus(b); return `<div class="mnav__branch"><div><b>${b.name}</b><span class="status ${st.open ? '' : 'is-closed'}"><i></i>${st.label}</span></div>
        <div class="mnav__btns"><a class="btn btn--sm" href="tel:${b.phone.replace(/\s/g, '')}">${ICON.phone} Call</a><a class="btn btn--sm btn--wa" href="https://wa.me/${b.phoneIntl}" target="_blank" rel="noopener">${ICON.whatsapp} WhatsApp</a></div></div>`; }).join('')}</div>
      <div class="mnav__social"><a href="${BUSINESS.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.instagram}</a><a href="${BUSINESS.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICON.facebook}</a><span>NIHT certified halaal</span></div>
      <nav class="mnav__legal" aria-label="Legal"><a href="#/terms">Terms</a><a href="#/privacy">Privacy</a><a href="#/shipping">Shipping</a><a href="#/returns">Returns</a></nav>
    </div>
    <div class="mnav__panel" data-mpanel="cats" ${mnavTab === 'cats' ? '' : 'hidden'}>
      <div class="mnav__tiles">${CATEGORIES.map((c, k) => `<a class="mnav__tile" href="#/shop?cat=${c.id}" style="--i:${k}"><span class="photo"><img src="${u(c.img, 360)}" alt="" loading="lazy"></span><span class="mnav__tile-body"><b>${c.name}</b><small>${catCount(c.id)} items · from ${money(catFrom(c.id)).replace(/\.00$/, '')}</small></span></a>`).join('')}</div>
      <a class="mnav__special" href="#/home/specials"><span class="tag tag--gingham">Crazy Specials</span><b>${sp.length} specials this week</b><small>Ends Sunday 6:30 PM</small>${ICON.arrow}</a>
      <a class="btn btn--block" href="#/shop">Shop all ${PRODUCTS.length} products ${ICON.arrow}</a>
    </div>
  </div>`;
}
export function openMenu() {
  const m = $('#mnav');
  m.innerHTML = mnavHTML();
  m.classList.add('is-open');
  m.setAttribute('aria-hidden', 'false');
  $('#header').classList.add('is-menu');
  const burger = $('[data-burger]');
  burger.setAttribute('aria-expanded', 'true');
  burger.innerHTML = ICON.close;
  document.documentElement.classList.add('no-scroll');
  stopScroll();
  $$('a', m).forEach((a) => a.addEventListener('click', closeMenu));
  $$('[data-mtab]', m).forEach((t) => t.addEventListener('click', () => {
    mnavTab = t.dataset.mtab;
    $$('[data-mtab]', m).forEach((x) => { x.classList.toggle('is-on', x === t); x.setAttribute('aria-selected', x === t); });
    $$('[data-mpanel]', m).forEach((p) => (p.hidden = p.dataset.mpanel !== mnavTab));
    m.scrollTop = 0;
  }));
  $('.mnav__search', m).addEventListener('submit', (e) => { e.preventDefault(); const q = $('#mnavQ', m).value.trim(); closeMenu(); location.hash = '#/shop' + (q ? '?q=' + encodeURIComponent(q) : '?focus=search'); });
}
export function closeMenu() {
  const m = $('#mnav');
  if (!m || !m.classList.contains('is-open')) return;
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  $('#header').classList.remove('is-menu');
  const burger = $('[data-burger]');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = ICON.menu;
  document.documentElement.classList.remove('no-scroll');
  startScroll();
}

export function renderBottomNav() {
  $('#bottomnav').innerHTML = `
    <a href="#/" data-nav="">${ICON.home}<span>Home</span></a>
    <a href="#/shop" data-nav="shop">${ICON.shop}<span>Shop</span></a>
    <button data-open-cart data-cart-target>${ICON.cart}<span>Cart</span><span class="badge-count" data-cart-count></span></button>
    <a href="#/account" data-nav="account">${ICON.user}<span>My Butcher</span></a>
    <button data-open-chat>${ICON.chat}<span>Chat</span></button>`;
}

export function setActiveNav(route) {
  $$('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === route));
}

/** 'My Butcher' button: sign in / register when logged out, name when logged in */
export function renderMe() {
  const el = $('[data-me]');
  if (!el) return;
  const u = currentUser();
  el.innerHTML = u
    ? `<a class="mybutcher" href="#/account" data-nav="account">${ICON.user}<span><small>My Butcher</small>${esc(u.name.split(' ')[0])}</span></a>`
    : `<a class="mybutcher" href="#/login" data-nav="account">${ICON.user}<span><small>Sign in · Register</small>My Butcher</span></a>`;
}

export function updateCounts() {
  const n = cartCount();
  $$('[data-cart-count]').forEach((el) => {
    el.textContent = n || '';
    el.dataset.n = n;
  });
  $$('[data-wish-count]').forEach((el) => {
    el.textContent = state.wishlist.length || '';
    el.dataset.n = state.wishlist.length;
  });
}

/* ---------------- CART DRAWER ---------------- */
export function openCart() {
  renderCart();
  const d = $('#cart');
  d.classList.add('is-open');
  d.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('no-scroll');
  stopScroll();
  setTimeout(() => $('.drawer__panel button', d)?.focus(), 100);
}
export function closeCart() {
  const d = $('#cart');
  d.classList.remove('is-open');
  d.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('no-scroll');
  startScroll();
}

export function renderCart() {
  const d = $('#cart');
  const lines = cartLines();
  const sub = cartSubtotal();
  const left = Math.max(0, DELIVERY.freeThreshold - sub);
  const pct = Math.min(100, (sub / DELIVERY.freeThreshold) * 100);
  d.innerHTML = `
    <div class="drawer__scrim" data-close-cart></div>
    <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Your cart">
      <div class="drawer__head"><h3>Your cart <span class="muted" style="font-family:var(--sans);font-size:16px">(${cartCount()})</span></h3>
        <button class="icon-btn" data-close-cart aria-label="Close cart">${ICON.close}</button></div>
      <div class="drawer__ship">${sub === 0 ? `Free delivery on orders over <b>${money(DELIVERY.freeThreshold)}</b>` : left > 0 ? `You're <b class="gold">${money(left)}</b> away from free delivery` : `<b class="gold">You've unlocked free delivery!</b> 🎉`}
        <div class="ship-bar"><span style="width:${pct}%"></span></div><a class="link-btn" href="#/delivery" data-close-cart style="display:inline-block;margin-top:8px">Check my delivery area &amp; fee →</a></div>
      <div class="drawer__lines" data-lenis-prevent>
        ${lines.length ? lines.map(lineHTML).join('') : `<div class="empty"><h3>Your cart is empty</h3><p>Let’s fix that. Start with this week’s specials.</p><a class="btn btn--sm" href="#/shop" data-close-cart>Shop now ${ICON.arrow}</a></div>`}
      </div>
      ${lines.length ? `<div class="drawer__foot">
        <div class="sumrow"><span>Subtotal</span><b>${money(sub)}</b></div>
        <div class="sumrow muted"><span>Delivery</span><span>${left > 0 ? `${money(DELIVERY.fee)} or free over ${money(DELIVERY.freeThreshold)}` : 'Free'}</span></div>
        <a class="btn btn--block magnetic" href="#/checkout" data-close-cart>Checkout · ${money(sub)} ${ICON.arrow}</a>
        <div class="wa-order"><label class="sr" for="waBranch">Branch</label><select class="select" id="waBranch">${BRANCHES.map((b) => `<option value="${b.id}" ${state.branch === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select>
          <a class="btn btn--wa btn--sm" id="waOrder" target="_blank" rel="noopener" href="#">${ICON.whatsapp} Order on WhatsApp</a></div>
        <a class="btn btn--ghost btn--block btn--sm" href="#/shop" data-close-cart>Keep shopping</a>
      </div>` : ''}
    </div>`;
  $$('[data-close-cart]', d).forEach((b) => b.addEventListener('click', closeCart));
  $$('[data-step]', d).forEach((b) =>
    b.addEventListener('click', () => {
      const line = state.cart.find((l) => l.key === b.dataset.key);
      if (line) setQty(line.key, line.qty + Number(b.dataset.step));
    })
  );
  $$('[data-remove]', d).forEach((b) => b.addEventListener('click', () => removeLine(b.dataset.remove)));
  const wa = $('#waOrder', d);
  if (wa) {
    const build = () => {
      const b = BRANCHES.find((x) => x.id === $('#waBranch', d).value);
      const u = currentUser();
      const items = cartLines().map((l) => `• ${l.qty} × ${l.product.name}${l.product.unit === 'kg' ? ' (' + weightLabel(l.weight) + ')' : ''}${l.prep ? ' · ' + l.prep : ''}${l.notes ? ' · "' + l.notes + '"' : ''} = ${money(l.total)}`).join('\n');
      const text = `Hi Iqbal's ${b.name}! I'd like to place an order:\n\n${items}\n\nSubtotal: ${money(cartSubtotal())}${u ? `\n\nName: ${u.name}\nCell: ${u.cell}${u.address ? '\nAddress: ' + u.address : ''}` : ''}\n\nDelivery or collection: `;
      wa.href = `https://wa.me/${b.phoneIntl}?text=${encodeURIComponent(text)}`;
    };
    build();
    $('#waBranch', d).addEventListener('change', build);
  }
}

function lineHTML(l) {
  const p = l.product;
  const meta = [p.unit === 'kg' ? weightLabel(l.weight) : p.cut, l.prep, l.notes && `“${esc(l.notes)}”`].filter(Boolean).join(' · ');
  return `<div class="cline">
    <div class="photo"><img src="${u(p.img, 200)}" alt="${esc(p.name)}" loading="lazy"></div>
    <div><h4><a href="#/product/${p.id}" data-close-cart>${esc(p.name)}</a></h4><small>${meta}</small>
      <button class="link-btn" data-remove="${l.key}">Remove</button></div>
    <div class="cline__right"><b>${money(l.total)}</b>
      <div class="stepper"><button data-step="-1" data-key="${l.key}" aria-label="Decrease">${ICON.minus}</button><output>${l.qty}</output><button data-step="1" data-key="${l.key}" aria-label="Increase">${ICON.plus}</button></div>
    </div></div>`;
}

/* ---------------- FOOTER ---------------- */
export function renderFooter() {
  const f = $('#footer');
  f.classList.remove('wood');
  f.classList.add('ft');
  const col = (title, links) => `<div class="ft__col"><h4>${title}</h4><ul>${links.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
  f.innerHTML = `
    <div class="ft__check" aria-hidden="true"></div>
    <div class="ft__mark" aria-hidden="true">IQBAL’S</div>
    <div class="wrap ft__cta">
      <div><p class="ft__kicker">Hand-cut · NIHT certified halaal</p><h2 class="ft__headline">Fresh cuts, <span>delivered.</span></h2></div>
      <div class="ft__cta-btns">
        <a class="ft__btn ft__btn--y" href="#/shop">Shop now ${ICON.arrow}</a>
        <a class="ft__btn" href="https://wa.me/${BRANCHES[0].phoneIntl}?text=${encodeURIComponent("Hi Iqbal's! I'd like to place an order:")}" target="_blank" rel="noopener">${ICON.whatsapp} WhatsApp an order</a>
      </div>
    </div>
    <div class="wrap ft__top">
      <div class="ft__brand">
        <a href="#/" class="ft__logo" aria-label="Iqbal's Meat & Deli home">${logoWide({ h: 72 })}</a>
        <p class="ft__tag">“${BUSINESS.tagline}”</p>
        <p class="ft__about">Premium halaal beef, lamb and chicken, cut by hand in Benoni and Lenasia. Plus the rotis everyone talks about.</p>
        <div class="ft__badges"><span class="ft__badge">${ICON.shield} NIHT certified halaal</span><a class="ft__badge" href="${BUSINESS.googleProfile}" target="_blank" rel="noopener">${ICON.star} ${BUSINESS.rating} · ${BUSINESS.reviewCount} Google reviews</a></div>
        <div class="ft__social">
          <a href="${BUSINESS.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.instagram}</a>
          <a href="${BUSINESS.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICON.facebook}</a>
          <a href="https://wa.me/${BRANCHES[0].phoneIntl}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.whatsapp}</a>
        </div>
      </div>
      ${col('Shop', [['#/shop', 'All products'], ['#/home/specials', 'Crazy Specials'], ['#/weekly-box', 'Weekly Box'], ['#/cut-studio', 'Cut Studio'], ['#/eid', 'Eid &amp; Ramadan'], ['#/functions', 'Functions &amp; catering']])}
      ${col('Help', [['#/account', 'My Butcher'], ['#/delivery', 'Delivery areas'], ['#/contact', 'Contact us'], ['#/recipes', 'Recipes'], ['#/guide', 'Cooking guide'], ['#/rewards', 'Iqbal’s Rewards'], ['#/game', 'Flying Steak game']])}
      <div class="ft__col ft__col--branches"><h4>Our branches</h4>
        ${BRANCHES.map((b) => { const s = openStatus(b); return `<div class="ft__branch">
          <div class="ft__branch-top"><b>${b.name}</b><span class="ft__status ${s.open ? 'is-open' : ''}"><i></i><span data-open-status="${b.id}">${s.label}</span></span></div>
          <span class="ft__addr">${b.address}</span>
          <span class="ft__links"><a href="tel:${b.phone.replace(/\s/g, '')}">${ICON.phone} ${b.phone}</a><a href="https://wa.me/${b.phoneIntl}" target="_blank" rel="noopener">${ICON.whatsapp} WhatsApp</a></span>
        </div>`; }).join('')}
      </div>
    </div>
    <div class="wrap ft__newsrow">
      <div><b>Crazy Specials in your inbox</b><span>Every Wednesday. No spam, unsubscribe any time (<a href="#/privacy">Privacy Policy</a>).</span></div>
      <form class="ft__news" data-news novalidate><label class="sr" for="newsEmail">Email address</label><input id="newsEmail" type="email" placeholder="you@email.com" required><button type="submit">Subscribe</button></form>
    </div>
    <div class="ft__bar">
      <div class="wrap ft__bottom">
        <span>© ${new Date().getFullYear()} Iqbal’s Meat &amp; Deli. All rights reserved.</span>
        <nav class="ft__legal" aria-label="Legal"><a href="#/terms">Terms</a><a href="#/privacy">Privacy</a><a href="#/shipping">Shipping</a><a href="#/returns">Returns</a><a href="#/admin">Staff</a></nav>
        <div class="ft__pay" aria-label="Payment methods"><span>VISA</span><span>Mastercard</span><span>Instant EFT</span><span>Cash</span></div>
        <span class="ft__by">Website by <a href="${BUSINESS.agency.url}" target="_blank" rel="noopener">Pixel Code</a></span>
      </div>
    </div>`;
  $('[data-news]', f).addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('#newsEmail');
    if (!/^\S+@\S+\.\S+$/.test(inp.value)) {
      toast('Please enter a valid email address', 'err');
      inp.focus();
      return;
    }
    subscribeNewsletter(inp.value.trim());
    inp.value = '';
    toast('You’re on the list. Specials land every Wednesday.');
  });
}

export function initShell() {
  renderHeader();
  renderBottomNav();
  renderFooter();
  updateCounts();
  renderMe();
  subscribe(() => {
    updateCounts();
    renderMe();
    if ($('#cart').classList.contains('is-open')) renderCart();
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-cart]')) {
      e.preventDefault();
      openCart();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCart(); closeMenu(); }
  });
  // refresh "open now" labels every minute
  setInterval(() => {
    $$('[data-open-status]').forEach((el) => {
      const b = BRANCHES.find((x) => x.id === el.dataset.openStatus);
      if (b) el.textContent = openStatus(b).label;
    });
  }, 60000);
  return currentUser;
}
