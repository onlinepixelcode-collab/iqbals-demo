/* =====================================================================
   NEW FEATURES · Eid & Ramadan pre-orders, Functions & catering,
   Delivery checker, Weekly meal planner, Rewards
   ===================================================================== */
import { BRANCHES, DELIVERY, IMG, SEASONAL, REWARDS, findZone, u } from '../config/site.js';
import { PRODUCTS, productById, linePrice, unitPrice } from '../data/products.js';
import { MEALS, WEEKDAYS, QURBANI, QURBANI_PREP, FUNCTION_MENUS, EVENT_TYPES } from '../data/features.js';
import { $, $$, ICON, money, esc, img, toast, weightLabel, flyToCart, confetti, openStatus } from '../lib/ui.js';
import { currentUser, addToCart, saveRequest, state, pointsBalance, pointsEarnedTotal, tierFor, setBranch } from '../lib/store.js';
import { cardHTML } from '../components/product.js';
import { scrollTo, setupTilt } from '../lib/motion.js';

const tel = (b) => b.phone.replace(/\s/g, '');
const pageHero = (crumb, title, lead, photo) => `
  <section class="page-hero" data-theme="light">
    <div class="photo" data-parallax="8">${img(photo, 1600, '')}</div>
    <div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><span>${crumb}</span></nav>
      <h1 class="h-xl" data-split>${title}</h1><p class="lead" style="margin-top:20px">${lead}</p></div>
  </section>`;
const validCell = (v) => /^(\+27|0)\d{9}$/.test(v.replace(/\s/g, ''));
function fieldErrors(form, errs) {
  $$('.field', form).forEach((f) => { f.classList.remove('is-err'); const er = $('.field__err', f); if (er) er.textContent = ''; });
  Object.entries(errs).forEach(([id, m]) => { const f = $('#' + id, form)?.closest('.field'); if (!f) return; f.classList.add('is-err'); const er = $('.field__err', f); if (er) er.textContent = m; });
  const first = Object.keys(errs)[0];
  if (first) $('#' + first, form)?.focus();
  return !first;
}
const contactFields = (p) => {
  const u = currentUser();
  return `<div class="form-row">
    <div class="field"><label for="${p}Name">Name</label><input class="input" id="${p}Name" autocomplete="name" value="${esc(u?.name || '')}"><span class="field__err"></span></div>
    <div class="field"><label for="${p}Cell">Cell / WhatsApp</label><input class="input" id="${p}Cell" type="tel" autocomplete="tel" value="${esc(u?.cell || '')}" placeholder="07x xxx xxxx"><span class="field__err"></span></div></div>`;
};
const thanks = (title, text, waBranch, waText) => `<div class="center" style="padding:30px 10px"><div class="success__tick">${ICON.check}</div><h3 class="h-md">${title}</h3>
  <p class="lead" style="margin:14px auto 24px">${text}</p>
  <a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/${waBranch.phoneIntl}?text=${encodeURIComponent(waText)}">${ICON.whatsapp} Confirm on WhatsApp</a></div>`;

/* =====================================================================
   EID & RAMADAN
   ===================================================================== */
export function renderEid() {
  const eid = new Date(SEASONAL.eidDate + 'T12:00:00');
  const close = new Date(eid.getTime() - 7 * 86400000);
  const packs = PRODUCTS.filter((p) => p.tags.includes('ramadan'));
  return `${pageHero('Eid & Ramadan', 'Eid &amp; <span class="it">Ramadan.</span>', `Book your Qurbani for ${SEASONAL.eidLabel} and stock up on iftaar packs. Done the halaal way, NIHT certified, cut exactly how your family likes it.`, IMG.lamb)}
  <section class="sec" data-theme="light" style="padding-top:20px">
    <div class="wrap">
      <div class="eid-banner">
        <div><span class="label">${ICON.moon.replace('<svg', '<svg style="width:18px;display:inline;vertical-align:-3px"')} ${SEASONAL.eidLabel} ${eid.getFullYear()}</span>
          <h2 class="h-md" style="margin:8px 0">Qurbani bookings are open</h2>
          <p style="margin:0">Expected Eid: <b>${eid.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b> (subject to moon sighting). Bookings close <b>${close.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}</b>.</p></div>
        <div class="countdown" id="eidCd">${['Days', 'Hrs', 'Min'].map((l) => `<div><b data-ecd="${l}">00</b><small>${l}</small></div>`).join('')}</div>
      </div>

      <div class="sec-head" style="margin:60px 0 26px"><div><p class="eyebrow">Step 1</p><h2 class="h-lg" data-split>Choose your <span class="it">Qurbani.</span></h2></div>
        <p class="lead">Price includes the animal, slaughter by our certified team, cleaning and cutting. A deposit secures your booking; the balance is paid on collection.</p></div>
      <div class="boxes">${QURBANI.map((q) => `<button class="boxc" data-q="${q.id}"><span class="boxc__check">${ICON.check}</span><div class="photo">${img(q.img, 600, q.name)}</div>
        <div class="boxc__body"><h3>${q.name}</h3><span class="muted" style="font-size:15px">${q.note}</span><span class="boxc__price">${money(q.price)}</span><span class="muted" style="font-size:14px">Deposit ${money(q.deposit)}</span></div></button>`).join('')}</div>

      <form class="card-box" id="qForm" style="margin-top:34px" novalidate hidden>
        <p class="eyebrow">Step 2</p><h3>Your booking</h3>
        ${contactFields('q')}
        <div class="form-row">
          <div class="field"><label for="qQty">How many?</label><input class="input" id="qQty" type="number" min="1" max="20" value="1"></div>
          <div class="field"><label for="qBranch">Collect from</label><select class="select" id="qBranch">${BRANCHES.map((b) => `<option value="${b.id}" ${state.branch === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="qPrep">How should we cut it?</label><select class="select" id="qPrep">${QURBANI_PREP.map((p) => `<option>${p}</option>`).join('')}</select></div>
          <div class="field"><label for="qDay">Preferred day</label><select class="select" id="qDay"><option>Day 1 of Eid</option><option>Day 2 of Eid</option><option>Day 3 of Eid</option></select></div>
        </div>
        <div class="field"><label for="qNames">Name(s) the Qurbani is on behalf of</label><input class="input" id="qNames" placeholder="e.g. Iqbal family"><span class="field__err"></span></div>
        <div class="sumrow is-total" style="margin:6px 0 18px"><span>Total <small class="muted" id="qBreak"></small></span><b id="qTotal">R 0</b></div>
        <button class="btn btn--block" type="submit">Book Qurbani · pay deposit later ${ICON.arrow}</button>
      </form>

      <div class="sec-head" style="margin:90px 0 26px"><div><p class="eyebrow">Ramadan</p><h2 class="h-lg" data-split>Iftaar <span class="it">packs.</span></h2></div>
        <p class="lead">Freezer-friendly samosas, pies and our famous rotis, ready for sunset every day of the month.</p></div>
      <div class="grid">${packs.map(cardHTML).join('')}</div>
    </div>
  </section>`;
}
export function mountEid(root) {
  const eid = new Date(SEASONAL.eidDate + 'T12:00:00');
  const tick = () => {
    const s = Math.max(0, Math.floor((eid - Date.now()) / 1000));
    const v = { Days: Math.floor(s / 86400), Hrs: Math.floor((s % 86400) / 3600), Min: Math.floor((s % 3600) / 60) };
    Object.entries(v).forEach(([k, n]) => { const el = $(`[data-ecd="${k}"]`, root); if (el) el.textContent = String(n).padStart(2, '0'); });
  };
  tick();
  const t = setInterval(tick, 30000);
  setupTilt(root, '.pcard');
  let pick = null;
  const form = $('#qForm', root);
  const total = () => {
    const q = QURBANI.find((x) => x.id === pick);
    const n = Math.max(1, Number($('#qQty', form).value) || 1);
    $('#qTotal', form).textContent = money(q.price * n);
    $('#qBreak', form).textContent = `(${n} × ${money(q.price)} · deposit ${money(q.deposit * n)})`;
  };
  $$('[data-q]', root).forEach((b) => b.addEventListener('click', () => {
    pick = b.dataset.q;
    $$('[data-q]', root).forEach((x) => x.classList.toggle('is-on', x === b));
    form.hidden = false;
    total();
    setTimeout(() => scrollTo(form), 100);
  }));
  $('#qQty', form).addEventListener('input', total);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (id) => $('#' + id, form).value.trim();
    const errs = {};
    if (v('qName').length < 2) errs.qName = 'Please enter your name.';
    if (!validCell(v('qCell'))) errs.qCell = 'Enter a valid SA cell number.';
    if (v('qNames').length < 2) errs.qNames = 'Who is the Qurbani on behalf of?';
    if (!fieldErrors(form, errs)) return;
    const q = QURBANI.find((x) => x.id === pick);
    const n = Math.max(1, Number(v('qQty')) || 1);
    const req = saveRequest({ type: 'qurbani', name: v('qName'), cell: v('qCell'), branch: v('qBranch'), animal: q.name, qty: n, prep: v('qPrep'), day: v('qDay'), onBehalf: v('qNames'), total: q.price * n, deposit: q.deposit * n, user: state.session });
    const b = BRANCHES.find((x) => x.id === req.branch);
    form.innerHTML = thanks(`Qurbani booked · #${req.id}`, `${n} × ${q.name} on behalf of ${esc(req.onBehalf)}, ${req.prep.toLowerCase()}, collect ${req.day.toLowerCase()} at ${b.name}. Pay the ${money(req.deposit)} deposit in store or by EFT to confirm.`, b,
      `Hi Iqbal's ${b.name}! Qurbani booking #${req.id}: ${n} × ${q.name}, on behalf of ${req.onBehalf}. Cut: ${req.prep}. Collect: ${req.day}. Name: ${req.name}, ${req.cell}. How do I pay the ${money(req.deposit)} deposit?`);
    confetti();
  });
  return () => clearInterval(t);
}

/* =====================================================================
   FUNCTIONS & CATERING
   ===================================================================== */
export function renderFunctions() {
  return `${pageHero('Functions & catering', 'Feeding a <span class="it">crowd?</span>', 'Weddings, walimas, braais for fifty, Jumu’ah lunches. Tell us the numbers and the menu and we’ll calculate the meat, then send you a proper quote.', IMG.braaiGrill)}
  <section class="sec" data-theme="light" style="padding-top:20px">
    <div class="wrap fn">
      <form class="card-box" id="fnForm" novalidate>
        <p class="eyebrow">Quote calculator</p><h2 class="h-md" style="margin-bottom:22px">Your event</h2>
        <div class="form-row">
          <div class="field"><label for="fnType">Event</label><select class="select" id="fnType">${EVENT_TYPES.map((t) => `<option>${t}</option>`).join('')}</select></div>
          <div class="field"><label for="fnDate">Date</label><input class="input" type="date" id="fnDate"><span class="field__err"></span></div>
        </div>
        <div class="field"><label for="fnGuests">Guests: <b id="fnGuestsOut">80</b></label><input class="range" type="range" id="fnGuests" min="20" max="600" step="10" value="80"></div>
        <span class="label" style="display:block;margin:6px 0 12px">Menu</span>
        <div class="fn-menus">${FUNCTION_MENUS.map((m, i) => `<button type="button" class="fn-menu ${i === 0 ? 'is-on' : ''}" data-menu="${m.id}"><div class="photo">${img(m.img, 300, '')}</div><b>${m.name}</b></button>`).join('')}</div>
        <label class="check" style="margin:20px 0"><input type="checkbox" id="fnExtras" checked> Add samosas &amp; rotis for the starters table</label>
        ${contactFields('fn')}
        <div class="field"><label for="fnNotes">Anything else?</label><textarea class="textarea" id="fnNotes" placeholder="Venue, timing, cooking or delivery needs, dietary notes…"></textarea></div>
        <div class="form-row"><div class="field"><label for="fnBranch">Nearest branch</label><select class="select" id="fnBranch">${BRANCHES.map((b) => `<option value="${b.id}" ${state.branch === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select></div></div>
        <button class="btn btn--block" type="submit">Request my quote ${ICON.arrow}</button>
      </form>
      <aside class="braai__tally fn-tally" id="fnTally"></aside>
    </div>
  </section>`;
}
export function mountFunctions(root) {
  const st = { menu: FUNCTION_MENUS[0].id };
  const form = $('#fnForm', root);
  const range = $('#fnGuests', form);
  const d = new Date(); d.setDate(d.getDate() + 14);
  $('#fnDate', form).min = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  $('#fnDate', form).value = d.toISOString().slice(0, 10);
  const calc = () => {
    const g = Number(range.value);
    const m = FUNCTION_MENUS.find((x) => x.id === st.menu);
    const lines = m.mix.map(([id, per]) => { const p = productById(id); const q = p.unit === 'kg' ? Math.ceil(g * per * 2) / 2 : Math.ceil(g * per / (p.id === 'rotis' ? 10 : 1)); return { p, q, cost: p.unit === 'kg' ? unitPrice(p) * q : unitPrice(p) * q }; });
    if ($('#fnExtras', form).checked) {
      [['samosa-platter', Math.ceil(g / 25)], ['roti-bulk', Math.ceil(g / 50)]].forEach(([id, q]) => { const p = productById(id); if (!lines.some((l) => l.p.id === id)) lines.push({ p, q, cost: unitPrice(p) * q }); });
    }
    const total = lines.reduce((s, l) => s + l.cost, 0);
    const disc = g >= 200 ? 0.12 : g >= 100 ? 0.08 : 0.05;
    return { g, m, lines, total, disc, quote: total * (1 - disc) };
  };
  const draw = () => {
    const r = calc();
    $('#fnGuestsOut', form).textContent = r.g;
    range.style.setProperty('--p', ((r.g - 20) / 580) * 100 + '%');
    $('#fnTally', root).innerHTML = `<p class="eyebrow" style="margin-top:12px">Estimate</p><h3>${r.g} guests · ${r.m.name}</h3>
      <ul class="tally">${r.lines.map((l) => `<li><span>${l.p.name}</span><b>${l.p.unit === 'kg' ? weightLabel(l.q) : l.q + ' ×'}</b><span>${money(l.cost)}</span></li>`).join('')}</ul>
      <div class="sumrow"><span>Counter price</span><s>${money(r.total)}</s></div>
      <div class="sumrow" style="margin:6px 0"><span>Function discount (${Math.round(r.disc * 100)}%)</span><span>− ${money(r.total * r.disc)}</span></div>
      <div class="tally__total"><span>Estimated quote</span><b>${money(Math.round(r.quote))}</b></div>
      <p class="muted" style="font-size:14px;margin:0">About ${money(Math.round(r.quote / r.g))} per guest. Final quote confirmed by our butchers within one working day.</p>`;
  };
  range.addEventListener('input', draw);
  $('#fnExtras', form).addEventListener('change', draw);
  $$('[data-menu]', form).forEach((b) => b.addEventListener('click', () => { st.menu = b.dataset.menu; $$('[data-menu]', form).forEach((x) => x.classList.toggle('is-on', x === b)); draw(); }));
  draw();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (id) => $('#' + id, form).value.trim();
    const errs = {};
    if (v('fnName').length < 2) errs.fnName = 'Please enter your name.';
    if (!validCell(v('fnCell'))) errs.fnCell = 'Enter a valid SA cell number.';
    if (!v('fnDate')) errs.fnDate = 'Choose your event date.';
    if (!fieldErrors(form, errs)) return;
    const r = calc();
    const req = saveRequest({ type: 'function', name: v('fnName'), cell: v('fnCell'), branch: v('fnBranch'), event: v('fnType'), date: v('fnDate'), guests: r.g, menu: r.m.name, estimate: Math.round(r.quote), notes: v('fnNotes'), user: state.session });
    const b = BRANCHES.find((x) => x.id === req.branch);
    form.innerHTML = thanks(`Quote request #${req.id} sent`, `${esc(req.event)} for ${r.g} guests on ${req.date}. Estimated ${money(req.estimate)}. Our butchers will confirm the final quote within one working day.`, b,
      `Hi Iqbal's ${b.name}! Function quote #${req.id}: ${req.event}, ${r.g} guests, ${r.m.name} menu, on ${req.date}. Estimate ${money(req.estimate)}. Name: ${req.name}, ${req.cell}. ${req.notes}`);
  });
}

/* =====================================================================
   DELIVERY AREA & FEE CHECKER
   ===================================================================== */
function nextSlots(branch) {
  const out = [];
  const now = new Date();
  for (let i = 1; i < 10 && out.length < 3; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    if (branch.hours[d.getDay()]) out.push(d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' }));
  }
  return out;
}
export function renderDelivery() {
  return `${pageHero('Delivery', 'Do we deliver <span class="it">to you?</span>', `Type your suburb to see the delivery fee, which branch packs your order and the next available days. Free delivery over ${money(DELIVERY.freeThreshold)}.`, IMG.counter)}
  <section class="sec" data-theme="light" style="padding-top:20px">
    <div class="wrap dl">
      <div>
        <form class="card-box" id="dlForm" novalidate>
          <label class="label" for="dlArea">Your suburb</label>
          <div class="dl-search"><input class="input" id="dlArea" list="dlAreas" placeholder="e.g. Boksburg, Lenasia South…" autocomplete="off"><button class="btn" type="submit">Check ${ICON.arrow}</button></div>
          <datalist id="dlAreas">${DELIVERY.areas.map((a) => `<option value="${a}">`).join('')}</datalist>
          <div id="dlResult" aria-live="polite"></div>
        </form>
        <div class="card-box"><h3>Delivery areas &amp; fees</h3>
          <div class="dl-zones">${BRANCHES.map((b) => `<div><span class="label">Packed at ${b.name}</span><ul>${DELIVERY.zones.filter((z) => z.branch === b.id).map((z) => `<li><button type="button" data-zone="${z.name}">${z.name}</button><b>${money(z.fee)}</b></li>`).join('')}</ul></div>`).join('')}</div>
          <p class="muted" style="font-size:14px;margin:12px 0 0">Not listed? Collect free from either branch, or WhatsApp us and we’ll see what we can do.</p></div>
      </div>
      <div class="dl-map card-box" id="dlMap"><iframe title="Delivery area map" loading="lazy" src="https://www.google.com/maps?q=Benoni%20and%20Lenasia%2C%20Gauteng&output=embed"></iframe></div>
    </div>
  </section>`;
}
export function mountDelivery(root) {
  const form = $('#dlForm', root);
  const input = $('#dlArea', form);
  const check = () => {
    const z = findZone(input.value);
    const out = $('#dlResult', form);
    if (!input.value.trim()) { out.innerHTML = ''; return; }
    if (!z) {
      out.innerHTML = `<div class="dl-res dl-res--no"><b>We don’t deliver to “${esc(input.value)}” yet.</b><p>You can collect free from either branch, or ask us on WhatsApp.</p><a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="https://wa.me/${BRANCHES[0].phoneIntl}?text=${encodeURIComponent('Hi Iqbal’s! Do you deliver to ' + input.value + '?')}">${ICON.whatsapp} Ask on WhatsApp</a></div>`;
      return;
    }
    const b = BRANCHES.find((x) => x.id === z.branch);
    const days = nextSlots(b);
    out.innerHTML = `<div class="dl-res"><b>✓ Yes, we deliver to ${z.name}!</b>
      <div class="dl-facts"><div><small>Delivery fee</small>${money(z.fee)}<em>Free over ${money(DELIVERY.freeThreshold)}</em></div><div><small>Packed at</small>Iqbal’s ${b.name}<em>${openStatus(b).label}</em></div><div><small>Next delivery days</small>${days.slice(0, 2).join('<br>')}</div></div>
      <a class="btn btn--sm" href="#/shop" data-set-branch="${b.id}">Shop from ${b.name} ${ICON.arrow}</a></div>`;
    $('[data-set-branch]', out).addEventListener('click', () => setBranch(b.id));
    $('#dlMap', root).innerHTML = `<iframe title="Map of ${esc(z.name)}" loading="lazy" src="https://www.google.com/maps?q=${encodeURIComponent(z.name + ', Gauteng, South Africa')}&output=embed"></iframe>`;
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); check(); });
  input.addEventListener('change', check);
  $$('[data-zone]', root).forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.zone; check(); scrollTo(form); }));
  const u = currentUser();
  if (u?.address && findZone(u.address)) { input.value = findZone(u.address).name; check(); }
}

/* =====================================================================
   WEEKLY MEAL PLANNER
   ===================================================================== */
export function renderPlanner() {
  return `${pageHero('Meal planner', 'Plan the <span class="it">week.</span>', 'Pick a dinner for each night and how many you’re feeding. We’ll build one shopping list from the counter, with the right kilos and preparation.', IMG.assortment)}
  <section class="sec" data-theme="light" style="padding-top:20px">
    <div class="wrap mp">
      <div>
        <div class="card-box mp-people"><span class="label">Feeding</span><div class="stepper"><button data-ppl="-1" aria-label="Fewer people">${ICON.minus}</button><output id="mpPpl">4</output><button data-ppl="1" aria-label="More people">${ICON.plus}</button></div><span class="muted">people</span>
          <button class="btn btn--ghost btn--sm" id="mpAuto" style="margin-left:auto">Surprise me</button></div>
        <div class="mp-days">${WEEKDAYS.map((d, i) => `<div class="mp-day"><b>${d}</b><select class="select" data-day="${i}" aria-label="Dinner on ${d}"><option value="">No dinner planned</option>${MEALS.map((m) => `<option value="${m.id}">${m.name}</option>`).join('')}</select></div>`).join('')}</div>
      </div>
      <aside class="braai__tally" id="mpList"></aside>
    </div>
  </section>`;
}
export function mountPlanner(root) {
  const KEY = 'iqbals.plan';
  let plan = { ppl: 4, days: ['mince-curry', 'peri-chicken', 'mutton-curry', 'steak-night', 'biryani', '', ''] };
  try { plan = { ...plan, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { /* ignore */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch { /* ignore */ } };
  const build = () => {
    const map = new Map();
    plan.days.forEach((id) => {
      const m = MEALS.find((x) => x.id === id);
      if (!m) return;
      m.per.forEach(([pid, per, prep]) => {
        const p = productById(pid);
        const key = pid + '|' + (prep || '');
        const cur = map.get(key) || { p, prep: prep || p.preps?.[0] || '', amt: 0 };
        cur.amt += per * plan.ppl;
        map.set(key, cur);
      });
    });
    return [...map.values()].map((l) => {
      const qty = l.p.unit === 'kg' ? Math.max(0.5, Math.ceil(l.amt * 2) / 2) : Math.max(1, Math.ceil(l.amt));
      return { ...l, qty, cost: l.p.unit === 'kg' ? unitPrice(l.p) * qty : unitPrice(l.p) * qty };
    });
  };
  const draw = () => {
    $('#mpPpl', root).textContent = plan.ppl;
    $$('[data-day]', root).forEach((s) => (s.value = plan.days[s.dataset.day] || ''));
    const lines = build();
    const total = lines.reduce((s, l) => s + l.cost, 0);
    const n = plan.days.filter(Boolean).length;
    $('#mpList', root).innerHTML = `<p class="eyebrow" style="margin-top:12px">Shopping list</p><h3>${n} dinner${n === 1 ? '' : 's'} for ${plan.ppl}</h3>
      ${lines.length ? `<ul class="tally">${lines.map((l) => `<li><span>${l.p.name}${l.prep ? `<br><small class="muted">${esc(l.prep)}</small>` : ''}</span><b>${l.p.unit === 'kg' ? weightLabel(l.qty) : l.qty + ' ×'}</b><span>${money(l.cost)}</span></li>`).join('')}</ul>
      <div class="tally__total"><span>Week total</span><b>${money(total)}</b></div><p class="muted" style="font-size:14px;margin-top:-10px">About ${money(Math.round(total / Math.max(1, n * plan.ppl)))} per plate.</p>
      <button class="btn btn--block" id="mpAdd">Add all to cart ${ICON.cart}</button>` : '<p class="tally__empty">Pick a dinner for at least one night.</p>'}`;
    $('#mpAdd', root)?.addEventListener('click', (e) => {
      let skipped = 0;
      lines.forEach((l) => { const ok = addToCart(l.p.id, { weight: l.p.unit === 'kg' ? l.qty : 1, qty: l.p.unit === 'kg' ? 1 : l.qty, prep: l.prep, notes: 'Meal planner' }); if (!ok) skipped++; });
      flyToCart(e.currentTarget, u(IMG.assortment, 200));
      toast(skipped ? `Added your week’s shop (${skipped} item${skipped > 1 ? 's' : ''} sold out at this branch)` : 'Your whole week’s shop is in the cart');
    });
    persist();
  };
  $$('[data-day]', root).forEach((s) => s.addEventListener('change', () => { plan.days[s.dataset.day] = s.value; draw(); }));
  $$('[data-ppl]', root).forEach((b) => b.addEventListener('click', () => { plan.ppl = Math.min(20, Math.max(1, plan.ppl + Number(b.dataset.ppl))); draw(); }));
  $('#mpAuto', root).addEventListener('click', () => { const pool = [...MEALS].sort(() => Math.random() - 0.5); plan.days = WEEKDAYS.map((_, i) => (i < 5 ? pool[i].id : '')); draw(); });
  draw();
}

/* =====================================================================
   REWARDS (public info page; balance shows when signed in)
   ===================================================================== */
export function renderRewards() {
  const user = currentUser();
  const life = pointsEarnedTotal();
  const tier = tierFor(life);
  return `${pageHero('Rewards', 'Iqbal’s <span class="it">Rewards.</span>', `Earn 1 point for every R10 you spend online. 100 points = R10 off. Points never expire while you shop with us at least once a year.`, IMG.braaiTongs)}
  <section class="sec" data-theme="light" style="padding-top:20px">
    <div class="wrap">
      ${user ? `<div class="rw-card"><div><span class="label">${tier.name} member</span><h2 class="h-lg" style="margin:6px 0">${pointsBalance()} points</h2><p style="margin:0">Worth ${money(pointsBalance() * REWARDS.pointValue)} off your next order · ${life} earned so far</p></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#/shop">Shop &amp; earn ${ICON.arrow}</a><a class="btn btn--ghost" href="#/account?tab=rewards">Points history</a></div></div>`
        : `<div class="rw-card"><div><h2 class="h-md" style="margin:0 0 6px">Start earning today</h2><p style="margin:0">Create a free My Butcher account and every order earns points automatically.</p></div><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#/register?next=rewards">Join free ${ICON.arrow}</a><a class="btn btn--ghost" href="#/login?next=rewards">Sign in</a></div></div>`}
      <div class="rw-steps">
        <div class="card-box">${ICON.cart}<h3>Shop</h3><p>Earn 1 point per R10 on every online order, delivered or collected.</p></div>
        <div class="card-box">${ICON.game}<h3>Play</h3><p>Score big in Braai Master and earn up to ${REWARDS.gameMax} bonus points.</p></div>
        <div class="card-box">${ICON.gift}<h3>Save</h3><p>Use points at checkout: 100 points = R10 off, up to half of any order.</p></div>
      </div>
      <div class="sec-head" style="margin:60px 0 24px"><div><p class="eyebrow">Tiers</p><h2 class="h-md">The more you braai, the more you earn</h2></div></div>
      <div class="rw-tiers">${REWARDS.tiers.map((t, i) => `<div class="rw-tier ${t.name === tier.name && user ? 'is-on' : ''}"><b>${t.name}</b><span>${t.min.toLocaleString('en-ZA')}+ lifetime points</span><p>${['Points on every order · Saturday giveaway entries', 'Early access to crazy specials · birthday braai voucher', 'Free delivery on every order · first pick of Qurbani slots'][i]}</p></div>`).join('')}</div>
    </div>
  </section>`;
}
