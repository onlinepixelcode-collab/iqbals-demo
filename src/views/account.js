/* AUTH (login / register) + ACCOUNT DASHBOARD */
import { BRANCHES, IMG, u } from '../config/site.js';
import { BOXES } from '../data/content.js';
import { $, $$, ICON, money, esc, img, toast, weightLabel } from '../lib/ui.js';
import { register, login, logout, currentUser, updateUser, userOrders, orderStatus, reorder, userBoxes, updateBox, addToCart, state, pointsBalance, pointsEarnedTotal, tierFor, pointsHistory, myAlerts, toggleAlert, stockOf } from '../lib/store.js';
import { REWARDS } from '../config/site.js';
import { PRODUCTS, productById, unitPrice } from '../data/products.js';
import { cardHTML } from '../components/product.js';
import { setupTilt } from '../lib/motion.js';
import { navigate } from '../router.js';
import { waitGameCard } from './checkout.js';
import { openCart } from '../components/shell.js';

/* ---------------- AUTH ---------------- */
export function renderAuth(params, query) {
  const reg = params.mode === 'register';
  const next = query.get('next') || 'account';
  return `<section class="auth" data-theme="light">
    <div class="auth__art"><div class="photo">${img(reg ? IMG.braaiTongs : IMG.steaksBoard, 1200, '')}</div>
      <blockquote>“${reg ? 'Exceptional customer service… I am definitely a regular and loyal customer.' : 'Everything is fresh. Unbelievable service, all the staff are so friendly.'}”<br><small style="font-family:var(--sans);font-size:15px;font-style:normal;color:#f4ec3c">${reg ? 'Tsholofelo Malatse' : 'Sameera Ansary'} · Google review</small></blockquote>
      <ul class="auth-perks"><li>${ICON.check} Re-order your usual cuts in one tap</li><li>${ICON.check} Track every order from counter to door</li><li>${ICON.check} Members-first sales &amp; Saturday giveaway entry</li><li>${ICON.check} Manage your Weekly Box: pause, skip or edit</li></ul></div>
    <div class="auth__form">
      <form id="authForm" novalidate>
        <div class="auth-tabs" role="tablist"><a href="#/login?next=${next}" class="${reg ? '' : 'is-on'}" role="tab" aria-selected="${!reg}">Sign in</a><a href="#/register?next=${next}" class="${reg ? 'is-on' : ''}" role="tab" aria-selected="${reg}">Register</a></div>
        <p class="eyebrow">My Butcher · ${reg ? 'Join the regulars' : 'Welcome back'}</p>
        <h1>${reg ? 'Create your account' : 'Sign in'}</h1>
        <p class="muted" style="margin-bottom:28px">${reg ? 'Save addresses, track orders and manage your Weekly Box.' : 'Track orders, re-order favourites and manage your Weekly Box.'}</p>
        <div class="form-err" id="authErr" hidden></div>
        ${reg ? `<div class="field"><label for="aName">Full name</label><input class="input" id="aName" autocomplete="name"><span class="field__err"></span></div>` : ''}
        <div class="field"><label for="aEmail">Email</label><input class="input" id="aEmail" type="email" autocomplete="email"><span class="field__err"></span></div>
        ${reg ? `<div class="field"><label for="aCell">Cell number</label><input class="input" id="aCell" type="tel" autocomplete="tel" placeholder="07x xxx xxxx"><span class="field__err"></span></div>` : ''}
        <div class="field"><label for="aPass">Password</label><input class="input" id="aPass" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" ${reg ? 'placeholder="At least 8 characters"' : ''}><span class="field__err"></span></div>
        ${reg ? `<div class="field"><label for="aAddr">Delivery address</label><input class="input" id="aAddr" autocomplete="street-address" placeholder="Street, suburb"><span class="field__err"></span></div>
        <div class="field"><label for="aBranch">Preferred branch</label><select class="select" id="aBranch">${BRANCHES.map((b) => `<option value="${b.id}">${b.name} · ${b.suburb}</option>`).join('')}</select></div>
        <div class="field"><label class="check"><input type="checkbox" id="aTerms"> <span>I am 18 or older and I accept the <a class="gold" href="#/terms" target="_blank">Terms &amp; Conditions</a> and <a class="gold" href="#/privacy" target="_blank">Privacy Policy</a>.</span></label><span class="field__err"></span></div>` : ''}
        <button class="btn btn--block" type="submit" style="margin-top:8px">${reg ? 'Create account' : 'Sign in'} ${ICON.arrow}</button>
        <p class="muted center" style="margin-top:22px">${reg ? `Already have an account? <a class="gold" href="#/login?next=${next}">Sign in</a>` : `New to Iqbal’s? <a class="gold" href="#/register?next=${next}">Create an account</a>`}</p>
        <p class="muted center" style="font-size:13px">Demo accounts are stored only in this browser.</p>
      </form>
    </div></section>`;
}

export function mountAuth(root, params, query) {
  const reg = params.mode === 'register';
  const next = query.get('next') || 'account';
  if (currentUser()) return navigate('#/' + next, { replace: true });
  const form = $('#authForm', root);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = (id) => ($('#' + id, root)?.value || '').trim();
    const errs = {};
    if (reg && v('aName').length < 2) errs.aName = 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(v('aEmail'))) errs.aEmail = 'Enter a valid email address.';
    if (reg && !/^(\+27|0)\d{9}$/.test(v('aCell').replace(/\s/g, ''))) errs.aCell = 'Enter a valid SA cell number.';
    if (reg ? v('aPass').length < 8 : !v('aPass')) errs.aPass = reg ? 'Use at least 8 characters.' : 'Enter your password.';
    if (reg && v('aAddr').length < 6) errs.aAddr = 'Add a delivery address (you can change it later).';
    $$('.field', form).forEach((f) => { f.classList.remove('is-err'); const er = $('.field__err', f); if (er) er.textContent = ''; });
    Object.entries(errs).forEach(([id, msg]) => {
      const f = $('#' + id, root).closest('.field');
      f.classList.add('is-err');
      $('.field__err', f).textContent = msg;
    });
    if (reg && !$('#aTerms', root).checked) { const f = $('#aTerms', root).closest('.field'); f.classList.add('is-err'); $('.field__err', f).textContent = 'Please accept the Terms & Conditions and Privacy Policy.'; errs.aTerms = 1; }
    const err = $('#authErr', root);
    err.hidden = true;
    if (Object.keys(errs).length) return $('#' + Object.keys(errs)[0], root).focus();
    try {
      const user = reg
        ? await register({ name: v('aName'), email: v('aEmail'), cell: v('aCell'), password: v('aPass'), address: v('aAddr'), branch: v('aBranch') })
        : await login(v('aEmail'), v('aPass'));
      toast(reg ? `Welcome to Iqbal’s, ${user.name.split(' ')[0]}!` : `Welcome back, ${user.name.split(' ')[0]}`);
      navigate('#/' + next);
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
  });
}

/* ---------------- DASHBOARD ---------------- */
const TABS = [
  ['overview', 'Overview', ICON.home],
  ['orders', 'Order history', ICON.box],
  ['again', 'Buy again', ICON.cart],
  ['sales', 'Sales & specials', ICON.flame],
  ['rewards', 'Rewards', ICON.gift],
  ['alerts', 'My alerts', ICON.bell],
  ['boxes', 'Weekly Box', ICON.calendar],
  ['profile', 'Profile', ICON.user],
  ['addresses', 'Addresses', ICON.pin],
];

export function renderAccount(params, query) {
  const user = currentUser();
  if (!user) return '';
  return `<section class="page-hero" data-theme="light" style="padding-bottom:40px"><div class="wrap">
    <p class="eyebrow">My Butcher</p><h1 class="h-lg">Welcome back, <span class="it gold">${esc(user.name.split(' ')[0])}</span></h1></div></section>
    <div class="wrap acct">
      <nav class="acct__nav" aria-label="Account">${TABS.map(([k, l, i]) => `<button data-tab="${k}">${i}${l}</button>`).join('')}<button id="logout">${ICON.arrow}Sign out</button></nav>
      <div id="tab"></div>
    </div>`;
}

export function mountAccount(root, params, query) {
  if (!currentUser()) return navigate('#/login?next=account', { replace: true });
  let tab = query.get('tab') || 'overview';
  const el = $('#tab', root);
  const show = (t) => {
    tab = t;
    $$('[data-tab]', root).forEach((b) => b.classList.toggle('is-on', b.dataset.tab === t));
    el.innerHTML = { overview: overviewTab, orders: ordersTab, again: againTab, sales: salesTab, rewards: rewardsTab, alerts: alertsTab, boxes: boxesTab, profile: profileTab, addresses: addressTab }[t]();
    $$('[data-goto]', el).forEach((b) => b.addEventListener('click', () => show(b.dataset.goto)));
    $$('[data-reorder]', el).forEach((b) => b.addEventListener('click', () => { const n = reorder(b.dataset.reorder); toast(`${n} item${n === 1 ? '' : 's'} added to your cart`); openCart(); }));
    $$('[data-again]', el).forEach((b) => b.addEventListener('click', () => { const [id, w, prep] = JSON.parse(b.dataset.again); addToCart(id, { weight: w, prep }); toast(`${productById(id).name} added to your cart`); }));
    $$('[data-again-all]', el).forEach((b) => b.addEventListener('click', () => { const items = buyAgainItems(); items.forEach((i) => addToCart(i.id, { weight: i.weight, prep: i.prep })); toast(`Your usual ${items.length} items are in your cart`); openCart(); }));
    setupTilt(el, '.pcard');
    $$('[data-unalert]', el).forEach((b) => b.addEventListener('click', () => { toggleAlert(b.dataset.unalert); show('alerts'); }));
    bind[t]?.();
  };
  const bind = {
    boxes() {
      $$('[data-box]', el).forEach((b) => b.addEventListener('click', () => {
        const [id, action] = b.dataset.box.split(':');
        const box = userBoxes().find((x) => x.id === id);
        if (action === 'pause') updateBox(id, { status: box.status === 'paused' ? 'active' : 'paused' }), toast(box.status === 'paused' ? 'Box paused. Resume any time.' : 'Box resumed. See you this week!');
        if (action === 'skip') { updateBox(id, { skips: [...box.skips, nextDelivery(box)] }); toast('Next delivery skipped'); }
        if (action === 'cancel' && confirm('Cancel your Weekly Box? You can start a new one any time.')) { updateBox(id, { status: 'cancelled' }); toast('Weekly Box cancelled'); }
        if (action === 'edit') navigate(`#/weekly-box?edit=${id}`);
        show('boxes');
      }));
    },
    profile() {
      $('#pForm', el).addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#pName', el).value.trim();
        const cell = $('#pCell', el).value.trim();
        if (name.length < 2 || !/^(\+27|0)\d{9}$/.test(cell.replace(/\s/g, ''))) return toast('Please check your name and cell number', 'err');
        updateUser({ name, cell, branch: $('#pBranch', el).value });
        toast('Profile saved');
      });
    },
    addresses() {
      $('#aForm', el).addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('#aNew', el).value.trim();
        if (v.length < 6) return toast('Please enter a full address', 'err');
        const u = currentUser();
        updateUser({ addresses: [...u.addresses, v] });
        toast('Address saved');
        show('addresses');
      });
      $$('[data-addr]', el).forEach((b) => b.addEventListener('click', () => {
        const u = currentUser();
        const [act, i] = b.dataset.addr.split(':');
        if (act === 'default') updateUser({ address: u.addresses[i] });
        if (act === 'del') updateUser({ addresses: u.addresses.filter((_, k) => k !== +i) });
        show('addresses');
      }));
    },
  };
  $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  $('#logout', root).addEventListener('click', () => {
    logout();
    toast('Signed out. See you soon!');
    navigate('#/');
  });
  show(tab);
  // live status refresh for the demo timeline
  const t = setInterval(() => tab === 'orders' && show('orders'), 30000);
  return () => clearInterval(t);
}

function ordersTab() {
  const orders = userOrders();
  if (!orders.length) return `<div class="empty"><h3>No orders yet</h3><p>Your orders and their live status will show up here.</p><a class="btn" href="#/shop">Start shopping</a></div>`;
  return `<h2 class="h-md" style="margin-bottom:24px">Order history</h2>` + orders.map((o) => {
    const { steps, idx } = orderStatus(o);
    return `<article class="order">
      <div class="order__head"><div><b>#${o.id}</b><div class="muted" style="font-size:15px">${new Date(o.created).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })} · ${o.method === 'delivery' ? 'Delivery' : 'Collection'} on ${o.date} · ${o.slot}</div></div>
        <div style="text-align:right"><b style="font-family:var(--serif);font-size:26px">${money(o.total)}</b><div class="muted" style="font-size:14px">${o.lines.length} item${o.lines.length === 1 ? '' : 's'}</div></div></div>
      <div class="timeline">${steps.map((s, i) => `<div class="${i <= idx ? 'is-done' : ''} ${i === idx ? 'is-now' : ''}">${s}</div>`).join('')}</div>
      ${waitGameCard(o)}
      <details><summary class="gold" style="cursor:pointer;font-weight:700">View items</summary><ul style="margin:12px 0;padding-left:18px;color:var(--text-dim)">${o.lines.map((l) => `<li>${l.qty} × ${esc(l.name)} ${l.unit === 'kg' ? '· ' + weightLabel(l.weight) : ''} ${l.prep ? '· ' + esc(l.prep) : ''} · ${money(l.total)}</li>`).join('')}</ul></details>
      <button class="btn btn--sm" data-reorder="${o.id}">Re-order ${ICON.arrow}</button>
    </article>`;
  }).join('');
}

const DAYI = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
export function nextDelivery(box) {
  const d = new Date();
  for (let i = 1; i < 30; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    const iso = x.toISOString().slice(0, 10);
    if (x.getDay() === DAYI[box.day] && !box.skips.includes(iso)) return iso;
  }
  return '';
}

function boxesTab() {
  const boxes = userBoxes();
  if (!boxes.length) return `<div class="empty"><h3>No Weekly Box yet</h3><p>Get good meat delivered every week. Pause, skip or cancel any time.</p><a class="btn" href="#/weekly-box">Build my box ${ICON.arrow}</a></div>`;
  return `<h2 class="h-md" style="margin-bottom:24px">Iqbal’s Weekly Box</h2>` + boxes.map((b) => {
    const base = BOXES.find((x) => x.id === b.type);
    const next = b.status === 'active' ? nextDelivery(b) : '';
    return `<article class="subcard">
      <div class="photo">${img(base?.img || IMG.assortment, 300, '')}</div>
      <div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3 style="font-size:28px">${esc(b.name)}</h3><span class="pill ${b.status === 'paused' ? 'pill--paused' : b.status === 'cancelled' ? 'pill--cancelled' : ''}">${b.status}</span></div>
        <p class="muted" style="margin:6px 0">#${b.id} · ${money(b.price)} / week · ${b.day}s to ${esc(b.area)}</p>
        ${next ? `<p style="margin:0">Next delivery: <b class="gold">${new Date(next + 'T12:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</b></p>` : ''}
        ${b.status !== 'cancelled' ? `<div class="subcard__actions">
          <button class="btn btn--sm btn--ghost" data-box="${b.id}:pause">${ICON.pause} ${b.status === 'paused' ? 'Resume' : 'Pause'}</button>
          ${b.status === 'active' ? `<button class="btn btn--sm btn--ghost" data-box="${b.id}:skip">${ICON.skip} Skip next week</button>` : ''}
          <button class="btn btn--sm btn--ghost" data-box="${b.id}:edit">${ICON.edit} Edit</button>
          <button class="btn btn--sm btn--ghost" data-box="${b.id}:cancel">${ICON.trash} Cancel</button></div>` : ''}
      </div></article>`;
  }).join('') + `<a class="btn btn--ghost" href="#/weekly-box" style="margin-top:10px">${ICON.plus} Add another box</a>`;
}

function profileTab() {
  const u = currentUser();
  return `<h2 class="h-md" style="margin-bottom:24px">Profile</h2><form id="pForm" class="card-box" novalidate>
    <div class="form-row"><div class="field"><label for="pName">Full name</label><input class="input" id="pName" value="${esc(u.name)}"></div>
    <div class="field"><label for="pCell">Cell</label><input class="input" id="pCell" value="${esc(u.cell)}"></div></div>
    <div class="field"><label>Email</label><input class="input" value="${esc(u.email)}" disabled></div>
    <div class="field"><label for="pBranch">Preferred branch</label><select class="select" id="pBranch">${BRANCHES.map((b) => `<option value="${b.id}" ${u.branch === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select></div>
    <button class="btn" type="submit">Save changes</button></form>`;
}

function addressTab() {
  const u = currentUser();
  return `<h2 class="h-md" style="margin-bottom:24px">Saved addresses</h2>
    ${u.addresses.map((a, i) => `<div class="order" style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap"><div>${ICON.pin.replace('<svg', '<svg style="width:20px;display:inline;vertical-align:-4px;color:var(--gold)"')} ${esc(a)} ${a === u.address ? '<span class="pill" style="margin-left:8px">Default</span>' : ''}</div>
      <div style="display:flex;gap:8px">${a !== u.address ? `<button class="btn btn--sm btn--ghost" data-addr="default:${i}">Make default</button>` : ''}<button class="btn btn--sm btn--ghost" data-addr="del:${i}">Remove</button></div></div>`).join('') || '<p class="muted">No saved addresses yet.</p>'}
    <form id="aForm" class="card-box" novalidate><div class="field"><label for="aNew">Add an address</label><input class="input" id="aNew" placeholder="Street, suburb, city"></div><button class="btn" type="submit">Save address</button></form>`;
}

/* ---------------- MY BUTCHER · overview, buy again, sales ---------------- */
function buyAgainItems() {
  const seen = new Map();
  userOrders().forEach((o) => o.lines.forEach((l) => {
    const key = l.id + '|' + l.prep;
    const cur = seen.get(key) || { id: l.id, weight: l.weight, prep: l.prep, times: 0, last: o.created };
    cur.times += l.qty;
    seen.set(key, cur);
  }));
  return [...seen.values()].filter((i) => productById(i.id)).sort((a, b) => b.times - a.times);
}

const weekSpend = () => {
  const d = new Date();
  const start = new Date(d);
  start.setDate(d.getDate() - ((d.getDay() + 4) % 7)); // week starts Wednesday (first trading day)
  start.setHours(0, 0, 0, 0);
  return userOrders().filter((o) => o.created >= start.getTime()).reduce((s, o) => s + o.total, 0);
};

function overviewTab() {
  const orders = userOrders();
  const spent = orders.reduce((s, o) => s + o.total, 0);
  const box = userBoxes().find((b) => b.status !== 'cancelled');
  const last = orders[0];
  const specials = PRODUCTS.filter((p) => p.special).slice(0, 3);
  const ws = weekSpend();
  return `<div class="mb-stats">
      <div class="mb-stat"><b>${orders.length}</b><span>Orders placed</span></div>
      <div class="mb-stat"><b>${money(spent)}</b><span>Total spent</span></div>
      <div class="mb-stat"><b>${box ? box.status === 'paused' ? 'Paused' : 'Active' : 'None'}</b><span>Weekly Box</span></div>
      <div class="mb-stat"><b>${pointsBalance()}</b><span>Rewards points · <a href="#/account?tab=rewards" data-goto="rewards" style="color:#9b1515">${tierFor(pointsEarnedTotal()).name}</a></span></div>
    </div>
    ${last ? (() => { const { steps, idx } = orderStatus(last); return `<article class="order"><div class="order__head"><div><span class="label">Latest order</span><br><b>#${last.id}</b> <span class="muted" style="font-size:15px">· ${last.lines.length} items · ${money(last.total)}</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn--sm" data-reorder="${last.id}">Re-order this ${ICON.arrow}</button><button class="btn btn--sm btn--ghost" data-goto="orders">All orders</button></div></div>
      <div class="timeline">${steps.map((s, i) => `<div class="${i <= idx ? 'is-done' : ''} ${i === idx ? 'is-now' : ''}">${s}</div>`).join('')}</div>${waitGameCard(last)}</article>`; })()
      : `<div class="card-box center"><h3>Welcome to My Butcher</h3><p class="muted">Place your first order and you’ll be able to track it, re-order in one tap and see what you buy most.</p><a class="btn" href="#/shop">Start shopping ${ICON.arrow}</a></div>`}
    <div class="card-box mb-giveaway"><div><span class="label">Saturday Giveaway</span><h3 style="margin:6px 0 4px">${ws >= 500 ? 'You’re in this week’s draw! 🎉' : `Spend ${money(500 - ws)} more to enter`}</h3><p class="muted" style="margin:0">Spend R500 in a week (Wed–Tue) to enter the R1,000 braai hamper draw.</p></div>
      <div class="ship-bar" style="height:12px;margin-top:14px"><span style="width:${Math.min(100, (ws / 500) * 100)}%"></span></div></div>
    <div class="sec-head" style="margin:34px 0 18px"><div><span class="label">On sale this week</span><h3 class="h-sm" style="margin-top:6px">Crazy specials for you</h3></div><button class="btn btn--sm btn--ghost" data-goto="sales">See all sales</button></div>
    <div class="grid">${specials.map(cardHTML).join('')}</div>`;
}

function againTab() {
  const items = buyAgainItems();
  if (!items.length) return `<div class="empty"><h3>Nothing to buy again yet</h3><p>Once you’ve ordered, your regular cuts show up here for one-tap re-ordering.</p><a class="btn" href="#/shop">Shop now</a></div>`;
  return `<div class="sec-head" style="margin-bottom:22px"><div><h2 class="h-md">Buy again</h2><p class="muted" style="margin:6px 0 0">Your regular cuts, exactly how you like them.</p></div><button class="btn" data-again-all>Add my usual (${items.length}) ${ICON.cart}</button></div>
    <div class="again">${items.map((i) => { const p = productById(i.id); return `<div class="again__row">
      <a class="photo" href="#/product/${p.id}">${img(p.img, 200, p.name)}</a>
      <div><b>${esc(p.name)}</b><small>${p.unit === 'kg' ? weightLabel(i.weight) : 'each'}${i.prep ? ' · ' + esc(i.prep) : ''} · bought ${i.times}×</small></div>
      <div class="again__price"><b>${money(unitPrice(p))}</b><small>${p.unit === 'kg' ? '/ kg' : 'each'}</small>${p.special ? '<span class="tag tag--gingham">On special</span>' : ''}</div>
      <button class="btn btn--sm" data-again='${JSON.stringify([i.id, i.weight, i.prep]).replace(/'/g, '&#39;')}'>${ICON.plus} Add</button></div>`; }).join('')}</div>`;
}

function salesTab() {
  const sp = PRODUCTS.filter((p) => p.special);
  const saved = sp.reduce((s, p) => s + (p.price - p.special.price), 0);
  return `<div class="sec-head" style="margin-bottom:22px"><div><h2 class="h-md">Sales &amp; specials</h2><p class="muted" style="margin:6px 0 0">${sp.length} crazy specials this week. They end Sunday at 6:30 PM.</p></div><a class="btn btn--ghost btn--sm" href="#/home/specials">View the specials board</a></div>
    <div class="mb-deals">
      <div class="mb-deal">${ICON.flame}<div><b>Up to ${Math.max(...sp.map((p) => Math.round((1 - p.special.price / p.price) * 100)))}% off</b><small>Save ${money(saved)} across this week’s specials</small></div></div>
      <div class="mb-deal">${ICON.truck}<div><b>Free delivery over R750</b><small>Benoni, Boksburg, Lenasia & surrounds</small></div></div>
      <div class="mb-deal">${ICON.box}<div><b>Weekly Box: save 5%</b><small>Custom boxes are 5% off counter prices</small></div></div>
    </div>
    <div class="grid" style="margin-top:26px">${sp.map(cardHTML).join('')}</div>`;
}

function rewardsTab() {
  const bal = pointsBalance(), life = pointsEarnedTotal(), tier = tierFor(life);
  const next = REWARDS.tiers.find((t) => t.min > life);
  const hist = pointsHistory();
  return `<div class="rw-card"><div><span class="label">${tier.name} member</span><h2 class="h-lg" style="margin:6px 0">${bal} points</h2><p style="margin:0">Worth ${money(bal * REWARDS.pointValue)} off. Use them at checkout.</p></div>
      <div>${next ? `<p style="margin:0 0 8px">${next.min - life} points to ${next.name}</p><div class="ship-bar" style="height:12px;width:240px;background:rgba(255,255,255,.2)"><span style="width:${(life / next.min) * 100}%"></span></div>` : '<p style="margin:0">Top tier reached. Shukran! ⭐</p>'}</div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 30px"><a class="btn" href="#/shop">Shop &amp; earn ${ICON.arrow}</a><a class="btn btn--ghost" href="#/game">${ICON.game} Play Braai Master for bonus points</a><a class="btn btn--ghost" href="#/rewards">How it works</a></div>
    <h3 class="h-sm" style="margin-bottom:14px">Points history</h3>
    ${hist.length ? `<div class="again">${hist.map((h) => `<div class="again__row" style="grid-template-columns:1fr auto"><div><b style="font-size:18px">${esc(h.label)}</b><small>${new Date(h.created).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div><b style="color:${h.points > 0 ? '#2f7348' : '#9b1515'}">${h.points > 0 ? '+' : ''}${h.points}</b></div>`).join('')}</div>` : '<p class="muted">No points yet. Your first order earns 1 point per R10.</p>'}`;
}

function alertsTab() {
  const list = myAlerts().map((a) => productById(a.id)).filter(Boolean);
  if (!list.length) return `<div class="empty"><h3>No alerts yet</h3><p>Tap the bell on any sold-out cut, or “Alert me when this goes on special” on a product page, and we’ll flag it here.</p><a class="btn" href="#/shop">Browse the shop</a></div>`;
  const ready = list.filter((p) => p.special || stockOf(p.id) !== 'out');
  return `<h2 class="h-md" style="margin-bottom:8px">My alerts</h2><p class="muted" style="margin:0 0 22px">${ready.length ? `<b style="color:#2f7348">${ready.length} good news:</b> on special or back in stock now.` : 'We’ll let you know the moment these are on special or back in stock.'}</p>
    <div class="again">${list.map((p) => { const st = stockOf(p.id); const good = p.special ? 'On special now!' : st !== 'out' ? 'In stock' : 'Still sold out'; return `<div class="again__row">
      <a class="photo" href="#/product/${p.id}">${img(p.img, 200, p.name)}</a>
      <div><b>${esc(p.name)}</b><small style="color:${p.special ? '#2f7348' : st === 'out' ? '#9b1515' : 'inherit'};font-weight:700">${good}</small></div>
      <div class="again__price"><b>${money(unitPrice(p))}</b><small>${p.unit === 'kg' ? '/ kg' : 'each'}</small></div>
      <div style="display:flex;gap:8px">${st !== 'out' ? `<button class="btn btn--sm" data-add="${p.id}">${ICON.plus} Add</button>` : ''}<button class="btn btn--sm btn--ghost" data-unalert="${p.id}">Remove</button></div></div>`; }).join('')}</div>`;
}
