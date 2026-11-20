/* =====================================================================
   BRAND MARKS
   - The client's real logo (public/assets/logo.jpg: yellow hand-lettered
     "IQBAL'S" with a red shadow and white "MEAT & DELI" on oxblood) is
     used in the nav, footer, loader and page transitions.
   - wordmark(): a crisp SVG redraw of that logo for large sizes.
   - logoImg(): a round "I" monogram for small spots (chat, curtain).
   ===================================================================== */
import { IMG } from '../config/site.js';

let uid = 0;
export const LOGO_YELLOW = '#f4ec3c';
export const LOGO_RED = '#e0202a';

/** Gingham pattern definition (red + white), usable inside any <svg>. */
export const ginghamDefs = (id, size = 8) => `
  <pattern id="${id}" width="${size * 2}" height="${size * 2}" patternUnits="userSpaceOnUse">
    <rect width="${size * 2}" height="${size * 2}" fill="#fbf6ee"/>
    <rect width="${size}" height="${size * 2}" fill="#c8202f" opacity=".55"/>
    <rect width="${size * 2}" height="${size}" fill="#c8202f" opacity=".55"/>
  </pattern>`;

/** SVG redraw of the real logo: yellow IQBAL'S + red offset shadow, white MEAT & DELI. */
export function wordmark({ cls = '', title = "Iqbal's Meat & Deli", panel = false } = {}) {
  const t = `font-family="Kalam, 'Segoe Print', cursive" font-weight="700"`;
  return `<svg class="wordmark ${cls}" viewBox="0 0 460 200" role="img" aria-label="${title}">
    ${panel ? '<rect width="460" height="200" rx="14" fill="#6b0f14"/>' : ''}
    <g ${t} text-anchor="middle">
      <text x="236" y="114" font-size="108" fill="${LOGO_RED}" letter-spacing="2">IQBAL’S</text>
      <text x="230" y="108" font-size="108" fill="${LOGO_YELLOW}" stroke="#2a0606" stroke-width="2" paint-order="stroke" letter-spacing="2">IQBAL’S</text>
      <text x="230" y="168" font-size="46" fill="#ffffff" letter-spacing="6">MEAT &amp; DELI</text>
    </g>
  </svg>`;
}

/** The real logo image (wide), falling back to the SVG redraw if the file is missing. */
export function logoWide({ cls = '', h = 48, alt = "Iqbal's Meat & Deli logo" } = {}) {
  return `<span class="logo-wide ${cls}" style="--h:${h}px">
    <img src="${IMG.logo}" alt="${alt}" height="${h}" onerror="this.parentNode.classList.add('is-fallback');this.remove()">
    ${wordmark({ cls: 'logo-wide__svg', panel: true })}
  </span>`;
}

/** Round monogram for small placements (chat button, avatars). */
export function logoImg({ cls = '', size = 56, alt = "Iqbal's" } = {}) {
  return `<span class="logo-img ${cls}" style="--s:${size}px" role="img" aria-label="${alt}">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="#6b0f14"/>
      <circle cx="50" cy="50" r="45" fill="none" stroke="${LOGO_YELLOW}" stroke-width="1.5" opacity=".55"/>
      <g font-family="Kalam, cursive" font-weight="700" text-anchor="middle" font-size="42">
        <text x="52.5" y="64.5" fill="${LOGO_RED}">IQ</text><text x="50" y="62" fill="${LOGO_YELLOW}">IQ</text>
      </g>
    </svg>
  </span>`;
}

/** Thin gold foil divider with gingham knot. */
export const foilRule = (cls = '') => `<div class="foil-rule ${cls}" aria-hidden="true"><span></span><i></i><span></span></div>`;

/** Halaal certification seal (SVG). */
export function halaalSeal(cls = '') {
  const n = uid++;
  return `<svg class="seal ${cls}" viewBox="0 0 160 160" role="img" aria-label="NIHT certified halaal">
    <defs><path id="sc${n}" d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0"/></defs>
    <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="2 4"/>
    <text font-family="Manrope, sans-serif" font-size="9.6" font-weight="700" letter-spacing="2.2" fill="currentColor"><textPath href="#sc${n}">NIHT CERTIFIED • 100% HALAAL • NIHT CERTIFIED • 100% HALAAL •</textPath></text>
    <text x="80" y="76" text-anchor="middle" font-family="'Playfair Display', serif" font-style="italic" font-size="26" fill="currentColor">Halaal</text>
    <text x="80" y="98" text-anchor="middle" font-family="Manrope, sans-serif" font-size="10" font-weight="700" letter-spacing="2.5" fill="currentColor">CERTIFIED</text>
  </svg>`;
}
