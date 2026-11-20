/* =====================================================================
   FLYING STEAK · an original tap-to-fly game for Iqbal's
   Tap / click / Space to flap a real photographed ribeye through gaps
   between hanging cleavers and upright butcher knives. Gold halaal
   coins give bonus points. Signed-in players earn Rewards points.
   ===================================================================== */
import { BRANCHES, REWARDS } from '../config/site.js';
import { $, ICON, esc, reduceMotion } from '../lib/ui.js';
import { addGameScore, gameBest, gameTop, currentUser } from '../lib/store.js';
import { stopScroll, startScroll } from '../lib/motion.js';

const W = 400; // logical width
const H = 640; // logical height
const GROUND = 64;
const STEAK_W = 74; // sprite length

export function render(params, query) {
  const oid = query?.get?.('order');
  return `<section class="game-page" data-theme="light">
    <div class="wrap game-wrap">
      <header class="game-head">
        ${oid ? `<a class="game-back" href="#/success/${encodeURIComponent(oid)}">${ICON.arrow} Back to order #${oid.replace(/[^A-Za-z0-9]/g, '')} · see its status</a>` : ''}
        <p class="eyebrow">Iqbal’s Arcade</p>
        <h1 class="h-lg">Flying <span class="it">Steak</span></h1>
        <p class="lead">Tap to flap. Dodge the cleavers and knives, grab the gold halaal coins, and score Rewards points (up to ${REWARDS.gameMax} a day when you’re signed in).</p>
      </header>
      <div class="game-stage" id="gameStage" tabindex="0" aria-label="Flying Steak game. Press space or tap to flap.">
        <canvas id="gameCanvas" width="${W}" height="${H}"></canvas>
        <div class="game-ui" id="gameUI"></div>
      </div>
      <aside class="game-side">
        <div class="card-box"><h3>How to play</h3>
          <ul class="game-how"><li><b>Tap</b>, <b>click</b> or press <b>Space</b> to flap</li><li>Fly through the gaps between the blades</li><li>Gold coins = +1 bonus</li><li>Each point = 5 Rewards points (signed in)</li></ul></div>
        <div class="card-box"><h3>Top scores</h3><ol class="game-top" id="gameTop"></ol></div>
      </aside>
    </div>
  </section>`;
}

/* ---------- sprites ---------- */
let steakSprite = null;
function loadSteak() {
  if (steakSprite) return Promise.resolve(steakSprite);
  return Promise.all([
    fetch('models/steak-outline.json').then((r) => r.json()),
    new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'models/steak.jpg'; }),
  ]).then(([o, img]) => {
    const k = STEAK_W / o.h; // long axis (photo height) becomes horizontal
    const c = document.createElement('canvas');
    const dpr = 3;
    c.width = Math.ceil(o.h * k * dpr);
    c.height = Math.ceil(o.w * k * dpr);
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    g.translate(0, o.w * k);
    g.rotate(-Math.PI / 2);
    g.scale(k, k);
    const path = new Path2D();
    o.poly.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
    path.closePath();
    g.save();
    g.clip(path);
    g.drawImage(img, 0, 0, o.w, o.h);
    g.restore();
    g.lineWidth = 6 / k / 6;
    g.strokeStyle = 'rgba(60,10,10,.35)';
    g.stroke(path);
    steakSprite = { c, w: o.h * k, h: o.w * k };
    return steakSprite;
  }).catch(() => null);
}

function tilePattern(ctx) {
  const t = document.createElement('canvas');
  t.width = 60; t.height = 30;
  const g = t.getContext('2d');
  g.fillStyle = '#f7f4ef'; g.fillRect(0, 0, 60, 30);
  g.strokeStyle = 'rgba(31,28,28,.08)'; g.lineWidth = 1.5;
  g.strokeRect(0.75, 0.75, 58.5, 13.5); g.strokeRect(-29.25, 15.75, 58.5, 13.5); g.strokeRect(30.75, 15.75, 58.5, 13.5);
  return ctx.createPattern(t, 'repeat');
}

/* ---------- drawing ---------- */
function drawCleaver(g, x, w, bottomY) {
  // hanging cleaver: handle at the top, wide blade down to the gap
  const handleH = Math.min(70, bottomY * 0.35);
  g.fillStyle = '#5a3a22';
  roundRect(g, x + w * 0.32, -10, w * 0.36, handleH + 10, 6); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + w * 0.36, 0, 3, handleH);
  g.fillStyle = '#c9c9c9'; g.beginPath(); g.arc(x + w * 0.5, handleH * 0.3, 3, 0, 7); g.fill();
  const top = handleH - 4;
  const grd = g.createLinearGradient(x, 0, x + w, 0);
  grd.addColorStop(0, '#8e959b'); grd.addColorStop(0.45, '#e6e9ec'); grd.addColorStop(0.55, '#c5cbd0'); grd.addColorStop(1, '#7b8288');
  g.fillStyle = grd;
  g.beginPath(); g.moveTo(x, top); g.lineTo(x + w, top); g.lineTo(x + w, bottomY - 6); g.quadraticCurveTo(x + w, bottomY, x + w - 6, bottomY); g.lineTo(x, bottomY - 10); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x + 2, bottomY - 14, w - 6, 3); // sharp edge glint
  g.fillStyle = '#f3f0eb'; g.beginPath(); g.arc(x + w * 0.78, top + 14, 6, 0, 7); g.fill(); // hanging hole
}
/* Sharp butcher knife. dir = -1 points up (rests on the counter), 1 points down (hangs from a rail).
   tipY is the very point of the blade. Straight spine on the left, curved razor edge sweeping into a needle tip. */
function drawKnife(g, x, w, tipY, dir) {
  const base = dir < 0 ? H - GROUND : 0;
  const len = Math.abs(base - tipY);
  const handleH = Math.min(70, len * 0.3);
  const heel = base + (dir < 0 ? -handleH : handleH); // where blade meets bolster
  const spine = x + w * 0.18, edge = x + w - 3;
  const tipX = spine + 2;
  const belly = tipY - dir * Math.min(70, len * 0.45);
  // blade body
  const grd = g.createLinearGradient(spine, 0, edge, 0);
  grd.addColorStop(0, '#6f777e'); grd.addColorStop(0.35, '#dfe4e8'); grd.addColorStop(0.62, '#f7f9fa'); grd.addColorStop(0.8, '#b9c0c6'); grd.addColorStop(1, '#8a9298');
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(spine, heel);
  g.lineTo(spine, tipY - dir * 26);
  g.lineTo(tipX, tipY); // needle point
  g.quadraticCurveTo(edge, belly, edge, tipY - dir * Math.min(len * 0.62, 120));
  g.lineTo(edge, heel);
  g.closePath();
  g.fill();
  // honed edge bevel + glint
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(tipX + 1, tipY - dir * 3); g.quadraticCurveTo(edge - 2, belly, edge - 2, tipY - dir * Math.min(len * 0.62, 120)); g.lineTo(edge - 2, heel); g.stroke();
  g.strokeStyle = 'rgba(40,45,50,.35)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(spine + 0.5, heel); g.lineTo(spine + 0.5, tipY - dir * 26); g.lineTo(tipX, tipY); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(spine + w * 0.18, Math.min(heel, tipY - dir * 40), 2, Math.abs(heel - (tipY - dir * 40)));
  // bolster + handle with rivets
  g.fillStyle = '#2b2522'; roundRect(g, x + 2, heel - 5, w - 2, 10, 3); g.fill();
  const hy = dir < 0 ? heel + 5 : base - 2;
  g.fillStyle = '#4a2e1a'; roundRect(g, x + w * 0.16, hy, w * 0.7, handleH - 7, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + w * 0.22, hy + 3, 3, handleH - 13);
  g.fillStyle = '#d8d2c8'; [0.28, 0.62].forEach((f) => { g.beginPath(); g.arc(x + w * 0.51, hy + (handleH - 7) * f, 2.6, 0, 7); g.fill(); });
}
/* Hanging meat hooks with boerewors (background decoration) */
function drawHooks(g, scroll, left, right) {
  g.save();
  g.translate(-((scroll * 0.18) % 220), 0);
  for (let x = Math.floor(left / 220) * 220 - 220; x < right + 440; x += 220) {
    g.strokeStyle = 'rgba(120,120,125,.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x + 40, 0); g.lineTo(x + 40, 150); g.arc(x + 46, 150, 6, Math.PI, Math.PI * 0.2, true); g.stroke();
    g.strokeStyle = 'rgba(122,40,28,.28)'; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + 40, 158); g.bezierCurveTo(x + 10, 200, x + 70, 230, x + 30, 270); g.stroke();
    g.lineCap = 'butt';
  }
  g.restore();
}
/* WebAudio blips (no files needed) */
function makeAudio() {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('iqbals.mute') === '1'; } catch { /* ignore */ }
  const ensure = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  const tone = (f1, f2, dur, type = 'sine', vol = 0.12) => {
    if (muted) return; const c = ensure(); if (!c) return;
    const o = c.createOscillator(), gn = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, c.currentTime); o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + dur);
    gn.gain.setValueAtTime(vol, c.currentTime); gn.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(gn).connect(c.destination); o.start(); o.stop(c.currentTime + dur);
  };
  return {
    flap: () => tone(520, 260, 0.12, 'triangle', 0.08),
    coin: () => { tone(988, 988, 0.08, 'sine', 0.1); setTimeout(() => tone(1319, 1319, 0.14, 'sine', 0.1), 70); },
    hit: () => { tone(1800, 120, 0.35, 'square', 0.07); tone(240, 60, 0.4, 'sawtooth', 0.06); },
    point: () => tone(660, 880, 0.07, 'sine', 0.05),
    get muted() { return muted; },
    toggle() { muted = !muted; try { localStorage.setItem('iqbals.mute', muted ? '1' : '0'); } catch { /* ignore */ } return muted; },
  };
}
const MEDALS = [[50, 'Iqbal’s Legend', '#9b1515'], [30, 'Gold', '#d4a417'], [20, 'Silver', '#9aa3ab'], [10, 'Bronze', '#b0703c']];
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function drawCoin(g, c, t) {
  const s = Math.abs(Math.cos(t * 4 + c.x * 0.05));
  g.save(); g.translate(c.x, c.y); g.scale(Math.max(0.15, s), 1);
  const grd = g.createRadialGradient(-4, -4, 2, 0, 0, 14);
  grd.addColorStop(0, '#fff7a8'); grd.addColorStop(0.6, '#f4dc3c'); grd.addColorStop(1, '#c9a51e');
  g.fillStyle = grd; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill();
  g.strokeStyle = '#9b7a10'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = '#9b1515'; g.font = '700 14px Kalam, cursive'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', 0, 1);
  g.restore();
}

/* ---------- game ---------- */
export function mount(root) {
  const stage = $('#gameStage', root);
  const canvas = $('#gameCanvas', root);
  const ui = $('#gameUI', root);
  const g = canvas.getContext('2d');
  let dpr = 1, raf = 0, last = 0, t = 0;
  let tiles = null;
  const rm = reduceMotion();

  const S = (window.__flyingSteak = { mode: 'ready', y: H * 0.42, vy: 0, rot: 0, score: 0, pipes: [], coins: [], spawn: 0, speed: 150, scroll: 0, parts: [], flash: 0, best: gameBest(), trail: [], pops: [], shake: 0, slow: 0 });
  const sfx = makeAudio();
if (!import.meta.env.DEV) delete window.__flyingSteak;

  const fit = () => {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    tiles = tilePattern(g);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(stage);
  fit();
  loadSteak();

  const drawTop = () => {
    $('#gameTop', root).innerHTML = gameTop().length ? gameTop().map((s) => `<li><span>${esc(s.name)}</span><b>${s.score}</b></li>`).join('') : '<li class="muted">No scores yet. Be the first!</li>';
  };
  drawTop();

  const overlay = (html) => { ui.innerHTML = html; ui.classList.toggle('is-on', !!html); };
  const readyScreen = () => overlay(`<div class="game-card"><span class="game-badge">${ICON.game}</span><h2>Flying Steak</h2><p>Tap, click or press Space to flap.<br>Mind the blades!</p>
    ${S.best ? `<p class="game-best">Your best: <b>${S.best}</b></p>` : ''}<button class="btn" data-play>Play ${ICON.arrow}</button></div>`);
  readyScreen();

  function reset() {
    Object.assign(S, { mode: 'play', y: H * 0.42, vy: 0, rot: 0, score: 0, pipes: [], coins: [], spawn: 0.6, speed: 150, parts: [], flash: 0, trail: [], pops: [], shake: 0, slow: 0 });
    overlay('');
    stage.focus({ preventScroll: true });
    if (innerWidth < 720) stopScroll();
  }
  function flap() {
    if (S.mode === 'ready') { reset(); }
    if (S.mode !== 'play') return;
    S.vy = -330;
    sfx.flap();
    // sizzle sparks + air puff
    for (let i = 0; i < 7; i++) S.parts.push({ x: 110 - 24, y: S.y + 6, vx: -80 - Math.random() * 90, vy: (Math.random() - 0.2) * 120, life: 0.45 + Math.random() * 0.2, c: i % 2 ? '#ffd166' : 'rgba(255,255,255,.9)', r: 1.6 + Math.random() * 2 });
  }
  function crash() {
    if (S.mode !== 'play') return;
    S.mode = 'over';
    S.flash = 1;
    S.shake = 1;
    S.slow = 0.6;
    sfx.hit();
    for (let i = 0; i < 18; i++) S.parts.push({ x: 110, y: S.y, vx: (Math.random() - 0.5) * 380, vy: (Math.random() - 0.7) * 320, life: 0.7, c: i % 3 ? '#9b1515' : '#f1e2cf', r: 2 + Math.random() * 3 });
    if (navigator.vibrate) navigator.vibrate(60);
    const pts = addGameScore(S.score);
    const isBest = S.score > S.best;
    S.best = Math.max(S.best, S.score);
    drawTop();
    startScroll();
    const u = currentUser();
    const share = `I scored ${S.score} in Flying Steak at Iqbal's Meat & Deli! 🥩🔪 Can you beat me? ${location.href.split('#')[0]}#/game`;
    const medal = MEDALS.find(([min]) => S.score >= min);
    setTimeout(() => overlay(`<div class="game-card">${medal ? `<span class="game-medal" style="--m:${medal[2]}">${medal[1]}</span>` : `<span class="game-badge game-badge--over">${ICON.knife}</span>`}<h2>${S.score >= 30 ? 'Braai legend!' : S.score >= 10 ? 'Sharp flying!' : 'Chopped!'}</h2>
      <div class="game-score"><div><small>Score</small><b>${S.score}</b></div><div><small>Best</small><b>${S.best}</b></div></div>
      ${isBest && S.score > 0 ? '<p class="game-new">New personal best! 🎉</p>' : ''}
      <p class="game-pts">${u ? (pts ? `+${pts} Rewards points earned` : `Daily game points maxed (${REWARDS.gameMax}). Come back tomorrow!`) : '<a href="#/login?next=game">Sign in</a> to earn Rewards points for your scores'}</p>
      <div class="game-actions"><button class="btn" data-play>Play again ${ICON.arrow}</button>
        <a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(share)}">${ICON.whatsapp} Challenge a friend</a></div>
      <p class="game-medals">Medals: Bronze 10 · Silver 20 · Gold 30 · Legend 50</p></div>`), 700);
  }

  /* ---------- loop ---------- */
  function step(dt) {
    t += dt;
    if (S.mode === 'play') {
      S.speed = Math.min(270, 150 + S.score * 4.5);
      S.vy += 1250 * dt;
      S.y += S.vy * dt;
      S.rot += ((Math.max(-0.45, Math.min(1.2, S.vy / 520))) - S.rot) * Math.min(1, dt * 10);
      S.scroll += S.speed * dt;
      S.spawn -= dt;
      if (S.spawn <= 0) {
        const gap = Math.max(138, 182 - S.score * 1.6);
        const minTop = 80, maxTop = H - GROUND - gap - 110;
        const top = minTop + Math.random() * (maxTop - minTop);
        const moving = S.score >= 12 && Math.random() < 0.4;
        S.pipes.push({ x: W + 30, w: 58, top, gap, moving, phase: Math.random() * 6, passed: false, topType: Math.random() < 0.45 ? 'cleaver' : 'knife' });
        if (Math.random() < 0.55) S.coins.push({ x: W + 30 + 29 + (S.speed * 1.55) / 2, y: top + gap / 2 + (Math.random() - 0.5) * 40, got: false });
        S.spawn = Math.max(1.15, 1.55 - S.score * 0.01);
      }
      const sx = 110, sy = S.y;
      S.pipes.forEach((p) => {
        p.x -= S.speed * dt;
        if (p.moving) p.top += Math.sin(t * 2 + p.phase) * 30 * dt;
        if (!p.passed && p.x + p.w < sx - 20) { p.passed = true; S.score++; sfx.point(); S.pops.push({ x: sx + 30, y: sy - 30, t: 0.8, txt: '+1' }); }
        // collision: steak ≈ ellipse 26 × 16; blade tips are narrow, so the tip zone only hits near the spine
        const rx = 26, ry = 16;
        if (sx + rx > p.x + 6 && sx - rx < p.x + p.w - 4) {
          const nearSpine = sx - rx < p.x + p.w * 0.55;
          const topLimit = p.top - (p.topType === 'knife' && !nearSpine ? 24 : 2);
          const botLimit = p.top + p.gap + (nearSpine ? 2 : 24);
          if (sy - ry < topLimit || sy + ry > botLimit) crash();
        }
      });
      S.pipes = S.pipes.filter((p) => p.x > -90);
      S.coins.forEach((c) => {
        c.x -= S.speed * dt;
        if (!c.got && Math.hypot(c.x - sx, c.y - sy) < 30) {
          c.got = true; S.score++; sfx.coin(); S.pops.push({ x: c.x, y: c.y - 20, t: 0.9, txt: '+1', gold: true });
          for (let i = 0; i < 10; i++) S.parts.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, life: 0.6, c: '#f4dc3c' });
        }
      });
      S.coins = S.coins.filter((c) => c.x > -30 && !c.got);
      if (S.y + 16 > H - GROUND) { S.y = H - GROUND - 16; crash(); }
      if (S.y < 18) { S.y = 18; S.vy = Math.max(S.vy, 0); }
    } else if (S.mode === 'ready') {
      S.y = H * 0.42 + Math.sin(t * 3) * 10;
      S.rot = Math.sin(t * 3) * 0.08;
      S.scroll += 60 * dt;
    } else if (S.mode === 'over') {
      if (S.y + 16 < H - GROUND) { S.vy += 1400 * dt; S.y = Math.min(H - GROUND - 16, S.y + S.vy * dt); S.rot = Math.min(1.5, S.rot + dt * 5); }
    }
    if (S.mode === 'play') { S.trail.unshift({ y: S.y, rot: S.rot }); S.trail.length = Math.min(S.trail.length, 6); }
    S.pops.forEach((p) => { p.t -= dt; p.y -= 40 * dt; });
    S.pops = S.pops.filter((p) => p.t > 0);
    S.shake = Math.max(0, S.shake - dt * 2.5);
    S.slow = Math.max(0, S.slow - dt);
    S.parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; });
    S.parts = S.parts.filter((p) => p.life > 0);
    S.flash = Math.max(0, S.flash - dt * 3);
  }

  function draw() {
    const cw = canvas.width, ch = canvas.height;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#f3f0eb'; g.fillRect(0, 0, cw, ch);
    // world → screen: scale to cover height, centre horizontally (extra width shows more wall)
    const sc = ch / H;
    const ox = (cw - W * sc) / 2;
    const shx = S.shake ? (Math.random() - 0.5) * 14 * S.shake : 0, shy = S.shake ? (Math.random() - 0.5) * 14 * S.shake : 0;
    g.setTransform(sc, 0, 0, sc, ox + shx * sc, shy * sc);
    const left = -ox / sc, right = W + ox / sc;
    // tiled wall with parallax
    g.save(); g.translate(-(S.scroll * 0.3) % 60, 0); g.fillStyle = tiles || '#f7f4ef'; g.fillRect(left - 60, 0, right - left + 120, H); g.restore();
    // crimson dado band + sign
    g.fillStyle = '#9b1515'; g.fillRect(left, H - GROUND - 46, right - left, 10);
    g.save(); g.translate(-((S.scroll * 0.12) % 520) + 300, 0);
    for (let i = -1; i < 3; i++) {
      const sx = i * 520;
      g.fillStyle = '#6b0f14'; roundRect(g, sx, 60, 150, 70, 10); g.fill();
      g.font = '700 30px Kalam, cursive'; g.textAlign = 'center'; g.fillStyle = '#e0202a'; g.fillText('IQBAL’S', sx + 77, 100); g.fillStyle = '#f4ec3c'; g.fillText('IQBAL’S', sx + 75, 98);
      g.font = '700 12px Kalam, cursive'; g.fillStyle = '#fff'; g.fillText('MEAT & DELI', sx + 75, 118);
    }
    g.restore();
    drawHooks(g, S.scroll, left, right);
    // obstacles: hanging knife or cleaver from the rail, razor-sharp knife up from the counter
    S.pipes.forEach((p) => { if (p.topType === 'knife') drawKnife(g, p.x, p.w, p.top, 1); else drawCleaver(g, p.x, p.w, p.top); drawKnife(g, p.x, p.w, p.top + p.gap, -1); });
    S.coins.forEach((c) => drawCoin(g, c, t));
    // counter
    const gy = H - GROUND;
    const wood = g.createLinearGradient(0, gy, 0, H);
    wood.addColorStop(0, '#8a5a34'); wood.addColorStop(1, '#5a3a22');
    g.fillStyle = wood; g.fillRect(left, gy, right - left, GROUND);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(left, gy, right - left, 3);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1;
    for (let x = left - (S.scroll % 48); x < right; x += 48) { g.beginPath(); g.moveTo(x, gy + 14); g.lineTo(x + 30, gy + 14); g.moveTo(x + 18, gy + 36); g.lineTo(x + 46, gy + 36); g.stroke(); }
    // particles
    S.parts.forEach((p) => { g.globalAlpha = Math.max(0, p.life * 1.6); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r || 3, 0, 7); g.fill(); });
    g.globalAlpha = 1;
    // motion trail
    if (steakSprite && S.mode === 'play') S.trail.forEach((tr, i) => { if (i < 2) return; g.save(); g.globalAlpha = 0.16 - i * 0.02; g.translate(110 - i * 7, tr.y); g.rotate(tr.rot); g.drawImage(steakSprite.c, -steakSprite.w / 2, -steakSprite.h / 2, steakSprite.w, steakSprite.h); g.restore(); });
    // the steak
    g.save(); g.translate(110, S.y); g.rotate(S.rot);
    const squash = S.mode === 'play' && S.vy < -200 ? 0.92 : 1;
    g.scale(1 / squash, squash);
    g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 10; g.shadowOffsetY = 6;
    if (steakSprite) g.drawImage(steakSprite.c, -steakSprite.w / 2, -steakSprite.h / 2, steakSprite.w, steakSprite.h);
    else { g.fillStyle = '#9b1515'; g.beginPath(); g.ellipse(0, 0, 32, 22, 0, 0, 7); g.fill(); }
    g.restore();
    // score
    if (S.mode !== 'ready') {
      g.font = '700 64px Kalam, cursive'; g.textAlign = 'center';
      g.fillStyle = '#e0202a'; g.fillText(S.score, W / 2 + 3, 92);
      g.fillStyle = '#f4ec3c'; g.fillText(S.score, W / 2, 89);
      g.lineWidth = 2; g.strokeStyle = '#3a0707'; g.strokeText(S.score, W / 2, 89);
    }
    S.pops.forEach((p) => { g.globalAlpha = Math.min(1, p.t * 2); g.font = '700 26px Kalam, cursive'; g.textAlign = 'center'; g.fillStyle = p.gold ? '#c9a51e' : '#9b1515'; g.fillText(p.txt, p.x, p.y); });
    g.globalAlpha = 1;
    if (S.mode === 'over' && S.slow) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(155,21,21,${S.slow * 0.25})`; g.fillRect(0, 0, cw, ch); }
    if (S.flash) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(255,255,255,${S.flash * 0.7})`; g.fillRect(0, 0, cw, ch); }
  }

  let running = true;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!running) { last = now; return; }
    const dt = Math.min(0.033, (now - (last || now)) / 1000);
    last = now;
    step((rm ? 0.85 : 1) * (S.slow ? 0.35 : 1) * dt);
    draw();
  }
  raf = requestAnimationFrame(loop);

  /* ---------- input ---------- */
  const onDown = (e) => {
    if (e.target.closest('a, button')) return;
    e.preventDefault();
    flap();
  };
  const onKey = (e) => {
    if (!stage.isConnected) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w') {
      if (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      e.preventDefault();
      if (S.mode === 'over' && ui.classList.contains('is-on')) { reset(); return; }
      flap();
    }
  };
  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('keydown', onKey);
  const mute = document.createElement('button');
  mute.className = 'game-mute';
  const muteLabel = () => { mute.innerHTML = sfx.muted ? '🔇' : '🔊'; mute.setAttribute('aria-label', sfx.muted ? 'Sound off' : 'Sound on'); };
  muteLabel();
  mute.addEventListener('pointerdown', (e) => e.stopPropagation());
  mute.addEventListener('click', (e) => { e.stopPropagation(); sfx.toggle(); muteLabel(); });
  stage.appendChild(mute);
  ui.addEventListener('click', (e) => { if (e.target.closest('[data-play]')) { e.stopPropagation(); reset(); } });
  const onVis = () => { running = !document.hidden; };
  document.addEventListener('visibilitychange', onVis);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVis);
    startScroll();
  };
}
