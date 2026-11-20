/* =====================================================================
   "ASK THE BUTCHER" · LOCAL KNOWLEDGE BASE
   Intent matching with keyword scoring. Each intent returns:
     { text: html, products?: [ids], braai?: {guests, appetite} , links?: [{label, href}] }
   Edit answers here; prices and hours are pulled live from the config.
   ===================================================================== */
import { BRANCHES, DELIVERY, BUSINESS, COMPETITION } from '../config/site.js';
import { PRODUCTS, unitPrice } from './products.js';
import { BOXES, DONENESS } from './content.js';
import { openStatus, money } from '../lib/ui.js';
import { calcBraai, BRAAI_MEATS } from '../lib/braai.js';

const has = (q, words) => words.some((w) => q.includes(w));
const list = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

export const SYSTEM_PROMPT = `You are "Iqbal's Butcher Assistant" for Iqbal's Meat & Deli, a NIHT certified halaal butchery and deli in South Africa (Benoni: 791 Patel Street, Actonville, 078 678 6315; Lenasia: 12286 Nirvana Drive, Ext 13, 078 678 6319. Benoni is open Wednesday to Sunday 8:30 AM to 6:30 PM; Lenasia Mon–Fri 9:30–4:45, Sat 9–4, Sun 9–12:45). Be warm, brief and practical. Recommend cuts, quantities, cooking times and marinades. All meat is halaal. Prices are in ZAR. Never invent prices; refer to the online shop.`;

const INTENTS = [
  {
    id: 'braai-calc',
    test: (q) => has(q, ['braai', 'bbq', 'barbecue', 'braaivleis']) && /\d+/.test(q),
    reply(q) {
      const guests = Math.min(200, parseInt(q.match(/\d+/)[0], 10));
      const appetite = has(q, ['light', 'kids', 'small']) ? 'light' : has(q, ['saturday', 'very hungry', 'starving', 'big eaters']) ? 'saturday' : 'hungry';
      const r = calcBraai(guests, appetite, BRAAI_MEATS.slice(0, 4).map((m) => m.id));
      return {
        text: `<p>For <b>${guests} ${appetite === 'saturday' ? 'Saturday-braai hungry' : appetite}</b> guests I’d get about <b>${r.kg.toFixed(2).replace(/\.00$/, '')} kg</b> of meat:</p>${list(r.lines.map((l) => `${l.meat.label}: <b>${l.kg} kg</b> · ${money(l.price)}`))}<p>Total about <b>${money(r.total)}</b>. Want me to add the whole pack to your cart?</p>`,
        braai: { guests, appetite },
      };
    },
  },
  {
    id: 'specials',
    words: ['special', 'specials', 'deal', 'promo', 'sale', 'discount', 'crazy', 'cheap'],
    reply() {
      const sp = PRODUCTS.filter((p) => p.special);
      return { text: `<p>This week’s <b>crazy specials</b> (they end Sunday 6:30 PM):</p>${list(sp.map((p) => `${p.name}: <b>${money(unitPrice(p))}</b> <s>${money(p.price)}</s>${p.unit === 'kg' ? '/kg' : ''}`))}`, products: sp.slice(0, 4).map((p) => p.id), links: [{ label: 'See the specials board', href: '#/home/specials' }] };
    },
  },
  {
    id: 'braai',
    words: ['braai', 'bbq', 'barbecue', 'grill', 'fire', 'coals'],
    reply: () => ({ text: '<p>For the braai our butchers swear by <b>rump</b> and <b>ribeye</b> (2–3 cm thick), <b>lamb loin chops</b>, our house <b>boerewors</b>, and peri-peri <b>chicken thighs</b>. Tell me how many people are coming, e.g. “braai for 12”, and I’ll work out the kilos.</p>', products: ['rump', 'lamb-loin-chops', 'boerewors', 'family-braai'] }),
  },
  {
    id: 'biryani',
    words: ['biryani', 'akhni', 'breyani', 'biriyani'],
    reply: () => ({ text: '<p>For biryani ask for <b>mutton curry pieces, biryani cut</b> (bigger pieces, bone-in, so they hold up during the dum). Allow about <b>200 g of meat per person</b>. Chicken biryani works best with a whole chicken washed and cut into curry pieces.</p><p>Our <b>Biryani Spice Kit</b>, aged <b>basmati</b> and pure <b>ghee</b> make it easy.</p>', products: ['mutton-curry', 'whole-chicken', 'biryani-mix', 'basmati'], links: [{ label: 'Mutton biryani recipe', href: '#/recipes?r=biryani' }] }),
  },
  {
    id: 'curry',
    words: ['curry', 'masala', 'stew', 'potjie', 'slow cook', 'slow-cook', 'gravy', 'bredie'],
    reply: () => ({ text: '<p>Best cuts for curry:</p>' + list(['<b>Mutton curry pieces</b>: bone-in shoulder, neck and rib. The richest gravy.', '<b>Beef curry pieces</b> (chuck & shin): slow-cook 1½–2 hours.', '<b>Lamb neck slices</b>: perfect for potjie.', '<b>Whole chicken, washed & cut into curry pieces</b>: ready in 40 minutes.']) + '<p>Add a spoon of our <b>Mother-in-Law masala</b> if you like it hot!</p>', products: ['mutton-curry', 'beef-curry', 'lamb-neck', 'mother-in-law'], links: [{ label: 'Durban mutton curry recipe', href: '#/recipes?r=mutton-curry' }] }),
  },
  {
    id: 'roast',
    words: ['roast', 'oven', 'sunday lunch', 'leg', 'joint'],
    reply: () => ({ text: '<p>For a roast: <b>leg of lamb</b> (bone-in or deboned & rolled), <b>lamb shoulder</b> for slow-roasting, <b>topside</b> for a lean beef roast, or a whole <b>beef fillet</b> for something special. Plan on 250–300 g per person, bone-in.</p><p>Lamb leg: 180 °C for about 25 min per 500 g for pink, then rest 15 minutes.</p>', products: ['leg-of-lamb', 'lamb-shoulder', 'topside', 'fillet'] }),
  },
  {
    id: 'per-person',
    words: ['how much', 'per person', 'how many kg', 'quantity', 'portion', 'feed'],
    reply: () => ({ text: '<p>A good rule of thumb (raw weight):</p>' + list(['Braai: <b>300 g</b> per light eater, <b>450 g</b> hungry, <b>600 g</b> for a proper Saturday braai', 'Curry or biryani: <b>200–250 g</b> per person bone-in', 'Boneless steak or fillet: <b>200–250 g</b>', 'Mince dishes: <b>150 g</b>']) + '<p>Tell me your number of guests and I’ll calculate it for you.</p>' }),
  },
  {
    id: 'cook',
    words: ['temperature', 'temp', 'how long', 'cook time', 'cooking time', 'doneness', 'rare', 'medium', 'well done', 'cook a steak', 'cook steak'],
    reply: () => ({ text: '<p>Steak core temperatures:</p>' + list(DONENESS.map((d) => `${d.name}: <b>${d.temp}</b>`)) + '<p>For a 2.5 cm steak over hot coals: about 3 minutes a side for medium rare. Always rest it 5 minutes. Chicken must reach <b>74 °C</b>.</p>', links: [{ label: 'Open the cooking guide', href: '#/guide' }] }),
  },
  {
    id: 'marinade',
    words: ['marinade', 'marinate', 'rub', 'spice', 'sauce', 'flavour', 'flavor', 'tikka', 'peri'],
    reply: () => ({ text: '<p>Marinade ideas from the counter:</p>' + list(['<b>Peri-peri</b>: chicken thighs or wings, 4 hours to overnight', '<b>Lemon & herb</b>: lamb chops, 1–2 hours', '<b>Tikka</b>: yoghurt + tikka masala + lemon on chicken, at least 2 hours', '<b>Garlic & herb</b>: rump and sirloin, 30 minutes is enough']) + '<p>We can marinate any cut for you at no extra charge, just choose it as the preparation option.</p>', products: ['peri-marinade', 'lemon-herb', 'tikka-masala', 'braai-spice'] }),
  },
  {
    id: 'hours',
    words: ['open', 'hours', 'time', 'close', 'closing', 'trading', 'today', 'sunday', 'monday', 'tuesday'],
    reply: () => ({ text: '<p>Trading hours:</p>' + list(BRANCHES.map((b) => `<b>${b.name}</b>: ${b.hoursLabel}<br><i>${openStatus(b).label}</i>`)), links: [{ label: 'Branches & maps', href: '#/home/branches' }] }),
  },
  {
    id: 'location',
    words: ['where', 'address', 'location', 'directions', 'map', 'benoni', 'lenasia', 'actonville', 'branch'],
    reply: () => ({ text: list(BRANCHES.map((b) => `<b>${b.name}</b>: ${b.address} · <a href="tel:${b.phone.replace(/\s/g, '')}">${b.phone}</a> · <a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.mapQuery)}">Directions</a>`)) }),
  },
  {
    id: 'contact',
    words: ['phone', 'call', 'contact', 'number', 'whatsapp', 'email'],
    reply: () => ({ text: list(BRANCHES.map((b) => `<b>${b.name}</b>: <a href="tel:${b.phone.replace(/\s/g, '')}">${b.phone}</a> · <a target="_blank" rel="noopener" href="https://wa.me/${b.phoneIntl}">WhatsApp</a>`)) + '<p>You can also message us on Instagram <b>@_iqbals_</b>.</p>' }),
  },
  {
    id: 'weekly',
    words: ['weekly', 'subscription', 'subscribe', 'box', 'every week', 'monthly'],
    reply: () => ({ text: '<p><b>Iqbal’s Weekly Box</b> delivers every week. Pause, skip or cancel any time:</p>' + list(BOXES.map((b) => `${b.name}: <b>${money(b.price)}</b>/week · ${b.feeds}`).concat(['Custom Box: 5% off counter prices, from R400/week'])), links: [{ label: 'Build my Weekly Box', href: '#/weekly-box' }] }),
  },
  {
    id: 'delivery',
    words: ['deliver', 'delivery', 'shipping', 'courier', 'area', 'boksburg', 'collect', 'collection', 'pick up', 'pickup'],
    reply: () => ({ text: `<p>We deliver Wednesday to Sunday in slots from 8:30 AM to 6:30 PM. Fees depend on your area (from ${money(Math.min(...DELIVERY.zones.map((z) => z.fee)))}), and delivery is <b>free over ${money(DELIVERY.freeThreshold)}</b>. Collection from either branch is always free.</p><p>Areas: ${DELIVERY.areas.join(', ')}.</p>`, links: [{ label: 'Check my area & fee', href: '#/delivery' }] }),
  },
  {
    id: 'halaal',
    words: ['halaal', 'halal', 'niht', 'certified', 'certificate', 'zabiha'],
    reply: () => ({ text: `<p>Yes. Everything we sell is <b>${BUSINESS.certification}</b>, and the certification is active. The certificate is displayed in both shops.</p>` }),
  },
  {
    id: 'roti',
    words: ['roti', 'rotis', 'bread', 'bakery', 'pie', 'pies', 'samosa', 'samoosa', 'pizza', 'pastry', 'naan'],
    reply: () => ({ text: '<p>Our rotis are famous, and customers call them the <b>best on the East Rand</b>. Soft and flaky, and they freeze beautifully. We also have samosas, pies, pizzas, naan and fresh pastries daily.</p>', products: ['rotis', 'mince-samosas', 'chicken-pie', 'naan'] }),
  },
  {
    id: 'chicken',
    words: ['chicken', 'washed', 'cut chicken', 'wings', 'drumstick', 'fillet'],
    reply: () => ({ text: '<p>All our chicken is fresh and <b>washed and cut to order</b>: 8 pieces, curry pieces, skinless or marinated. Just pick the preparation when you add it.</p>', products: ['whole-chicken', 'chicken-fillet', 'chicken-thighs', 'wings'] }),
  },
  {
    id: 'steak',
    words: ['steak', 'ribeye', 'rump', 'sirloin', 't-bone', 'tbone', 'tomahawk'],
    reply: () => ({ text: '<p>Steak guide: <b>Ribeye</b> is the most marbled and juicy, <b>rump</b> has the most flavour, <b>sirloin</b> is tender with a fat cap, and <b>fillet</b> is the most tender of all. For a showpiece, go <b>tomahawk</b> and reverse-sear it.</p>', products: ['ribeye', 'rump', 'tomahawk', 'fillet'] }),
  },
  {
    id: 'pay',
    words: ['pay', 'payment', 'card', 'eft', 'cash', 'payfast', 'yoco'],
    reply: () => ({ text: '<p>Online you can pay by <b>card</b>, <b>Instant EFT</b>, or <b>cash/card on delivery or collection</b>. In store we take cash and all major cards.</p>' }),
  },
  {
    id: 'competition',
    words: ['competition', 'giveaway', 'win', 'prize', 'draw'],
    reply: () => ({ text: `<p><b>${COMPETITION.title}</b>: ${COMPETITION.text}</p>`, links: [{ label: 'Follow @_iqbals_', href: BUSINESS.instagram }] }),
  },
  {
    id: 'eid',
    words: ['eid', 'qurbani', 'qurbaani', 'udhiyah', 'sacrifice', 'ramadan', 'ramadaan', 'iftaar', 'iftar', 'sehri'],
    reply: () => ({ text: '<p><b>Qurbani bookings</b> for Eid al-Adha are open online: sheep, goat, a 1/7 cow share or a whole cow, slaughtered, cleaned and cut how you like. A deposit secures your booking.</p><p>For <b>Ramadan</b> we have iftaar family packs, samosa platters and bulk rotis for the freezer.</p>', products: ['iftaar-family', 'samosa-platter', 'roti-bulk'], links: [{ label: 'Book Qurbani & iftaar packs', href: '#/eid' }] }),
  },
  {
    id: 'rewards',
    words: ['points', 'rewards', 'loyalty', 'reward'],
    reply: () => ({ text: '<p><b>Iqbal’s Rewards:</b> earn 1 point per R10 spent online. 100 points = R10 off, up to half of an order. You can also earn bonus points playing Braai Master.</p>', links: [{ label: 'How Rewards work', href: '#/rewards' }] }),
  },
  {
    id: 'functions',
    words: ['wedding', 'walima', 'function', 'catering', 'event', 'party', 'bulk', 'aqiqah', 'jumuah'],
    reply: () => ({ text: '<p>Feeding a crowd? Our <b>functions calculator</b> works out the kilos for braai, curry, biryani or a mixed buffet, with a function discount of 5–12%. Then we send a proper quote.</p>', links: [{ label: 'Get a function quote', href: '#/functions' }] }),
  },
  {
    id: 'planner',
    words: ['meal plan', 'meal planner', 'plan the week', 'weekly menu', 'dinner ideas', 'what to cook'],
    reply: () => ({ text: '<p>Try the <b>meal planner</b>: pick a dinner for each night and how many you’re feeding, and we build one shopping list with the right kilos.</p>', links: [{ label: 'Open the meal planner', href: '#/meal-planner' }] }),
  },
  {
    id: 'thanks',
    words: ['thank', 'thanks', 'shukran', 'cheers', 'great', 'awesome'],
    reply: () => ({ text: '<p>Pleasure! Anything else I can help you with? 🔪</p>' }),
  },
  {
    id: 'hello',
    words: ['hi', 'hello', 'hey', 'salaam', 'salam', 'morning', 'afternoon', 'evening', 'howzit'],
    reply: () => ({ text: '<p>Welcome to Iqbal’s Meat &amp; Deli! I’m Iqbal’s Butcher Assistant. Ask me about cuts, quantities, cooking times, today’s specials or delivery.</p>' }),
  },
];

/** Find the best answer for a question. */
export function answer(raw) {
  const q = ' ' + raw.toLowerCase().replace(/[^\w\s'-]/g, ' ') + ' ';
  for (const it of INTENTS) if (it.test && it.test(q)) return it.reply(q);
  let best = null;
  let score = 0;
  INTENTS.forEach((it) => {
    if (!it.words) return;
    const s = it.words.reduce((n, w) => n + (w.length <= 3 ? (q.includes(' ' + w + ' ') ? 1 : 0) : q.includes(w) ? (w.includes(' ') ? 2 : 1) : 0), 0);
    if (s > score) { score = s; best = it; }
  });
  if (best) return best.reply(q);
  // product name search
  const terms = q.split(/\s+/).filter((t) => t.length > 3);
  const hits = PRODUCTS.filter((p) => terms.some((t) => `${p.name} ${p.cut}`.toLowerCase().includes(t))).slice(0, 4);
  if (hits.length) return { text: '<p>Here’s what I found on the counter:</p>', products: hits.map((p) => p.id) };
  return {
    text: `<p>Good question! I’m not sure about that one. The butchers can help directly on WhatsApp: <a target="_blank" rel="noopener" href="https://wa.me/${BRANCHES[0].phoneIntl}">Benoni</a> or <a target="_blank" rel="noopener" href="https://wa.me/${BRANCHES[1].phoneIntl}">Lenasia</a>.</p><p>Or try one of the questions below.</p>`,
  };
}
