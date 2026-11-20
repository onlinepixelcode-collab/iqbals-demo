/* =====================================================================
   STORE · cart, wishlist, users, orders, weekly boxes
   Everything persists in localStorage (demo back end).
   ===================================================================== */
import { productById, linePrice } from '../data/products.js';
import { DELIVERY } from '../config/site.js';

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
  if (!p) return null;
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
export function deliveryFee(subtotal = cartSubtotal(), method = 'delivery') {
  if (method !== 'delivery' || subtotal === 0) return 0;
  return subtotal >= DELIVERY.freeThreshold ? 0 : DELIVERY.fee;
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
  save();
  return user;
}

export async function login(email, password) {
  const user = state.users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.passHash !== (await hash(password))) throw new Error('That email and password don’t match. Please try again.');
  state.session = user.id;
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
  const fee = deliveryFee(subtotal, details.method);
  const order = {
    id: 'IQ' + Math.floor(100000 + Math.random() * 899999),
    created: Date.now(),
    user: state.session,
    lines: lines.map(({ id, weight, prep, notes, qty, total, product }) => ({ id, weight, prep, notes, qty, total, name: product.name, unit: product.unit })),
    subtotal,
    fee,
    total: subtotal + fee,
    ...details,
  };
  state.orders.unshift(order);
  state.cart = [];
  save();
  return order;
}

/** Demo status: each order moves one step forward every 90 seconds. */
export function orderStatus(order) {
  const steps = order.method === 'collect' ? COLLECT_STEPS : ORDER_STEPS;
  const idx = Math.min(steps.length - 1, Math.floor((Date.now() - order.created) / 90000));
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
