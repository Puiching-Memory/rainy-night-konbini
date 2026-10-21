import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* ------------------------------------------------------------------ *
 *  Rainy Night Konbini — shared rendering helpers
 * ------------------------------------------------------------------ */

export const JP = '"Yu Gothic", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", "Meiryo", "MS PGothic", sans-serif';
export const EN = '"Trebuchet MS", "Segoe UI", "Arial", sans-serif';
export const MONO = '"Consolas", "Courier New", monospace';

export const C = {
  ink: 0x0a1118,
  inkSoft: 0x101c26,
  asphalt: 0x1b242e,
  asphaltLight: 0x283440,
  sidewalk: 0x73787c,
  sidewalkLight: 0x969a9b,
  curb: 0xa8aaa5,
  cream: 0xeee6d4,
  creamDim: 0xc9c3b6,
  teal: 0x167a74,
  tealDeep: 0x0b4f4f,
  mint: 0x84c9b5,
  orange: 0xef9b47,
  coral: 0xd9665a,
  pink: 0xe96f95,
  warm: 0xffca85,
  warmDeep: 0xf39b4a,
  lamp: 0xfff2cf,
  cool: 0xa6d8e8,
  neonBlue: 0x54c7ed,
  neonPink: 0xff709a,
  neonGreen: 0x69e5b0,
  metal: 0x93a0a5,
  metalDark: 0x3a454b,
  wood: 0x3d2c26,
  woodLight: 0x8d6f56,
};

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/* deterministic pseudo random -------------------------------------- */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(0x1a2b3c4d);

/* ------------------------------------------------------------------ *
 *  Canvas textures
 * ------------------------------------------------------------------ */
export const textureCache = new Map();

export function canvasTexture(w, h, draw, opts = {}) {
  const key = opts.key;
  if (key && textureCache.has(key)) return textureCache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  draw(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, opts.anisotropy ?? 8);
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  if (opts.linear) {
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
  }
  tex.needsUpdate = true;
  if (key) textureCache.set(key, tex);
  return tex;
}

export function roundedPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function fillRound(ctx, x, y, w, h, r, fill) {
  roundedPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function strokeRound(ctx, x, y, w, h, r, stroke, lineWidth = 1) {
  roundedPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function coverText(ctx, text, x, y, maxWidth, size, fill, font = JP, weight = '700', align = 'center') {
  ctx.save();
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

export function starPath(ctx, cx, cy, outer, inner, points = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i * Math.PI) / points;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/* ------------------------------------------------------------------ *
 *  Textures that are reused all over the diorama
 * ------------------------------------------------------------------ */
const glowTex = canvasTexture(256, 256, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.12, 'rgba(255,255,255,.92)');
  g.addColorStop(0.32, 'rgba(255,255,255,.42)');
  g.addColorStop(0.68, 'rgba(255,255,255,.075)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}, { key: 'glow-radial' });
export { glowTex };

export const softShadowTex = canvasTexture(256, 256, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(0,0,0,.55)');
  g.addColorStop(0.45, 'rgba(0,0,0,.28)');
  g.addColorStop(0.78, 'rgba(0,0,0,.07)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}, { key: 'soft-shadow' });

export const streakTex = canvasTexture(96, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, 'rgba(255,255,255,0)');
  gx.addColorStop(0.38, 'rgba(255,255,255,.48)');
  gx.addColorStop(0.5, 'rgba(255,255,255,.95)');
  gx.addColorStop(0.62, 'rgba(255,255,255,.48)');
  gx.addColorStop(1, 'rgba(255,255,255,0)');
  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, 'rgba(255,255,255,0)');
  gy.addColorStop(0.14, 'rgba(255,255,255,.62)');
  gy.addColorStop(0.4, 'rgba(255,255,255,.25)');
  gy.addColorStop(0.72, 'rgba(255,255,255,.07)');
  gy.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  // broken glints
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + rng() * 0.2})`;
    const y = rng() * h;
    ctx.fillRect(w * 0.32, y, w * 0.36, 1 + rng() * 4);
  }
}, { key: 'light-streak' });

export const rainStreakTex = canvasTexture(32, 128, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.2, 'rgba(220,245,255,.6)');
  g.addColorStop(0.65, 'rgba(235,250,255,.2)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.45, w * 0.16, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(220,240,255,.5)';
  ctx.fillRect(w * 0.46, 0, w * 0.06, h * 0.25);
}, { key: 'rain-streak' });

export const glassDropsTex = canvasTexture(768, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  // A soft veil of wet glass
  const veil = ctx.createLinearGradient(0, 0, w, h);
  veil.addColorStop(0, 'rgba(190,220,240,0.035)');
  veil.addColorStop(0.4, 'rgba(210,235,250,0.08)');
  veil.addColorStop(1, 'rgba(160,195,220,0.02)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);
  // beads
  for (let i = 0; i < 260; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 0.7 + Math.pow(rng(), 3) * 4.2;
    const a = 0.07 + rng() * 0.2;
    const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, 0, x, y, r * 1.2);
    g.addColorStop(0, `rgba(255,255,255,${a * 1.9})`);
    g.addColorStop(0.5, `rgba(190,225,245,${a * 0.7})`);
    g.addColorStop(1, 'rgba(180,210,235,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // rivulets
  for (let i = 0; i < 17; i++) {
    const x = rng() * w;
    const y = rng() * h * 0.6;
    const len = 24 + rng() * 180;
    const g = ctx.createLinearGradient(x, y, x + 4, y + len);
    g.addColorStop(0, 'rgba(230,245,255,.0)');
    g.addColorStop(0.22, 'rgba(230,245,255,.15)');
    g.addColorStop(1, 'rgba(230,245,255,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 0.8 + rng() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 3, y + len * 0.4, x - 2, y + len * 0.75, x + 1, y + len);
    ctx.stroke();
    ctx.fillStyle = 'rgba(235,250,255,.24)';
    ctx.beginPath();
    ctx.arc(x + 1, y + len, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}, { key: 'glass-drops' });

export const causticTex = canvasTexture(128, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,255,255,.55)');
  g.addColorStop(0.28, 'rgba(255,255,255,.22)');
  g.addColorStop(0.7, 'rgba(255,255,255,.04)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(w * 0.38, 0);
  ctx.lineTo(w * 0.62, 0);
  ctx.bezierCurveTo(w * 0.72, h * 0.42, w * 0.9, h * 0.65, w, h);
  ctx.lineTo(0, h);
  ctx.bezierCurveTo(w * 0.12, h * 0.7, w * 0.3, h * 0.4, w * 0.38, 0);
  ctx.fill();
}, { key: 'caustic' });

/* ground textures --------------------------------------------------- */
export const asphaltTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#354553';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 12000; i++) {
    const v = 37 + Math.floor(rng() * 48);
    ctx.fillStyle = `rgba(${v},${v + 8},${v + 17},${0.2 + rng() * 0.35})`;
    ctx.fillRect(rng() * w, rng() * h, 0.7 + rng() * 2.8, 0.5 + rng() * 2.2);
  }
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(13,18,23,${0.18 + rng() * 0.18})`;
    ctx.lineWidth = 0.8 + rng() * 1.8;
    ctx.beginPath();
    let x = rng() * w;
    let y = rng() * h;
    ctx.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      x += (rng() - 0.5) * 70;
      y += 10 + rng() * 38;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // worn patches
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = `rgba(74,82,87,${0.04 + rng() * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, 20 + rng() * 90, 8 + rng() * 35, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}, { key: 'asphalt', repeat: [3.4, 3.4] });

export const pavingTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#8c9092';
  ctx.fillRect(0, 0, w, h);
  const cols = 4;
  const rows = 4;
  const tw = w / cols;
  const th = h / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = 128 + Math.floor(rng() * 23);
      ctx.fillStyle = `rgb(${v},${v + 3},${v + 2})`;
      ctx.fillRect(x * tw + 1, y * th + 1, tw - 2, th - 2);
      ctx.fillStyle = 'rgba(255,255,255,.035)';
      ctx.fillRect(x * tw + 4, y * th + 4, tw - 8, 3);
      for (let k = 0; k < 50; k++) {
        const g = 110 + Math.floor(rng() * 60);
        ctx.fillStyle = `rgba(${g},${g + 3},${g + 6},${0.06 + rng() * 0.15})`;
        ctx.fillRect(x * tw + rng() * tw, y * th + rng() * th, 0.6 + rng() * 2, 0.6 + rng() * 2);
      }
    }
  }
  ctx.strokeStyle = 'rgba(46,52,55,.55)';
  ctx.lineWidth = 2.4;
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * tw, 0);
    ctx.lineTo(x * tw, h);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * th);
    ctx.lineTo(w, y * th);
    ctx.stroke();
  }
  // little damp stains
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(60,75,80,${0.035 + rng() * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, 12 + rng() * 80, 8 + rng() * 40, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}, { key: 'paving', repeat: [4.4, 4.4] });

export const tactileTex = canvasTexture(256, 128, (ctx, w, h) => {
  ctx.fillStyle = '#c4a84e';
  ctx.fillRect(0, 0, w, h);
  const dot = 9;
  for (let y = dot; y < h; y += 25) {
    for (let x = dot; x < w; x += 25) {
      const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, dot);
      g.addColorStop(0, 'rgba(255,240,171,.9)');
      g.addColorStop(0.55, 'rgba(206,176,81,.9)');
      g.addColorStop(1, 'rgba(113,92,36,.6)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, dot, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(82,67,26,.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, w - 4, h - 4);
}, { key: 'tactile', repeat: [8, 1] });

export const interiorFloorTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#e9dfc9';
  ctx.fillRect(0, 0, w, h);
  const tile = 128;
  for (let y = 0; y < h; y += tile) {
    for (let x = 0; x < w; x += tile) {
      const v = 225 + Math.floor(rng() * 17);
      ctx.fillStyle = `rgb(${v},${v - 5},${v - 19})`;
      ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
      ctx.fillStyle = 'rgba(255,255,255,.15)';
      ctx.fillRect(x + 2, y + 2, tile - 4, 2);
    }
  }
  ctx.strokeStyle = 'rgba(133,121,103,.5)';
  ctx.lineWidth = 2;
  for (let p = 0; p <= w; p += tile) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(w, p);
    ctx.stroke();
  }
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = `rgba(110,106,96,${0.02 + rng() * 0.035})`;
    ctx.fillRect(rng() * w, rng() * h, 6 + rng() * 42, 2 + rng() * 20);
  }
}, { key: 'interior-floor', repeat: [5, 4] });

/* ------------------------------------------------------------------ *
 *  Toon material + outline helpers
 * ------------------------------------------------------------------ */
function makeGradientMap() {
  const data = new Uint8Array([82, 118, 158, 205, 240, 255]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}
export const toonGradient = makeGradientMap();

const materialCache = new Map();
export function toon(color, opts = {}) {
  const key = JSON.stringify({
    c: color,
    e: opts.emissive ?? 0,
    ei: opts.emissiveIntensity ?? 1,
    m: opts.map ? opts.map.uuid : 0,
    t: opts.transparent ?? false,
    o: opts.opacity ?? 1,
    s: opts.side ?? 0,
    d: opts.depthWrite ?? true,
  });
  if (!opts.fresh && materialCache.has(key)) return materialCache.get(key);
  const mat = new THREE.MeshToonMaterial({
    color,
    gradientMap: toonGradient,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    map: opts.map ?? null,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    depthWrite: opts.depthWrite ?? true,
    alphaTest: opts.alphaTest ?? 0,
    vertexColors: false,
  });
  mat.fog = opts.fog ?? true;
  if (opts.name) mat.name = opts.name;
  if (!opts.fresh) materialCache.set(key, mat);
  return mat;
}

export function basic(color, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({
    color,
    map: opts.map ?? null,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    blending: opts.blending ?? THREE.NormalBlending,
    depthWrite: opts.depthWrite ?? true,
    alphaTest: opts.alphaTest ?? 0,
    toneMapped: false,
  });
  mat.fog = opts.fog ?? false;
  return mat;
}

/* Outline via near-inverted hull. Object-space expansion gives a
 * slightly hand-inked, variable line which suits the cel look. */
const outlineMatCache = new Map();
export function outlineMaterial(width = 0.009, color = 0x071019) {
  const key = `${width.toFixed(4)}-${color}`;
  if (outlineMatCache.has(key)) return outlineMatCache.get(key);
  const mat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      uniform float uWidth;
      void main() {
        vec3 p = position + normal * uWidth;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
      }
    `,
    uniforms: {
      uWidth: { value: width },
      uColor: { value: new THREE.Color(color) },
    },
    side: THREE.BackSide,
    depthWrite: true,
    depthTest: true,
    fog: false,
  });
  outlineMatCache.set(key, mat);
  return mat;
}

export function addOutline(mesh, width = 0.009, color = 0x050b12) {
  if (!mesh?.geometry || !mesh.material) return mesh;
  if (Array.isArray(mesh.material) || mesh.material.transparent) return mesh;
  const outline = new THREE.Mesh(mesh.geometry, outlineMaterial(width * 1.5, color));
  outline.name = 'ink-outline';
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.matrixAutoUpdate = false;
  outline.userData.noOutline = true;
  mesh.add(outline);
  mesh.userData.hasOutline = true;
  return mesh;
}

/* ------------------------------------------------------------------ *
 *  Geometry + object helpers
 * ------------------------------------------------------------------ */
export function shadowMesh(mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

export function box(w, h, d, material, opts = {}) {
  const geo = new THREE.BoxGeometry(w, h, d, opts.segX ?? 1, opts.segY ?? 1, opts.segZ ?? 1);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  if (opts.outline !== false) addOutline(mesh, opts.outlineWidth ?? 0.009, opts.outlineColor);
  if (opts.name) mesh.name = opts.name;
  return mesh;
}

export function roundedBox(w, h, d, r, material, opts = {}) {
  const geo = new RoundedBoxGeometry(w, h, d, opts.segments ?? 2, Math.min(r, Math.min(w, h, d) / 2));
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  if (opts.outline !== false) addOutline(mesh, opts.outlineWidth ?? 0.008, opts.outlineColor);
  if (opts.name) mesh.name = opts.name;
  return mesh;
}

export function cyl(rTop, rBottom, h, material, opts = {}) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, opts.radialSegments ?? 16, opts.heightSegments ?? 1, opts.openEnded ?? false);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  if (opts.outline !== false) addOutline(mesh, opts.outlineWidth ?? 0.006, opts.outlineColor);
  if (opts.name) mesh.name = opts.name;
  return mesh;
}

export function sphere(r, material, opts = {}) {
  const geo = new THREE.SphereGeometry(r, opts.segments ?? 16, opts.rings ?? 10);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  if (opts.outline !== false) addOutline(mesh, opts.outlineWidth ?? 0.005, opts.outlineColor);
  return mesh;
}

export function torus(radius, tube, material, opts = {}) {
  const geo = new THREE.TorusGeometry(radius, tube, opts.radialSegments ?? 8, opts.tubularSegments ?? 24);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = false;
  return mesh;
}

export function add(parent, obj, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) {
  obj.position.set(x, y, z);
  obj.rotation.set(rx, ry, rz);
  parent.add(obj);
  return obj;
}

export function flatPlane(w, h, material, opts = {}) {
  const geo = new THREE.PlaneGeometry(w, h, opts.segX ?? 1, opts.segY ?? 1);
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = opts.receive ?? false;
  mesh.castShadow = opts.cast ?? false;
  return mesh;
}

export function horizontalPlane(w, d, material) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

export function decalTexturePlane(tex, w, h, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: opts.transparent ?? true,
    opacity: opts.opacity ?? 1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    side: opts.side ?? THREE.FrontSide,
    toneMapped: false,
    blending: opts.blending ?? THREE.NormalBlending,
    alphaTest: opts.alphaTest ?? 0,
  });
  mat.fog = false;
  const mesh = flatPlane(w, h, mat);
  mesh.renderOrder = opts.renderOrder ?? 3;
  return mesh;
}

export function signFace(tex, w, h, opts = {}) {
  const tint = opts.tint ?? 0xffffff;
  const color = new THREE.Color(tint);
  if (opts.boost) color.multiplyScalar(opts.boost);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    color,
    side: opts.side ?? THREE.FrontSide,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    depthWrite: opts.depthWrite ?? true,
    toneMapped: false,
  });
  mat.fog = false;
  const mesh = flatPlane(w, h, mat);
  mesh.renderOrder = opts.renderOrder ?? 1;
  return mesh;
}

export function glowSprite(tex, color, sx, sy, opacity = 0.5, opts = {}) {
  const c = new THREE.Color(color);
  if (opts.boost) c.multiplyScalar(opts.boost);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    color: c,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: opts.depthTest ?? true,
    blending: opts.blending ?? THREE.AdditiveBlending,
    toneMapped: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(sx, sy, 1);
  sprite.renderOrder = opts.renderOrder ?? 5;
  return sprite;
}

export function cylinderBetween(a, b, radius, material, opts = {}) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, opts.radialSegments ?? 8, 1, opts.openEnded ?? false);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? false;
  if (opts.outline) addOutline(mesh, opts.outlineWidth ?? 0.005, opts.outlineColor);
  return mesh;
}

export function tubeFromPoints(points, radius, material, opts = {}) {
  const curve = new THREE.CatmullRomCurve3(points, opts.closed ?? false, opts.curveType ?? 'catmullrom', opts.tension ?? 0.45);
  const geo = new THREE.TubeGeometry(curve, opts.segments ?? Math.max(16, points.length * 8), radius, opts.radialSegments ?? 5, opts.closed ?? false);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = opts.cast ?? false;
  mesh.receiveShadow = false;
  return mesh;
}

export function sagCurve(a, b, sag = 0.5, segments = 18) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = lerp(a.x, b.x, t);
    const z = lerp(a.z, b.z, t);
    const y = lerp(a.y, b.y, t) - Math.sin(Math.PI * t) * sag;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}

export function makeGlowTexture() {
  return glowTex;
}

/* contact shadow ---------------------------------------------------- */
export function contactShadow(w, d, opacity = 0.45, color = 0x02060b) {
  const mat = new THREE.MeshBasicMaterial({
    map: softShadowTex,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 2;
  return mesh;
}

/* ground reflection smear ------------------------------------------ */
export function reflectionSmear(w, len, color, opacity = 0.35, tex = streakTex) {
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, len), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 2;
  return mesh;
}

export function lightPool(w, d, color, opacity = 0.55) {
  const mat = new THREE.MeshBasicMaterial({
    map: glowTex,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 2;
  return mesh;
}

/* UI-free subtle billboard flare around a lamp */
export function lampGlow(color, size, opacity) {
  const s = glowSprite(glowTex, color, size, size, opacity, { renderOrder: 4 });
  return s;
}

/* aspect-fit camera helper — useful when polishing composition */
export function fitCameraToBox(camera, box, padding = 1.15) {
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = padding * Math.max(fitHeightDistance, fitWidthDistance);
  return { center, distance };
}
