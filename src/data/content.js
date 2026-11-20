/* Reviews, recipes, weekly boxes and other editorial content. */
import { IMG } from '../config/site.js';

export const REVIEWS = [
  { name: 'Isaac Lakhi', guide: true, stars: 5, text: 'The butcher is clean and flagrantly fresh. The meat range is extensive. The prices are competitive. The staff are friendly. Altogether, a great experience. Well done to the owners and management team.' },
  { name: 'Sameera Ansary', guide: false, stars: 5, text: 'Everything is fresh.. Butcher is clean.. Neat. N tidy.. Unbelievable service all the staff are so friendly.. Been buying from Iqbals for a long time' },
  { name: 'Tsholofelo Malatse', guide: false, stars: 5, text: "Exceptional customer service… I am definitely a regular and loyal customer. Quality of the meat is also exceptional and I don't mind travelling from Pretoria to buy my meat." },
  { name: 'Rehana Chetty', guide: true, stars: 5, text: 'This halaal butcher has everything readily available. Friendly staff who are always willing to help. A variety of sauces and marinades, breads and pastries. They even braai Boerie rolls outside...delicious.' },
  { name: 'Jerusha Pillay', guide: true, stars: 5, text: "The best Rotis in the East Rand. Freezes well and even after defrosting and reheating, it's so soft like it was just made." },
  { name: 'Sumaya Khan', guide: true, stars: 5, text: 'Fresh stuff and very affordable' },
];

/* items: [productId, weightKg or qty, prep] */
export const RECIPES = [
  {
    id: 'biryani', title: 'Mutton Biryani', img: IMG.biryani, time: '2 h 30', serves: 8, level: 'Weekend project',
    blurb: 'Layered basmati, slow-cooked mutton, saffron and fried onions. The dish every family argues about.',
    items: [['mutton-curry', 1.5, 'Biryani cut'], ['basmati', 1], ['biryani-mix', 1], ['ghee', 1]],
    steps: ['Marinate mutton overnight in yoghurt, biryani masala, ginger-garlic and fried onions.', 'Par-boil the basmati with whole spices until 70% cooked.', 'Layer meat, lentils (optional), potatoes and rice in a heavy pot. Top with saffron milk and ghee.', 'Seal and steam on low (dum) for 90 minutes. Rest 10 minutes before opening.'],
  },
  {
    id: 'mutton-curry', title: 'Durban Mutton Curry', img: IMG.curry, time: '1 h 45', serves: 6, level: 'Easy',
    blurb: 'Bone-in mutton, Mother-in-Law masala and potatoes. Serve with our rotis.',
    items: [['mutton-curry', 1.5, 'Curry pieces'], ['mother-in-law', 1], ['rotis', 2]],
    steps: ['Fry onion, curry leaves and whole spices in oil until golden.', 'Add masala, ginger-garlic and tomato; cook to a paste.', 'Add mutton and brown well. Add water, cover and simmer 60 minutes.', 'Add potatoes and cook until the gravy is thick. Finish with dhania.'],
  },
  {
    id: 'braai-chops', title: 'Perfect Braai Chops', img: IMG.braaiTongs, time: '25 min', serves: 4, level: 'Easy',
    blurb: 'Salt, fire and patience. How our butchers braai lamb chops and rump.',
    items: [['lamb-loin-chops', 1, 'Chops'], ['rump', 1, 'Steaks (2 cm)'], ['braai-spice', 1], ['basting-sauce', 1]],
    steps: ['Take meat out of the fridge 30 minutes before cooking.', 'Wait for hot coals you can hold your hand over for 3 seconds.', 'Crisp the fat edges first, then 4 minutes a side for chops.', 'Baste in the last 2 minutes, rest 5 minutes, then season with braai spice.'],
  },
  {
    id: 'chicken-tikka', title: 'Chicken Tikka', img: IMG.tikkaMasala, time: '40 min', serves: 4, level: 'Easy',
    blurb: 'Smoky yoghurt-marinated chicken, charred on the coals or under the grill.',
    items: [['chicken-fillet', 1, 'Cubed'], ['tikka-masala', 1], ['naan', 2]],
    steps: ['Mix yoghurt, tikka masala, lemon and ginger-garlic.', 'Coat the chicken and marinate at least 2 hours.', 'Thread onto skewers and grill on high heat 10–12 minutes, turning.', 'Serve with naan, onion salad and mint chutney.'],
  },
  {
    id: 'boerie-rolls', title: 'Boerie Rolls', img: IMG.boerie, time: '20 min', serves: 6, level: 'Easy',
    blurb: 'Just like the ones we braai outside the shop on weekends.',
    items: [['boerewors', 1, 'As is'], ['basting-sauce', 1]],
    steps: ['Braai the wors whole over medium coals, turning often, about 12 minutes.', 'Fry onions with a pinch of sugar until sticky.', 'Toast the rolls on the grid for 30 seconds.', 'Wors, onions, tomato sauce. Done.'],
  },
  {
    id: 'kebabs', title: 'Seekh Kebabs', img: IMG.grilledPlatter, time: '35 min', serves: 6, level: 'Medium',
    blurb: 'Spiced mince kebabs with green chilli and fresh coriander.',
    items: [['beef-mince', 1, 'Double minced'], ['tikka-masala', 1]],
    steps: ['Mix mince with grated onion, chilli, dhania, masala and an egg.', 'Chill for 30 minutes so the mixture firms up.', 'Shape around skewers with wet hands.', 'Grill or braai 8–10 minutes, turning once.'],
  },
];

export const BOXES = [
  { id: 'family', name: 'Family Box', price: 849, feeds: 'Family of 4–5 · a week of dinners', img: IMG.assortment,
    items: [['beef-mince', 1, 'As is'], ['whole-chicken', 2, 'Washed & cut (8 pcs)'], ['mutton-curry', 1, 'Curry pieces'], ['boerewors', 1, 'As is'], ['chicken-fillet', 1, 'As is']] },
  { id: 'braai', name: 'Braai Box', price: 899, feeds: 'Weekend braai for 6–8', img: IMG.braaiGrill,
    items: [['rump', 1, 'Steaks (2 cm)'], ['lamb-loin-chops', 1, 'Chops'], ['boerewors', 1.5, 'Coiled'], ['wings', 1, 'Marinated · Peri-Peri'], ['braai-spice', 1]] },
  { id: 'curry', name: 'Curry Box', price: 779, feeds: 'Three big pots of curry', img: IMG.curry,
    items: [['mutton-curry', 1.5, 'Curry pieces'], ['beef-curry', 1, 'Curry pieces'], ['whole-chicken', 1.5, 'Washed & cut (curry pieces)'], ['mother-in-law', 1], ['rotis', 1]] },
  { id: 'chicken', name: 'Chicken Lovers', price: 599, feeds: 'Lean, versatile, kid-friendly', img: IMG.chickenBoard,
    items: [['chicken-fillet', 2, 'As is'], ['drumsticks', 1, 'Marinated · Peri-Peri'], ['wings', 1, 'Split (flats & drums)'], ['chicken-wors', 1, 'Coiled'], ['tikka-strips', 1, 'Mild tikka']] },
];

/* Interactive meat map. Polygons live in a 800 × 460 viewBox.
   cuts: [{ product, label }] link a region to products in the shop. */
export const MEAT_MAP = {
  beef: {label:"Beef",viewBox:"0 0 960 620",lines:"M120 40L142 112 M282 40L282 136 M432 70L400 193 M563 66L541 197 M658 78L660 95L695 180L725 245L712 290 M268 188L400 193L541 197 M276 180L268 190L262 245L225 345 M135 178L200 212L262 245 M130 205L128 318 M58 318L128 318L228 348 M393 193L393 412 M393 288L735 288 M540 372L605 402L592 472 M66 395L86 458",body:"M811 18L816 18L821 20L827 26L831 33L833 40L836 42L842 41L859 34L869 34L871 36L871 45L866 59L866 63L874 72L879 81L881 88L881 97L898 112L903 118L911 133L919 141L935 148L943 155L945 163L942 176L938 184L934 188L931 190L925 191L919 199L905 206L896 205L885 200L877 200L870 203L856 205L832 204L809 199L790 191L785 191L778 195L752 227L738 241L726 250L715 284L714 285L698 285L696 287L697 290L700 291L709 290L711 291L711 293L698 315L690 323L683 327L679 332L676 338L675 348L671 359L658 381L642 399L628 408L621 410L613 410L608 405L605 407L607 414L599 430L594 444L592 452L591 466L589 470L583 473L580 477L571 476L569 478L571 481L577 483L576 501L578 519L584 543L590 552L608 568L609 570L608 574L591 579L576 580L567 578L561 574L547 575L545 573L545 566L548 555L552 527L553 497L554 496L553 478L559 478L561 476L559 473L553 472L553 467L547 446L544 427L543 392L544 391L544 381L549 379L549 376L547 374L544 374L536 370L525 371L466 391L409 405L403 404L401 393L398 391L396 393L397 407L372 410L337 410L322 408L304 403L276 391L244 374L231 365L218 353L224 343L222 339L220 339L215 347L213 348L205 340L197 335L191 334L181 338L167 332L165 334L165 337L175 341L176 342L175 344L163 357L142 391L122 417L94 445L91 450L88 447L85 449L86 457L76 473L69 491L63 534L63 559L67 578L70 584L81 595L66 599L44 600L31 597L24 592L24 576L20 570L19 562L20 557L28 542L31 530L30 504L32 492L35 488L38 478L40 463L40 432L44 408L52 392L59 386L61 388L65 386L63 380L67 371L67 347L63 319L72 319L75 316L72 313L62 313L56 255L56 240L55 239L55 221L54 220L55 162L54 161L51 172L48 200L48 213L47 214L47 271L49 276L48 300L49 310L52 318L52 328L50 332L52 344L52 354L49 351L47 344L44 356L42 353L39 357L34 355L30 373L26 378L27 371L25 365L22 363L23 356L21 355L18 357L18 351L20 346L18 333L22 320L29 307L28 289L32 274L32 263L29 243L29 196L36 128L39 114L46 97L55 84L64 76L79 68L101 63L114 63L116 71L120 73L122 71L121 63L129 63L158 68L177 73L209 78L227 80L242 80L243 81L279 81L280 88L284 87L285 81L287 80L288 81L349 82L360 84L370 84L392 88L423 90L419 101L419 105L421 107L424 105L429 90L459 90L460 89L491 88L500 87L522 81L544 78L574 79L602 86L633 86L658 81L657 93L660 96L663 94L663 84L665 79L720 65L742 62L764 51L778 48L784 39L796 26L801 22Z",regions:[{id:"neck",name:"Neck",d:"M660 95L662 0L960 0L960 330L728 330L712 288L725 245L695 180Z",label:{x:712,y:168,r:58,t:"NECK"},desc:"Hard-working, sinewy and full of beefy flavour. Sold as bone-in neck slices or boneless cubes.",method:"Curry, stew, potjie, mince",cuts:[{product:"beef-curry",label:"Neck & chuck curry pieces"},{product:"beef-mince",label:"Mince"}]},{id:"chuck",name:"Chuck",d:"M560 0L662 0L660 95L695 180L725 245L712 288L541 288L541 197L558 88Z",label:{x:606,y:168,r:-4,t:"CHUCK"},desc:"The well-marbled shoulder, rich in connective tissue that melts with slow cooking. Our go-to for curry, stew, pot roast and premium mince.",method:"Curry, stew, pot roast, mince",cuts:[{product:"beef-curry",label:"Curry pieces"},{product:"beef-cubes",label:"Stew cubes"},{product:"beef-mince",label:"Mince"}]},{id:"rib",name:"Rib",d:"M428 0L560 0L558 88L541 197L400 193L425 92Z",label:{x:468,y:148,r:0,t:"RIB"},desc:"The prime rib section. Cut into ribeye or bone-in tomahawk steaks, or roasted whole as a standing rib roast.",method:"Braai, pan-sear, reverse sear, roast",cuts:[{product:"ribeye",label:"Ribeye"},{product:"tomahawk",label:"Tomahawk"}]},{id:"sirloin",name:"Sirloin",d:"M282 0L428 0L425 92L400 193L268 188L282 186Z",label:{x:348,y:118,r:5,t:"SIRLOIN"},desc:"Tender loin muscle with a cap of fat along the edge. Cut as sirloin (striploin) steaks, or with the bone and fillet attached as T-bone.",method:"Braai, grill, pan-sear",cuts:[{product:"sirloin",label:"Sirloin steak"},{product:"tbone",label:"T-bone"}]},{id:"rump",name:"Rump",d:"M118 0L282 0L282 186L268 190L262 245L200 212L135 178L142 110Z",label:{x:186,y:118,r:-8,t:"RUMP"},desc:"Lean but packed with flavour: South Africa’s favourite braai steak. Ask for the rump cap (picanha) for something special.",method:"Braai, grill, roast",cuts:[{product:"rump",label:"Rump steak"}]},{id:"jacobs",name:"Jacob’s Ladder",d:"M393 195L541 197L541 288L393 288Z",label:{x:452,y:228,r:0,t:"JACOB’S\nLADDER"},desc:"Thick short ribs from beneath the rib section, layered with meat and fat.",method:"Slow braise, smoke, oven-roast",cuts:[{product:"short-rib",label:"Short rib"}]},{id:"flank",name:"Flank",d:"M393 192L268 188L262 245L225 345L215 440L393 440Z",label:{x:318,y:296,r:0,t:"FLANK"},desc:"A thin, coarse-grained belly muscle. Marinate, grill hot and fast and slice across the grain, or mince it.",method:"Marinate & grill fast, stir-fry, mince",cuts:[{product:"beef-mince",label:"Lean mince"}]},{id:"brisket",name:"Brisket",d:"M393 288L730 288L730 360L640 410L605 402L540 372L500 385L393 410Z",label:{x:508,y:350,r:0,t:"BRISKET"},desc:"The chest muscle. Tough when rushed, magnificent when smoked, slow-roasted or braised. Also cured into beef bacon.",method:"Smoke, slow roast, braise",cuts:[{product:"brisket",label:"Brisket"},{product:"beef-bacon",label:"Smoked beef bacon"}]},{id:"shin",name:"Shin",d:"M540 372L605 402L592 472L552 478L532 420Z",label:{x:570,y:425,r:62,t:"SHIN"},desc:"The fore shin: full of gelatin and marrow that turn into a rich, silky sauce.",method:"Curry, soup, osso buco, potjie",cuts:[{product:"beef-curry",label:"Shin curry pieces"}]},{id:"knuckle",name:"Knuckle",d:"M135 178L200 212L262 245L225 345L128 318L130 205Z",label:{x:190,y:272,r:-10,t:"KNUCKLE"},desc:"Also called thick flank. Lean and fine-grained: roast it whole or cut it into kebab cubes and stir-fry strips.",method:"Roast, kebabs, stir-fry",cuts:[]},{id:"silverside",name:"Silverside",d:"M50 195L130 205L128 318L50 318Z",label:{x:86,y:258,r:72,t:"SILVERSIDE"},desc:"The outside of the hind leg: lean and firm. The classic biltong cut, and great as a pot roast or salted beef.",method:"Biltong, pot roast, salt beef",cuts:[{product:"biltong",label:"Biltong"}]},{id:"leg",name:"Leg",d:"M40 318L128 318L228 348L180 415L100 452L86 458L66 395Z",label:{x:110,y:374,r:0,t:"LEG"},desc:"The hind shin. Like the fore shin it is gelatin-rich and best slow-cooked.",method:"Soup, stew, curry, potjie",cuts:[{product:"beef-curry",label:"Shin curry pieces"}]},{id:"topside",oval:true,name:"Topside",d:"M57 152a43 57 0 1 0 86 0a43 57 0 1 0 -86 0Z",label:{x:99,y:152,r:-12,t:"TOPSIDE",s:22},desc:"The lean inside-leg muscle. Roast it, slice it thin for schnitzels and stir-fry, or have it dried into biltong.",method:"Roast, schnitzel, stir-fry, biltong",cuts:[{product:"topside",label:"Topside roast"},{product:"biltong",label:"Biltong"}]},{id:"fillet",oval:true,name:"Fillet",d:"M163 158a112 22 0 1 0 224 0a112 22 0 1 0 -224 0Z",label:{x:274,y:166,r:0,t:"FILLET",s:22},desc:"The tenderloin runs underneath the sirloin and rump. The most tender cut on the animal: lean, mild and elegant.",method:"Roast, pan-sear, medallions",cuts:[{product:"fillet",label:"Beef fillet"}]},{id:"blade",oval:true,name:"Blade",d:"M505 256a57 55 0 1 0 114 0a57 55 0 1 0 -114 0Z",label:{x:562,y:262,r:-16,t:"BLADE"},desc:"From the shoulder blade. Braise as a blade roast or steaks; the flat iron inside is tender enough for the grill.",method:"Braise, pot roast, flat-iron steak",cuts:[{product:"beef-cubes",label:"Braising cubes"}]},{id:"cheek",oval:true,name:"Cheek",d:"M737 136a50 33 0 1 0 100 0a50 33 0 1 0 -100 0Z",label:{x:786,y:142,r:-10,t:"CHEEK",s:22},desc:"A small, heavily worked muscle that becomes meltingly tender after 3 to 4 hours of braising.",method:"Slow braise",cuts:[]}]},
  lamb: {
    label: 'Lamb',
    outline: 'M190 150 C170 120 150 104 128 104 C108 104 90 116 84 134 C70 138 62 150 66 162 C80 166 96 170 110 176 C118 200 140 214 168 214 L176 300 L186 420 L214 420 L222 320 L270 330 L540 330 L586 320 L594 420 L622 420 L628 300 C650 270 660 236 656 204 C670 196 680 186 690 180 C676 176 662 176 650 178 C640 150 612 136 572 132 L300 128 C254 126 214 132 190 150 Z',
    regions: [
      { id: 'neck', name: 'Neck', d: 'M190 150 C214 132 254 126 300 128 L296 214 L168 214 C176 194 180 170 190 150 Z', method: 'Curry, potjie', cuts: [{ product: 'lamb-neck', label: 'Neck slices' }] },
      { id: 'shoulder', name: 'Shoulder', d: 'M168 214 L296 214 L298 330 L270 330 L222 320 C200 290 186 260 176 236 Z', method: 'Slow roast, curry', cuts: [{ product: 'lamb-shoulder', label: 'Shoulder' }, { product: 'mutton-curry', label: 'Curry pieces' }, { product: 'lamb-mince', label: 'Mince' }] },
      { id: 'rack', name: 'Rack', d: 'M300 128 L410 130 L410 226 L296 228 Z', method: 'Roast, braai', cuts: [{ product: 'lamb-rack', label: 'Rack' }, { product: 'lamb-rib-chops', label: 'Rib chops' }] },
      { id: 'loin', name: 'Loin', d: 'M410 130 L520 131 L520 226 L410 226 Z', method: 'Braai, grill', cuts: [{ product: 'lamb-loin-chops', label: 'Loin chops' }] },
      { id: 'leg', name: 'Leg', d: 'M520 131 L572 132 C612 136 640 150 650 178 C658 212 652 250 640 280 L628 300 L586 320 L540 330 L520 226 Z', method: 'Roast, butterfly & braai', cuts: [{ product: 'leg-of-lamb', label: 'Leg of lamb' }] },
      { id: 'breast', name: 'Breast & Ribs', d: 'M298 228 L520 226 L540 330 L298 330 Z', method: 'Braai riblets, slow roast', cuts: [{ product: 'lamb-rib-chops', label: 'Riblets' }] },
      { id: 'shank', name: 'Shank', d: 'M186 340 L216 340 L214 420 L186 420 Z M590 340 L624 340 L622 420 L594 420 Z', method: 'Braise', cuts: [{ product: 'lamb-shank', label: 'Shanks' }] },
    ],
  },
  chicken: {
    label: 'Chicken',
    outline: 'M250 190 C230 150 236 110 266 92 C292 76 322 86 330 112 C336 130 332 148 322 160 C350 170 380 176 420 176 C500 176 580 190 630 150 C650 136 668 140 672 156 C676 180 660 220 630 250 C600 290 560 320 500 330 L470 400 L486 420 L440 420 L448 400 L430 336 L380 336 L372 400 L388 420 L340 420 L350 400 L340 326 C290 300 262 250 250 190 Z M266 92 L252 70 L272 80 L280 64 L290 84',
    regions: [
      { id: 'breast', name: 'Breast', d: 'M322 160 C350 170 380 176 420 176 L430 290 L340 300 C300 276 276 240 262 196 C280 186 304 172 322 160 Z', method: 'Grill, tikka, stir-fry', cuts: [{ product: 'chicken-fillet', label: 'Breast fillets' }, { product: 'tikka-strips', label: 'Tikka strips' }] },
      { id: 'wing', name: 'Wing', d: 'M420 176 C470 176 520 180 560 176 C540 214 500 238 450 240 L430 238 Z', method: 'Braai, air-fryer', cuts: [{ product: 'wings', label: 'Wings' }] },
      { id: 'back', name: 'Back & Whole bird', d: 'M560 176 C590 172 612 164 630 150 C650 136 668 140 672 156 C676 180 660 220 630 250 L560 260 L540 214 Z', method: 'Roast, soup, curry', cuts: [{ product: 'whole-chicken', label: 'Whole chicken' }] },
      { id: 'thigh', name: 'Thigh', d: 'M430 238 L450 240 C500 238 540 214 560 260 L630 250 C600 290 560 320 500 330 L430 336 L430 290 Z', method: 'Braai, curry', cuts: [{ product: 'chicken-thighs', label: 'Thighs' }, { product: 'chicken-mince', label: 'Mince' }] },
      { id: 'drumstick', name: 'Drumstick', d: 'M380 336 L430 336 L448 400 L440 420 L486 420 L470 400 L500 330 L430 336 M340 326 L380 336 L372 400 L388 420 L340 420 L350 400 Z', method: 'Braai, oven-bake', cuts: [{ product: 'drumsticks', label: 'Drumsticks' }] },
    ],
  },
};

export const DONENESS = [
  { name: 'Blue', temp: '46–49 °C', core: '#7a0f1f', ring: '#8d1d28', note: 'Seared outside, cool and purple inside.' },
  { name: 'Rare', temp: '50–52 °C', core: '#a3182b', ring: '#a3474a', note: 'Cool red centre, very soft.' },
  { name: 'Medium Rare', temp: '54–57 °C', core: '#c8394a', ring: '#b0656a', note: 'Warm red centre. The butcher’s choice for ribeye and rump.' },
  { name: 'Medium', temp: '58–63 °C', core: '#d26f78', ring: '#a87b74', note: 'Pink throughout with a firmer bite.' },
  { name: 'Medium Well', temp: '64–68 °C', core: '#c79a8f', ring: '#9b7d6c', note: 'Slightly pink in the very centre.' },
  { name: 'Well Done', temp: '70 °C +', core: '#8d6a55', ring: '#7a5a46', note: 'Cooked through. Keep it juicy with a thicker cut and basting.' },
];
