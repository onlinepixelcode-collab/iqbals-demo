/* CHECKOUT · delivery / collection, date + slot, payment (demo) */
import { BRANCHES, DELIVERY, REWARDS, findZone, u } from '../config/site.js';
import { $, $$, ICON, money, esc, weightLabel, toast, confetti } from '../lib/ui.js';
import { cartLines, cartSubtotal, deliveryFee, currentUser, placeOrder, findOrder, orderStatus, pointsBalance, state } from '../lib/store.js';

const usablePoints = () => Math.min(pointsBalance(), Math.floor((cartSubtotal() * REWARDS.maxShare) / REWARDS.pointValue));
import { processPayment, luhn } from '../lib/payments.js';
import { navigate } from '../router.js';
import { slotsFor } from './legal.js';
import { scrollTo } from '../lib/motion.js';

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};
const branchById = (id) => BRANCHES.find((b) => b.id === id) || BRANCHES[0];
const dow = (iso) => new Date(iso + 'T12:00:00').getDay();
const isOpenDay = (iso, id = state.branch) => !!branchById(id).hours[dow(iso)];
const closedDays = (id) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].filter((d, i) => !branchById(id).hours[i]);

export function render() {
  const lines = cartLines();
  if (!lines.length) return `<section class="success" data-theme="light"><div class="wrap"><h1 class="h-lg">Your cart is empty</h1><p class="lead" style="margin:20px auto 30px">Add a few cuts and come back. The specials board is a good place to start.</p><a class="btn" href="#/shop">Go to the shop ${ICON.arrow}</a></div></section>`;
  const user = currentUser();
  return `
  <section class="page-hero" data-theme="light" style="padding-bottom:40px">
    <div class="wrap"><nav class="crumbs"><a href="#/">Home</a><span>/</span><a href="#/shop">Shop</a><span>/</span><span>Checkout</span></nav>
    <h1 class="h-lg">Checkout</h1>
    ${user ? '' : `<p class="lead" style="margin-top:14px">Have an account? <a class="gold" href="#/login?next=checkout" style="text-decoration:underline">Sign in</a> to save this order to your history.</p>`}</div>
  </section>
  <div class="wrap co">
    <div>
      <div class="co__steps"><span class="is-on" data-stepper="1">1 · Details</span><span data-stepper="2">2 · Payment</span><span data-stepper="3">3 · Done</span></div>
      <form id="coForm" novalidate>
        <div class="card-box">
          <h3>How would you like it?</h3>
          <div class="seg">
            <label><input type="radio" name="method" value="delivery" checked>${ICON.truck}<span><b>Delivery</b><small>Free over ${money(DELIVERY.freeThreshold)}</small></span></label>
            <label><input type="radio" name="method" value="collect">${ICON.shop}<span><b>Collect in store</b><small>Benoni or Lenasia · free</small></span></label>
          </div>
          <div class="form-row">
            <div class="field"><label for="coBranch">Branch</label><select class="select" id="coBranch">${BRANCHES.map((b) => `<option value="${b.id}" ${user?.branch === b.id ? 'selected' : ''}>${b.name} · ${b.suburb}</option>`).join('')}</select></div>
            <div class="field"><label for="coDate">Date</label><input class="input" type="date" id="coDate" min="${tomorrow()}" value="${nextOpen(user?.branch || state.branch)}"><span class="field__err" id="coDateErr"></span></div>
          </div>
          <span class="label" style="display:block;margin-bottom:12px">Time slot</span>
          <div class="slots" id="coSlots" role="radiogroup" aria-label="Time slot"></div>
          <p class="muted co__hours" id="coHours"></p>
        </div>
        <div class="card-box">
          <h3>Your details</h3>
          <div class="form-row">
            <div class="field"><label for="coName">Full name</label><input class="input" id="coName" autocomplete="name" value="${esc(user?.name || '')}" required><span class="field__err"></span></div>
            <div class="field"><label for="coCell">Cell number</label><input class="input" id="coCell" type="tel" autocomplete="tel" placeholder="07x xxx xxxx" value="${esc(user?.cell || '')}" required><span class="field__err"></span></div>
          </div>
          <div class="field"><label for="coEmail">Email</label><input class="input" id="coEmail" type="email" autocomplete="email" value="${esc(user?.email || '')}" required><span class="field__err"></span></div>
          <div class="field" id="addrField"><label for="coAddr">Delivery address</label>
            ${user?.addresses?.length > 1 ? `<select class="select" id="coAddrPick" style="margin-bottom:10px">${user.addresses.map((a) => `<option>${esc(a)}</option>`).join('')}</select>` : ''}
            <input class="input" id="coAddr" autocomplete="street-address" placeholder="Street, suburb" value="${esc(user?.address || '')}"><span class="field__err"></span></div>
          <div class="field"><label for="coNotes">Notes for the butcher</label><textarea class="textarea" id="coNotes" placeholder="Anything we should know? e.g. call on arrival, extra trim on the chops"></textarea></div>
        </div>
        ${usablePoints() > 0 ? `<label class="check card-box rw-use"><input type="checkbox" id="coPts"> <span>Use <b>${usablePoints()} Rewards points</b> for <b>${money(usablePoints() * REWARDS.pointValue)} off</b> this order</span></label>` : ''}
        <button class="btn btn--block magnetic" type="submit">Continue to payment ${ICON.arrow}</button>
      </form>
      <div id="payStep" hidden></div>
    </div>
    <aside class="summary" id="summary"></aside>
  </div>`;
}

function nextOpen(id = state.branch) {
  const d = new Date();
  for (let i = 1; i < 10; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    const iso = x.toISOString().slice(0, 10);
    if (isOpenDay(iso, id)) return iso;
  }
  return tomorrow();
}

function summaryHTML(method, area = '', usePts = false) {
  const lines = cartLines();
  const sub = cartSubtotal();
  const fee = deliveryFee(sub, method, area);
  const pts = usePts ? usablePoints() : 0;
  const disc = pts * REWARDS.pointValue;
  return `<h3>Order summary</h3>
    ${lines.map((l) => `<div class="sline"><span>${l.qty} × ${esc(l.product.name)}<br><small style="color:var(--text-dark-dim)">${[l.product.unit === 'kg' ? weightLabel(l.weight) : '', l.prep].filter(Boolean).join(' · ')}</small></span><b>${money(l.total)}</b></div>`).join('')}
    <div class="sumrow" style="margin-top:14px"><span>Subtotal</span><b>${money(sub)}</b></div>
    <div class="sumrow" style="margin:8px 0 ${disc ? 6 : 14}px"><span>${method === 'collect' ? 'Collection' : 'Delivery'}${method === 'delivery' && findZone(area) ? ' · ' + findZone(area).name : ''}</span><b>${fee ? money(fee) : 'Free'}</b></div>
    ${disc ? `<div class="sumrow" style="margin:0 0 14px;color:#2f7348"><span>Rewards (${pts} pts)</span><b>− ${money(disc)}</b></div>` : ''}
    <div class="sumrow is-total"><span>Total</span><b>${money(sub + fee - disc)}</b></div>
    ${state.session ? `<p class="muted" style="font-size:14px;margin:12px 0 0">You’ll earn <b>${Math.floor((sub - disc) * REWARDS.perRand)} points</b> on this order.</p>` : ''}`;
}

export function mount(root) {
  const form = $('#coForm', root);
  if (!form) return;
  const st = { method: 'delivery', slot: DELIVERY.slots[1] };
  const summary = $('#summary', root);
  const refresh = () => {
    summary.innerHTML = summaryHTML(st.method, $('#coAddr', root)?.value || '', !!$('#coPts', root)?.checked);
    $('#addrField', root).hidden = st.method !== 'delivery';
  };
  refresh();
  $$('[name=method]', root).forEach((r) => r.addEventListener('change', () => { st.method = r.value; refresh(); }));
  const drawSlots = () => {
    const b = branchById($('#coBranch', root).value);
    const date = $('#coDate', root).value;
    const list = date ? slotsFor(b, dow(date)) : [];
    if (!list.includes(st.slot)) st.slot = list[0] || '';
    $('#coSlots', root).innerHTML = list.length ? list.map((s) => `<button type="button" class="chip ${s === st.slot ? 'is-on' : ''}" data-slot="${s}" role="radio" aria-checked="${s === st.slot}">${s}</button>`).join('') : `<span class="muted">Iqbal’s ${b.name} is closed on this day. Please choose another date.</span>`;
    $('#coHours', root).textContent = `${b.name} trading hours: ${b.hoursLabel}`;
    $$('[data-slot]', root).forEach((x) => x.addEventListener('click', () => {
      st.slot = x.dataset.slot;
      $$('[data-slot]', root).forEach((y) => { y.classList.toggle('is-on', y === x); y.setAttribute('aria-checked', y === x); });
    }));
  };
  $('#coDate', root).addEventListener('change', drawSlots);
  $('#coBranch', root).addEventListener('change', () => {
    const d = $('#coDate', root);
    if (!d.value || !isOpenDay(d.value, $('#coBranch', root).value)) d.value = nextOpen($('#coBranch', root).value);
    drawSlots();
  });
  $('#coAddrPick', root)?.addEventListener('change', (e) => { $('#coAddr', root).value = e.target.value; refresh(); });
  $('#coAddr', root)?.addEventListener('change', refresh);
  $('#coPts', root)?.addEventListener('change', refresh);
  const br = $('#coBranch', root); if (br && !currentUser()?.branch) br.value = state.branch;
  if (!isOpenDay($('#coDate', root).value, br.value)) $('#coDate', root).value = nextOpen(br.value);
  drawSlots();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (id) => $('#' + id, root).value.trim();
    const errs = {};
    if (v('coName').length < 2) errs.coName = 'Please enter your name.';
    if (!/^(\+27|0)\d{9}$/.test(v('coCell').replace(/\s/g, ''))) errs.coCell = 'Enter a valid SA cell number, e.g. 078 678 6315.';
    if (!/^\S+@\S+\.\S+$/.test(v('coEmail'))) errs.coEmail = 'Enter a valid email address.';
    if (st.method === 'delivery' && v('coAddr').length < 6) errs.coAddr = 'We need a delivery address.';
    const date = v('coDate');
    $('#coDateErr', root).textContent = '';
    if (!date || date < tomorrow()) errs.coDate = 'Choose a date from tomorrow.';
    else if (!isOpenDay(date, v('coBranch'))) errs.coDate = `Iqbal’s ${branchById(v('coBranch')).name} is closed on ${closedDays(v('coBranch')).join(' and ')}. Please choose another day.`;
    else if (!st.slot) errs.coDate = 'Please choose a time slot.';
    $$('.field', form).forEach((f) => f.classList.remove('is-err'));
    $$('.field__err', form).forEach((f) => (f.textContent = ''));
    Object.entries(errs).forEach(([id, msg]) => {
      const fld = $('#' + id, root).closest('.field');
      fld.classList.add('is-err');
      $('.field__err', fld).textContent = msg;
    });
    if (Object.keys(errs).length) {
      $('#' + Object.keys(errs)[0], root).focus();
      return;
    }
    const details = {
      method: st.method, branch: v('coBranch'), date, slot: st.slot, name: v('coName'), cell: v('coCell'), email: v('coEmail'),
      address: st.method === 'delivery' ? v('coAddr') : '', notes: v('coNotes'),
      pointsUsed: $('#coPts', root)?.checked ? usablePoints() : 0,
    };
    showPayment(root, details);
  });
}

function showPayment(root, details) {
  const sub = cartSubtotal();
  const total = sub + deliveryFee(sub, details.method, details.address) - details.pointsUsed * REWARDS.pointValue;
  $('#coForm', root).hidden = true;
  $$('[data-stepper]', root).forEach((s) => {
    s.classList.toggle('is-on', s.dataset.stepper === '2');
    s.classList.toggle('is-done', s.dataset.stepper === '1');
  });
  const pay = $('#payStep', root);
  pay.hidden = false;
  pay.innerHTML = `
    <div class="test-banner">${ICON.shield.replace('<svg', '<svg style="width:22px;flex:none"')} TEST MODE · this is a demo checkout. No money will be charged.</div>
    <div class="card-box">
      <h3>Payment</h3>
      <div class="pay-opts">
        <label class="pay-opt"><input type="radio" name="pay" value="card" checked>${ICON.card}<span><b>Card</b><small>Secure checkout via PayFast / Yoco</small></span><span class="pay-opt__logos"><span>VISA</span><span>MC</span></span></label>
        <label class="pay-opt"><input type="radio" name="pay" value="eft">${ICON.bank}<span><b>Instant EFT</b><small>Pay straight from your banking app</small></span></label>
        <label class="pay-opt"><input type="radio" name="pay" value="cash">${ICON.cash}<span><b>Cash / card on ${details.method === 'collect' ? 'collection' : 'delivery'}</b><small>Pay when you get your meat</small></span></label>
      </div>
      <div id="payBody"></div>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn--ghost" id="payBack">← Back</button>
      <button class="btn magnetic" id="payGo" style="flex:1">Pay ${money(total)} ${ICON.arrow}</button>
    </div>
    <p class="muted co__legal">By placing this order you accept our <a href="#/terms" target="_blank">Terms &amp; Conditions</a>, <a href="#/shipping" target="_blank">Shipping Policy</a> and <a href="#/returns" target="_blank">Returns &amp; Refund Policy</a>. Your details are handled under our <a href="#/privacy" target="_blank">Privacy Policy</a>.</p>`;
  const body = $('#payBody', pay);
  const banks = ['Capitec', 'FNB', 'Standard Bank', 'Absa', 'Nedbank', 'TymeBank', 'Discovery Bank'];
  const draw = (m) => {
    if (m === 'card')
      body.innerHTML = `<div class="ccard"><div class="ccard__chip"></div><div class="ccard__num" id="ccNum">•••• •••• •••• ••••</div><div class="ccard__row"><span id="ccName">${esc(details.name)}</span><span id="ccExp">MM/YY</span></div></div>
        <div class="field"><label for="cNum">Card number</label><input class="input" id="cNum" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="19"><span class="field__err"></span></div>
        <div class="form-row"><div class="field"><label for="cExp">Expiry</label><input class="input" id="cExp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5"><span class="field__err"></span></div>
        <div class="field"><label for="cCvc">CVC</label><input class="input" id="cCvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4"><span class="field__err"></span></div></div>
        <p class="muted" style="font-size:14px">Demo tip: use the test card 4242 4242 4242 4242, any future date and any CVC.</p>`;
    else if (m === 'eft')
      body.innerHTML = `<span class="label" style="display:block;margin-bottom:12px">Choose your bank</span><div class="chips">${banks.map((b, i) => `<button type="button" class="chip ${i === 0 ? 'is-on' : ''}" data-bank="${b}">${b}</button>`).join('')}</div><p class="muted" style="font-size:15px;margin-top:16px">You’ll approve the payment in your banking app. (Simulated in this demo.)</p>`;
    else body.innerHTML = `<p class="muted">Pay with cash or card when your order is ${details.method === 'collect' ? 'collected' : 'delivered'}. Please have the exact amount ready if paying cash.</p>`;
    $$('[data-bank]', body).forEach((b) => b.addEventListener('click', () => $$('[data-bank]', body).forEach((x) => x.classList.toggle('is-on', x === b))));
    const num = $('#cNum', body);
    if (num) {
      num.addEventListener('input', () => {
        num.value = num.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
        $('#ccNum', body).textContent = (num.value + ' •••• •••• •••• ••••').slice(0, 19);
      });
      const exp = $('#cExp', body);
      exp.addEventListener('input', () => {
        exp.value = exp.value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
        $('#ccExp', body).textContent = exp.value || 'MM/YY';
      });
    }
  };
  draw('card');
  let method = 'card';
  $$('[name=pay]', pay).forEach((r) => r.addEventListener('change', () => { method = r.value; draw(method); }));
  $('#payBack', pay).addEventListener('click', () => {
    pay.hidden = true;
    $('#coForm', root).hidden = false;
    $$('[data-stepper]', root).forEach((s) => { s.classList.toggle('is-on', s.dataset.stepper === '1'); s.classList.remove('is-done'); });
  });
  $('#payGo', pay).addEventListener('click', async (e) => {
    if (method === 'card') {
      const n = $('#cNum', body), x = $('#cExp', body), c = $('#cCvc', body);
      const errs = [];
      const setErr = (el, msg) => { el.closest('.field').classList.toggle('is-err', !!msg); $('.field__err', el.closest('.field')).textContent = msg || ''; if (msg) errs.push(el); };
      setErr(n, luhn(n.value) ? '' : 'That card number doesn’t look right.');
      const [mm, yy] = x.value.split('/').map(Number);
      const now = new Date();
      setErr(x, mm >= 1 && mm <= 12 && yy && new Date(2000 + yy, mm) > now ? '' : 'Enter a valid future expiry date.');
      setErr(c, /^\d{3,4}$/.test(c.value) ? '' : 'Enter the 3 or 4 digit CVC.');
      if (errs.length) return errs[0].focus();
    }
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = `<span class="typing" style="padding:0"><i style="background:var(--ink)"></i><i style="background:var(--ink)"></i><i style="background:var(--ink)"></i></span> Processing…`;
    try {
      const res = await processPayment({ method, amount: total });
      const order = placeOrder({ ...details, payment: method, paymentRef: res.reference, paid: method !== 'cash' });
      navigate(`#/success/${order.id}`);
    } catch (err) {
      toast(err.message, 'err');
      btn.disabled = false;
      btn.innerHTML = `Pay ${money(total)}`;
    }
  });
  scrollTo(0);
}

/* ---------------- SUCCESS ---------------- */
/* "Play while you wait" card · shown while an order is still being prepared */
export function waitGameCard(o) {
  const { steps, idx } = orderStatus(o);
  if (idx >= steps.length - 1) return '';
  const signedIn = !!currentUser();
  return `<a class="waitgame" href="#/game?order=${o.id}" data-cursor="view">
    <span class="waitgame__art" aria-hidden="true"><span class="gt-blade gt-blade--top"></span><span class="gt-steak"></span><span class="gt-blade gt-blade--bot"></span></span>
    <span class="waitgame__body"><small>While we prepare order #${o.id}</small><b>Play Flying Steak</b><span>Flap a ribeye past the knives and cleavers. ${signedIn ? `Earn up to ${REWARDS.gameMax} Rewards points a day.` : 'Sign in to earn Rewards points while you play.'}</span></span>
    <span class="btn waitgame__btn">${ICON.game} Play now</span>
  </a>`;
}

export function renderSuccess(params) {
  const o = findOrder(params.id);
  if (!o) return `<section class="success"><div class="wrap"><h1 class="h-lg">Order not found</h1><a class="btn" href="#/shop" style="margin-top:20px">Back to shop</a></div></section>`;
  const b = BRANCHES.find((x) => x.id === o.branch);
  const { steps, idx } = orderStatus(o);
  return `<section class="success" data-theme="light"><div class="wrap" style="max-width:820px">
    <div class="success__tick">${ICON.check}</div>
    <p class="eyebrow">Thank you, ${esc(o.name.split(' ')[0])}!</p>
    <h1 class="h-lg">Your order is in.</h1>
    <div class="ordno">#${o.id}</div>
    <p class="lead" style="margin:0 auto 10px">${o.method === 'delivery' ? `We’ll deliver to <b>${esc(o.address)}</b>` : `Collect from <b>Iqbal’s ${b.name}</b>, ${b.address}`} on <b>${new Date(o.date + 'T12:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</b>, ${o.slot}.</p>
    <p class="muted">Total ${money(o.total)}${o.pointsEarned ? ` · +${o.pointsEarned} Rewards points` : ''} · ${o.payment === 'cash' ? 'Pay on ' + (o.method === 'collect' ? 'collection' : 'delivery') : `Paid (test ref ${o.paymentRef})`}</p>
    <div class="timeline" style="margin:40px 0">${steps.map((s, i) => `<div class="${i <= idx ? 'is-done' : ''} ${i === idx ? 'is-now' : ''}">${s}</div>`).join('')}</div>
    ${waitGameCard(o)}
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a class="btn" href="#/account">Track my order ${ICON.arrow}</a>
      <a class="btn btn--wa" href="https://wa.me/${b.phoneIntl}?text=${encodeURIComponent(`Hi Iqbal's, about my order #${o.id}`)}" target="_blank" rel="noopener">${ICON.whatsapp} WhatsApp the shop</a>
      <a class="btn btn--ghost" href="#/shop">Keep shopping</a>
    </div></div></section>`;
}
export function mountSuccess() {
  setTimeout(() => confetti(), 300);
}
