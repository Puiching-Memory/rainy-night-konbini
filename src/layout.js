/* Shared world dimensions.  Units are metres-ish; the whole diorama
 * is intentionally compact so the shop reads as the main character. */
export const LAYOUT = {
  plinthHalf: 8.72,
  topHalf: 8.48,
  curbX: 3.04,
  curbZ: 3.04,
  sidewalkY: 0.16,
  roadY: 0.032,

  store: {
    left: -5.25,
    right: 1.15,
    front: 0.55,
    back: -4.8,
    floor: 0.32,
    glassBottom: 0.58,
    glassTop: 2.59,
    eave: 2.64,
    fasciaBottom: 2.76,
    fasciaTop: 3.58,
    roof: 3.72,
    // front-right chamfer
    chamferA: [0.15, 0.55],
    chamferB: [1.15, -0.45],
  },

  cafe: {
    left: -8.34,
    right: -6.16,
    front: 0.96,
    back: -7.96,
    height: 4.65,
  },

  rearBlock: {
    left: -1.78,
    right: 3.02,
    front: -5.18,
    back: -8.08,
    height: 6.55,
  },

  utilityPole: [2.82, 2.63],
  farPole: [-7.56, -6.08],

  // rectangles used to keep rain out of interiors (x1,z1,x2,z2)
  shelters: [
    { x1: -5.43, z1: -5.0, x2: 1.36, z2: 1.28, label: 'store' }, // includes canopy edge
    { x1: -8.4, z1: -8.1, x2: -6.06, z2: 1.16, label: 'cafe' },
    { x1: -1.96, z1: -8.2, x2: 3.22, z2: -5.0, label: 'rear' },
    { x1: 1.08, z1: -4.94, x2: 2.14, z2: -1.82, label: 'vending' },
  ],
};

export function inRect(x, z, r, pad = 0) {
  return x >= r.x1 - pad && x <= r.x2 + pad && z >= r.z1 - pad && z <= r.z2 + pad;
}

export function sheltered(x, z, pad = 0.06) {
  for (const r of LAYOUT.shelters) {
    if (inRect(x, z, r, pad)) return true;
  }
  return false;
}

export const STORE_POLYGON = [
  [LAYOUT.store.left, LAYOUT.store.back],
  [LAYOUT.store.right, LAYOUT.store.back],
  [LAYOUT.store.right, -0.45],
  [0.15, LAYOUT.store.front],
  [LAYOUT.store.left, LAYOUT.store.front],
];
