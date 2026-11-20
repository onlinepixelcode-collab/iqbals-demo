/* LEGAL · Terms & Conditions, Privacy Policy, Shipping (Delivery) Policy, Returns & Refund Policy.
   Every number on these pages (fees, hours, points, deposits) is read from the site config and data
   files, so the policies stay in step with what the shop and checkout actually do.
   Written for South African law: Consumer Protection Act 68 of 2008 (CPA), Electronic Communications
   and Transactions Act 25 of 2002 (ECTA) and Protection of Personal Information Act 4 of 2013 (POPIA). */
import { BUSINESS, BRANCHES, DELIVERY, REWARDS, SEASONAL } from '../config/site.js';
import { QURBANI } from '../data/features.js';
import { $, $$, ICON, money } from '../lib/ui.js';
import { scrollTo } from '../lib/motion.js';

export const LEGAL_UPDATED = '2026-11-20';
const updatedLabel = new Date(LEGAL_UPDATED + 'T12:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

export const POLICIES = [
  { slug: 'terms', short: 'Terms & Conditions', title: 'Terms &amp; <span class="it">Conditions.</span>' },
  { slug: 'privacy', short: 'Privacy Policy', title: 'Privacy <span class="it">Policy.</span>' },
  { slug: 'shipping', short: 'Shipping Policy', title: 'Shipping <span class="it">Policy.</span>' },
  { slug: 'returns', short: 'Returns & Refunds', title: 'Returns &amp; <span class="it">Refunds.</span>' },
];

/* ---------- shared facts ---------- */
const NAME = BUSINESS.name;
const pointsPerRand = Math.round(1 / REWARDS.perRand); // R10 spend = 1 point
const pointsFor10 = Math.round(10 / REWARDS.pointValue); // 100 points = R10
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const t12 = (hm) => { const [h, m] = hm.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; const hh = h % 12 || 12; return m ? `${hh}:${String(m).padStart(2, '0')} ${ap}` : `${hh} ${ap}`; };
const fee = (n) => money(n).replace(/\.00$/, '');
const tel = (b) => `<a href="tel:${b.phone.replace(/\s/g, '')}">${b.phone}</a>`;
const wa = (b) => `<a href="https://wa.me/${b.phoneIntl}" target="_blank" rel="noopener">WhatsApp ${b.phone}</a>`;
const branchList = () => `<ul>${BRANCHES.map((b) => `<li><b>${NAME} ${b.name}</b>: ${b.address}. Phone ${tel(b)}.</li>`).join('')}</ul>`;
const contactBlock = () => `<div class="legal__contact">${BRANCHES.map((b) => `<div><b>${b.name}</b><span>${b.address}</span><span>${tel(b)} · ${wa(b)}</span><small>${b.hoursLabel}</small></div>`).join('')}</div>`;

const hoursTable = () => `<div class="legal__table-wrap"><table class="legal__table"><thead><tr><th scope="col">Day</th>${BRANCHES.map((b) => `<th scope="col">${b.name}</th>`).join('')}</tr></thead><tbody>
  ${[1, 2, 3, 4, 5, 6, 0].map((d) => `<tr><th scope="row">${DAYS[d]}</th>${BRANCHES.map((b) => `<td>${b.hours[d] ? `${t12(b.hours[d][0])} – ${t12(b.hours[d][1])}` : 'Closed'}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div><p class="legal__note">Lenasia closes for lunch and prayer from 1 PM to 2 PM daily and from 12 PM to 2 PM on Fridays. Public holiday hours are announced on our Instagram page (${BUSINESS.instagramHandle}).</p>`;

/* which delivery slots fit inside a branch's trading hours on a given weekday */
export function slotsFor(branch, weekday) {
  const h = branch.hours[weekday];
  if (!h) return [];
  return DELIVERY.slots.filter((s) => { const [a, b] = s.split('–').map((x) => x.trim()); return a >= h[0] && b <= h[1]; });
}

const zoneTable = () => `<div class="legal__table-wrap"><table class="legal__table"><thead><tr><th scope="col">Area</th><th scope="col">Delivered from</th><th scope="col">Fee under ${fee(DELIVERY.freeThreshold)}</th></tr></thead><tbody>
  ${DELIVERY.zones.map((z) => `<tr><td>${z.name}</td><td>${BRANCHES.find((b) => b.id === z.branch).name}</td><td>${fee(z.fee)}</td></tr>`).join('')}
  </tbody></table></div>`;

const slotTable = () => `<div class="legal__table-wrap"><table class="legal__table"><thead><tr><th scope="col">Day</th>${BRANCHES.map((b) => `<th scope="col">${b.name}</th>`).join('')}</tr></thead><tbody>
  ${[1, 2, 3, 4, 5, 6, 0].map((d) => `<tr><th scope="row">${DAYS[d]}</th>${BRANCHES.map((b) => { const s = slotsFor(b, d); return `<td>${s.length ? s.join('<br>') : 'No deliveries'}</td>`; }).join('')}</tr>`).join('')}
  </tbody></table></div>`;

const qurbaniTable = () => `<div class="legal__table-wrap"><table class="legal__table"><thead><tr><th scope="col">Qurbani</th><th scope="col">Price</th><th scope="col">Deposit</th></tr></thead><tbody>
  ${QURBANI.map((q) => `<tr><td>${q.name}</td><td>${fee(q.price)}</td><td>${fee(q.deposit)}</td></tr>`).join('')}</tbody></table></div>`;

/* ---------- the policies ---------- */
const CONTENT = {
  terms: {
    intro: `These terms apply when you visit this website, create an account, place an order, subscribe to a Weekly Box, book a Qurbani or play the Flying Steak game. By doing any of these you accept these terms. Please read them with our <a href="#/privacy">Privacy Policy</a>, <a href="#/shipping">Shipping Policy</a> and <a href="#/returns">Returns &amp; Refund Policy</a>, which form part of these terms.`,
    sections: [
      ['who', 'Who we are', `<p>This website is operated by ${NAME} (“we”, “us”, “our”), a halaal butchery and deli trading from two branches in Gauteng, South Africa:</p>${branchList()}<p>All our meat is certified halaal by the National Independent Halaal Trust (NIHT).</p><p>You can contact us by phone or WhatsApp on the numbers above, or through our <a href="#/contact">contact page</a>.</p>`],
      ['your-rights', 'Your rights under South African law', `<p>Nothing in these terms limits or removes any right you have under the Consumer Protection Act 68 of 2008 (CPA), the Electronic Communications and Transactions Act 25 of 2002 (ECTA) or the Protection of Personal Information Act 4 of 2013 (POPIA). If any part of these terms conflicts with those laws, the law applies.</p>`],
      ['accounts', 'Your account', `<ul><li>You must be 18 or older to create an account or place an order, or have the consent of a parent or guardian.</li><li>Please give us accurate details. We use your cell number and address to deliver your order and to contact you about it.</li><li>Keep your password private. You are responsible for orders placed through your account until you tell us that someone else has access to it.</li><li>You can update your details in <a href="#/account">My Butcher</a> at any time.</li></ul>`],
      ['products', 'Products, photos and halaal status', `<ul><li>Every product is hand-cut, so size, shape, marbling and fat cover vary from piece to piece. Product photos show the type of cut and are not a photo of the exact piece you will receive.</li><li>Stock is held per branch. A product can be in stock at one branch and sold out at the other. If something sells out after you order, we will contact you to offer a substitute, a refund for that item, or a later date.</li><li>Product descriptions, cooking tips and the “Ask the Butcher” chat give general guidance only. Follow safe food handling and cook meat to a safe internal temperature (see our <a href="#/guide">cooking guide</a>).</li></ul>`],
      ['prices', 'Prices and weights', `<ul><li>All prices are in South African Rand (ZAR) and include VAT where VAT applies.</li><li>Meat sold per kilogram is priced on the weight you select. Because each piece is cut by hand, the packed weight can differ slightly from the weight you chose. You will never pay more than the amount shown at checkout.</li><li>Delivery fees are shown at checkout before you pay and are set out in our <a href="#/shipping">Shipping Policy</a>.</li><li>If a price on the website is clearly wrong because of a typing or system error, we will not hold you to it. We will contact you before we process the order and you may confirm at the correct price or cancel for a full refund.</li></ul>`],
      ['specials', 'Crazy Specials and promotions', `<ul><li>Weekly Crazy Specials run until Sunday at 6:30 PM, or while stock lasts at the branch you order from.</li><li>Special prices cannot be combined with other promotions unless we say so.</li><li>The Saturday Giveaway: customers who spend R500 or more in a week are entered into a draw for a R1,000 braai hamper. The winner is drawn at random and announced on our Instagram page every Saturday. There is no separate entry fee, the prize cannot be exchanged for cash, and the competition is run in line with section 36 of the CPA.</li></ul>`],
      ['orders', 'Placing an order', `<ul><li>When you place an order you make an offer to buy the products. The contract is formed when we confirm your order on screen or by message.</li><li>Orders can be placed for delivery or collection from the next day onwards, on days the branch you choose is open (see the trading hours below).</li><li>Before you pay, checkout shows every item, its weight or quantity, any preparation you asked for, the delivery fee, any Rewards discount and the total. You can go back and correct mistakes before you confirm.</li><li>We may decline or cancel an order if we cannot verify payment, if the delivery address is outside the areas we serve and we cannot agree on collection, or if a product is unavailable. If we cancel, we refund what you paid in full.</li></ul>${hoursTable()}`],
      ['payment', 'Payment', `<ul><li>We accept card payments (processed by PayFast or Yoco), Instant EFT, and cash or card on delivery or collection.</li><li>Card payments are handled on the secure page of the payment provider. We never see or store your full card number.</li><li>Orders paid by card or Instant EFT are confirmed once the payment provider confirms payment. Cash-on-delivery orders are confirmed when we accept them.</li></ul>`],
      ['custom', 'Cut Studio and cut-to-order requests', `<p>When you order through the Cut Studio or the cut-to-order form, we cut, trim, marinate and pack the meat to your instructions. Because the result is made to your order, it cannot be resold. You can change or cancel a custom order free of charge until 12:00 (noon) on the day before your delivery or collection date. After that, the meat may already be cut and the order can only be cancelled if we have not started on it. See our <a href="#/returns">Returns &amp; Refund Policy</a>.</p>`],
      ['box', 'Iqbal’s Weekly Box', `<ul><li>A Weekly Box is a repeat order delivered once a week on the day you choose (${DELIVERY.boxDays.join(', ').replace(/, ([^,]*)$/, ' or $1')}).</li><li>The weekly price shown when you sign up includes delivery. Custom boxes start at R400 a week.</li><li>You can pause, skip a week or cancel in My Butcher at any time before 12:00 (noon) on the day before a delivery. Changes made after that time apply from the following week.</li><li>If you pay by card, you authorise us to charge your card each week for that week’s box until you pause or cancel. You may also pay by Instant EFT each week or by cash or card on delivery.</li><li>If a product in your box is unavailable, we replace it with a product of equal or greater value, or refund the difference.</li></ul>`],
      ['qurbani', 'Eid Qurbani bookings', `<ul><li>Qurbani is offered for ${SEASONAL.eidLabel}. The price includes the animal, slaughter by our certified team, cleaning and cutting.</li><li>A deposit secures your booking and the balance is paid on collection:</li></ul>${qurbaniTable()}<ul><li>Bookings close 7 days before the expected date of Eid. The exact day of Eid depends on the sighting of the moon, and collection days move with it.</li><li>You may cancel a Qurbani booking. If you cancel before bookings close, we refund your deposit in full. If you cancel after bookings close, we may keep a reasonable cancellation charge to cover the animal we reserved for you, up to the amount of the deposit, as allowed by section 17 of the CPA. We will not charge a cancellation fee if you cancel because of death or hospitalisation.</li><li>If you choose “Distribute to the needy on my behalf”, we distribute the meat on your behalf and nothing is collected.</li></ul>`],
      ['rewards', 'Iqbal’s Rewards', `<ul><li>Signed-in customers earn 1 point for every R${pointsPerRand} spent on products, after any Rewards discount. Delivery fees do not earn points.</li><li>${pointsFor10} points are worth R10 off a future order. Points can pay for up to ${Math.round(REWARDS.maxShare * 100)}% of an order’s product total.</li><li>Signed-in players of the Flying Steak game earn 5 points per game point scored, up to ${REWARDS.gameMax} points per day.</li><li>Tiers are based on lifetime points earned: ${REWARDS.tiers.map((t) => `${t.name} from ${t.min.toLocaleString('en-ZA')}`).join(', ')}. Gold members get free delivery on every order to the areas in our Shipping Policy.</li><li>Points have no cash value, cannot be transferred or sold, and are returned to your account if an order paid partly with points is refunded.</li><li>We may change or end the Rewards programme with at least 30 days’ notice on this website. Points earned before a change remain valid for at least those 30 days.</li></ul>`],
      ['game', 'Flying Steak game', `<p>The game is free to play. Scores and points are recorded for signed-in players. We may remove points earned through cheating, automated play or a technical fault.</p>`],
      ['use', 'Using this website', `<ul><li>Do not misuse the website: no attempts to gain unauthorised access, interfere with its operation, or place fake orders.</li><li>The text, design, logo and graphics on this website belong to ${NAME} or are used with permission. You may not copy them for commercial use without our written consent.</li><li>Links to Google Maps, WhatsApp, Instagram, Facebook and payment providers take you to services we do not control. Their own terms and privacy policies apply.</li></ul>`],
      ['liability', 'Liability', `<p>We take reasonable care to keep this website accurate and available, but we cannot guarantee that it will always be error-free or uninterrupted. To the extent the law allows, we are not liable for indirect or consequential loss arising from use of the website. This does not limit our liability for goods that are defective or unsafe under sections 55, 56 and 61 of the CPA, or for loss caused by our gross negligence.</p>`],
      ['changes', 'Changes to these terms', `<p>We may update these terms from time to time. The date at the top of this page shows when they last changed. The terms in force when you place an order apply to that order.</p>`],
      ['law', 'Governing law and complaints', `<p>These terms are governed by the laws of the Republic of South Africa. If you are unhappy, please contact the branch first so we can put it right. If we cannot resolve your complaint, you may approach the Consumer Goods and Services Ombud (CGSO) or the National Consumer Commission.</p>`],
    ],
  },

  privacy: {
    intro: `${NAME} respects your privacy. This policy explains what personal information we collect through this website, why we collect it, who we share it with and the rights you have under the Protection of Personal Information Act 4 of 2013 (POPIA).`,
    sections: [
      ['responsible', 'Who is responsible for your information', `<p>${NAME} is the responsible party for personal information collected through this website. Our Information Officer is the owner of the business, as POPIA provides for a private body. You can reach us at either branch:</p>${branchList()}`],
      ['collect', 'What we collect', `<ul><li><b>Account details:</b> your name, email address, cell number, preferred branch and delivery addresses. Your password is stored only as a one-way encrypted hash, never in plain text.</li><li><b>Order details:</b> the products you buy, weights, cutting and packing instructions, notes for the butcher, delivery or collection date and time slot, delivery address, payment method and payment reference.</li><li><b>Payment details:</b> card payments are processed by PayFast or Yoco on their secure pages. We receive confirmation that you paid and a payment reference. We never receive or store your full card number or CVC.</li><li><b>Weekly Box, Qurbani, function and cut-to-order requests:</b> your contact details and the details of your request, including the name(s) a Qurbani is made on behalf of.</li><li><b>Contact form and chat messages:</b> what you write to us.</li><li><b>Newsletter:</b> your email address, if you subscribe.</li><li><b>Rewards and game:</b> your points balance, points history and game scores.</li></ul><p>We do not collect special personal information (such as health or biometric information), and we do not ask for your ID number.</p>`],
      ['why', 'Why we use it', `<ul><li>To process, prepare, deliver and support your orders, Weekly Box and bookings (performance of a contract with you).</li><li>To contact you about your order by phone, SMS or WhatsApp, for example if an item is unavailable or the driver cannot find your address.</li><li>To run your account, Rewards points and order history.</li><li>To send our weekly specials newsletter, only if you subscribed (see Direct marketing below).</li><li>To keep financial records as required by South African tax law.</li><li>To prevent fraud and keep the website secure (our legitimate interest).</li></ul><p>We only collect information that is necessary for these purposes, and we do not sell your personal information.</p>`],
      ['share', 'Who we share it with', `<ul><li><b>Payment providers</b> (PayFast and Yoco) to process card and Instant EFT payments.</li><li><b>Our own drivers or delivery partner</b>, who receive only your name, cell number, address and delivery slot.</li><li><b>WhatsApp (Meta)</b>, when you choose to send us an order or message through a WhatsApp button. The message is sent from your own WhatsApp account and WhatsApp’s privacy policy applies.</li><li><b>Website service providers</b> who host the website and its data on our behalf, under agreements that require them to keep it confidential and secure.</li><li><b>Authorities</b>, when the law requires it.</li></ul>`],
      ['cookies', 'Cookies and browser storage', `<p>This website does not use advertising or tracking cookies and does not run analytics or advertising trackers. It uses your browser’s local storage to remember your cart, wishlist, branch choice, account session and game scores, and session storage to remember that you have seen the opening animation. You can clear this at any time in your browser settings; your cart and session on this device will then be reset.</p><p>Some pages load content from third parties: fonts from Google Fonts, product photos from Unsplash and maps from Google Maps. When your browser loads these, the provider receives your IP address and browser details, as with any website visit.</p>`],
      ['marketing', 'Direct marketing', `<p>We only send marketing messages, such as our specials newsletter, if you have opted in. Every newsletter includes a way to unsubscribe, and you can also ask either branch to remove you. We will not send you marketing by SMS, WhatsApp or phone without your consent, as required by section 69 of POPIA.</p>`],
      ['transfer', 'Information sent outside South Africa', `<p>Some of our service providers (for example Google, Meta/WhatsApp and website hosting providers) may store or process information on servers outside South Africa. We only use providers that are subject to laws, binding rules or agreements that give your information a level of protection substantially similar to POPIA, as section 72 of POPIA requires.</p>`],
      ['retention', 'How long we keep it', `<ul><li>Order and payment records: 5 years from the date of the transaction, as required by the Tax Administration Act 28 of 2011.</li><li>Account details: for as long as your account is open. If you ask us to close your account, we delete or de-identify your details, except records we must keep by law.</li><li>Contact form, chat and enquiry messages: up to 12 months, unless they relate to an order or complaint.</li><li>Newsletter: until you unsubscribe.</li></ul>`],
      ['security', 'How we protect it', `<p>We take appropriate, reasonable technical and organisational measures to protect your information against loss, damage and unauthorised access, as section 19 of POPIA requires. These include encrypted connections (HTTPS), hashed passwords, and limiting access to the staff who need it to fill your order. If we become aware of a security compromise affecting your information, we will notify you and the Information Regulator as section 22 of POPIA requires.</p>`],
      ['rights', 'Your rights', `<p>Under POPIA you have the right to:</p><ul><li>ask whether we hold personal information about you and request a copy of it;</li><li>ask us to correct, update or delete information that is inaccurate, out of date, excessive or unlawfully obtained;</li><li>object to us processing your information for direct marketing, or on the basis of our legitimate interest;</li><li>withdraw your consent at any time, where we rely on consent;</li><li>lodge a complaint with the Information Regulator.</li></ul><p>To use these rights, contact either branch. We will need to confirm your identity before we act on a request, and we will respond within a reasonable time.</p>`],
      ['children', 'Children', `<p>This website is not aimed at children under 18. We do not knowingly collect personal information from children without the consent of a parent or guardian.</p>`],
      ['regulator', 'The Information Regulator', `<p>If you believe we have not handled your personal information properly, please contact us first. You also have the right to complain to the Information Regulator (South Africa): <a href="https://inforegulator.org.za" target="_blank" rel="noopener">inforegulator.org.za</a>, email POPIAComplaints@inforegulator.org.za.</p>`],
      ['changes', 'Changes to this policy', `<p>We may update this policy. The date at the top of this page shows when it last changed.</p>`],
    ],
  },

  shipping: {
    intro: `We deliver fresh, NIHT certified halaal meat from our Benoni and Lenasia branches to the areas listed below, or you can collect your order from either branch for free. This policy explains where we deliver, what it costs and how it works.`,
    sections: [
      ['areas', 'Where we deliver and what it costs', `<p>Delivery is <b>free on orders of ${fee(DELIVERY.freeThreshold)} or more</b> (product total, before any Rewards discount), and on every order for Iqbal’s Rewards Gold members. Below that, the fee depends on your area:</p>${zoneTable()}<p>Each area is delivered by the branch shown. You can check your address and see the fee on our <a href="#/delivery">delivery areas</a> page.</p><p><b>Areas not listed:</b> checkout charges a standard fee of ${fee(DELIVERY.fee)} for an address outside the listed areas. The branch will contact you to confirm whether it can deliver there. If it cannot, you may change to collection or cancel for a full refund.</p>`],
      ['when', 'Delivery days and time slots', `<p>Orders can be delivered from the next day onwards. You choose the date and a two-hour time slot at checkout. Slots are only offered when the branch is open, so the slots differ by branch:</p>${slotTable()}<p>The Weekly Box is delivered on the day you choose: ${DELIVERY.boxDays.join(', ').replace(/, ([^,]*)$/, ' or $1')}. Its weekly price includes delivery.</p><p>Public holidays and Eid may change delivery days. We announce changes on our Instagram page (${BUSINESS.instagramHandle}) and will contact you if your slot is affected.</p>`],
      ['cold', 'Keeping your meat cold', `<p>Meat is packed chilled at the branch shortly before it leaves. Vacuum packing is available on request in the Cut Studio and in the order notes. Please be home during your slot and put your meat in the fridge or freezer as soon as it arrives.</p>`],
      ['receiving', 'Receiving your order', `<ul><li>Someone aged 18 or older must be at the address to receive the order. Cash-on-delivery orders must be paid in full when the order arrives.</li><li>Please check your order when it arrives. If anything is missing, damaged or not what you ordered, tell the driver or contact the branch the same day (see our <a href="#/returns">Returns &amp; Refund Policy</a>).</li><li>If we are running late, the branch will let you know by phone or WhatsApp.</li></ul>`],
      ['missed', 'If nobody is home', `<p>The driver will call the cell number on your order. If we cannot reach you, we return the order to the branch, because fresh meat cannot be left unattended. You can then collect it from the branch before closing time on that day, or ask us to deliver it again on another day; a repeat delivery is charged at the delivery fee for your area. Because the meat is perishable, an order that is not collected or rebooked by closing time on the next trading day cannot be refunded.</p>`],
      ['collect', 'Collecting in store', `<ul><li>Collection is free from either branch. Choose the branch, date and time slot at checkout.</li><li>Please bring your order number (shown on screen and in your order confirmation). Orders are packed and kept in our cold room until you arrive.</li><li>Collection is only possible during trading hours. Lenasia closes for lunch and prayer from 1 PM to 2 PM daily and from 12 PM to 2 PM on Fridays.</li></ul>`],
      ['changes', 'Changing or cancelling a delivery', `<p>You can change the date, slot or address, or cancel your order free of charge, until 12:00 (noon) on the day before your delivery date. Contact the branch that is preparing your order by phone or WhatsApp.</p>${contactBlock()}`],
    ],
  },

  returns: {
    intro: `We want you to be happy with every cut. Because fresh meat is perishable, this policy explains how returns, replacements and refunds work for food, and what to do if something is wrong. It does not limit your rights under the Consumer Protection Act.`,
    sections: [
      ['check', 'Check your order when it arrives', `<p>Please check your order when it is delivered or when you collect it, and keep fresh meat in the fridge or freezer. If something is wrong, contact the branch <b>on the same day</b>, and no later than 24 hours after delivery or collection, with your order number and a photo of the product and its label. Reporting quickly lets us investigate while the product is still fresh. It does not take away your legal rights if a problem only becomes clear later.</p>`],
      ['qualify', 'When we replace or refund', `<p>You are entitled to a replacement or a full refund, at your choice, if:</p><ul><li>a product is spoilt, off or unsafe when it reaches you;</li><li>you received the wrong product, the wrong cut or the wrong preparation (for example, cubes instead of steaks);</li><li>an item is missing from your order;</li><li>the weight is more than 5% below the weight you ordered, in which case we refund the difference for that item;</li><li>packaging was damaged in a way that affects the product.</li></ul><p>These rights come from sections 55 and 56 of the CPA, which give you the right to goods of good quality, in good working order and free of defects. For defective goods, you may choose a replacement or a refund.</p>`],
      ['not', 'When we cannot accept a return', `<ul><li><b>Change of mind on fresh meat:</b> for food safety reasons we cannot take back fresh, chilled or frozen meat, deli products or bakery items that were in good condition when they reached you. Section 42 of ECTA excludes foodstuffs for everyday consumption delivered to your home or work from the 7-day cooling-off period in section 44.</li><li><b>Custom cuts:</b> meat cut, trimmed, marinated or packed to your instructions (Cut Studio and cut-to-order) cannot be returned unless it is defective or not what you asked for.</li><li><b>Products that were frozen, cooked, thawed and refrozen, or not stored correctly</b> after delivery or collection.</li><li><b>Natural variation:</b> differences in marbling, fat cover, shape or bone that are normal for hand-cut meat.</li></ul>`],
      ['spices', 'Spices and sealed pantry items', `<p>Sealed, shelf-stable products such as spices and sauces may be returned unopened, in their original packaging, within 7 days of delivery or collection, for an exchange or refund. Opened products can only be returned if they are defective.</p>`],
      ['cancel', 'Cancelling an order', `<ul><li>You can cancel any order free of charge until 12:00 (noon) on the day before your delivery or collection date, and we refund what you paid in full.</li><li>After that time, we can only cancel items we have not yet cut or prepared. Custom-cut items that are already prepared cannot be cancelled.</li><li>Weekly Box: pause, skip or cancel in My Butcher before 12:00 (noon) on the day before delivery.</li><li>Qurbani: see the deposit and cancellation rules in our <a href="#/terms">Terms &amp; Conditions</a>.</li></ul>`],
      ['how', 'How refunds are paid', `<ul><li><b>Card</b> payments are refunded to the same card through PayFast or Yoco. We process the refund within 7 days of approving it; your bank may take a further few business days to show it.</li><li><b>Instant EFT</b> payments are refunded by EFT to the account you paid from, within 7 days of approval.</li><li><b>Cash</b> payments are refunded in cash at the branch, or by EFT if you prefer.</li><li>Rewards points used on a refunded order are returned to your account.</li><li>If we refund your whole order because of our mistake, we also refund the delivery fee.</li></ul><p>Where it is more convenient for you, we can also replace the product on your next order or give you store credit, but only if you choose that.</p>`],
      ['contact', 'How to report a problem', `<p>Contact the branch that prepared your order by phone or WhatsApp, with your order number and a photo. You can also use our <a href="#/contact">contact page</a>.</p>${contactBlock()}<p>If we cannot resolve your complaint, you may approach the Consumer Goods and Services Ombud (CGSO) or the National Consumer Commission.</p>`],
    ],
  },
};

/* ---------- render ---------- */
export function render(params) {
  const slug = params.slug;
  const pol = POLICIES.find((p) => p.slug === slug) || POLICIES[0];
  const c = CONTENT[pol.slug];
  return `
  <section class="page-hero legal-hero" data-theme="light">
    <div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><span>${pol.short}</span></nav>
      <h1 class="h-xl">${pol.title}</h1>
      <p class="legal__meta">Last updated ${updatedLabel} · Applies to ${NAME}, Benoni and Lenasia</p>
      <nav class="legal__tabs" aria-label="Policies">${POLICIES.map((p) => `<a href="#/${p.slug}" ${p.slug === pol.slug ? 'aria-current="page" class="is-on"' : ''}>${p.short}</a>`).join('')}</nav>
    </div>
  </section>
  <div class="wrap legal" data-theme="light">
    <aside class="legal__toc" aria-label="On this page">
      <span class="label">On this page</span>
      <ol>${c.sections.map(([id, h]) => `<li><button type="button" data-toc="${id}">${h}</button></li>`).join('')}</ol>
      <button type="button" class="btn btn--sm btn--ghost legal__print" data-print>${ICON.check} Print or save as PDF</button>
    </aside>
    <article class="legal__body">
      <p class="legal__intro">${c.intro}</p>
      ${c.sections.map(([id, h, body], i) => `<section class="legal__sec" id="lg-${id}"><h2><span>${String(i + 1).padStart(2, '0')}</span>${h}</h2>${body}</section>`).join('')}
      <div class="legal__more"><span class="label">Other policies</span><div>${POLICIES.filter((p) => p.slug !== pol.slug).map((p) => `<a class="legal__card" href="#/${p.slug}"><b>${p.short}</b>${ICON.arrow}</a>`).join('')}</div></div>
    </article>
  </div>`;
}

export function mount(root) {
  const btns = $$('[data-toc]', root);
  btns.forEach((b) => b.addEventListener('click', () => scrollTo('#lg-' + b.dataset.toc)));
  $('[data-print]', root)?.addEventListener('click', () => window.print());
  const secs = $$('.legal__sec', root);
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      btns.forEach((b) => b.classList.toggle('is-on', 'lg-' + b.dataset.toc === e.target.id));
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  secs.forEach((s) => io.observe(s));
  return () => io.disconnect();
}
