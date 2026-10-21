import * as THREE from 'three';
import { LAYOUT } from './layout.js';
import {
  C,
  JP,
  EN,
  toon,
  box,
  roundedBox,
  cyl,
  sphere,
  torus,
  add,
  addOutline,
  flatPlane,
  signFace,
  glowSprite,
  glowTex,
  canvasTexture,
  fillRound,
  strokeRound,
  starPath,
  coverText,
  contactShadow,
  reflectionSmear,
  lightPool,
  cylinderBetween,
  tubeFromPoints,
  sagCurve,
  rng,
  clamp,
  mulberry32,
} from './utils.js';
import {
  vendingDisplayTexture,
  vendingHeaderTexture,
  streetPlateTex,
  parkingSignTex,
  noParkingSignTex,
  noticeboardTex,
  utilityNoticeTex,
  flyerTex,
  storeHoursTex,
} from './textures.js';

const SW = LAYOUT.sidewalkY;
const MONO = '"Consolas","Courier New",monospace';

/* ------------------------------------------------------------------ *
 *  Vending machines — the little glowing islands on the side street
 * ------------------------------------------------------------------ */
function binLabelTexture(title, sub, color, icon) {
  return canvasTexture(280, 230, (ctx, w, h) => {
    ctx.fillStyle = '#f3efe2';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, 56);
    ctx.fillStyle = '#faf4e5';
    ctx.font = `700 27px ${JP}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, w / 2, 30);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.strokeRect(23, 77, w - 46, 105);
    ctx.fillStyle = color;
    if (icon === 'bottle') {
      ctx.beginPath();
      ctx.roundRect(w / 2 - 20, 89, 40, 69, 10);
      ctx.fill();
      ctx.fillRect(w / 2 - 10, 78, 20, 17);
      ctx.fillStyle = '#f3efe2';
      ctx.fillRect(w / 2 - 13, 111, 26, 18);
    } else if (icon === 'can') {
      ctx.fillRect(w / 2 - 24, 94, 48, 75);
      ctx.fillStyle = '#f3efe2';
      ctx.fillRect(w / 2 - 24, 120, 48, 18);
    } else {
      ctx.beginPath();
      ctx.arc(w / 2, 137, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f3efe2';
      ctx.font = `800 43px ${JP}`;
      ctx.fillText('紙', w / 2, 139);
    }
    ctx.fillStyle = '#536b62';
    ctx.font = `600 18px ${JP}`;
    ctx.fillText(sub, w / 2, 207);
  }, { key: `bin-label-${title}` });
}

function buildVendingMachine({ x, z, theme = 'blue', facing = Math.PI / 2 }) {
  const group = new THREE.Group();
  group.position.set(x, SW, z);
  group.rotation.y = facing;

  const isBlue = theme === 'blue';
  const bodyColor = isBlue ? 0x207fa6 : 0x9d3f36;
  const accent = isBlue ? 0x65c9df : 0xe9a05c;
  const body = roundedBox(0.94, 1.92, 0.73, 0.045, toon(bodyColor), { outlineWidth: 0.009 });
  body.position.y = 0.96;
  group.add(body);
  const sideCap = box(0.055, 1.72, 0.62, toon(isBlue ? 0x154e66 : 0x6e2d28), { outline: false, cast: false });
  sideCap.position.set(-0.485, 0.96, 0);
  group.add(sideCap);
  // feet
  for (const sx of [-1, 1]) {
    const foot = box(0.14, 0.08, 0.5, toon(0x1d2627), { outline: false, cast: false });
    foot.position.set(sx * 0.31, 0.04, 0);
    group.add(foot);
  }

  // illuminated product display
  const displayTex = vendingDisplayTexture(theme);
  const display = signFace(displayTex, 0.8, 1.4, { boost: 1.1 });
  display.position.set(0, 1.02, 0.37);
  group.add(display);
  const header = signFace(vendingHeaderTexture(theme), 0.86, 0.3);
  header.position.set(0, 1.8, 0.372);
  group.add(header);
  const headerLight = new THREE.MeshBasicMaterial({ color: accent });
  const bottomStrip = box(0.86, 0.04, 0.02, headerLight, { outline: false, cast: false });
  bottomStrip.position.set(0, 0.35, 0.375);
  group.add(bottomStrip);
  // glass reflection accents over the display
  const shine = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.32), new THREE.MeshBasicMaterial({
    map: canvasTexture(128, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(.42, 'rgba(255,255,255,.24)');
      g.addColorStop(.5, 'rgba(255,255,255,.02)');
      g.addColorStop(.62, 'rgba(255,255,255,.14)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }, { key: 'vending-shine' }),
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }));
  shine.position.set(0, 1.02, 0.378);
  group.add(shine);
  // physical pickup slot and button strip
  const pickup = box(0.6, 0.17, 0.045, toon(0x182223), { outlineWidth: 0.002 });
  pickup.position.set(0, 0.23, 0.37);
  group.add(pickup);
  const pickupGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.025), new THREE.MeshBasicMaterial({ color: 0x111a1b, toneMapped: false }));
  pickupGlow.position.set(0, 0.28, 0.394);
  group.add(pickupGlow);
  // side vent slots
  for (let i = 0; i < 5; i++) {
    const vent = box(0.025, 0.018, 0.42, toon(0x121c1e), { outline: false, cast: false });
    vent.position.set(0.48, 0.5 + i * 0.07, 0.0);
    group.add(vent);
  }
  // top indicator LED
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 4), new THREE.MeshBasicMaterial({ color: isBlue ? 0x9cf5ee : 0xffc492, toneMapped: false }));
  led.position.set(0.37, 1.885, 0.32);
  group.add(led);

  const light = new THREE.PointLight(isBlue ? 0x87dbef : 0xffa37b, 3.1, 4.0, 2);
  light.position.set(0, 1.2, 0.83);
  group.add(light);
  const halo = glowSprite(glowTex, isBlue ? 0x6fdcf0 : 0xff9f76, 2.7, 3.0, 0.22);
  halo.position.set(0, 1.1, 0.62);
  group.add(halo);
  // glow pool on the pavement (local z faces out)
  const pool = lightPool(1.4, 1.7, isBlue ? 0x53c8e2 : 0xff9d7f, 0.24);
  pool.position.set(0, 0.016, 0.8);
  group.add(pool);

  // recycle box beside the machine
  const bin = roundedBox(0.36, 0.5, 0.32, 0.035, toon(0x3e5f5d), { outlineWidth: 0.003 });
  bin.position.set(0.54, 0.25, 0.45);
  group.add(bin);
  const binHole = new THREE.Mesh(new THREE.CircleGeometry(0.075, 12), toon(0x0e1718));
  binHole.rotation.x = -Math.PI / 2;
  binHole.position.set(0.54, 0.507, 0.45);
  group.add(binHole);

  return { group, light, halo, led, glowMat: halo.material, display: display.material };
}

/* ------------------------------------------------------------------ *
 *  A city bicycle with all of its small mechanical bits
 * ------------------------------------------------------------------ */
export function buildBicycle(x, z, ry = 0.15, scale = 0.94) {
  const g = new THREE.Group();
  g.position.set(x, SW, z);
  g.rotation.y = ry;
  g.scale.setScalar(scale);
  const frameMat = toon(0x3e6763);
  const dark = toon(0x182022);
  const metal = toon(0xa5afac);
  const tyre = toon(0x111719);
  const seatMat = toon(0x33281f);

  const wheelR = 0.34;
  const rearX = -0.55;
  const frontX = 0.58;
  const wheelY = wheelR;
  for (const wx of [rearX, frontX]) {
    const t = torus(wheelR, 0.028, tyre, { radialSegments: 6, tubularSegments: 28 });
    t.rotation.y = 0;
    t.position.set(wx, wheelY, 0);
    g.add(t);
    const rim = torus(wheelR - 0.04, 0.009, metal, { radialSegments: 4, tubularSegments: 28 });
    rim.position.set(wx, wheelY, 0.01);
    g.add(rim);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const inner = new THREE.Vector3(wx, wheelY, 0.02);
      const outer = new THREE.Vector3(wx + Math.cos(a) * (wheelR - 0.045), wheelY + Math.sin(a) * (wheelR - 0.045), 0.02);
      const spoke = cylinderBetween(inner, outer, 0.0022, metal, { cast: false });
      g.add(spoke);
    }
    const hub = cyl(0.03, 0.03, 0.07, metal, { radialSegments: 8, outline: false, cast: false });
    hub.rotation.x = Math.PI / 2;
    hub.position.set(wx, wheelY, 0.02);
    g.add(hub);
  }
  const rearHub = new THREE.Vector3(rearX, wheelY, 0.01);
  const frontHub = new THREE.Vector3(frontX, wheelY, 0.01);
  const bb = new THREE.Vector3(-0.03, 0.35, 0.01);
  const seatTop = new THREE.Vector3(-0.18, 0.87, 0.01);
  const headTop = new THREE.Vector3(0.38, 0.85, 0.01);
  const headBottom = new THREE.Vector3(0.44, 0.58, 0.01);

  const frameParams = [
    [rearHub, bb, 0.018],
    [bb, seatTop, 0.019],
    [seatTop, headTop, 0.017],
    [bb, headBottom, 0.018],
    [headTop, headBottom, 0.019],
    [headBottom, frontHub, 0.015],
    [rearHub, seatTop, 0.014],
  ];
  for (const [a, b, r] of frameParams) {
    const tube = cylinderBetween(a.clone(), b.clone(), r, frameMat, { radialSegments: 7, outline: true, outlineWidth: 0.004 });
    g.add(tube);
  }
  // chainring
  const chainring = cyl(0.1, 0.1, 0.018, metal, { radialSegments: 18, outline: false });
  chainring.rotation.x = Math.PI / 2;
  chainring.position.set(bb.x, bb.y, 0.06);
  g.add(chainring);
  const chain = box(0.48, 0.012, 0.006, dark, { outline: false, cast: false });
  chain.position.set(-0.25, 0.34, 0.055);
  chain.rotation.z = 0.02;
  g.add(chain);
  // fenders
  for (const [wx, start] of [[rearX, 1.15], [frontX, 1.1]]) {
    const f = new THREE.Mesh(new THREE.TorusGeometry(wheelR + 0.03, 0.017, 4, 20, Math.PI * 0.75), toon(0x2b3736));
    f.position.set(wx, wheelY, 0);
    f.rotation.z = start;
    g.add(f);
  }
  // seat
  const saddle = roundedBox(0.25, 0.055, 0.13, 0.025, seatMat, { outlineWidth: 0.003 });
  saddle.position.set(-0.2, 0.94, 0.0);
  saddle.rotation.x = 0.04;
  g.add(saddle);
  const seatPost = cylinderBetween(new THREE.Vector3(-0.18, 0.82, 0.01), new THREE.Vector3(-0.18, 0.91, 0.01), 0.012, metal, { cast: false });
  g.add(seatPost);
  // handlebars and stem
  const stem = cylinderBetween(new THREE.Vector3(0.38, 0.86, 0.01), new THREE.Vector3(0.44, 1.01, 0.01), 0.014, metal, { cast: false });
  g.add(stem);
  const handlebar = cylinderBetween(new THREE.Vector3(0.44, 1.01, -0.2), new THREE.Vector3(0.44, 1.01, 0.2), 0.013, dark, { radialSegments: 6, cast: false });
  g.add(handlebar);
  for (const sz of [-1, 1]) {
    const grip = cyl(0.021, 0.021, 0.11, toon(0x46352b), { radialSegments: 7, outline: false, cast: false });
    grip.rotation.x = Math.PI / 2;
    grip.position.set(0.44, 1.01, sz * 0.18);
    g.add(grip);
  }
  const brakeLever = box(0.06, 0.015, 0.12, metal, { outline: false, cast: false });
  brakeLever.position.set(0.47, 0.99, 0.13);
  brakeLever.rotation.z = -0.25;
  g.add(brakeLever);
  // front basket
  const basket = new THREE.Group();
  basket.position.set(0.65, 0.79, 0);
  const basketMat = toon(0x9aa0a0);
  const floor = box(0.34, 0.015, 0.26, basketMat, { outlineWidth: 0.002 });
  basket.add(floor);
  for (let i = 0; i < 3; i++) {
    for (const sz of [-1, 1]) {
      const bar = box(0.33, 0.18, 0.012, basketMat, { outlineWidth: 0.001, cast: false });
      bar.position.set(0, 0.09, sz * 0.12);
      bar.rotation.x = sz * 0.18;
      basket.add(bar);
    }
  }
  for (let i = 0; i < 4; i++) {
    const bar = box(0.012, 0.17, 0.23, basketMat, { outlineWidth: 0.001, cast: false });
    bar.position.set(-0.15 + i * 0.1, 0.09, 0);
    basket.add(bar);
  }
  const bag = box(0.18, 0.13, 0.16, toon(0xe3d7bc), { outlineWidth: 0.002, cast: false });
  bag.position.set(-0.02, 0.08, 0.01);
  bag.rotation.z = -0.1;
  basket.add(bag);
  g.add(basket);
  // kickstand
  const kick = cylinderBetween(new THREE.Vector3(-0.2, 0.35, 0.01), new THREE.Vector3(-0.38, 0.02, 0.17), 0.009, metal, { cast: false });
  g.add(kick);
  // lights
  const headlight = cyl(0.035, 0.04, 0.045, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.1), toneMapped: false }), { radialSegments: 10, outline: false, cast: false });
  headlight.rotation.x = Math.PI / 2;
  headlight.position.set(0.61, 0.76, 0.04);
  g.add(headlight);
  const rearLamp = sphere(0.025, new THREE.MeshBasicMaterial({ color: 0xff6258, toneMapped: false }), { segments: 6, rings: 4, outline: false, cast: false });
  rearLamp.position.set(-0.61, 0.52, 0.0);
  g.add(rearLamp);
  const headGlow = glowSprite(glowTex, 0xfff0c9, 0.5, 0.5, 0.24);
  headGlow.position.copy(headlight.position);
  g.add(headGlow);
  const cs = contactShadow(1.6, 0.7, 0.38);
  cs.position.y = 0.012;
  g.add(cs);
  return g;
}

/* ------------------------------------------------------------------ *
 *  Umbrella stand, bins, noticeboard
 * ------------------------------------------------------------------ */
function buildUmbrellaStand(x, z) {
  const g = new THREE.Group();
  g.position.set(x, SW, z);
  const standMat = toon(0x7b8987);
  const bucket = cyl(0.21, 0.18, 0.44, standMat, { radialSegments: 14, outlineWidth: 0.004 });
  bucket.position.y = 0.22;
  g.add(bucket);
  const rim = torus(0.21, 0.012, toon(0xadb6b2), { radialSegments: 5, tubularSegments: 18 });
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.44;
  g.add(rim);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.17, 14), new THREE.MeshBasicMaterial({ color: 0x253b3e, toneMapped: false }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.45;
  g.add(water);
  const colors = [0x6fa2a8, 0xe5d9be, 0x486b75, 0xc4b9a1];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const base = new THREE.Vector3(Math.cos(a) * 0.1, 0.35, Math.sin(a) * 0.1);
    const tip = new THREE.Vector3(Math.cos(a) * 0.24 + 0.02, 1.08, Math.sin(a) * 0.24);
    const shaft = cylinderBetween(base, tip, 0.009, toon(colors[i]), { radialSegments: 5, outline: false, cast: false });
    g.add(shaft);
    // folded canopy
    const canopy = cylinderBetween(new THREE.Vector3(base.x, 0.7, base.z), new THREE.Vector3(tip.x, 0.95, tip.z), 0.045, toon(colors[i]), { radialSegments: 7, cast: false });
    canopy.scale.z = 0.65;
    g.add(canopy);
    // J handle
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 4, 10, Math.PI), toon(0x42342a));
    handle.rotation.x = Math.PI / 2;
    handle.position.set(base.x, 1.1, base.z);
    handle.rotation.z = a;
    g.add(handle);
  }
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.32, 14), new THREE.MeshPhysicalMaterial({
    color: 0x24383f,
    roughness: 0.08,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    envMapIntensity: 1.6,
    clearcoat: 1,
  }));
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.y = 0.012;
  puddle.scale.set(1.2, 0.7, 1);
  g.add(puddle);
  return g;
}

function buildBins(x, z) {
  const g = new THREE.Group();
  g.position.set(x, SW, z);
  const labels = [
    { title: 'かん・びん', sub: 'CANS & BOTTLES', color: '#327b75', icon: 'can' },
    { title: 'ペットボトル', sub: 'PLASTIC BOTTLES', color: '#4e7a5e', icon: 'bottle' },
  ];
  labels.forEach((cfg, idx) => {
    const bx = -0.3 + idx * 0.42;
    const body = roundedBox(0.36, 0.68, 0.34, 0.045, toon(0xd9d9ce), { outlineWidth: 0.003 });
    body.position.set(bx, 0.34, 0);
    g.add(body);
    const lid = roundedBox(0.38, 0.1, 0.36, 0.035, toon(cfg.color), { outlineWidth: 0.002 });
    lid.position.set(bx, 0.71, 0);
    g.add(lid);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), toon(0x111a1b));
    hole.rotation.x = -Math.PI / 2;
    hole.position.set(bx, 0.762, 0);
    g.add(hole);
    const label = signFace(binLabelTexture(cfg.title, cfg.sub, cfg.color, cfg.icon), 0.24, 0.2);
    label.position.set(bx, 0.42, 0.176);
    g.add(label);
    const foot = box(0.28, 0.05, 0.25, toon(0x212a29), { outline: false, cast: false });
    foot.position.set(bx, 0.025, 0);
    g.add(foot);
  });
  const cs = contactShadow(0.9, 0.5, 0.28);
  cs.position.y = 0.01;
  g.add(cs);
  return g;
}

function buildNoticeboard(x, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, SW, z);
  g.rotation.y = ry;
  const wood = toon(0x4b382b);
  for (const sx of [-0.62, 0.62]) {
    const leg = box(0.07, 1.55, 0.07, wood, { outlineWidth: 0.002 });
    leg.position.set(sx, 0.77, 0);
    g.add(leg);
  }
  const board = box(1.35, 0.95, 0.06, wood, { outlineWidth: 0.004 });
  board.position.set(0, 1.22, 0);
  g.add(board);
  const face = signFace(noticeboardTex, 1.25, 0.85);
  face.position.set(0, 1.22, 0.035);
  g.add(face);
  const roof = box(1.5, 0.07, 0.3, toon(0x3a4a45), { outlineWidth: 0.003 });
  roof.position.set(0, 1.74, -0.02);
  roof.rotation.x = 0.1;
  g.add(roof);
  const flyer1 = signFace(flyerTex, 0.26, 0.34, { boost: 0.82 });
  flyer1.position.set(0.65, 1.46, 0.07);
  flyer1.rotation.z = 0.03;
  g.add(flyer1);
  const cs = contactShadow(1.5, 0.6, 0.28);
  cs.position.y = 0.01;
  g.add(cs);
  return g;
}

/* ------------------------------------------------------------------ *
 *  Street lamp + traffic signal tower
 * ------------------------------------------------------------------ */
function buildSignalLamp() {
  const g = new THREE.Group();
  g.name = 'corner-signal-and-lamp';
  // A tiny traffic island in the open crossing keeps this tall silhouette
  // off the shopfront sightline while anchoring the intersection.
  const px = 6.15;
  const pz = 2.76;
  g.position.set(px, SW, pz);

  const island = box(1.42, 0.16, 1.42, toon(0x7c827f), { outlineWidth: 0.006 });
  island.position.y = -0.08;
  g.add(island);
  const islandTop = box(1.3, 0.025, 1.3, toon(0x99978b), { outlineWidth: 0.002 });
  islandTop.position.y = 0.005;
  g.add(islandTop);
  const islandStripe = box(1.45, 0.035, 1.45, toon(0xc9a647), { outlineWidth: 0.002, cast: false });
  islandStripe.position.y = -0.15;
  g.add(islandStripe);

  const poleMat = toon(0x636e6e);
  const base = cyl(0.16, 0.2, 0.26, toon(0x4b5554), { radialSegments: 12, outlineWidth: 0.004 });
  base.position.y = 0.13;
  g.add(base);
  const pole = cyl(0.07, 0.11, 4.35, poleMat, { radialSegments: 12, outlineWidth: 0.005 });
  pole.position.y = 2.31;
  g.add(pole);
  // street lamp arm curving over the crosswalk (front road)
  const armPts = [
    new THREE.Vector3(0, 4.42, 0),
    new THREE.Vector3(0, 4.92, 0.33),
    new THREE.Vector3(0, 5.03, 1.12),
    new THREE.Vector3(0, 4.98, 1.86),
  ];
  const arm = tubeFromPoints(armPts, 0.045, poleMat, { segments: 24, radialSegments: 6 });
  g.add(arm);
  // lamp head
  const head = roundedBox(0.52, 0.13, 0.3, 0.045, toon(0x4c5655), { outlineWidth: 0.003 });
  head.position.set(0, 4.95, 1.92);
  head.rotation.x = -0.08;
  g.add(head);
  const lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.56, 1.76), toneMapped: false });
  const lampFace = new THREE.Mesh(new THREE.PlaneGeometry(0.41, 0.22), lampMat);
  lampFace.rotation.x = Math.PI / 2;
  lampFace.position.set(0, 4.88, 1.92);
  g.add(lampFace);
  const lampHalo = glowSprite(glowTex, 0xb7e9f2, 3.15, 3.15, 0.27);
  lampHalo.position.set(0, 4.84, 1.92);
  g.add(lampHalo);
  const lampLight = new THREE.SpotLight(0xaedfe8, 38, 14, 0.82, 0.64, 1.7);
  lampLight.position.set(0, 4.82, 1.92);
  lampLight.target.position.set(-0.1, 0, 2.8);
  g.add(lampLight, lampLight.target);

  // a whisper-soft volume of light in the rain beneath the street lamp
  const coneMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0xa8dce8) },
      uOpacity: { value: 0.06 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.7);
        float fade = smoothstep(0.0, 0.3, vUv.y) * pow(vUv.y, 0.7);
        float a = uOpacity * (0.1 + rim * 0.32) * fade;
        gl_FragColor = vec4(uColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const lampCone = new THREE.Mesh(new THREE.ConeGeometry(1.82, 5.0, 28, 1, true), coneMat);
  lampCone.position.set(0, 2.38, 1.92);
  lampCone.renderOrder = 3;
  g.add(lampCone);

  // pedestrian signal on the post
  const pedBox = box(0.27, 0.56, 0.2, toon(0x303a3a), { outlineWidth: 0.002 });
  pedBox.position.set(0.0, 2.55, 0.13);
  g.add(pedBox);
  const pedFaceMat = new THREE.MeshBasicMaterial({ color: 0x9ef3d1, toneMapped: false });
  const pedUpper = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ color: 0x1b2d2a, toneMapped: false }));
  pedUpper.position.set(0, 2.67, 0.235);
  g.add(pedUpper);
  const pedLower = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), pedFaceMat);
  pedLower.position.set(0, 2.43, 0.235);
  g.add(pedLower);
  const pedGlow = glowSprite(glowTex, 0x9df3d0, 0.6, 0.6, 0.16);
  pedGlow.position.set(0, 2.43, 0.27);
  g.add(pedGlow);

  // car signal arm
  const signalArm = cylinderBetween(
    new THREE.Vector3(0, 3.79, 0),
    new THREE.Vector3(1.65, 3.86, 0.3),
    0.035,
    poleMat,
    { radialSegments: 5, outline: false },
  );
  g.add(signalArm);
  const signalHousing = roundedBox(1.2, 0.36, 0.26, 0.09, toon(0x3b4a47), { outlineWidth: 0.003 });
  signalHousing.position.set(1.95, 3.85, 0.36);
  signalHousing.rotation.y = -0.16;
  g.add(signalHousing);
  const signalFaceGroup = new THREE.Group();
  signalFaceGroup.position.set(1.95, 3.85, 0.5);
  signalFaceGroup.rotation.y = -0.16;
  g.add(signalFaceGroup);
  const colors = [0x69e8b1, 0xf3c85c, 0xff6a69];
  const signalMats = [];
  const signalGlows = [];
  for (let i = 0; i < 3; i++) {
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x1a2422, toneMapped: false });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), lensMat);
    lens.position.set(-0.35 + i * 0.35, 0, 0.01);
    signalFaceGroup.add(lens);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.018, 5, 20), toon(0x1d2626));
    rim.position.set(-0.35 + i * 0.35, 0, 0.02);
    signalFaceGroup.add(rim);
    // visor
    const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.14, 12, 1, true, 0, Math.PI), toon(0x26302f));
    visor.rotation.z = Math.PI / 2;
    visor.position.set(-0.35 + i * 0.35, 0.1, 0.08);
    signalFaceGroup.add(visor);
    const halo = glowSprite(glowTex, colors[i], 0.8, 0.8, 0.0);
    halo.position.set(-0.35 + i * 0.35, 0, 0.1);
    signalFaceGroup.add(halo);
    signalMats.push(lensMat);
    signalGlows.push(halo.material);
  }
  const signalLight = new THREE.PointLight(colors[0], 2.4, 3.5, 2);
  signalLight.visible = false;
  signalLight.position.set(1.95, 3.78, 0.7);
  g.add(signalLight);

  // pole signs: green street name + blue parking
  const streetPlate = signFace(streetPlateTex, 1.05, 0.25);
  streetPlate.position.set(0, 3.1, 0.14);
  g.add(streetPlate);
  const plateFrame = box(1.1, 0.29, 0.03, toon(0x4f5e5c), { outlineWidth: 0.002 });
  plateFrame.position.set(0, 3.1, 0.12);
  g.add(plateFrame);
  const pSign = signFace(parkingSignTex, 0.25, 0.32);
  pSign.position.set(0.02, 1.82, 0.15);
  g.add(pSign);
  const pSignFrame = box(0.28, 0.35, 0.03, toon(0xd7d8cc), { outlineWidth: 0.002 });
  pSignFrame.position.set(0.02, 1.82, 0.13);
  g.add(pSignFrame);
  const noBike = signFace(noParkingSignTex, 0.24, 0.3);
  noBike.position.set(0.02, 1.38, 0.15);
  g.add(noBike);

  // low bollard
  const bollard = cyl(0.045, 0.055, 0.8, toon(0x556260), { radialSegments: 8, outlineWidth: 0.002 });
  bollard.position.set(-0.48, 0.4, 0.2);
  g.add(bollard);
  const bollardBand = cyl(0.056, 0.056, 0.06, new THREE.MeshBasicMaterial({ color: 0xe6c878, toneMapped: false }), { radialSegments: 8, outline: false, cast: false });
  bollardBand.position.set(-0.48, 0.7, 0.2);
  g.add(bollardBand);

  return {
    group: g,
    signal: { mats: signalMats, glows: signalGlows, colors, light: signalLight, pedLower, pedGlow },
    lamp: { mat: lampMat, light: lampLight, halo: lampHalo },
  };
}

/* ------------------------------------------------------------------ *
 *  Utility poles and a net of city cables
 * ------------------------------------------------------------------ */
function buildUtilityPoles() {
  const g = new THREE.Group();
  g.name = 'utility-network';
  const concrete = toon(0x6f716e);
  const darkMetal = toon(0x3d4546);
  const insulatorMat = toon(0xd5d4c7);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x0b1116, toneMapped: false });

  function pole(x, z, h, rot = 0) {
    const pg = new THREE.Group();
    pg.position.set(x, SW, z);
    pg.rotation.y = rot;
    const p = cyl(0.1, 0.17, h, concrete, { radialSegments: 12, outlineWidth: 0.006 });
    p.position.y = h / 2;
    pg.add(p);
    const top = cyl(0.075, 0.1, 0.22, darkMetal, { radialSegments: 8, outlineWidth: 0.002 });
    top.position.y = h + 0.08;
    pg.add(top);
    // bands
    for (let i = 0; i < 7; i++) {
      const band = cyl(0.113, 0.121, 0.035, darkMetal, { radialSegments: 10, outline: false, cast: false });
      band.position.y = 1.5 + i * 0.75;
      pg.add(band);
    }
    // foot hazard stripe
    const hazard = cyl(0.172, 0.178, 0.45, toon(0xb7a34e), { radialSegments: 12, outline: false, cast: false });
    hazard.position.y = 0.23;
    pg.add(hazard);
    for (let i = 0; i < 5; i++) {
      const stripe = cyl(0.181, 0.181, 0.04, toon(0x202726), { radialSegments: 12, outline: false, cast: false });
      stripe.position.y = 0.075 + i * 0.09;
      pg.add(stripe);
    }
    // crossarms
    for (const [ay, width] of [[h - 0.4, 1.8], [h - 1.0, 1.5]]) {
      const arm = box(width, 0.09, 0.1, darkMetal, { outlineWidth: 0.003 });
      arm.position.set(0, ay, 0);
      pg.add(arm);
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const ins = cyl(0.035, 0.045, 0.1, insulatorMat, { radialSegments: 7, outlineWidth: 0.001 });
        ins.position.set((i / 2) * width * 0.42, ay + 0.1, 0);
        pg.add(ins);
      }
    }
    // transformer drums
    const drum = cyl(0.25, 0.25, 0.62, toon(0x818b82), { radialSegments: 12, outlineWidth: 0.004 });
    drum.position.set(0.26, h - 1.75, 0);
    pg.add(drum);
    for (let i = 0; i < 3; i++) {
      const fin = box(0.06, 0.52, 0.06, darkMetal, { outline: false, cast: false });
      fin.position.set(0.5, h - 1.75, -0.18 + i * 0.18);
      pg.add(fin);
    }
    const drum2 = drum.clone();
    drum2.scale.setScalar(0.7);
    drum2.position.set(-0.24, h - 2.2, 0.02);
    pg.add(drum2);
    // steps
    for (let i = 0; i < 8; i++) {
      const step = box(0.26, 0.025, 0.025, darkMetal, { outline: false, cast: false });
      step.position.set(0.06, 1.1 + i * 0.7, 0.17);
      pg.add(step);
    }
    // service cable dropping down
    const droop = tubeFromPoints([
      new THREE.Vector3(0.12, h - 1.4, 0),
      new THREE.Vector3(0.16, 2.7, 0.08),
      new THREE.Vector3(0.2, 1.4, 0.05),
    ], 0.016, wireMat, { segments: 12, radialSegments: 4, case: false });
    pg.add(droop);
    return pg;
  }

  // The near pole frames the left corner; the far one closes the diagonal of the scene.
  const poleA = pole(-7.48, 2.64, 7.9, 0.12);
  const poleB = pole(3.28, -7.78, 7.55, -0.08);
  g.add(poleA, poleB);

  // add warning plate to the near pole
  const notice = signFace(utilityNoticeTex, 0.27, 0.38);
  notice.rotation.y = Math.PI / 2;
  notice.position.set(-7.22, SW + 1.66, 2.64);
  g.add(notice);
  const noticeBack = box(0.02, 0.41, 0.3, darkMetal, { outline: false, cast: false });
  noticeBack.position.set(-7.235, SW + 1.66, 2.64);
  g.add(noticeBack);
  for (let i = 0; i < 3; i++) {
    const flyer = signFace(flyerTex, 0.16, 0.23, { boost: 0.7 });
    flyer.position.set(-7.24, SW + 1.0 + i * 0.15, 2.32 + (i % 2) * 0.05);
    flyer.rotation.y = Math.PI / 2;
    flyer.rotation.z = (i - 1) * 0.04;
    g.add(flyer);
  }

  // cable curves
  const wireHeightsA = [7.56, 7.31, 7.48, 7.16, 6.91];
  const wireHeightsB = [7.25, 7.02, 7.21, 6.91, 6.65];
  const wireDirections = [[-0.2, 0.5], [-0.18, 0.62], [0.16, -0.5], [0.18, -0.4], [0.02, 0.05]];
  for (let i = 0; i < 5; i++) {
    const a = new THREE.Vector3(-7.48 + wireDirections[i][0], SW + wireHeightsA[i], 2.64 + wireDirections[i][1]);
    const b = new THREE.Vector3(3.28 + wireDirections[i][1] * 0.3, SW + wireHeightsB[i], -7.78 + wireDirections[i][0] * 0.5);
    const pts = sagCurve(a, b, 1.1 + i * 0.16, 30);
    const tube = tubeFromPoints(pts, 0.012 + (i % 3) * 0.003, wireMat, { segments: 64, radialSegments: 4 });
    g.add(tube);
    // second thinner wire slightly offset — the classic tangle
    const a2 = a.clone().add(new THREE.Vector3(0.07, -0.08, 0.08));
    const b2 = b.clone().add(new THREE.Vector3(0.05, -0.1, 0.07));
    const tube2 = tubeFromPoints(sagCurve(a2, b2, 1.35 + i * 0.1, 26), 0.007, wireMat, { segments: 46, radialSegments: 3 });
    g.add(tube2);
  }
  // service drops to the buildings
  const dropToCafe = tubeFromPoints(sagCurve(
    new THREE.Vector3(-7.3, SW + 6.0, 2.55),
    new THREE.Vector3(-6.8, SW + 4.92, 0.78),
    0.38,
    18,
  ), 0.011, wireMat, { segments: 24, radialSegments: 3 });
  g.add(dropToCafe);
  const dropToRear = tubeFromPoints(sagCurve(
    new THREE.Vector3(3.12, SW + 6.95, -7.7),
    new THREE.Vector3(1.4, SW + 6.65, -5.24),
    0.35,
    15,
  ), 0.012, wireMat, { segments: 22, radialSegments: 3 });
  g.add(dropToRear);

  // pole base pads
  for (const [x, z] of [[-7.48, 2.64], [3.28, -7.78]]) {
    const pad = box(0.7, 0.1, 0.7, toon(0x6b6f6b), { outlineWidth: 0.003 });
    pad.position.set(x, SW + 0.05, z);
    g.add(pad);
  }

  return { group: g, poles: [poleA, poleB] };
}

/* ------------------------------------------------------------------ *
 *  Guardrails
 * ------------------------------------------------------------------ */
function buildGuardrail(x1, z1, x2, z2) {
  const g = new THREE.Group();
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  const n = Math.max(2, Math.round(length / 1.25));
  const metal = toon(0xc4c7be);
  const dark = toon(0x424c4b);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const px = x1 + dx * t;
    const pz = z1 + dz * t;
    const post = box(0.075, 0.72, 0.075, dark, { outlineWidth: 0.002 });
    post.position.set(px, SW + 0.36, pz);
    g.add(post);
    const cap = box(0.1, 0.04, 0.1, metal, { outline: false, cast: false });
    cap.position.set(px, SW + 0.72, pz);
    g.add(cap);
  }
  // two rounded horizontal rails
  for (const y of [SW + 0.52, SW + 0.67]) {
    const rail = cylinderBetween(
      new THREE.Vector3(x1, y, z1),
      new THREE.Vector3(x2, y, z2),
      0.035,
      metal,
      { radialSegments: 8, outline: true, outlineWidth: 0.003 },
    );
    g.add(rail);
  }
  // amber reflectors
  for (let i = 1; i < n; i += 2) {
    const t = i / n;
    const px = x1 + dx * t;
    const pz = z1 + dz * t;
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.1), new THREE.MeshBasicMaterial({ color: 0xe7bd63, toneMapped: false }));
    refl.position.set(px + dz / length * 0.045, SW + 0.55, pz - dx / length * 0.045);
    refl.rotation.y = Math.atan2(dx, dz);
    refl.rotation.z = Math.PI / 2;
    g.add(refl);
  }
  return g;
}

/* ------------------------------------------------------------------ *
 *  AC outdoor units and wall clutter
 * ------------------------------------------------------------------ */
function buildOutdoorAC() {
  const g = new THREE.Group();
  const shell = toon(0xb2b4aa);
  const grille = toon(0x596260);
  const pipeMat = toon(0xd7d3c2);
  // unit on the store's solid right wall
  const unit = roundedBox(0.72, 0.54, 0.36, 0.03, shell, { outlineWidth: 0.005 });
  unit.position.set(1.33, 0.78, -4.31);
  unit.rotation.y = Math.PI / 2;
  g.add(unit);
  const fan = new THREE.Mesh(new THREE.CircleGeometry(0.18, 18), grille);
  fan.rotation.y = Math.PI / 2;
  fan.position.set(1.53, 0.78, -4.31);
  g.add(fan);
  for (let i = 0; i < 5; i++) {
    const slot = box(0.01, 0.3, 0.02, toon(0x727873), { outline: false, cast: false });
    slot.position.set(1.54, 0.78, -4.58 + i * 0.12);
    g.add(slot);
  }
  const bracket = box(0.6, 0.035, 0.08, toon(0x777d77), { outline: false, cast: false });
  bracket.position.set(1.33, 0.47, -4.31);
  g.add(bracket);
  const pipe = tubeFromPoints([
    new THREE.Vector3(1.48, 0.8, -4.45),
    new THREE.Vector3(1.21, 1.0, -4.45),
    new THREE.Vector3(1.21, 1.55, -4.45),
    new THREE.Vector3(1.24, 2.1, -4.45),
  ], 0.018, pipeMat, { segments: 16, radialSegments: 4 });
  g.add(pipe);
  // unit on the cafe side, high up
  const unit2 = roundedBox(0.66, 0.48, 0.32, 0.03, shell, { outlineWidth: 0.004 });
  unit2.position.set(1.22, 3.7, -4.92);
  unit2.rotation.y = Math.PI / 2;
  g.add(unit2);
  const fan2 = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), grille);
  fan2.rotation.y = Math.PI / 2;
  fan2.position.set(1.39, 3.7, -4.92);
  g.add(fan2);
  return g;
}

/* ------------------------------------------------------------------ *
 *  Small street details
 * ------------------------------------------------------------------ */
function buildStreetDetails() {
  const g = new THREE.Group();

  // A-frame sign outside the cafe
  const aframe = new THREE.Group();
  aframe.position.set(-6.5, SW, 1.52);
  aframe.rotation.y = 0.18;
  const wood = toon(0x573e30);
  for (const sx of [-0.24, 0.24]) {
    const leg = box(0.035, 0.72, 0.035, wood, { outlineWidth: 0.001 });
    leg.position.set(sx, 0.36, 0.12);
    leg.rotation.x = 0.12;
    aframe.add(leg);
  }
  const aBoard = box(0.64, 0.56, 0.04, wood, { outlineWidth: 0.003 });
  aBoard.position.set(0, 0.48, 0.08);
  aBoard.rotation.x = -0.14;
  aframe.add(aBoard);
  const aFace = signFace(canvasTexture(500, 620, (ctx, w, h) => {
    ctx.fillStyle = '#263f40';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(231,217,183,.7)';
    ctx.lineWidth = 5;
    ctx.strokeRect(15, 15, w - 30, h - 30);
    ctx.fillStyle = '#f0dfbd';
    ctx.font = `800 55px ${JP}`;
    ctx.textAlign = 'center';
    ctx.fillText('喫茶', w / 2, 98);
    ctx.fillText('雨音', w / 2, 170);
    ctx.fillStyle = '#d89a5c';
    ctx.font = `600 30px ${JP}`;
    ctx.fillText('珈琲 450円', w / 2, 270);
    ctx.fillText('ケーキ 500円', w / 2, 318);
    ctx.fillStyle = '#aaccc1';
    ctx.font = `500 22px ${EN}`;
    ctx.fillText('OPEN  18:00 - 02:00', w / 2, 390);
    ctx.fillStyle = 'rgba(224,195,137,.2)';
    ctx.beginPath();
    ctx.arc(w / 2, 480, 61, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(235,219,187,.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, 480, 61, 0, Math.PI * 2);
    ctx.stroke();
  }, { key: 'cafe-aframe' }), 0.55, 0.63, { boost: 0.8 });
  aFace.position.set(0, 0.48, 0.105);
  aFace.rotation.x = -0.14;
  aframe.add(aFace);
  const aTop = box(0.72, 0.045, 0.12, wood, { outlineWidth: 0.001 });
  aTop.position.set(0, 0.82, 0.07);
  aframe.add(aTop);
  g.add(aframe);

  // parking sign near the marked bay
  const parkPole = cyl(0.035, 0.045, 2.35, toon(0x626e6d), { radialSegments: 8, outlineWidth: 0.002 });
  parkPole.position.set(7.78, SW + 1.17, -1.18);
  g.add(parkPole);
  const parkSign = signFace(parkingSignTex, 0.38, 0.48);
  parkSign.rotation.y = Math.PI / 2;
  parkSign.position.set(7.75, SW + 2.06, -1.18);
  g.add(parkSign);
  const parkBack = box(0.42, 0.52, 0.03, toon(0xdedfd3), { outlineWidth: 0.002 });
  parkBack.rotation.y = Math.PI / 2;
  parkBack.position.set(7.72, SW + 2.06, -1.18);
  g.add(parkBack);

  // a standing menu box near the shop corner
  const menuStand = box(0.46, 0.9, 0.3, toon(0x38504c), { outlineWidth: 0.003 });
  menuStand.position.set(1.9, SW + 0.45, -0.35);
  menuStand.rotation.y = -0.28;
  g.add(menuStand);
  const menuFace = signFace(canvasTexture(300, 520, (ctx, w, h) => {
    ctx.fillStyle = '#f4ecd8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1b625d';
    ctx.fillRect(0, 0, w, 80);
    ctx.fillStyle = '#f8efd8';
    ctx.font = `800 31px ${JP}`;
    ctx.textAlign = 'center';
    ctx.fillText('本日のおすすめ', w / 2, 50);
    ctx.fillStyle = '#6f5b3e';
    ctx.font = `700 25px ${JP}`;
    ctx.fillText('おにぎり各種 ¥100', w / 2, 140);
    ctx.fillText('ホットコーヒー ¥150', w / 2, 183);
    ctx.fillText('からあげ ¥180', w / 2, 226);
    ctx.fillText('おでん ¥100〜', w / 2, 269);
    ctx.fillStyle = '#d18d49';
    ctx.fillRect(38, 310, w - 76, 3);
    ctx.fillStyle = '#8b6b4e';
    ctx.font = `600 19px ${JP}`;
    ctx.fillText('店内でどうぞ', w / 2, 352);
    ctx.fillStyle = '#e6b371';
    ctx.font = `600 17px ${EN}`;
    ctx.fillText('HOSHIMART', w / 2, 390);
  }, { key: 'standing-menu' }), 0.3, 0.56, { boost: 0.8 });
  menuFace.position.set(1.9, SW + 0.62, -0.18);
  menuFace.rotation.y = -0.28;
  g.add(menuFace);

  // small plant pots around the utility pole and beside the entrance
  const potMat = toon(0x815b43);
  for (const [x, z, s] of [[-7.18, 2.32, 0.9], [-4.85, 0.82, 0.7], [2.36, 1.7, 0.6]]) {
    const pot = cyl(0.14 * s, 0.11 * s, 0.22 * s, potMat, { radialSegments: 10, outlineWidth: 0.002 });
    pot.position.set(x, SW + 0.11 * s, z);
    g.add(pot);
    const shrub = new THREE.Group();
    shrub.position.set(x, SW + 0.23 * s, z);
    for (let i = 0; i < 4; i++) {
      const leaf = sphere(0.1 * s, toon(0x49694e), { segments: 6, rings: 5, cast: false });
      leaf.scale.set(0.75, 1.35, 0.75);
      leaf.position.set((i - 1.5) * 0.06, 0.05 + (i % 2) * 0.06, (i % 2) * 0.04);
      shrub.add(leaf);
    }
    g.add(shrub);
  }

  // bottle crate stack and soggy cardboard by the side wall
  for (let i = 0; i < 3; i++) {
    const crate = box(0.44, 0.22, 0.32, i % 2 ? toon(0x985b40) : toon(0x3f6660), { outlineWidth: 0.003 });
    crate.position.set(2.45, SW + 0.12 + i * 0.21, -4.36);
    crate.rotation.y = 0.08 * (i - 1);
    g.add(crate);
  }
  const trashBag = sphere(0.22, toon(0x262d2b), { segments: 8, rings: 6, outlineWidth: 0.003 });
  trashBag.scale.set(1, 0.8, 0.85);
  trashBag.position.set(2.6, SW + 0.17, -3.94);
  g.add(trashBag);
  const tie = box(0.08, 0.08, 0.08, toon(0x161c1b), { outline: false, cast: false });
  tie.position.set(2.6, SW + 0.34, -3.94);
  tie.rotation.z = 0.4;
  g.add(tie);

  // curb-side pot with small shrub, and a wet cardboard box
  const cardboard = box(0.46, 0.32, 0.3, toon(0x9c8461), { outlineWidth: 0.002 });
  cardboard.position.set(-6.62, SW + 0.16, 2.58);
  cardboard.rotation.y = 0.28;
  g.add(cardboard);

  return g;
}

/* ------------------------------------------------------------------ *
 *  Main export
 * ------------------------------------------------------------------ */
export function createProps(scene) {
  const root = new THREE.Group();
  root.name = 'street-props';
  scene.add(root);

  const vendA = buildVendingMachine({ x: 1.58, z: -2.7, theme: 'blue', facing: Math.PI / 2 });
  const vendB = buildVendingMachine({ x: 1.58, z: -3.66, theme: 'red', facing: Math.PI / 2 });
  root.add(vendA.group, vendB.group);
  vendB.light.visible = false;

  const bike = buildBicycle(-2.15, 1.58, 0.1, 0.94);
  root.add(bike);

  const umbrella = buildUmbrellaStand(1.48, -0.02);
  root.add(umbrella);

  const bins = buildBins(-0.42, 1.75);
  bins.rotation.y = -0.12;
  root.add(bins);

  const board = buildNoticeboard(-8.15, 1.72, Math.PI / 2);
  root.add(board);

  const signalLamp = buildSignalLamp();
  root.add(signalLamp.group);

  const utility = buildUtilityPoles();
  root.add(utility.group);

  const guardA = buildGuardrail(-7.85, 3.01, -5.32, 3.01);
  root.add(guardA);
  const guardB = buildGuardrail(3.01, -1.42, 3.01, -5.86);
  root.add(guardB);

  const ac = buildOutdoorAC();
  root.add(ac);

  const details = buildStreetDetails();
  root.add(details);

  // extra narrow white edge line / curb paint at the base rim
  const edgePaint = new THREE.MeshBasicMaterial({ color: 0xd9d4c3, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false });
  const edgeStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 16.7), edgePaint);
  edgeStrip.rotation.x = -Math.PI / 2;
  edgeStrip.position.set(-8.33, 0.043, 0);
  root.add(edgeStrip);
  const edgeStrip2 = new THREE.Mesh(new THREE.PlaneGeometry(16.7, 0.1), edgePaint);
  edgeStrip2.rotation.x = -Math.PI / 2;
  edgeStrip2.position.set(0, 0.043, 8.33);
  root.add(edgeStrip2);

  return {
    root,
    vending: [vendA, vendB],
    bike,
    umbrella,
    bins,
    board,
    signalLamp,
    utility,
    guardrails: [guardA, guardB],
    ac,
    details,
  };
}
