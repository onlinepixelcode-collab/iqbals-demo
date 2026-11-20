/* =====================================================================
   IQBAL'S MEAT & DELI · SITE CONFIG
   ---------------------------------------------------------------------
   Edit business details, trading hours, delivery rules and every image
   URL in this one file. Swap the Unsplash links for the shop's own
   photos at any time (keep the same keys).
   ===================================================================== */

export const BUSINESS = {
  name: "Iqbal's Meat & Deli",
  tagline: 'We make a difference!',
  certification: 'NIHT certified halaal · National Independent Halaal Trust',
  rating: 4.4,
  reviewCount: 572,
  googleProfile: 'https://share.google/jCCWkDzDGrAFU2C5f',
  instagram: 'https://www.instagram.com/_iqbals_/',
  instagramHandle: '@_iqbals_',
  facebook: 'https://www.facebook.com/iqbalsmeatdeli',
  agency: { name: 'Pixel Code', url: 'https://pixelcode.co.za' },
};

/* ---------------------------------------------------------------------
   TRADING HOURS
   0 = Sunday … 6 = Saturday. Use null for closed days.
   Times are 24h "HH:MM" in South African time (SAST, UTC+2).
   Benoni hours come from the shop's latest Instagram post.
   Lenasia hours come from the shop's Instagram trading-hours post
   (closed 1–2 PM daily and 12–2 PM on Fridays for lunch/prayer).
   --------------------------------------------------------------------- */
const WED_TO_SUN = {
  0: ['08:30', '18:30'], // Sunday
  1: null, // Monday: closed
  2: null, // Tuesday: closed
  3: ['08:30', '18:30'], // Wednesday
  4: ['08:30', '18:30'], // Thursday
  5: ['08:30', '18:30'], // Friday
  6: ['08:30', '18:30'], // Saturday
};

export const BRANCHES = [
  {
    id: 'benoni',
    name: 'Benoni',
    suburb: 'Actonville',
    address: '791 Patel Street (cnr Patel & Laher Street), Actonville, Benoni',
    phone: '078 678 6315',
    phoneIntl: '27786786315',
    hours: WED_TO_SUN,
    hoursLabel: 'Wednesday – Sunday · 8:30 AM – 6:30 PM',
    mapQuery: '791 Patel Street, Actonville, Benoni, South Africa',
    geo: { lat: -26.1975, lng: 28.3087 },
  },
  {
    id: 'lenasia',
    name: 'Lenasia',
    suburb: 'Ext 13',
    address: '12286 Nirvana Drive, Ext 13, Lenasia',
    phone: '078 678 6319',
    phoneIntl: '27786786319',
    hours: { 0: ['09:00', '12:45'], 1: ['09:30', '16:45'], 2: ['09:30', '16:45'], 3: ['09:30', '16:45'], 4: ['09:30', '16:45'], 5: ['09:30', '16:45'], 6: ['09:00', '16:00'] },
    hoursLabel: 'Mon – Fri 9:30 AM – 4:45 PM · Sat 9 AM – 4 PM · Sun 9 AM – 12:45 PM (closed 1–2 PM daily, 12–2 PM Fri)',
    mapQuery: '12286 Nirvana Drive, Lenasia Ext 13, South Africa',
    geo: { lat: -26.3228, lng: 27.8395 },
  },
];

/* ---------------------------------------------------------------------
   DELIVERY & ORDERING
   --------------------------------------------------------------------- */
export const DELIVERY = {
  freeThreshold: 750, // free delivery from this cart total (ZAR)
  fee: 65,
  areas: [
    'Benoni', 'Actonville', 'Daveyton', 'Boksburg', 'Brakpan', 'Kempton Park',
    'Germiston', 'Springs', 'Lenasia', 'Lenasia South', 'Ennerdale', 'Eldorado Park',
    'Soweto', 'Roodepoort', 'Johannesburg South', 'Mayfair', 'Fordsburg',
  ],
  slots: ['08:30 – 10:30', '10:30 – 12:30', '12:30 – 14:30', '14:30 – 16:30', '16:30 – 18:30'],
  boxDays: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

/* Weekly "crazy specials" end this weekday/time (Sunday 18:30). */
export const SPECIALS_END = { weekday: 0, time: '18:30' };

/* Saturday competition banner */
export const COMPETITION = {
  title: 'Saturday Giveaway',
  text: 'Spend R500 or more this week and you are in the draw for a R1,000 braai hamper. Winner announced on Instagram every Saturday.',
};

/* ---------------------------------------------------------------------
   IMAGES
   One place for every photo. `u(id)` builds a sized, compressed
   Unsplash URL. Replace any value with your own file path, e.g.
   'assets/photos/ribeye.jpg'.
   --------------------------------------------------------------------- */
export const u = (id, w = 1200) =>
  id.startsWith('http') || id.startsWith('assets/')
    ? id
    : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const IMG = {
  logo: 'assets/logo.jpg', // the client's real logo; drop the file in public/assets/
  hero: 'photo-1690983320937-ca293f1d1d97',
  heroAlt: 'photo-1588168333986-5078d3ae3976',
  shop: 'photo-1597417321971-45e034f7a993',
  counter: 'photo-1786812594035-d9ff77d0ecb2',
  steaksBoard: 'photo-1690983330536-3b0089d07cf9',
  rawKnife: 'photo-1690983325551-b922137727be',
  marbled: 'photo-1666013942642-b7b54ecafd7d',
  sirloin: 'photo-1603048297172-c92544798d5a',
  ribeye: 'photo-1632154023554-c2975e9be348',
  fillet: 'photo-1690983321750-ad6f6d59a84b',
  steakPaper: 'photo-1728042359930-c0145f0fd442',
  rawWood: 'photo-1588347818036-558601350947',
  twoSteaks: 'photo-1690983322025-aab4f95a0269',
  shortRib: 'photo-1625604086988-6e41981275fa',
  tomahawk: 'photo-1592877186734-6e558cf0dfaf',
  seared: 'photo-1588168333986-5078d3ae3976',
  assortment: 'photo-1607623814075-e51df1bdc82f',
  lamb: 'photo-1794659877606-e13f25fa07c7',
  butcherScale: 'photo-1763033035770-e83f50e8e8b1',
  chicken: 'photo-1587593810167-a84920ea0781',
  chickenBoard: 'photo-1682991136736-a2b44623eeba',
  chickenPieces: 'photo-1759493321741-883fbf9f433c',
  chickenWhole: 'photo-1672787153720-e85fe802fd9f',
  chickenRaw: 'photo-1604503468506-a8da13d82791',
  wors: 'photo-1598401863352-3de5501f4890',
  worsPan: 'photo-1551135020-39e4ca508d9b',
  worsGrill: 'photo-1591989330748-777649e84466',
  sausagePlate: 'photo-1624772398066-98584aa2f214',
  braai: 'photo-1508615263227-c5d58c1e5821',
  braaiTongs: 'photo-1614119068601-483274e9dcb7',
  braaiFire: 'photo-1526213174737-acd9757c6bf3',
  braaiGrill: 'photo-1616252980327-ec70572e5df9',
  braaiCook: 'photo-1627947063935-55577ec3c2e1',
  braaiMan: 'photo-1558030089-02acba3c214e',
  roti: 'photo-1640625314547-aee9a7696589',
  rotiTray: 'photo-1574448857443-dc1d7e9c4dad',
  naan: 'photo-1697155406014-04dc649b0953',
  flatbread: 'photo-1655979284091-eea0e93405ee',
  rotiCurry: 'photo-1565557623262-b51c2513a641',
  pastry: 'photo-1534432182912-63863115e106',
  bakery: 'photo-1571942948809-74637bfc59b9',
  samosa: 'photo-1601050690597-df0568f70950',
  samosa2: 'photo-1772729996007-40bad08b3c40',
  spices: 'photo-1553617569-8ef7a8da3146',
  spices2: 'photo-1525289722380-f5bf1653d504',
  spiceBowls: 'photo-1663325265966-0d17de3e85c5',
  spiceMarket: 'photo-1758745464235-ccb8c1253074',
  sauce: 'photo-1757800499225-220ba7ee4e53',
  biryani: 'photo-1589302168068-964664d93dc0',
  biryani2: 'photo-1631515243349-e0cb75fb8d3a',
  curry: 'photo-1585937421612-70a008356fbe',
  tikka: 'photo-1599487488170-d11ec9c172f0',
  tandoori: 'photo-1727280376746-b89107a5b0df',
  tikkaMasala: 'photo-1772730064970-a7b2735c93b9',
  boerie: 'photo-1638368593249-7cadb261e8b3',
  grilledPlatter: 'photo-1555939594-58d7cb561ad1',
};
// `spices` lives under /flagged/ on Unsplash
IMG.spices = 'https://images.unsplash.com/flagged/photo-1553617569-8ef7a8da3146?auto=format&fit=crop&w=1200&q=70';

/* Instagram wall placeholders: swap for real post images + links */
export const INSTAGRAM_POSTS = [
  { img: IMG.braaiTongs, caption: 'Saturday braai energy 🔥' },
  { img: IMG.marbled, caption: 'Marbling you can see from the door' },
  { img: IMG.roti, caption: 'Best rotis on the East Rand. Fact.' },
  { img: IMG.boerie, caption: 'Boerie rolls outside the shop, every weekend' },
  { img: IMG.counter, caption: 'Crazy mid-month specials are live' },
  { img: IMG.lamb, caption: 'Lamb, cut to order' },
  { img: IMG.samosa, caption: 'Fresh samosas, straight from the deli' },
  { img: IMG.wors, caption: 'Our boerewors recipe: never changed' },
  { img: IMG.spiceBowls, caption: 'Masalas for every pot' },
];
