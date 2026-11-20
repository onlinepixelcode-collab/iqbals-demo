/* =====================================================================
   STEAK 3D · photoreal ribeye on a scanned wooden board (Three.js)
   ---------------------------------------------------------------------
   Realism comes from real data, not painted shaders:
   - The steak is a real photographed raw ribeye. Its true outline was
     traced from the photo (public/models/steak-outline.json) and extruded,
     so the top face IS the photograph; the edge walls sample the real
     edge pixels (fat cap where there is fat, meat where there is meat).
   - Cut faces (story section) use a real marbling close-up.
   - Board: CC0 photoscanned "wooden cutting board" by Poly Haven.
   - Lighting: CC0 studio HDRI by Poly Haven + soft shadow key light.
   Used twice: hero (gentle turntable) and story (scroll-driven slicing).
   ===================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

const BASE = 'models/';
const THICK = 0.3; // steak thickness (≈ 2.5 cm at this scale)
const LENGTH = 3.6; // steak length along its long axis

let cache = null; // assets shared by the hero + story instances
function loadAssets(renderer) {
  if (cache) return cache;
  const tex = new THREE.TextureLoader();
  const load = (u) => new Promise((res, rej) => tex.load(BASE + u, res, undefined, rej));
  cache = Promise.all([
    fetch(BASE + 'steak-outline.json').then((r) => r.json()),
    load('steak.jpg'),
    load('marbling.jpg'),
    new Promise((res, rej) => new GLTFLoader().load(BASE + 'board/board.gltf', res, undefined, rej)),
    new Promise((res, rej) => new HDRLoader().load(BASE + 'studio.hdr', res, undefined, rej)),
  ]).then(([outline, steakTex, marbTex, gltf, hdr]) => {
    steakTex.colorSpace = marbTex.colorSpace = THREE.SRGBColorSpace;
    marbTex.wrapS = marbTex.wrapT = THREE.RepeatWrapping;
    steakTex.anisotropy = marbTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    return { outline, steakTex, marbTex, gltf, hdr };
  });
  cache.catch(() => (cache = null));
  return cache;
}

/* Sutherland–Hodgman: clip polygon to a <= x <= b */
function clipX(poly, a, b) {
  const clip = (pts, keep, edgeX) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const pin = keep(p[0]), qin = keep(q[0]);
      if (pin) out.push(p);
      if (pin !== qin) {
        const t = (edgeX - p[0]) / (q[0] - p[0]);
        out.push([edgeX, p[1] + t * (q[1] - p[1])]);
      }
    }
    return out;
  };
  return clip(clip(poly, (x) => x >= a, a), (x) => x <= b, b);
}

/**
 * One steak slab. Shape space: x = steak long axis, y = width.
 * pixel → shape:  sx = (py − h/2)·k,  sy = (px − w/2)·k
 */
function buildSlab(pts, o, k, cuts, mats) {
  const { w, h } = o;
  const toUV = (sx, sy) => [(sy / k + w / 2) / w, 1 - (sx / k + h / 2) / h];
  let cx = 0, cy = 0;
  pts.forEach(([x, y]) => { cx += x; cy += y; });
  cx /= pts.length;
  cy /= pts.length;
  const uvGen = {
    generateTopUV: (g, v, a, b, c) => [a, b, c].map((i) => new THREE.Vector2(...toUV(v[i * 3], v[i * 3 + 1]))),
    generateSideWallUV: (g, v, a, b, c, d) =>
      [a, b, c, d].map((i) => {
        // sample just inside the real edge so walls carry the photo's edge colours
        const x = v[i * 3], y = v[i * 3 + 1];
        const dx = cx - x, dy = cy - y, L = Math.hypot(dx, dy) || 1;
        return new THREE.Vector2(...toUV(x + (dx / L) * 0.05, y + (dy / L) * 0.05));
      }),
  };
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: THICK, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 5, curveSegments: 6, UVGenerator: uvGen });

  let out = geo;
  if (cuts.length) {
    // move the flat cut faces into their own group so they get the marbling texture
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    const tri = pos.count / 3;
    const capTris = geo.groups[0].count / 3;
    const isCut = (t) => cuts.some((cxv) => [0, 1, 2].every((j) => Math.abs(pos.getX(t * 3 + j) - cxv) < 0.11));
    const order = [[], [], []];
    for (let t = 0; t < tri; t++) order[t < capTris ? 0 : isCut(t) ? 2 : 1].push(t);
    const np = new Float32Array(pos.count * 3), nu = new Float32Array(pos.count * 2);
    let n = 0;
    order.forEach((list, gi) =>
      list.forEach((t) => {
        for (let j = 0; j < 3; j++) {
          const s = t * 3 + j;
          np[n * 3] = pos.getX(s); np[n * 3 + 1] = pos.getY(s); np[n * 3 + 2] = pos.getZ(s);
          if (gi === 2) { nu[n * 2] = pos.getY(s) * 0.26 + 0.5; nu[n * 2 + 1] = pos.getZ(s) * 0.85 + 0.3; }
          else { nu[n * 2] = uv.getX(s); nu[n * 2 + 1] = uv.getY(s); }
          n++;
        }
      })
    );
    out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(np, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(nu, 2));
    out.addGroup(0, (order[0].length + order[1].length) * 3, 0);
    out.addGroup((order[0].length + order[1].length) * 3, order[2].length * 3, 1);
    geo.dispose();
  }
  out.computeVertexNormals();
  const mesh = new THREE.Mesh(out, cuts.length ? mats : mats[0]);
  mesh.rotation.x = -Math.PI / 2; // lay flat: top face → +Y
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

export function createSteakScene(container, { mode = 'hero', lite = false, onLabels } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; // keeps the photograph's true colours
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const world = new THREE.Group();
  scene.add(world);

  const key = new THREE.DirectionalLight(0xfff4e6, 2.2);
  key.position.set(-4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe2d6, 0.8);
  rim.position.set(5, 3, -6);
  scene.add(rim);

  // soft contact shadow cast onto the page itself
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.2 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  world.add(ground);

  /* cold-room mist: soft sprites that roll low across the board */
  const mist = [];
  {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,0.9)'); grd.addColorStop(0.4, 'rgba(235,244,248,0.45)'); grd.addColorStop(1, 'rgba(235,244,248,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    for (let i = 0; i < (lite ? 7 : 14); i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
      const sc = 2.2 + Math.random() * 2.6;
      m.scale.set(sc * 1.6, sc * 0.55, 1);
      m.userData = { x0: -5 + Math.random() * 10, z: -2.2 + Math.random() * 4.4, y: 0.25 + Math.random() * 0.6, sp: 0.18 + Math.random() * 0.25, ph: Math.random() * 10, max: 0.16 + Math.random() * 0.16 };
      mist.push(m);
      world.add(m);
    }
  }
  const steak = new THREE.Group();
  const slices = [];
  let boardTop = 0;
  let ready = false;
  let intro = 0;

  loadAssets(renderer)
    .then(({ outline, steakTex, marbTex, gltf, hdr }) => {
      if (!renderer.domElement.isConnected) return;
      const pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromEquirectangular(hdr).texture;
      scene.environmentIntensity = 0.85;
      pm.dispose();

      // board: ~6.4 units long, resting on the ground
      const board = gltf.scene.clone(true);
      const size = new THREE.Box3().setFromObject(board).getSize(new THREE.Vector3());
      board.scale.setScalar(5.6 / Math.max(size.x, size.z));
      if (size.z > size.x) board.rotation.y = Math.PI / 2;
      board.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(board);
      board.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
      boardTop = bb.max.y - bb.min.y;
      board.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; m.material.envMapIntensity = 0.7; } });
      world.add(board);

      // wet raw meat: soft clear sheen over the real photo texture
      const meat = new THREE.MeshPhysicalMaterial({ map: steakTex, bumpMap: steakTex, bumpScale: 1.4, roughness: 0.46, clearcoat: lite ? 0.15 : 0.32, clearcoatRoughness: 0.32, specularIntensity: 0.6, sheen: 0.2, sheenColor: new THREE.Color(0xffd6cf) });
      meat.onBeforeCompile = (sh) => {
        sh.uniforms.marbMap = { value: marbTex };
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP; varying vec3 vON;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position; vON = normal;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D marbMap; varying vec3 vOP; varying vec3 vON;').replace('#include <map_fragment>', `#include <map_fragment>
          float wall = 1.0 - smoothstep(0.45, 0.8, abs(normalize(vON).z));
          if (wall > 0.0) {
            vec3 grain = texture2D(marbMap, vec2(atan(vOP.y, vOP.x) * 0.9 + vOP.x * 0.15, vOP.z * 1.6 + 0.2)).rgb;
            float fat = smoothstep(0.42, 0.62, dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11)));
            vec3 wallC = mix(grain * 0.92, diffuseColor.rgb * (0.82 + 0.3 * dot(grain, vec3(0.33))), fat);
            diffuseColor.rgb = mix(diffuseColor.rgb, wallC, wall);
          }`);
      };
      const cut = new THREE.MeshPhysicalMaterial({ map: marbTex, bumpMap: marbTex, bumpScale: 1.2, roughness: 0.4, clearcoat: lite ? 0.2 : 0.45, clearcoatRoughness: 0.28 });

      const k = LENGTH / Math.max(outline.w, outline.h);
      const poly = outline.poly.map(([px, py]) => [(py - outline.h / 2) * k, (px - outline.w / 2) * k]);
      const xs = poly.map((p) => p[0]);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const N = mode === 'story' ? 4 : 1;
      const cutsAt = Array.from({ length: N - 1 }, (_, i) => minX + ((maxX - minX) * (i + 1)) / N);
      for (let i = 0; i < N; i++) {
        const a = i === 0 ? minX - 1 : cutsAt[i - 1];
        const b = i === N - 1 ? maxX + 1 : cutsAt[i];
        const g = new THREE.Group();
        g.add(buildSlab(N === 1 ? poly : clipX(poly, a, b), outline, k, cutsAt, [meat, cut]));
        g.userData.cx = (Math.max(a, minX) + Math.min(b, maxX)) / 2;
        steak.add(g);
        slices.push(g);
      }
      steak.position.y = boardTop + 0.002;
      steak.rotation.y = 0.35;
      world.add(steak);
      ready = true;
      container.dispatchEvent(new CustomEvent('steak:ready'));
    })
    .catch((e) => {
      console.warn('3D assets failed to load', e);
      container.dispatchEvent(new CustomEvent('steak:error'));
    });

  const resize = () => {
    const w = container.clientWidth || innerWidth;
    const h = container.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const portrait = w / h < 1.05;
    const dist = portrait ? (mode === 'story' ? 25 : 19) : 15;
    camera.position.set(0, dist * 0.62, dist * 0.78);
    world.position.set(portrait ? 0 : mode === 'hero' ? 2.25 : 2.2, portrait ? 1.9 : 0, portrait ? 0 : -0.4);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; };
  window.addEventListener('pointermove', onMove, { passive: true });

  let progress = 0;
  const v3 = new THREE.Vector3();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let running = true, raf = 0, last = performance.now(), time = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    if (ready) {
      intro = Math.min(1, intro + dt * 0.75);
      const ie = easeOut(intro);
      if (mode === 'hero') {
        // the butcher lays the steak on the board, then a slow turntable
        steak.position.y = boardTop + 0.002 + (1 - ie) * 2.4;
        steak.rotation.z = (1 - ie) * 0.3;
        world.rotation.y = -0.45 + Math.sin(time * 0.18) * 0.35 + mouse.x * 0.12;
      } else {
        const p = progress;
        const split = smooth(0.05, 0.26, p);
        const active = Math.min(3, Math.max(0, Math.floor((p - 0.08) / 0.23)));
        world.rotation.y += ((-0.3 + p * 0.5 + mouse.x * 0.08) - world.rotation.y) * 0.06;
        slices.forEach((s, i) => {
          const isA = i === active && split > 0.5;
          s.position.x += ((i - 1.5) * split * 0.75 - s.position.x) * 0.09;
          s.position.y += ((isA ? 0.9 : split * 0.06) - s.position.y) * 0.08;
          s.position.z += ((isA ? 0.6 : 0) - s.position.z) * 0.08;
          // the active slice tips up to show its marbled cut face
          s.rotation.z += ((isA ? -0.55 : 0) - s.rotation.z) * 0.08;
          s.rotation.y += ((isA ? 0.4 : 0) - s.rotation.y) * 0.08;
        });
        if (onLabels) {
          const rect = renderer.domElement.getBoundingClientRect();
          onLabels(slices.map((s) => {
            v3.set(s.userData.cx, 0, 0);
            s.localToWorld(v3);
            v3.y += 1.3;
            v3.project(camera);
            return { x: (v3.x * 0.5 + 0.5) * rect.width, y: (-v3.y * 0.5 + 0.5) * rect.height };
          }), active, split);
        }
      }
    }
    mist.forEach((m) => {
      const u = m.userData;
      const span = 11;
      const x = ((u.x0 + time * u.sp + 5.5) % span + span) % span - 5.5;
      m.position.set(x, u.y + Math.sin(time * 0.6 + u.ph) * 0.08 + (ready ? boardTop : 0), u.z);
      const edge = 1 - Math.min(1, Math.abs(x) / 5.2);
      m.material.opacity = u.max * edge * (ready ? 1 : 0.4);
    });
    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.04;
    camera.lookAt(0, 0.4, 0);
    renderer.render(scene, camera);
  }
  frame();

  const io = new IntersectionObserver(([e]) => { running = e.isIntersecting; last = performance.now(); });
  io.observe(container);

  return {
    setProgress: (p) => (progress = p),
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      steak.traverse((o) => o.geometry?.dispose());
      scene.environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      renderer.domElement.remove();
    },
  };
}
