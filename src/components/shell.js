/* Header, mobile menu, bottom nav, cart drawer and footer. */
import { BUSINESS, BRANCHES, DELIVERY, u } from '../config/site.js';
import { $, $$, ICON, money, weightLabel, esc, toast, openStatus } from '../lib/ui.js';
import { state, subscribe, cartLines, cartCount, cartSubtotal, setQty, removeLine, currentUser, subscribeNewsletter } from '../lib/store.js';
import { logoWide, halaalSeal } from './brand.js';
import { stopScroll, startScroll } from '../lib/motion.js';

const LINKS = [
  ['#/', 'Home', ''],
  ['#/shop', 'Shop', 'shop'],
  ['#/weekly-box', 'Weekly Box', 'weekly-box'],
  ['#/recipes', 'Recipes', 'recipes'],
  ['#/guide', 'Cooking Guide', 'guide'],
  ['#/contact', 'Contact', 'contact'],
];

export function renderHeader() {
  const header = $('#header');
  header.innerHTML = `
    <div class="nav">
      <a class="nav__brand" href="#/" aria-label="Iqbal's Meat & Deli home">${logoWide({ h: 50 })}</a>
      <nav class="nav__links" aria-label="Main">${LINKS.map(([h, l, k]) => `<a href="${h}" data-nav="${k}">${l}</a>`).join('')}</nav>
      <div class="nav__actions">
        <a class="icon-btn hide-sm" href="#/shop?focus=search" aria-label="Search products" data-cursor="hover">${ICON.search}</a>
        <a class="icon-btn hide-sm" href="#/wishlist" aria-label="Wishlist">${ICON.heart}<span class="badge-count" data-wish-count></span></a>
        <span class="nav__me hide-sm" data-me></span>
        <button class="icon-btn" data-open-cart data-cart-target aria-label="Open cart">${ICON.cart}<span class="badge-count" data-cart-count></span></button>
        <button class="icon-btn nav__burger" data-burger aria-label="Open menu" aria-expanded="false">${ICON.menu}</button>
      </div>
    </div>
    <div class="mnav" id="mnav" data-lenis-prevent>
      ${LINKS.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}
      <a href="#/cut-to-order">Cut to Order</a>
      <a href="#/account">My Butcher</a>
      <a href="#/login">Sign in</a>
      <a href="#/register">Register</a>
      <p class="mnav__meta">${BRANCHES.map((b) => `${b.name}: <a href="tel:${b.phone.replace(/\s/g, '')}" style="font:inherit;color:var(--gold-hi)">${b.phone}</a>`).join(' · ')}</p>
    </div>`;

  const burger = $('[data-burger]', header);
  const mnav = $('#mnav');
  burger.addEventListener('click', () => {
    const open = !mnav.classList.contains('is-open');
    mnav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.innerHTML = open ? ICON.close : ICON.menu;
    open ? stopScroll() : startScroll();
  });
  $$('a', mnav).forEach((a) =>
    a.addEventListener('click', () => {
      mnav.classList.remove('is-open');
      burger.innerHTML = ICON.menu;
      startScroll();
    })
  );
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
        <div class="ship-bar"><span style="width:${pct}%"></span></div></div>
      <div class="drawer__lines" data-lenis-prevent>
        ${lines.length ? lines.map(lineHTML).join('') : `<div class="empty"><h3>Your cart is empty</h3><p>Let’s fix that. Start with this week’s specials.</p><a class="btn btn--sm" href="#/shop" data-close-cart>Shop now ${ICON.arrow}</a></div>`}
      </div>
      ${lines.length ? `<div class="drawer__foot">
        <div class="sumrow"><span>Subtotal</span><b>${money(sub)}</b></div>
        <div class="sumrow muted"><span>Delivery</span><span>${left > 0 ? `${money(DELIVERY.fee)} or free over ${money(DELIVERY.freeThreshold)}` : 'Free'}</span></div>
        <a class="btn btn--block magnetic" href="#/checkout" data-close-cart>Checkout · ${money(sub)} ${ICON.arrow}</a>
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
  f.classList.add('wood');
  f.innerHTML = `
    <div class="gingham gingham-strip"></div>
    <div class="footer__top wrap">
      <div class="footer__brand">${logoWide({ h: 160 })}<div><p class="footer__tag">We make a difference!</p><p class="lead" style="margin-top:14px">Premium NIHT certified halaal meat, cut by hand in Benoni and Lenasia.</p></div></div>
      <div class="footer__cols">
        <div><h4>Shop</h4><ul>
          <li><a href="#/shop?cat=beef">Beef</a></li><li><a href="#/shop?cat=lamb">Lamb &amp; Mutton</a></li><li><a href="#/shop?cat=chicken">Chicken</a></li>
          <li><a href="#/shop?cat=braai">Braai Packs</a></li><li><a href="#/shop?cat=bakery">Rotis &amp; Bakery</a></li><li><a href="#/weekly-box">Iqbal’s Weekly Box</a></li></ul></div>
        <div><h4>Help</h4><ul>
          <li><a href="#/account">My account</a></li><li><a href="#/cut-to-order">Cut to order</a></li><li><a href="#/guide">Cooking guide</a></li>
          <li><a href="#/recipes">Recipes</a></li><li><a href="#/contact">Contact us</a></li><li><button data-open-chat class="link-plain">Ask the Butcher</button></li></ul></div>
        <div><h4>Visit us</h4><ul>
          ${BRANCHES.map((b) => `<li><b>${b.name}</b><br><span class="muted">${b.address}</span><br><a href="tel:${b.phone.replace(/\s/g, '')}">${b.phone}</a> · <span data-open-status="${b.id}">${openStatus(b).label}</span><br><small class="muted">${b.hoursLabel}</small></li>`).join('')}
          </ul></div>
        <div><h4>Crazy specials in your inbox</h4>
          <p class="muted" style="font-size:16px">Weekly specials, Saturday giveaways and new arrivals. No spam.</p>
          <form class="news" data-news novalidate><label class="sr" for="newsEmail">Email</label><input class="input" id="newsEmail" type="email" placeholder="you@email.com" required><button class="btn" type="submit">Join</button></form>
          <div class="socials">
            <a href="${BUSINESS.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.instagram}</a>
            <a href="${BUSINESS.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICON.facebook}</a>
            <a href="https://wa.me/${BRANCHES[0].phoneIntl}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.whatsapp}</a>
          </div>
          ${halaalSeal('footer__seal')}
        </div>
      </div>
    </div>
    <div class="wrap footer__bottom">
      <span>© ${new Date().getFullYear()} Iqbal’s Meat &amp; Deli. All meat NIHT certified halaal.</span>
      <span>Website by <a href="${BUSINESS.agency.url}" target="_blank" rel="noopener">Pixel Code</a></span>
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
    if (e.key === 'Escape') closeCart();
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
