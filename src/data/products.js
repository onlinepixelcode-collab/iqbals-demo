/* =====================================================================
   PRODUCTS · edit prices, names and photos here
   ---------------------------------------------------------------------
   unit: 'kg'   → `price` is per kg, customer picks a weight
         'each' → `price` is per item/pack, customer picks a quantity
   special: { price } → shows on the Crazy Specials board (was = price)
   All products are NIHT certified halaal.
   ===================================================================== */
import { IMG } from '../config/site.js';

export const CATEGORIES = [
  { id: 'beef', name: 'Beef', blurb: 'Grain-finished, aged and hand-cut', img: IMG.marbled },
  { id: 'lamb', name: 'Lamb & Mutton', blurb: 'Karoo-style lamb and rich mutton', img: IMG.lamb },
  { id: 'chicken', name: 'Chicken', blurb: 'Washed and cut to order', img: IMG.chickenBoard },
  { id: 'wors', name: 'Wors & Sausages', blurb: 'House recipe boerewors', img: IMG.wors },
  { id: 'braai', name: 'Braai Packs', blurb: 'Everything for the fire', img: IMG.braaiTongs },
  { id: 'deli', name: 'Deli', blurb: 'Biltong, cold meats and smoked goods', img: IMG.assortment },
  { id: 'bakery', name: 'Bakery & Rotis', blurb: 'The East Rand’s favourite rotis', img: IMG.roti },
  { id: 'spices', name: 'Marinades & Spices', blurb: 'Masalas, rubs and sauces', img: IMG.spiceBowls },
];

const P = {
  beef: ['Whole', 'Steaks (2 cm)', 'Thin cut', 'Cubed', 'Curry pieces', 'Minced', 'Strips', 'Marinated · Garlic & Herb', 'Marinated · Peri-Peri'],
  steak: ['Whole', 'Steaks (2 cm)', 'Steaks (3 cm)', 'Thin cut', 'Strips', 'Marinated · Garlic & Herb', 'Marinated · Peri-Peri'],
  lamb: ['Whole', 'Chops', 'Curry pieces', 'Cubed', 'Minced', 'Marinated · Lemon & Herb'],
  chicken: ['Whole', 'Washed & cut (8 pcs)', 'Washed & cut (curry pieces)', 'Skinless', 'Marinated · Peri-Peri', 'Marinated · Tikka', 'Marinated · Lemon & Herb'],
  fillet: ['As is', 'Cubed', 'Strips', 'Marinated · Peri-Peri', 'Marinated · Tikka'],
  wors: ['As is', 'Cut in 15 cm pieces', 'Coiled'],
  mince: ['As is', 'Extra lean', 'Double minced'],
};
const KG = [0.5, 1, 2, 5];
const KGS = [0.5, 1, 1.5, 2, 3];

export const PRODUCTS = [
  /* ---------------- BEEF ---------------- */
  { id: 'ribeye', name: 'Ribeye Steak', category: 'beef', cut: 'Rib · aged 21 days', unit: 'kg', price: 229, weights: KGS, preps: P.steak, img: IMG.ribeye, gallery: [IMG.steakPaper, IMG.seared], desc: 'Heavily marbled, rich and buttery. Our butchers age it for 21 days and cut it to your thickness.', best: 'Braai, pan-sear', recipe: 'braai-chops', tags: ['popular'], special: { price: 199 } },
  { id: 'tomahawk', name: 'Tomahawk Steak', category: 'beef', cut: 'Rib · bone-in, French trimmed', unit: 'kg', price: 249, weights: [1, 1.5, 2, 3], preps: ['Whole', 'Marinated · Garlic & Herb'], img: IMG.tomahawk, gallery: [IMG.marbled, IMG.seared], desc: 'The showpiece. A thick, bone-in ribeye with a long Frenched bone. Reverse sear it and let it rest.', best: 'Reverse sear, braai', recipe: 'braai-chops', tags: ['premium'] },
  { id: 'rump', name: 'Rump Steak', category: 'beef', cut: 'Rump · matured', unit: 'kg', price: 189, weights: KGS, preps: P.steak, img: IMG.sirloin, gallery: [IMG.steaksBoard, IMG.rawKnife], desc: 'South Africa’s favourite braai steak. Full of flavour with a firm bite and a fat cap that crisps on the coals.', best: 'Braai, grill', recipe: 'braai-chops', tags: ['popular'] },
  { id: 'sirloin', name: 'Sirloin Steak', category: 'beef', cut: 'Short loin · fat cap on', unit: 'kg', price: 179, weights: KGS, preps: P.steak, img: IMG.steaksBoard, gallery: [IMG.sirloin, IMG.twoSteaks], desc: 'Tender and juicy with a strip of fat along the edge. Score the fat and render it first.', best: 'Pan-sear, braai', tags: [] },
  { id: 'tbone', name: 'T-Bone Steak', category: 'beef', cut: 'Short loin · bone-in', unit: 'kg', price: 165, weights: KGS, preps: ['Whole', 'Steaks (2 cm)', 'Steaks (3 cm)', 'Marinated · Garlic & Herb'], img: IMG.twoSteaks, gallery: [IMG.steaksBoard], desc: 'Two steaks in one: sirloin on one side of the bone, fillet on the other.', best: 'Braai', tags: [] },
  { id: 'fillet', name: 'Beef Fillet', category: 'beef', cut: 'Tenderloin · whole or medallions', unit: 'kg', price: 329, weights: [0.5, 1, 1.5, 2], preps: ['Whole', 'Medallions', 'Strips', 'Marinated · Garlic & Herb'], img: IMG.fillet, gallery: [IMG.rawWood], desc: 'The most tender cut on the animal. Lean, mild and elegant. Perfect for special occasions.', best: 'Roast, pan-sear', tags: ['premium'] },
  { id: 'beef-mince', name: 'Lean Beef Mince', category: 'beef', cut: 'Topside & chuck blend', unit: 'kg', price: 129, weights: KG, preps: P.mince, img: IMG.rawKnife, gallery: [IMG.assortment], desc: 'Minced fresh every morning from topside and chuck. Great for kebabs, samoosas, mince curry and burgers.', best: 'Kebabs, curry, burgers', recipe: 'kebabs', tags: ['popular'], special: { price: 109 } },
  { id: 'beef-curry', name: 'Beef Curry Pieces', category: 'beef', cut: 'Chuck & shin · bone-in', unit: 'kg', price: 119, weights: KG, preps: ['Curry pieces', 'Cubed (boneless)', 'Large pieces'], img: IMG.rawWood, gallery: [IMG.marbled], desc: 'Bone-in pieces with gelatin and marrow that slow-cook into a thick, rich gravy.', best: 'Curry, stew, potjie', recipe: 'mutton-curry', tags: [] },
  { id: 'brisket', name: 'Beef Brisket', category: 'beef', cut: 'Brisket · point & flat', unit: 'kg', price: 125, weights: [1, 2, 3, 5], preps: ['Whole', 'Cubed', 'Marinated · Garlic & Herb'], img: IMG.marbled, gallery: [IMG.shortRib], desc: 'Low and slow is the rule. Smoke it, braise it or slow-roast it until it pulls apart.', best: 'Slow roast, smoke', tags: [] },
  { id: 'short-rib', name: 'Beef Short Rib', category: 'beef', cut: 'Plate · bone-in', unit: 'kg', price: 149, weights: [1, 2, 3], preps: ['Whole', 'Flanken cut (thin)', 'Marinated · Peri-Peri'], img: IMG.shortRib, gallery: [IMG.marbled], desc: 'Rich, beefy and meaty. Braise it for hours or ask for a thin flanken cut for the braai.', best: 'Braise, braai (thin)', tags: [] },
  { id: 'topside', name: 'Topside Roast', category: 'beef', cut: 'Round · lean', unit: 'kg', price: 139, weights: [1, 1.5, 2, 3], preps: ['Whole', 'Cubed', 'Thin cut', 'Strips'], img: IMG.steakPaper, gallery: [IMG.rawWood], desc: 'A lean roasting joint that also cubes beautifully for biryani and stir-fry.', best: 'Roast, biryani, stir-fry', tags: [] },
  { id: 'oxtail', name: 'Oxtail', category: 'beef', cut: 'Tail · cut in rounds', unit: 'kg', price: 199, weights: [1, 2, 3], preps: ['Cut in rounds'], img: IMG.rawWood, gallery: [IMG.shortRib], desc: 'Deep, rich and gelatinous. The heart of a proper Sunday potjie.', best: 'Potjie, braise', tags: [] },
  { id: 'beef-cubes', name: 'Beef Stew Cubes', category: 'beef', cut: 'Chuck · boneless', unit: 'kg', price: 129, weights: KG, preps: ['Cubed', 'Large cubes'], img: IMG.marbled, gallery: [IMG.rawKnife], desc: 'Boneless chuck cubed for stews, pies and slow-cooker meals.', best: 'Stew, pie', tags: [] },

  /* ---------------- LAMB & MUTTON ---------------- */
  { id: 'lamb-loin-chops', name: 'Lamb Loin Chops', category: 'lamb', cut: 'Loin · 2 cm', unit: 'kg', price: 259, weights: KGS, preps: ['Chops', 'Thick chops (3 cm)', 'Marinated · Lemon & Herb'], img: IMG.lamb, gallery: [IMG.butcherScale], desc: 'The classic braai chop. Tender eye of meat with a fat tail that crisps up on the coals.', best: 'Braai, grill', recipe: 'braai-chops', tags: ['popular'], special: { price: 229 } },
  { id: 'lamb-rib-chops', name: 'Lamb Rib Chops', category: 'lamb', cut: 'Rib · single bone', unit: 'kg', price: 239, weights: KGS, preps: ['Chops', 'Marinated · Lemon & Herb'], img: IMG.butcherScale, gallery: [IMG.lamb], desc: 'Sweet, fatty rib chops. Season with salt only and let the fire do the work.', best: 'Braai', recipe: 'braai-chops', tags: [] },
  { id: 'leg-of-lamb', name: 'Leg of Lamb', category: 'lamb', cut: 'Leg · bone-in or deboned', unit: 'kg', price: 219, weights: [1.5, 2, 2.5, 3], preps: ['Whole', 'Deboned & rolled', 'Butterflied', 'Curry pieces', 'Cubed'], img: IMG.lamb, gallery: [IMG.butcherScale], desc: 'Sunday lunch sorted. Ask for it deboned and butterflied for a fast braai.', best: 'Roast, braai (butterflied)', tags: [] },
  { id: 'lamb-shoulder', name: 'Lamb Shoulder', category: 'lamb', cut: 'Shoulder · bone-in', unit: 'kg', price: 199, weights: [1.5, 2, 3], preps: ['Whole', 'Curry pieces', 'Cubed'], img: IMG.butcherScale, gallery: [IMG.lamb], desc: 'Slow-roast it until it falls off the bone, or have it cut for a curry.', best: 'Slow roast, curry', tags: [] },
  { id: 'mutton-curry', name: 'Mutton Curry Pieces', category: 'lamb', cut: 'Shoulder, neck & rib · bone-in', unit: 'kg', price: 189, weights: KG, preps: ['Curry pieces', 'Large pieces', 'Biryani cut'], img: IMG.lamb, gallery: [IMG.curry], desc: 'Mature mutton with real depth of flavour, cut on the bandsaw into even curry pieces.', best: 'Curry, biryani, akhni', recipe: 'mutton-curry', tags: ['popular'], special: { price: 169 } },
  { id: 'lamb-shank', name: 'Lamb Shanks', category: 'lamb', cut: 'Fore & hind shank', unit: 'kg', price: 229, weights: [1, 1.5, 2], preps: ['Whole', 'Marinated · Lemon & Herb'], img: IMG.butcherScale, gallery: [IMG.lamb], desc: 'Braise low and slow in a rich tomato gravy until silky.', best: 'Braise', tags: [] },
  { id: 'lamb-mince', name: 'Lamb Mince', category: 'lamb', cut: 'Shoulder & leg', unit: 'kg', price: 199, weights: KG, preps: P.mince, img: IMG.rawKnife, gallery: [IMG.lamb], desc: 'Juicy lamb mince for koftas, kebabs and keema.', best: 'Kofta, keema', recipe: 'kebabs', tags: [] },
  { id: 'lamb-rack', name: 'Rack of Lamb', category: 'lamb', cut: 'Rib · French trimmed', unit: 'kg', price: 299, weights: [0.5, 1, 1.5], preps: ['Whole rack', 'Cutlets', 'Marinated · Lemon & Herb'], img: IMG.butcherScale, gallery: [IMG.lamb], desc: 'Elegant Frenched rack. Roast pink and carve into cutlets at the table.', best: 'Roast', tags: ['premium'] },
  { id: 'lamb-neck', name: 'Lamb Neck Slices', category: 'lamb', cut: 'Neck · sliced', unit: 'kg', price: 169, weights: KG, preps: ['Sliced', 'Curry pieces'], img: IMG.lamb, gallery: [IMG.curry], desc: 'Perfect for potjie and curry. The bone gives the sauce body.', best: 'Potjie, curry', tags: [] },

  /* ---------------- CHICKEN ---------------- */
  { id: 'whole-chicken', name: 'Whole Chicken', category: 'chicken', cut: 'Fresh · ±1.6 kg birds', unit: 'kg', price: 69, weights: [1.5, 2, 3, 5], preps: P.chicken, img: IMG.chickenWhole, gallery: [IMG.chickenBoard], desc: 'Fresh halaal chicken, washed and cut exactly how you like it: 8 pieces, curry pieces or skinless.', best: 'Roast, curry, braai', recipe: 'chicken-tikka', tags: ['popular'], special: { price: 59 } },
  { id: 'chicken-fillet', name: 'Chicken Breast Fillets', category: 'chicken', cut: 'Skinless & boneless', unit: 'kg', price: 99, weights: KG, preps: P.fillet, img: IMG.chickenBoard, gallery: [IMG.chicken], desc: 'Plump, trimmed breast fillets. Ask us to cube or strip them for you.', best: 'Tikka, stir-fry, grill', recipe: 'chicken-tikka', tags: ['popular'] },
  { id: 'chicken-thighs', name: 'Chicken Thighs', category: 'chicken', cut: 'Bone-in or deboned', unit: 'kg', price: 79, weights: KG, preps: ['Bone-in', 'Deboned', 'Skinless', 'Marinated · Peri-Peri', 'Marinated · Tikka'], img: IMG.chicken, gallery: [IMG.chickenPieces], desc: 'The juiciest part of the bird and very forgiving on the braai.', best: 'Braai, curry', tags: [] },
  { id: 'drumsticks', name: 'Chicken Drumsticks', category: 'chicken', cut: 'Skin on', unit: 'kg', price: 72, weights: KG, preps: ['As is', 'Skinless', 'Marinated · Peri-Peri', 'Marinated · Tikka'], img: IMG.chickenPieces, gallery: [IMG.chicken], desc: 'Kids love them. Marinate overnight and braai or oven-bake.', best: 'Braai, oven', tags: [] },
  { id: 'wings', name: 'Chicken Wings', category: 'chicken', cut: 'Whole wings', unit: 'kg', price: 85, weights: KG, preps: ['Whole', 'Split (flats & drums)', 'Marinated · Peri-Peri', 'Marinated · Sticky BBQ'], img: IMG.chickenRaw, gallery: [IMG.tandoori], desc: 'Sticky, crispy, finger-licking. Ask for them split for faster cooking.', best: 'Braai, air-fryer', tags: [] },
  { id: 'chicken-mince', name: 'Chicken Mince', category: 'chicken', cut: 'Thigh & breast', unit: 'kg', price: 95, weights: KG, preps: ['As is', 'Breast only'], img: IMG.chickenRaw, gallery: [IMG.chickenBoard], desc: 'Light and versatile for kebabs, samoosas and chicken burgers.', best: 'Kebabs, samoosas', tags: [] },
  { id: 'tikka-strips', name: 'Chicken Tikka Strips', category: 'chicken', cut: 'Breast · marinated in-house', unit: 'kg', price: 115, weights: KG, preps: ['Mild tikka', 'Hot tikka'], img: IMG.tikka, gallery: [IMG.tikkaMasala], desc: 'Breast strips in our yoghurt-based tikka marinade. Pan-fry for 6 minutes and dinner is done.', best: 'Pan-fry, wraps', recipe: 'chicken-tikka', tags: [] },

  /* ---------------- WORS & SAUSAGES ---------------- */
  { id: 'boerewors', name: 'Traditional Beef Boerewors', category: 'wors', cut: 'House recipe · coriander & clove', unit: 'kg', price: 119, weights: KG, preps: P.wors, img: IMG.wors, gallery: [IMG.worsGrill, IMG.boerie], desc: 'Our famous wors, the same recipe we braai outside the shop for boerie rolls every weekend.', best: 'Braai', recipe: 'boerie-rolls', tags: ['popular'], special: { price: 99 } },
  { id: 'lamb-wors', name: 'Lamb Wors', category: 'wors', cut: 'Lamb & beef blend', unit: 'kg', price: 149, weights: KG, preps: P.wors, img: IMG.worsGrill, gallery: [IMG.wors], desc: 'Richer and slightly gamey, spiced with coriander and black pepper.', best: 'Braai', tags: [] },
  { id: 'chicken-wors', name: 'Chicken Wors', category: 'wors', cut: 'Chicken · peri-peri', unit: 'kg', price: 99, weights: KG, preps: P.wors, img: IMG.worsPan, gallery: [IMG.sausagePlate], desc: 'A lighter wors with a gentle peri-peri kick.', best: 'Braai, pan', tags: [] },
  { id: 'garlic-sausage', name: 'Garlic Beef Sausages', category: 'wors', cut: 'Thick links', unit: 'kg', price: 125, weights: KG, preps: ['As is'], img: IMG.sausagePlate, gallery: [IMG.worsPan], desc: 'Fat, juicy links with roasted garlic. Brilliant on a fresh roll.', best: 'Braai, pan', tags: [] },
  { id: 'cheese-grillers', name: 'Cheese Grillers', category: 'wors', cut: 'Beef & cheddar', unit: 'kg', price: 135, weights: KG, preps: ['As is'], img: IMG.worsGrill, gallery: [IMG.sausagePlate], desc: 'Beef sausages with pockets of molten cheddar. Turn often.', best: 'Braai', tags: [] },

  /* ---------------- BRAAI PACKS ---------------- */
  { id: 'family-braai', name: 'Family Braai Pack', category: 'braai', cut: '±3 kg · feeds 6', unit: 'each', price: 499, preps: [], img: IMG.braaiTongs, gallery: [IMG.braaiGrill, IMG.wors], desc: '1 kg boerewors, 1 kg lamb chops, 1 kg peri-peri chicken pieces. Ready for the fire.', best: 'Braai for 6', tags: ['popular'], special: { price: 449 } },
  { id: 'ultimate-braai', name: 'Ultimate Braai Pack', category: 'braai', cut: '±5 kg · feeds 10', unit: 'each', price: 899, preps: [], img: IMG.braaiGrill, gallery: [IMG.braaiTongs, IMG.braaiFire], desc: 'Rump, lamb loin chops, boerewors, chicken wings and sosaties. The full Saturday spread.', best: 'Braai for 10', tags: ['premium'] },
  { id: 'steak-lovers', name: 'Steak Lovers Pack', category: 'braai', cut: '4 × 350 g steaks', unit: 'each', price: 389, preps: [], img: IMG.seared, gallery: [IMG.ribeye], desc: 'Two ribeyes and two rumps, cut thick and vacuum sealed.', best: 'Date night braai', tags: [] },
  { id: 'lamb-sosaties', name: 'Lamb Sosaties', category: 'braai', cut: 'Pack of 6 · apricot & curry', unit: 'each', price: 159, preps: [], img: IMG.braaiCook, gallery: [IMG.braaiGrill], desc: 'Classic Cape Malay style sosaties with dried apricot and onion.', best: 'Braai', tags: [] },
  { id: 'chicken-sosaties', name: 'Chicken Tikka Sosaties', category: 'braai', cut: 'Pack of 6', unit: 'each', price: 99, preps: [], img: IMG.tikka, gallery: [IMG.tandoori], desc: 'Tikka-marinated chicken thigh on skewers with peppers and onion.', best: 'Braai', tags: [] },

  /* ---------------- DELI ---------------- */
  { id: 'biltong', name: 'Beef Biltong', category: 'deli', cut: 'Silverside · sliced or sticks', unit: 'kg', price: 449, weights: [0.25, 0.5, 1], preps: ['Sliced', 'Sticks', 'Moist', 'Dry'], img: IMG.assortment, gallery: [IMG.rawWood], desc: 'Air-dried in-house with coriander and vinegar. Ask for moist, medium or dry.', best: 'Snacking', tags: ['popular'] },
  { id: 'droewors', name: 'Droëwors', category: 'deli', cut: 'Dry beef sausage', unit: 'kg', price: 469, weights: [0.25, 0.5, 1], preps: ['As is'], img: IMG.assortment, gallery: [IMG.wors], desc: 'Thin, dry and moreish. Road-trip essential.', best: 'Snacking', tags: [] },
  { id: 'beef-bacon', name: 'Smoked Beef Bacon', category: 'deli', cut: 'Brisket · smoked & sliced', unit: 'kg', price: 239, weights: [0.25, 0.5, 1], preps: ['Sliced'], img: IMG.marbled, gallery: [IMG.assortment], desc: 'Halaal beef bacon, smoked over hardwood. Fry it crisp.', best: 'Breakfast', tags: [] },
  { id: 'viennas', name: 'Smoked Beef Viennas', category: 'deli', cut: 'Pack of 12', unit: 'each', price: 69, preps: [], img: IMG.sausagePlate, gallery: [IMG.worsPan], desc: 'Kids’ lunchbox favourite. Smoky and mild.', best: 'Lunchbox, hot dogs', tags: [] },
  { id: 'salami', name: 'Beef Salami', category: 'deli', cut: '250 g · sliced', unit: 'each', price: 72, preps: [], img: IMG.assortment, gallery: [IMG.marbled], desc: 'Peppery beef salami, thinly sliced.', best: 'Sandwiches, pizza', tags: [] },

  /* ---------------- BAKERY & ROTIS ---------------- */
  { id: 'rotis', name: 'Fresh Rotis', category: 'bakery', cut: 'Pack of 10', unit: 'each', price: 65, preps: [], img: IMG.roti, gallery: [IMG.flatbread, IMG.rotiCurry], desc: 'Soft, flaky and buttery. Customers call them the best rotis on the East Rand. They freeze beautifully.', best: 'With curry', tags: ['popular'], special: { price: 55 } },
  { id: 'chicken-pie', name: 'Chicken & Mushroom Pie', category: 'bakery', cut: 'Single pie', unit: 'each', price: 32, preps: [], img: IMG.pastry, gallery: [IMG.bakery], desc: 'Golden puff pastry filled with creamy chicken and mushroom.', best: 'Lunch', tags: [] },
  { id: 'mince-pie', name: 'Steak & Mince Pie', category: 'bakery', cut: 'Single pie', unit: 'each', price: 34, preps: [], img: IMG.bakery, gallery: [IMG.pastry], desc: 'Hearty mince and steak in rich gravy.', best: 'Lunch', tags: [] },
  { id: 'mince-samosas', name: 'Mince Samosas', category: 'bakery', cut: 'Dozen · frozen or fried', unit: 'each', price: 60, preps: ['Frozen', 'Freshly fried'], img: IMG.samosa, gallery: [IMG.samosa2], desc: 'Crisp pur pastry with spiced beef mince. Fry from frozen in 4 minutes.', best: 'Iftaar, snacks', tags: ['popular'] },
  { id: 'chicken-samosas', name: 'Chicken Samosas', category: 'bakery', cut: 'Dozen · frozen or fried', unit: 'each', price: 60, preps: ['Frozen', 'Freshly fried'], img: IMG.samosa2, gallery: [IMG.samosa], desc: 'Chicken, green chilli and coriander. A party staple.', best: 'Iftaar, snacks', tags: [] },
  { id: 'chicken-pizza', name: 'Chicken Tikka Pizza', category: 'bakery', cut: 'Large · 30 cm', unit: 'each', price: 95, preps: [], img: IMG.flatbread, gallery: [IMG.tikkaMasala], desc: 'Stone-baked base, tikka chicken, peppers and mozzarella.', best: 'Dinner', tags: [] },
  { id: 'pastries', name: 'Butter Croissants', category: 'bakery', cut: 'Pack of 4', unit: 'each', price: 64, preps: [], img: IMG.pastry, gallery: [IMG.bakery], desc: 'Baked every morning. Flaky, buttery layers.', best: 'Breakfast', tags: [] },
  { id: 'naan', name: 'Garlic Naan', category: 'bakery', cut: 'Pack of 4', unit: 'each', price: 48, preps: [], img: IMG.naan, gallery: [IMG.flatbread], desc: 'Soft tandoor-style naan brushed with garlic butter.', best: 'With curry', tags: [] },

  /* ---------------- MARINADES & SPICES ---------------- */
  { id: 'peri-marinade', name: 'Peri-Peri Marinade', category: 'spices', cut: '500 ml', unit: 'each', price: 45, preps: [], img: IMG.sauce, gallery: [IMG.spices2], desc: 'Bird’s-eye chilli, garlic and lemon. Hot, tangy and addictive.', best: 'Chicken, prawns', tags: [] },
  { id: 'lemon-herb', name: 'Lemon & Herb Marinade', category: 'spices', cut: '500 ml', unit: 'each', price: 45, preps: [], img: IMG.sauce, gallery: [IMG.spiceBowls], desc: 'Fresh, zesty and mild. Perfect on lamb and chicken.', best: 'Lamb, chicken', tags: [] },
  { id: 'basting-sauce', name: 'Steak Basting Sauce', category: 'spices', cut: '500 ml', unit: 'each', price: 49, preps: [], img: IMG.sauce, gallery: [IMG.spices], desc: 'Sweet, smoky and sticky. Brush on in the last minutes of the braai.', best: 'Steak, ribs', tags: [] },
  { id: 'braai-spice', name: 'Iqbal’s Braai Spice', category: 'spices', cut: '200 g', unit: 'each', price: 38, preps: [], img: IMG.spiceBowls, gallery: [IMG.spices], desc: 'Coarse salt, coriander, black pepper and smoked paprika. Our counter blend.', best: 'Everything on the fire', tags: ['popular'] },
  { id: 'tikka-masala', name: 'Tikka Masala Spice', category: 'spices', cut: '100 g', unit: 'each', price: 39, preps: [], img: IMG.spices, gallery: [IMG.spiceMarket], desc: 'Smoky, mildly hot tikka blend. Mix with yoghurt for an instant marinade.', best: 'Chicken tikka', tags: [] },
  { id: 'mother-in-law', name: 'Mother-in-Law Masala', category: 'spices', cut: '200 g', unit: 'each', price: 42, preps: [], img: IMG.spiceMarket, gallery: [IMG.spices2], desc: 'The legendary Durban-style hot masala. Not for the faint-hearted.', best: 'Mutton curry', tags: [] },
  { id: 'biryani-mix', name: 'Biryani Spice Kit', category: 'spices', cut: 'Serves 8', unit: 'each', price: 55, preps: [], img: IMG.spices2, gallery: [IMG.biryani], desc: 'Whole spices, masala and saffron for a perfect biryani.', best: 'Biryani', tags: [] },
  { id: 'basmati', name: 'Basmati Rice', category: 'spices', cut: '2 kg · aged', unit: 'each', price: 79, preps: [], img: IMG.biryani2, gallery: [IMG.biryani], desc: 'Long-grain aged basmati. Fluffy, fragrant, separate grains.', best: 'Biryani', tags: [] },
  { id: 'ghee', name: 'Pure Ghee', category: 'spices', cut: '500 g', unit: 'each', price: 99, preps: [], img: IMG.spiceBowls, gallery: [IMG.biryani], desc: 'Clarified butter for authentic flavour in curries and biryani.', best: 'Biryani, curry', tags: [] },
];

export const productById = (id) => PRODUCTS.find((p) => p.id === id);
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);

/** Price of one line: weight in kg for kg products, otherwise per item. */
export function unitPrice(p) {
  return p.special ? p.special.price : p.price;
}
export function linePrice(p, weight = 1) {
  return p.unit === 'kg' ? unitPrice(p) * weight : unitPrice(p);
}
