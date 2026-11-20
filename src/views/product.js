/* PRODUCT DETAIL */
import { u } from '../config/site.js';
import { productById, categoryById, unitPrice, linePrice } from '../data/products.js';
import { RECIPES } from '../data/content.js';
import { $, $$, ICON, money, esc, img, toast, flyToCart, weightLabel } from '../lib/ui.js';
import { addToCart, toggleWish, isWished, stockOf, hasAlert } from '../lib/store.js';
import { setupTilt } from '../lib/motion.js';
import { cardHTML, optionsHTML, bindOptions, perLabel, related, branchName } from '../components/product.js';

export function render(params) {
  const p = productById(params.id);
  if (!p) return `<section class="success"><div class="wrap"><h1 class="h-lg">We couldn’t find that cut</h1><p class="lead" style="margin:20px auto">It may have sold out or moved. Have a look at the full counter.</p><a class="btn" href="#/shop">Back to shop</a></div></section>`;
  const cat = categoryById(p.category);
  const gal = [p.img, ...(p.gallery || [])];
  const recipe = RECIPES.find((r) => r.id === p.recipe) || RECIPES.find((r) => r.items.some((i) => i[0] === p.id));
  return `
  <div class="wrap" data-theme="light">
    <div class="pd">
      <div class="pd__gallery">
        <div class="photo pd__main" id="pdMain" data-clip="center"><img src="${u(gal[0], 1200)}" alt="${esc(p.name)}" width="1200" height="1200"></div>
        <div class="pd__thumbs">${gal.map((g, i) => `<button class="${i === 0 ? 'is-on' : ''}" data-img="${g}" aria-label="Show photo ${i + 1}"><div class="photo">${img(g, 200, '')}</div></button>`).join('')}</div>
      </div>
      <div>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/shop?cat=${p.category}">${cat.name}</a><span>/</span><span>${esc(p.name)}</span></nav>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${p.special ? '<span class="tag tag--gingham">Crazy Special</span>' : ''}<span class="tag tag--halaal">${ICON.shield.replace('<svg', '<svg style="width:14px"')} NIHT Halaal</span></div>
        <h1 data-split>${esc(p.name)}</h1>
        <p class="pcard__cut" style="font-size:15px">${esc(p.cut)}</p>
        ${(() => { const st = stockOf(p.id); return `<span class="stock-pill stock-pill--${st}"><i></i>${st === 'out' ? 'Sold out' : st === 'low' ? 'Low stock' : 'In stock'} at ${branchName()}</span>`; })()}
        <div class="pd__price"><b>${money(unitPrice(p))}</b>${p.special ? `<s>${money(p.price)}</s>` : ''}<small>${perLabel(p)}</small></div>
        <p class="lead">${esc(p.desc)}</p>
        <div class="pd__facts">
          <div><b>Best for</b>${esc(p.best)}</div><div><b>Certification</b>NIHT halaal</div><div><b>Freshness</b>Cold room 0–4 °C · cut on the day</div>
        </div>
        <div id="pdOpts"></div>
        <div class="field"><label for="pdNotes">Special instructions for the butcher</label>
          <textarea class="textarea" id="pdNotes" maxlength="200" placeholder="e.g. cut thin, no fat, 2 cm steaks, pack in 500 g portions"></textarea></div>
        <div class="pd__buy">
          <div class="stepper"><button data-q="-1" aria-label="Decrease quantity">${ICON.minus}</button><output id="pdQty">1</output><button data-q="1" aria-label="Increase quantity">${ICON.plus}</button></div>
          <div class="total"><small>Total</small><b id="pdTotal"></b></div>
          <button class="icon-btn ${isWished(p.id) ? 'is-on' : ''}" id="pdWish" aria-label="Save to wishlist" aria-pressed="${isWished(p.id)}" style="border:1.5px solid var(--line)">${ICON.heart}</button>
          ${stockOf(p.id) === 'out' ? `<button class="btn btn--dark ${hasAlert(p.id) ? 'is-on' : ''}" data-alert="${p.id}">${ICON.bell} Notify me when it’s back</button>` : `<button class="btn magnetic" id="pdAdd">Add to cart ${ICON.arrow}</button>`}
        </div>
        ${!p.special && stockOf(p.id) !== 'out' ? `<button class="link-btn alert-link ${hasAlert(p.id) ? 'is-on' : ''}" data-alert="${p.id}" style="margin:-12px 0 26px;display:inline-flex;gap:8px;align-items:center">${ICON.bell.replace('<svg', '<svg style="width:18px"')} Alert me when this goes on special</button>` : ''}
        ${recipe ? `<div class="recipe-tip"><div class="photo">${img(recipe.img, 300, recipe.title)}</div><div><span class="label" style="color:var(--gold-hi)">Recipe idea</span><h4>${recipe.title}</h4><p style="margin:0 0 10px;font-size:16px;color:rgba(243,230,200,.85)">${recipe.blurb}</p><a class="add-mini" href="#/recipes?r=${recipe.id}">See recipe ${ICON.arrow}</a></div></div>` : ''}
      </div>
    </div>
    <section style="padding-bottom:120px">
      <div class="sec-head"><div><p class="eyebrow">You might also like</p><h2 class="h-md">From the same counter</h2></div></div>
      <div class="grid">${related(p).map(cardHTML).join('')}</div>
    </section>
  </div>`;
}

export function mount(root, params) {
  const p = productById(params.id);
  if (!p) return;
  const sel = { weight: p.unit === 'kg' ? (p.weights.includes(1) ? 1 : p.weights[0]) : 1, prep: p.preps?.[0] || '', qty: 1 };
  const opts = $('#pdOpts', root);
  const upd = () => {
    $('#pdTotal', root).textContent = money(linePrice(p, sel.weight) * sel.qty);
    $('#pdQty', root).textContent = sel.qty;
  };
  opts.innerHTML = optionsHTML(p, sel);
  bindOptions(opts, p, sel, upd);
  upd();
  $$('[data-q]', root).forEach((b) => b.addEventListener('click', () => { sel.qty = Math.max(1, sel.qty + Number(b.dataset.q)); upd(); }));
  $$('[data-img]', root).forEach((b) =>
    b.addEventListener('click', () => {
      const im = $('#pdMain img', root);
      im.style.opacity = 0;
      setTimeout(() => { im.src = u(b.dataset.img, 1200); im.style.opacity = 1; }, 200);
      $$('[data-img]', root).forEach((x) => x.classList.toggle('is-on', x === b));
    })
  );
  $('#pdMain img', root).style.transition = 'opacity .3s, transform 1.2s';
  $('#pdAdd', root)?.addEventListener('click', (e) => {
    const notes = $('#pdNotes', root).value.trim();
    addToCart(p.id, { weight: sel.weight, prep: sel.prep, notes, qty: sel.qty });
    flyToCart(e.currentTarget, u(p.img, 200));
    toast(`${p.name}${p.unit === 'kg' ? ' · ' + weightLabel(sel.weight) : ''} × ${sel.qty} added`);
  });
  const w = $('#pdWish', root);
  w.addEventListener('click', () => {
    const on = toggleWish(p.id);
    w.classList.toggle('is-on', on);
    w.setAttribute('aria-pressed', on);
    w.style.color = on ? 'var(--gingham)' : '';
    toast(on ? 'Saved to your wishlist ♥' : 'Removed from wishlist');
  });
  if (isWished(p.id)) w.style.color = 'var(--gingham)';
  setupTilt(root, '.pcard');
  document.title = `${p.name} · Iqbal's Meat & Deli`;
}
