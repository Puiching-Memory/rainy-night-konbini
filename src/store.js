import * as THREE from 'three';
import { LAYOUT } from './layout.js';
import { createInterior } from './interior.js';
import {
  C,
  JP,
  EN,
  toon,
  basic,
  box,
  roundedBox,
  cyl,
  sphere,
  add,
  addOutline,
  flatPlane,
  signFace,
  decalTexturePlane,
  glowSprite,
  glowTex,
  streakTex,
  canvasTexture,
  fillRound,
  strokeRound,
  starPath,
  coverText,
  contactShadow,
  reflectionSmear,
  lightPool,
  clamp,
  lerp,
} from './utils.js';
import {
  fasciaFrontTex,
  fasciaSideTex,
  fasciaCornerTex,
  cornerSignTex,
  cornerSignBackTex,
  storeHoursTex,
  doorDecalTex,
  entranceMatTex,
  posterOnigiriTex,
  posterCoffeeTex,
  posterChickenTex,
  posterNewTex,
  glassDropsTex,
  coffeeMenuTex,
  staffSignTex,
} from './textures.js';

const S = LAYOUT.store;

/* local helpers ---------------------------------------------------- */
function shapeXZ(points) {
  const shape = new THREE.Shape();
  points.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  return shape;
}

function flatPolygon(points, mat, y = 0) {
  const geo = new THREE.ShapeGeometry(shapeXZ(points), 12);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = y;
  mesh.receiveShadow = true;
  return mesh;
}

function extrudePolygon(points, depth, mat, y, opts = {}) {
  const shape = shapeXZ(points);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 4,
  });
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = y;
  mesh.receiveShadow = true;
  mesh.castShadow = opts.cast ?? true;
  if (opts.outline !== false) addOutline(mesh, opts.outlineWidth ?? 0.01);
  return mesh;
}

function storeShape() {
  return [
    [S.left, S.back],
    [S.right, S.back],
    [S.right, S.chamferB[1]],
    [S.chamferB[0], S.chamferB[1]],
    [S.chamferA[0], S.chamferA[1]],
    [S.left, S.front],
  ];
}

function localCanvas(w, h, draw) {
  return canvasTexture(w, h, draw);
}

const glassShineTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, h, w, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(.38, 'rgba(202,231,239,0.02)');
  g.addColorStop(.47, 'rgba(235,250,255,0.20)');
  g.addColorStop(.54, 'rgba(235,250,255,0.04)');
  g.addColorStop(.62, 'rgba(255,255,255,0.10)');
  g.addColorStop(.72, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // faint reflected vertical signage
  ctx.fillStyle = 'rgba(255,170,90,.045)';
  fillRound(ctx, w * .68, h * .18, w * .07, h * .6, 10, 'rgba(255,170,90,.06)');
  ctx.fillStyle = 'rgba(133,226,210,.045)';
  fillRound(ctx, w * .18, h * .12, w * .045, h * .5, 6, 'rgba(133,226,210,.05)');
}, { key: 'glass-shine' });

const windowStripeTex = canvasTexture(1024, 96, (ctx, w, h) => {
  ctx.fillStyle = 'rgba(248,240,224,.82)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(20,119,112,.92)';
  ctx.fillRect(0, h - 13, w, 6);
  ctx.fillStyle = 'rgba(233,153,70,.95)';
  ctx.fillRect(0, h - 7, w, 3);
  ctx.fillStyle = 'rgba(212,96,112,.95)';
  ctx.fillRect(0, h - 4, w, 3);
  ctx.fillStyle = '#17625f';
  ctx.font = `700 31px ${EN}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '5px';
  ctx.fillText('HOSHIMART  /  OPEN 24 HOURS  /  COFFEE  /  FOOD  /  ATM', w / 2, 40);
  ctx.letterSpacing = '0px';
}, { key: 'window-stripe' });

const menuBoardTex = canvasTexture(512, 220, (ctx, w, h) => {
  ctx.fillStyle = '#183d39';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(240,231,208,.5)';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = '#f5ecd8';
  ctx.font = `800 39px ${JP}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('HOT COFFEE', 28, 60);
  ctx.fillStyle = '#efaa56';
  ctx.font = `900 51px ${EN}`;
  ctx.fillText('¥150', 28, 127);
  ctx.fillStyle = '#a5cbbd';
  ctx.font = `600 22px ${JP}`;
  ctx.fillText('おにぎり  ¥100  /  からあげ  ¥180', 29, 171);
  drawMiniCup(ctx, 405, 105, 1.3);
}, { key: 'menu-board-2' });

function drawMiniCup(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f3e7d1';
  ctx.beginPath();
  ctx.moveTo(-29 * s, -32 * s);
  ctx.lineTo(29 * s, -32 * s);
  ctx.lineTo(21 * s, 36 * s);
  ctx.quadraticCurveTo(0, 47 * s, -21 * s, 36 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d96355';
  ctx.fillRect(-27 * s, -13 * s, 54 * s, 11 * s);
  ctx.strokeStyle = 'rgba(245,235,215,.7)';
  ctx.lineWidth = 2.3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 10 * s, -49 * s);
    ctx.bezierCurveTo(i * 10 * s - 8 * s, -62 * s, i * 10 * s + 11 * s, -69 * s, i * 4 * s, -82 * s);
    ctx.stroke();
  }
  ctx.restore();
}

function makeGlass(width, height, position, rotY, parent, glassSurfaces, opts = {}) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotY;
  parent.add(group);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: opts.tint ?? 0xb3d5dc,
    metalness: 0.0,
    roughness: 0.02,
    transparent: true,
    opacity: (opts.opacity ?? 0.16) * 0.55,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), glassMat);
  pane.renderOrder = opts.renderOrder ?? 2;
  group.add(pane);

  // static beads and rivulets
  const dropsMat = new THREE.MeshBasicMaterial({
    map: glassDropsTex,
    transparent: true,
    opacity: (opts.dropsOpacity ?? 0.28) * 0.38,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    toneMapped: false,
  });
  dropsMat.fog = false;
  const drops = new THREE.Mesh(new THREE.PlaneGeometry(width, height), dropsMat);
  drops.position.z = 0.012;
  drops.renderOrder = 3;
  group.add(drops);

  // a soft diagonal reflection
  const shineMat = new THREE.MeshBasicMaterial({
    map: glassShineTex,
    transparent: true,
    opacity: (opts.shineOpacity ?? 0.65) * 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    toneMapped: false,
  });
  shineMat.fog = false;
  const shine = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.1, height * 1.1), shineMat);
  shine.position.z = 0.016;
  shine.renderOrder = 3;
  group.add(shine);

  const surf = { group, width, height, drops, shine, pane, kind: opts.kind ?? 'window' };
  glassSurfaces.push(surf);
  return surf;
}

function addFrame(root, frameMat, x, y, z, w, h, d, opts = {}) {
  const m = box(w, h, d, frameMat, {
    outline: opts.outline ?? true,
    outlineWidth: opts.outlineWidth ?? 0.005,
    cast: opts.cast ?? true,
  });
  m.position.set(x, y, z);
  root.add(m);
  return m;
}

/* ------------------------------------------------------------------ *
 *  Storefront shell + signwork
 * ------------------------------------------------------------------ */
export function createStore(scene) {
  const root = new THREE.Group();
  root.name = 'HOSHIMART';
  scene.add(root);

  const glassSurfaces = [];
  const animated = {
    glassSurfaces,
    door: null,
    signMaterials: [],
    signLights: [],
    steamAnchors: [],
    dripPoints: [],
    interior: null,
  };

  const mats = {
    cream: toon(0xeee5d2),
    creamDim: toon(0xd8d0be),
    teal: toon(0x156f6a),
    tealDeep: toon(0x0b4b49),
    orange: toon(0xe79a45),
    coral: toon(0xce6251),
    trim: toon(0x5f6867),
    dark: toon(0x1a2c2c),
    floor: toon(0xddcfb6),
    white: toon(0xf6f1e5),
    metal: toon(0x8e9b9c),
    roof: toon(0x4a4f4e),
  };

  // foundation, faint contact shadow
  const foundation = extrudePolygon(
    [
      [S.left - 0.06, S.back - 0.06],
      [S.right + 0.09, S.back - 0.06],
      [S.right + 0.09, S.chamferB[1] - 0.06],
      [S.chamferA[0] + 0.08, S.front + 0.09],
      [S.left - 0.06, S.front + 0.09],
    ],
    0.11,
    toon(0x6c7170),
    0.055,
    { outlineWidth: 0.007 },
  );
  root.add(foundation);
  const shadow = contactShadow(8.0, 6.7, 0.34, 0x010407);
  shadow.position.set(-2.05, 0.172, -2.1);
  root.add(shadow);

  // interior floor, slightly inset
  const floor = flatPolygon(storeShape(), toon(0xffffff, {
    map: null,
    emissive: 0xf3c987,
    emissiveIntensity: 0.08,
  }), S.floor);
  root.add(floor);

  // back and side walls
  const wallH = 3.5;
  const wallY = 0.16 + wallH / 2;
  addFrame(root, mats.cream, -2.05, wallY, S.back + 0.08, S.right - S.left, wallH, 0.16);
  addFrame(root, mats.cream, S.left + 0.08, wallY, (S.back + S.front) / 2, 0.16, wallH, S.front - S.back);
  addFrame(root, mats.cream, S.right - 0.08, wallY, (S.back - 2.55) / 2, 0.16, wallH, -2.55 - S.back);

  // base / kick walls (under the glazing)
  const kickH = 0.42;
  addFrame(root, mats.tealDeep, -2.55, 0.16 + kickH / 2, S.front + 0.045, 5.4, kickH, 0.13, { outlineWidth: 0.006 });
  addFrame(root, mats.tealDeep, S.right + 0.045, 0.16 + kickH / 2, (-0.45 + -2.55) / 2, 0.13, kickH, 2.1, { outlineWidth: 0.006 });
  // a slim metal kick strip
  const metalStrip = toon(0x97a2a0);
  addFrame(root, metalStrip, -2.55, 0.57, S.front + 0.055, 5.36, 0.035, 0.14, { outline: false });
  addFrame(root, metalStrip, S.right + 0.055, 0.57, -1.5, 0.14, 0.035, 2.06, { outline: false });

  // headers above the glazing
  addFrame(root, mats.cream, -2.55, 2.68, S.front + 0.045, 5.4, 0.24, 0.15, { outlineWidth: 0.005 });
  addFrame(root, mats.cream, S.right + 0.045, 2.68, -1.5, 0.15, 0.24, 2.1, { outlineWidth: 0.005 });

  // facade vertical posts
  const postPositions = [-5.2, -3.39, -1.53, 0.12];
  for (const x of postPositions) {
    addFrame(root, mats.teal, x, 1.6, S.front + 0.06, 0.075, 2.1, 0.12, { outlineWidth: 0.004 });
  }
  for (const z of [-0.48, -1.51, -2.54]) {
    addFrame(root, mats.teal, S.right + 0.06, 1.6, z, 0.12, 2.1, 0.075, { outlineWidth: 0.004 });
  }

  // front glass (three generous panes)
  makeGlass(1.74, 1.94, new THREE.Vector3(-4.295, 1.55, S.front + 0.018), 0, root, glassSurfaces, { kind: 'front', dropsOpacity: 0.3 });
  makeGlass(1.78, 1.94, new THREE.Vector3(-2.46, 1.55, S.front + 0.018), 0, root, glassSurfaces, { kind: 'front', dropsOpacity: 0.33 });
  makeGlass(1.57, 1.94, new THREE.Vector3(-0.705, 1.55, S.front + 0.018), 0, root, glassSurfaces, { kind: 'front', dropsOpacity: 0.27 });

  // side glass (faces the side street)
  makeGlass(1.0, 1.94, new THREE.Vector3(S.right + 0.018, 1.55, -1.0), Math.PI / 2, root, glassSurfaces, { kind: 'side', dropsOpacity: 0.3 });
  makeGlass(1.0, 1.94, new THREE.Vector3(S.right + 0.018, 1.55, -2.03), Math.PI / 2, root, glassSurfaces, { kind: 'side', dropsOpacity: 0.25 });

  // glass stripe along the bottom
  const stripeMat = new THREE.MeshBasicMaterial({
    map: windowStripeTex,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  stripeMat.fog = false;
  const stripePlane = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.16), stripeMat);
  stripePlane.position.set(-2.0, 0.73, S.front + 0.062);
  stripePlane.renderOrder = 4;
  root.add(stripePlane);
  const sideStripe = stripePlane.clone();
  sideStripe.rotation.y = Math.PI / 2;
  sideStripe.position.set(S.right + 0.062, 0.73, -1.0);
  root.add(sideStripe);

  // posters on the glass
  function windowPoster(tex, w, h, x, y, z, ry = 0) {
    const back = box(w + 0.04, h + 0.04, 0.012, mats.white, { outlineWidth: 0.004, cast: false });
    back.position.set(x, y, z);
    back.rotation.y = ry;
    root.add(back);
    const face = signFace(tex, w, h);
    face.position.set(x + Math.sin(ry) * 0.008, y, z + Math.cos(ry) * 0.008);
    face.rotation.y = ry;
    root.add(face);
  }
  windowPoster(posterOnigiriTex, 0.49, 0.67, -4.6, 1.53, S.front + 0.064, 0);
  windowPoster(posterNewTex, 0.46, 0.62, S.right + 0.065, 1.52, -0.93, Math.PI / 2);
  windowPoster(posterCoffeeTex, 0.41, 0.55, S.right + 0.065, 1.46, -2.06, Math.PI / 2);

  // opening-hours sticker
  const hours = signFace(storeHoursTex, 0.98, 0.245, { transparent: true });
  hours.position.set(-0.82, 2.06, S.front + 0.063);
  root.add(hours);

  // a soft reflective window strip
  const interiorSpill = lightPool(4.6, 1.05, 0xffcf8a, 0.34);
  interiorSpill.position.set(-2.4, 0.172, S.front + 0.55);
  interiorSpill.rotation.z = 0.01;
  root.add(interiorSpill);

  // ---------- automatic sliding entrance ----------
  const cornerGroup = new THREE.Group();
  cornerGroup.name = 'chamfered-corner';
  cornerGroup.position.set(0.65, 0, 0.05);
  cornerGroup.rotation.y = Math.PI / 4;
  root.add(cornerGroup);

  // upper wall above the entrance
  const topPanel = box(1.42, 0.24, 0.15, mats.cream, { outlineWidth: 0.005 });
  topPanel.position.set(0, 2.68, 0.045);
  cornerGroup.add(topPanel);
  // kick under door
  const threshold = box(1.44, 0.16, 0.22, mats.tealDeep, { outlineWidth: 0.004 });
  threshold.position.set(0, 0.24, 0.06);
  cornerGroup.add(threshold);
  const sill = box(1.34, 0.045, 0.28, metalStrip, { outlineWidth: 0.003 });
  sill.position.set(0, 0.335, 0.1);
  cornerGroup.add(sill);
  const sidePostL = box(0.06, 2.15, 0.15, mats.teal, { outlineWidth: 0.003 });
  sidePostL.position.set(-0.71, 1.39, 0.04);
  cornerGroup.add(sidePostL);
  const sidePostR = sidePostL.clone();
  sidePostR.position.x = 0.71;
  cornerGroup.add(sidePostR);
  const doorTopTrack = box(1.35, 0.075, 0.12, mats.teal, { outlineWidth: 0.003 });
  doorTopTrack.position.set(0, 2.46, 0.035);
  cornerGroup.add(doorTopTrack);
  const doorBottomTrack = box(1.34, 0.03, 0.1, metalStrip, { outlineWidth: 0.002 });
  doorBottomTrack.position.set(0, 0.36, 0.05);
  cornerGroup.add(doorBottomTrack);

  const doorL = new THREE.Group();
  const doorR = new THREE.Group();
  doorL.position.set(-0.305, 0.37, 0.03);
  doorR.position.set(0.305, 0.37, 0.03);
  cornerGroup.add(doorL, doorR);

  function buildDoorPanel(parent, side) {
    const w = 0.59;
    const h = 2.06;
    // NOTE: no solid slab here — the four teal rails below form the real
    // frame, leaving the glass open so the warm shop interior shows through.
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xb8d4d6,
      metalness: 0,
      roughness: 0.03,
      transparent: true,
      opacity: 0.2,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.11, h - 0.19), glassMat);
    pane.position.set(0, h / 2, 0.027);
    pane.renderOrder = 2;
    parent.add(pane);
    // frame outlines
    addFrame(parent, mats.teal, 0, h - 0.035, 0, w, 0.07, 0.07, { outlineWidth: 0.002 });
    addFrame(parent, mats.teal, 0, 0.035, 0, w, 0.07, 0.07, { outlineWidth: 0.002 });
    addFrame(parent, mats.teal, -w / 2 + 0.035, h / 2, 0.002, 0.07, h, 0.07, { outlineWidth: 0.002 });
    addFrame(parent, mats.teal, w / 2 - 0.035, h / 2, 0.002, 0.07, h, 0.07, { outlineWidth: 0.002 });
    // handle
    const handle = box(0.022, 0.33, 0.028, metalStrip, { outline: false, cast: false });
    handle.position.set(-side * (w / 2 - 0.13), 1.02, 0.06);
    parent.add(handle);
    // frost / decals at handle height
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.13, 0.045), new THREE.MeshBasicMaterial({
      color: 0xf4ead6,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      toneMapped: false,
    }));
    stripe.position.set(0, 0.68, 0.031);
    parent.add(stripe);
    const drop = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, h - 0.22), new THREE.MeshBasicMaterial({
      map: glassDropsTex,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }));
    drop.position.set(0, h / 2, 0.033);
    parent.add(drop);
    const doorBand = signFace(canvasTexture(1024, 220, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(248,241,226,.96)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1b6e68';
      ctx.fillRect(0, 0, 16, h);
      ctx.fillStyle = '#e99b4b';
      ctx.fillRect(0, h - 12, w, 12);
      ctx.fillStyle = '#d86272';
      ctx.fillRect(0, h - 22, w, 8);
      // little brand star
      ctx.save();
      ctx.translate(82, h / 2);
      ctx.fillStyle = '#1b6e68';
      ctx.beginPath();
      ctx.arc(0, 0, 43, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8efdb';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? 9 : 22;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#16635e';
      ctx.font = '800 52px "Yu Gothic", "Meiryo", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('HOSHIMART', 146, 71);
      ctx.fillStyle = '#78877c';
      ctx.font = '600 23px "Yu Gothic", "Meiryo", sans-serif';
      ctx.fillText('自動ドア / 24H OPEN', 148, 122);
      ctx.fillStyle = '#d66a52';
      ctx.font = '800 25px "Yu Gothic", "Meiryo", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('いらっしゃいませ', w - 34, 68);
      ctx.fillStyle = '#df9b48';
      ctx.font = '700 19px sans-serif';
      ctx.fillText('WELCOME', w - 36, 122);
    }, { key: 'door-band' }), w - 0.08, 0.22, { transparent: true, opacity: 0.98 });
    doorBand.position.set(0, 1.24, 0.032);
    parent.add(doorBand);
    return { w, h, pane };
  }
  const leftPanel = buildDoorPanel(doorL, -1);
  const rightPanel = buildDoorPanel(doorR, 1);
  // small automated-door notices that travel with the panels
  const doorStickerL = signFace(doorDecalTex, 0.32, 0.08, { transparent: true });
  doorStickerL.position.set(-0.05, 0.55, 0.033);
  doorL.add(doorStickerL);
  const doorStickerR = signFace(doorDecalTex, 0.32, 0.08, { transparent: true });
  doorStickerR.position.set(0.05, 0.55, 0.033);
  doorR.add(doorStickerR);

  // warm and teal edge lights make the sliding entrance legible at night
  const doorEdgeWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.24, 0.62), toneMapped: false });
  const doorEdgeCool = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 1.8, 1.45), toneMapped: false });
  for (const sx of [-1, 1]) {
    const led = box(0.018, 1.72, 0.018, doorEdgeWarm, { outline: false, cast: false });
    led.position.set(sx * 0.665, 1.42, 0.12);
    cornerGroup.add(led);
  }
  const lintelLed = box(1.12, 0.018, 0.018, doorEdgeCool, { outline: false, cast: false });
  lintelLed.position.set(0, 2.52, 0.11);
  cornerGroup.add(lintelLed);

  // sensor
  const sensorBody = box(0.31, 0.09, 0.12, mats.dark, { outlineWidth: 0.002 });
  sensorBody.position.set(0, 2.59, 0.09);
  cornerGroup.add(sensorBody);
  const sensorLedMat = new THREE.MeshBasicMaterial({ color: 0x5fe9c2, toneMapped: false });
  const sensorLed = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), sensorLedMat);
  sensorLed.position.set(0.09, 2.59, 0.153);
  cornerGroup.add(sensorLed);

  animated.door = { left: doorL, right: doorR, led: sensorLedMat, amount: 0 };

  // door mat outside, oriented to the angled doorway
  const matGroup = new THREE.Group();
  matGroup.position.set(0.65 + Math.SQRT1_2 * 0.55, 0.168, 0.05 + Math.SQRT1_2 * 0.55);
  matGroup.rotation.y = Math.PI / 4;
  const matMat = toon(0xffffff, { map: entranceMatTex, emissive: 0x21362f, emissiveIntensity: 0.18 });
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.68), matMat);
  mat.rotation.x = -Math.PI / 2;
  mat.receiveShadow = true;
  matGroup.add(mat);
  root.add(matGroup);
  // rubber edge under mat
  const matEdge = box(1.32, 0.022, 0.72, toon(0x121f1e), { outlineWidth: 0.002, cast: false });
  matEdge.position.set(0.65 + Math.SQRT1_2 * 0.55, 0.171, 0.05 + Math.SQRT1_2 * 0.55);
  matEdge.rotation.y = Math.PI / 4;
  root.add(matEdge);

  // entrance step
  const stepGroup = new THREE.Group();
  stepGroup.position.set(0.65 + Math.SQRT1_2 * 0.18, 0.0, 0.05 + Math.SQRT1_2 * 0.18);
  stepGroup.rotation.y = Math.PI / 4;
  const step = box(1.34, 0.13, 0.3, toon(0x8f948e), { outlineWidth: 0.004 });
  step.position.set(0, 0.085, 0.12);
  stepGroup.add(step);
  root.add(stepGroup);

  // inside entrance mat
  const innerMatGroup = new THREE.Group();
  innerMatGroup.position.set(0.4, S.floor + 0.005, -0.1);
  innerMatGroup.rotation.y = Math.PI / 4;
  const innerMat = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.55), toon(0xffffff, {
    map: entranceMatTex,
    emissive: 0x221f14,
    emissiveIntensity: 0.15,
  }));
  innerMat.rotation.x = -Math.PI / 2;
  innerMatGroup.add(innerMat);
  root.add(innerMatGroup);

  // ---------- canopy ----------
  const canopyPoints = [
    [-5.4, 0.55],
    [-5.4, 1.32],
    [0.47, 1.32],
    [1.87, -0.2],
    [1.87, -2.8],
    [1.15, -2.8],
    [1.15, -0.45],
    [0.15, 0.55],
  ];
  const canopyMat = toon(0xe2d9c5);
  const canopy = extrudePolygon(canopyPoints, 0.075, canopyMat, 2.62, { outlineWidth: 0.007 });
  root.add(canopy);
  // dark fascia trim on canopy edge
  addFrame(root, mats.teal, -2.45, 2.61, 1.31, 5.85, 0.09, 0.055, { outlineWidth: 0.003 });
  addFrame(root, mats.teal, 1.84, 2.61, -1.46, 0.055, 0.09, 2.6, { outlineWidth: 0.003 });
  const cornerCanopyTrim = box(2.0, 0.085, 0.055, mats.teal, { outlineWidth: 0.003 });
  cornerCanopyTrim.position.set(1.16, 2.61, 0.56);
  cornerCanopyTrim.rotation.y = Math.PI / 4;
  root.add(cornerCanopyTrim);
  // warm downlight strips under canopy
  const underLightMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.8, 1.8, 0.95), toneMapped: false });
  const underFront = box(4.9, 0.015, 0.06, underLightMat, { outline: false, cast: false });
  underFront.position.set(-2.28, 2.605, 0.7);
  root.add(underFront);
  const underSide = box(0.06, 0.015, 1.55, underLightMat, { outline: false, cast: false });
  underSide.position.set(1.56, 2.605, -1.67);
  root.add(underSide);
  // minor support arms
  for (const x of [-4.4, -2.2, -0.1]) {
    addFrame(root, mats.trim, x, 2.72, 0.82, 0.025, 0.025, 0.62, { outline: false });
  }

  addFrame(root, mats.trim, 1.59, 2.72, -1.65, 0.025, 0.025, 1.6, { outline: false });

  // ---------- fascia light-boxes ----------
  const fasciaY = 3.16;
  const frontSignBack = box(5.44, 0.84, 0.16, mats.cream, { outlineWidth: 0.008 });
  frontSignBack.position.set(-2.55, fasciaY, S.front + 0.08);
  root.add(frontSignBack);
  const frontSign = signFace(fasciaFrontTex, 5.38, 0.78, { boost: 1.04 });
  frontSign.position.set(-2.55, fasciaY, S.front + 0.168);
  root.add(frontSign);
  animated.signMaterials.push(frontSign.material);

  // side fascia section
  const sideSignBack = box(0.16, 0.84, 2.28, mats.cream, { outlineWidth: 0.008 });
  sideSignBack.position.set(S.right + 0.07, fasciaY, -1.57);
  root.add(sideSignBack);
  const sideSign = signFace(fasciaSideTex, 2.22, 0.78);
  sideSign.rotation.y = Math.PI / 2;
  sideSign.position.set(S.right + 0.16, fasciaY, -1.57);
  root.add(sideSign);
  animated.signMaterials.push(sideSign.material);

  // side fascia continues to the back, quietly
  const sidePlain = box(0.15, 0.84, 2.05, mats.creamDim, { outlineWidth: 0.005 });
  sidePlain.position.set(S.right + 0.065, fasciaY, -3.72);
  root.add(sidePlain);
  const sidePlainFace = signFace(localCanvas(512, 200, (ctx, w, h) => {
    ctx.fillStyle = '#e2dac8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#166d68';
    ctx.font = `800 52px ${EN}`;
    ctx.textAlign = 'center';
    ctx.fillText('HOSHIMART', w / 2, 85);
    ctx.fillStyle = '#d9a253';
    ctx.font = `600 25px ${JP}`;
    ctx.fillText('星見マート', w / 2, 130);
    ctx.fillStyle = '#d56676';
    ctx.fillRect(0, h - 16, w, 16);
  }), 1.95, 0.7, { boost: 0.9 });
  sidePlainFace.rotation.y = Math.PI / 2;
  sidePlainFace.position.set(S.right + 0.14, fasciaY, -3.72);
  root.add(sidePlainFace);

  // chamfer fascia
  const chamferSignBack = box(1.43, 0.84, 0.16, mats.cream, { outlineWidth: 0.007 });
  chamferSignBack.position.set(0.65, fasciaY, 0.08);
  chamferSignBack.rotation.y = Math.PI / 4;
  root.add(chamferSignBack);
  const chamferSign = signFace(fasciaCornerTex, 1.4, 0.78);
  chamferSign.position.set(0.65 + Math.SQRT1_2 * 0.085, fasciaY, 0.08 + Math.SQRT1_2 * 0.085);
  chamferSign.rotation.y = Math.PI / 4;
  root.add(chamferSign);
  animated.signMaterials.push(chamferSign.material);

  // top sign glow sprites (very subtle)
  const frontHalo = glowSprite(glowTex, 0xffdfae, 6.2, 1.6, 0.15, { boost: 1.0, renderOrder: 4 });
  frontHalo.position.set(-2.55, fasciaY + 0.03, S.front + 0.27);
  root.add(frontHalo);
  const doorHalo = glowSprite(glowTex, 0xffd9a2, 2.6, 2.2, 0.22, { renderOrder: 4 });
  doorHalo.position.set(1.23, 1.55, 0.5);
  root.add(doorHalo);
  const windowGlow = glowSprite(glowTex, 0xffb966, 5.2, 2.35, 0.14, { renderOrder: 4 });
  windowGlow.position.set(-3.1, 1.55, 0.9);
  root.add(windowGlow);
  const windowGlow2 = glowSprite(glowTex, 0xffcf95, 2.5, 2.0, 0.11, { renderOrder: 4 });
  windowGlow2.position.set(-0.2, 1.5, 0.9);
  root.add(windowGlow2);

  // vertical projecting sign above the roof
  const signGroup = new THREE.Group();
  signGroup.position.set(0.5, 4.66, 0.25);
  signGroup.rotation.y = Math.PI / 4;
  root.add(signGroup);
  const signBody = box(0.61, 1.38, 0.22, mats.cream, { outlineWidth: 0.008 });
  signBody.position.y = 0;
  signGroup.add(signBody);
  const signFrontMat = new THREE.MeshBasicMaterial({
    map: cornerSignTex,
    color: new THREE.Color(1.16, 1.12, 1.02),
    toneMapped: false,
  });
  const signFront = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.34), signFrontMat);
  signFront.position.set(0, 0, 0.113);
  signGroup.add(signFront);
  const signBack = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.34), new THREE.MeshBasicMaterial({
    map: cornerSignBackTex,
    color: new THREE.Color(0.8, 0.82, 0.82),
    toneMapped: false,
  }));
  signBack.rotation.y = Math.PI;
  signBack.position.set(0, 0, -0.113);
  signGroup.add(signBack);
  const signCap = box(0.69, 0.08, 0.28, mats.trim, { outlineWidth: 0.004 });
  signCap.position.y = 0.72;
  signGroup.add(signCap);
  const signFoot = box(0.7, 0.06, 0.28, mats.trim, { outlineWidth: 0.003 });
  signFoot.position.y = -0.72;
  signGroup.add(signFoot);
  const mast = cyl(0.035, 0.045, 1.2, mats.trim, { radialSegments: 8, outlineWidth: 0.003 });
  mast.position.set(0, -1.22, 0);
  signGroup.add(mast);
  const signHalo = glowSprite(glowTex, 0xffefcb, 1.8, 2.5, 0.22, { renderOrder: 5 });
  signHalo.position.set(0, 0, 0.23);
  signGroup.add(signHalo);
  const signLight = new THREE.PointLight(0xffe4b1, 3.6, 4.8, 2.0);
  signLight.visible = false;
  signLight.position.set(0.8, 4.3, 0.8);
  root.add(signLight);
  animated.signMaterials.push(signFrontMat);
  animated.signLights.push(signLight);
  animated.cornerSign = { group: signGroup, frontMat: signFrontMat, light: signLight, halo: signHalo };

  // fix the main fascia also getting a gentle glow light
  const fasciaLight = new THREE.PointLight(0xffd9a2, 3.0, 4.2, 2);
  fasciaLight.visible = false;
  fasciaLight.position.set(-2.5, 2.8, 1.15);
  root.add(fasciaLight);
  animated.signLights.push(fasciaLight);

  // roof
  const roof = extrudePolygon(storeShape(), 0.2, mats.roof, 3.52, { outlineWidth: 0.009 });
  root.add(roof);
  // parapet strips
  addFrame(root, mats.trim, -2.05, 3.8, S.back + 0.12, 6.4, 0.17, 0.12, { outlineWidth: 0.004 });
  addFrame(root, mats.trim, S.left + 0.12, 3.8, -2.1, 0.12, 0.17, 5.0, { outlineWidth: 0.004 });
  addFrame(root, mats.trim, S.right - 0.12, 3.8, -2.7, 0.12, 0.17, 4.2, { outlineWidth: 0.004 });
  // rooftop bits
  const roofAC = box(1.05, 0.55, 0.75, toon(0xb9bab2), { outlineWidth: 0.006 });
  roofAC.position.set(-3.6, 3.92, -3.2);
  root.add(roofAC);
  const roofFan = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), toon(0x505d5e));
  roofFan.rotation.x = -Math.PI / 2;
  roofFan.position.set(-3.6, 4.2, -3.2);
  root.add(roofFan);
  const vent = cyl(0.12, 0.2, 0.65, mats.trim, { radialSegments: 10 });
  vent.position.set(-0.2, 3.95, -3.4);
  root.add(vent);
  const ventCap = cyl(0.24, 0.18, 0.08, mats.dark, { radialSegments: 10 });
  ventCap.position.set(-0.2, 4.28, -3.4);
  root.add(ventCap);
  const antenna = cyl(0.012, 0.018, 1.25, mats.trim, { radialSegments: 5, outline: false });
  antenna.position.set(0.1, 4.45, -3.2);
  root.add(antenna);
  for (let i = 0; i < 3; i++) {
    const arm = box(0.55, 0.012, 0.012, mats.trim, { outline: false, cast: false });
    arm.position.set(0.1, 4.4 + i * 0.2, -3.2);
    arm.rotation.y = i * 0.9;
    root.add(arm);
  }

  // roof hatch, service pipe and a rain puddle
  const hatch = box(0.72, 0.24, 0.78, toon(0x6f7068), { outlineWidth: 0.004 });
  hatch.position.set(-1.65, 3.86, -3.0);
  root.add(hatch);
  const hatchLid = box(0.78, 0.06, 0.84, toon(0x8c8c80), { outlineWidth: 0.003 });
  hatchLid.position.set(-1.65, 4.0, -3.0);
  hatchLid.rotation.x = -0.08;
  root.add(hatchLid);
  const roofPipe = cyl(0.055, 0.075, 1.0, mats.trim, { radialSegments: 8, outlineWidth: 0.002 });
  roofPipe.position.set(0.38, 4.08, -2.65);
  root.add(roofPipe);
  const roofPipeCap = cyl(0.14, 0.09, 0.08, mats.dark, { radialSegments: 10, outlineWidth: 0.002 });
  roofPipeCap.position.set(0.38, 4.61, -2.65);
  root.add(roofPipeCap);
  const skylight = box(0.95, 0.08, 0.68, toon(0x7c898a), { outlineWidth: 0.003 });
  skylight.position.set(0.4, 3.83, -1.35);
  root.add(skylight);
  const skylightGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.5), new THREE.MeshPhysicalMaterial({
    color: 0x39545f,
    roughness: 0.05,
    metalness: 0.3,
    transparent: true,
    opacity: 0.7,
    envMapIntensity: 1.5,
    depthWrite: false,
  }));
  skylightGlass.rotation.x = -Math.PI / 2;
  skylightGlass.position.set(0.4, 3.876, -1.35);
  root.add(skylightGlass);
  const roofPuddle = new THREE.Mesh(new THREE.CircleGeometry(0.7, 20), new THREE.MeshBasicMaterial({
    color: 0x43626f,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    toneMapped: false,
  }));
  roofPuddle.rotation.x = -Math.PI / 2;
  roofPuddle.scale.set(1.5, 0.55, 1);
  roofPuddle.position.set(-3.1, 3.728, -1.6);
  root.add(roofPuddle);
  const roofRailMat = toon(0x9b9e95);
  for (let i = 0; i < 4; i++) {
    const rail = box(0.018, 0.18, 0.018, roofRailMat, { outline: false, cast: false });
    rail.position.set(-1.7 + i * 0.8, 3.92, -4.53);
    root.add(rail);
  }
  const railTop = box(2.5, 0.018, 0.018, roofRailMat, { outline: false, cast: false });
  railTop.position.set(-0.5, 4.01, -4.53);
  root.add(railTop);

  // utility pipes / cable boxes on the outside
  const pipeMat = toon(0x788281);
  const downpipe = cyl(0.045, 0.045, 3.25, pipeMat, { radialSegments: 7, outlineWidth: 0.002 });
  downpipe.position.set(S.left - 0.045, 1.8, 0.35);
  root.add(downpipe);
  for (let i = 0; i < 5; i++) {
    const bracket = box(0.13, 0.035, 0.04, mats.trim, { outline: false, cast: false });
    bracket.position.set(S.left - 0.04, 0.55 + i * 0.67, 0.35);
    root.add(bracket);
  }
  const outsideOutlet = box(0.24, 0.3, 0.1, toon(0xd4d1c1), { outlineWidth: 0.003 });
  outsideOutlet.position.set(S.left - 0.06, 1.2, -1.2);
  root.add(outsideOutlet);

  // canopy eave drip positions for weather
  animated.dripPoints.push(
    [-4.8, 2.6, 1.3],
    [-3.1, 2.6, 1.3],
    [-1.2, 2.6, 1.3],
    [0.1, 2.6, 1.3],
    [1.82, 2.6, -0.2],
    [1.82, 2.6, -1.15],
    [1.82, 2.6, -2.15],
  );

  // exterior lights
  const entranceLight = new THREE.PointLight(0xffc889, 6.4, 5.0, 2);
  entranceLight.position.set(1.55, 2.2, 1.05);
  root.add(entranceLight);
  const sideSpill = new THREE.PointLight(0xffd8a3, 2.6, 3.4, 2);
  sideSpill.visible = false;
  sideSpill.position.set(1.1, 2.2, -2.2);
  root.add(sideSpill);
  const frontWash = new THREE.PointLight(0xffbe7e, 4.8, 3.8, 2);
  frontWash.position.set(-2.6, 2.15, 1.05);
  root.add(frontWash);
  const doorWarmth = new THREE.PointLight(0xffc58c, 3.6, 2.6, 2);
  doorWarmth.visible = false;
  doorWarmth.position.set(1.0, 1.25, 0.65);
  root.add(doorWarmth);
  animated.entranceLight = entranceLight;

  // interior
  const interior = createInterior(root, { glassSurfaces, animated, mats, S });
  animated.interior = interior;

  // security camera under the eave
  const camGroup = new THREE.Group();
  camGroup.position.set(0.2, 2.53, 0.72);
  camGroup.rotation.y = -0.5;
  camGroup.rotation.x = 0.2;
  const camBody = RoundedCamera();
  camGroup.add(camBody);
  const camLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff5544, toneMapped: false }));
  camLed.position.set(0.07, 0.03, 0.1);
  camGroup.add(camLed);
  root.add(camGroup);
  animated.cameraLed = camLed.material;

  function RoundedCamera() {
    const g = new THREE.Group();
    const body = roundedBox(0.17, 0.12, 0.22, 0.03, toon(0xdedacb), { outlineWidth: 0.003 });
    g.add(body);
    const lens = cyl(0.04, 0.05, 0.06, toon(0x171d1d), { radialSegments: 10, outlineWidth: 0.002 });
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.13;
    g.add(lens);
    return g;
  }

  root.userData = {
    animated,
    glassSurfaces,
    bounds: { ...S },
  };
  scene.userData.store = root;

  return { root, animated, glassSurfaces };
}
