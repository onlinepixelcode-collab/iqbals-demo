/* =====================================================================
   STORE · cart, wishlist, users, orders, weekly boxes
   Everything persists in localStorage (demo back end).
   ===================================================================== */
import { productById, linePrice, PRODUCTS } from '../data/products.js';
import { DELIVERY, BRANCHES, REWARDS, findZone } from '../config/site.js';
import { DEFAULT_STOCK } from '../data/features.js';

const KEY = 'iqbals.v1';
const listeners = new Set();

const blank = () => ({
  cart: [], // { key, id, weight, prep, notes, qty }
  wishlist: [],
  users: [], // { id, name, email, cell, passHash, address, addresses[], branch }
  session: null, // user id
  orders: [], // see placeOrder()
  boxes: [], // weekly subscriptions
  requests: [], // cut-to-order requests
  newsletter: [],
  branch: 'benoni', // branch the customer is shopping at (stock + collection)
  overrides: { products: {}, stock: {}, hours: {} }, // edits made on the Admin page
  alerts: [], // { id, user, created } special / back-in-stock alerts
  redemptions: [], // { user, points, created, order }
  games: [], // { user, score, points, created }
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...blank(), ...JSON.parse(raw) } : blank();
  } catch {
    return blank();
  }
}

export const state = load();

/* ---------------- ADMIN OVERRIDES (prices, specials, hours) ---------------- */
const BASE = new Map(PRODUCTS.map((p) => [p.id, { price: p.price, special: p.special ? { ...p.special } : null }]));
const BASE_HOURS = new Map(BRANCHES.map((b) => [b.id, JSON.parse(JSON.stringify(b.hours))]));
export function applyOverrides() {
  PRODUCTS.forEach((p) => {
    const base = BASE.get(p.id), o = state.overrides.products[p.id] || {};
    p.price = o.price ?? base.price;
    const sp = 'special' in o ? o.special : base.special?.price ?? null;
    if (sp) p.special = { price: sp }; else delete p.special;
  });
  BRANCHES.forEach((b) => { b.hours = state.overrides.hours[b.id] || JSON.parse(JSON.stringify(BASE_HOURS.get(b.id))); });
}
applyOverrides();
export function setProductOverride(id, patch) {
  state.overrides.products[id] = { ...(state.overrides.products[id] || {}), ...patch };
  applyOverrides();
  save();
}
export function setStock(id, branch, level) {
  state.overrides.stock[id] = { ...(state.overrides.stock[id] || {}), [branch]: level };
  save();
}
export function setHours(branchId, hours) {
  state.overrides.hours[branchId] = hours;
  applyOverrides();
  save();
}
export function resetOverrides() {
  state.overrides = { products: {}, stock: {}, hours: {} };
  applyOverrides();
  save();
}

/* ---------------- STOCK & BRANCH ---------------- */
export const stockOf = (id, branch = state.branch) => state.overrides.stock[id]?.[branch] ?? DEFAULT_STOCK[id]?.[branch] ?? 'in';
export function setBranch(b) {
  state.branch = b;
  save();
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
  listeners.forEach((fn) => fn(state));
}

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/* ---------------- CART ---------------- */
const lineKey = (id, weight, prep, notes) => [id, weight, prep || '', notes || ''].join('|');

export function addToCart(id, { weight = 1, prep = '', notes = '', qty = 1 } = {}) {
  const p = productById(id);
  if (!p || stockOf(id) === 'out') return null;
  const w = p.unit === 'kg' ? Number(weight) : 1;
  const key = lineKey(id, w, prep, notes);
  const existing = state.cart.find((l) => l.key === key);
  if (existing) existing.qty += qty;
  else state.cart.push({ key, id, weight: w, prep, notes, qty });
  save();
  return p;
}

export function setQty(key, qty) {
  const line = state.cart.find((l) => l.key === key);
  if (!line) return;
  line.qty = Math.max(0, qty);
  if (line.qty === 0) state.cart = state.cart.filter((l) => l.key !== key);
  save();
}

export const removeLine = (key) => setQty(key, 0);
export function clearCart() {
  state.cart = [];
  save();
}

export function cartLines() {
  return state.cart
    .map((l) => {
      const p = productById(l.id);
      if (!p) return null;
      return { ...l, product: p, total: linePrice(p, l.weight) * l.qty };
    })
    .filter(Boolean);
}

export const cartCount = () => state.cart.reduce((n, l) => n + l.qty, 0);
export const cartSubtotal = () => cartLines().reduce((s, l) => s + l.total, 0);
export function deliveryFee(subtotal = cartSubtotal(), method = 'delivery', area = '') {
  if (method !== 'delivery' || subtotal === 0) return 0;
  if (subtotal >= DELIVERY.freeThreshold) return 0;
  if (state.session && tierFor(pointsEarnedTotal()).name === 'Gold') return 0;
  const z = findZone(area || currentUser()?.address || '');
  return z ? z.fee : DELIVERY.fee;
}

/* ---------------- WISHLIST ---------------- */
export function toggleWish(id) {
  const i = state.wishlist.indexOf(id);
  if (i >= 0) state.wishlist.splice(i, 1);
  else state.wishlist.push(id);
  save();
  return i < 0;
}
export const isWished = (id) => state.wishlist.includes(id);

/* ---------------- AUTH (demo) ---------------- */
async function hash(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('iqbals:' + text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // crypto.subtle needs a secure context; fall back to a simple hash
    let h = 0;
    for (const c of 'iqbals:' + text) h = (h * 31 + c.charCodeAt(0)) | 0;
    return 'x' + h;
  }
}

export const currentUser = () => state.users.find((u) => u.id === state.session) || null;

export async function register({ name, email, cell, password, address, branch }) {
  email = email.trim().toLowerCase();
  if (state.users.some((u) => u.email === email)) throw new Error('An account with this email already exists. Try signing in.');
  const user = {
    id: 'u' + Date.now().toString(36),
    name: name.trim(),
    email,
    cell: cell.trim(),
    passHash: await hash(password),
    address: address.trim(),
    addresses: address.trim() ? [address.trim()] : [],
    branch,
    created: Date.now(),
  };
  state.users.push(user);
  state.session = user.id;
  state.alerts.forEach((a) => a.user === 'guest' && (a.user = user.id)); // keep alerts set before signing in
  save();
  return user;
}

export async function login(email, password) {
  const user = state.users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.passHash !== (await hash(password))) throw new Error('That email and password don’t match. Please try again.');
  state.session = user.id;
  state.alerts.forEach((a) => a.user === 'guest' && (a.user = user.id)); // keep alerts set before signing in
  save();
  return user;
}

export function logout() {
  state.session = null;
  save();
}

export function updateUser(patch) {
  const u = currentUser();
  if (!u) return;
  Object.assign(u, patch);
  save();
}

/* ---------------- ORDERS ---------------- */
export const ORDER_STEPS = ['Received', 'Being Cut', 'Packed', 'Out for Delivery', 'Delivered'];
export const COLLECT_STEPS = ['Received', 'Being Cut', 'Packed', 'Ready for Collection', 'Collected'];

export function placeOrder(details) {
  const lines = cartLines();
  const subtotal = cartSubtotal();
  const fee = deliveryFee(subtotal, details.method, details.address);
  const pointsUsed = Math.min(details.pointsUsed || 0, pointsBalance());
  const discount = Math.round(pointsUsed * REWARDS.pointValue * 100) / 100;
  const order = {
    id: 'IQ' + Math.floor(100000 + Math.random() * 899999),
    created: Date.now(),
    user: state.session,
    lines: lines.map(({ id, weight, prep, notes, qty, total, product }) => ({ id, weight, prep, notes, qty, total, name: product.name, unit: product.unit })),
    subtotal,
    fee,
    ...details,
    pointsUsed,
    discount,
    total: subtotal + fee - discount,
    pointsEarned: state.session ? Math.floor((subtotal - discount) * REWARDS.perRand) : 0,
  };
  state.orders.unshift(order);
  state.cart = [];
  save();
  return order;
}

/** Demo status: each order moves one step forward every 90 seconds. */
export function orderStatus(order) {
  const steps = order.method === 'collect' ? COLLECT_STEPS : ORDER_STEPS;
  const idx = order.statusIdx != null ? order.statusIdx : Math.min(steps.length - 1, Math.floor((Date.now() - order.created) / 90000));
  return { steps, idx };
}

export const userOrders = () => state.orders.filter((o) => o.user && o.user === state.session);
export const findOrder = (id) => state.orders.find((o) => o.id === id);

export function reorder(orderId) {
  const o = findOrder(orderId);
  if (!o) return 0;
  o.lines.forEach((l) => addToCart(l.id, { weight: l.weight, prep: l.prep, notes: l.notes, qty: l.qty }));
  return o.lines.length;
}

/* ---------------- WEEKLY BOXES ---------------- */
export function createBox(box) {
  const sub = { id: 'WB' + Math.floor(1000 + Math.random() * 8999), user: state.session, status: 'active', skips: [], created: Date.now(), ...box };
  state.boxes.unshift(sub);
  save();
  return sub;
}
export const userBoxes = () => state.boxes.filter((b) => b.user === state.session);
export function updateBox(id, patch) {
  const b = state.boxes.find((x) => x.id === id);
  if (b) Object.assign(b, patch);
  save();
  return b;
}

/* ---------------- MISC ---------------- */
export function saveRequest(req) {
  const r = { id: 'CR' + Math.floor(1000 + Math.random() * 8999), created: Date.now(), ...req };
  state.requests.unshift(r);
  save();
  return r;
}
export function subscribeNewsletter(email) {
  if (!state.newsletter.includes(email)) state.newsletter.push(email);
  save();
}

/* ---------------- ADMIN: order status ---------------- */
export function setOrderStatus(id, idx) {
  const o = findOrder(id);
  if (o) o.statusIdx = idx;
  save();
}

/* ---------------- REWARDS ---------------- */
export function pointsEarnedTotal(user = state.session) {
  if (!user) return 0;
  return state.orders.filter((o) => o.user === user).reduce((s, o) => s + (o.pointsEarned || 0), 0) +
    state.games.filter((g) => g.user === user).reduce((s, g) => s + g.points, 0);
}
export function pointsBalance(user = state.session) {
  if (!user) return 0;
  const used = state.orders.filter((o) => o.user === user).reduce((s, o) => s + (o.pointsUsed || 0), 0);
  return Math.max(0, pointsEarnedTotal(user) - used);
}
export const tierFor = (lifetime) => [...REWARDS.tiers].reverse().find((t) => lifetime >= t.min) || REWARDS.tiers[0];
export const pointsHistory = (user = state.session) => [
  ...state.orders.filter((o) => o.user === user).flatMap((o) => [
    o.pointsEarned ? { created: o.created, label: 'Order #' + o.id, points: o.pointsEarned } : null,
    o.pointsUsed ? { created: o.created, label: 'Redeemed on #' + o.id, points: -o.pointsUsed } : null,
  ]),
  ...state.games.filter((g) => g.user === user).map((g) => ({ created: g.created, label: 'Braai Master game · ' + g.score + ' pts score', points: g.points })),
].filter(Boolean).sort((a, b) => b.created - a.created);

/* ---------------- ALERTS (special / back in stock) ---------------- */
export const hasAlert = (id) => state.alerts.some((a) => a.id === id && a.user === (state.session || 'guest'));
export function toggleAlert(id) {
  const user = state.session || 'guest';
  const i = state.alerts.findIndex((a) => a.id === id && a.user === user);
  if (i >= 0) state.alerts.splice(i, 1);
  else state.alerts.push({ id, user, created: Date.now() });
  save();
  return i < 0;
}
export const myAlerts = () => state.alerts.filter((a) => a.user === (state.session || 'guest'));

/* ---------------- GAME ---------------- */
/** Records a Flying Steak score. Signed-in players earn points (5 per score point),
    capped per day at REWARDS.gameMax; only the improvement on today's best is paid out. */
export function addGameScore(score) {
  const user = state.session;
  const today = new Date().toDateString();
  const todays = state.games.filter((g) => g.user === (user || 'guest') && new Date(g.created).toDateString() === today);
  const paid = todays.reduce((s, g) => s + g.points, 0);
  const points = user ? Math.max(0, Math.min(REWARDS.gameMax, score * 5) - paid) : 0;
  state.games.push({ user: user || 'guest', score, points, created: Date.now() });
  save();
  return points;
}
export const gameBest = () => state.games.filter((g) => g.user === (state.session || 'guest')).reduce((m, g) => Math.max(m, g.score), 0);
export const gameTop = () => [...state.games].filter((g) => g.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map((g) => ({ ...g, name: g.user === 'guest' ? 'Guest' : state.users.find((u) => u.id === g.user)?.name.split(' ')[0] || 'Player' }));
