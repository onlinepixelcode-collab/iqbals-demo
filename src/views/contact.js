/* CONTACT · both branches, live open status, maps, contact form → WhatsApp */
import { BRANCHES, BUSINESS, IMG } from '../config/site.js';
import { $, $$, ICON, esc, img } from '../lib/ui.js';
import { currentUser, saveRequest } from '../lib/store.js';
import { branchCard } from './home.js';

const TOPICS = ['Place or change an order', 'Weekly Box', 'Cut-to-order request', 'Function / bulk order', 'Delivery question', 'Feedback', 'Other'];

export function render() {
  const u = currentUser();
  return `
  <section class="page-hero" data-theme="light">
    <div class="photo" data-parallax="8">${img(IMG.counter, 1600, '')}</div>
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><span>Contact</span></nav>
      <h1 class="h-xl" data-split>Talk to <span class="it">the butcher.</span></h1>
      <p class="lead" style="margin-top:20px">Call, WhatsApp or pop in. Orders, special cuts, functions or a question about tonight’s braai: we’re happy to help.</p>
      <div class="contact-quick">
        ${BRANCHES.map((b) => `<a class="cq" href="tel:${b.phone.replace(/\s/g, '')}">${ICON.phone}<span><small>Call ${b.name}</small>${b.phone}</span></a>
          <a class="cq cq--wa" href="https://wa.me/${b.phoneIntl}" target="_blank" rel="noopener">${ICON.whatsapp}<span><small>WhatsApp ${b.name}</small>Chat now</span></a>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec" data-theme="light" style="padding-top:20px">
    <div class="wrap contact">
      <form class="card-box" id="contactForm" novalidate>
        <p class="eyebrow">Send a message</p>
        <h2 class="h-md" style="margin-bottom:22px">How can we help?</h2>
        <div class="form-row">
          <div class="field"><label for="cName">Name</label><input class="input" id="cName" autocomplete="name" value="${esc(u?.name || '')}"><span class="field__err"></span></div>
          <div class="field"><label for="cCell">Cell / WhatsApp</label><input class="input" id="cCell" type="tel" autocomplete="tel" value="${esc(u?.cell || '')}" placeholder="07x xxx xxxx"><span class="field__err"></span></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="cEmail">Email (optional)</label><input class="input" id="cEmail" type="email" autocomplete="email" value="${esc(u?.email || '')}"><span class="field__err"></span></div>
          <div class="field"><label for="cBranch">Branch</label><select class="select" id="cBranch">${BRANCHES.map((b) => `<option value="${b.id}" ${u?.branch === b.id ? 'selected' : ''}>${b.name} · ${b.suburb}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label for="cTopic">Topic</label><select class="select" id="cTopic">${TOPICS.map((t) => `<option>${t}</option>`).join('')}</select></div>
        <div class="field"><label for="cMsg">Message</label><textarea class="textarea" id="cMsg" placeholder="Tell us what you need…"></textarea><span class="field__err"></span></div>
        <button class="btn btn--block magnetic" type="submit">Send message ${ICON.arrow}</button>
        <p class="muted" style="font-size:14px;margin-top:12px">We reply fastest on WhatsApp during trading hours.</p>
      </form>
      <aside class="contact__side">
        <div class="card-box">
          <p class="eyebrow">Follow the specials</p>
          <p style="margin-bottom:16px">Crazy weekly specials, Saturday giveaways and new arrivals land on our socials first.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn--sm" href="${BUSINESS.instagram}" target="_blank" rel="noopener">${ICON.instagram} ${BUSINESS.instagramHandle}</a>
            <a class="btn btn--sm btn--ghost" href="${BUSINESS.facebook}" target="_blank" rel="noopener">${ICON.facebook} Facebook</a>
          </div>
        </div>
        <div class="card-box">
          <p class="eyebrow">Google reviews</p>
          <p style="margin:0 0 14px"><b style="font-family:var(--serif);font-size:42px">${BUSINESS.rating}</b> <span class="stars">${ICON.star.repeat(4)}</span><br><span class="muted">${BUSINESS.reviewCount} reviews</span></p>
          <a class="btn btn--sm btn--ghost" href="${BUSINESS.googleProfile}" target="_blank" rel="noopener">Read or leave a review</a>
        </div>
        <div class="card-box">
          <p class="eyebrow">Certification</p>
          <p style="margin:0">All our meat is ${BUSINESS.certification}.</p>
        </div>
      </aside>
    </div>
  </section>

  <section class="sec" data-theme="light" id="branches" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head"><div><p class="eyebrow">Our branches</p><h2 class="h-lg" data-split>Visit <span class="it">us.</span></h2></div></div>
      <div class="branches">${BRANCHES.map(branchCard).join('')}</div>
    </div>
  </section>`;
}

export function mount(root) {
  const io = new IntersectionObserver((ents) =>
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.innerHTML = `<iframe title="Map to Iqbal's" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${e.target.dataset.map}&output=embed"></iframe>`;
      io.unobserve(e.target);
    }), { rootMargin: '300px' });
  $$('[data-map]', root).forEach((m) => io.observe(m));

  const form = $('#contactForm', root);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (id) => $('#' + id, form).value.trim();
    const errs = {};
    if (v('cName').length < 2) errs.cName = 'Please enter your name.';
    if (!/^(\+27|0)\d{9}$/.test(v('cCell').replace(/\s/g, ''))) errs.cCell = 'Enter a valid SA cell number, e.g. 078 678 6315.';
    if (v('cEmail') && !/^\S+@\S+\.\S+$/.test(v('cEmail'))) errs.cEmail = 'That email doesn’t look right.';
    if (v('cMsg').length < 5) errs.cMsg = 'Please write a short message.';
    $$('.field', form).forEach((f) => { f.classList.remove('is-err'); const er = $('.field__err', f); if (er) er.textContent = ''; });
    Object.entries(errs).forEach(([id, m]) => { const f = $('#' + id, form).closest('.field'); f.classList.add('is-err'); $('.field__err', f).textContent = m; });
    if (Object.keys(errs).length) return $('#' + Object.keys(errs)[0], form).focus();
    const req = saveRequest({ type: 'contact', name: v('cName'), cell: v('cCell'), email: v('cEmail'), branch: v('cBranch'), topic: v('cTopic'), desc: v('cMsg') });
    const b = BRANCHES.find((x) => x.id === req.branch);
    const text = `Hi Iqbal's ${b.name}! (${req.topic}, ref ${req.id})\n${req.desc}\n— ${req.name}, ${req.cell}`;
    form.innerHTML = `<div class="center" style="padding:30px 10px"><div class="success__tick">${ICON.check}</div><h3 class="h-md">Thanks, ${esc(req.name.split(' ')[0])}!</h3>
      <p class="lead" style="margin:14px auto 24px">Message ${req.id} is saved. For the quickest reply, send it straight to our ${b.name} team on WhatsApp.</p>
      <a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/${b.phoneIntl}?text=${encodeURIComponent(text)}">${ICON.whatsapp} Send on WhatsApp</a></div>`;
  });
  return () => io.disconnect();
}
