/* =====================================================================
   CUT STUDIO · build your cut step by step while the bandsaw cuts it live
   Steps: 1 Meat · 2 Cut · 3 How to cut · 4 Trim & extras · 5 Weight & packing · 6 Review
   ===================================================================== */
import { BRANCHES, IMG, u } from '../config/site.js';
import { PRODUCTS, productById, linePrice, unitPrice } from '../data/products.js';
import { $, $$, ICON, money, esc, img, toast, weightLabel, flyToCart, isTouch } from '../lib/ui.js';
import { addToCart, stockOf, state, saveRequest, currentUser } from '../lib/store.js';
import { scrollTo } from '../lib/motion.js';

const MEATS = [
  { id: 'beef', name: 'Beef', note: 'Steaks, roasts, curry & mince', img: IMG.marbled },
  { id: 'lamb', name: 'Lamb & Mutton', note: 'Chops, legs, curry pieces', img: IMG.lamb },
  { id: 'chicken', name: 'Chicken', note: 'Fillets, thighs & whole birds', img: IMG.chickenBoard },
];
const SKIP = ['beef-mince', 'lamb-mince', 'chicken-mince', 'biltong', 'droewors', 'beef-bacon', 'tikka-strips', 'oxtail'];
const STYLES = [
  { id: 'steaks', name: 'Steaks / chops', note: 'Choose the thickness', icon: 'knife' },
  { id: 'cubed', name: 'Cubed', note: 'Stews, kebabs, biryani', icon: 'box' },
  { id: 'curry', name: 'Curry pieces', note: 'Bone-in, cut on the saw', icon: 'flame' },
  { id: 'strips', name: 'Strips', note: 'Stir-fry, wraps, tikka', icon: 'menu' },
  { id: 'minced', name: 'Minced', note: 'Fine, coarse or double', icon: 'filter' },
  { id: 'whole', name: 'Whole / roast', note: 'Tied and ready for the oven', icon: 'gift' },
];
const MARINADES = [['none', 'No marinade'], ['peri-peri', 'Peri-peri'], ['lemon-herb', 'Lemon & herb'], ['garlic-herb', 'Garlic & herb'], ['tikka', 'Tikka'], ['bbq', 'Sticky BBQ']];
const STEPS = ['Meat', 'Cut', 'How to cut', 'Trim & extras', 'Weight & packing', 'Review'];

const cutsFor = (meat) => PRODUCTS.filter((p) => p.category === meat && p.unit === 'kg' && !SKIP.includes(p.id));

export function render() {
  return `<section class="studio" data-theme="light">
    <div class="wrap">
      <header class="studio__head">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><span>Cut Studio</span></nav>
        <h1 class="h-lg">Cut <span class="it">Studio.</span></h1>
        <p class="lead">Tell us exactly how you want it. Watch our bandsaw cut it to your spec, then add it to your cart or send it straight to the butchers.</p>
      </header>
      <div class="studio__grid">
        <div class="studio__machine">
          <div class="saw" id="saw" aria-label="3D bandsaw preview of your cut">
            <div class="saw__status" aria-live="polite"><i></i><span id="sawStatus">Warming up the bandsaw…</span></div>
            <div class="saw__spec" id="sawSpec"></div>
            <div class="mist" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          </div>
        </div>
        <div class="studio__form">
          <ol class="steps" id="steps">${STEPS.map((s, i) => `<li data-goto-step="${i}"><b>${i + 1}</b><span>${s}</span></li>`).join('')}</ol>
          <div class="step-progress"><span id="stepBar"></span></div>
          <div class="card-box step-card" id="stepCard"></div>
          <div class="step-nav"><button class="btn btn--ghost" id="stepBack">← Back</button><button class="btn" id="stepNext">Next ${ICON.arrow}</button></div>
        </div>
      </div>
    </div>
  </section>`;
}

export function mount(root) {
  const S = { step: 0, meat: 'beef', cut: 'ribeye', style: 'steaks', thickness: 2.5, size: 'medium', mince: 'Fine', trim: 'light', bone: 'Bone-in', skin: 'Skin on', marinade: 'none', weight: 2, pack: 'All in one pack', vacuum: true, notes: '', branch: state.branch };
  let saw = null;
  const sawEl = $('#saw', root);
  import('../components/bandsaw3d.js').then(({ createBandsaw }) => {
    if (!sawEl.isConnected) return;
    saw = createBandsaw(sawEl, { lite: isTouch() || innerWidth < 900, onStage: (t) => { const el = $('#sawStatus', root); if (el) el.textContent = t; } });
    sawEl.addEventListener('saw:error', () => { $('#sawStatus', root).textContent = 'Preview unavailable on this device. Your order still works!'; });
    syncSaw();
  });
  const syncSaw = () => {
    saw?.set({ meat: S.meat, style: S.style, thickness: S.thickness, size: S.size, weight: S.weight, marinade: S.marinade, trim: S.trim });
    const p = productById(S.cut);
    $('#sawSpec', root).innerHTML = p ? `<b>${esc(p.name)}</b><span>${specLine()}</span><span>${weightLabel(S.weight)} · ${money(price())}</span>` : '';
  };
  const price = () => linePrice(productById(S.cut), S.weight);
  const styleName = () => STYLES.find((s) => s.id === S.style).name;
  function specLine() {
    const bits = [];
    if (S.style === 'steaks') bits.push(`${S.meat === 'lamb' ? 'Chops' : 'Steaks'} ${S.thickness} cm`);
    else if (S.style === 'cubed') bits.push(`Cubed · ${S.size} (${{ small: '1.5', medium: '2.5', large: '4' }[S.size]} cm)`);
    else if (S.style === 'minced') bits.push(`Minced · ${S.mince.toLowerCase()}`);
    else bits.push(styleName());
    if (S.trim !== 'light') bits.push(S.trim === 'none' ? 'fat left on' : 'all fat trimmed');
    if (S.meat === 'chicken') bits.push(S.skin.toLowerCase()); else if (['curry', 'whole'].includes(S.style)) bits.push(S.bone.toLowerCase());
    if (S.marinade !== 'none') bits.push(MARINADES.find((m) => m[0] === S.marinade)[1]);
    return bits.join(' · ');
  }

  const card = $('#stepCard', root);
  const choice = (key, val, label, sub = '', extra = '') => `<button type="button" class="opt-card ${S[key] === val ? 'is-on' : ''}" data-set="${key}" data-val="${esc(String(val))}" aria-pressed="${S[key] === val}">${extra}<b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</button>`;
  const chips = (key, list) => `<div class="chips">${list.map(([v, l]) => `<button type="button" class="chip ${S[key] === v ? 'is-on' : ''}" data-set="${key}" data-val="${esc(v)}" aria-pressed="${S[key] === v}">${l}</button>`).join('')}</div>`;

  const steps = [
    () => `<h2>What are we cutting?</h2><p class="muted">Pick the animal. Everything is NIHT certified halaal.</p>
      <div class="opt-grid opt-grid--3">${MEATS.map((m) => choice('meat', m.id, m.name, m.note, `<span class="photo">${img(m.img, 400, '')}</span>`)).join('')}</div>`,
    () => `<h2>Choose the cut</h2><p class="muted">Prices are per kg. Stock shown for ${BRANCHES.find((b) => b.id === S.branch).name}.</p>
      <div class="opt-grid">${cutsFor(S.meat).map((p) => { const st = stockOf(p.id, S.branch); return choice('cut', p.id, esc(p.name), `${money(unitPrice(p))}/kg${st === 'out' ? ' · sold out' : st === 'low' ? ' · low stock' : ''}`, `<span class="photo">${img(p.img, 300, '')}</span>`).replace('<button', st === 'out' ? '<button disabled' : '<button'); }).join('')}</div>`,
    () => `<h2>How must it be cut?</h2><p class="muted">The bandsaw shows exactly what you’ll get.</p>
      <div class="opt-grid opt-grid--3">${STYLES.map((s) => choice('style', s.id, s.id === 'steaks' && S.meat === 'lamb' ? 'Chops' : s.name, s.note, ICON[s.icon])).join('')}</div>
      ${S.style === 'steaks' ? `<div class="field" style="margin-top:22px"><label for="thick">Thickness: <b id="thickOut">${S.thickness} cm</b></label><input class="range" type="range" id="thick" min="1" max="5" step="0.5" value="${S.thickness}"><div class="done__ticks"><span>1 cm · thin</span><span>2.5 cm · braai</span><span>5 cm · thick</span></div></div>` : ''}
      ${S.style === 'cubed' ? `<span class="label" style="display:block;margin:22px 0 10px">Cube size</span>${chips('size', [['small', 'Small · 1.5 cm'], ['medium', 'Medium · 2.5 cm'], ['large', 'Large · 4 cm']])}` : ''}
      ${S.style === 'minced' ? `<span class="label" style="display:block;margin:22px 0 10px">Mince</span>${chips('mince', [['Fine', 'Fine'], ['Coarse', 'Coarse'], ['Double minced', 'Double minced (kebabs)']])}` : ''}`,
    () => `<h2>Trim &amp; extras</h2>
      <span class="label" style="display:block;margin:6px 0 10px">Fat</span>${chips('trim', [['none', 'Leave the fat on'], ['light', 'Light trim'], ['all', 'Trim all fat']])}
      ${S.meat === 'chicken' ? `<span class="label" style="display:block;margin:22px 0 10px">Skin</span>${chips('skin', [['Skin on', 'Skin on'], ['Skinless', 'Skinless']])}<p class="muted" style="font-size:14px;margin:10px 0 0">All chicken is washed and cleaned before cutting.</p>` : `<span class="label" style="display:block;margin:22px 0 10px">Bone</span>${chips('bone', [['Bone-in', 'Bone-in'], ['Deboned', 'Deboned']])}`}
      <span class="label" style="display:block;margin:22px 0 10px">Marinade (free)</span>${chips('marinade', MARINADES)}`,
    () => `<h2>Weight &amp; packing</h2>
      <div class="field"><label for="wt">Weight: <b id="wtOut">${weightLabel(S.weight)}</b> · <span id="wtPrice">${money(price())}</span></label><input class="range" type="range" id="wt" min="0.5" max="10" step="0.5" value="${S.weight}"></div>
      <span class="label" style="display:block;margin:10px 0 10px">Pack it</span>${chips('pack', [['All in one pack', 'All in one pack'], ['500 g packs', '500 g packs'], ['1 kg packs', '1 kg packs'], ['Per meal portions', 'Per meal portions']])}
      <label class="check" style="margin:20px 0"><input type="checkbox" id="vac" ${S.vacuum ? 'checked' : ''}> Vacuum seal (keeps 2–3× longer in the fridge, freezer-ready)</label>
      <div class="field"><label for="snotes">Notes for the butcher</label><textarea class="textarea" id="snotes" placeholder="e.g. leave the bone for the soup, cut the fat cap in a criss-cross">${esc(S.notes)}</textarea></div>
      <div class="field"><label for="sbranch">Branch</label><select class="select" id="sbranch">${BRANCHES.map((b) => `<option value="${b.id}" ${S.branch === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select></div>`,
    () => { const p = productById(S.cut); return `<h2>Your cut</h2>
      <div class="review"><div class="photo">${img(p.img, 400, p.name)}</div><div><b class="review__name">${esc(p.name)}</b><p>${specLine()}</p><p>${weightLabel(S.weight)} · ${S.pack.toLowerCase()}${S.vacuum ? ' · vacuum sealed' : ''}</p>${S.notes ? `<p class="muted">“${esc(S.notes)}”</p>` : ''}<p class="review__price">${money(price())}</p></div></div>
      <div class="review__actions"><button class="btn" id="studioAdd">Add to cart ${ICON.cart}</button><a class="btn btn--wa" id="studioWa" target="_blank" rel="noopener" href="#">${ICON.whatsapp} Send to the butcher</a><button class="btn btn--ghost" id="studioAgain">Build another cut</button></div>
      <p class="muted" style="font-size:14px;margin:14px 0 0">Your cut is prepared fresh at ${BRANCHES.find((b) => b.id === S.branch).name} and kept at 0–4 °C until collection or delivery.</p>`; },
  ];

  function draw() {
    // keep the chosen cut valid for the chosen meat
    if (!cutsFor(S.meat).some((p) => p.id === S.cut)) S.cut = (cutsFor(S.meat).find((p) => stockOf(p.id, S.branch) !== 'out') || cutsFor(S.meat)[0]).id;
    card.innerHTML = steps[S.step]();
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
    $$('#steps li', root).forEach((li, i) => { li.classList.toggle('is-on', i === S.step); li.classList.toggle('is-done', i < S.step); });
    $('#stepBar', root).style.width = ((S.step + 1) / STEPS.length) * 100 + '%';
    $('#stepBack', root).style.visibility = S.step ? 'visible' : 'hidden';
    $('#stepNext', root).hidden = S.step === STEPS.length - 1;
    $('#stepNext', root).innerHTML = S.step === STEPS.length - 2 ? `Review my cut ${ICON.arrow}` : `Next ${ICON.arrow}`;
    bind();
    syncSaw();
  }
  function bind() {
    $$('[data-set]', card).forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.set;
      S[k] = b.dataset.val;
      if (k === 'meat' && S.meat === 'chicken' && S.style === 'steaks') S.style = 'strips';
      draw();
    }));
    const th = $('#thick', card);
    if (th) { const set = () => { S.thickness = Number(th.value); $('#thickOut', card).textContent = S.thickness + ' cm'; th.style.setProperty('--p', ((S.thickness - 1) / 4) * 100 + '%'); syncSaw(); }; th.addEventListener('input', set); set(); }
    const wt = $('#wt', card);
    if (wt) { const set = () => { S.weight = Number(wt.value); $('#wtOut', card).textContent = weightLabel(S.weight); $('#wtPrice', card).textContent = money(price()); wt.style.setProperty('--p', ((S.weight - 0.5) / 9.5) * 100 + '%'); syncSaw(); }; wt.addEventListener('input', set); set(); }
    $('#vac', card)?.addEventListener('change', (e) => (S.vacuum = e.target.checked));
    $('#snotes', card)?.addEventListener('input', (e) => (S.notes = e.target.value));
    $('#sbranch', card)?.addEventListener('change', (e) => { S.branch = e.target.value; });
    const add = $('#studioAdd', card);
    if (add) {
      const p = productById(S.cut);
      const notes = [S.pack, S.vacuum ? 'vacuum sealed' : '', S.notes].filter(Boolean).join(' · ');
      add.addEventListener('click', (e) => {
        if (!addToCart(p.id, { weight: S.weight, prep: specLine(), notes })) return toast(`${p.name} is sold out at this branch`, 'err');
        flyToCart(e.currentTarget, u(p.img, 200));
        toast(`${p.name} · ${specLine()} added to your cart`);
      });
      const b = BRANCHES.find((x) => x.id === S.branch);
      const u2 = currentUser();
      $('#studioWa', card).href = `https://wa.me/${b.phoneIntl}?text=${encodeURIComponent(`Hi Iqbal's ${b.name}! Cut Studio order:\n${p.name} · ${weightLabel(S.weight)}\n${specLine()}\nPacking: ${notes || S.pack}\nEst. ${money(price())}${u2 ? `\n${u2.name}, ${u2.cell}` : ''}`)}`;
      $('#studioWa', card).addEventListener('click', () => saveRequest({ type: 'studio', name: u2?.name || 'Guest', cell: u2?.cell || '', branch: S.branch, desc: `${p.name} · ${weightLabel(S.weight)} · ${specLine()} · ${notes}` }));
      $('#studioAgain', card).addEventListener('click', () => { S.step = 0; draw(); scrollTo(root.querySelector('.studio__form')); });
    }
  }
  $('#stepNext', root).addEventListener('click', () => { S.step = Math.min(STEPS.length - 1, S.step + 1); draw(); if (innerWidth < 960) scrollTo($('.studio__form', root)); });
  $('#stepBack', root).addEventListener('click', () => { S.step = Math.max(0, S.step - 1); draw(); });
  $$('#steps li', root).forEach((li) => li.addEventListener('click', () => { const i = Number(li.dataset.gotoStep); if (i <= S.step + 1) { S.step = i; draw(); } }));
  draw();
  return () => saw?.destroy();
}
