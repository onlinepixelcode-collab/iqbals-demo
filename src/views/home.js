/* =====================================================================
   HOME · the "wow" scroll
   ===================================================================== */
import { BUSINESS, BRANCHES, DELIVERY, IMG, INSTAGRAM_POSTS, SPECIALS_END, COMPETITION, SEASONAL, u } from '../config/site.js';
import { PRODUCTS, CATEGORIES, productById, unitPrice } from '../data/products.js';
import { REVIEWS, MEAT_MAP } from '../data/content.js';
import { $, $$, ICON, money, esc, img, toast, flyToCart, reduceMotion, isTouch, openStatus, hoursTable, weightLabel } from '../lib/ui.js';
import { gsap, ScrollTrigger, setupTilt, scrollTo, splitLines } from '../lib/motion.js';
import { addToCart } from '../lib/store.js';
import { APPETITES, BRAAI_MEATS, calcBraai, addBraaiToCart } from '../lib/braai.js';
import { halaalSeal, foilRule } from '../components/brand.js';
import { quickAdd } from '../components/product.js';

const STORY = [
  { n: '01', title: 'Sourced &amp; NIHT certified', text: 'Every carcass comes from trusted, inspected suppliers and is certified halaal by the National Independent Halaal Trust. Active certification, on the wall in both shops.', label: 'NIHT Halaal' },
  { n: '02', title: 'Hand-cut by master butchers', text: 'No pre-packed trays. Our butchers break down whole primals every morning and cut to the thickness you ask for, right there at the counter.', label: 'Hand-cut daily' },
  { n: '03', title: 'Prepared your way', text: 'Washed and cut chicken. Cubed, minced, curry pieces or biryani cut. Marinated in our house peri-peri, tikka or lemon &amp; herb. Just say the word.', label: 'Your way' },
  { n: '04', title: 'Delivered to your door, weekly', text: 'Order online for delivery or collection, or set up Iqbal’s Weekly Box and never run out of good meat again.', label: 'Weekly delivery' },
];

/* ---------------- RENDER ---------------- */
export function render() {
  const specials = PRODUCTS.filter((p) => p.special);
  const season = seasonal();
  return `
  <section class="hero" data-theme="light" aria-label="Welcome">
    <div class="hero__bg wood"></div>
    <div class="hero__canvas" id="heroCanvas" aria-hidden="true"></div>
    ${halaalSeal('hero__seal')}
    <div class="wrap hero__inner">
      <div>
        <p class="eyebrow">Benoni · Lenasia · NIHT certified halaal</p>
        <h1 data-hero-split>Cut <span class="it">above.</span><br>Since day one.</h1>
        <p class="hero__tag" data-hero-fade>“${BUSINESS.tagline}”</p>
        <div class="hero__ctas" data-hero-fade>
          <a class="btn magnetic" href="#/shop">Shop Now ${ICON.arrow}</a>
          <button type="button" class="btn btn--ghost magnetic" data-jump="#specials">This week’s specials</button>
        </div>
      </div>
      <aside class="hero__side" data-hero-fade>
        <a class="hero__rating" href="${BUSINESS.googleProfile}" target="_blank" rel="noopener">
          <span class="g">${ICON.google.replace('<svg', '<svg class="g"')}</span>
          <span><b>${BUSINESS.rating}</b> <span class="stars">${ICON.star.repeat(4)}</span><small>${BUSINESS.reviewCount} Google reviews</small></span>
        </a>
        <div class="hero__open">${BRANCHES.map((b) => { const s = openStatus(b); return `<button type="button" class="hero__branch" data-jump="#branches"><b>${b.name}</b><span class="status ${s.open ? '' : 'is-closed'}" data-open-status-pill="${b.id}"><i></i><span data-open-status="${b.id}">${s.label}</span></span></button>`; }).join('')}</div>
      </aside>
    </div>
    <div class="hero__scroll" aria-hidden="true">Scroll<i></i></div>
  </section>

  <nav class="quick wrap" aria-label="Quick actions">
    <a class="quick__item" href="#/shop">${ICON.cart}<span><b>Order online</b><small>Delivery or collection</small></span></a>
    <a class="quick__item" href="#/delivery">${ICON.truck}<span><b>Delivery areas</b><small>Free over ${money(DELIVERY.freeThreshold).replace(/\.00$/, '')}</small></span></a>
    <a class="quick__item" href="#/cut-studio">${ICON.knife}<span><b>Cut Studio</b><small>Order it cut your way</small></span></a>
    <div class="quick__item quick__item--wa">${ICON.whatsapp}<span><b>WhatsApp an order</b><span class="quick__wa">${BRANCHES.map((b) => `<a href="https://wa.me/${b.phoneIntl}?text=${encodeURIComponent(`Hi Iqbal's ${b.name}! I'd like to place an order:`)}" target="_blank" rel="noopener">${b.name}</a>`).join('')}</span></span></div>
  </nav>

  <section class="sec" data-theme="light" id="specials" aria-labelledby="spTitle">
    <div class="wrap">
      <div class="board wood">
        <div class="board__head">
          <h2 class="board__title" id="spTitle"><small>This week only</small>Crazy <em>Specials</em></h2>
          <div><p class="countdown__label">Specials end Sunday at 6:30 PM</p><div class="countdown" id="countdown" aria-live="off">
            ${['Days', 'Hrs', 'Min', 'Sec'].map((l) => `<div><b data-cd="${l}">00</b><small>${l}</small></div>`).join('')}</div></div>
        </div>
        <span class="cold-badge" style="margin:-18px 0 22px">Kept at 0–4 °C in our cold room until it’s cut</span>
        <div class="specials" id="specialsList">
          ${specials.map((p) => `<div class="special">
            <div class="photo">${img(p.img, 200, p.name)}</div>
            <div><h4>${esc(p.name)}</h4><small>${esc(p.cut)}</small></div>
            <div class="special__price">
              <span class="flip"><span class="flip__card"><span class="flip__face flip__face--was">${money(p.price)}</span><span class="flip__face flip__face--now">${money(unitPrice(p))}</span></span></span>
              <span class="special__per">${p.unit === 'kg' ? 'per kg' : 'each'}</span>
              <button class="add-mini" data-add="${p.id}">${ICON.plus} Add</button>
            </div></div>`).join('')}
        </div>
        <div class="mist" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      </div>
      <div class="comp" data-reveal>
        <div class="comp__ribbon gingham" aria-hidden="true">🏆</div>
        <div><h3>${COMPETITION.title}</h3><p>${COMPETITION.text}</p></div>
        <a class="btn" href="${BUSINESS.instagram}" target="_blank" rel="noopener">Follow ${BUSINESS.instagramHandle}</a>
      </div>
    </div>
  </section>

  <section class="sec hcats2" data-theme="light" id="categories" aria-labelledby="catTitle">
    <div class="wrap">
      <div class="sec-head">
        <div><p class="eyebrow">The Counter</p><h2 class="h-lg" id="catTitle" data-split>Shop by <span class="it">category.</span></h2></div>
        <a class="btn btn--ghost magnetic" href="#/shop">All ${PRODUCTS.length} products ${ICON.arrow}</a>
      </div>
      <div class="cgrid" data-reveal="stagger">
        ${CATEGORIES.map((c) => `<a class="cgrid__item" href="#/shop?cat=${c.id}" data-cursor="view">
          <div class="photo">${img(c.img, 600, c.name)}</div>
          <div class="cgrid__body"><h3>${c.name}</h3><small>${PRODUCTS.filter((p) => p.category === c.id).length} items · from ${money(Math.min(...PRODUCTS.filter((p) => p.category === c.id).map(unitPrice)))}</small></div>
        </a>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec" data-theme="light" id="branches" aria-labelledby="brTitle" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head"><div><p class="eyebrow">Visit us</p><h2 class="h-lg" id="brTitle" data-split>Two shops. <span class="it">One standard.</span></h2></div>
      <p class="lead">Pop in for the counter and the weekend boerie rolls, or order ahead and collect.</p></div>
      <div class="bmini">${BRANCHES.map(branchMini).join('')}</div>
    </div>
  </section>

  ${season ? `<section class="wrap season" aria-label="${season.title}">
    <a class="season__card" href="#/eid">
      <span class="season__icon">${ICON.moon}</span>
      <span><small>${season.kicker}</small><b>${season.title}</b><span>${season.text}</span></span>
      <span class="btn btn--sm">${season.cta} ${ICON.arrow}</span>
    </a>
  </section>` : ''}

  <section class="story" id="story" data-theme="light" aria-label="How we work">
    <div class="story__pin">
      <div class="story__canvas" id="storyCanvas" aria-hidden="true"></div>
      <div class="story__panels">
        ${STORY.map((s, i) => `<article class="story__panel" data-story="${i}">
          <span class="story__num">${s.n}</span><h3>${s.title}</h3><p>${s.text}</p></article>`).join('')}
      </div>
      ${STORY.map((s, i) => `<span class="story__label" data-label="${i}">${s.label}</span>`).join('')}
      <div class="story__dots">${STORY.map(() => '<i></i>').join('')}</div>
      <div class="story__bar"><span></span></div>
    </div>
  </section>

  <section class="sec sec--light paper" data-theme="light" id="meat-map" aria-labelledby="mmTitle">
    <div class="wrap">
      <a class="studio-teaser" href="#/cut-studio" data-reveal>
        <span class="studio-teaser__icon">${ICON.knife}</span>
        <span><small>New · Cut Studio</small><b>Build your cut and watch it on the bandsaw.</b><span>Choose the meat, thickness, trim, marinade and packing. We cut it exactly like that.</span></span>
        <span class="btn">Open Cut Studio ${ICON.arrow}</span>
      </a>
      <div class="sec-head">
        <div><p class="eyebrow">The Meat Map</p><h2 class="h-lg" id="mmTitle" data-split>Know your <span class="it">cuts.</span></h2></div>
        <p class="lead">Hover or tap any cut to see what it is, how to cook it, and add it straight to your cart. South African butchery names.</p>
      </div>
      <div class="meatmap">
        <div>
          <div class="meatmap__tabs" role="tablist">${Object.entries(MEAT_MAP).map(([k, v], i) => `<button class="chip ${i === 0 ? 'is-on' : ''}" role="tab" aria-selected="${i === 0}" data-animal="${k}">${v.label}</button>`).join('')}</div>
          <div class="meatmap__stage" id="mmStage"></div>
        </div>
        <div class="meatmap__info" id="mmInfo" aria-live="polite"></div>
      </div>
    </div>
  </section>

  <section class="sec" data-theme="light" aria-label="Iqbal’s Weekly Box">
    <div class="wrap">
      <div class="band" data-scale>
        <div class="photo">${img(IMG.assortment, 1400, '')}</div>
        <div><p class="eyebrow">Iqbal’s Weekly Box</p><h2 class="h-lg">Good meat,<br><span class="it gold">every week.</span></h2>
          <p class="lead" style="color:rgba(243,230,200,.85)">Family, Braai, Curry or Chicken Lovers. Or build your own. Pause, skip or cancel any time.</p></div>
        <div style="display:grid;gap:12px;justify-items:start"><a class="btn magnetic" href="#/weekly-box">Build my box ${ICON.arrow}</a><a class="btn btn--ghost" href="#/cut-to-order">Request a special cut</a></div>
      </div>
    </div>
  </section>

  <section class="sec sec--red" data-theme="maroon" id="braai" aria-labelledby="bbTitle">
    <div class="wrap">
      <div class="sec-head">
        <div><p class="eyebrow">Braai Builder</p><h2 class="h-lg" id="bbTitle" data-split>How much meat<br><span class="it">for the braai?</span></h2></div>
        <p class="lead">Tell us who’s coming and how hungry they are. We’ll work out the kilos and pack it for you in one click.</p>
      </div>
      <div class="braai">
        <div class="braai__panel" data-reveal>
          <div class="braai__step"><div class="label"><span>1 · Guests</span></div>
            <div class="guests"><b id="bbGuests">10</b><span class="muted">people</span></div>
            <input class="range" type="range" min="2" max="60" value="10" id="bbRange" aria-label="Number of guests"></div>
          <div class="braai__step"><div class="label"><span>2 · Appetite</span></div>
            <div class="chips" role="radiogroup" aria-label="Appetite">${APPETITES.map((a, i) => `<button class="chip ${i === 1 ? 'is-on' : ''}" data-ap="${a.id}" role="radio" aria-checked="${i === 1}">${a.label}</button>`).join('')}</div></div>
          <div class="braai__step" style="margin:0"><div class="label"><span>3 · Meat</span><span class="muted" style="text-transform:none;letter-spacing:0">pick as many as you like</span></div>
            <div class="chips">${BRAAI_MEATS.map((m, i) => `<button class="chip ${i < 4 ? 'is-on' : ''}" data-meat="${m.id}" aria-pressed="${i < 4}">${m.label}</button>`).join('')}</div></div>
        </div>
        <div class="braai__tally" data-reveal>
          <p class="eyebrow" style="color:var(--oxblood);margin-top:12px">Your braai pack</p>
          <h3 id="bbSummary">10 hungry guests</h3>
          <ul class="tally" id="bbTally"></ul>
          <div class="tally__total"><span><b id="bbKg" style="font-family:var(--serif);font-size:24px">0</b> kg in total</span><b id="bbTotal">R 0</b></div>
          <button class="btn btn--maroon btn--block magnetic" id="bbAdd">Add braai pack to cart ${ICON.arrow}</button>
        </div>
      </div>
    </div>
  </section>

  <section class="sec roti" aria-labelledby="rotiTitle">
    <div class="wrap roti__grid">
      <div class="roti__stack">
        <div class="photo" data-clip="center">${img(IMG.roti, 900, 'A stack of fresh rotis')}</div>
        <div class="photo" data-reveal>${img(IMG.rotiCurry, 500, 'Roti with curry')}</div>
      </div>
      <div>
        <p class="eyebrow" style="color:#ffe1a1">Bakery &amp; Rotis</p>
        <h2 class="h-lg" id="rotiTitle" data-split>The best rotis<br><span class="it">on the East Rand.</span></h2>
        <p class="lead">Soft, flaky and buttery, made fresh every day. Customers freeze them by the dozen, and they still taste just-made.</p>
        <blockquote class="roti__quote">“${REVIEWS[4].text}”<cite>${REVIEWS[4].name} · Google review ★★★★★</cite></blockquote>
        <div class="roti__items" data-reveal="stagger">
          ${['rotis', 'mince-samosas', 'chicken-pie'].map((id) => { const p = productById(id); return `<div class="roti__item"><b>${p.name}</b><span>${money(unitPrice(p))} · ${p.cut}</span></div>`; }).join('')}
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn" data-add="rotis" style="--bg-btn:#fff2d6">Add rotis to cart ${ICON.plus}</button><a class="btn btn--ghost" href="#/shop?cat=bakery" style="--fg-btn:#fff7e6;box-shadow:inset 0 0 0 1.5px #ffe1a1">Full bakery</a></div>
      </div>
    </div>
  </section>

  <section class="sec sec--light paper" data-theme="light" id="reviews-sec" aria-labelledby="rvTitle">
    <div class="wrap">
      <div class="reviews__head">
        <div><p class="eyebrow">Why Iqbal’s</p><h2 class="h-lg" id="rvTitle" data-split>Loved by <span class="it">regulars.</span></h2></div>
        <a class="gscore" href="${BUSINESS.googleProfile}" target="_blank" rel="noopener">${ICON.google.replace('<svg', '<svg class="g"')}<div><b>${BUSINESS.rating}</b> <span class="stars">${ICON.star.repeat(4)}</span><small>${BUSINESS.reviewCount} Google reviews · Read them all →</small></div></a>
      </div>
      <div class="why" data-reveal="stagger">
        <div class="stat"><span class="stat__icon">${ICON.star}</span><b><span data-count="${BUSINESS.rating}">${BUSINESS.rating}</span><sup>★</sup></b><p>Google rating from real customers</p></div>
        <div class="stat"><span class="stat__icon">${ICON.chat}</span><b><span data-count="${BUSINESS.reviewCount}">${BUSINESS.reviewCount}</span></b><p>Google reviews</p></div>
        <div class="stat"><span class="stat__icon">${ICON.pin}</span><b><span data-count="${BRANCHES.length}">${BRANCHES.length}</span></b><p>Branches: Benoni &amp; Lenasia</p></div>
        <div class="stat"><span class="stat__icon">${ICON.shield}</span><b><span data-count="100">100</span><sup>%</sup></b><p>NIHT certified halaal</p></div>
      </div>
    </div>
    <div class="rv" id="reviews" aria-label="Customer reviews, drag to browse" tabindex="0">
      <div class="rv__track">${[...REVIEWS, ...REVIEWS, ...REVIEWS].map(reviewCard).join('')}</div>
    </div>
    <p class="rv__hint">Drag to browse ⟷</p>
  </section>

  <section class="sec sec--red" data-theme="maroon" aria-labelledby="igTitle">
    <div class="wrap">
      <div class="sec-head"><div><p class="eyebrow">On Instagram</p><h2 class="h-lg" id="igTitle" data-split>Fresh from <span class="it">${BUSINESS.instagramHandle}</span></h2></div>
      <a class="btn btn--ghost magnetic" href="${BUSINESS.instagram}" target="_blank" rel="noopener">${ICON.instagram} Follow us</a></div>
      <div class="ig">${INSTAGRAM_POSTS.map((p) => `<a href="${BUSINESS.instagram}" target="_blank" rel="noopener" aria-label="${esc(p.caption)} on Instagram"><div class="photo" data-clip>${img(p.img, 600, p.caption)}</div><span class="ig__over">${ICON.instagram}${esc(p.caption)}</span></a>`).join('')}</div>
    </div>
  </section>`;
}

/* Eid / Ramadan banner: shows from 14 days before Ramadan to the end of Ramadan,
   and from 60 days before Eid al-Adha to Eid day. Dates live in config/site.js. */
function seasonal(now = new Date()) {
  const day = (iso) => new Date(iso + 'T00:00:00');
  const days = (a, b) => Math.ceil((b - a) / 864e5);
  const eid = day(SEASONAL.eidDate);
  const rs = day(SEASONAL.ramadanStart), re = day(SEASONAL.ramadanEnd);
  if (now >= new Date(rs - 14 * 864e5) && now <= new Date(+re + 864e5)) {
    const before = now < rs;
    return { kicker: before ? `Ramadan starts in ${days(now, rs)} days (expected)` : 'Ramadan Mubarak', title: 'Iftaar packs, samosas &amp; rotis in bulk', text: 'Pre-order for the month and collect or get it delivered.', cta: 'See iftaar packs' };
  }
  if (now >= new Date(eid - 60 * 864e5) && now <= new Date(+eid + 864e5)) {
    const left = days(now, eid);
    return { kicker: left > 0 ? `${SEASONAL.eidLabel} in ${left} days (expected)` : `${SEASONAL.eidLabel} Mubarak`, title: 'Qurbani bookings are open', text: 'Sheep, goat and cow shares, slaughtered and cut by our certified team.', cta: 'Book Qurbani' };
  }
  return null;
}

/* compact branch card for the homepage (the full card with map lives on the contact page) */
function branchMini(b) {
  const s = openStatus(b);
  const tel = b.phone.replace(/\s/g, '');
  const today = hoursTable(b).find((r) => r.today);
  return `<article class="bmini__card" data-reveal>
    <div class="bmini__top"><h3>${b.name}</h3><span class="status ${s.open ? '' : 'is-closed'}" data-open-status-pill="${b.id}"><i></i><span data-open-status="${b.id}">${s.label}</span></span></div>
    <p class="bmini__addr">${ICON.pin}<span>${b.address}</span></p>
    <p class="bmini__today">${ICON.clock}<span>Today: <b>${today ? today.h : ''}</b></span></p>
    <details class="bmini__hours"><summary>All trading hours</summary><table class="hours" aria-label="${b.name} trading hours"><tbody>${hoursTable(b).map((r) => `<tr class="${r.today ? 'is-today' : ''}"><td>${r.day}</td><td>${r.h}</td></tr>`).join('')}</tbody></table></details>
    <div class="bmini__ctas">
      <a class="btn btn--sm btn--maroon" href="tel:${tel}">${ICON.phone} Call</a>
      <a class="btn btn--sm btn--wa" href="https://wa.me/${b.phoneIntl}" target="_blank" rel="noopener">${ICON.whatsapp} WhatsApp</a>
      <a class="btn btn--sm btn--dark" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.mapQuery)}" target="_blank" rel="noopener">Directions</a>
    </div>
  </article>`;
}

function reviewCard(r) {
  const initials = r.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return `<article class="rcard">
    <div class="rcard__top"><span class="stars" aria-label="${r.stars} stars">${ICON.star.repeat(r.stars)}</span>${ICON.google.replace('<svg', '<svg class="g"')}</div>
    <blockquote>“${esc(r.text)}”</blockquote>
    <div class="rcard__who"><span class="rcard__av">${initials}</span><div><b>${esc(r.name)}</b><small>${r.guide ? 'Local Guide · ' : ''}Google review</small></div></div>
  </article>`;
}

export function branchCard(b) {
  const s = openStatus(b);
  const tel = b.phone.replace(/\s/g, '');
  return `<article class="branch" data-reveal>
    <div class="branch__map" data-map="${encodeURIComponent(b.mapQuery)}"><div class="map-load"><span>${ICON.pin.replace('<svg', '<svg style="width:34px;margin:0 auto 8px;color:var(--oxblood)"')}Loading map…</span></div></div>
    <div class="branch__body">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h3>${b.name}</h3><span class="status ${s.open ? '' : 'is-closed'}" data-open-status-pill="${b.id}"><i></i><span data-open-status="${b.id}">${s.label}</span></span></div>
      <div class="branch__row">${ICON.pin}<span>${b.address}</span></div>
      <div class="branch__row">${ICON.phone}<a href="tel:${tel}">${b.phone}</a></div>
      <table class="hours" aria-label="${b.name} trading hours"><tbody>${hoursTable(b).map((r) => `<tr class="${r.today ? 'is-today' : ''}"><td>${r.day}${r.today ? ' · today' : ''}</td><td>${r.h}</td></tr>`).join('')}</tbody></table>
      <div class="branch__ctas">
        <a class="btn btn--maroon" href="tel:${tel}">${ICON.phone} Call</a>
        <a class="btn btn--wa" href="https://wa.me/${b.phoneIntl}?text=${encodeURIComponent(`Hi Iqbal's ${b.name}! I'd like to place an order:`)}" target="_blank" rel="noopener">${ICON.whatsapp} WhatsApp</a>
        <a class="btn btn--dark" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.mapQuery)}" target="_blank" rel="noopener">${ICON.arrow} Directions</a>
      </div>
    </div></article>`;
}

/* ---------------- MOUNT ---------------- */
export function mount(root, params) {
  const cleanups = [];
  const lite = isTouch() || innerWidth < 900;
  const rm = reduceMotion();

  /* HERO intro (runs once the loader has finished) */
  const heroIntro = () => {
    const h1 = $('[data-hero-split]', root);
    const lines = splitLines(h1);
    if (rm) return;
    gsap.from(lines, { yPercent: 115, rotate: 4, duration: 1.4, ease: 'power4.out', stagger: 0.12, delay: 0.1 });
    gsap.from($$('[data-hero-fade]', root), { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.6 });
    gsap.from('.hero .eyebrow', { opacity: 0, x: -30, duration: 1, delay: 0.3 });
  };
  if (document.body.classList.contains('is-loading')) window.addEventListener('site:ready', heroIntro, { once: true });
  else heroIntro();

  /* HERO 3D */
  let hero3d = null;
  let story3d = null;
  const loadScene = () => import('../components/steak3d.js');
  const heroEl = $('#heroCanvas', root);
  if (!rm) {
    loadScene()
      .then(({ createSteakScene }) => {
        if (!heroEl.isConnected) return;
        heroEl.addEventListener('steak:error', () => heroFallback(heroEl), { once: true });
        hero3d = createSteakScene(heroEl, { mode: 'hero', lite });
        gsap.from(heroEl, { opacity: 0, duration: 2, ease: 'power2.out' });
      })
      .catch(() => heroFallback(heroEl));
  } else heroFallback(heroEl);

  /* HERO parallax out */
  if (!rm && !lite) {
    gsap.to('.hero__inner', { yPercent: -25, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(heroEl, { scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* STORY (pinned) */
  mountStory(root, lite, rm, loadScene, (s) => (story3d = s));

  /* MEAT MAP */
  mountMeatMap(root);

  /* in-page jump buttons (hero → specials / branches) */
  $$('[data-jump]', root).forEach((b) => b.addEventListener('click', () => scrollTo(b.dataset.jump)));

  /* SPECIALS countdown + flip */
  const cd = setInterval(() => tick(root), 1000);
  tick(root);
  cleanups.push(() => clearInterval(cd));
  ScrollTrigger.create({
    trigger: '#specialsList', start: 'top 75%', once: true,
    onEnter: () => $$('.flip', root).forEach((f, i) => setTimeout(() => f.classList.add('is-flipped'), rm ? 0 : 300 + i * 160)),
  });

  /* BRAAI BUILDER */
  mountBraai(root);

  /* REVIEWS */
  cleanups.push(mountReviews($('#reviews', root), rm));

  /* BRANCH MAPS (lazy) */
  const io = new IntersectionObserver((ents) =>
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.innerHTML = `<iframe title="Map to Iqbal's" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${el.dataset.map}&output=embed"></iframe>`;
      io.unobserve(el);
    }), { rootMargin: '300px' });
  $$('[data-map]', root).forEach((m) => io.observe(m));
  cleanups.push(() => io.disconnect());

  if (params?.section) setTimeout(() => scrollTo('#' + params.section), 600);

  return () => {
    cleanups.forEach((f) => f());
    hero3d?.destroy();
    story3d?.destroy();
  };
}

function heroFallback(el) {
  el.innerHTML = `<div class="hero__fallback"><div class="photo">${img(IMG.tomahawk, 1000, 'Tomahawk steak')}</div></div>`;
}

/* ---------------- STORY ---------------- */
function mountStory(root, lite, rm, loadScene, setScene) {
  const panels = $$('[data-story]', root);
  const labels = $$('[data-label]', root);
  const dots = $$('.story__dots i', root);
  const bar = $('.story__bar span', root);
  let scene = null;
  let current = -1;
  let lastP = 0;

  const setActive = (i) => {
    if (i === current) return;
    current = i;
    panels.forEach((p, k) => {
      p.classList.toggle('is-on', k === i);
      gsap.to(p, { opacity: k === i ? 1 : 0, y: k === i ? 0 : k < i ? -40 : 40, duration: 0.7, ease: 'power3.out', overwrite: true });
    });
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
  };

  const onLabels = (pts, active, split) => {
    labels.forEach((l, i) => {
      const show = split > 0.5 && i === active;
      l.style.left = pts[i].x + 'px';
      l.style.top = pts[i].y - 40 + 'px';
      l.style.opacity = show ? 1 : 0;
      l.style.transform = `translate(-50%,-100%) scale(${show ? 1 : 0.8})`;
    });
  };

  if (rm) {
    // static: show all panels stacked, no pin
    $('.story__pin', root).style.height = 'auto';
    $('.story__panels', root).style.cssText = 'display:grid;gap:40px;padding:120px var(--gutter)';
    panels.forEach((p) => (p.style.cssText = 'position:static;opacity:1;transform:none;width:auto;pointer-events:auto'));
    return;
  }

  setActive(0);
  ScrollTrigger.create({
    trigger: '#story', pin: '.story__pin', start: 'top top', end: '+=' + innerHeight * 2.6, scrub: true, anticipatePin: 1,
    onUpdate: (self) => {
      const p = self.progress;
      lastP = p;
      scene?.setProgress(p);
      bar.style.transform = `scaleX(${p})`;
      setActive(Math.min(3, Math.max(0, Math.floor((p - 0.08) / 0.23))));
    },
  });

  // create the WebGL scene when the story is close
  ScrollTrigger.create({
    trigger: '#story', start: 'top bottom', once: true,
    onEnter: () =>
      loadScene().then(({ createSteakScene }) => {
        const el = $('#storyCanvas', root);
        if (!el?.isConnected) return;
        scene = createSteakScene(el, { mode: 'story', lite, onLabels });
        scene.setProgress(lastP);
        setScene(scene);
      }).catch(() => {
        $('#storyCanvas', root).innerHTML = `<div class="hero__fallback"><div class="photo">${img(IMG.marbled, 1000, '')}</div></div>`;
      }),
  });
}

/* ---------------- MEAT MAP ---------------- */
function mountMeatMap(root) {
  const stage = $('#mmStage', root);
  const info = $('#mmInfo', root);
  let animal = 'beef';

  const showRegion = (r) => {
    $$('.mm-region', stage).forEach((el) => el.classList.toggle('is-on', el.dataset.id === r.id));
    $$('.mm-label', stage).forEach((el) => el.classList.toggle('is-on', el.dataset.for === r.id));
    const cuts = r.cuts.map((c) => { const p = productById(c.product); return p ? `<div class="mm-cut"><div><b>${c.label}</b><small>${money(unitPrice(p))} ${p.unit === 'kg' ? '/ kg' : ''}</small></div><button class="add-mini" data-add="${p.id}">${ICON.plus} Add</button></div>` : ''; }).join('');
    info.innerHTML = `<span class="label">${MEAT_MAP[animal].label} · primal cut</span><h3>${r.name}</h3>
      ${r.desc ? `<p class="mm-desc">${r.desc}</p>` : ''}
      <p style="margin:0"><b style="color:var(--gold-hi)">Best for:</b> ${r.method}</p>
      <div class="mm-cuts">${cuts || `<div class="mm-cut"><div><b>Cut to order</b><small>Ask our butchers. We’ll cut it for you.</small></div><a class="add-mini" href="#/cut-to-order">Request ${ICON.arrow}</a></div>`}</div>`;
    gsap.from(info.children, { y: 16, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
  };

  const draw = () => {
    const a = MEAT_MAP[animal];
    const vb = a.viewBox || '0 0 800 460';
    const body = a.body || a.outline;
    const [, , vw, vh] = vb.split(' ').map(Number);
    stage.style.aspectRatio = `${vw} / ${vh}`;
    const label = (r) => {
      const L = r.label || (() => { const c = centroid(r.d); return { x: c[0], y: c[1], r: 0, t: r.name.split(' ')[0].toUpperCase(), s: 18 }; })();
      const lines = L.t.split('\n');
      const fs = (L.s || 28) * 1.12;
      return `<text class="mm-label" data-for="${r.id}" font-size="${fs}" text-anchor="middle" transform="translate(${L.x} ${L.y}) rotate(${L.r || 0})">${lines.map((ln, i) => `<tspan x="0" dy="${i === 0 ? -(lines.length - 1) * fs * 0.55 + fs * 0.35 : fs * 1.1}">${ln}</tspan>`).join('')}</text>`;
    };
    stage.innerHTML = `<svg class="mm-svg" viewBox="${vb}" role="img" aria-label="${a.label} cuts diagram">
      <defs><clipPath id="mmClip-${animal}"><path d="${body}"/></clipPath></defs>
      <path class="mm-body" d="${body}"></path>
      <g clip-path="url(#mmClip-${animal})">
        ${a.regions.map((r) => `<path class="mm-region ${a.lines && !r.oval ? 'mm-region--fill' : ''}" data-id="${r.id}" d="${r.d}" tabindex="0" role="button" aria-label="${r.name}: ${r.method}"></path>`).join('')}
        ${a.lines ? `<path class="mm-lines" d="${a.lines}"></path>` : ''}
      </g>
      ${a.regions.map(label).join('')}
    </svg>`;
    $$('.mm-region', stage).forEach((el) => {
      const r = a.regions.find((x) => x.id === el.dataset.id);
      el.addEventListener('mouseenter', () => showRegion(r));
      el.addEventListener('click', () => showRegion(r));
      el.addEventListener('focus', () => showRegion(r));
      el.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showRegion(r)));
    });
    showRegion(a.regions.find((r) => r.id === (animal === 'beef' ? 'rib' : animal === 'lamb' ? 'rack' : 'breast')) || a.regions[0]);
  };

  $$('[data-animal]', root).forEach((b) =>
    b.addEventListener('click', () => {
      animal = b.dataset.animal;
      $$('[data-animal]', root).forEach((x) => {
        x.classList.toggle('is-on', x === b);
        x.setAttribute('aria-selected', x === b);
      });
      draw();
    })
  );
  draw();
}

/* rough label position: average of the path's first-subpath coordinates */
function centroid(d) {
  const first = d.split(/Z/i)[0];
  const nums = first.match(/-?\d+(\.\d+)?/g).map(Number);
  let x = 0, y = 0, n = 0;
  for (let i = 0; i + 1 < nums.length; i += 2) { x += nums[i]; y += nums[i + 1]; n++; }
  return [Math.round(x / n), Math.round(y / n) + 4];
}

/* ---------------- COUNTDOWN ---------------- */
function specialsEnd() {
  const now = new Date();
  const sa = new Date(now.getTime() + (now.getTimezoneOffset() + 120) * 60000);
  const [h, m] = SPECIALS_END.time.split(':').map(Number);
  const end = new Date(sa);
  end.setHours(h, m, 0, 0);
  let add = (SPECIALS_END.weekday - sa.getDay() + 7) % 7;
  if (add === 0 && sa >= end) add = 7;
  end.setDate(end.getDate() + add);
  return end - sa;
}
function tick(root) {
  const ms = Math.max(0, specialsEnd());
  const s = Math.floor(ms / 1000);
  const vals = { Days: Math.floor(s / 86400), Hrs: Math.floor((s % 86400) / 3600), Min: Math.floor((s % 3600) / 60), Sec: s % 60 };
  Object.entries(vals).forEach(([k, v]) => {
    const el = $(`[data-cd="${k}"]`, root);
    if (el) el.textContent = String(v).padStart(2, '0');
  });
}

/* ---------------- BRAAI BUILDER ---------------- */
function mountBraai(root) {
  const st = { guests: 10, ap: 'hungry', meats: BRAAI_MEATS.slice(0, 4).map((m) => m.id) };
  const range = $('#bbRange', root);
  const shown = { kg: 0, total: 0 };
  let result = null;

  const update = () => {
    result = calcBraai(st.guests, st.ap, st.meats);
    $('#bbGuests', root).textContent = st.guests;
    range.style.setProperty('--p', ((st.guests - 2) / 58) * 100 + '%');
    $('#bbSummary', root).textContent = `${st.guests} ${APPETITES.find((a) => a.id === st.ap).label.toLowerCase()} guests`;
    $('#bbTally', root).innerHTML = result.lines.length
      ? result.lines.map((l) => `<li><span>${l.meat.label}</span><b>${weightLabel(l.kg)}</b><span>${money(l.price)}</span></li>`).join('')
      : '<li class="tally__empty">Pick at least one meat to build your pack.</li>';
    gsap.to(shown, {
      kg: result.kg, total: result.total, duration: 0.8, ease: 'power3.out', overwrite: true,
      onUpdate: () => {
        $('#bbKg', root).textContent = shown.kg.toFixed(2).replace(/\.00$/, '');
        $('#bbTotal', root).textContent = money(Math.round(shown.total));
      },
    });
    $('#bbAdd', root).disabled = !result.lines.length;
  };

  range.addEventListener('input', () => {
    st.guests = Number(range.value);
    update();
  });
  $$('[data-ap]', root).forEach((b) =>
    b.addEventListener('click', () => {
      st.ap = b.dataset.ap;
      $$('[data-ap]', root).forEach((x) => {
        x.classList.toggle('is-on', x === b);
        x.setAttribute('aria-checked', x === b);
      });
      update();
    })
  );
  $$('[data-meat]', root).forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.meat;
      st.meats = st.meats.includes(id) ? st.meats.filter((x) => x !== id) : [...st.meats, id];
      b.classList.toggle('is-on', st.meats.includes(id));
      b.setAttribute('aria-pressed', st.meats.includes(id));
      update();
    })
  );
  $('#bbAdd', root).addEventListener('click', (e) => {
    if (!result?.lines.length) return;
    addBraaiToCart(result);
    flyToCart(e.currentTarget, u(IMG.braaiTongs, 200));
    toast(`Braai pack for ${st.guests} added · ${weightLabel(result.kg)} of meat`);
  });
  update();
}

/* ---------------- REVIEWS 3D CAROUSEL ---------------- */
function mountReviews(el, rm) {
  const track = $('.rv__track', el);
  const cards = $$('.rcard', track);
  let x = 0;
  let v = -0.6; // auto speed px/frame
  let dragging = false;
  let lastX = 0;
  let raf = 0;
  let third = track.scrollWidth / 3;
  const onResize = () => (third = track.scrollWidth / 3);
  window.addEventListener('resize', onResize);

  const render = () => {
    if (x <= -third * 2) x += third;
    if (x > -third) x -= third;
    track.style.transform = `translate3d(${x}px,0,0)`;
    const cx = innerWidth / 2;
    cards.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = (r.left + r.width / 2 - cx) / innerWidth; // -1..1
      if (Math.abs(d) > 1.2) return;
      c.style.transform = `rotateY(${d * -28}deg) translateZ(${-Math.abs(d) * 160}px)`;
      c.style.opacity = 1 - Math.min(0.55, Math.abs(d) * 0.6);
    });
  };
  x = -third;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!dragging) {
      x += v;
      v += (-0.6 - v) * 0.03;
    }
    render();
  };
  if (rm) {
    track.style.transform = 'none';
    el.style.overflowX = 'auto';
    return () => window.removeEventListener('resize', onResize);
  }
  loop();

  const down = (e) => {
    dragging = true;
    lastX = e.clientX;
    el.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    x += dx;
    v = dx;
  };
  const up = () => (dragging = false);
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') v = -18;
    if (e.key === 'ArrowLeft') v = 18;
  });
  // hover tilt on the card under the pointer
  cards.forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      if (dragging) return;
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      c.firstElementChild.parentElement.style.boxShadow = `${-px * 30}px ${30 - py * 20}px 60px -20px rgba(0,0,0,.9), 0 0 0 1px var(--gold)`;
    });
    c.addEventListener('pointerleave', () => (c.style.boxShadow = ''));
  });
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
  };
}
