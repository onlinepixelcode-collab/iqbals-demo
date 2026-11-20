/* Braai Builder maths, shared by the home page builder and the chat. */
import { productById, linePrice } from '../data/products.js';
import { addToCart } from './store.js';

export const APPETITES = [
  { id: 'light', label: 'Light eaters', grams: 300 },
  { id: 'hungry', label: 'Hungry', grams: 450 },
  { id: 'saturday', label: 'Saturday-braai hungry', grams: 600 },
];

export const BRAAI_MEATS = [
  { id: 'boerewors', label: 'Boerewors', share: 1.2, prep: 'Coiled' },
  { id: 'lamb-loin-chops', label: 'Lamb chops', share: 1, prep: 'Chops' },
  { id: 'rump', label: 'Rump steak', share: 1, prep: 'Steaks (2 cm)' },
  { id: 'chicken-thighs', label: 'Chicken thighs', share: 0.9, prep: 'Marinated · Peri-Peri' },
  { id: 'wings', label: 'Chicken wings', share: 0.6, prep: 'Marinated · Peri-Peri' },
  { id: 'ribeye', label: 'Ribeye', share: 0.8, prep: 'Steaks (3 cm)' },
];

const round = (kg) => Math.max(0.5, Math.round(kg * 4) / 4);

/** Returns [{ meat, product, kg, price }] and the total. */
export function calcBraai(guests, appetiteId, meatIds) {
  const ap = APPETITES.find((a) => a.id === appetiteId) || APPETITES[1];
  const meats = BRAAI_MEATS.filter((m) => meatIds.includes(m.id));
  if (!meats.length || guests < 1) return { lines: [], total: 0, kg: 0 };
  const totalKg = (guests * ap.grams) / 1000;
  const shares = meats.reduce((s, m) => s + m.share, 0);
  const lines = meats.map((m) => {
    const product = productById(m.id);
    const kg = round((totalKg * m.share) / shares);
    return { meat: m, product, kg, price: linePrice(product, kg) };
  });
  return { lines, total: lines.reduce((s, l) => s + l.price, 0), kg: lines.reduce((s, l) => s + l.kg, 0) };
}

export function addBraaiToCart(result) {
  result.lines.forEach((l) => addToCart(l.product.id, { weight: l.kg, prep: l.meat.prep, notes: 'Braai Builder' }));
  return result.lines.length;
}
