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
  clamp,
  lerp,
  mulberry32,
  rng,
  reflectionSmear,
  lightPool,
  contactShadow,
} from './utils.js';
import {
  coolerHeaderTex,
  aisleSignTexture,
  magazineCoverTexture,
  magRackHeaderTex,
  priceSignsTex,
  odenSignTex,
  staffSignTex,
  coffeeMenuTex,
  floorArrowTex,
  iceBoxTex,
  interiorFloorTex,
  interiorPosterTex,
  posterCoffeeTex,
  posterOnigiriTex,
} from './textures.js';

const S = LAYOUT.store;
const CEIL_Y = 2.68;
const INTERIOR_Z_BACK = -4.64;
const INTERIOR_X_LEFT = -5.16;
const INTERIOR_X_RIGHT = 1.06;
const MONO_LOCAL = '"Consolas","Courier New",monospace';

/* ------------------------------------------------------------------ *
 *  Quick local signage
 * ------------------------------------------------------------------ */
const bentoHeaderTex = canvasTexture(700, 180, (ctx, w, h) => {
  ctx.fillStyle = '#f5ecd9';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#d88442';
  ctx.fillRect(0, 0, 17, h);
  ctx.fillStyle = '#1f615c';
  ctx.font = `800 54px ${JP}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('お弁当・おにぎり', 42, 66);
  ctx.fillStyle = '#9d8057';
  ctx.font = `600 24px ${EN}`;
  ctx.letterSpacing = '5px';
  ctx.fillText('FRESH BENTO  /  RICE BALLS', 44, 124);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#e8a14b';
  ctx.fillRect(42, h - 23, 314, 5);
}, { key: 'bento-header' });

const onigiriHeaderTex = canvasTexture(600, 170, (ctx, w, h) => {
  ctx.fillStyle = '#fbf4e4';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#d5c8ad';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  ctx.fillStyle = '#22645f';
  ctx.font = `900 58px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('おにぎり', w / 2, 63);
  ctx.fillStyle = '#c6684e';
  ctx.font = `700 27px ${EN}`;
  ctx.letterSpacing = '7px';
  ctx.fillText('RICE BALLS  ¥100', w / 2, 122);
  ctx.letterSpacing = '0px';
}, { key: 'onigiri-header' });

const freshHeaderTex = canvasTexture(600, 160, (ctx, w, h) => {
  ctx.fillStyle = '#e9f0e7';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2c766d';
  ctx.font = `800 46px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('サンド・デザート', w / 2, 56);
  ctx.fillStyle = '#a07c51';
  ctx.font = `600 22px ${EN}`;
  ctx.letterSpacing = '5px';
  ctx.fillText('SANDWICHES / SWEETS', w / 2, 106);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#dba34d';
  ctx.fillRect(w / 2 - 90, 131, 180, 4);
}, { key: 'fresh-header' });

const coffeeScreenTex = canvasTexture(400, 300, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#193c3a');
  g.addColorStop(1, '#0e2324');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(233,222,200,.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = '#f2e6cf';
  ctx.font = `800 34px ${JP}`;
  ctx.textAlign = 'left';
  ctx.fillText('HOT COFFEE', 28, 54);
  ctx.fillStyle = '#e6a85d';
  ctx.font = `900 49px ${EN}`;
  ctx.fillText('¥150', 28, 113);
  ctx.fillStyle = '#8ec4b1';
  ctx.font = `600 19px ${JP}`;
  ctx.fillText('S  ¥100   L  ¥180', 28, 149);
  ctx.fillStyle = '#e6a85d';
  fillRound(ctx, 30, 182, 189, 54, 10, '#e6a85d');
  ctx.fillStyle = '#203632';
  ctx.font = `800 22px ${EN}`;
  ctx.textAlign = 'center';
  ctx.fillText('START', 124, 216);
  ctx.fillStyle = '#8ccfbc';
  ctx.beginPath();
  ctx.arc(322, 105, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#15302e';
  ctx.font = `800 24px ${JP}`;
  ctx.fillText('COFFEE', 322, 100);
  ctx.font = `700 18px ${JP}`;
  ctx.fillText('いかが?', 322, 128);
}, { key: 'coffee-screen' });

const registerScreenTex = canvasTexture(420, 280, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#263334');
  g.addColorStop(1, '#101a1b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#77d8c2';
  ctx.font = `600 20px ${MONO_LOCAL}`;
  ctx.fillText('HOSHIMART POS', 24, 38);
  ctx.fillStyle = '#f0ebd9';
  ctx.font = `700 27px ${JP}`;
  ctx.fillText('おにぎり   ¥100', 24, 92);
  ctx.fillText('コーヒー   ¥150', 24, 130);
  ctx.fillStyle = '#a9c9be';
  ctx.fillText('合計       ¥250', 24, 181);
  ctx.fillStyle = '#e7a657';
  ctx.fillRect(24, 209, 143, 35);
  ctx.fillStyle = '#23312f';
  ctx.font = `700 17px ${EN}`;
  ctx.textAlign = 'center';
  ctx.fillText('CHECKOUT', 95, 232);
  ctx.fillStyle = '#59706b';
  ctx.font = `500 16px ${MONO_LOCAL}`;
  ctx.textAlign = 'right';
  ctx.fillText('01:24', w - 25, 38);
  // tiny cup illustration
  ctx.fillStyle = '#ddd2ba';
  ctx.fillRect(300, 84, 54, 62);
  ctx.fillStyle = '#b37349';
  ctx.fillRect(300, 102, 54, 22);
  ctx.strokeStyle = '#ddd2ba';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(357, 116, 18, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
}, { key: 'pos-screen' });

const shelfLabelTex = (text, price, color) => canvasTexture(256, 128, (ctx, w, h) => {
  ctx.fillStyle = '#fbf5e6';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 7, h);
  ctx.fillStyle = '#3d544e';
  ctx.font = `700 27px ${JP}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, 39);
  ctx.fillStyle = color;
  ctx.font = `900 34px ${EN}`;
  ctx.fillText(price, 20, 83);
  ctx.strokeStyle = 'rgba(71,94,84,.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, w - 6, h - 6);
}, { key: `shelf-label-${text}-${price}-${color}` });

const securityStickerTex = canvasTexture(220, 170, (ctx, w, h) => {
  ctx.fillStyle = '#f6efe1';
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(w - 10, 10);
  ctx.lineTo(w - 10, h - 36);
  ctx.lineTo(w / 2, h - 10);
  ctx.lineTo(10, h - 36);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2e6762';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#2f6d67';
  ctx.font = `800 26px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('防犯カメラ', w / 2, 67);
  ctx.font = `600 17px ${EN}`;
  ctx.fillText('SECURITY CAMERA', w / 2, 99);
  ctx.fillStyle = '#b24c3e';
  ctx.beginPath();
  ctx.arc(w / 2, 127, 11, 0, Math.PI * 2);
  ctx.fill();
}, { key: 'security-sticker' });

/* ------------------------------------------------------------------ *
 *  Instance batching for packaged goods
 * ------------------------------------------------------------------ */
function createInstanceBatch(parent) {
  const geometries = {
    box: new THREE.BoxGeometry(1, 1, 1),
    can: new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1),
    bag: new THREE.BoxGeometry(1, 1, 1),
  };
  const groups = new Map();

  function addItem(kind, x, y, z, sx, sy, sz, color, ry = 0, rx = 0, rz = 0) {
    const key = kind;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ x, y, z, sx, sy, sz, color, ry, rx, rz });
  }

  function finalize() {
    const mat = toon(0xffffff, { fresh: true, emissive: 0x21170e, emissiveIntensity: 0.18 });
    mat.fog = true;
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    for (const [kind, items] of groups.entries()) {
      if (!items.length) continue;
      const mesh = new THREE.InstancedMesh(geometries[kind], mat, items.length);
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        dummy.position.set(it.x, it.y, it.z);
        dummy.rotation.set(it.rx, it.ry, it.rz);
        dummy.scale.set(it.sx, it.sy, it.sz);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        c.set(it.color);
        mesh.setColorAt(i, c);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      parent.add(mesh);
    }
  }

  return { addItem, finalize };
}

const productPalette = [
  0xb45746, 0xc9823a, 0xd0aa5c, 0x4a7866, 0x407a83, 0x6b7f98,
  0x9c615f, 0xd8c7a2, 0x8b5c72, 0x53795e, 0xd8a784, 0xd9d3b6,
  0xbc5344, 0xe0a045, 0x548e83, 0x7d8ca4,
];
const drinkPalette = [
  0xd54e48, 0x4a9c61, 0xe0a636, 0x3e88b0, 0xd47c99, 0x7a62a0,
  0xe0e2d6, 0xb0754a, 0x62b2a3, 0xe96f4e,
];

const rand = mulberry32(0x3ff83a);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

/* ------------------------------------------------------------------ *
 *  Main interior builder
 * ------------------------------------------------------------------ */
export function createInterior(root, context) {
  const { glassSurfaces, animated, mats } = context;
  const group = new THREE.Group();
  group.name = 'store-interior';
  root.add(group);

  const interior = {
    screens: [],
    steamAnchors: [],
    hangingSigns: [],
    lightFixtures: [],
    doorLights: [],
    onigiriCount: 0,
  };
  const batch = createInstanceBatch(group);

  const materials = {
    wall: toon(0xf2e9d4, { emissive: 0x59401f, emissiveIntensity: 0.18 }),
    wallLower: toon(0xd9e4d8, { emissive: 0x253a2f, emissiveIntensity: 0.14 }),
    ceiling: toon(0xf8f2e4, { side: THREE.DoubleSide, emissive: 0x4b3824, emissiveIntensity: 0.18 }),
    baseTrim: toon(0x1c6c65),
    white: toon(0xf5efe1, { emissive: 0x3a2c1c, emissiveIntensity: 0.12 }),
    cream: toon(0xe5d9c0, { emissive: 0x302417, emissiveIntensity: 0.1 }),
    teal: toon(0x1b6e68),
    tealDeep: toon(0x0d4644),
    mint: toon(0x9bcfbf),
    orange: toon(0xe9a04b),
    coral: toon(0xcc6456),
    pink: toon(0xd9838e),
    metal: toon(0x9ca9a8),
    metalDark: toon(0x4a5657),
    dark: toon(0x152523),
    wood: toon(0x9a7654),
    woodLight: toon(0xc7a87e),
    counterTop: toon(0xede3d1),
    floor: toon(0xd7cbb8, { map: interiorFloorTex, emissive: 0x473723, emissiveIntensity: 0.17 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xbcd9dc,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.12,
      envMapIntensity: 1.2,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    warmGlass: new THREE.MeshPhysicalMaterial({
      color: 0xf4d8b6,
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.2,
      envMapIntensity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    emissiveWhite: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.48, 1.17), toneMapped: false }),
    emissiveCool: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 1.25, 1.28), toneMapped: false }),
    emissiveWarmSmall: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.1, 1.34, 0.63), toneMapped: false }),
    screen: new THREE.MeshBasicMaterial({ map: coffeeScreenTex, toneMapped: false }),
    registerScreen: new THREE.MeshBasicMaterial({ map: registerScreenTex, toneMapped: false }),
  };

  /* ---------------- floor / ceiling / interior walls ---------------- */
  const inset = 0.045;
  const floorShape = new THREE.Shape();
  const floorPts = [
    [S.left + inset, S.back + inset],
    [S.right - inset, S.back + inset],
    [S.right - inset, S.chamferB[1] - inset * 0.5],
    [S.chamferA[0] + inset * 0.6, S.front - inset],
    [S.left + inset, S.front - inset],
  ];
  floorPts.forEach(([x, z], i) => (i ? floorShape.lineTo(x, -z) : floorShape.moveTo(x, -z)));
  floorShape.closePath();
  const floorGeo = new THREE.ShapeGeometry(floorShape, 18);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, materials.floor);
  floorMesh.position.y = S.floor + 0.004;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  const ceilGeo = new THREE.ShapeGeometry(floorShape, 18);
  ceilGeo.rotateX(-Math.PI / 2);
  const ceiling = new THREE.Mesh(ceilGeo, materials.ceiling);
  ceiling.position.y = CEIL_Y;
  group.add(ceiling);

  // inner wall planes (some walls already exist as boxes, these brighten them)
  const backWall = flatPlane(6.2, 2.36, materials.wall);
  backWall.position.set(-2.05, 1.5, S.back + 0.17);
  group.add(backWall);
  const leftWall = flatPlane(5.3, 2.36, materials.wall);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(S.left + 0.17, 1.5, -2.1);
  group.add(leftWall);
  const rightWall = flatPlane(2.18, 2.36, materials.wall);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(S.right - 0.17, 1.5, -3.68);
  group.add(rightWall);

  // baseboards and a soft green lower band
  function baseboard(w, d, x, z, ry = 0) {
    const b = box(w, 0.17, d, materials.baseTrim, { outlineWidth: 0.003 });
    b.position.set(x, 0.42, z);
    b.rotation.y = ry;
    group.add(b);
  }
  baseboard(6.25, 0.035, -2.05, S.back + 0.2);
  baseboard(0.035, 5.28, S.left + 0.2, -2.1);
  baseboard(0.035, 2.2, S.right - 0.2, -3.7);

  // a crisp, graphic colour band around the sales floor
  const accentTeal = toon(0x2b7b70, { emissive: 0x12332c, emissiveIntensity: 0.22 });
  const accentOrange = toon(0xda8a46, { emissive: 0x3f200d, emissiveIntensity: 0.18 });
  const accentCream = toon(0xf2e6cf, { emissive: 0x493321, emissiveIntensity: 0.14 });
  const leftBand = box(0.024, 0.13, 4.75, accentTeal, { outline: false, cast: false });
  leftBand.position.set(S.left + 0.205, 2.26, -2.1);
  group.add(leftBand);
  const leftBand2 = box(0.026, 0.035, 4.75, accentOrange, { outline: false, cast: false });
  leftBand2.position.set(S.left + 0.208, 2.17, -2.1);
  group.add(leftBand2);
  const leftWainscot = box(0.02, 0.72, 4.7, toon(0x93b5a2, { emissive: 0x25392f, emissiveIntensity: 0.15 }), { outline: false, cast: false });
  leftWainscot.position.set(S.left + 0.197, 0.7, -2.1);
  group.add(leftWainscot);
  const rightBand = box(0.024, 0.13, 2.0, accentTeal, { outline: false, cast: false });
  rightBand.position.set(S.right - 0.205, 2.26, -3.65);
  group.add(rightBand);

  // ceiling downlight rails
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.028, 0.19), materials.emissiveWhite);
    n.position.set(-3.8 + (i % 2) * 2.2, CEIL_Y - 0.035, -0.9 - Math.floor(i / 2) * 1.8);
    group.add(n);
    const fixture = box(1.45, 0.06, 0.27, materials.metal, { outlineWidth: 0.002, cast: false });
    fixture.position.set(n.position.x, CEIL_Y - 0.005, n.position.z);
    group.add(fixture);
    interior.lightFixtures.push(n);
  }

  // ceiling vents
  for (const [x, z] of [[-4.65, -3.85], [0.58, -3.25]]) {
    const vent = box(0.4, 0.025, 0.28, materials.metalDark, { outlineWidth: 0.002, cast: false });
    vent.position.set(x, CEIL_Y - 0.04, z);
    group.add(vent);
    for (let i = 0; i < 5; i++) {
      const slot = box(0.31, 0.006, 0.014, materials.metal, { outline: false, cast: false });
      slot.position.set(x, CEIL_Y - 0.055, z - 0.09 + i * 0.045);
      group.add(slot);
    }
  }

  // sprinkler head
  const sprinkler = cyl(0.02, 0.028, 0.12, materials.metal, { radialSegments: 6, outline: false, cast: false });
  sprinkler.position.set(-2.8, CEIL_Y - 0.08, -3.4);
  group.add(sprinkler);
  const sprinkler2 = sprinkler.clone();
  sprinkler2.position.set(-0.7, CEIL_Y - 0.08, -0.5);
  group.add(sprinkler2);

  /* ---------------- entrance guide arrow ---------------- */
  const guideGroup = new THREE.Group();
  guideGroup.position.set(0.18, S.floor + 0.009, -0.43);
  guideGroup.rotation.y = Math.PI / 4;
  const arrowMat = new THREE.MeshBasicMaterial({
    map: floorArrowTex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    toneMapped: false,
  });
  arrowMat.fog = false;
  const guide = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), arrowMat);
  guide.rotation.x = -Math.PI / 2;
  guideGroup.add(guide);
  group.add(guideGroup);

  // green aisle guiding line
  const aisleLineMat = new THREE.MeshBasicMaterial({ color: 0x5d9a81, transparent: true, opacity: 0.32, depthWrite: false, toneMapped: false });
  for (const [x, z, w, d] of [
    [-0.1, -0.82, 0.8, 0.025],
    [-2.45, -0.45, 0.025, 0.8],
  ]) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(w, d), aisleLineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, S.floor + 0.008, z);
    group.add(line);
  }

  // checkered safety strip near door
  const safetyMat = new THREE.MeshBasicMaterial({ color: 0x303c37, transparent: true, opacity: 0.2, depthWrite: false, toneMapped: false });
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.5), safetyMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0.18 + i * 0.09, S.floor + 0.01, 0.02);
    stripe.rotation.z = Math.PI / 4;
    group.add(stripe);
  }

  /* ---------------- back-wall drinks cooler ---------------- */
  const cooler = new THREE.Group();
  cooler.name = 'drink-coolers';
  group.add(cooler);
  const cx0 = -3.9;
  const cx1 = 0.48;
  const czBack = -4.6;
  const czFront = -4.02;
  const coolerTop = 2.38;

  // open body cavity: back, top, bottom and side shells
  const backShell = box(cx1 - cx0 + 0.18, 2.22, 0.08, materials.tealDeep, { outlineWidth: 0.004, cast: false });
  backShell.position.set((cx0 + cx1) / 2, 1.47, czBack - 0.005);
  cooler.add(backShell);
  const topShell = box(cx1 - cx0 + 0.2, 0.09, 0.58, materials.tealDeep, { outlineWidth: 0.003, cast: false });
  topShell.position.set((cx0 + cx1) / 2, 2.38, -4.31);
  cooler.add(topShell);
  const bottomShell = box(cx1 - cx0 + 0.2, 0.1, 0.58, materials.tealDeep, { outlineWidth: 0.003, cast: false });
  bottomShell.position.set((cx0 + cx1) / 2, 0.42, -4.31);
  cooler.add(bottomShell);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(cx1 - cx0 - 0.06, 1.9), materials.emissiveCool);
  backing.position.set((cx0 + cx1) / 2, 1.4, czBack + 0.045);
  cooler.add(backing);
  // soft interior side walls
  for (const x of [cx0 - 0.06, cx1 + 0.06]) {
    const shell = box(0.08, 2.1, 0.58, materials.tealDeep, { outlineWidth: 0.002, cast: false });
    shell.position.set(x, 1.45, -4.31);
    cooler.add(shell);
  }

  // cooler plinth and header
  const coolerPlinth = box(cx1 - cx0 + 0.2, 0.25, 0.66, materials.metalDark, { outlineWidth: 0.004 });
  coolerPlinth.position.set((cx0 + cx1) / 2, 0.37, -4.25);
  cooler.add(coolerPlinth);
  const coolerHeader = box(cx1 - cx0 + 0.2, 0.37, 0.67, materials.white, { outlineWidth: 0.004 });
  coolerHeader.position.set((cx0 + cx1) / 2, 2.48, -4.25);
  cooler.add(coolerHeader);
  const coolerHeaderFace = signFace(coolerHeaderTex, 2.94, 0.42);
  coolerHeaderFace.position.set(-1.67, 2.48, -3.89);
  cooler.add(coolerHeaderFace);

  const bayCount = 3;
  const bayW = (cx1 - cx0) / bayCount;
  for (let b = 0; b <= bayCount; b++) {
    const x = cx0 + b * bayW;
    const divider = box(0.075, 2.08, 0.58, materials.metalDark, { outlineWidth: 0.003 });
    divider.position.set(x, 1.46, -4.3);
    cooler.add(divider);
  }
  // horizontal headers per bay
  const categoryTags = ['お茶', 'コーヒー', 'ジュース'];
  for (let b = 0; b < bayCount; b++) {
    const x = cx0 + bayW * (b + 0.5);
    const tagTex = shelfLabelTex(categoryTags[b], b === 0 ? '¥130' : b === 1 ? '¥150' : '¥130', b === 0 ? '#1b7469' : b === 1 ? '#87533e' : '#3b7b91');
    const tag = signFace(tagTex, 0.65, 0.24);
    tag.position.set(x, 2.19, -4.005);
    cooler.add(tag);
    // glass door
    const door = new THREE.Mesh(new THREE.PlaneGeometry(bayW - 0.12, 1.92), materials.glass);
    door.position.set(x, 1.35, -4.0);
    door.renderOrder = 2;
    cooler.add(door);
    const doorEdgeL = box(0.035, 1.96, 0.028, materials.metal, { outline: false, cast: false });
    doorEdgeL.position.set(x - bayW / 2 + 0.09, 1.35, -3.992);
    cooler.add(doorEdgeL);
    const doorEdgeR = doorEdgeL.clone();
    doorEdgeR.position.x = x + bayW / 2 - 0.09;
    cooler.add(doorEdgeR);
    const handle = box(0.018, 0.5, 0.025, materials.metal, { outline: false, cast: false });
    handle.position.set(x + bayW / 2 - 0.24, 1.31, -3.962);
    cooler.add(handle);
    // small category light strip
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(bayW - 0.2, 0.022), materials.emissiveCool);
    strip.position.set(x, 2.08, -4.005);
    cooler.add(strip);
  }

  // shelf boards and products
  const shelfYs = [0.65, 1.06, 1.47, 1.88];
  for (let b = 0; b < bayCount; b++) {
    const x0 = cx0 + b * bayW + 0.09;
    const x1 = cx0 + (b + 1) * bayW - 0.09;
    for (const y of shelfYs) {
      const board = box(x1 - x0, 0.032, 0.42, materials.metal, { outlineWidth: 0.002, cast: false });
      board.position.set((x0 + x1) / 2, y, -4.31);
      cooler.add(board);
      const lit = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.08, 0.018), materials.emissiveCool);
      lit.position.set((x0 + x1) / 2, y - 0.024, -4.075);
      cooler.add(lit);
      const rail = box(x1 - x0 - 0.1, 0.07, 0.018, materials.white, { outline: false, cast: false });
      rail.position.set((x0 + x1) / 2, y - 0.06, -4.09);
      cooler.add(rail);

      // row of colorful bottles / cans
      const n = 11;
      for (let i = 0; i < n; i++) {
        const px = x0 + 0.08 + (i / (n - 1)) * (x1 - x0 - 0.16);
        const isBottle = (i + b + Math.round(y * 10)) % 3 === 0;
        const color = pick(drinkPalette);
        const ry = (rand() - 0.5) * 0.15;
        if (isBottle) {
          batch.addItem('can', px, y + 0.105, -4.23, 0.061, 0.16, 0.061, color, ry);
          batch.addItem('can', px, y + 0.199, -4.23, 0.052, 0.028, 0.052, 0xf4f0de, ry);
          batch.addItem('box', px, y + 0.101, -4.194, 0.047, 0.07, 0.003, 0xf7efdd, ry);
        } else {
          batch.addItem('can', px, y + 0.085, -4.24, 0.072, 0.115, 0.072, color, ry);
          batch.addItem('box', px, y + 0.08, -4.198, 0.062, 0.045, 0.003, 0xf7efdd, ry);
        }
      }
    }
  }
  // lower shelf rows in the cooler
  for (let b = 0; b < bayCount; b++) {
    const x0 = cx0 + b * bayW + 0.12;
    const x1 = cx0 + (b + 1) * bayW - 0.12;
    for (let i = 0; i < 8; i++) {
      const x = x0 + (i / 7) * (x1 - x0);
      batch.addItem('can', x, 0.5, -4.22, 0.08, 0.17, 0.08, pick(drinkPalette));
    }
  }

  // glass shine on the cooler doors
  const fridgeShine = new THREE.Mesh(
    new THREE.PlaneGeometry(cx1 - cx0 - 0.2, 1.8),
    new THREE.MeshBasicMaterial({
      map: canvasTexture(512, 512, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        const g = ctx.createLinearGradient(w, h, 0, 0);
        g.addColorStop(0, 'rgba(255,255,255,.2)');
        g.addColorStop(.25, 'rgba(255,255,255,.03)');
        g.addColorStop(.5, 'rgba(255,255,255,.12)');
        g.addColorStop(.58, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }, { key: 'fridge-shine' }),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  fridgeShine.position.set((cx0 + cx1) / 2, 1.42, -3.986);
  fridgeShine.renderOrder = 3;
  cooler.add(fridgeShine);

  /* ---------------- staff door / back wall ---------------- */
  const staffGroup = new THREE.Group();
  staffGroup.position.set(-4.56, 0, -4.6);
  group.add(staffGroup);
  const doorFrameMat = materials.metal;
  const staffDoor = box(0.84, 2.08, 0.07, materials.cream, { outlineWidth: 0.004 });
  staffDoor.position.set(0, 1.36, 0.035);
  staffGroup.add(staffDoor);
  const staffGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.62), materials.glass);
  staffGlass.position.set(0, 1.74, 0.075);
  staffGroup.add(staffGlass);
  const staffKnob = cyl(0.025, 0.025, 0.11, materials.metal, { radialSegments: 8, outline: false });
  staffKnob.rotation.x = Math.PI / 2;
  staffKnob.position.set(0.29, 1.02, 0.11);
  staffGroup.add(staffKnob);
  const staffSign = signFace(staffSignTex, 0.51, 0.19);
  staffSign.position.set(0, 1.02, 0.11);
  staffGroup.add(staffSign);
  // hollow door jambs (a solid frame box would hide the door)
  for (const sx of [-1, 1]) {
    const jamb = box(0.075, 2.18, 0.09, materials.tealDeep, { outlineWidth: 0.002 });
    jamb.position.set(sx * 0.46, 1.4, 0.02);
    staffGroup.add(jamb);
  }
  const lintel = box(0.99, 0.08, 0.09, materials.tealDeep, { outlineWidth: 0.002 });
  lintel.position.set(0, 2.48, 0.02);
  staffGroup.add(lintel);
  staffDoor.position.z = 0.05;
  // warm light above staff door
  const staffLightBar = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.06), materials.emissiveWarmSmall);
  staffLightBar.position.set(0, 2.36, 0.11);
  staffGroup.add(staffLightBar);

  // stacked stock crates by the staff door
  for (let i = 0; i < 3; i++) {
    const crate = box(0.45, 0.24, 0.32, i % 2 ? materials.orange : materials.teal, { outlineWidth: 0.003 });
    crate.position.set(-3.55 + i * 0.47, S.floor + 0.12 + (i === 2 ? 0.24 : 0), -4.28);
    group.add(crate);
  }
  const sack = box(0.36, 0.22, 0.28, materials.cream, { outlineWidth: 0.003 });
  sack.position.set(-3.05, S.floor + 0.11, -4.15);
  sack.rotation.y = 0.4;
  group.add(sack);

  // clock
  const clock = new THREE.Group();
  clock.position.set(-3.3, 2.26, -4.58);
  const clockFace = cyl(0.16, 0.16, 0.035, toon(0xf4efdf), { radialSegments: 28, outlineWidth: 0.002 });
  clockFace.rotation.x = Math.PI / 2;
  clock.add(clockFace);
  const clockRim = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.011, 5, 28), materials.metalDark);
  clock.add(clockRim);
  const hourHand = box(0.012, 0.08, 0.006, materials.dark, { outline: false, cast: false });
  hourHand.position.set(-0.015, 0.03, 0.022);
  hourHand.rotation.z = 0.6;
  clock.add(hourHand);
  const minuteHand = box(0.01, 0.115, 0.006, materials.dark, { outline: false, cast: false });
  minuteHand.position.set(0.025, 0.05, 0.022);
  minuteHand.rotation.z = -1.25;
  clock.add(minuteHand);
  group.add(clock);

  /* ---------------- center gondola shelves ---------------- */
  function buildGondola(cx, zFront, zBack, headerTex) {
    const zA = Math.min(zFront, zBack);
    const zB = Math.max(zFront, zBack);
    const zFrontReal = zB;
    const len = zB - zA;
    const midZ = (zA + zB) / 2;
    const width = 0.9;
    const g = new THREE.Group();
    g.position.set(cx, 0, 0);
    group.add(g);

    const base = box(width, 0.22, len, materials.tealDeep, { outlineWidth: 0.004 });
    base.position.set(0, S.floor + 0.11, midZ);
    g.add(base);
    const central = box(0.1, 1.18, len - 0.08, materials.teal, { outlineWidth: 0.003 });
    central.position.set(0, S.floor + 0.74, midZ);
    g.add(central);
    // back panel near the cooler side
    const back = box(width - 0.06, 1.18, 0.07, materials.cream, { outlineWidth: 0.004 });
    back.position.set(0, S.floor + 0.74, zA + 0.04);
    g.add(back);

    const shelfHeights = [0.55, 0.9, 1.25, 1.58];
    for (const y of shelfHeights) {
      const shelf = box(width, 0.035, len - 0.06, materials.white, { outlineWidth: 0.002 });
      shelf.position.set(0, y, midZ);
      g.add(shelf);
      // price rails
      for (const side of [-1, 1]) {
        const rail = box(0.026, 0.08, len - 0.1, materials.teal, { outline: false, cast: false });
        rail.position.set(side * (width / 2 - 0.02), y - 0.045, midZ);
        g.add(rail);
        for (let k = 0; k < 6; k++) {
          const tag = box(0.012, 0.042, 0.095, pick([materials.white, toon(0xeac57e), toon(0x9dd0bf)]), { outline: false, cast: false });
          tag.position.set(side * (width / 2 + 0.005), y - 0.02, zA + 0.18 + k * 0.27);
          g.add(tag);
        }
      }
      // products, two faces
      for (const side of [-1, 1]) {
        const px = cx + side * (width / 2 - 0.07);
        const n = 8;
        for (let i = 0; i < n; i++) {
          const z = zA + 0.13 + (i / (n - 1)) * (len - 0.26);
          const c = pick(productPalette);
          const h = 0.13 + rand() * 0.08;
          const w = 0.11 + rand() * 0.05;
          batch.addItem('box', px, y + 0.022 + h / 2, z, 0.1, h, w, c, 0);
          batch.addItem('box', px + side * 0.055, y + 0.035 + h * 0.4, z - w * 0.22, 0.004, 0.055, 0.045, 0xf5eddc, 0);
        }
      }
      // endcap row facing the entrance
      for (let i = 0; i < 4; i++) {
        const x = -0.3 + i * 0.2;
        const h = 0.15 + rand() * 0.04;
        batch.addItem('box', cx + x, y + 0.024 + h / 2, zFrontReal + 0.05, 0.15, h, 0.1, pick(productPalette), 0);
      }
    }
    // top rails
    const topRail = box(width, 0.04, 0.06, materials.metal, { outlineWidth: 0.002 });
    topRail.position.set(0, 1.63, zA + 0.02);
    g.add(topRail);
    const topRail2 = topRail.clone();
    topRail2.position.z = zFrontReal + 0.02;
    g.add(topRail2);

    // an open end-cap with a floating category lightbox
    const headerBack = box(0.92, 0.27, 0.06, materials.cream, { outlineWidth: 0.003, cast: false });
    headerBack.position.set(0, 1.78, zFrontReal + 0.045);
    g.add(headerBack);
    const header = signFace(headerTex, 0.86, 0.245, { boost: 1.02 });
    header.position.set(0, 1.78, zFrontReal + 0.081);
    g.add(header);
    for (const sx of [-0.36, 0.36]) {
      const bracket = box(0.018, 0.23, 0.018, materials.metal, { outlineWidth: 0.001, cast: false });
      bracket.position.set(sx, 1.62, zFrontReal + 0.04);
      g.add(bracket);
    }

    // small endcap price card
    const priceCard = signFace(shelfLabelTex('おすすめ', '¥120', '#b9604f'), 0.43, 0.215);
    priceCard.position.set(0.21, 1.42, zFrontReal + 0.055);
    g.add(priceCard);
    return g;
  }

  const aisleSnack = aisleSignTexture('お菓子・スナック', 'SNACKS & SWEETS', '#cf7451', 'snack');
  const aisleDaily = aisleSignTexture('日用品・雑貨', 'DAILY GOODS', '#3f7d75', 'general');
  const gondolaA = buildGondola(-3.24, -1.25, -3.35, aisleSnack);
  const gondolaB = buildGondola(-1.68, -1.25, -3.35, aisleDaily);

  /* ---------------- front-left chest freezer ---------------- */
  const freezer = new THREE.Group();
  freezer.position.set(-3.58, S.floor, -0.16);
  group.add(freezer);
  const freezerBody = box(1.06, 0.8, 0.66, toon(0x91c6c1, { emissive: 0x18312d, emissiveIntensity: 0.18 }), { outlineWidth: 0.007 });
  freezerBody.position.set(0, 0.4, 0);
  freezer.add(freezerBody);
  // hollow top rim so the ice cream is visible through the sliding glass
  for (const [w, d, x, z] of [
    [1.06, 0.09, 0, 0.30],
    [1.06, 0.09, 0, -0.30],
    [0.08, 0.51, -0.49, 0],
    [0.08, 0.51, 0.49, 0],
  ]) {
    const rim = box(w, 0.075, d, materials.metal, { outlineWidth: 0.002 });
    rim.position.set(x, 0.84, z);
    freezer.add(rim);
  }
  const freezerGlassTop = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), materials.glass);
  freezerGlassTop.rotation.x = -Math.PI / 2;
  freezerGlassTop.position.set(0, 0.884, 0);
  freezerGlassTop.renderOrder = 2;
  freezer.add(freezerGlassTop);
  const freezerLabel = signFace(iceBoxTex, 0.82, 0.34);
  freezerLabel.position.set(0, 0.45, 0.335);
  freezer.add(freezerLabel);
  const frBand = box(1.0, 0.09, 0.025, materials.teal, { outline: false, cast: false });
  frBand.position.set(0, 0.63, 0.337);
  freezer.add(frBand);
  const frLine = box(1.0, 0.02, 0.027, materials.orange, { outline: false, cast: false });
  frLine.position.set(0, 0.58, 0.338);
  freezer.add(frLine);
  // ice cream tubs visible under the glass
  for (let i = 0; i < 4; i++) {
    const tub = cyl(0.13, 0.12, 0.11, toon(pick([0xf2d2d0, 0xe9d6a4, 0xd7e3dd, 0xefc98d])), { radialSegments: 14, outlineWidth: 0.002 });
    tub.position.set(-0.3 + (i % 2) * 0.29, 0.74, -0.14 + Math.floor(i / 2) * 0.23);
    freezer.add(tub);
  }
  const freezerHandle = box(0.52, 0.028, 0.03, materials.metal, { outline: false });
  freezerHandle.position.set(0, 0.88, 0.31);
  freezer.add(freezerHandle);

  /* ---------------- magazine rack ---------------- */
  const rackGroup = new THREE.Group();
  rackGroup.position.set(-4.78, 0, -1.7);
  group.add(rackGroup);
  const rackBase = box(0.62, 0.85, 1.35, materials.woodLight, { outlineWidth: 0.004 });
  rackBase.position.set(0, S.floor + 0.43, 0.05);
  rackGroup.add(rackBase);
  // tier boards angled toward the interior
  for (let tier = 0; tier < 3; tier++) {
    const y = 0.87 + tier * 0.26;
    const board = box(0.37, 0.025, 1.3, materials.cream, { outlineWidth: 0.002 });
    board.position.set(0.12, y, 0.04);
    board.rotation.z = -0.16;
    rackGroup.add(board);
    for (let i = 0; i < 4; i++) {
      const coverTex = magazineCoverTexture((tier * 4 + i) % 8);
      const coverBack = box(0.026, 0.43, 0.3, materials.cream, { outlineWidth: 0.001 });
      coverBack.position.set(0.32, y + 0.27, -0.45 + i * 0.31);
      coverBack.rotation.z = -0.16;
      rackGroup.add(coverBack);
      const cover = signFace(coverTex, 0.28, 0.38);
      cover.rotation.y = Math.PI / 2;
      cover.rotation.z = 0.16;
      cover.position.set(0.337, y + 0.27, -0.45 + i * 0.31);
      rackGroup.add(cover);
    }
  }
  const rackHeader = signFace(magRackHeaderTex, 1.18, 0.2);
  rackHeader.rotation.y = Math.PI / 2;
  rackHeader.position.set(0.34, 1.88, 0.03);
  rackGroup.add(rackHeader);
  const rackTop = box(0.7, 0.05, 1.4, materials.teal, { outlineWidth: 0.003 });
  rackTop.position.set(0, 1.82, 0.03);
  rackGroup.add(rackTop);

  // two magazine stacks lying flat at the far end
  for (let i = 0; i < 3; i++) {
    const stack = box(0.34, 0.025, 0.28, toon([0xd8bd8b, 0xaac9c1, 0xd49a83][i]), { outlineWidth: 0.001 });
    stack.position.set(0.22 + i * 0.012, 0.9 + i * 0.026, 0.73);
    rackGroup.add(stack);
  }

  /* ---------------- bento and sandwich case ---------------- */
  const bentoGroup = new THREE.Group();
  bentoGroup.position.set(-4.9, S.floor, -2.82);
  group.add(bentoGroup);
  const bentoBody = box(0.58, 1.15, 0.9, materials.tealDeep, { outlineWidth: 0.005 });
  bentoBody.position.set(0.08, 0.58, 0);
  bentoGroup.add(bentoBody);
  const bentoBack = box(0.05, 1.05, 0.84, materials.cream, { outlineWidth: 0.002 });
  bentoBack.position.set(-0.2, 0.58, 0);
  bentoGroup.add(bentoBack);
  for (let tier = 0; tier < 3; tier++) {
    const y = 0.58 + tier * 0.3;
    const shelf = box(0.5, 0.026, 0.83, materials.metal, { outlineWidth: 0.001 });
    shelf.position.set(0.06, y, 0);
    bentoGroup.add(shelf);
    for (let i = 0; i < 3; i++) {
      // tray & lid, aligned with the shelf inside the case
      batch.addItem('box', -4.62, S.floor + y + 0.055, -3.1 + i * 0.28, 0.33, 0.055, 0.22, i === 1 ? 0xe6e0d0 : 0x323c38, Math.PI / 2);
      batch.addItem('box', -4.63, S.floor + y + 0.088, -3.1 + i * 0.28, 0.32, 0.012, 0.21, i === 1 ? 0xcaa464 : 0x3f7065, Math.PI / 2);
      // food colours (rice, salmon, greens)
      batch.addItem('box', -4.6, S.floor + y + 0.099, -3.16 + i * 0.28, 0.11, 0.012, 0.1, 0xf5efe0);
      batch.addItem('box', -4.6, S.floor + y + 0.099, -3.03 + i * 0.28, 0.1, 0.012, 0.08, 0xe58555);
      batch.addItem('box', -4.68, S.floor + y + 0.099, -3.1 + i * 0.28, 0.07, 0.012, 0.06, 0x619565);
    }
  }
  const bentoHeader = signFace(bentoHeaderTex, 0.82, 0.22);
  bentoHeader.rotation.y = Math.PI / 2;
  bentoHeader.position.set(-4.49, 1.52, -2.82);
  group.add(bentoHeader);
  const bentoGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.83, 0.98), materials.warmGlass);
  bentoGlass.rotation.y = Math.PI / 2;
  bentoGlass.position.set(-4.515, 1.0, -2.82);
  group.add(bentoGlass);

  // sandwich/dessert small case next to bento
  const sandBody = box(0.58, 0.92, 0.7, materials.white, { outlineWidth: 0.004 });
  sandBody.position.set(-4.82, S.floor + 0.46, -2.09);
  group.add(sandBody);
  for (let tier = 0; tier < 2; tier++) {
    const y = 0.52 + tier * 0.3;
    const shelf = box(0.5, 0.025, 0.63, materials.metal, { outlineWidth: 0.001 });
    shelf.position.set(-4.82, y, -2.09);
    group.add(shelf);
    for (let i = 0; i < 3; i++) {
      batch.addItem('box', -4.61, S.floor + y + 0.07, -2.33 + i * 0.21, 0.24, 0.11, 0.15, pick([0xe4d4ae, 0xebd8bb, 0xd8e3d6]), Math.PI / 2);
      batch.addItem('box', -4.58, S.floor + y + 0.11, -2.33 + i * 0.21, 0.14, 0.012, 0.1, pick([0xe7a956, 0xd67e65, 0x8eaf78]), Math.PI / 2);
    }
  }
  const freshHeader = signFace(freshHeaderTex, 0.7, 0.187);
  freshHeader.rotation.y = Math.PI / 2;
  freshHeader.position.set(-4.49, 1.4, -2.09);
  group.add(freshHeader);
  const sandGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.7), materials.warmGlass);
  sandGlass.rotation.y = Math.PI / 2;
  sandGlass.position.set(-4.50, 1.0, -2.09);
  group.add(sandGlass);

  /* ---------------- onigiri display ---------------- */
  const onigiriGroup = new THREE.Group();
  onigiriGroup.position.set(-1.42, S.floor, -1.0);
  group.add(onigiriGroup);
  const onigiriBody = box(0.7, 0.94, 0.4, materials.cream, { outlineWidth: 0.005 });
  onigiriBody.position.set(0, 0.47, 0);
  onigiriGroup.add(onigiriBody);
  const oniBaseBand = box(0.69, 0.15, 0.02, materials.coral, { outlineWidth: 0.001, cast: false });
  oniBaseBand.position.set(0, 0.39, 0.205);
  onigiriGroup.add(oniBaseBand);
  const oniBaseLine = box(0.69, 0.025, 0.022, materials.white, { outline: false, cast: false });
  oniBaseLine.position.set(0, 0.465, 0.218);
  onigiriGroup.add(oniBaseLine);
  const oniSideSign = signFace(shelfLabelTex('おにぎり', '¥100', '#bf5e46'), 0.34, 0.17);
  oniSideSign.rotation.y = Math.PI / 2;
  oniSideSign.position.set(0.353, 0.68, 0.06);
  onigiriGroup.add(oniSideSign);
  for (let tier = 0; tier < 3; tier++) {
    const y = 0.53 + tier * 0.23;
    const shelf = box(0.67, 0.022, 0.34, materials.metal, { outlineWidth: 0.001 });
    shelf.position.set(0, y, 0.02);
    onigiriGroup.add(shelf);
    for (let i = 0; i < 3; i++) {
      const x = -0.22 + i * 0.22;
      const oni = makeOnigiri(i);
      oni.position.set(x, y + 0.012, 0.12);
      oni.rotation.y = -0.1 + i * 0.12;
      oni.rotation.z = 0.03 * (i - 1);
      onigiriGroup.add(oni);
      interior.onigiriCount++;
    }
  }
  const onigiriFace = signFace(onigiriHeaderTex, 0.7, 0.198);
  onigiriFace.position.set(0, 1.07, 0.21);
  onigiriGroup.add(onigiriFace);
  const oniGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.63), materials.glass);
  oniGlass.position.set(0, 0.82, 0.221);
  onigiriGroup.add(oniGlass);

  function makeOnigiri(seed) {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.095);
    shape.quadraticCurveTo(0.045, 0.095, 0.062, 0.055);
    shape.lineTo(0.105, -0.065);
    shape.quadraticCurveTo(0.118, -0.098, 0.075, -0.1);
    shape.lineTo(-0.075, -0.1);
    shape.quadraticCurveTo(-0.118, -0.098, -0.105, -0.065);
    shape.lineTo(-0.062, 0.055);
    shape.quadraticCurveTo(-0.045, 0.095, 0, 0.095);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, steps: 1 });
    geo.translate(0, 0, -0.025);
    const riceMat = toon(0xf8f3e4);
    const rice = new THREE.Mesh(geo, riceMat);
    rice.castShadow = true;
    g.add(rice);
    const nori = box(0.11, 0.07, 0.054, toon(0x17362f), { outlineWidth: 0.001, cast: false });
    nori.position.set(0, -0.06, 0.005);
    g.add(nori);
    const labelColors = [0xc75a51, 0xd6a746, 0x4c8a69];
    const label = box(0.09, 0.035, 0.054, toon(labelColors[seed % 3]), { outlineWidth: 0.001, cast: false });
    label.position.set(0, -0.005, 0.016);
    g.add(label);
    // sesame flecks
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.006, 4, 3), toon(0xd6b075));
      s.position.set(-0.05 + i * 0.032, 0.035 - (i % 2) * 0.03, 0.048);
      g.add(s);
    }
    return g;
  }

  /* ---------------- checkout counter ---------------- */
  const counter = new THREE.Group();
  counter.position.set(-0.02, S.floor, -1.43);
  group.add(counter);
  const counterW = 1.98;
  const counterD = 0.58;
  const counterBase = roundedBox(counterW, 0.82, counterD, 0.035, materials.teal, { outlineWidth: 0.006 });
  counterBase.position.set(0, 0.42, 0);
  counter.add(counterBase);
  const counterFront = box(counterW - 0.12, 0.49, 0.02, materials.tealDeep, { outlineWidth: 0.002 });
  counterFront.position.set(0, 0.38, counterD / 2 + 0.012);
  counter.add(counterFront);
  const counterTop = roundedBox(counterW + 0.1, 0.065, counterD + 0.12, 0.02, materials.counterTop, { outlineWidth: 0.003 });
  counterTop.position.set(0, 0.86, 0);
  counter.add(counterTop);
  // subtle front logo
  const counterLogo = signFace(canvasTexture(512, 220, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(250,244,230,.92)';
    starPath(ctx, w / 2, 58, 33, 12, 5, -Math.PI / 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(247,241,228,.85)';
    ctx.font = `600 22px ${JP}`;
    ctx.textAlign = 'center';
    ctx.fillText('HOSHIMART', w / 2, 115);
    ctx.font = `500 17px ${JP}`;
    ctx.fillText('いらっしゃいませ', w / 2, 150);
  }, { key: 'counter-logo' }), 0.98, 0.4, { transparent: true });
  counterLogo.position.set(0, 0.5, counterD / 2 + 0.03);
  counter.add(counterLogo);

  // hot snack case
  const hotCase = new THREE.Group();
  hotCase.position.set(-0.67, 0.93, 0.0);
  counter.add(hotCase);
  const hotBase = box(0.52, 0.1, 0.35, materials.metalDark, { outlineWidth: 0.002 });
  hotCase.add(hotBase);
  const hotGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf0c58d,
    roughness: 0.05,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 1,
  });
  const hotGlass = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.32), hotGlassMat);
  hotGlass.position.y = 0.22;
  hotCase.add(hotGlass);
  for (let i = 0; i < 10; i++) {
    const nugget = sphere(0.05 + rand() * 0.018, toon(0xdf9848), { segments: 8, rings: 6, cast: false });
    nugget.scale.set(1.0, 0.7, 0.85);
    nugget.position.set(-0.18 + (i % 5) * 0.09, 0.095 + Math.floor(i / 5) * 0.07, -0.08 + (i % 3) * 0.07);
    hotCase.add(nugget);
  }
  const hotLabel = signFace(canvasTexture(320, 120, (ctx, w, h) => {
    ctx.fillStyle = '#f6ecd8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c55f41';
    ctx.font = `800 36px ${JP}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ホットスナック', w / 2, 45);
    ctx.fillStyle = '#9c7d58';
    ctx.font = `600 18px ${EN}`;
    ctx.fillText('FRIED & HOT', w / 2, 88);
  }, { key: 'hot-snack-label' }), 0.42, 0.16);
  hotLabel.position.set(-0.67, 1.32, 0.205);
  counter.add(hotLabel);
  const hotGlow = new THREE.PointLight(0xffb45f, 0.9, 1.4, 2);
  hotGlow.visible = false;
  hotGlow.position.set(-0.67, 1.18, 0.0);
  counter.add(hotGlow);

  // oden pot
  const oden = new THREE.Group();
  oden.position.set(0.68, 0.93, 0.0);
  counter.add(oden);
  const odenBase = box(0.56, 0.1, 0.39, materials.metal, { outlineWidth: 0.002 });
  oden.add(odenBase);
  const brothMat = toon(0xd3a163, { emissive: 0x5a2e12, emissiveIntensity: 0.3 });
  const pot = box(0.52, 0.14, 0.35, toon(0x8b9694), { outlineWidth: 0.002 });
  pot.position.y = 0.12;
  oden.add(pot);
  const broth = box(0.47, 0.02, 0.3, brothMat, { outlineWidth: 0.001, cast: false });
  broth.position.y = 0.195;
  oden.add(broth);
  for (let i = 0; i < 4; i++) {
    const div = box(0.008, 0.055, 0.3, materials.metal, { outline: false, cast: false });
    div.position.set(-0.18 + i * 0.12, 0.22, 0);
    oden.add(div);
  }
  for (let i = 0; i < 7; i++) {
    const item = cyl(0.03, 0.027, 0.06, toon(pick([0xc99b54, 0xe0b474, 0x889765, 0xd4c598])), { radialSegments: 8, outlineWidth: 0.001 });
    item.position.set(-0.19 + (i % 4) * 0.12, 0.23, -0.08 + Math.floor(i / 4) * 0.12);
    oden.add(item);
    const stick = box(0.006, 0.018, 0.13, toon(0xcaae7b), { outline: false, cast: false });
    stick.position.set(item.position.x, 0.29, item.position.z + 0.04);
    stick.rotation.x = 0.8;
    oden.add(stick);
  }
  const odenLabel = signFace(odenSignTex, 0.34, 0.17);
  odenLabel.position.set(0, 0.15, 0.21);
  oden.add(odenLabel);
  const odenLight = new THREE.PointLight(0xffc16e, 0.9, 1.3, 2);
  odenLight.visible = false;
  odenLight.position.set(0.68, 1.18, 0.0);
  counter.add(odenLight);
  interior.steamAnchors.push({ x: -0.69, y: 1.48, z: -1.43, kind: 'hot' });
  interior.steamAnchors.push({ x: 0.66, y: 1.52, z: -1.43, kind: 'oden' });

  // register
  const register = new THREE.Group();
  register.position.set(0.13, 0.93, -0.02);
  counter.add(register);
  const regBase = roundedBox(0.34, 0.1, 0.28, 0.018, materials.dark, { outlineWidth: 0.002 });
  regBase.position.y = 0.05;
  register.add(regBase);
  const regStem = box(0.055, 0.27, 0.055, materials.metalDark, { outlineWidth: 0.002 });
  regStem.position.set(0, 0.2, -0.04);
  register.add(regStem);
  const regScreenBody = roundedBox(0.31, 0.24, 0.08, 0.02, materials.dark, { outlineWidth: 0.002 });
  regScreenBody.position.set(0, 0.38, 0.03);
  regScreenBody.rotation.x = -0.22;
  register.add(regScreenBody);
  const regScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.18), materials.registerScreen);
  regScreen.rotation.x = -0.22;
  regScreen.position.set(0, 0.38, 0.076);
  register.add(regScreen);
  const customerDisplayStem = box(0.03, 0.2, 0.03, materials.metal, { outlineWidth: 0.001 });
  customerDisplayStem.position.set(0.22, 0.16, 0.13);
  register.add(customerDisplayStem);
  const customerDisplay = box(0.16, 0.13, 0.028, materials.dark, { outlineWidth: 0.001 });
  customerDisplay.position.set(0.22, 0.27, 0.14);
  customerDisplay.rotation.x = -0.32;
  register.add(customerDisplay);
  const displayLed = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.055), new THREE.MeshBasicMaterial({ color: 0x9ee9cf, toneMapped: false }));
  displayLed.position.set(0.22, 0.272, 0.156);
  displayLed.rotation.x = -0.32;
  register.add(displayLed);
  // card reader and scanner
  const cardReader = roundedBox(0.1, 0.055, 0.14, 0.014, materials.metalDark, { outlineWidth: 0.001 });
  cardReader.position.set(-0.24, 0.06, 0.16);
  cardReader.rotation.y = 0.3;
  register.add(cardReader);
  const scanner = box(0.18, 0.06, 0.12, materials.dark, { outlineWidth: 0.001 });
  scanner.position.set(-0.3, 0.06, -0.08);
  scanner.rotation.y = -0.2;
  register.add(scanner);
  const scannerGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.025), new THREE.MeshBasicMaterial({ color: 0xd2463d, toneMapped: false }));
  scannerGlow.rotation.x = -Math.PI / 2;
  scannerGlow.position.set(-0.3, 0.092, -0.08);
  register.add(scannerGlow);
  // little receipt printed out
  const receipt = box(0.075, 0.16, 0.006, materials.white, { outline: false, cast: false });
  receipt.position.set(0.24, 0.1, -0.02);
  receipt.rotation.z = 0.05;
  register.add(receipt);
  // tiny lucky cat
  const cat = new THREE.Group();
  cat.position.set(-0.39, 0.06, 0.17);
  const catBody = sphere(0.055, toon(0xf4f0e4), { segments: 10, rings: 8 });
  catBody.scale.set(1, 1.15, 0.8);
  cat.add(catBody);
  const catHead = sphere(0.045, toon(0xf4f0e4), { segments: 10, rings: 8 });
  catHead.position.set(0, 0.065, 0.015);
  cat.add(catHead);
  for (const sx of [-1, 1]) {
    const ear = cyl(0.001, 0.016, 0.025, toon(0xe8dcc3), { radialSegments: 3, outline: false, cast: false });
    ear.position.set(sx * 0.027, 0.099, 0.013);
    ear.rotation.z = sx * -0.2;
    cat.add(ear);
    const paw = sphere(0.02, toon(0xf4f0e4), { segments: 7, rings: 5, cast: false });
    paw.position.set(sx * 0.038, 0.055, 0.038);
    cat.add(paw);
  }
  const collar = box(0.07, 0.012, 0.012, toon(0xc9584d), { outline: false, cast: false });
  collar.position.set(0, 0.033, 0.04);
  cat.add(collar);
  cat.scale.setScalar(0.9);
  register.add(cat);

  // basket stack near counter end
  for (let i = 0; i < 5; i++) {
    const basket = box(0.36, 0.12, 0.28, materials.coral, { outlineWidth: 0.002 });
    basket.position.set(-1.23, S.floor + 0.08 + i * 0.115, -1.48);
    basket.rotation.y = 0.1;
    group.add(basket);
    const handle = box(0.35, 0.02, 0.02, materials.orange, { outline: false, cast: false });
    handle.position.set(-1.23, S.floor + 0.17 + i * 0.115, -1.34);
    group.add(handle);
  }

  // back service counter and coffee station
  const backCounter = new THREE.Group();
  backCounter.position.set(0.05, S.floor, -2.55);
  group.add(backCounter);
  const backBase = box(1.92, 0.86, 0.48, materials.teal, { outlineWidth: 0.005 });
  backBase.position.set(0, 0.43, 0);
  backCounter.add(backBase);
  const backTop = box(1.98, 0.055, 0.54, materials.metal, { outlineWidth: 0.002 });
  backTop.position.set(0, 0.89, 0);
  backCounter.add(backTop);
  const backsplash = box(1.94, 0.45, 0.06, materials.tealDeep, { outlineWidth: 0.003 });
  backsplash.position.set(0, 1.1, -0.24);
  backCounter.add(backsplash);
  // upper shelf
  for (let i = 0; i < 6; i++) {
    const cup = cyl(0.042, 0.035, 0.08, materials.white, { radialSegments: 10, outlineWidth: 0.001 });
    cup.position.set(-0.72 + i * 0.11, 1.15, -0.16);
    backCounter.add(cup);
  }
  const cupStack = cyl(0.06, 0.06, 0.16, materials.white, { radialSegments: 12, outlineWidth: 0.002 });
  cupStack.position.set(-0.6, 1.0, 0.05);
  backCounter.add(cupStack);
  // sink
  const sink = box(0.42, 0.055, 0.32, materials.metal, { outlineWidth: 0.002 });
  sink.position.set(-0.6, 0.9, 0.03);
  backCounter.add(sink);
  const sinkInset = box(0.29, 0.02, 0.2, materials.metalDark, { outlineWidth: 0.001, cast: false });
  sinkInset.position.set(-0.6, 0.925, 0.03);
  backCounter.add(sinkInset);
  const tap = cyl(0.014, 0.014, 0.24, materials.metal, { radialSegments: 6, outlineWidth: 0.001 });
  tap.position.set(-0.6, 1.03, -0.09);
  backCounter.add(tap);
  const tapArm = box(0.018, 0.018, 0.19, materials.metal, { outlineWidth: 0.001, cast: false });
  tapArm.position.set(-0.6, 1.15, -0.01);
  backCounter.add(tapArm);

  // coffee machine
  const coffee = new THREE.Group();
  coffee.position.set(0.48, 0.93, 0.02);
  coffee.rotation.y = 0.03;
  backCounter.add(coffee);
  const coffeeBody = roundedBox(0.46, 0.65, 0.36, 0.03, materials.dark, { outlineWidth: 0.003 });
  coffeeBody.position.set(0, 0.33, 0);
  coffee.add(coffeeBody);
  const coffeeFront = roundedBox(0.32, 0.29, 0.025, 0.02, materials.metalDark, { outlineWidth: 0.001 });
  coffeeFront.position.set(0, 0.41, 0.19);
  coffee.add(coffeeFront);
  const coffeeScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), materials.screen);
  coffeeScreen.position.set(0, 0.45, 0.207);
  coffee.add(coffeeScreen);
  interior.screens.push(coffeeScreen);
  const coffeeSpout = box(0.03, 0.07, 0.03, materials.metal, { outlineWidth: 0.001, cast: false });
  coffeeSpout.position.set(0, 0.25, 0.19);
  coffee.add(coffeeSpout);
  const coffeeCup = cyl(0.04, 0.033, 0.08, materials.white, { radialSegments: 10, outlineWidth: 0.001 });
  coffeeCup.position.set(0, 0.18, 0.25);
  coffee.add(coffeeCup);
  const coffeeGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.015), new THREE.MeshBasicMaterial({ color: 0x7ae6bf, toneMapped: false }));
  coffeeGlow.position.set(0.13, 0.28, 0.208);
  coffee.add(coffeeGlow);
  const coffeeLight = new THREE.PointLight(0xa8e6cc, 0.6, 1.2, 2);
  coffeeLight.visible = false;
  coffeeLight.position.set(0.48, 1.18, 0.2);
  backCounter.add(coffeeLight);
  interior.steamAnchors.push({ x: 0.53, y: 1.54, z: -2.26, kind: 'coffee' });

  // wall shelf above coffee with cups and syrup
  const shelfBack = box(1.9, 0.05, 0.23, materials.teal, { outlineWidth: 0.002 });
  shelfBack.position.set(0.05, 1.73, -2.56);
  backCounter.add(shelfBack);
  for (let i = 0; i < 5; i++) {
    const bottle = cyl(0.035, 0.033, 0.11, toon(pick([0x8f5d43, 0x4d7f73, 0xd5ac63])), { radialSegments: 9, outlineWidth: 0.001 });
    bottle.position.set(-0.7 + i * 0.18, 1.81, -2.56);
    backCounter.add(bottle);
  }

  // menu board above counter
  const menuBoardBack = box(1.12, 0.58, 0.08, materials.tealDeep, { outlineWidth: 0.003 });
  menuBoardBack.position.set(0.32, 2.03, -2.27);
  group.add(menuBoardBack);
  const menu = signFace(coffeeMenuTex, 0.99, 0.47, { boost: 1.05 });
  menu.position.set(0.32, 2.03, -2.216);
  group.add(menu);
  const menuGlow = new THREE.PointLight(0xffc184, 1.6, 2.4, 2);
  menuGlow.visible = false;
  menuGlow.position.set(0.32, 1.95, -2.0);
  group.add(menuGlow);
  const menuHalo = glowSprite(glowTex, 0xffc286, 0.95, 1.0, 0.1, { renderOrder: 4 });
  menuHalo.position.set(0.5, 2.12, -2.3);
  group.add(menuHalo);
  interior.screens.push(menu);

  // larger bright coffee menu hanging overhead
  const coffeeBoard = box(0.96, 0.46, 0.1, materials.cream, { outlineWidth: 0.003 });
  coffeeBoard.position.set(-0.03, 2.18, -3.24);
  group.add(coffeeBoard);
  const coffeeBoardFace = signFace(coffeeMenuTex, 0.86, 0.37);
  coffeeBoardFace.position.set(-0.03, 2.18, -3.182);
  group.add(coffeeBoardFace);
  const cBars = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.018), materials.emissiveWarmSmall);
  cBars.position.set(-0.03, 1.98, -3.181);
  group.add(cBars);

  /* ---------------- ice chest freezer near right / back ---------------- */
  const iceChest = new THREE.Group();
  iceChest.position.set(-0.4, S.floor, -3.67);
  group.add(iceChest);
  const iceBody = box(0.88, 0.72, 0.66, materials.white, { outlineWidth: 0.005 });
  iceBody.position.set(0, 0.36, 0);
  iceChest.add(iceBody);
  for (const [w, d, x, z] of [
    [0.91, 0.08, 0, 0.30],
    [0.91, 0.08, 0, -0.30],
    [0.07, 0.52, -0.42, 0],
    [0.07, 0.52, 0.42, 0],
  ]) {
    const rim = box(w, 0.08, d, materials.metal, { outlineWidth: 0.002 });
    rim.position.set(x, 0.77, z);
    iceChest.add(rim);
  }
  const iceTopGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.5), materials.glass);
  iceTopGlass.rotation.x = -Math.PI / 2;
  iceTopGlass.position.set(0, 0.814, 0);
  iceChest.add(iceTopGlass);
  const iceLabel = signFace(iceBoxTex, 0.62, 0.28);
  iceLabel.position.set(0, 0.4, 0.336);
  iceChest.add(iceLabel);
  for (let i = 0; i < 5; i++) {
    batch.addItem('box', -0.4 + (i % 3) * 0.2, 1.075, -3.7 + Math.floor(i / 3) * 0.23, 0.16, 0.06, 0.15, pick([0xd56c66, 0xc7d6cc, 0xe3c477, 0x8ab5b0]), 0);
  }

  // a little tower of colorful drink bottles on the floor near back
  for (let i = 0; i < 5; i++) {
    batch.addItem('can', 0.85, S.floor + 0.08 + i * 0.035, -4.15, 0.075, 0.13, 0.075, pick(drinkPalette));
  }

  /* ---------------- wall posters, notices & small details ---------------- */
  function framedPoster(tex, w, h, x, y, z, ry) {
    const frame = box(w + 0.06, h + 0.06, 0.035, materials.cream, { outlineWidth: 0.003, cast: false });
    frame.position.set(x, y, z);
    frame.rotation.y = ry;
    group.add(frame);
    const face = signFace(tex, w, h);
    face.position.set(x + Math.sin(ry) * 0.022, y, z + Math.cos(ry) * 0.022);
    face.rotation.y = ry;
    group.add(face);
  }
  framedPoster(interiorPosterTex(0), 0.62, 0.88, -5.145, 1.72, -3.87, Math.PI / 2);
  framedPoster(interiorPosterTex(1), 0.52, 0.74, S.right - 0.145, 1.76, -4.08, -Math.PI / 2);
  framedPoster(interiorPosterTex(2), 0.52, 0.74, 0.83, 1.79, -4.575, 0);

  // security sticker on glass
  const sec = signFace(securityStickerTex, 0.32, 0.25, { transparent: true });
  sec.position.set(0.34, 2.19, S.front + 0.06);
  group.add(sec);
  const sec2 = signFace(securityStickerTex, 0.28, 0.22, { transparent: true });
  sec2.rotation.y = Math.PI / 2;
  sec2.position.set(S.right + 0.05, 2.19, -0.75);
  group.add(sec2);

  // wall notice board above staff area
  const noticeBack = box(0.72, 0.51, 0.035, materials.wood, { outlineWidth: 0.003, cast: false });
  noticeBack.position.set(-3.22, 2.04, -4.59);
  group.add(noticeBack);
  const noteTex = canvasTexture(400, 280, (ctx, w, h) => {
    ctx.fillStyle = '#c7ae87';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#f4ead1' : '#dfe9e1';
      ctx.fillRect(18 + (i % 2) * 185, 20 + Math.floor(i / 2) * 128, 160, 108);
      ctx.strokeStyle = 'rgba(70,91,80,.25)';
      ctx.lineWidth = 2;
      for (let y = 45; y < 105; y += 17) {
        ctx.beginPath();
        ctx.moveTo(31 + (i % 2) * 185, y + Math.floor(i / 2) * 128);
        ctx.lineTo(165 + (i % 2) * 185, y + Math.floor(i / 2) * 128);
        ctx.stroke();
      }
    }
  }, { key: 'notice-board-interior' });
  const notes = signFace(noteTex, 0.65, 0.45);
  notes.position.set(-3.22, 2.04, -4.568);
  group.add(notes);

  // security camera inside near entrance
  const cam = new THREE.Group();
  cam.position.set(0.8, 2.58, -0.35);
  const camBody = roundedBox(0.15, 0.11, 0.2, 0.025, materials.cream, { outlineWidth: 0.002 });
  cam.add(camBody);
  const camLens = cyl(0.035, 0.043, 0.05, materials.dark, { radialSegments: 10, outlineWidth: 0.001 });
  camLens.rotation.x = Math.PI / 2;
  camLens.position.z = 0.12;
  cam.add(camLens);
  const camLight = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff5b48, toneMapped: false }));
  camLight.position.set(0.055, 0.025, 0.1);
  cam.add(camLight);
  group.add(cam);

  // hanging aisle signs
  function hangingSign(tex, x, y, z, w = 1.25, h = 0.36, facing = 0) {
    const sg = new THREE.Group();
    sg.position.set(x, y, z);
    sg.rotation.y = facing;
    group.add(sg);
    const backing = box(w + 0.035, h + 0.035, 0.03, materials.cream, { outlineWidth: 0.002, cast: false });
    sg.add(backing);
    const face = signFace(tex, w, h);
    face.position.z = 0.02;
    sg.add(face);
    const faceBack = face.clone();
    faceBack.rotation.y = Math.PI;
    faceBack.position.z = -0.02;
    sg.add(faceBack);
    for (const sx of [-0.35, 0.35]) {
      const wire = cyl(0.004, 0.004, 0.5, materials.metalDark, { radialSegments: 4, outline: false, cast: false });
      wire.position.set(sx * w, h / 2 + 0.27, 0);
      sg.add(wire);
    }
    interior.hangingSigns.push({ group: sg, baseRotation: facing, phase: rand() * Math.PI * 2 });
    return sg;
  }
  hangingSign(aisleSignTexture('おにぎり・お弁当', 'RICE & BENTO', '#cf8043', 'onigiri'), -2.4, 2.25, -1.03);
  hangingSign(aisleSignTexture('お菓子・スナック', 'SNACKS', '#c76b55', 'snack'), -3.25, 2.28, -2.3);
  hangingSign(aisleSignTexture('飲みもの', 'DRINKS', '#2e7e77', 'drink'), -1.4, 2.3, -3.45);

  // price signs clip-on rail at front
  const priceBoard = signFace(priceSignsTex, 1.5, 0.19);
  priceBoard.position.set(-3.1, 1.6, -1.23);
  group.add(priceBoard);

  // wall clock tick? no, static.

  // floor decals for social distance / arrow near counter
  const smallArrow = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.62), new THREE.MeshBasicMaterial({
    map: floorArrowTex,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    toneMapped: false,
  }));
  smallArrow.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  smallArrow.position.set(-1.1, S.floor + 0.012, -0.75);
  group.add(smallArrow);

  // floor basket / bag rack
  const bagBox = box(0.5, 0.34, 0.36, materials.orange, { outlineWidth: 0.003 });
  bagBox.position.set(-0.42, S.floor + 0.17, -2.9);
  group.add(bagBox);

  // under-counter storage doors
  for (let i = 0; i < 2; i++) {
    const doorLine = box(0.03, 0.5, 0.02, materials.tealDeep, { outline: false, cast: false });
    doorLine.position.set(-0.44 + i * 0.88, 0.43, -1.73);
    group.add(doorLine);
  }

  /* ---------------- interior lighting ---------------- */
  const warmLightA = new THREE.PointLight(0xffdfba, 4.0, 5.0, 2.0);
  warmLightA.position.set(-2.6, 2.42, -1.3);
  group.add(warmLightA);
  const warmLightB = new THREE.PointLight(0xffe5c8, 3.1, 4.5, 2.0);
  warmLightB.position.set(-0.2, 2.4, -2.55);
  group.add(warmLightB);
  const warmLightC = new THREE.PointLight(0xffd8af, 2.3, 4.2, 2.0);
  warmLightC.visible = false;
  warmLightC.position.set(-3.2, 2.4, -3.7);
  group.add(warmLightC);
  const coolLight = new THREE.PointLight(0xc7edf0, 2.3, 4.4, 2.0);
  coolLight.visible = false;
  coolLight.position.set(-1.8, 1.8, -4.1);
  group.add(coolLight);
  const checkLight = new THREE.PointLight(0xffd7a1, 1.8, 3.2, 2);
  checkLight.visible = false;
  checkLight.position.set(0.3, 2.1, -1.35);
  group.add(checkLight);
  const frontCool = new THREE.PointLight(0xd3edf0, 2.6, 4.6, 2);
  frontCool.position.set(-3.2, 2.15, -0.7);
  group.add(frontCool);
  const shelfGlow = new THREE.PointLight(0xffbd79, 1.6, 1.6, 2);
  shelfGlow.visible = false;
  shelfGlow.position.set(-2.45, 1.45, 0.05);
  group.add(shelfGlow);

  // tiny fill from under-cabinet strip
  const cabinetLightMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.14, 0.59), toneMapped: false });
  for (const [x, y, z, w] of [
    [-0.68, 1.23, -1.31, 0.44],
    [0.68, 1.25, -1.3, 0.42],
  ]) {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.018), cabinetLightMat);
    l.rotation.x = Math.PI / 2;
    l.position.set(x, y, z);
    group.add(l);
  }


  /* ---------------- foreground promotional display ---------------- */
  const promo = new THREE.Group();
  promo.position.set(-2.4, S.floor, -0.58);
  group.add(promo);
  const promoBody = box(0.9, 0.68, 0.38, materials.white, { outlineWidth: 0.004 });
  promoBody.position.set(0, 0.34, 0);
  promo.add(promoBody);
  const promoFront = box(0.78, 0.44, 0.02, materials.teal, { outlineWidth: 0.002 });
  promoFront.position.set(0, 0.3, 0.2);
  promo.add(promoFront);
  const promoStripe = box(0.78, 0.055, 0.022, materials.orange, { outline: false, cast: false });
  promoStripe.position.set(0, 0.56, 0.213);
  promo.add(promoStripe);
  const promoTop = box(0.92, 0.04, 0.4, materials.woodLight, { outlineWidth: 0.002 });
  promoTop.position.set(0, 0.7, 0);
  promo.add(promoTop);
  const promoLabel = signFace(canvasTexture(480, 520, (ctx, w, h) => {
    ctx.fillStyle = '#f8efdc';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d56751';
    ctx.fillRect(0, 0, w, 95);
    ctx.fillStyle = '#fff5e2';
    ctx.font = '800 50px ' + JSON.stringify(JP).slice(1, -1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('新発売', w / 2, 51);
    ctx.fillStyle = '#1b625d';
    ctx.font = '800 44px ' + JSON.stringify(JP).slice(1, -1);
    ctx.fillText('おすすめ', w / 2, 165);
    ctx.fillStyle = '#8a7758';
    ctx.font = '600 22px ' + JSON.stringify(EN).slice(1, -1);
    ctx.fillText('NEW ARRIVAL', w / 2, 212);
    // a cheerful little rice ball
    ctx.fillStyle = '#ece0c5';
    ctx.beginPath();
    ctx.moveTo(w / 2, 262);
    ctx.lineTo(w / 2 + 100, 445);
    ctx.quadraticCurveTo(w / 2, 486, w / 2 - 100, 445);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c5b18c';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#21433c';
    ctx.fillRect(w / 2 - 61, 386, 122, 85);
    ctx.fillStyle = '#d96752';
    ctx.beginPath();
    ctx.arc(w / 2 + 66, 316, 29, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7efdc';
    ctx.font = '800 25px ' + JSON.stringify(JP).slice(1, -1);
    ctx.fillText('¥100', w / 2, 500);
  }, { key: 'promo-sign' }), 0.31, 0.36);
  promoLabel.position.set(0, 0.36, 0.214);
  promo.add(promoLabel);
  // little header stand behind the table
  const promoBack = box(0.72, 0.9, 0.05, materials.tealDeep, { outlineWidth: 0.003 });
  promoBack.position.set(0, 0.45, -0.24);
  promo.add(promoBack);
  const promoHeader = signFace(aisleSignTexture('新商品', 'NEW ARRIVAL', '#cd7555', 'snack'), 0.78, 0.22);
  promoHeader.position.set(0, 1.12, -0.21);
  promo.add(promoHeader);

  // packets piled on the promotion table
  for (let i = 0; i < 7; i++) {
    const px = -2.72 + (i % 4) * 0.22;
    const pz = -0.78 + Math.floor(i / 4) * 0.22;
    const c = pick([0xe2a04c, 0xc95d51, 0x538d77, 0x9b5e71, 0xd5c48f]);
    batch.addItem('box', px, S.floor + 0.81 + (i % 2) * 0.035, pz, 0.17, 0.11, 0.12, c, 0.1 * (i % 3));
    batch.addItem('box', px, S.floor + 0.805, pz - 0.06, 0.07, 0.05, 0.012, 0xf5ecd9, 0);
  }

  /* ---------------- tall nobori banner behind the glass ------------- */
  const nobori = new THREE.Group();
  nobori.position.set(-3.58, S.floor, -0.54);
  group.add(nobori);
  const bannerPole = cyl(0.014, 0.014, 1.62, materials.metal, { radialSegments: 5, outline: false, cast: false });
  bannerPole.position.set(0.21, 0.81, 0);
  nobori.add(bannerPole);
  const bannerArm = box(0.5, 0.014, 0.014, materials.metal, { outline: false, cast: false });
  bannerArm.position.set(0, 1.57, 0);
  nobori.add(bannerArm);
  const bannerTex = canvasTexture(300, 920, (ctx, w, h) => {
    ctx.fillStyle = '#f4ead5';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#cf664e';
    ctx.fillRect(0, 0, w, 128);
    ctx.fillStyle = '#f5ead7';
    ctx.font = '800 50px ' + JSON.stringify(JP).slice(1, -1);
    ctx.textAlign = 'center';
    ctx.fillText('できたて', w / 2, 77);
    ctx.fillStyle = '#205d58';
    ctx.font = '900 63px ' + JSON.stringify(JP).slice(1, -1);
    ctx.fillText('おに', w / 2, 226);
    ctx.fillText('ぎり', w / 2, 300);
    ctx.strokeStyle = '#d3b776';
    ctx.lineWidth = 5;
    ctx.strokeRect(20, 24, w - 40, h - 48);
    ctx.fillStyle = '#d76a54';
    ctx.beginPath();
    ctx.arc(w / 2, 470, 96, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbf2df';
    ctx.font = '900 80px ' + JSON.stringify(EN).slice(1, -1);
    ctx.fillText('100', w / 2, 495);
    ctx.font = '700 26px ' + JSON.stringify(EN).slice(1, -1);
    ctx.fillText('YEN', w / 2, 535);
    ctx.fillStyle = '#4b7664';
    ctx.font = '600 24px ' + JSON.stringify(JP).slice(1, -1);
    ctx.fillText('店内でにぎってます', w / 2, 668);
    ctx.fillStyle = '#cf664e';
    ctx.font = '800 31px ' + JSON.stringify(JP).slice(1, -1);
    ctx.fillText('HOSHIMART', w / 2, 742);
    ctx.beginPath();
    ctx.arc(w / 2, 824, 33, 0, Math.PI * 2);
    ctx.strokeStyle = '#225e59';
    ctx.lineWidth = 4;
    ctx.stroke();
    starPath(ctx, w / 2, 824, 21, 8, 5, -Math.PI / 2);
    ctx.fillStyle = '#225e59';
    ctx.fill();
  }, { key: 'onigiri-nobori' });
  const noboriFace = signFace(bannerTex, 0.32, 0.98, { transparent: false });
  noboriFace.position.set(-0.03, 1.08, 0.006);
  nobori.add(noboriFace);
  const noboriBack = signFace(bannerTex, 0.32, 0.98);
  noboriBack.rotation.y = Math.PI;
  noboriBack.position.set(-0.03, 1.08, -0.006);
  nobori.add(noboriBack);

  /* ---------------- checkout hanging lightbox ---------------- */
  const checkoutTex = canvasTexture(640, 300, (ctx, w, h) => {
    ctx.fillStyle = '#f8efdb';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2a6b63';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#1a625d';
    ctx.font = '900 77px ' + JSON.stringify(JP).slice(1, -1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('レジ', w / 2, 110);
    ctx.fillStyle = '#c87945';
    ctx.font = '700 28px ' + JSON.stringify(EN).slice(1, -1);
    ctx.fillText('CASHIER  /  COFFEE  /  ODEN', w / 2, 181);
    ctx.fillStyle = '#e3a654';
    ctx.fillRect(66, 226, w - 132, 6);
    ctx.fillStyle = '#73867d';
    ctx.font = '600 22px ' + JSON.stringify(JP).slice(1, -1);
    ctx.fillText('こちらでお会計です', w / 2, 260);
  }, { key: 'checkout-lightbox' });
  // A bright vertical campaign flag just inside the entrance, so the
  // automatic doors reveal a colourful, lived-in shop even from outside.
  const entryFlag = new THREE.Group();
  entryFlag.position.set(0.81, S.floor, -0.92);
  entryFlag.rotation.y = 0.22;
  group.add(entryFlag);
  const flagTex = canvasTexture(320, 820, (ctx, w, h) => {
    ctx.fillStyle = '#f6ecda';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ce5d4d';
    ctx.fillRect(0, 0, w, 140);
    ctx.fillStyle = '#fff4df';
    ctx.font = '800 42px "Yu Gothic", "Meiryo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('あったか〜い', w / 2, 72);
    ctx.fillStyle = '#245f5b';
    ctx.font = '900 50px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('ホット', w / 2, 245);
    ctx.fillText('コーヒー', w / 2, 313);
    ctx.fillStyle = '#dc9a4b';
    ctx.font = '900 68px sans-serif';
    ctx.fillText('¥150', w / 2, 423);
    ctx.fillStyle = '#3d6b61';
    ctx.font = '600 25px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('からあげ  ¥180', w / 2, 502);
    ctx.fillText('おにぎり  ¥100', w / 2, 548);
    ctx.strokeStyle = '#d9b66f';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 18, w - 32, h - 36);
    ctx.fillStyle = '#e3a153';
    ctx.beginPath();
    ctx.arc(w / 2, 660, 74, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f9efdc';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('HOT', w / 2, 662);
  }, { key: 'entry-flag' });
  const flagMat = new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide, toneMapped: false });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.92), flagMat);
  flag.position.y = 1.72;
  entryFlag.add(flag);
  const flagPole = cyl(0.01, 0.01, 1.5, materials.metal, { radialSegments: 5, outline: false, cast: false });
  flagPole.position.set(.2, 1.02, 0);
  entryFlag.add(flagPole);
  const flagArm = box(.4, .012, .012, materials.metal, { outline: false, cast: false });
  flagArm.position.set(0, 2.18, 0);
  entryFlag.add(flagArm);

  const checkoutHang = new THREE.Group();
  checkoutHang.position.set(0.04, 2.08, -1.02);
  group.add(checkoutHang);
  const chBack = box(0.64, 0.34, 0.03, materials.cream, { outlineWidth: 0.002, cast: false });
  checkoutHang.add(chBack);
  const chFace = signFace(checkoutTex, 0.6, 0.3);
  chFace.position.z = 0.02;
  checkoutHang.add(chFace);
  for (const sx of [-0.22, 0.22]) {
    const wire = cyl(0.003, 0.003, 0.42, materials.metalDark, { radialSegments: 4, outline: false, cast: false });
    wire.position.set(sx, 0.38, 0);
    checkoutHang.add(wire);
  }
  interior.hangingSigns.push({ group: checkoutHang, baseRotation: 0, phase: rand() * Math.PI * 2 });


  // an entrance downlight makes the automatic doors read as a real
  // glowing threshold rather than a blank pane
  const entryCeiling = new THREE.Group();
  entryCeiling.position.set(0.46, CEIL_Y - 0.02, -0.32);
  group.add(entryCeiling);
  const entryHousing = cyl(0.13, 0.14, 0.06, materials.metal, { radialSegments: 16, outlineWidth: 0.002 });
  entryHousing.rotation.x = Math.PI / 2;
  entryHousing.position.set(0, 0, 0);
  entryCeiling.add(entryHousing);
  const entryLens = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.35, 0.84), toneMapped: false }));
  entryLens.rotation.x = Math.PI / 2;
  entryLens.position.set(0, -0.032, 0);
  entryCeiling.add(entryLens);
  const entryDown = new THREE.PointLight(0xffe0b6, 2.8, 2.6, 2);
  entryDown.visible = false;
  entryDown.position.set(0.46, 2.35, -0.32);
  group.add(entryDown);

  // a cream welcome lightbox hanging just inside the automatic doors
  const welcomeSign = new THREE.Group();
  welcomeSign.position.set(-0.13, 2.25, -0.6);
  group.add(welcomeSign);
  const wbTex = canvasTexture(1100, 300, (ctx, w, h) => {
    ctx.fillStyle = '#f9f0dd';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1c6d67';
    ctx.lineWidth = 9;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = '#1c6d67';
    ctx.fillRect(0, 0, w, 16);
    ctx.fillStyle = '#15635e';
    ctx.font = '900 68px "Yu Gothic", "Meiryo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('いらっしゃいませ', w / 2, 112);
    ctx.fillStyle = '#ce674f';
    ctx.font = '700 29px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('WELCOME TO HOSHIMART', w / 2, 188);
    ctx.fillStyle = '#dfa24f';
    ctx.fillRect(w / 2 - 170, 230, 340, 8);
    ctx.fillStyle = '#5d7b70';
    ctx.font = '600 23px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('OPEN 24 HOURS / EVERY DAY', w / 2, 265);
  }, { key: 'welcome-lightbox' });
  const wbBack = box(0.88, 0.26, 0.035, materials.cream, { outlineWidth: 0.003 });
  welcomeSign.add(wbBack);
  const wbFace = signFace(wbTex, 0.82, 0.225);
  wbFace.position.z = 0.022;
  welcomeSign.add(wbFace);
  for (const sx of [-0.28, 0.28]) {
    const wire = cyl(0.004, 0.004, 0.28, materials.metalDark, { radialSegments: 4, outline: false, cast: false });
    wire.position.set(sx, 0.25, 0);
    welcomeSign.add(wire);
  }
  interior.hangingSigns.push({ group: welcomeSign, baseRotation: 0, phase: 1.7 });

  // bright basket stack just inside the entrance
  for (let i = 0; i < 5; i++) {
    const basket = box(0.32, 0.105, 0.25, materials.coral, { outlineWidth: 0.002 });
    basket.position.set(-0.82, S.floor + 0.07 + i * 0.102, -0.38);
    basket.rotation.y = -0.1;
    group.add(basket);
    const handle = box(0.3, 0.018, 0.018, materials.orange, { outline: false, cast: false });
    handle.position.set(-0.82, S.floor + 0.15 + i * 0.102, -0.25);
    group.add(handle);
  }

  /* ---------------- soft grounded contact shadows ---------------- */
  function shopAO(w, d, x, z, opacity = 0.24) {
    const sh = contactShadow(w, d, opacity, 0x050403);
    sh.position.set(x, S.floor + 0.007, z);
    group.add(sh);
  }
  shopAO(2.45, 1.0, -0.02, -1.43, 0.3);
  shopAO(1.25, 2.55, -3.24, -2.3, 0.24);
  shopAO(1.25, 2.55, -1.68, -2.3, 0.24);
  shopAO(1.5, 1.0, -3.58, -0.16, 0.25);
  shopAO(1.1, 1.7, -4.78, -1.7, 0.22);
  shopAO(1.05, 1.75, -4.78, -2.45, 0.2);
  shopAO(1.0, 0.7, -1.42, -1.0, 0.2);
  shopAO(1.15, 0.9, -0.4, -3.67, 0.2);
  shopAO(1.25, 0.75, -2.4, -0.58, 0.18);
  shopAO(2.3, 0.8, 0.05, -2.55, 0.25);

  // a small ATM / copy corner glimpsed through the door
  const atm = new THREE.Group();
  atm.position.set(0.39, S.floor, -0.72);
  atm.rotation.y = 0.34;
  group.add(atm);
  const atmBody = roundedBox(0.42, 1.55, 0.34, 0.04, materials.cream, { outlineWidth: 0.005 });
  atmBody.position.set(0, 0.78, 0);
  atm.add(atmBody);
  const atmDark = box(0.33, 0.68, 0.02, materials.dark, { outlineWidth: 0.002, cast: false });
  atmDark.position.set(0, 1.03, 0.18);
  atm.add(atmDark);
  const atmScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.3), new THREE.MeshBasicMaterial({
    map: canvasTexture(360, 430, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#ecf5e8');
      g.addColorStop(1, '#c2e0d6');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#236c67';
      ctx.fillRect(0, 0, w, 76);
      ctx.fillStyle = '#f7f2e2';
      ctx.font = '800 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MULTI COPY', w / 2, 49);
      ctx.fillStyle = '#d5764e';
      ctx.font = '800 47px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('¥10', 32, 172);
      ctx.fillStyle = '#4b6f66';
      ctx.font = '600 25px sans-serif';
      ctx.fillText('コピー / プリント', 32, 223);
      ctx.fillStyle = '#2b6b63';
      ctx.fillRect(31, 260, w - 62, 74);
      ctx.fillStyle = '#f4eee0';
      ctx.font = '700 26px sans-serif';
      ctx.fillText('TOUCH TO START', 43, 305);
      ctx.fillStyle = '#547a70';
      ctx.fillRect(31, 360, w - 62, 2);
      ctx.font = '600 20px sans-serif';
      ctx.fillText('HOSHIMART  ATM / COPY', 33, 397);
    }, { key: 'atm-screen' }),
    toneMapped: false,
  }));
  atmScreen.position.set(0, 1.06, 0.194);
  atm.add(atmScreen);
  const atmGlow = glowSprite(glowTex, 0xb5f0dd, 0.8, 0.7, 0.1);
  atmGlow.position.set(0, 1.08, 0.23);
  atm.add(atmGlow);
  const atmKeypad = box(0.22, 0.13, 0.025, materials.metal, { outline: false, cast: false });
  atmKeypad.position.set(0, 0.7, 0.19);
  atm.add(atmKeypad);
  const atmSign = signFace(canvasTexture(320, 100, (ctx, w, h) => {
    ctx.fillStyle = '#1e645f';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f5eddb';
    ctx.font = '700 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ATM / COPY', w / 2, 52);
  }, { key: 'atm-sign' }), 0.36, 0.11);
  atmSign.position.set(0, 1.45, 0.18);
  atm.add(atmSign);
  const atmTop = box(0.45, 0.06, 0.38, materials.teal, { outlineWidth: 0.002 });
  atmTop.position.set(0, 1.58, 0);
  atm.add(atmTop);
  const atmLight = new THREE.PointLight(0xa4e9dc, 1.8, 1.8, 2);
  atmLight.visible = false;
  atmLight.position.set(0, 1.1, 0.38);
  atm.add(atmLight);
  const atmFoot = box(0.45, 0.07, 0.38, materials.metalDark, { outlineWidth: 0.002 });
  atmFoot.position.set(0, 0.035, 0);
  atm.add(atmFoot);


  /* ---------------- colourful product ledge along the front glass -------------- */
  const ledge = new THREE.Group();
  ledge.position.set(-2.37, S.floor, 0.33);
  group.add(ledge);
  const ledgeShelf = box(4.45, 0.045, 0.27, materials.white, { outlineWidth: 0.002 });
  ledgeShelf.position.set(0, 0.68, 0);
  ledge.add(ledgeShelf);
  const ledgeRail = box(4.45, 0.075, 0.022, materials.teal, { outlineWidth: 0.001, cast: false });
  ledgeRail.position.set(0, 0.66, 0.135);
  ledge.add(ledgeRail);
  const ledgeStripe = box(4.45, 0.025, 0.024, materials.orange, { outline: false, cast: false });
  ledgeStripe.position.set(0, 0.61, 0.137);
  ledge.add(ledgeStripe);
  for (let i = 0; i < 23; i++) {
    const x = -4.55 + i * 0.2;
    const h = 0.13 + rand() * 0.07;
    const w = 0.115 + rand() * 0.05;
    const c = pick(productPalette);
    batch.addItem('box', x, S.floor + 0.72 + h / 2, 0.34, w, h, 0.1, c, (rand() - 0.5) * 0.2);
    batch.addItem('box', x, S.floor + 0.72 + h * 0.42, 0.394, w * 0.54, h * 0.3, 0.005, 0xf6efdd, 0);
    if (i % 4 === 0) {
      batch.addItem('box', x, S.floor + 0.69, 0.397, 0.09, 0.035, 0.006, pick([0xe2b354, 0xf5ead7, 0x9dc8b4]), 0);
    }
  }
  // a couple of small stand-up signs
  for (const [x, txt, col] of [[-4.1, 'NEW', 0xc95f50], [-2.1, 'HOT', 0xd28244], [-0.68, 'COLD', 0x3f888c]]) {
    const sign = signFace(canvasTexture(240, 150, (ctx, w, h) => {
      ctx.fillStyle = '#fbf2df';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = col;
      ctx.fillRect(0, 0, w, 26);
      ctx.fillStyle = '#315a52';
      ctx.font = '900 52px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, w / 2, 84);
      ctx.fillStyle = col;
      ctx.fillRect(36, 118, w - 72, 4);
    }, { key: 'ledge-' + txt }), 0.22, 0.14);
    sign.position.set(x, S.floor + 1.02, 0.398);
    ledge.add(sign);
  }
  const ledgeSign = signFace(canvasTexture(1024, 180, (ctx, w, h) => {
    ctx.fillStyle = '#f7edd9';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ca654c';
    ctx.fillRect(0, 0, w, 45);
    ctx.fillStyle = '#fbf2e2';
    ctx.font = '800 31px "Yu Gothic", "Meiryo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('今週の新商品  /  NEW ARRIVALS', w / 2, 24);
    ctx.fillStyle = '#27655e';
    ctx.font = '700 26px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('おにぎり・お弁当・スイーツ 続々入荷', w / 2, 103);
    ctx.fillStyle = '#e69a4a';
    ctx.fillRect(0, h - 8, w, 8);
  }, { key: 'ledge-sign' }), 1.3, 0.23);
  ledgeSign.position.set(-2.5, S.floor + 1.28, 0.16);
  ledge.add(ledgeSign);
  const ledgeLight = new THREE.PointLight(0xffc17c, 1.7, 1.8, 2);
  ledgeLight.position.set(-2.5, S.floor + 1.35, 0.1);
  ledge.add(ledgeLight);

  batch.finalize();

  /* ---------------- window rain supports (used by weather.js) -------- */
  // Define extra drop surfaces for door panes so their rain moves with the door.
  // Animated in weather.js via these simple local panes.
  animated.doorGlass = {
    left: { group: null, width: 0.47, height: 1.86 },
    right: { group: null, width: 0.47, height: 1.86 },
  };

  interior.group = group;
  interior.cooler = cooler;
  interior.counter = counter;
  interior.lights = { warmLightA, warmLightB, warmLightC, coolLight, checkLight };
  animated.steamAnchors = interior.steamAnchors;
  interior.steam = interior.steamAnchors;
  return interior;
}
