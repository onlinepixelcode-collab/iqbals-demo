/* WEEKLY BOX · RECIPES · COOKING GUIDE · CUT TO ORDER */
import { BRANCHES, DELIVERY, IMG, u } from '../config/site.js';
import { PRODUCTS, productById, linePrice, unitPrice } from '../data/products.js';
import { BOXES, RECIPES, DONENESS } from '../data/content.js';
import { $, $$, ICON, money, esc, img, toast, weightLabel, flyToCart, confetti } from '../lib/ui.js';
import { currentUser, createBox, updateBox, userBoxes, addToCart, saveRequest } from '../lib/store.js';
import { scrollTo, gsap } from '../lib/motion.js';
import { navigate } from '../router.js';

const boxItemsPrice = (items) => items.reduce((s, [id, w]) => { const p = productById(id); return s + (p ? linePrice(p, p.unit === 'kg' ? w : 1) * (p.unit === 'kg' ? 1 : w) : 0); }, 0);
const itemLabel = ([id, w, prep]) => { const p = productById(id); return p ? `${p.unit === 'kg' ? weightLabel(w) : w + ' ×'} ${p.name}${prep ? ' · ' + prep : ''}` : ''; };

/* ---------------- WEEKLY BOX ---------------- */
export function renderBox() {
  return `
  <section class="page-hero" data-theme="light">
    <div class="photo" data-parallax="8">${img(IMG.assortment, 1600, '')}</div>
    <div class="wrap"><nav class="crumbs"><a href="#/">Home</a><span>/</span><span>Weekly Box</span></nav>
      <h1 class="h-xl" data-split>Iqbal’s <span class="it">Weekly Box.</span></h1>
      <p class="lead" style="margin-top:20px">Hand-cut, NIHT halaal meat delivered every week. Pick a ready box or build your own. Pause, skip or cancel from your account any time.</p></div>
  </section>
  <div class="wrap" style="padding-bottom:120px">
    <div class="co__steps" style="margin-bottom:30px"><span class="is-on">1 · Choose a box</span><span>2 · Delivery</span><span>3 · Confirm</span></div>
    <div class="boxes" id="boxes">
      ${BOXES.map((b) => `<button class="boxc" data-pick="${b.id}"><span class="boxc__check">${ICON.check}</span><div class="photo">${img(b.img, 600, b.name)}</div>
        <div class="boxc__body"><h3>${b.name}</h3><span class="muted" style="font-size:15px">${b.feeds}</span><span class="boxc__price">${money(b.price)} <small>/ week</small></span>
        <ul>${b.items.map((i) => `<li>${itemLabel(i)}</li>`).join('')}</ul><span class="muted" style="font-size:13px">Worth ${money(boxItemsPrice(b.items))} at counter prices</span></div></button>`).join('')}
      <button class="boxc" data-pick="custom"><span class="boxc__check">${ICON.check}</span><div class="photo">${img(IMG.butcherScale, 600, 'Custom box')}</div>
        <div class="boxc__body"><h3>Custom Box</h3><span class="muted" style="font-size:15px">You choose every cut</span><span class="boxc__price">5% off <small>counter prices</small></span><ul><li>Any cuts from the shop</li><li>Your preparation choices</li><li>Minimum R400 per week</li></ul></div></button>
    </div>
    <div id="customWrap" hidden style="margin-top:40px"></div>
    <div id="boxForm" style="margin-top:50px"></div>
  </div>`;
}

export function mountBox(root, params, query) {
  const editId = query.get('edit');
  const editing = editId ? userBoxes().find((b) => b.id === editId) : null;
  const st = { type: editing?.type || '', custom: editing?.items ? Object.fromEntries(editing.items.map(([id, w]) => [id, w])) : {} };
  const customWrap = $('#customWrap', root);
  const formWrap = $('#boxForm', root);
  const customItems = () => Object.entries(st.custom).filter(([, q]) => q > 0).map(([id, q]) => [id, q, productById(id).preps?.[0] || '']);
  const customPrice = () => Math.round(boxItemsPrice(customItems()) * 0.95);
  const price = () => (st.type === 'custom' ? customPrice() : BOXES.find((b) => b.id === st.type)?.price || 0);

  const drawCustom = () => {
    const list = PRODUCTS.filter((p) => ['beef', 'lamb', 'chicken', 'wors', 'bakery'].includes(p.category));
    customWrap.innerHTML = `<div class="card-box"><h3>Build your box</h3><p class="muted">Add kilos (or items) of anything you like. Your weekly price updates as you go.</p>
      <div class="custom-list" data-lenis-prevent>${list.map((p) => `<div class="custom-item"><div class="photo">${img(p.img, 120, '')}</div><div><b>${esc(p.name)}</b><br><small class="muted">${money(unitPrice(p))} ${p.unit === 'kg' ? '/ kg' : 'each'}</small></div>
        <div class="stepper"><button data-c="-1" data-id="${p.id}" aria-label="Less ${esc(p.name)}">${ICON.minus}</button><output data-out="${p.id}">${st.custom[p.id] ? (p.unit === 'kg' ? st.custom[p.id] + 'kg' : st.custom[p.id]) : 0}</output><button data-c="1" data-id="${p.id}" aria-label="More ${esc(p.name)}">${ICON.plus}</button></div></div>`).join('')}</div>
      <div class="sumrow is-total" style="margin-top:20px"><span>Weekly price</span><b id="cPrice">${money(customPrice())}</b></div></div>`;
    $$('[data-c]', customWrap).forEach((b) => b.addEventListener('click', () => {
      const p = productById(b.dataset.id);
      const step = p.unit === 'kg' ? 0.5 : 1;
      st.custom[p.id] = Math.max(0, (st.custom[p.id] || 0) + step * Number(b.dataset.c));
      $(`[data-out="${p.id}"]`, customWrap).textContent = st.custom[p.id] ? (p.unit === 'kg' ? st.custom[p.id] + 'kg' : st.custom[p.id]) : 0;
      $('#cPrice', customWrap).textContent = money(customPrice());
      const fp = $('#fPrice', formWrap);
      if (fp) fp.textContent = money(price());
    }));
  };

  const drawForm = () => {
    const user = currentUser();
    if (!st.type) { formWrap.innerHTML = ''; return; }
    if (!user) {
      formWrap.innerHTML = `<div class="card-box center"><h3>Almost there</h3><p class="muted">Sign in or create a free account so you can manage, pause or skip your box later.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn" href="#/register?next=weekly-box">Create account</a><a class="btn btn--ghost" href="#/login?next=weekly-box">Sign in</a></div></div>`;
      return;
    }
    formWrap.innerHTML = `<form class="card-box" id="applyForm" novalidate><h3>${editing ? 'Update your box' : 'Delivery details'}</h3>
      <div class="form-row">
        <div class="field"><label for="bDay">Delivery day</label><select class="select" id="bDay">${DELIVERY.boxDays.map((d) => `<option ${editing?.day === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
        <div class="field"><label for="bArea">Area</label><input class="input" id="bArea" list="areas" placeholder="Start typing your suburb" value="${esc(editing?.area || '')}"><datalist id="areas">${DELIVERY.areas.map((a) => `<option value="${a}">`).join('')}</datalist><span class="field__err" id="areaMsg"></span></div>
      </div>
      <div class="field"><label for="bAddr">Street address</label><input class="input" id="bAddr" value="${esc(editing?.address || user.address || '')}" placeholder="Street and number"><span class="field__err"></span></div>
      <div class="form-row">
        <div class="field"><label for="bBranch">Packed at</label><select class="select" id="bBranch">${BRANCHES.map((b) => `<option value="${b.id}" ${(editing?.branch || user.branch) === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select></div>
        <div class="field"><label for="bPay">Payment</label><select class="select" id="bPay"><option value="card">Card · auto-billed weekly (demo)</option><option value="eft">Instant EFT each week</option><option value="cod">Cash / card on delivery</option></select></div>
      </div>
      <div class="field"><label for="bNotes">Notes for the butcher</label><textarea class="textarea" id="bNotes" placeholder="e.g. no fat on the mince, chops 2 cm thick">${esc(editing?.notes || '')}</textarea></div>
      <label class="check" style="margin-bottom:22px"><input type="checkbox" id="bTerms" ${editing ? 'checked' : ''}> I understand I can pause, skip or cancel any time before 12:00 the day before delivery.</label>
      <div class="sumrow is-total" style="margin-bottom:20px"><span>Weekly total · delivery included</span><b id="fPrice">${money(price())}</b></div>
      <button class="btn btn--block magnetic" type="submit">${editing ? 'Save changes' : 'Apply for weekly delivery'} ${ICON.arrow}</button></form>`;
    const area = $('#bArea', formWrap);
    const checkArea = () => {
      const msg = $('#areaMsg', formWrap);
      const ok = DELIVERY.areas.some((a) => a.toLowerCase() === area.value.trim().toLowerCase());
      msg.className = area.value ? (ok ? 'area-ok' : 'area-bad') : 'field__err';
      msg.textContent = area.value ? (ok ? '✓ Great news, we deliver to your area.' : 'We don’t deliver there yet. Choose a nearby area or collect in store.') : '';
      return ok;
    };
    area.addEventListener('input', checkArea);
    if (area.value) checkArea();
    $('#applyForm', formWrap).addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (id) => $('#' + id, formWrap).value.trim();
      if (st.type === 'custom' && customPrice() < 400) return toast('Custom boxes start at R400 a week. Add a few more cuts.', 'err');
      if (!checkArea()) return area.focus();
      if (v('bAddr').length < 5) return toast('Please add your street address', 'err'), $('#bAddr', formWrap).focus();
      if (!$('#bTerms', formWrap).checked) return toast('Please tick the box to confirm', 'err');
      const base = BOXES.find((b) => b.id === st.type);
      const data = {
        type: st.type, name: st.type === 'custom' ? 'Custom Box' : base.name, price: price(),
        items: st.type === 'custom' ? customItems() : base.items, day: v('bDay'), area: v('bArea'), address: v('bAddr'),
        branch: v('bBranch'), payment: v('bPay'), notes: v('bNotes'),
      };
      const box = editing ? updateBox(editing.id, data) : createBox(data);
      formWrap.innerHTML = `<div class="card-box center" style="padding:60px 30px"><div class="success__tick">${ICON.check}</div>
        <h3 class="h-md">${editing ? 'Box updated' : 'You’re in!'}</h3><div class="ordno">#${box.id}</div>
        <p class="lead" style="margin:0 auto 24px">${esc(box.name)} · ${money(box.price)} every ${box.day}, delivered to ${esc(box.area)}. We’ll WhatsApp you the day before each delivery.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn" href="#/account?tab=boxes">Manage my box</a><a class="btn btn--ghost" href="#/shop">Add extras to this week</a></div></div>`;
      confetti();
      scrollTo(formWrap);
    });
  };

  const pick = (id) => {
    st.type = id;
    $$('[data-pick]', root).forEach((b) => b.classList.toggle('is-on', b.dataset.pick === id));
    customWrap.hidden = id !== 'custom';
    if (id === 'custom') drawCustom();
    drawForm();
    setTimeout(() => scrollTo(id === 'custom' ? customWrap : formWrap), 150);
  };
  $$('[data-pick]', root).forEach((b) => b.addEventListener('click', () => pick(b.dataset.pick)));
  if (st.type) pick(st.type);
}

/* ---------------- RECIPES ---------------- */
export function renderRecipes() {
  return `
  <section class="page-hero" data-theme="light"><div class="photo" data-parallax="8">${img(IMG.biryani, 1600, '')}</div>
    <div class="wrap"><nav class="crumbs"><a href="#/">Home</a><span>/</span><span>Recipes</span></nav>
    <h1 class="h-xl" data-split>From our <span class="it">kitchen.</span></h1>
    <p class="lead" style="margin-top:20px">Family favourites with everything you need from the counter. One tap adds every ingredient to your cart.</p></div></section>
  <div class="wrap" style="padding-bottom:120px"><div class="recipes">
    ${RECIPES.map((r) => `<article class="rcp" id="r-${r.id}" data-reveal>
      <div class="photo">${img(r.img, 800, r.title)}</div>
      <div class="rcp__body">
        <div class="rcp__meta"><span>${ICON.clock.replace('<svg', '<svg style="width:16px;display:inline;vertical-align:-3px"')} ${r.time}</span><span>Serves ${r.serves}</span><span>${r.level}</span></div>
        <h3>${r.title}</h3><p style="margin:0;color:var(--text-dark-dim)">${r.blurb}</p>
        <ul>${r.items.map((i) => { const p = productById(i[0]); return `<li><span>${itemLabel(i)}</span><b>${money(linePrice(p, p.unit === 'kg' ? i[1] : 1) * (p.unit === 'kg' ? 1 : i[1]))}</b></li>`; }).join('')}</ul>
        <details><summary>Method ▾</summary><ol style="margin-top:10px">${r.steps.map((s) => `<li>${s}</li>`).join('')}</ol></details>
        <button class="btn btn--maroon" data-recipe="${r.id}">Add all ingredients · ${money(boxItemsPrice(r.items))} ${ICON.plus}</button>
      </div></article>`).join('')}
  </div></div>`;
}
export function mountRecipes(root, params, query) {
  $$('[data-recipe]', root).forEach((b) => b.addEventListener('click', () => {
    const r = RECIPES.find((x) => x.id === b.dataset.recipe);
    r.items.forEach(([id, w, prep]) => { const p = productById(id); addToCart(id, { weight: p.unit === 'kg' ? w : 1, qty: p.unit === 'kg' ? 1 : w, prep: prep || p.preps?.[0] || '', notes: r.title }); });
    flyToCart(b, u(r.img, 200));
    toast(`Everything for ${r.title} is in your cart`);
  }));
  const target = query.get('r');
  if (target) setTimeout(() => scrollTo('#r-' + target), 700);
}

/* ---------------- COOKING GUIDE ---------------- */
export function renderGuide() {
  return `
  <section class="page-hero" data-theme="light"><div class="photo" data-parallax="8">${img(IMG.braaiTongs, 1600, '')}</div>
    <div class="wrap"><nav class="crumbs"><a href="#/">Home</a><span>/</span><span>Cooking guide</span></nav>
    <h1 class="h-xl" data-split>Cook it <span class="it">right.</span></h1>
    <p class="lead" style="margin-top:20px">Slide from rare to well done to see what’s happening inside your steak, and the core temperature to aim for.</p></div></section>
  <section class="sec" data-theme="light" style="padding-top:40px"><div class="wrap done">
    <div>${steakSVG()}</div>
    <div>
      <p class="eyebrow">Doneness</p>
      <div class="done__out" aria-live="polite"><h3 id="dName">Medium Rare</h3><b id="dTemp">54–57 °C</b><p class="muted" id="dNote" style="margin-top:10px"></p></div>
      <input class="range" type="range" min="0" max="${DONENESS.length - 1}" step="0.01" value="2" id="dRange" aria-label="Steak doneness">
      <div class="done__ticks">${DONENESS.map((d) => `<span>${d.name.replace('Medium ', 'Med ')}</span>`).join('')}</div>
      <table class="temp-table"><thead><tr><th>Doneness</th><th>Core temp</th><th>2.5 cm steak, hot coals</th></tr></thead><tbody>
        ${DONENESS.map((d, i) => `<tr><td>${d.name}</td><td>${d.temp}</td><td>${['1½ min a side', '2 min a side', '3 min a side', '4 min a side', '5 min a side', '6 min a side + rest'][i]}</td></tr>`).join('')}</tbody></table>
      <p class="muted" style="font-size:15px;margin-top:18px">Always rest steak for 5 minutes. Chicken must reach 74 °C in the thickest part; mince and wors 71 °C.</p>
      <a class="btn" href="#/shop?cat=beef" style="margin-top:10px">Shop steaks ${ICON.arrow}</a>
    </div></div></section>
  ${cutRequestSection()}`;
}

function steakSVG() {
  return `<svg class="steak-svg" viewBox="0 0 520 380" role="img" aria-label="Steak cross-section">
    <defs><radialGradient id="dg" cx=".5" cy=".5" r=".55"><stop id="dCore" offset="0" stop-color="#c8394a"/><stop id="dCore2" offset=".55" stop-color="#c8394a"/><stop id="dRing" offset=".82" stop-color="#b0656a"/><stop offset="1" stop-color="#5a2a1c"/></radialGradient>
      <filter id="dn"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 .95 0 0 0 0 .85 0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
    <ellipse cx="260" cy="200" rx="250" ry="168" fill="#3b1a10"/>
    <path d="M30 190 C30 90 140 30 260 30 C390 30 495 95 495 190 C495 290 390 352 260 352 C130 352 30 290 30 190 Z" fill="#efe1c8"/>
    <path d="M48 192 C48 104 150 52 262 52 C380 52 476 108 476 194 C476 282 380 332 262 332 C146 332 48 280 48 192 Z" fill="url(#dg)"/>
    <path d="M48 192 C48 104 150 52 262 52 C380 52 476 108 476 194 C476 282 380 332 262 332 C146 332 48 280 48 192 Z" filter="url(#dn)"/>
    <path d="M150 120 C200 150 210 230 170 280 M330 90 C300 150 340 210 400 230 M230 200 C260 190 300 200 320 240" fill="none" stroke="#f3e2c8" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    <path d="M30 190 C30 90 140 30 260 30 C390 30 495 95 495 190" fill="none" stroke="#2a110a" stroke-width="10" opacity=".55"/>
  </svg>`;
}

const hex = (h) => h.match(/\w\w/g).map((x) => parseInt(x, 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

export function mountGuide(root) {
  const r = $('#dRange', root);
  const upd = () => {
    const v = Number(r.value);
    const i = Math.floor(v);
    const t = v - i;
    const a = DONENESS[i];
    const b = DONENESS[Math.min(DONENESS.length - 1, i + 1)];
    const d = DONENESS[Math.round(v)];
    $('#dCore', root).setAttribute('stop-color', mix(a.core, b.core, t));
    $('#dCore2', root).setAttribute('stop-color', mix(a.core, b.core, t));
    $('#dRing', root).setAttribute('stop-color', mix(a.ring, b.ring, t));
    $('#dCore2', root).setAttribute('offset', (0.55 - v * 0.08).toFixed(2));
    $('#dName', root).textContent = d.name;
    $('#dTemp', root).textContent = d.temp;
    $('#dNote', root).textContent = d.note;
    r.style.setProperty('--p', (v / (DONENESS.length - 1)) * 100 + '%');
  };
  r.addEventListener('input', upd);
  upd();
  mountCutRequest(root);
}

/* ---------------- CUT TO ORDER ---------------- */
function cutRequestSection() {
  return `<section class="sec sec--light paper" data-theme="light" id="cut-request"><div class="wrap" style="max-width:980px">
    <p class="eyebrow">Cut to order</p><h2 class="h-lg" data-split>Can’t see it? <span class="it">We’ll cut it.</span></h2>
    <p class="lead" style="margin:18px 0 36px">Whole lamb for a function, picanha, French-trimmed racks, kebab mince with your own spice… tell the butchers and we’ll confirm price and timing on WhatsApp.</p>
    <form id="cutForm" class="card-box" style="background:#fff;border-color:var(--line-dark)" novalidate>
      <div class="form-row"><div class="field"><label for="crName">Name</label><input class="input" id="crName" value="${esc(currentUser()?.name || '')}"><span class="field__err"></span></div>
      <div class="field"><label for="crCell">Cell / WhatsApp</label><input class="input" id="crCell" type="tel" value="${esc(currentUser()?.cell || '')}"><span class="field__err"></span></div></div>
      <div class="form-row"><div class="field"><label for="crMeat">Meat</label><select class="select" id="crMeat"><option>Beef</option><option>Lamb / Mutton</option><option>Chicken</option><option>Whole lamb / sheep</option><option>Other</option></select></div>
      <div class="field"><label for="crQty">Approximate quantity</label><input class="input" id="crQty" placeholder="e.g. 5 kg, or for 40 people"></div></div>
      <div class="form-row"><div class="field"><label for="crBranch">Branch</label><select class="select" id="crBranch">${BRANCHES.map((b) => `<option value="${b.id}">${b.name}</option>`).join('')}</select></div>
      <div class="field"><label for="crDate">Needed by</label><input class="input" type="date" id="crDate"></div></div>
      <div class="field"><label for="crDesc">What would you like?</label><textarea class="textarea" id="crDesc" placeholder="Describe the cut, thickness, trim, packing…"></textarea><span class="field__err"></span></div>
      <button class="btn btn--maroon btn--block" type="submit">Send request ${ICON.arrow}</button>
    </form></div></section>`;
}
function mountCutRequest(root) {
  const form = $('#cutForm', root);
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (id) => $('#' + id, form).value.trim();
    const errs = {};
    if (v('crName').length < 2) errs.crName = 'Please enter your name.';
    if (!/^(\+27|0)\d{9}$/.test(v('crCell').replace(/\s/g, ''))) errs.crCell = 'Enter a valid SA cell number.';
    if (v('crDesc').length < 8) errs.crDesc = 'Tell us a little more about the cut.';
    $$('.field', form).forEach((f) => { f.classList.remove('is-err'); const er = $('.field__err', f); if (er) er.textContent = ''; });
    Object.entries(errs).forEach(([id, m]) => { const f = $('#' + id, form).closest('.field'); f.classList.add('is-err'); $('.field__err', f).textContent = m; });
    if (Object.keys(errs).length) return $('#' + Object.keys(errs)[0], form).focus();
    const req = saveRequest({ name: v('crName'), cell: v('crCell'), meat: v('crMeat'), qty: v('crQty'), branch: v('crBranch'), date: v('crDate'), desc: v('crDesc') });
    const b = BRANCHES.find((x) => x.id === req.branch);
    const text = `Hi Iqbal's ${b.name}! Cut-to-order request #${req.id}\nName: ${req.name}\nMeat: ${req.meat}\nQty: ${req.qty || '-'}\nNeeded by: ${req.date || '-'}\nDetails: ${req.desc}`;
    form.innerHTML = `<div class="center" style="padding:30px 10px"><div class="success__tick">${ICON.check}</div><h3 class="h-md">Request #${req.id} received</h3>
      <p class="lead" style="margin:14px auto 24px;color:var(--text-dark-dim)">Our butchers will confirm price and timing. For the fastest reply, send it to us on WhatsApp too.</p>
      <a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/${b.phoneIntl}?text=${encodeURIComponent(text)}">${ICON.whatsapp} Send on WhatsApp</a></div>`;
  });
}
export function renderCut() {
  return `<div style="padding-top:var(--header-h)">${cutRequestSection()}</div>`;
}
export function mountCut(root) {
  mountCutRequest(root);
}
