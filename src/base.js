import * as THREE from 'three';
import { LAYOUT } from './layout.js';
import {
  C,
  toon,
  basic,
  box,
  roundedBox,
  cyl,
  add,
  horizontalPlane,
  signFace,
  reflectionSmear,
  lightPool,
  contactShadow,
  glowSprite,
  glowTex,
  streakTex,
  softShadowTex,
  decalTexturePlane,
  canvasTexture,
  rng,
  mulberry32,
  clamp,
} from './utils.js';
import {
  asphaltTex,
  pavingTex,
  tactileTex,
  basePlaqueTex,
  parkingSignTex,
  roadStopTex,
} from './textures.js';

const HALF = LAYOUT.topHalf;
const CURB_X = LAYOUT.curbX;
const CURB_Z = LAYOUT.curbZ;
const SIDEWALK_Y = LAYOUT.sidewalkY;
const ROAD_Y = LAYOUT.roadY;

const puddleTex = canvasTexture(512, 512, (ctx, w, h) => {
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, '#a3b5be');
  base.addColorStop(0.36, '#617986');
  base.addColorStop(1, '#1d303b');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  // stretched neon / window reflections
  const bands = [
    [0.32, 0.08, 'rgba(255,179,99,.58)'],
    [0.45, 0.035, 'rgba(247,213,153,.36)'],
    [0.58, 0.055, 'rgba(90,203,221,.32)'],
    [0.68, 0.03, 'rgba(255,121,158,.27)'],
    [0.76, 0.045, 'rgba(150,197,218,.23)'],
  ];
  for (const [yy, hh, color] of bands) {
    const grad = ctx.createLinearGradient(0, h * (yy - hh), 0, h * (yy + hh));
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h * (yy - hh), w, h * hh * 2);
  }
  // broken reflected highlights
  for (let i = 0; i < 34; i++) {
    const x = rng() * w;
    const y = h * (0.28 + rng() * 0.52);
    const len = 8 + rng() * 70;
    ctx.fillStyle = `rgba(222,241,243,${0.025 + rng() * 0.16})`;
    ctx.fillRect(x, y, 1 + rng() * 3, len * 0.25);
  }
  // soft sky sheen
  const sheen = ctx.createRadialGradient(w * 0.55, h * 0.15, 4, w * 0.55, h * 0.15, w * 0.7);
  sheen.addColorStop(0, 'rgba(153,186,201,.24)');
  sheen.addColorStop(1, 'rgba(153,186,201,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  // almost-invisible ripple rings
  for (let i = 0; i < 9; i++) {
    ctx.strokeStyle = `rgba(216,235,241,${0.035 + rng() * 0.04})`;
    ctx.lineWidth = 1 + rng();
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, 15 + rng() * 45, 5 + rng() * 12, rng() * 0.2 - 0.1, 0, Math.PI * 2);
    ctx.stroke();
  }
}, { key: 'puddle-water' });

const neonWetTex = canvasTexture(320, 1024, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const bands = [
    { x: 0.28, w: 0.11, a: 0.8 },
    { x: 0.47, w: 0.18, a: 1.0 },
    { x: 0.67, w: 0.075, a: 0.64 },
    { x: 0.82, w: 0.045, a: 0.4 },
  ];
  for (const band of bands) {
    const x = w * band.x;
    const bw = w * band.w;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.08, `rgba(255,255,255,${0.3 * band.a})`);
    g.addColorStop(0.24, `rgba(255,255,255,${0.65 * band.a})`);
    g.addColorStop(0.48, `rgba(255,255,255,${0.14 * band.a})`);
    g.addColorStop(0.62, `rgba(255,255,255,${0.42 * band.a})`);
    g.addColorStop(0.82, `rgba(255,255,255,${0.05 * band.a})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    // wobbly wet column
    ctx.beginPath();
    ctx.moveTo(x - bw, 0);
    for (let yy = 0; yy <= h; yy += 24) {
      const wobble = Math.sin(yy * 0.035 + band.x * 20) * bw * 0.4 + Math.sin(yy * 0.011) * bw * 0.2;
      ctx.lineTo(x - bw + wobble, yy);
    }
    for (let yy = h; yy >= 0; yy -= 24) {
      const wobble = Math.cos(yy * 0.029 + band.x * 14) * bw * 0.35;
      ctx.lineTo(x + bw + wobble, yy);
    }
    ctx.closePath();
    ctx.fill();
    // broken horizontal glints
    for (let i = 0; i < 8; i++) {
      const yy = h * (0.08 + i * 0.09);
      ctx.fillStyle = `rgba(255,255,255,${0.08 + (i % 3) * 0.04})`;
      ctx.fillRect(x - bw * 0.85, yy, bw * (0.8 + (i % 2) * 0.6), 2 + (i % 4) * 2);
    }
  }
}, { key: 'neon-wet-column' });

const wearTex = canvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#f1eee1';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 120; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const rw = 2 + rng() * 22;
    const rh = 1 + rng() * 5;
    ctx.fillStyle = `rgba(95,101,99,${0.08 + rng() * 0.25})`;
    ctx.fillRect(x, y, rw, rh);
  }
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = 'rgba(255,255,250,.32)';
    ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 5, 1 + rng() * 2);
  }
}, { key: 'marking-wear' });

function markingMaterial(color = 0xe7e4d5, opacity = 0.73) {
  const mat = new THREE.MeshBasicMaterial({
    color,
    map: wearTex,
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
    alphaTest: 0.01,
  });
  mat.fog = false;
  return mat;
}

function stripe(w, d, x, z, color = 0xe7e4d5, opacity = 0.72, y = ROAD_Y + 0.01) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), markingMaterial(color, opacity));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.renderOrder = 1;
  return mesh;
}

function addCurb(scene) {
  const frontLen = CURB_X + 8.38;
  const sideLen = CURB_Z + 8.38;
  const curbMat = toon(0xa5a69d);
  const curbSideMat = toon(0x656b6b);
  const topMat = toon(0xc0bfb4);

  const front = box(frontLen, 0.18, 0.17, curbMat, { outlineWidth: 0.006 });
  front.position.set((-8.38 + CURB_X) / 2 + 0.008, 0.09, CURB_Z - 0.015);
  scene.add(front);
  const frontTop = new THREE.Mesh(new THREE.PlaneGeometry(frontLen - 0.02, 0.155), topMat);
  frontTop.rotation.x = -Math.PI / 2;
  frontTop.position.set(front.position.x, 0.181, CURB_Z - 0.015);
  frontTop.receiveShadow = true;
  scene.add(frontTop);

  const side = box(0.17, 0.18, sideLen - 0.17, curbMat, { outlineWidth: 0.006 });
  side.position.set(CURB_X - 0.015, 0.09, (-8.38 + CURB_Z) / 2);
  scene.add(side);
  const sideTop = new THREE.Mesh(new THREE.PlaneGeometry(0.155, sideLen - 0.17), topMat);
  sideTop.rotation.x = -Math.PI / 2;
  sideTop.position.set(CURB_X - 0.015, 0.181, side.position.z);
  sideTop.receiveShadow = true;
  scene.add(sideTop);

  // small chamfer / curb face line
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x2f373a, transparent: true, opacity: 0.48, depthWrite: false, toneMapped: false });
  const frontFaceLine = new THREE.Mesh(new THREE.PlaneGeometry(frontLen, 0.025), lineMat);
  frontFaceLine.position.set(front.position.x, 0.171, CURB_Z - 0.104);
  scene.add(frontFaceLine);
  const sideFaceLine = new THREE.Mesh(new THREE.PlaneGeometry(0.025, sideLen), lineMat);
  sideFaceLine.rotation.y = Math.PI / 2;
  sideFaceLine.position.set(CURB_X - 0.104, 0.171, side.position.z);
  scene.add(sideFaceLine);

  // tactile strips near the corner
  const tactileMat = toon(0xffffff, { map: tactileTex, emissive: 0x2a2510, emissiveIntensity: 0.2 });
  const tactileFront = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.36), tactileMat);
  tactileFront.rotation.x = -Math.PI / 2;
  tactileFront.position.set(1.33, SIDEWALK_Y + 0.004, CURB_Z - 0.42);
  tactileFront.receiveShadow = true;
  scene.add(tactileFront);
  const tactileSide = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 3.0), tactileMat);
  tactileSide.rotation.x = -Math.PI / 2;
  tactileSide.position.set(CURB_X - 0.42, SIDEWALK_Y + 0.004, 1.23);
  tactileSide.receiveShadow = true;
  scene.add(tactileSide);

  // lower wet seam
  const wetSeam = new THREE.Mesh(
    new THREE.PlaneGeometry(frontLen + sideLen, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x18272e, transparent: true, opacity: 0.65, depthWrite: false, toneMapped: false }),
  );
  wetSeam.rotation.x = -Math.PI / 2;
  wetSeam.position.set(-2.65, 0.19, CURB_Z + 0.005);
  scene.add(wetSeam);
}

function addRoadMarkings(scene) {
  const road = new THREE.Group();
  road.name = 'road-markings';
  scene.add(road);

  // Main zebra crossing, kept a little worn and asymmetrical.
  for (let i = 0; i < 8; i++) {
    const z = 3.42 + i * 0.58;
    const mesh = stripe(2.2, 0.31, 1.53 + (i % 3) * 0.006, z, 0xe9e6d7, 0.68);
    road.add(mesh);
  }
  // Side street zebra
  for (let i = 0; i < 8; i++) {
    const x = 3.43 + i * 0.58;
    const mesh = stripe(0.31, 2.2, x, 1.42 + (i % 2) * 0.005, 0xe4e1d2, 0.62);
    road.add(mesh);
  }

  // Stop line for the side street.
  road.add(stripe(2.0, 0.22, 5.02, -0.45, 0xe4dfcf, 0.52));
  // faint lane centre line on the main road
  for (let i = 0; i < 5; i++) {
    const dash = stripe(0.18, 1.25, -6.9 + i * 2.0, 6.15, 0xd9d5c5, 0.34);
    road.add(dash);
  }
  // Long side line along the front curb
  const sideLine = stripe(11.2, 0.13, -3.0, 3.31, 0xd9d5c5, 0.44);
  road.add(sideLine);

  // Parking bay on the side street
  const bay = new THREE.Group();
  const bayLines = [
    [0.13, 2.65, 7.24, -4.56],
    [0.13, 2.65, 7.24, -1.58],
    [2.64, 0.13, 5.96, -3.06],
  ];
  for (const [w, d, x, z] of bayLines) {
    const m = stripe(w, d, x, z, 0xe6e1d0, 0.5);
    bay.add(m);
  }
  bay.add(stripe(0.62, 0.9, 6.72, -3.06, 0xe3dfce, 0.38));
  road.add(bay);
  // wheel stops
  const stopMat = toon(0x9b9b91);
  const ws = box(0.2, 0.16, 0.8, stopMat, { outlineWidth: 0.004 });
  ws.position.set(7.55, 0.1, -3.06);
  road.add(ws);

  // road paint: stop
  const stopTex = new THREE.MeshBasicMaterial({
    map: roadStopTex,
    transparent: true,
    opacity: 0.53,
    depthWrite: false,
    toneMapped: false,
  });
  stopTex.fog = false;
  const stop = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.55), stopTex);
  stop.rotation.x = -Math.PI / 2;
  stop.rotation.z = Math.PI;
  stop.position.set(5.0, ROAD_Y + 0.012, -1.16);
  road.add(stop);

  // small drain gratings
  const grateMat = toon(0x4a5558);
  const grateDark = toon(0x111a1e);
  function addGrate(x, z, len = 1.0, alongX = true) {
    const g = new THREE.Group();
    const recess = box(alongX ? len : 0.33, 0.012, alongX ? 0.33 : len, grateDark, { outline: false });
    recess.position.set(x, ROAD_Y + 0.001, z);
    g.add(recess);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1) - 0.5) * len * 0.82;
      const bar = box(alongX ? 0.035 : 0.3, 0.016, alongX ? 0.3 : 0.035, grateMat, { outline: false, cast: false });
      bar.position.set(alongX ? x + t : x, ROAD_Y + 0.009, alongX ? z : z + t);
      g.add(bar);
    }
    const lipMat = toon(0x737d7c);
    const lipA = box(alongX ? len + 0.05 : 0.06, 0.025, alongX ? 0.06 : len + 0.05, lipMat, { outline: false });
    lipA.position.set(x, ROAD_Y + 0.009, z + (alongX ? 0.18 : 0));
    g.add(lipA);
    if (alongX) {
      const lipB = lipA.clone();
      lipB.position.z = z - 0.18;
      g.add(lipB);
    } else {
      lipA.position.set(x + 0.18, ROAD_Y + 0.009, z);
      const lipB = lipA.clone();
      lipB.position.x = x - 0.18;
      g.add(lipB);
    }
    road.add(g);
  }
  addGrate(-4.7, 3.28, 1.0, true);
  addGrate(1.9, 3.28, 1.1, true);
  addGrate(3.27, -2.4, 1.3, false);

  // manhole covers
  const manholeMat = toon(0x525c5e);
  const rimMat = toon(0x2d373a);
  function manhole(x, z, r) {
    const g = new THREE.Group();
    const rim = cyl(r, r, 0.032, rimMat, { radialSegments: 32, outlineWidth: 0.004 });
    rim.position.set(x, ROAD_Y + 0.002, z);
    g.add(rim);
    const lid = cyl(r * 0.85, r * 0.85, 0.034, manholeMat, { radialSegments: 32, outlineWidth: 0.003 });
    lid.position.set(x, ROAD_Y + 0.017, z);
    g.add(lid);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r * 0.61, 0.009, 5, 32),
      new THREE.MeshBasicMaterial({ color: 0x717a79, transparent: true, opacity: 0.45, toneMapped: false }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, ROAD_Y + 0.036, z);
    g.add(ring);
    for (let i = 0; i < 6; i++) {
      const m = box(r * 0.75, 0.005, 0.012, toon(0x333d3e), { outline: false, cast: false });
      m.position.set(x, ROAD_Y + 0.038, z);
      m.rotation.y = (i / 6) * Math.PI;
      g.add(m);
    }
    road.add(g);
  }
  manhole(-1.95, 5.48, 0.31);
  manhole(4.65, 0.43, 0.28);

  // gutter channel along curb, subtle wet strip
  const gutterMat = new THREE.MeshBasicMaterial({
    color: 0x1d303a,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    toneMapped: false,
  });
  const gutter = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 0.22), gutterMat);
  gutter.rotation.x = -Math.PI / 2;
  gutter.position.set(-2.7, ROAD_Y + 0.008, 3.18);
  road.add(gutter);
  const gutter2 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 11.5), gutterMat);
  gutter2.rotation.x = -Math.PI / 2;
  gutter2.position.set(3.18, ROAD_Y + 0.008, -2.7);
  road.add(gutter2);

  return road;
}

/* ------------------------------------------------------------------ *
 *  Puddles + impressionistic neon reflections
 * ------------------------------------------------------------------ */
function makePuddleShape(seed, radius, stretchX = 1.0, stretchZ = 1.0) {
  const rand = mulberry32(seed);
  const shape = new THREE.Shape();
  const n = 22;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = radius * (0.62 + rand() * 0.48) * (1 + Math.sin(a * 3 + seed) * 0.13);
    pts.push(new THREE.Vector2(Math.cos(a) * r * stretchX, Math.sin(a) * r * stretchZ));
  }
  shape.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < n; i++) shape.lineTo(pts[i].x, pts[i].y);
  shape.closePath();
  return shape;
}

function addPuddle(scene, x, z, y, radius, stretchX, stretchZ, seed, opacity = 0.6) {
  const shape = makePuddleShape(seed, radius, stretchX, stretchZ);
  const geo = new THREE.ShapeGeometry(shape, 12);
  const mat = new THREE.MeshBasicMaterial({
    map: puddleTex,
    color: 0xf0f5f4,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  mat.fog = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y + 0.009, z);
  mesh.renderOrder = 2;
  mesh.receiveShadow = false;
  scene.add(mesh);

  // thin water edge glint
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x87a7b3, transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false });
  const points = shape.getPoints(40).map((p) => new THREE.Vector3(p.x, 0, -p.y));
  const rim = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), edgeMat);
  rim.position.set(x, y + 0.011, z);
  scene.add(rim);

  return { mesh, mat, x, z, y: y + 0.01, radius };
}

function addWarmReflections(scene, info) {
  const glints = [];
  const mk = (x, z, y, w, len, color, opacity, rotY = 0, tex = streakTex) => {
    const wrap = new THREE.Group();
    wrap.position.set(x, y, z);
    wrap.rotation.y = rotY;
    const smear = reflectionSmear(w, len, color, opacity, tex);
    wrap.add(smear);
    scene.add(wrap);
    glints.push(smear.material);
    return wrap;
  };

  // warm light spilling from the store's glass and canopy
  mk(-4.25, 3.08, SIDEWALK_Y + 0.008, 0.6, 4.2, 0xffb36b, 0.14, 0.12);
  mk(-3.25, 2.14, SIDEWALK_Y + 0.008, 0.95, 4.9, 0xffc57e, 0.18, 0.08);
  mk(-1.88, 2.62, SIDEWALK_Y + 0.008, 0.5, 3.7, 0xffd198, 0.15, 0.16);
  mk(-0.65, 2.78, SIDEWALK_Y + 0.008, 0.62, 4.8, 0xffd6a1, 0.2, 0.22);
  mk(0.62, 3.33, SIDEWALK_Y + 0.008, 0.95, 4.3, 0xffce8b, 0.2, 0.28);
  // broad warm pool at the corner entrance
  const doorPool = lightPool(3.1, 2.5, 0xffbb72, 0.28);
  doorPool.position.set(1.05, SIDEWALK_Y + 0.006, 1.35);
  doorPool.rotation.z = 0.2;
  scene.add(doorPool);
  glints.push(doorPool.material);

  // vending machine pools / cool coloured streaks
  const vendA = mk(2.36, -2.6, SIDEWALK_Y + 0.008, 0.78, 4.0, 0x88d8ed, 0.17, Math.PI / 2.2);
  const vendB = mk(2.25, -3.65, SIDEWALK_Y + 0.008, 0.64, 3.4, 0xffa68d, 0.13, Math.PI / 2.1);
  const vendPool = lightPool(2.3, 2.8, 0x6fc9e2, 0.22);
  vendPool.position.set(2.0, SIDEWALK_Y + 0.006, -2.6);
  scene.add(vendPool);
  glints.push(vendPool.material);

  // cafe neon: rose puddle in the alley-side sidewalk
  mk(-5.98, 1.63, SIDEWALK_Y + 0.008, 0.55, 2.8, 0xff7c9e, 0.16, -0.2);
  mk(-6.55, 2.08, SIDEWALK_Y + 0.008, 0.32, 2.1, 0xffa94d, 0.13, 0.2);
  const cafePool = lightPool(2.4, 1.5, 0xffae86, 0.18);
  cafePool.position.set(-6.68, SIDEWALK_Y + 0.005, 1.82);
  scene.add(cafePool);

  // street lamp cold reflection
  mk(-5.3, 4.8, ROAD_Y + 0.009, 0.8, 4.2, 0xb9d7db, 0.13, -0.55);
  mk(4.82, 3.92, ROAD_Y + 0.009, 0.55, 3.9, 0x88e3c0, 0.1, 0.52);
  const lampPool = lightPool(2.5, 3.2, 0xb7d4d6, 0.12);
  lampPool.position.set(-5.8, ROAD_Y + 0.004, 3.36);
  scene.add(lampPool);

  // rear apartment pink neon spill onto the side road
  mk(3.75, -4.46, ROAD_Y + 0.009, 1.05, 5.3, 0xff6f9b, 0.1, 0.25);
  const neonPool = lightPool(4.2, 2.2, 0xff7c9f, 0.09);
  neonPool.position.set(5.2, ROAD_Y + 0.004, -4.5);
  scene.add(neonPool);

  // crosswalk sheen
  mk(1.55, 5.25, ROAD_Y + 0.012, 2.4, 4.7, 0x96adc1, 0.08, 0.02);
  mk(5.25, 1.45, ROAD_Y + 0.012, 4.5, 2.3, 0x8fb7cc, 0.06, Math.PI / 2);

  // narrow, broken streak highlights like real neon smeared by the rain
  mk(-4.28, 2.18, SIDEWALK_Y + 0.011, 0.11, 3.5, 0xffe3ae, 0.3, 0.06);
  mk(-3.1, 2.68, SIDEWALK_Y + 0.011, 0.09, 4.3, 0xffc178, 0.26, 0.12);
  mk(-2.32, 2.2, SIDEWALK_Y + 0.011, 0.08, 3.4, 0xffedc7, 0.24, 0.14);
  mk(-1.42, 2.46, SIDEWALK_Y + 0.011, 0.07, 3.1, 0xffcb86, 0.25, 0.12);
  mk(1.84, -1.24, SIDEWALK_Y + 0.011, 0.09, 3.1, 0x9ce4f1, 0.23, Math.PI / 2.1);
  mk(2.0, -3.1, SIDEWALK_Y + 0.011, 0.08, 2.6, 0xffb8a0, 0.2, Math.PI / 2.1);
  mk(-6.05, 1.9, SIDEWALK_Y + 0.011, 0.07, 2.5, 0xff8fae, 0.2, -0.22);
  mk(5.4, 1.75, ROAD_Y + 0.012, 0.1, 3.2, 0x7ef0c8, 0.22, 0.48);
  mk(-0.1, 5.15, ROAD_Y + 0.012, 0.13, 4.8, 0xffd199, 0.13, 0.18);


  // Traffic signal will later register its coloured reflection intensity here.
  const signalRef = lightPool(1.6, 3.0, 0x63e5a1, 0.24);
  signalRef.position.set(4.25, ROAD_Y + 0.011, 2.0);
  signalRef.scale.set(0.7, 1.4, 1);
  scene.add(signalRef);
  glints.push(signalRef.material);

  for (const mat of glints) {
    mat.opacity = Math.min(0.72, mat.opacity * 2.15);
    mat.color.multiplyScalar(1.22);
  }
  const shotLines = [];
  const mkLine = (x, z, y, w, len, color, opacity, rotY = 0) => {
    const wrap = new THREE.Group();
    wrap.position.set(x, y, z);
    wrap.rotation.y = rotY;
    const sm = reflectionSmear(w, len, color, opacity, streakTex);
    sm.material.color.multiplyScalar(2.0);
    sm.renderOrder = 5;
    wrap.add(sm);
    scene.add(wrap);
    shotLines.push(sm.material);
    glints.push(sm.material);
  };
  mkLine(-4.0, 2.0, SIDEWALK_Y + 0.013, 0.09, 2.5, 0xffd9a1, 0.45, 0.04);
  mkLine(-2.18, 2.25, SIDEWALK_Y + 0.013, 0.06, 2.9, 0xffe3b5, 0.26, 0.08);
  mkLine(-0.5, 2.45, SIDEWALK_Y + 0.013, 0.05, 2.2, 0xffd08a, 0.28, 0.12);
  mkLine(2.35, -1.93, SIDEWALK_Y + 0.013, 0.06, 2.1, 0xb1f3fb, 0.32, Math.PI / 2.2);
  mkLine(4.65, 2.25, ROAD_Y + 0.018, 0.06, 2.4, 0x9cf7d0, 0.42, -0.05);
  mkLine(5.85, 4.0, ROAD_Y + 0.018, 0.06, 2.9, 0xd3f4eb, 0.2, 0.02);

  // Wet-street light columns: deliberately narrow and broken up so they
  // read as reflections at the base of each light rather than as fog.
  const neonSmears = [];
  const mkNeon = (x, z, y, w, len, color, opacity, rotY = 0) => {
    const wrap = new THREE.Group();
    wrap.position.set(x, y, z);
    wrap.rotation.y = rotY;
    const smear = reflectionSmear(w, len, color, opacity, neonWetTex);
    smear.material.color.multiplyScalar(2.1);
    smear.renderOrder = 4;
    wrap.add(smear);
    scene.add(wrap);
    neonSmears.push(smear.material);
    glints.push(smear.material);
    return wrap;
  };
  mkNeon(-4.12, 2.2, SIDEWALK_Y + 0.012, 0.55, 2.8, 0xffb35e, 0.5, 0.07);
  mkNeon(-2.24, 2.32, SIDEWALK_Y + 0.012, 0.7, 3.0, 0xffce8e, 0.4, 0.1);
  mkNeon(-0.58, 2.58, SIDEWALK_Y + 0.012, 0.45, 2.4, 0xffc278, 0.38, 0.14);
  mkNeon(2.36, -2.2, SIDEWALK_Y + 0.012, 0.55, 3.0, 0x2fd5f0, 0.55, Math.PI / 2.2);
  mkNeon(2.2, -3.48, SIDEWALK_Y + 0.012, 0.38, 2.4, 0xff947e, 0.25, Math.PI / 2.2);
  mkNeon(-6.62, 1.86, SIDEWALK_Y + 0.012, 0.36, 2.2, 0xffad62, 0.28, -0.22);
  mkNeon(4.85, -4.22, ROAD_Y + 0.016, 0.42, 3.0, 0xff5d87, 0.3, 0.34);
  mkNeon(4.9, 2.55, ROAD_Y + 0.016, 0.38, 2.5, 0x63f0b0, 0.36, -0.06);
  mkNeon(6.2, 4.35, ROAD_Y + 0.016, 0.55, 2.8, 0x8fe0e6, 0.26, 0.02);
  mkNeon(2.05, 1.45, ROAD_Y + 0.016, 0.32, 2.0, 0x45d6ec, 0.22, -0.32);
  mkNeon(3.7, 0.1, ROAD_Y + 0.016, 0.3, 2.2, 0xff5f8a, 0.16, 0.45);
  mkNeon(-4.6, 4.35, ROAD_Y + 0.016, 0.4, 1.8, 0x73dfab, 0.08, -0.1);
  // the shop's warm reflection stretches out across the wet road
  mkNeon(-3.35, 4.4, ROAD_Y + 0.018, 0.75, 3.8, 0xffad62, 0.36, 0.02);
  mkNeon(-1.65, 4.25, ROAD_Y + 0.018, 0.9, 4.1, 0xffc47c, 0.32, 0.06);
  mkNeon(-0.15, 4.55, ROAD_Y + 0.018, 0.6, 3.4, 0xffb166, 0.34, 0.09);
  mkNeon(2.85, 1.0, ROAD_Y + 0.018, 0.45, 3.8, 0x54d7e9, 0.12, 0.3);

  // broad pools to anchor the lamps on the asphalt
  const streetLampPool = lightPool(2.6, 1.9, 0x91dfe4, 0.22);
  streetLampPool.position.set(6.18, ROAD_Y + 0.019, 4.35);
  streetLampPool.rotation.z = 0.08;
  scene.add(streetLampPool);
  glints.push(streetLampPool.material);
  const shopRoadPool = lightPool(3.4, 2.0, 0xffb56e, 0.15);
  shopRoadPool.position.set(-1.15, ROAD_Y + 0.018, 4.05);
  scene.add(shopRoadPool);
  glints.push(shopRoadPool.material);
  const crossingPool = lightPool(2.0, 1.4, 0xd7f4e9, 0.07);
  crossingPool.position.set(5.1, ROAD_Y + 0.018, 2.05);
  scene.add(crossingPool);
  glints.push(crossingPool.material);

  info.signalReflection = signalRef;
  info.neonSmears = neonSmears;
  info.glints = glints;
  info.vendingPools = [vendPool];
  info.vendA = vendA;
  info.vendB = vendB;
}

function addWetDrainAndSmallProps(scene) {
  // small square drain in the sidewalk close to the shop
  const dark = toon(0x101b1e);
  const metal = toon(0x6f7d7d);
  const g = new THREE.Group();
  const recess = box(0.42, 0.012, 0.42, dark, { outline: false });
  recess.position.set(1.92, SIDEWALK_Y + 0.001, 2.38);
  g.add(recess);
  for (let i = 0; i < 6; i++) {
    const b = box(0.36, 0.012, 0.035, metal, { outline: false, cast: false });
    b.position.set(1.92, SIDEWALK_Y + 0.011, 2.21 + i * 0.057);
    g.add(b);
  }
  scene.add(g);

  // Small square utility cover
  const cover = box(0.36, 0.01, 0.36, toon(0x5b6565), { outline: false, cast: false });
  cover.position.set(-3.05, SIDEWALK_Y + 0.007, 2.35);
  scene.add(cover);
}

function addPlinth(scene) {
  const bodyMat = toon(0x2b211d);
  const bodyMat2 = toon(0x352824);
  const brassMat = toon(0x8a7347);
  const footMat = toon(0x171413);

  const topSlab = box(LAYOUT.plinthHalf * 2, 0.2, LAYOUT.plinthHalf * 2, bodyMat, { outlineWidth: 0.012 });
  topSlab.position.y = -0.1;
  scene.add(topSlab);
  const lip = box(LAYOUT.plinthHalf * 2 + 0.12, 0.055, LAYOUT.plinthHalf * 2 + 0.12, brassMat, { outlineWidth: 0.006 });
  lip.position.y = -0.008;
  scene.add(lip);
  const lip2 = box(LAYOUT.plinthHalf * 2 + 0.05, 0.04, LAYOUT.plinthHalf * 2 + 0.05, bodyMat2, { outlineWidth: 0.005 });
  lip2.position.y = -0.058;
  scene.add(lip2);

  const body = box(LAYOUT.plinthHalf * 2 - 0.3, 0.62, LAYOUT.plinthHalf * 2 - 0.3, bodyMat, { outlineWidth: 0.012 });
  body.position.y = -0.55;
  scene.add(body);

  // vertical raised strips on the plinth sides
  const trim = brassMat;
  for (const side of [1, -1]) {
    for (let i = -3; i <= 3; i++) {
      const strip = box(0.018, 0.45, 0.018, trim, { outline: false, cast: false });
      strip.position.set(i * 1.9, -0.55, side * (LAYOUT.plinthHalf - 0.16));
      scene.add(strip);
    }
    for (let i = -3; i <= 3; i++) {
      const strip = box(0.018, 0.45, 0.018, trim, { outline: false, cast: false });
      strip.position.set(side * (LAYOUT.plinthHalf - 0.16), -0.55, i * 1.9);
      scene.add(strip);
    }
  }

  const lower = box(LAYOUT.plinthHalf * 2 + 0.12, 0.18, LAYOUT.plinthHalf * 2 + 0.12, bodyMat2, { outlineWidth: 0.01 });
  lower.position.y = -0.93;
  scene.add(lower);
  const goldLine = box(LAYOUT.plinthHalf * 2 + 0.16, 0.025, LAYOUT.plinthHalf * 2 + 0.16, brassMat, { outline: false, cast: false });
  goldLine.position.y = -0.845;
  scene.add(goldLine);

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const foot = box(0.5, 0.12, 0.5, footMat, { outlineWidth: 0.006 });
      foot.position.set(sx * (LAYOUT.plinthHalf - 0.45), -1.04, sz * (LAYOUT.plinthHalf - 0.45));
      scene.add(foot);
    }
  }

  // brass dedication plaque on the near face
  const plaque = signFace(basePlaqueTex, 3.5, 0.82);
  plaque.position.set(0.25, -0.52, LAYOUT.plinthHalf - 0.115);
  plaque.rotation.y = 0;
  scene.add(plaque);
  const plaqueFrame = box(3.67, 0.92, 0.045, brassMat, { outlineWidth: 0.006 });
  plaqueFrame.position.set(0.25, -0.52, LAYOUT.plinthHalf - 0.14);
  scene.add(plaqueFrame);
  plaque.position.z = LAYOUT.plinthHalf - 0.13;

  // small brass corner ornaments
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const corner = box(0.18, 0.06, 0.18, brassMat, { outline: false, cast: false });
      corner.position.set(sx * (LAYOUT.plinthHalf - 0.16), 0.012, sz * (LAYOUT.plinthHalf - 0.16));
      scene.add(corner);
    }
  }
}

function addPuddles(scene) {
  const puddles = [];
  // road puddles
  puddles.push(addPuddle(scene, -1.35, 4.82, ROAD_Y, 0.9, 1.4, 0.55, 11, 0.6));
  puddles.push(addPuddle(scene, 0.65, 6.44, ROAD_Y, 1.05, 1.35, 0.5, 19, 0.48));
  puddles.push(addPuddle(scene, -5.6, 6.3, ROAD_Y, 0.66, 1.6, 0.42, 31, 0.52));
  puddles.push(addPuddle(scene, 5.45, 3.85, ROAD_Y, 0.6, 1.2, 0.6, 41, 0.55));
  puddles.push(addPuddle(scene, 5.9, -2.35, ROAD_Y, 0.95, 0.65, 1.5, 51, 0.5));
  puddles.push(addPuddle(scene, 4.0, -4.3, ROAD_Y, 0.72, 1.2, 0.75, 61, 0.43));
  // sidewalk puddles
  puddles.push(addPuddle(scene, -2.34, 1.72, SIDEWALK_Y, 0.65, 1.3, 0.5, 71, 0.46));
  puddles.push(addPuddle(scene, -0.52, 2.32, SIDEWALK_Y, 0.45, 1.1, 0.55, 81, 0.45));
  puddles.push(addPuddle(scene, 2.18, -0.7, SIDEWALK_Y, 0.5, 0.65, 1.35, 91, 0.44));
  puddles.push(addPuddle(scene, 1.86, -4.2, SIDEWALK_Y, 0.36, 1.0, 0.55, 101, 0.4));
  puddles.push(addPuddle(scene, -6.49, 2.35, SIDEWALK_Y, 0.3, 0.55, 1.45, 111, 0.4));
  puddles.push(addPuddle(scene, -3.05, 4.75, ROAD_Y, 0.72, 1.6, 0.42, 121, 0.48));
  puddles.push(addPuddle(scene, 2.55, 5.15, ROAD_Y, 0.6, 1.35, 0.55, 131, 0.45));
  puddles.push(addPuddle(scene, 5.1, 5.6, ROAD_Y, 0.5, 1.2, 0.6, 141, 0.42));
  return puddles;
}

export function createBase(scene) {
  const root = new THREE.Group();
  root.name = 'diorama-base';
  scene.add(root);

  addPlinth(root);

  // asphalt
  // Dark wet asphalt. It catches the lamps and the environment map, while
  // painted neon streaks sit on top to exaggerate the rainy reflections.
  const asphaltMat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    color: 0xb7c3ca,
    roughness: 0.2,
    metalness: 0.36,
    envMapIntensity: 1.15,
    emissive: 0x0c1822,
    emissiveIntensity: 0.75,
  });
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(LAYOUT.topHalf * 2, LAYOUT.topHalf * 2), asphaltMat);
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.y = ROAD_Y;
  asphalt.receiveShadow = true;
  root.add(asphalt);

  // charcoal inset border
  const borderMat = toon(0x1d1a18);
  for (const s of [-1, 1]) {
    const b1 = box(LAYOUT.topHalf * 2, 0.035, 0.16, borderMat, { outline: false, cast: false });
    b1.position.set(0, 0.015, s * (LAYOUT.topHalf - 0.08));
    root.add(b1);
    const b2 = box(0.16, 0.035, LAYOUT.topHalf * 2, borderMat, { outline: false, cast: false });
    b2.position.set(s * (LAYOUT.topHalf - 0.08), 0.015, 0);
    root.add(b2);
  }

  // sidewalk slab
  const sidewalkW = LAYOUT.topHalf + CURB_X;
  const sidewalkD = LAYOUT.topHalf + CURB_Z;
  const slabMat = toon(0x727a7b);
  const slab = box(sidewalkW, SIDEWALK_Y, sidewalkD, slabMat, { outlineWidth: 0.006 });
  slab.position.set((-LAYOUT.topHalf + CURB_X) / 2, SIDEWALK_Y / 2, (-LAYOUT.topHalf + CURB_Z) / 2);
  root.add(slab);

  const pavingMat = new THREE.MeshStandardMaterial({
    map: pavingTex,
    color: 0xa6b0ac,
    roughness: 0.36,
    metalness: 0.22,
    envMapIntensity: 0.8,
  });
  const paving = new THREE.Mesh(new THREE.PlaneGeometry(sidewalkW - 0.02, sidewalkD - 0.02), pavingMat);
  paving.rotation.x = -Math.PI / 2;
  paving.position.set(slab.position.x, SIDEWALK_Y + 0.002, slab.position.z);
  paving.receiveShadow = true;
  root.add(paving);

  addCurb(root);
  const markings = addRoadMarkings(root);
  addWetDrainAndSmallProps(root);

  const puddles = addPuddles(root);

  const info = { puddles, reflections: [] };
  addWarmReflections(root, info);

  // Neat contact darkening under the sidewalk lip
  const seamShadow = contactShadow(sidewalkW + 0.3, 0.9, 0.25, 0x010305);
  seamShadow.position.set(slab.position.x, SIDEWALK_Y + 0.006, CURB_Z + 0.32);
  root.add(seamShadow);
  const seamShadow2 = contactShadow(0.9, sidewalkD + 0.3, 0.2, 0x010305);
  seamShadow2.position.set(CURB_X + 0.32, SIDEWALK_Y + 0.006, slab.position.z);
  root.add(seamShadow2);

  root.userData.wetGlints = info.glints;
  root.userData.puddles = puddles;
  root.userData.signalReflection = info.signalReflection;
  return { root, puddles, info, asphaltMat, pavingMat };
}
