import * as THREE from 'three';
import { LAYOUT } from './layout.js';
import {
  toon,
  box,
  roundedBox,
  cyl,
  sphere,
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
  rng,
  clamp,
  JP,
  EN,
} from './utils.js';
import {
  cafeSignTex,
  norenTex,
  rearNeonTex,
  apartmentWindowTex,
  flyerTex,
  noticeboardTex,
} from './textures.js';

const SW = LAYOUT.sidewalkY;

function canvasLocal(w, h, draw, key) {
  return canvasTexture(w, h, draw, { key });
}

const cafeWindowTex = canvasLocal(900, 700, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#e5ae67');
  g.addColorStop(0.5, '#c98c55');
  g.addColorStop(1, '#80573d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // back wall
  ctx.fillStyle = 'rgba(80,48,31,.35)';
  ctx.fillRect(0, 0, w, h * 0.5);
  // shelves with bottles
  ctx.fillStyle = 'rgba(74,44,28,.55)';
  ctx.fillRect(88, 155, 320, 17);
  ctx.fillRect(88, 267, 320, 15);
  for (let i = 0; i < 8; i++) {
    const x = 104 + i * 37;
    ctx.fillStyle = ['#8e5d3f', '#5e6d4e', '#b6804d', '#d5b37e'][i % 4];
    ctx.fillRect(x, 115 + (i % 3) * 7, 15, 40 - (i % 3) * 7);
    ctx.fillStyle = '#f2dcb3';
    ctx.fillRect(x + 4, 103 + (i % 3) * 7, 7, 12);
  }
  // counter and warm pendant lamps
  ctx.fillStyle = 'rgba(48,29,19,.65)';
  ctx.fillRect(0, h * 0.67, w, h * 0.33);
  ctx.fillStyle = 'rgba(222,168,91,.22)';
  ctx.fillRect(80, h * 0.67, w - 160, 20);
  for (const [x, y, r] of [[310, 102, 42], [604, 125, 33]]) {
    ctx.strokeStyle = 'rgba(49,31,20,.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, y - 18);
    ctx.stroke();
    ctx.fillStyle = '#f4c879';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    const halo = ctx.createRadialGradient(x, y, 2, x, y, r * 2.6);
    halo.addColorStop(0, 'rgba(255,213,140,.45)');
    halo.addColorStop(1, 'rgba(255,213,140,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // silhouetted table and vase
  ctx.fillStyle = 'rgba(58,36,24,.5)';
  ctx.fillRect(76, 468, 185, 15);
  ctx.fillRect(96, 480, 10, 80);
  ctx.fillRect(231, 480, 10, 80);
  ctx.fillStyle = 'rgba(212,184,131,.5)';
  ctx.beginPath();
  ctx.ellipse(168, 449, 23, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // curtains at edges
  const curtain = ctx.createLinearGradient(0, 0, 100, 0);
  curtain.addColorStop(0, 'rgba(72,43,35,.8)');
  curtain.addColorStop(1, 'rgba(72,43,35,0)');
  ctx.fillStyle = curtain;
  ctx.fillRect(0, 0, 120, h);
  const curtain2 = ctx.createLinearGradient(w, 0, w - 120, 0);
  curtain2.addColorStop(0, 'rgba(64,40,32,.8)');
  curtain2.addColorStop(1, 'rgba(64,40,32,0)');
  ctx.fillStyle = curtain2;
  ctx.fillRect(w - 120, 0, 120, h);
  // hand-lettered menu on glass
  ctx.fillStyle = 'rgba(248,236,212,.72)';
  ctx.font = `600 28px ${JP}`;
  ctx.textAlign = 'left';
  ctx.fillText('珈琲  450', 80, 565);
  ctx.fillText('雨音ブレンド', 80, 604);
  // reflection streak
  const refl = ctx.createLinearGradient(0, h, w, 0);
  refl.addColorStop(0, 'rgba(255,255,255,0)');
  refl.addColorStop(0.5, 'rgba(255,255,255,.1)');
  refl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = refl;
  ctx.fillRect(0, 0, w, h);
}, 'cafe-window-art');

const cafeDoorTex = canvasLocal(400, 720, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#553424');
  g.addColorStop(1, '#2f2019');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(236,199,139,.35)';
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  const glow = ctx.createRadialGradient(w / 2, h * 0.24, 10, w / 2, h * 0.24, w * 0.5);
  glow.addColorStop(0, 'rgba(247,190,112,.5)');
  glow.addColorStop(1, 'rgba(247,190,112,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(215,166,103,.56)';
  ctx.fillRect(60, 60, 280, 232);
  ctx.strokeStyle = 'rgba(44,28,20,.65)';
  ctx.lineWidth = 8;
  ctx.strokeRect(60, 60, 280, 232);
  ctx.fillStyle = 'rgba(223,218,194,.7)';
  ctx.font = `600 26px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('OPEN', w / 2, 352);
  ctx.fillStyle = 'rgba(206,164,108,.65)';
  ctx.beginPath();
  ctx.arc(w / 2, 285, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(42,27,19,.8)';
  ctx.beginPath();
  ctx.arc(w / 2 - 6, 280, 5, 0, Math.PI * 2);
  ctx.fill();
}, 'cafe-door-art');

const paperLanternTex = canvasLocal(256, 256, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#e4a35f');
  g.addColorStop(0.5, '#f2c483');
  g.addColorStop(1, '#d5894d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(123,69,37,.35)';
  ctx.lineWidth = 2;
  for (let y = 10; y < h; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(72,41,25,.8)';
  ctx.font = `800 83px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('雨', w / 2, h * 0.48);
  ctx.fillStyle = 'rgba(250,230,193,.45)';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.48, 80, 0, Math.PI * 2);
  ctx.stroke();
}, 'paper-lantern');

const notePaperTex = canvasLocal(360, 460, (ctx, w, h) => {
  ctx.fillStyle = '#efe4cb';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#306662';
  ctx.font = `800 39px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('本日のおすすめ', w / 2, 62);
  ctx.fillStyle = '#bd6b50';
  ctx.font = `700 30px ${JP}`;
  ctx.fillText('自家製 レモンケーキ', w / 2, 123);
  ctx.fillStyle = '#7c7463';
  ctx.font = `500 22px ${JP}`;
  ctx.fillText('雨の日は コーヒーと一緒に', w / 2, 170);
  ctx.strokeStyle = 'rgba(58,90,82,.25)';
  ctx.lineWidth = 2;
  for (let y = 207; y < 405; y += 20) {
    ctx.beginPath();
    ctx.moveTo(43, y);
    ctx.lineTo(w - 43 - (y % 5) * 7, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(178,105,76,.45)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(w / 2, 350, 68, 0, Math.PI * 2);
  ctx.stroke();
}, 'cafe-note-paper');

/* ------------------------------------------------------------------ *
 *  Kissa Amaoto — the left-hand neighbour
 * ------------------------------------------------------------------ */
function buildCafe(root) {
  const cafe = LAYOUT.cafe;
  const g = new THREE.Group();
  g.name = 'kissa-amaoto';
  root.add(g);

  const W = cafe.right - cafe.left;
  const D = cafe.front - cafe.back;
  const H = cafe.height;
  const cx = (cafe.left + cafe.right) / 2;
  const cz = (cafe.front + cafe.back) / 2;

  const wallMat = toon(0x5b554d);
  const wallUpper = toon(0x71675b);
  const wood = toon(0x3b2b23);
  const woodLight = toon(0x74563e);
  const plaster = toon(0xa39884);
  const roofMat = toon(0x2b3033);

  const body = box(W, H, D, wallMat, { outlineWidth: 0.012 });
  body.position.set(cx, SW + H / 2, cz);
  g.add(body);

  // roof slab and silhouette details
  const roof = box(W + 0.24, 0.2, D + 0.15, roofMat, { outlineWidth: 0.01 });
  roof.position.set(cx, SW + H + 0.05, cz + 0.02);
  g.add(roof);
  // eave over the street
  const eave = box(W + 0.65, 0.12, 0.5, toon(0x262c2c), { outlineWidth: 0.008 });
  eave.position.set(cx, SW + 2.43, cafe.front + 0.18);
  g.add(eave);
  const eaveLip = box(W + 0.7, 0.045, 0.11, toon(0x8a6e4e), { outlineWidth: 0.006 });
  eaveLip.position.set(cx, SW + 2.38, cafe.front + 0.4);
  g.add(eaveLip);
  for (let i = 0; i < 6; i++) {
    const tile = box(0.11, 0.024, 0.5, toon(0x4b5554), { outline: false, cast: false });
    tile.position.set(cafe.left + 0.43 + i * 0.31, SW + 2.5, cafe.front + 0.18);
    g.add(tile);
  }

  // front ground-floor warm cafe frontage
  const windowCenterX = cafe.left + 0.85;
  const windowPanel = box(1.22, 1.45, 0.08, wood, { outlineWidth: 0.005 });
  windowPanel.position.set(windowCenterX, SW + 1.17, cafe.front + 0.045);
  g.add(windowPanel);
  const cafeWindow = signFace(cafeWindowTex, 1.1, 1.31, { boost: 0.98 });
  cafeWindow.position.set(windowCenterX, SW + 1.17, cafe.front + 0.091);
  g.add(cafeWindow);
  const windowSill = box(1.34, 0.08, 0.16, woodLight, { outlineWidth: 0.004 });
  windowSill.position.set(windowCenterX, SW + 0.47, cafe.front + 0.11);
  g.add(windowSill);
  const windowTop = box(1.38, 0.13, 0.18, wood, { outlineWidth: 0.004 });
  windowTop.position.set(windowCenterX, SW + 1.93, cafe.front + 0.09);
  g.add(windowTop);
  for (const off of [-0.35, 0, 0.35]) {
    const mullion = box(0.04, 1.32, 0.05, wood, { outlineWidth: 0.002 });
    mullion.position.set(windowCenterX + off, SW + 1.17, cafe.front + 0.105);
    g.add(mullion);
  }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 1.28), new THREE.MeshPhysicalMaterial({
    color: 0xe4e9e4,
    roughness: 0.04,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 1.4,
  }));
  glass.position.set(windowCenterX, SW + 1.17, cafe.front + 0.14);
  glass.renderOrder = 2;
  g.add(glass);

  // entrance door on the alley side of the frontage
  const doorCenterX = cafe.right - 0.31;
  const doorPanel = box(0.6, 1.8, 0.1, wood, { outlineWidth: 0.004 });
  doorPanel.position.set(doorCenterX, SW + 0.98, cafe.front + 0.055);
  g.add(doorPanel);
  const doorArt = signFace(cafeDoorTex, 0.52, 1.62, { boost: 0.92 });
  doorArt.position.set(doorCenterX, SW + 1.0, cafe.front + 0.11);
  g.add(doorArt);
  const doorFrameL = box(0.075, 1.9, 0.12, wood, { outlineWidth: 0.003 });
  doorFrameL.position.set(doorCenterX - 0.33, SW + 0.98, cafe.front + 0.08);
  g.add(doorFrameL);
  const doorFrameR = doorFrameL.clone();
  doorFrameR.position.x = doorCenterX + 0.33;
  g.add(doorFrameR);

  // noren — softly animated, stored on the group for the main loop
  const norenGroup = new THREE.Group();
  norenGroup.position.set(doorCenterX, SW + 2.1, cafe.front + 0.24);
  const norenGeo = new THREE.PlaneGeometry(0.68, 0.54, 5, 4);
  // use a basic material so the indigo cloth reads in the low light
  const noren = new THREE.Mesh(norenGeo, new THREE.MeshBasicMaterial({
    map: norenTex,
    transparent: true,
    side: THREE.DoubleSide,
    toneMapped: false,
    opacity: 0.94,
  }));
  noren.position.y = -0.26;
  norenGroup.add(noren);
  const norenRod = cyl(0.018, 0.018, 0.82, wood, { radialSegments: 8, outlineWidth: 0.002 });
  norenRod.rotation.z = Math.PI / 2;
  norenGroup.add(norenRod);
  g.add(norenGroup);

  // warm paper lanterns
  function lantern(x, z, scale = 1) {
    const lg = new THREE.Group();
    lg.position.set(x, SW + 2.03, z);
    const mat = new THREE.MeshBasicMaterial({ map: paperLanternTex, toneMapped: false, color: new THREE.Color(1.1, 0.92, 0.72) });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), mat);
    body.scale.set(0.82, 1.3, 0.82);
    lg.add(body);
    const top = cyl(0.065, 0.08, 0.05, wood, { radialSegments: 10, outlineWidth: 0.002 });
    top.position.y = 0.24;
    lg.add(top);
    const bottom = cyl(0.07, 0.055, 0.04, wood, { radialSegments: 10, outlineWidth: 0.002 });
    bottom.position.y = -0.24;
    lg.add(bottom);
    const cord = cyl(0.006, 0.006, 0.28, wood, { radialSegments: 4, outline: false, cast: false });
    cord.position.y = 0.4;
    lg.add(cord);
    const glow = glowSprite(glowTex, 0xffa85c, 0.8, 1.05, 0.22);
    lg.add(glow);
    lg.scale.setScalar(scale);
    g.add(lg);
    return lg;
  }
  lantern(cafe.left + 2.0, cafe.front + 0.36, 0.95);
  lantern(cafe.left + 0.27, cafe.front + 0.36, 0.78);

  // facade timber beams
  for (const x of [cafe.left + 0.08, windowCenterX + 0.69, cafe.right - 0.055]) {
    const beam = box(0.07, 2.35, 0.06, wood, { outlineWidth: 0.003 });
    beam.position.set(x, SW + 1.16, cafe.front + 0.09);
    g.add(beam);
  }
  const beamH = box(W - 0.12, 0.075, 0.06, wood, { outlineWidth: 0.003 });
  beamH.position.set(cx, SW + 2.31, cafe.front + 0.09);
  g.add(beamH);

  // upper window with balcony
  const upWin = new THREE.Group();
  upWin.position.set(cafe.left + 0.78, SW + 3.32, cafe.front + 0.05);
  const upFrame = box(1.05, 1.06, 0.1, wood, { outlineWidth: 0.004 });
  upWin.add(upFrame);
  const upGlass = signFace(apartmentWindowTex(1, true), 0.91, 0.92, { boost: 0.68 });
  upGlass.position.z = 0.06;
  upWin.add(upGlass);
  for (let i = 0; i < 3; i++) {
    const slat = box(0.91, 0.015, 0.025, woodLight, { outline: false, cast: false });
    slat.position.set(0, -0.4 + i * 0.4, 0.075);
    upWin.add(slat);
  }
  g.add(upWin);
  // second dark window
  const upWin2 = upWin.clone();
  upWin2.position.set(cafe.left + 1.82, SW + 3.32, cafe.front + 0.05);
  upWin2.children[1].material = new THREE.MeshBasicMaterial({ map: apartmentWindowTex(3, false), color: 0xb9c4c4, toneMapped: false });
  g.add(upWin2);
  // window boxes
  for (const x of [cafe.left + 0.78, cafe.left + 1.82]) {
    const planter = box(1.15, 0.12, 0.18, wood, { outlineWidth: 0.003 });
    planter.position.set(x, SW + 2.99, cafe.front + 0.14);
    g.add(planter);
    for (let i = 0; i < 4; i++) {
      const leaf = sphere(0.055, toon(0x4a6b4c), { segments: 6, rings: 5, cast: false });
      leaf.scale.set(0.7, 1.4, 0.8);
      leaf.position.set(x - 0.4 + i * 0.24, SW + 3.08, cafe.front + 0.16);
      g.add(leaf);
    }
  }

  // cafe blade sign
  const bladeSignBack = box(0.54, 1.48, 0.08, wood, { outlineWidth: 0.005 });
  bladeSignBack.position.set(cafe.right - 0.28, SW + 2.95, cafe.front + 0.24);
  g.add(bladeSignBack);
  const bladeSign = signFace(cafeSignTex, 0.48, 1.4, { boost: 0.92 });
  bladeSign.position.set(cafe.right - 0.28, SW + 2.95, cafe.front + 0.285);
  g.add(bladeSign);
  const bladeBracket = box(0.04, 0.04, 0.42, wood, { outlineWidth: 0.002 });
  bladeBracket.position.set(cafe.right - 0.28, SW + 3.59, cafe.front + 0.16);
  g.add(bladeBracket);
  const cafeHalo = glowSprite(glowTex, 0xffb26c, 1.45, 2.2, 0.16);
  cafeHalo.position.set(cafe.right - 0.28, SW + 2.88, cafe.front + 0.35);
  g.add(cafeHalo);
  const cafeSignLight = new THREE.PointLight(0xffb076, 2.0, 4.5, 2);
  cafeSignLight.visible = false;
  cafeSignLight.position.set(cafe.right - 0.4, SW + 2.1, cafe.front + 0.8);
  g.add(cafeSignLight);

  // small awning over door
  const doorAwning = box(0.92, 0.08, 0.47, toon(0x38433e), { outlineWidth: 0.004 });
  doorAwning.position.set(doorCenterX, SW + 1.97, cafe.front + 0.28);
  doorAwning.rotation.x = 0.12;
  g.add(doorAwning);
  for (const sx of [-0.35, 0.35]) {
    const rod = cyl(0.012, 0.012, 0.38, toon(0x87867c), { radialSegments: 5, outline: false, cast: false });
    rod.position.set(doorCenterX + sx, SW + 2.08, cafe.front + 0.35);
    rod.rotation.x = 0.5;
    g.add(rod);
  }

  // small potted plants and a bench at the front
  const potMat = toon(0x8d5f47);
  for (const [x, z, s] of [[cafe.left + 0.27, cafe.front + 0.38, 0.8], [cafe.left + 1.8, cafe.front + 0.39, 0.65]]) {
    const pot = cyl(0.12 * s, 0.09 * s, 0.18 * s, potMat, { radialSegments: 10, outlineWidth: 0.003 });
    pot.position.set(x, SW + 0.09, z);
    g.add(pot);
    for (let i = 0; i < 3; i++) {
      const leaf = sphere(0.09 * s, toon(0x516f51), { segments: 7, rings: 5, cast: false });
      leaf.scale.set(0.7, 1.25, 0.8);
      leaf.position.set(x + (i - 1) * 0.07, SW + 0.22 + (i % 2) * 0.06, z);
      g.add(leaf);
    }
  }
  const bench = box(0.86, 0.09, 0.36, woodLight, { outlineWidth: 0.003 });
  bench.position.set(cafe.left + 1.88, SW + 0.45, cafe.front + 0.27);
  g.add(bench);
  for (const sx of [-0.33, 0.33]) {
    const leg = box(0.06, 0.38, 0.26, wood, { outlineWidth: 0.002 });
    leg.position.set(cafe.left + 1.88 + sx, SW + 0.22, cafe.front + 0.27);
    g.add(leg);
  }

  // hotel-like small illuminated sign above the window
  const upperBoard = box(2.0, 0.16, 0.08, toon(0xd3b182), { outlineWidth: 0.003, cast: false });
  upperBoard.position.set(cx, SW + 2.22, cafe.front + 0.13);
  g.add(upperBoard);
  const upperText = signFace(canvasLocal(800, 100, (ctx, w, h) => {
    ctx.fillStyle = '#d6bd9b';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#45352c';
    ctx.font = `600 44px ${JP}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '8px';
    ctx.fillText('珈琲と雨音', w / 2, h / 2);
    ctx.letterSpacing = '0px';
  }, 'cafe-upper-text'), 1.94, 0.12);
  upperText.position.set(cx, SW + 2.22, cafe.front + 0.18);
  g.add(upperText);

  // AC unit and pipes on the street facade
  const ac = box(0.68, 0.48, 0.3, toon(0xb0ae9f), { outlineWidth: 0.005 });
  ac.position.set(cafe.left + 0.56, SW + 3.78, cafe.front + 0.22);
  g.add(ac);
  const acFan = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16), toon(0x61625b));
  acFan.rotation.x = -Math.PI / 2;
  acFan.position.set(cafe.left + 0.56, SW + 4.03, cafe.front + 0.22);
  g.add(acFan);
  const drain = cyl(0.03, 0.03, 3.9, toon(0x817d71), { radialSegments: 6, outlineWidth: 0.001 });
  drain.position.set(cafe.right - 0.1, SW + 2.02, cafe.front + 0.07);
  g.add(drain);

  // side wall facing the alley — pipes, small window, lamp
  const alleyLampArm = box(0.05, 0.05, 0.42, wood, { outlineWidth: 0.002 });
  alleyLampArm.position.set(cafe.right + 0.02, SW + 2.28, cafe.front - 1.2);
  g.add(alleyLampArm);
  const alleyLampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.5, 0.65), toneMapped: false });
  const alleyLamp = sphere(0.07, alleyLampMat, { segments: 8, rings: 6, outline: false, cast: false });
  alleyLamp.position.set(cafe.right + 0.23, SW + 2.18, cafe.front - 1.2);
  g.add(alleyLamp);
  const alleyLampGlow = glowSprite(glowTex, 0xffb06a, 1.2, 1.2, 0.18);
  alleyLampGlow.position.copy(alleyLamp.position);
  g.add(alleyLampGlow);
  const alleyLight = new THREE.PointLight(0xffb273, 1.6, 3.4, 2);
  alleyLight.visible = false;
  alleyLight.position.set(cafe.right + 0.28, SW + 2.0, cafe.front - 1.35);
  g.add(alleyLight);

  // flyers/poster on the side wall
  const poster = box(0.34, 0.46, 0.02, toon(0xd7c7aa), { outlineWidth: 0.002, cast: false });
  poster.rotation.y = Math.PI / 2;
  poster.position.set(cafe.right + 0.037, SW + 1.5, cafe.front - 2.4);
  g.add(poster);
  const posterFace = signFace(flyerTex, 0.3, 0.41);
  posterFace.rotation.y = Math.PI / 2;
  posterFace.position.set(cafe.right + 0.05, SW + 1.5, cafe.front - 2.4);
  g.add(posterFace);

  // contact shadow
  const cs = contactShadow(3.0, 9.4, 0.3, 0x010306);
  cs.position.set(cx + 0.15, SW + 0.008, cz);
  g.add(cs);

  // roof little chimney and antenna
  const chimney = box(0.36, 0.56, 0.36, toon(0x5f5b53), { outlineWidth: 0.004 });
  chimney.position.set(cafe.left + 0.5, SW + H + 0.36, cafe.back + 1.2);
  g.add(chimney);

  return { group: g, noren, norenGeo, norenBase: noren.geometry.attributes.position.array.slice(), cafeLight: cafeSignLight };
}

/* ------------------------------------------------------------------ *
 *  small apartment block behind the store
 * ------------------------------------------------------------------ */
function buildRearBlock(root) {
  const b = LAYOUT.rearBlock;
  const g = new THREE.Group();
  g.name = 'minato-apartments';
  root.add(g);

  const W = b.right - b.left;
  const D = b.back - b.front < 0 ? b.front - b.back : b.back - b.front;
  const H = b.height;
  const cx = (b.left + b.right) / 2;
  const cz = (b.front + b.back) / 2;

  const wall = toon(0x3d434d, { emissive: 0x121a23, emissiveIntensity: 0.34 });
  const wall2 = toon(0x4b515b, { emissive: 0x161e26, emissiveIntensity: 0.3 });
  const trim = toon(0x2c333c, { emissive: 0x111820, emissiveIntensity: 0.35 });
  const metal = toon(0x707b7e);
  const roofMat = toon(0x23282e);

  const body = box(W, H, D, wall, { outlineWidth: 0.014 });
  body.position.set(cx, SW + H / 2, cz);
  g.add(body);
  // a slightly paler vertical stair/elevator band
  const band = box(1.15, H, 0.12, wall2, { outlineWidth: 0.005 });
  band.position.set(b.right - 1.0, SW + H / 2, b.front + 0.065);
  g.add(band);
  // dark roof cap
  const roof = box(W + 0.22, 0.24, D + 0.15, roofMat, { outlineWidth: 0.01 });
  roof.position.set(cx, SW + H + 0.07, cz);
  g.add(roof);
  for (let i = 0; i < 6; i++) {
    const ridge = box(W + 0.18, 0.045, 0.09, toon(0x4a5154), { outline: false, cast: false });
    ridge.position.set(cx, SW + H + 0.2, b.back + 0.35 + i * 0.5);
    g.add(ridge);
  }

  // front face windows and balconies above the store roofline
  const winData = [
    { y: 4.0, x: b.left + 0.95, variant: 0, lit: true },
    { y: 4.0, x: b.left + 2.25, variant: 1, lit: true },
    { y: 5.22, x: b.left + 0.95, variant: 2, lit: false },
    { y: 5.22, x: b.left + 2.25, variant: 3, lit: true },
    { y: 5.22, x: b.left + 3.55, variant: 0, lit: false },
  ];
  function windowUnit(x, y, z, variant, lit, ry = 0) {
    const wg = new THREE.Group();
    wg.position.set(x, y, z);
    wg.rotation.y = ry;
    const frame = box(1.02, 1.04, 0.09, trim, { outlineWidth: 0.004 });
    wg.add(frame);
    const face = signFace(apartmentWindowTex(variant, lit), 0.9, 0.92, { boost: lit ? 0.62 : 0.36 });
    face.position.z = 0.055;
    wg.add(face);
    const sill = box(1.12, 0.08, 0.18, toon(0x6b6e6b), { outlineWidth: 0.003 });
    sill.position.set(0, -0.54, 0.05);
    wg.add(sill);
    // curtains inside some windows
    if (lit) {
      const curtainMat = new THREE.MeshBasicMaterial({ color: 0xe0cba7, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false });
      const c = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.8), curtainMat);
      c.position.set(-0.31, 0, 0.072);
      wg.add(c);
    }
    g.add(wg);
    return wg;
  }
  for (const d of winData) windowUnit(d.x, SW + d.y, b.front + 0.075, d.variant, d.lit);

  // balconies on the two lower windows
  function balcony(x, y, w = 1.42) {
    const bg = new THREE.Group();
    bg.position.set(x, SW + y, b.front + 0.24);
    const slab = box(w, 0.09, 0.48, toon(0x555c5e), { outlineWidth: 0.004 });
    bg.add(slab);
    const railMat = toon(0x9ca4a3);
    for (let i = 0; i < 7; i++) {
      const rail = box(0.024, 0.52, 0.024, railMat, { outlineWidth: 0.001 });
      rail.position.set(-w / 2 + 0.1 + i * ((w - 0.2) / 6), 0.3, 0.2);
      bg.add(rail);
    }
    const handrail = box(w, 0.04, 0.035, railMat, { outlineWidth: 0.002 });
    handrail.position.set(0, 0.56, 0.2);
    bg.add(handrail);
    // laundry pole
    const pole = cyl(0.016, 0.016, w - 0.1, metal, { radialSegments: 5, outline: false, cast: false });
    pole.rotation.z = Math.PI / 2;
    pole.position.set(0, 0.68, 0.1);
    bg.add(pole);
    // little laundry cloths
    for (const [x2, c] of [[-0.3, 0xd8d3c2], [0.19, 0xb8ced0]]) {
      const cloth = box(0.27, 0.34, 0.01, new THREE.MeshToonMaterial({ color: c, side: THREE.DoubleSide }), { outlineWidth: 0.001, cast: false });
      cloth.position.set(x2, 0.52, 0.115);
      bg.add(cloth);
    }
    g.add(bg);
  }
  balcony(b.left + 0.95, 4.0);
  balcony(b.left + 2.25, 4.0);

  // side face windows facing the side street
  windowUnit(b.right + 0.02, SW + 4.3, b.front - 1.3, 0, true, Math.PI / 2);
  windowUnit(b.right + 0.02, SW + 5.4, b.front - 1.3, 2, false, Math.PI / 2);
  windowUnit(b.right + 0.02, SW + 4.55, b.front - 2.5, 1, true, Math.PI / 2);

  // side entrance / service door at street level (only partially visible beside the store)
  const sideDoor = box(0.86, 1.74, 0.07, toon(0x4e5b5b), { outlineWidth: 0.004 });
  sideDoor.rotation.y = Math.PI / 2;
  sideDoor.position.set(b.right + 0.04, SW + 0.87, b.front - 2.8);
  g.add(sideDoor);
  const sideDoorLight = new THREE.MeshBasicMaterial({ color: 0xe7d4a7, transparent: true, opacity: 0.7, toneMapped: false });
  const litDoor = box(0.38, 0.42, 0.01, sideDoorLight, { outline: false, cast: false });
  litDoor.rotation.y = Math.PI / 2;
  litDoor.position.set(b.right + 0.085, SW + 1.45, b.front - 2.8);
  g.add(litDoor);

  // neon vertical sign on the corner
  const neonBack = box(0.035, 1.45, 0.46, toon(0x1b2025), { outlineWidth: 0.004 });
  neonBack.position.set(b.right + 0.12, SW + 4.55, b.front - 1.05);
  g.add(neonBack);
  const neon = signFace(rearNeonTex, 0.39, 1.33, { boost: 1.05 });
  neon.rotation.y = Math.PI / 2;
  neon.position.set(b.right + 0.145, SW + 4.55, b.front - 1.05);
  g.add(neon);
  const neonHalo = glowSprite(glowTex, 0xff709a, 1.8, 2.9, 0.16);
  neonHalo.position.set(b.right + 0.22, SW + 4.45, b.front - 1.05);
  g.add(neonHalo);
  const neonLight = new THREE.PointLight(0xff6f9b, 3.2, 5.0, 2);
  neonLight.position.set(b.right + 0.35, SW + 4.15, b.front - 1.1);
  g.add(neonLight);

  // a second blade of neon on the front face so the colour carries into
  // the main three-quarter view
  const frontNeonBack = box(0.42, 1.36, 0.055, toon(0x14191f), { outlineWidth: 0.004 });
  frontNeonBack.position.set(b.left + 3.98, SW + 4.72, b.front + 0.1);
  g.add(frontNeonBack);
  const frontNeon = signFace(rearNeonTex, 0.38, 1.28, { boost: 1.18 });
  frontNeon.position.set(b.left + 3.98, SW + 4.72, b.front + 0.132);
  g.add(frontNeon);
  const frontNeonHalo = glowSprite(glowTex, 0xff7ca2, 2.0, 3.0, 0.2);
  frontNeonHalo.position.set(b.left + 3.98, SW + 4.58, b.front + 0.22);
  g.add(frontNeonHalo);
  const frontNeonLight = new THREE.PointLight(0xff6f9b, 3.3, 5.0, 2);
  frontNeonLight.visible = false;
  frontNeonLight.position.set(b.left + 3.85, SW + 4.2, b.front + 0.35);
  g.add(frontNeonLight);
  // teal lamps on staircase
  for (let i = 0; i < 2; i++) {
    const lamp = cyl(0.05, 0.05, 0.04, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 2.0, 1.7), toneMapped: false }), { radialSegments: 8, outline: false, cast: false });
    lamp.rotation.z = Math.PI / 2;
    lamp.position.set(b.right + 0.1, SW + 3.2 + i * 1.2, b.front - 3.1);
    g.add(lamp);
  }

  // rooftop water tank and frames
  const tank = new THREE.Group();
  tank.position.set(cx - 0.4, SW + H + 0.28, cz + 0.2);
  const tankBody = cyl(0.6, 0.6, 1.1, toon(0x9ea5a0), { radialSegments: 18, outlineWidth: 0.006 });
  tank.add(tankBody);
  const tankTop = cyl(0.64, 0.58, 0.1, toon(0x707979), { radialSegments: 18, outlineWidth: 0.004 });
  tankTop.position.y = 0.6;
  tank.add(tankTop);
  for (let i = 0; i < 4; i++) {
    const leg = box(0.07, 0.46, 0.07, metal, { outlineWidth: 0.002 });
    leg.position.set((i % 2 ? 1 : -1) * 0.38, -0.7, (i < 2 ? 1 : -1) * 0.32);
    tank.add(leg);
  }
  g.add(tank);
  const roofAC = box(0.8, 0.44, 0.4, toon(0x838a85), { outlineWidth: 0.004 });
  roofAC.position.set(b.right - 0.8, SW + H + 0.36, b.back + 0.6);
  g.add(roofAC);
  const roofACgrill = new THREE.Mesh(new THREE.CircleGeometry(0.15, 12), toon(0x424b4b));
  roofACgrill.rotation.x = -Math.PI / 2;
  roofACgrill.position.set(b.right - 0.8, SW + H + 0.59, b.back + 0.6);
  g.add(roofACgrill);
  const antenna = cyl(0.012, 0.018, 1.5, metal, { radialSegments: 4, outline: false, cast: false });
  antenna.position.set(b.left + 0.7, SW + H + 0.85, b.back + 0.5);
  g.add(antenna);
  for (let i = 0; i < 3; i++) {
    const arm = box(0.52, 0.012, 0.012, metal, { outline: false, cast: false });
    arm.position.set(b.left + 0.7, SW + H + 0.6 + i * 0.2, b.back + 0.5);
    arm.rotation.y = i * 0.8;
    g.add(arm);
  }

  // exterior pipes and downspouts
  for (const [x, z] of [[b.right - 0.16, b.front + 0.02], [b.left + 0.25, b.front + 0.02]]) {
    const pipe = cyl(0.035, 0.035, H - 0.2, toon(0x6f7774), { radialSegments: 6, outlineWidth: 0.001 });
    pipe.position.set(x, SW + H / 2, z);
    g.add(pipe);
  }
  const roofDrain = cyl(0.045, 0.045, 1.3, toon(0x777c78), { radialSegments: 6, outline: false, cast: false });
  roofDrain.position.set(cx + 1.85, SW + H + 0.35, b.front + 0.04);
  g.add(roofDrain);

  // ground contact
  const cs = contactShadow(5.4, 3.4, 0.35, 0x010407);
  cs.position.set(cx, SW + 0.01, b.front - 0.7);
  g.add(cs);
  const rim = box(W + 0.1, 0.08, D + 0.1, toon(0x626c6a), { outlineWidth: 0.003 });
  rim.position.set(cx, SW + 0.04, cz);
  g.add(rim);

  return { group: g, neonLight, neon, neonHalo };
}

/* ------------------------------------------------------------------ *
 *  The narrow alley between cafe and store
 * ------------------------------------------------------------------ */
function buildAlley(root) {
  const g = new THREE.Group();
  g.name = 'alley-mouth';
  root.add(g);
  const x0 = LAYOUT.cafe.right;
  const x1 = LAYOUT.store.left;
  const width = x1 - x0;
  const cz = 0.15;

  // ground puddle
  const puddle = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 18),
    new THREE.MeshPhysicalMaterial({
      color: 0x1e3038,
      roughness: 0.06,
      metalness: 0.15,
      transparent: true,
      opacity: 0.62,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      depthWrite: false,
      envMapIntensity: 1.7,
    }),
  );
  puddle.rotation.x = -Math.PI / 2;
  puddle.scale.set(1.5, 1.0, 1);
  puddle.position.set(x0 + width * 0.5, SW + 0.012, cz);
  puddle.renderOrder = 2;
  g.add(puddle);

  // crates stack deep in the alley
  for (let i = 0; i < 4; i++) {
    const crate = box(0.34, 0.19, 0.28, i % 2 ? toon(0xb26b4b) : toon(0x4c706a), { outlineWidth: 0.003 });
    crate.position.set(x1 - 0.22, SW + 0.1 + i * 0.19, cz - 1.3 + (i % 2) * 0.07);
    crate.rotation.y = 0.1 * (i - 2);
    g.add(crate);
  }
  const crate2 = box(0.4, 0.24, 0.32, toon(0x9c7a53), { outlineWidth: 0.003 });
  crate2.position.set(x0 + 0.27, SW + 0.12, cz - 0.7);
  crate2.rotation.y = -0.2;
  g.add(crate2);
  // cardboard
  const cardboard = box(0.45, 0.32, 0.06, toon(0xa58d68), { outlineWidth: 0.003 });
  cardboard.position.set(x0 + 0.28, SW + 0.34, cz - 0.65);
  cardboard.rotation.set(0.1, -0.15, 0.05);
  g.add(cardboard);
  // little sign on wall
  const sign = signFace(notePaperTex, 0.27, 0.34, { boost: 0.8 });
  sign.rotation.y = Math.PI / 2;
  sign.position.set(x0 + 0.04, SW + 1.35, cz - 0.35);
  g.add(sign);
  // warm hanging lamp deep in
  const arm = box(0.035, 0.035, 0.34, toon(0x37322a), { outlineWidth: 0.001 });
  arm.position.set(x1 - 0.1, SW + 2.18, cz - 1.8);
  g.add(arm);
  const bulb = sphere(0.06, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.4, 0.65), toneMapped: false }), { segments: 8, rings: 6, outline: false, cast: false });
  bulb.position.set(x1 - 0.2, SW + 2.1, cz - 1.8);
  g.add(bulb);
  const glow = glowSprite(glowTex, 0xffb06a, 1.25, 1.25, 0.25);
  glow.position.copy(bulb.position);
  g.add(glow);
  const light = new THREE.PointLight(0xffb471, 1.4, 3.5, 2);
  light.position.set(x1 - 0.25, SW + 1.95, cz - 1.8);
  light.visible = false;
  g.add(light);

  return { group: g, puddle };
}

export function createNeighborhood(scene) {
  const root = new THREE.Group();
  root.name = 'neighbourhood';
  scene.add(root);
  const cafeData = buildCafe(root);
  const rearData = buildRearBlock(root);
  const alleyData = buildAlley(root);

  // low stone strip boundary between the sidewalk and the roads
  return { root, cafe: cafeData, rear: rearData, alley: alleyData };
}
