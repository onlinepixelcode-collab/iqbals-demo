/* "Ask the Butcher" chat widget (local knowledge base + optional live AI). */
import { u } from '../config/site.js';
import { AI_CONFIG } from '../config/ai.js';
import { productById, unitPrice } from '../data/products.js';
import { answer, SYSTEM_PROMPT } from '../data/knowledge.js';
import { $, $$, ICON, money, esc, toast, flyToCart } from '../lib/ui.js';
import { BRAAI_MEATS, calcBraai, addBraaiToCart } from '../lib/braai.js';
import { quickAdd } from './product.js';
import { logoImg } from './brand.js';
import { stopScroll, startScroll } from '../lib/motion.js';

const CHIPS = ["What's on special?", 'Braai for 10 people', 'Best cut for curry', 'Weekly delivery', 'Opening hours'];
const history = [];

export function initChat() {
  const root = $('#chat');
  root.innerHTML = `
    <button class="chat__fab" data-open-chat aria-label="Ask the Butcher: open chat">${logoImg({ size: 74, alt: '' })}<span class="chat__ping"></span></button>
    <section class="chat__panel" role="dialog" aria-label="Ask the Butcher chat" aria-hidden="true">
      <header class="chat__head">${logoImg({ size: 48, alt: '' })}<div><b>Ask the Butcher</b><small><i></i> Iqbal’s Butcher Assistant · online</small></div>
        <button class="icon-btn" data-close-chat aria-label="Close chat">${ICON.close}</button></header>
      <div class="chat__log" id="chatLog" data-lenis-prevent aria-live="polite"></div>
      <div class="chat__chips" id="chatChips">${CHIPS.map((c) => `<button type="button">${c}</button>`).join('')}</div>
      <form class="chat__form" id="chatForm"><label class="sr" for="chatInput">Message</label>
        <input class="input" id="chatInput" placeholder="Ask about cuts, braais, hours…" autocomplete="off" maxlength="300">
        <button type="submit" aria-label="Send">${ICON.send}</button></form>
    </section>`;

  const log = $('#chatLog', root);
  const input = $('#chatInput', root);
  let greeted = false;

  const open = () => {
    root.classList.add('is-open');
    $('.chat__panel', root).setAttribute('aria-hidden', 'false');
    $('.chat__ping', root)?.remove();
    if (innerWidth < 720) stopScroll();
    if (!greeted) {
      greeted = true;
      bot({ text: '<p>Welcome to Iqbal’s Meat &amp; Deli! 👋 I’m <b>Iqbal’s Butcher Assistant</b>.</p><p>Ask me which cut to use, how much meat to buy for a braai, cooking times, today’s specials, delivery or our hours.</p>' });
    }
    setTimeout(() => input.focus(), 400);
  };
  const close = () => {
    root.classList.remove('is-open');
    $('.chat__panel', root).setAttribute('aria-hidden', 'true');
    startScroll();
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-chat]')) { e.preventDefault(); open(); }
  });
  $('[data-close-chat]', root).addEventListener('click', close);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && root.classList.contains('is-open') && close());

  const scrollDown = () => requestAnimationFrame(() => (log.scrollTop = log.scrollHeight));

  function me(text) {
    log.insertAdjacentHTML('beforeend', `<div class="msg msg--me">${esc(text)}</div>`);
    scrollDown();
  }
  function bot(res) {
    const prods = (res.products || []).map(productById).filter(Boolean);
    const html = `<div class="msg msg--bot">${res.text}
      ${prods.length ? `<div class="chat-prods">${prods.map((p) => `<div class="chat-prod"><div class="photo"><img src="${u(p.img, 120)}" alt="" loading="lazy"></div><div><b>${esc(p.name)}</b><small>${money(unitPrice(p))}${p.unit === 'kg' ? ' / kg' : ''}</small></div><button class="add-mini" data-chat-add="${p.id}">${ICON.plus} Add</button></div>`).join('')}</div>` : ''}
      ${res.braai ? `<button class="btn btn--sm btn--block" style="margin-top:12px" data-chat-braai="${res.braai.guests}|${res.braai.appetite}">Add whole braai pack ${ICON.plus}</button>` : ''}
      ${(res.links || []).map((l) => `<a class="add-mini" style="margin:10px 6px 0 0" href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noopener"' : 'data-chat-link'}>${l.label} ${ICON.arrow}</a>`).join('')}
    </div>`;
    log.insertAdjacentHTML('beforeend', html);
    scrollDown();
  }

  async function ask(text) {
    if (!text.trim()) return;
    me(text);
    history.push({ role: 'user', content: text });
    input.value = '';
    log.insertAdjacentHTML('beforeend', `<div class="msg msg--bot typing" id="typing"><i></i><i></i><i></i></div>`);
    scrollDown();
    const local = answer(text);
    let res = local;
    if (AI_CONFIG.enabled && AI_CONFIG.endpoint) {
      const live = await askLive().catch(() => null);
      if (live) res = { ...local, text: `<p>${esc(live).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` };
    } else {
      await new Promise((r) => setTimeout(r, 550 + Math.random() * 500));
    }
    $('#typing', log)?.remove();
    history.push({ role: 'assistant', content: res.text.replace(/<[^>]+>/g, ' ') });
    bot(res);
  }

  /** Optional live AI: see src/config/ai.js */
  async function askLive() {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), AI_CONFIG.timeoutMs);
    const r = await fetch(AI_CONFIG.endpoint, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(AI_CONFIG.apiKey ? { Authorization: `Bearer ${AI_CONFIG.apiKey}` } : {}) },
      body: JSON.stringify({ model: AI_CONFIG.model || undefined, system: SYSTEM_PROMPT, messages: history.slice(-10) }),
    });
    clearTimeout(t);
    if (!r.ok) throw new Error('AI request failed');
    const data = await r.json();
    return data.reply || data.choices?.[0]?.message?.content || data.content?.find?.((c) => c.type === 'text')?.text || null;
  }

  $('#chatForm', root).addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
  });
  $$('#chatChips button', root).forEach((b) => b.addEventListener('click', () => ask(b.textContent)));
  log.addEventListener('click', (e) => {
    const add = e.target.closest('[data-chat-add]');
    if (add) return quickAdd(add.dataset.chatAdd, add);
    const br = e.target.closest('[data-chat-braai]');
    if (br) {
      const [g, ap] = br.dataset.chatBraai.split('|');
      const r = calcBraai(Number(g), ap, BRAAI_MEATS.slice(0, 4).map((m) => m.id));
      addBraaiToCart(r);
      flyToCart(br, '');
      toast(`Braai pack for ${g} added to your cart`);
      br.disabled = true;
      br.textContent = 'Added to cart ✓';
      return;
    }
    if (e.target.closest('[data-chat-link]') && innerWidth < 720) close();
  });
}
