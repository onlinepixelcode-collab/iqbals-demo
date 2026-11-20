/* Product card, quick view and shared add-to-cart behaviour. */
import { u } from '../config/site.js';
import { PRODUCTS, productById, categoryById, unitPrice, linePrice } from '../data/products.js';
import { addToCart, toggleWish, isWished, stockOf, toggleAlert, hasAlert, state } from '../lib/store.js';
import { BRANCHES } from '../config/site.js';

export const branchName = () => BRANCHES.find((b) => b.id === state.branch)?.name || 'Benoni';
export function stockTag(id) {
  const s = stockOf(id);
  return s === 'out' ? '<span class="tag tag--out">Sold out</span>' : s === 'low' ? '<span class="tag tag--low">Low stock</span>' : '';
}
import { $, $$, ICON, money, weightLabel, esc, toast, flyToCart, openModal, closeModal } from '../lib/ui.js';

export const perLabel = (p) => (p.unit === 'kg' ? 'per kg' : p.cut);

export function priceHTML(p) {
  return `<div class="price"><b>${money(unitPrice(p))}</b>${p.special ? `<s>${money(p.price)}</s>` : ''}<small>${perLabel(p)}</small></div>`;
}

export function cardHTML(p) {
  const cat = categoryById(p.category);
  return `<article class="pcard ${stockOf(p.id) === 'out' ? 'is-out' : ''}" data-tilt="5" data-pid="${p.id}">
    <a class="pcard__media" href="#/product/${p.id}" data-cursor="view" aria-label="${esc(p.name)}">
      <div class="photo"><img src="${u(p.img, 640)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="640" height="550"></div>
      <div class="pcard__tags">${stockTag(p.id)}${p.special ? '<span class="tag tag--gingham">Special</span>' : ''}<span class="tag tag--halaal">Halaal</span></div>
    </a>
    <button class="icon-btn pcard__wish ${isWished(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save ${esc(p.name)} to wishlist" aria-pressed="${isWished(p.id)}">${ICON.heart}</button>
    <button class="pcard__qv" data-qv="${p.id}">${ICON.eye} Quick view</button>
    <div class="pcard__body">
      <span class="pcard__cut">${esc(cat?.name || '')} · ${esc(p.cut)}</span>
      <h3><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
      <div class="pcard__foot">${priceHTML(p)}
        ${stockOf(p.id) === 'out'
          ? `<button class="add-btn add-btn--alert ${hasAlert(p.id) ? 'is-on' : ''}" data-alert="${p.id}" aria-label="Notify me when ${esc(p.name)} is back" title="Notify me when it’s back">${ICON.bell}</button>`
          : `<button class="add-btn" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">${ICON.plus}</button>`}</div>
    </div>
  </article>`;
}

/** Default options a quick add uses. */
export function quickAdd(id, fromEl) {
  const p = productById(id);
  if (!p) return;
  if (stockOf(id) === 'out') return toast(`${p.name} is sold out at ${branchName()}. Tap the bell to be notified.`, 'err');
  const weight = p.unit === 'kg' ? (p.weights?.includes(1) ? 1 : p.weights?.[0] || 1) : 1;
  addToCart(id, { weight, prep: p.preps?.[0] || '' });
  flyToCart(fromEl, u(p.img, 200));
  toast(`${p.name}${p.unit === 'kg' ? ` · ${weightLabel(weight)}` : ''} added to cart`);
}

/** Option pickers used by quick view and product page. */
export function optionsHTML(p, sel) {
  return `
    ${p.unit === 'kg' ? `<div class="opt"><span class="label">Weight</span><div class="opt__row" role="radiogroup" aria-label="Weight">
      ${p.weights.map((w) => `<button class="chip ${sel.weight === w ? 'is-on' : ''}" data-weight="${w}" role="radio" aria-checked="${sel.weight === w}">${weightLabel(w)}</button>`).join('')}</div></div>` : ''}
    ${p.preps?.length ? `<div class="opt"><span class="label">Preparation</span><div class="opt__row" role="radiogroup" aria-label="Preparation">
      ${p.preps.map((x) => `<button class="chip ${sel.prep === x ? 'is-on' : ''}" data-prep="${esc(x)}" role="radio" aria-checked="${sel.prep === x}">${esc(x)}</button>`).join('')}</div></div>` : ''}`;
}

export function bindOptions(root, p, sel, onChange) {
  $$('[data-weight]', root).forEach((b) =>
    b.addEventListener('click', () => {
      sel.weight = Number(b.dataset.weight);
      $$('[data-weight]', root).forEach((x) => {
        x.classList.toggle('is-on', x === b);
        x.setAttribute('aria-checked', x === b);
      });
      onChange?.();
    })
  );
  $$('[data-prep]', root).forEach((b) =>
    b.addEventListener('click', () => {
      sel.prep = b.dataset.prep;
      $$('[data-prep]', root).forEach((x) => {
        x.classList.toggle('is-on', x === b);
        x.setAttribute('aria-checked', x === b);
      });
      onChange?.();
    })
  );
}

export function openQuickView(id) {
  const p = productById(id);
  if (!p) return;
  const sel = { weight: p.unit === 'kg' ? (p.weights.includes(1) ? 1 : p.weights[0]) : 1, prep: p.preps?.[0] || '', qty: 1 };
  const total = () => money(linePrice(p, sel.weight) * sel.qty);
  openModal(
    `<div class="qv">
      <div class="photo"><img src="${u(p.img, 900)}" alt="${esc(p.name)}"></div>
      <div>
        <span class="tag tag--halaal">NIHT Halaal</span>
        <h2>${esc(p.name)}</h2>
        <p class="muted">${esc(p.desc)}</p>
        <div class="pd__price" style="margin:14px 0 20px"><b style="font-size:40px">${money(unitPrice(p))}</b>${p.special ? `<s>${money(p.price)}</s>` : ''}<small>${perLabel(p)}</small></div>
        ${optionsHTML(p, sel)}
        <div class="pd__buy" style="margin:20px 0 14px">
          <div class="stepper"><button data-q="-1" aria-label="Decrease">${ICON.minus}</button><output data-qty>1</output><button data-q="1" aria-label="Increase">${ICON.plus}</button></div>
          <div class="total"><small>Total</small><b data-total>${total()}</b></div>
        </div>
        ${stockOf(p.id) === 'out' ? `<button class="btn btn--block btn--dark" data-alert="${p.id}">${ICON.bell} Sold out at ${branchName()} · notify me</button>` : `<button class="btn btn--block" data-qv-add>Add to cart ${ICON.arrow}</button>`}
        <a class="link-btn" style="display:inline-block;margin-top:14px" href="#/product/${p.id}" data-qv-more>See full details, recipes &amp; special instructions →</a>
      </div>
    </div>`,
    {
      wide: true,
      onMount(panel) {
        const upd = () => {
          $('[data-total]', panel).textContent = total();
          $('[data-qty]', panel).textContent = sel.qty;
        };
        bindOptions(panel, p, sel, upd);
        $$('[data-q]', panel).forEach((b) =>
          b.addEventListener('click', () => {
            sel.qty = Math.max(1, sel.qty + Number(b.dataset.q));
            upd();
          })
        );
        $('[data-qv-add]', panel)?.addEventListener('click', (e) => {
          addToCart(p.id, { weight: sel.weight, prep: sel.prep, qty: sel.qty });
          flyToCart(e.currentTarget, u(p.img, 200));
          toast(`${p.name} added to cart`);
          closeModal();
        });
        $('[data-qv-more]', panel).addEventListener('click', closeModal);
      },
    }
  );
}

/** Global delegated handlers for every product card on the page. */
export function initProductEvents() {
  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      quickAdd(add.dataset.add, add);
      return;
    }
    const wish = e.target.closest('[data-wish]');
    if (wish) {
      e.preventDefault();
      const on = toggleWish(wish.dataset.wish);
      $$(`[data-wish="${wish.dataset.wish}"]`).forEach((w) => {
        w.classList.toggle('is-on', on);
        w.setAttribute('aria-pressed', on);
      });
      toast(on ? 'Saved to your wishlist ♥' : 'Removed from wishlist');
      return;
    }
    const al = e.target.closest('[data-alert]');
    if (al) {
      e.preventDefault();
      const on = toggleAlert(al.dataset.alert);
      $$(`[data-alert="${al.dataset.alert}"]`).forEach((x) => x.classList.toggle('is-on', on));
      toast(on ? 'We’ll let you know when it’s back or on special 🔔' : 'Alert removed');
      return;
    }
    const qv = e.target.closest('[data-qv]');
    if (qv) {
      e.preventDefault();
      openQuickView(qv.dataset.qv);
    }
  });
}

export const related = (p, n = 4) =>
  PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category)
    .concat(PRODUCTS.filter((x) => x.category !== p.category && x.tags.includes('popular')))
    .slice(0, n);
