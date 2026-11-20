/* =====================================================================
   BANDSAW 3D · the Cut Studio's butcher machine (Three.js)
   A white-enamel meat bandsaw with a brushed stainless table, a running
   toothed blade, pusher carriage and thickness gauge. A ribeye roll
   (real photographed cross-section) is fed through the blade at the
   chosen thickness; each cut slice lands face-up on the tray, then the
   chosen preparation is shown (cubes, strips, curry pieces, mince, roast).
   ===================================================================== */
import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const BASE = 'models/';
const BLADE_X = 0.35; // blade plane (x)
const UNIT_CM = 9.5; // 1 scene unit ≈ 9.5 cm (a ribeye roll is ~18 cm wide)

let assets = null;
function loadAssets() {
  if (assets) return assets;
  const tl = new THREE.TextureLoader();
  const tex = (u) => new Promise((res, rej) => tl.load(u, (t) => { t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, rej));
  assets = Promise.all([
    fetch(BASE + 'steak-outline.json').then((r) => r.json()),
    tex(BASE + 'steak.jpg'),
    tex(BASE + 'marbling.jpg'),
    new Promise((res, rej) => new HDRLoader().load(BASE + 'studio.hdr', res, undefined, rej)),
  ]).then(([outline, face, marb, hdr]) => {
    marb.wrapS = marb.wrapT = THREE.RepeatWrapping;
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    return { outline, face, marb, hdr };
  });
  assets.catch(() => (assets = null));
  return assets;
}

/* canvas textures: running blade with teeth, brand plate, brushed steel */
function bladeTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 64, 0);
  grd.addColorStop(0, '#9aa1a7'); grd.addColorStop(0.5, '#eef1f3'); grd.addColorStop(1, '#a7aeb4');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 512);
  g.fillStyle = '#3c4247';
  for (let y = 0; y < 512; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(14, y + 6); g.lineTo(0, y + 16); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3);
  return t;
}
function plateTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = '#9b1515'; g.fillRect(0, 0, 512, 160);
  g.textAlign = 'center';
  g.font = '700 74px Kalam, "Segoe Print", cursive'; g.fillStyle = '#e0202a'; g.fillText('IQBAL’S', 262, 92); g.fillStyle = '#f4ec3c'; g.fillText('IQBAL’S', 256, 86);
  g.font = '700 26px Kalam, cursive'; g.fillStyle = '#fff'; g.fillText('MEAT & DELI · BANDSAW', 256, 132);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function brushedTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2400; i++) { g.strokeStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.09})`; const y = Math.random() * 512; g.beginPath(); g.moveTo(0, y); g.lineTo(512, y + (Math.random() - 0.5) * 2); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

/* ---------- meat geometry ---------- */
// Cross-section of a ribeye roll from the real steak outline; extruded along local z (thickness).
function crossSection(o, size = 2.0, squash = 0.72) {
  const k = size / Math.max(o.w, o.h);
  const pts = o.poly.map(([px, py]) => [(py - o.h / 2) * k, -(px - o.w / 2) * k * squash]);
  const minY = Math.min(...pts.map((p) => p[1]));
  return { pts: pts.map(([x, y]) => [x, y - minY]), k, squash, minY };
}
function sliceGeometry(cs, o, depth) {
  const { k, squash, minY } = cs;
  let cx = 0, cy = 0;
  cs.pts.forEach(([x, y]) => { cx += x; cy += y; });
  cx /= cs.pts.length; cy /= cs.pts.length;
  const uv = {
    generateTopUV: (g, v, a, b, c) => [a, b, c].map((i) => {
      const x = v[i * 3], y = v[i * 3 + 1] + minY;
      const px = -y / (k * squash) + o.w / 2, py = x / k + o.h / 2;
      return new THREE.Vector2(px / o.w, 1 - py / o.h);
    }),
    generateSideWallUV: (g, v, a, b, c, d) => [a, b, c, d].map((i) => {
      const x = v[i * 3], y = v[i * 3 + 1], z = v[i * 3 + 2];
      return new THREE.Vector2(Math.atan2(y - cy, x - cx) * 0.5 + 0.5, z * 1.4 + 0.3);
    }),
  };
  const shape = new THREE.Shape(cs.pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: Math.min(0.02, depth * 0.2), bevelSize: 0.02, bevelSegments: 2, curveSegments: 4, UVGenerator: uv });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

export function createBandsaw(container, { lite = false, onStage } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const root = new THREE.Group();
  scene.add(root);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-5, 10, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cfc4, 0.6));

  /* ---------- materials ---------- */
  const brushed = brushedTexture();
  const steel = new THREE.MeshStandardMaterial({ color: 0xdfe3e6, metalness: 1, roughness: 0.32, roughnessMap: brushed, envMapIntensity: 1 });
  const steelDark = new THREE.MeshStandardMaterial({ color: 0x9aa1a7, metalness: 1, roughness: 0.4 });
  const enamel = new THREE.MeshPhysicalMaterial({ color: 0xf3f2ee, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  const crimson = new THREE.MeshPhysicalMaterial({ color: 0x9b1515, roughness: 0.4, clearcoat: 0.6 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1f1c1c, roughness: 0.9 });
  const bladeTex = bladeTexture();
  const bladeMat = new THREE.MeshStandardMaterial({ map: bladeTex, metalness: 0.85, roughness: 0.25 });
  const ice = new THREE.MeshPhysicalMaterial({ color: 0xeaf4f8, roughness: 0.15, transmission: 0.0, clearcoat: 1 });

  /* ---------- machine ---------- */
  const add = (geo, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; root.add(m); return m; };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.18 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -3.05; floor.receiveShadow = true; root.add(floor);
  // lower cabinet + feet
  add(new RoundedBoxGeometry(2.4, 2.9, 2.5, 4, 0.08), enamel, 1.1, -1.55, 0);
  add(new RoundedBoxGeometry(2.46, 0.5, 2.56, 3, 0.06), crimson, 1.1, -2.75, 0);
  [[-0.0, 1.0], [2.2, 1.0], [-0.0, -1.0], [2.2, -1.0]].forEach(([x, z]) => add(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 16), rubber, x, -3.0, z));
  // stainless table
  const table = add(new RoundedBoxGeometry(6.4, 0.14, 3.0, 3, 0.04), steel, 0.6, 0, 0);
  table.material = steel;
  add(new THREE.BoxGeometry(6.4, 0.04, 0.06), steelDark, 0.6, 0.09, 1.25); // fence rail
  // upper column + wheel housing
  add(new RoundedBoxGeometry(0.7, 3.1, 0.8, 3, 0.06), enamel, 1.95, 1.6, -0.75);
  const housing = add(new RoundedBoxGeometry(2.3, 1.7, 1.15, 5, 0.18), enamel, 1.15, 3.6, -0.2);
  const plate = add(new THREE.PlaneGeometry(1.7, 0.53), new THREE.MeshStandardMaterial({ map: plateTexture(), roughness: 0.5 }), 1.15, 3.62, 0.38, false);
  plate.receiveShadow = false;
  add(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0xc8202f, roughness: 0.3 }), 2.05, 3.0, 0.38).rotation.x = Math.PI / 2; // stop button
  add(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0x2f9e55, roughness: 0.3, emissive: 0x0f3a1f }), 2.05, 2.72, 0.38).rotation.x = Math.PI / 2;
  // blade (runs from the housing down through the table) + guide
  const blade = add(new THREE.BoxGeometry(0.025, 3.2, 0.22), bladeMat, BLADE_X, 1.55, 0.05);
  add(new RoundedBoxGeometry(0.34, 0.36, 0.5, 2, 0.04), steelDark, BLADE_X, 2.62, 0.05); // upper blade guide
  add(new THREE.BoxGeometry(0.3, 0.06, 0.5), steel, BLADE_X, 0.1, 0.05); // throat plate
  // thickness gauge plate (moves with the chosen thickness)
  const gauge = add(new RoundedBoxGeometry(0.06, 1.1, 1.8, 2, 0.02), steel, BLADE_X + 0.3, 0.62, 0.05);
  // pusher carriage
  const pusher = add(new RoundedBoxGeometry(0.12, 1.15, 1.9, 2, 0.03), steel, -2.4, 0.66, 0.05);
  const handle = add(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 12), rubber, -2.6, 1.35, 0.05);
  handle.rotation.x = Math.PI / 2;
  // tray (stainless, with a little crushed ice so it reads as cold)
  const trayX = 2.75;
  add(new RoundedBoxGeometry(2.3, 0.12, 2.3, 3, 0.05), steel, trayX, 0.13, 0.15);
  const iceGroup = new THREE.Group(); root.add(iceGroup);
  for (let i = 0; i < (lite ? 14 : 34); i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + Math.random() * 0.05, 0), ice);
    m.position.set(trayX - 1.05 + Math.random() * 2.1, 0.22, -0.95 + Math.random() * 2.2);
    if (Math.abs(m.position.x - trayX) < 0.8 && Math.abs(m.position.z - 0.15) < 0.8) continue;
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    iceGroup.add(m);
  }

  /* ---------- meat ---------- */
  let A = null;
  let meatMats = null;
  const meat = new THREE.Group(); root.add(meat);
  const pieces = new THREE.Group(); root.add(pieces);
  let spec = { meat: 'beef', style: 'steaks', thickness: 2.5, size: 'medium', weight: 2, marinade: 'none', trim: 'light' };
  let plan = null;
  let tl = 0; // timeline seconds

  const tint = () => {
    const base = { beef: 0xffffff, lamb: 0xffd2cf, chicken: 0xffe2d4 }[spec.meat] || 0xffffff;
    const mar = { none: null, 'peri-peri': 0xff8a5c, tikka: 0xffa060, 'lemon-herb': 0xfff0b0, 'garlic-herb': 0xf6f0d8, bbq: 0xb8653a }[spec.marinade];
    const c = new THREE.Color(base);
    if (mar) c.multiply(new THREE.Color(mar));
    return c;
  };
  function buildMats() {
    const c = tint();
    meatMats = [
      new THREE.MeshPhysicalMaterial({ map: A.face, bumpMap: A.face, bumpScale: 1.2, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.3, color: c }),
      new THREE.MeshPhysicalMaterial({ map: A.marb, bumpMap: A.marb, bumpScale: 1, roughness: 0.45, clearcoat: 0.3, color: c }),
    ];
    if (spec.meat === 'chicken') meatMats.forEach((m) => { m.map = A.marb; m.bumpScale = 0.4; m.color = new THREE.Color(0xffd9c8).multiply(spec.marinade !== 'none' ? tint() : new THREE.Color(0xffffff)); });
  }

  function build() {
    if (!A) return;
    meat.clear(); pieces.clear(); pieces.position.set(0, 0, 0);
    buildMats();
    const cs = crossSection(A.outline, spec.meat === 'chicken' ? 1.4 : 2.0, spec.meat === 'chicken' ? 0.5 : 0.72);
    const whole = spec.style === 'whole';
    const minced = spec.style === 'minced';
    const tCm = spec.style === 'steaks' ? spec.thickness : spec.style === 'strips' ? 1.5 : spec.style === 'cubed' ? { small: 1.5, medium: 2.5, large: 4 }[spec.size] : spec.style === 'curry' ? 3.5 : 3;
    const t = tCm / UNIT_CM;
    const sliceKg = Math.max(0.12, tCm * 0.15 * (spec.meat === 'chicken' ? 0.5 : 1));
    const n = whole ? 1 : Math.max(2, Math.min(lite ? 9 : 12, Math.round(spec.weight / sliceKg)));
    const len = whole ? Math.max(1.4, Math.min(3.6, spec.weight * 0.8)) : n * t;
    const geo = sliceGeometry(cs, A.outline, whole ? len : t);
    const slices = [];
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(geo, meatMats);
      m.castShadow = m.receiveShadow = true;
      // stand the slice up: extrusion (z) runs along x, toward the blade
      m.rotation.y = Math.PI / 2;
      m.userData = { i, cut: false, landed: false };
      meat.add(m);
      slices.push(m);
    }
    gauge.position.x = BLADE_X + t + 0.03;
    gauge.visible = !whole;
    plan = { n, t, len, slices, whole, minced, cs, tCm, done: false };
    tl = 0;
    stage('Weighing ' + spec.weight + ' kg on the scale');
  }

  let lastStage = '';
  const stage = (txt) => { if (txt !== lastStage) { lastStage = txt; onStage?.(txt); } };

  /* tray layout: fanned rows of face-up slices */
  const trayPos = (i, n) => {
    const cols = Math.min(4, Math.ceil(Math.sqrt(n)));
    const r = Math.floor(i / cols), c = i % cols;
    return new THREE.Vector3(trayX - 0.75 + c * 0.5 + r * 0.06, 0.24 + i * 0.012, -0.55 + r * 0.55);
  };

  function prepPieces() {
    // after slicing: turn the slices on the tray into the chosen preparation
    const style = spec.style;
    if (style === 'steaks' || style === 'whole') return;
    const geoCube = { small: 0.15, medium: 0.24, large: 0.38 }[spec.size] || 0.24;
    const mats = meatMats;
    plan.slices.forEach((s) => (s.visible = false));
    pieces.position.set(0, 0, 0);
    const add = (geo, x, z, rotY = 0, y = 0.3) => { const m = new THREE.Mesh(geo, mats[1]); m.position.set(x, y, z); m.rotation.y = rotY; m.castShadow = true; m.scale.setScalar(0.01); m.userData.grow = Math.random() * 0.4; pieces.add(m); return m; };
    if (style === 'cubed' || style === 'curry') {
      const count = Math.min(40, plan.n * (style === 'curry' ? 3 : 4));
      for (let i = 0; i < count; i++) {
        const s = style === 'curry' ? 0.2 + Math.random() * 0.16 : geoCube;
        const m = add(new RoundedBoxGeometry(s, s * (0.8 + Math.random() * 0.3), s * (0.85 + Math.random() * 0.3), 2, s * 0.15), trayX - 0.85 + Math.random() * 1.7, -0.75 + Math.random() * 1.8, Math.random() * 3, 0.26 + Math.random() * 0.12);
        if (style === 'curry' && Math.random() < 0.35) {
          const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, s * 1.1, 10), new THREE.MeshStandardMaterial({ color: 0xefe3cc, roughness: 0.6 }));
          bone.rotation.z = Math.PI / 2; bone.position.y = s * 0.2; m.add(bone);
        }
      }
    } else if (style === 'strips') {
      for (let i = 0; i < Math.min(30, plan.n * 4); i++) add(new RoundedBoxGeometry(0.62, 0.07, 0.11, 2, 0.02), trayX - 0.6 + Math.random() * 1.2, -0.8 + Math.random() * 1.9, Math.random() * 0.6 - 0.3, 0.24 + Math.random() * 0.1);
    } else if (style === 'minced') {
      const cap = new THREE.CapsuleGeometry(0.022, 0.08, 2, 5);
      const count = lite ? 380 : 900;
      const mound = new THREE.InstancedMesh(cap, mats[1], count);
      const d = new THREE.Object3D();
      for (let i = 0; i < count; i++) {
        const r = Math.pow(Math.random(), 0.6) * 0.8, a = Math.random() * Math.PI * 2;
        const h = (1 - r / 0.8) * 0.55;
        d.position.set(trayX + Math.cos(a) * r, 0.22 + Math.random() * h, 0.15 + Math.sin(a) * r);
        d.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        d.updateMatrix(); mound.setMatrixAt(i, d.matrix);
      }
      mound.castShadow = true; mound.scale.setScalar(0.01); mound.userData.grow = 0;
      pieces.add(mound);
    }
  }

  function addStrings(target) {
    const twine = new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: 0.8 });
    for (let i = 0; i < 4; i++) {
      const ys = plan.cs.pts.map((p) => p[1]), zs = plan.cs.pts.map((p) => p[0]);
      const hgt = Math.max(...ys), wid = Math.max(...zs) - Math.min(...zs);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(wid / 2 + 0.03, 0.018, 6, 48), twine);
      ring.scale.set(1, (hgt + 0.06) / (wid + 0.06), 1);
      ring.position.set(-plan.len / 2 + (i + 0.5) * (plan.len / 4), hgt / 2, 0);
      ring.rotation.y = Math.PI / 2;
      target.add(ring);
    }
  }

  /* ---------- timeline ---------- */
  const qStand = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
  const qTmp = new THREE.Quaternion();
  const Z_AXIS = new THREE.Vector3(0, 0, 1);
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  function update(dt) {
    if (!plan) return;
    tl += dt;
    const { n, t, slices } = plan;
    const lead = 0.9; // weighing + trim pause
    const per = plan.whole ? 2.4 : 0.85; // seconds per slice
    const cutEnd = lead + n * per;
    const prepEnd = cutEnd + (spec.style === 'steaks' || plan.whole ? 0.4 : 1.4);
    const hold = prepEnd + 2.6;
    // feed position: how many slices have passed the blade (continuous)
    const fed = Math.max(0, Math.min(n, (tl - lead) / per));
    if (tl < lead) stage(spec.trim === 'none' ? `Weighing ${spec.weight} kg` : `Trimming fat · ${spec.trim === 'all' ? 'trim all' : 'light trim'}`);
    else if (tl < cutEnd) stage(plan.whole ? 'Preparing your roast' : `Cutting ${spec.style === 'steaks' ? (spec.meat === 'lamb' ? 'chops' : 'steaks') : 'portions'} at ${plan.tCm} cm · slice ${Math.min(n, Math.floor(fed) + 1)} of ${n}`);
    else if (tl < prepEnd) stage({ cubed: 'Dicing into cubes', curry: 'Cutting curry pieces on the bone', strips: 'Slicing into strips', minced: 'Mincing fresh', whole: 'Tying the roast', steaks: 'Arranging on ice' }[spec.style]);
    else stage(spec.marinade !== 'none' ? `Marinating · ${spec.marinade.replace('-', ' & ')} · vacuum packing` : 'Vacuum packed & ready ✓');

    // the loin (uncut slices) slides toward the blade; pusher follows the back end
    const backX = BLADE_X - (n - fed) * t;
    pusher.position.x = Math.min(BLADE_X - 0.08, backX - 0.08);
    handle.position.x = pusher.position.x - 0.2;
    slices.forEach((s, i) => {
      if (plan.whole) {
        const p = ease(Math.max(0, Math.min(1, (tl - lead) / (per * 0.9))));
        const from = new THREE.Vector3(BLADE_X - plan.len / 2 - 0.4, 0.07, 0.05);
        const to = new THREE.Vector3(trayX, 0.2, 0.15);
        s.position.lerpVectors(from, to, p);
        s.position.y += Math.sin(p * Math.PI) * 0.8;
        s.quaternion.copy(qStand);
        if (p >= 1 && !s.userData.tied) { s.userData.tied = true; addStrings(pieces); pieces.position.copy(to); }
        return;
      }
      const cutAt = lead + (i + 1) * per - per * 0.35;
      if (tl < cutAt) {
        // still part of the roll, standing on the table and being fed toward the blade
        s.position.set(BLADE_X - (i + 0.5) * t + Math.min(fed, i + 0.999) * t, 0.07, 0.05);
        s.quaternion.copy(qStand);
      } else {
        // cut: falls past the blade and lands face-up, shingled on the iced tray
        const p = ease(Math.min(1, (tl - cutAt) / 0.6));
        const from = new THREE.Vector3(BLADE_X + t * 0.6, 0.07, 0.05);
        const to = new THREE.Vector3(trayX - 0.55 + i * Math.min(0.17, 1.5 / n), 0.22 + i * 0.02, 0.15 + (i % 2 ? 0.05 : -0.05));
        s.position.lerpVectors(from, to, p);
        s.position.y += Math.sin(p * Math.PI) * 0.6;
        qTmp.setFromAxisAngle(Z_AXIS, p * (Math.PI / 2 - 0.12));
        s.quaternion.copy(qStand).premultiply(qTmp);
      }
    });
    if (tl >= cutEnd && !plan.done) { plan.done = true; prepPieces(); }
    pieces.children.forEach((m) => { if (m.scale.x < 1 && tl > cutEnd + (m.userData.grow || 0)) m.scale.setScalar(Math.min(1, m.scale.x + dt * 3)); });
    if (tl > hold) build(); // loop the demo
  }

  /* ---------- sizing / loop ---------- */
  const resize = () => {
    const w = container.clientWidth || 600, h = container.clientHeight || 500;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const portrait = w / h < 0.95;
    const wide = w / h > 1.4;
    camera.position.set(-4.6, portrait ? 7.4 : 6.2, portrait ? 17 : wide ? 12.5 : 14);
    camera.lookAt(0.95, 0.75, 0);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let raf = 0, last = performance.now(), running = true;
  const mouse = { x: 0, tx: 0 };
  const onMove = (e) => { const r = container.getBoundingClientRect(); mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2; };
  container.addEventListener('pointermove', onMove);
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    bladeTex.offset.y -= dt * 6; // the band runs downward through the table
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    root.rotation.y = -0.18 + mouse.x * 0.12;
    update(dt);
    renderer.render(scene, camera);
  }
  frame();
  const io = new IntersectionObserver(([e]) => { running = e.isIntersecting; last = performance.now(); });
  io.observe(container);

  loadAssets().then((a) => {
    if (!renderer.domElement.isConnected) return;
    A = a;
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(a.hdr).texture;
    scene.environmentIntensity = 0.9;
    pm.dispose();
    build();
    container.dispatchEvent(new CustomEvent('saw:ready'));
  }).catch(() => container.dispatchEvent(new CustomEvent('saw:error')));

  return {
    set(next) {
      const rebuild = ['meat', 'style', 'thickness', 'size', 'weight', 'marinade'].some((k) => next[k] !== undefined && next[k] !== spec[k]);
      spec = { ...spec, ...next };
      if (rebuild) build();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      container.removeEventListener('pointermove', onMove);
      scene.traverse((o) => { o.geometry?.dispose?.(); });
      scene.environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      renderer.domElement.remove();
    },
  };
}
