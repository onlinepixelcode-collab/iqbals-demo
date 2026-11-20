/* =====================================================================
   SHOP ADMIN (demo) · #/admin
   Edit prices, specials, stock per branch and trading hours; move orders
   through their statuses; read requests (contact, cut-to-order, Qurbani,
   functions). Changes are stored in this browser only. A real back end
   would replace store.js persistence with an API.
   ===================================================================== */
import { BRANCHES } from '../config/site.js';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { $, $$, ICON, money, esc, toast } from '../lib/ui.js';
import { state, setProductOverride, setStock, setHours, resetOverrides, stockOf, orderStatus, setOrderStatus } from '../lib/store.js';

const PIN = '1234'; // demo PIN: change before handing over, or replace with real auth
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const authed = () => { try { return sessionStorage.getItem('iqbals.admin') === '1'; } catch { return false; } };

export function render() {
  if (!authed()) {
    return `<section class="success" data-theme="light"><div class="wrap" style="max-width:460px">
      <div class="success__tick">${ICON.shield}</div><h1 class="h-md">Shop admin</h1>
      <p class="muted">Staff only. Edit prices, specials, stock and trading hours.</p>
      <form id="pinForm" class="card-box" style="text-align:left;margin-top:24px" novalidate>
        <div class="field"><label for="pin">PIN</label><input class="input" id="pin" type="password" inputmode="numeric" autocomplete="off"><span class="field__err"></span></div>
        <button class="btn btn--block" type="submit">Unlock ${ICON.arrow}</button>
        <p class="muted" style="font-size:13px;margin:12px 0 0">Demo PIN: 1234</p>
      </form></div></section>`;
  }
  return `<section class="page-hero" data-theme="light" style="padding-bottom:30px"><div class="wrap">
    <p class="eyebrow">Staff</p><h1 class="h-lg">Shop <span class="it">admin</span></h1>
    <p class="muted" style="margin-top:10px">Changes save instantly and show on the site right away (stored in this browser for the demo).</p></div></section>
    <div class="wrap acct">
      <nav class="acct__nav" aria-label="Admin">
        <button data-atab="products">${ICON.shop}Products &amp; stock</button>
        <button data-atab="hours">${ICON.clock}Trading hours</button>
        <button data-atab="orders">${ICON.box}Orders</button>
        <button data-atab="requests">${ICON.chat}Requests</button>
        <button data-atab="reset">${ICON.trash}Reset demo</button>
        <button id="adminOut">${ICON.arrow}Lock</button>
      </nav>
      <div id="atab"></div>
    </div>`;
}

export function mount(root) {
  const pf = $('#pinForm', root);
  if (pf) {
    pf.addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('#pin', pf).value !== PIN) {
        pf.querySelector('.field').classList.add('is-err');
        $('.field__err', pf).textContent = 'Incorrect PIN.';
        return;
      }
      try { sessionStorage.setItem('iqbals.admin', '1'); } catch { /* ignore */ }
      location.reload();
    });
    return;
  }
  const el = $('#atab', root);
  const tabs = { products, hours, orders, requests, reset };
  const show = (t) => {
    $$('[data-atab]', root).forEach((b) => b.classList.toggle('is-on', b.dataset.atab === t));
    el.innerHTML = tabs[t].html();
    tabs[t].bind?.(el, () => show(t));
  };
  $$('[data-atab]', root).forEach((b) => b.addEventListener('click', () => show(b.dataset.atab)));
  $('#adminOut', root).addEventListener('click', () => { try { sessionStorage.removeItem('iqbals.admin'); } catch { /* ignore */ } location.reload(); });
  show('products');
}

/* ---------------- PRODUCTS & STOCK ---------------- */
const stockSel = (p, b) => `<select class="select adm-stock adm-stock--${stockOf(p.id, b)}" data-stock="${p.id}|${b}">${['in', 'low', 'out'].map((s) => `<option value="${s}" ${stockOf(p.id, b) === s ? 'selected' : ''}>${{ in: 'In stock', low: 'Low', out: 'Sold out' }[s]}</option>`).join('')}</select>`;
const products = {
  html: () => `<div class="adm-bar"><input class="input" id="admQ" placeholder="Search products…"><select class="select" id="admCat"><option value="">All categories</option>${CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
    <div class="adm-table" data-lenis-prevent><table><thead><tr><th>Product</th><th>Price (R)</th><th>Special (R)</th>${BRANCHES.map((b) => `<th>${b.name}</th>`).join('')}</tr></thead><tbody>
    ${PRODUCTS.map((p) => `<tr data-row="${p.id}" data-cat="${p.category}" data-name="${esc(p.name.toLowerCase())}"><td><b>${esc(p.name)}</b><small>${p.unit === 'kg' ? 'per kg' : 'each'}</small></td>
      <td><input class="input adm-num" type="number" min="0" step="1" value="${p.price}" data-price="${p.id}"></td>
      <td><input class="input adm-num" type="number" min="0" step="1" value="${p.special ? p.special.price : ''}" placeholder="none" data-special="${p.id}"></td>
      ${BRANCHES.map((b) => `<td>${stockSel(p, b.id)}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>`,
  bind(el) {
    const filter = () => {
      const q = $('#admQ', el).value.trim().toLowerCase(), c = $('#admCat', el).value;
      $$('[data-row]', el).forEach((r) => (r.hidden = (q && !r.dataset.name.includes(q)) || (c && r.dataset.cat !== c)));
    };
    $('#admQ', el).addEventListener('input', filter);
    $('#admCat', el).addEventListener('change', filter);
    $$('[data-price]', el).forEach((i) => i.addEventListener('change', () => {
      const v = Number(i.value);
      if (!(v > 0)) return toast('Enter a valid price', 'err');
      setProductOverride(i.dataset.price, { price: v });
      toast('Price saved');
    }));
    $$('[data-special]', el).forEach((i) => i.addEventListener('change', () => {
      const v = Number(i.value);
      setProductOverride(i.dataset.special, { special: v > 0 ? v : null });
      toast(v > 0 ? 'Special saved · it’s on the specials board' : 'Special removed');
    }));
    $$('[data-stock]', el).forEach((s) => s.addEventListener('change', () => {
      const [id, b] = s.dataset.stock.split('|');
      setStock(id, b, s.value);
      s.className = `select adm-stock adm-stock--${s.value}`;
      toast('Stock updated');
    }));
  },
};

/* ---------------- TRADING HOURS ---------------- */
const hours = {
  html: () => `<div class="adm-hours">${BRANCHES.map((b) => `<form class="card-box" data-hours="${b.id}"><h3>${b.name}</h3>
      ${[3, 4, 5, 6, 0, 1, 2].map((d) => { const h = b.hours[d]; return `<div class="adm-hrow"><label class="check"><input type="checkbox" data-open="${d}" ${h ? 'checked' : ''}> ${DAYS[d]}</label>
        <input class="input" type="time" data-from="${d}" value="${h ? h[0] : '08:30'}" ${h ? '' : 'disabled'}><span>to</span><input class="input" type="time" data-to="${d}" value="${h ? h[1] : '18:30'}" ${h ? '' : 'disabled'}></div>`; }).join('')}
      <button class="btn btn--sm" type="submit">Save ${b.name} hours</button></form>`).join('')}</div>`,
  bind(el) {
    $$('[data-hours]', el).forEach((f) => {
      $$('[data-open]', f).forEach((c) => c.addEventListener('change', () => { const d = c.dataset.open; $(`[data-from="${d}"]`, f).disabled = $(`[data-to="${d}"]`, f).disabled = !c.checked; }));
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const h = {};
        for (let d = 0; d < 7; d++) h[d] = $(`[data-open="${d}"]`, f).checked ? [$(`[data-from="${d}"]`, f).value, $(`[data-to="${d}"]`, f).value] : null;
        setHours(f.dataset.hours, h);
        toast('Trading hours saved · open/closed status updated');
      });
    });
  },
};

/* ---------------- ORDERS ---------------- */
const orders = {
  html: () => (state.orders.length ? state.orders.map((o) => {
    const { steps, idx } = orderStatus(o);
    return `<article class="order"><div class="order__head"><div><b>#${o.id}</b> <span class="muted">· ${esc(o.name)} · ${esc(o.cell)}</span><div class="muted" style="font-size:14px">${new Date(o.created).toLocaleString('en-ZA')} · ${o.method === 'delivery' ? 'Delivery to ' + esc(o.address) : 'Collect at ' + o.branch} · ${o.date} ${o.slot}</div></div>
      <div style="text-align:right"><b style="font-family:var(--serif);font-size:24px">${money(o.total)}</b><div class="muted" style="font-size:14px">${o.payment === 'cash' ? 'Pay on ' + o.method : 'Paid (test)'}</div></div></div>
      <ul class="adm-lines">${o.lines.map((l) => `<li>${l.qty} × ${esc(l.name)}${l.unit === 'kg' ? ' · ' + l.weight + ' kg' : ''}${l.prep ? ' · ' + esc(l.prep) : ''}${l.notes ? ' · <i>“' + esc(l.notes) + '”</i>' : ''}</li>`).join('')}</ul>
      ${o.notes ? `<p class="muted" style="font-size:15px">Notes: ${esc(o.notes)}</p>` : ''}
      <div class="adm-status">${steps.map((s, i) => `<button class="chip ${i === idx ? 'is-on' : ''}" data-ostatus="${o.id}|${i}">${s}</button>`).join('')}</div></article>`;
  }).join('') : '<div class="empty"><h3>No orders yet</h3><p>Orders placed on this browser appear here.</p></div>'),
  bind(el, redraw) {
    $$('[data-ostatus]', el).forEach((b) => b.addEventListener('click', () => { const [id, i] = b.dataset.ostatus.split('|'); setOrderStatus(id, Number(i)); toast('Order status updated'); redraw(); }));
  },
};

/* ---------------- REQUESTS ---------------- */
const TYPE = { contact: 'Contact message', qurbani: 'Qurbani booking', function: 'Function quote', undefined: 'Cut-to-order' };
const requests = {
  html: () => (state.requests.length ? state.requests.map((r) => `<article class="order"><div class="order__head"><div><span class="label">${TYPE[r.type] || 'Request'}</span><br><b>#${r.id}</b> <span class="muted">· ${esc(r.name || '')} · ${esc(r.cell || '')}</span></div><span class="muted" style="font-size:14px">${new Date(r.created).toLocaleString('en-ZA')}</span></div>
      <p style="margin:0">${esc([r.topic, r.animal && `${r.qty} × ${r.animal} (${r.prep}, ${r.day}, on behalf of ${r.onBehalf}) · ${money(r.total)}`, r.event && `${r.event} · ${r.guests} guests · ${r.menu} · ${r.date} · est. ${money(r.estimate)}`, r.meat && `${r.meat} · ${r.qty || ''}`, r.desc, r.notes].filter(Boolean).join(' · '))}</p></article>`).join('')
    : '<div class="empty"><h3>No requests yet</h3><p>Contact messages, cut-to-order requests, Qurbani bookings and function quotes appear here.</p></div>'),
};

/* ---------------- RESET ---------------- */
const reset = {
  html: () => `<div class="card-box"><h3>Reset demo changes</h3><p class="muted">Put every price, special, stock level and trading hour back to the original values in the code.</p><button class="btn btn--dark" id="admReset">${ICON.trash} Reset prices, stock &amp; hours</button></div>`,
  bind(el) { $('#admReset', el).addEventListener('click', () => { if (confirm('Reset all admin changes?')) { resetOverrides(); toast('Demo data reset'); } }); },
};
