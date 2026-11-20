/* =====================================================================
   FEATURE DATA · stock levels, meal planner, Qurbani, functions
   Everything here can also be changed live from the Admin page (#/admin).
   ===================================================================== */
import { IMG } from '../config/site.js';

/* Starting stock per branch: 'in' | 'low' | 'out' (anything not listed is in stock). */
export const DEFAULT_STOCK = {
  tomahawk: { benoni: 'low', lenasia: 'out' },
  'lamb-rack': { benoni: 'in', lenasia: 'out' },
  oxtail: { benoni: 'low', lenasia: 'low' },
  fillet: { benoni: 'in', lenasia: 'low' },
  'beef-bacon': { benoni: 'out', lenasia: 'in' },
  'chicken-pizza': { benoni: 'low', lenasia: 'in' },
};

/* Weekly meal planner: grams (kg) or quantity per person, per dinner. */
export const MEALS = [
  { id: 'mince-curry', name: 'Mince curry & rice', img: IMG.curry, per: [['beef-mince', 0.15, 'As is'], ['basmati', 0.04]] },
  { id: 'peri-chicken', name: 'Peri-peri chicken', img: IMG.tandoori, per: [['whole-chicken', 0.35, 'Marinated · Peri-Peri']] },
  { id: 'steak-night', name: 'Steak night', img: IMG.seared, per: [['rump', 0.25, 'Steaks (2 cm)']] },
  { id: 'lamb-chops', name: 'Lamb chops & veg', img: IMG.lamb, per: [['lamb-loin-chops', 0.25, 'Chops']] },
  { id: 'tikka-wraps', name: 'Chicken tikka wraps', img: IMG.tikkaMasala, per: [['tikka-strips', 0.15, 'Mild tikka'], ['naan', 0.25]] },
  { id: 'wors-pap', name: 'Boerewors & pap', img: IMG.wors, per: [['boerewors', 0.2, 'Coiled']] },
  { id: 'beef-stew', name: 'Beef stew', img: IMG.marbled, per: [['beef-cubes', 0.2, 'Cubed']] },
  { id: 'mutton-curry', name: 'Mutton curry & rotis', img: IMG.rotiCurry, per: [['mutton-curry', 0.22, 'Curry pieces'], ['rotis', 0.2]] },
  { id: 'biryani', name: 'Chicken biryani', img: IMG.biryani, per: [['whole-chicken', 0.3, 'Washed & cut (curry pieces)'], ['basmati', 0.05], ['biryani-mix', 0.12]] },
  { id: 'kebabs', name: 'Seekh kebabs', img: IMG.grilledPlatter, per: [['lamb-mince', 0.17, 'Double minced'], ['naan', 0.25]] },
];
export const WEEKDAYS = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday'];

/* Eid al-Adha Qurbani options (live animal price incl. slaughter, cleaning & cutting). */
export const QURBANI = [
  { id: 'sheep', name: 'Sheep', note: '1 share · ±18–22 kg meat', price: 4200, deposit: 1000, img: IMG.lamb },
  { id: 'goat', name: 'Goat', note: '1 share · ±14–18 kg meat', price: 3900, deposit: 1000, img: IMG.butcherScale },
  { id: 'cow-share', name: 'Cow · 1/7 share', note: '1 of 7 shares · ±25–30 kg meat', price: 5600, deposit: 1500, img: IMG.marbled },
  { id: 'cow-full', name: 'Whole cow', note: '7 shares · ±180–210 kg meat', price: 37500, deposit: 8000, img: IMG.shortRib },
];
export const QURBANI_PREP = ['Curry pieces', 'Mixed (curry, mince & chops)', 'Leave whole', 'Biryani cut', 'Distribute to the needy on my behalf'];

/* Functions & catering calculator (raw kg per guest by menu). */
export const FUNCTION_MENUS = [
  { id: 'braai', name: 'Braai', img: IMG.braaiGrill, mix: [['boerewors', 0.15], ['lamb-loin-chops', 0.12], ['chicken-thighs', 0.15], ['rump', 0.1]] },
  { id: 'curry', name: 'Curry & rice', img: IMG.curry, mix: [['mutton-curry', 0.15], ['beef-curry', 0.1], ['basmati', 0.03], ['rotis', 0.2]] },
  { id: 'biryani', name: 'Biryani', img: IMG.biryani, mix: [['mutton-curry', 0.2], ['basmati', 0.05], ['biryani-mix', 0.05]] },
  { id: 'mixed', name: 'Mixed buffet', img: IMG.assortment, mix: [['whole-chicken', 0.18], ['beef-mince', 0.08], ['lamb-loin-chops', 0.08], ['mince-samosas', 0.08]] },
];
export const EVENT_TYPES = ['Wedding / Walima', 'Family braai', 'Jumu’ah / Madrasah lunch', 'Corporate event', 'Birthday', 'Aqiqah', 'Other'];
