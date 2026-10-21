import * as THREE from 'three';
import { LAYOUT, sheltered } from './layout.js';
import {
  canvasTexture,
  mulberry32,
  clamp,
  rainStreakTex,
  glowTex,
  glowSprite,
} from './utils.js';

const rand = mulberry32(0x7e4a92d1);

function randomGroundPoint() {
  for (let tries = 0; tries < 24; tries++) {
    const x = (rand() * 2 - 1) * 8.25;
    const z = (rand() * 2 - 1) * 8.25;
    if (sheltered(x, z, 0.1)) continue;
    const y = x < LAYOUT.curbX && z < LAYOUT.curbZ ? LAYOUT.sidewalkY + 0.008 : LAYOUT.roadY + 0.014;
    return { x, z, y };
  }
  return { x: 1.5, z: 5.6, y: LAYOUT.roadY + 0.014 };
}

const steamTexture = canvasTexture(128, 256, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * 0.55, 2, w / 2, h * 0.55, w * 0.52);
  g.addColorStop(0, 'rgba(255,252,242,0.55)');
  g.addColorStop(0.35, 'rgba(245,244,235,0.30)');
  g.addColorStop(0.7, 'rgba(236,240,235,0.08)');
  g.addColorStop(1, 'rgba(236,240,235,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.55, w * 0.45, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // a second, softer curl
  const g2 = ctx.createRadialGradient(w * 0.42, h * 0.42, 1, w * 0.42, h * 0.42, w * 0.29);
  g2.addColorStop(0, 'rgba(255,255,250,.28)');
  g2.addColorStop(1, 'rgba(255,255,250,0)');
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.ellipse(w * 0.42, h * 0.42, w * 0.28, h * 0.28, 0.2, 0, Math.PI * 2);
  ctx.fill();
}, { key: 'steam-puff' });

const slideDropTex = canvasTexture(24, 96, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(225,245,255,0)');
  g.addColorStop(0.5, 'rgba(225,245,255,.16)');
  g.addColorStop(0.86, 'rgba(225,245,255,.63)');
  g.addColorStop(1, 'rgba(245,252,255,.9)');
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, 0);
  ctx.bezierCurveTo(w * 0.48, h * 0.3, w * 0.54, h * 0.62, w * 0.5, h * 0.9);
  ctx.stroke();
  const bead = ctx.createRadialGradient(w * 0.5, h * 0.84, 0, w * 0.5, h * 0.84, w * 0.3);
  bead.addColorStop(0, 'rgba(255,255,255,.9)');
  bead.addColorStop(0.55, 'rgba(215,240,250,.48)');
  bead.addColorStop(1, 'rgba(215,240,250,0)');
  ctx.fillStyle = bead;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.84, w * 0.28, 0, Math.PI * 2);
  ctx.fill();
}, { key: 'glass-slide-drop' });

/* ------------------------------------------------------------------ *
 *  Splash ring field (one instanced draw call)
 * ------------------------------------------------------------------ */
function createRingField(scene, count, color, opacity, thin = 0.82) {
  const geo = new THREE.RingGeometry(thin, 1.0, 18, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  scene.add(mesh);
  const dummy = new THREE.Object3D();
  const c = new THREE.Color();
  const states = [];
  for (let i = 0; i < count; i++) {
    states.push({
      life: 0,
      age: 0,
      x: 0,
      y: -100,
      z: 0,
      size: 0.1,
      stretch: 1,
      active: false,
      baseColor: new THREE.Color(color),
    });
    dummy.scale.set(0.0001, 0.0001, 0.0001);
    dummy.position.set(0, -100, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    c.setRGB(0, 0, 0);
    mesh.setColorAt(i, c);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return { mesh, states, dummy, color: new THREE.Color(color) };
}

export function createWeather(scene, data) {
  const { glassSurfaces = [], dripPoints = [], puddles = [], steamAnchors = [], glints = [], signalReflection = null } = data;
  const weatherRoot = new THREE.Group();
  weatherRoot.name = 'weather';
  scene.add(weatherRoot);

  /* ---------------- rain streak volume ---------------- */
  const RAIN_COUNT = 2200;
  const rainPositions = new Float32Array(RAIN_COUNT * 2 * 3);
  const rainColors = new Float32Array(RAIN_COUNT * 2 * 3);
  const rainState = [];
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  rainGeometry.setAttribute('color', new THREE.BufferAttribute(rainColors, 3));
  const rainMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.46,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  rainMaterial.fog = true;
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
  rain.frustumCulled = false;
  rain.renderOrder = 3;
  weatherRoot.add(rain);

  function spawnRain(state, initial = false) {
    let x = (rand() * 2 - 1) * 9.6;
    let z = (rand() * 2 - 1) * 9.6;
    let guard = 0;
    while (sheltered(x, z, 0.09) && guard++ < 20) {
      x = (rand() * 2 - 1) * 9.6;
      z = (rand() * 2 - 1) * 9.6;
    }
    state.x = x;
    state.z = z;
    state.y = initial ? rand() * 14 + 1.8 : 11 + rand() * 4.8;
    state.speed = 7.5 + rand() * 5.8;
    state.len = 0.16 + rand() * 0.34;
    state.drift = (rand() - 0.5) * 0.35;
    state.bright = 0.24 + rand() * 0.5;
  }
  for (let i = 0; i < RAIN_COUNT; i++) {
    const state = {};
    spawnRain(state, true);
    rainState.push(state);
  }
  const cTop = new THREE.Color();
  const cBottom = new THREE.Color();

  /* ---------------- ground splashes ---------------- */
  const splashField = createRingField(scene, 130, 0xcfedf5, 0.62, 0.8);
  let splashCursor = 0;
  function spawnSplash(x, y, z, size = null, stretch = 1, color = null) {
    const st = splashField.states[splashCursor++ % splashField.states.length];
    st.active = true;
    st.age = 0;
    st.life = 0.45 + rand() * 0.55;
    st.x = x;
    st.y = y + 0.005;
    st.z = z;
    st.size = size ?? 0.06 + rand() * 0.13;
    st.stretch = stretch;
    st.baseColor.set(color ?? 0x9fdbe9);
  }

  /* ---------------- puddle ripple rings ---------------- */
  const puddleRings = createRingField(scene, 48, 0xdaf4fa, 0.6, 0.86);
  let puddleCursor = 0;
  function spawnPuddleRipple() {
    if (!puddles.length) return;
    const p = puddles[Math.floor(rand() * puddles.length)];
    const a = rand() * Math.PI * 2;
    const rr = rand() * p.radius * 0.7;
    const st = puddleRings.states[puddleCursor++ % 40];
    st.active = true;
    st.age = 0;
    st.life = 0.8 + rand() * 0.8;
    st.x = p.x + Math.cos(a) * rr;
    st.z = p.z + Math.sin(a) * rr * 0.6;
    st.y = p.y + 0.004;
    st.size = 0.1 + rand() * 0.18;
    st.stretch = 1.3 + rand() * 0.9;
    st.baseColor.set(rand() < 0.4 ? 0xc7e8ee : 0xb8d6de);
  }

  function updateRingField(field, dt) {
    const { states, mesh, dummy } = field;
    for (let i = 0; i < states.length; i++) {
      const st = states[i];
      if (!st.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0.0001, 0.0001, 0.0001);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }
      st.age += dt;
      if (st.age >= st.life) {
        st.active = false;
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0.0001, 0.0001, 0.0001);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const t = st.age / st.life;
      const scale = st.size * (0.25 + t * 2.6);
      dummy.position.set(st.x, st.y, st.z);
      dummy.scale.set(scale * st.stretch, 1, scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const fade = Math.pow(1 - t, 1.7);
      const c = st.baseColor.clone().multiplyScalar(fade);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  /* ---------------- rain sliding on glass ---------------- */
  const slidingDrops = [];
  const slideGeo = new THREE.PlaneGeometry(1, 1);
  const slideMat = new THREE.MeshBasicMaterial({
    map: slideDropTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.68,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  slideMat.fog = false;
  for (const surf of glassSurfaces) {
    if (!surf?.group) continue;
    const n = surf.width > 1.5 ? 6 : 4;
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(slideGeo, slideMat);
      const len = 0.12 + rand() * 0.2;
      mesh.scale.set(0.026 + rand() * 0.014, len * 1.15, 1);
      const drop = {
        mesh,
        surface: surf,
        x: (rand() - 0.5) * (surf.width - 0.1),
        y: (rand() - 0.5) * surf.height,
        speed: 0.035 + rand() * 0.08,
        wobble: rand() * Math.PI * 2,
        len,
      };
      mesh.position.set(drop.x, drop.y, 0.022);
      mesh.renderOrder = 5;
      surf.group.add(mesh);
      slidingDrops.push(drop);
    }
  }

  /* ---------------- canopy drips ---------------- */
  const dripGroup = new THREE.Group();
  weatherRoot.add(dripGroup);
  const drips = [];
  const dripMat = new THREE.SpriteMaterial({
    map: rainStreakTex,
    color: 0xdcf5ff,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const dripPointsAll = dripPoints.length ? dripPoints : [[-1.0, 2.6, 1.3], [1.8, 2.6, -1.0]];
  for (let i = 0; i < dripPointsAll.length; i++) {
    const p = dripPointsAll[i];
    for (let k = 0; k < 2; k++) {
      const sprite = new THREE.Sprite(dripMat);
      sprite.scale.set(0.022, 0.18, 1);
      sprite.position.set(p[0] + (rand() - 0.5) * 0.04, p[1] - rand() * 1.8, p[2]);
      dripGroup.add(sprite);
      drips.push({
        sprite,
        x: p[0],
        yTop: p[1],
        z: p[2],
        y: p[1] - rand() * 2,
        speed: 1.7 + rand() * 2.2,
        timer: rand() * 2.5,
        wait: 0.2 + rand() * 2.2,
      });
    }
  }

  /* ---------------- steam from the warm counter ---------------- */
  const steamPuffs = [];
  const steamRoot = new THREE.Group();
  weatherRoot.add(steamRoot);
  for (const anchor of steamAnchors) {
    const count = anchor.kind === 'coffee' ? 3 : 4;
    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({
        map: steamTexture,
        color: anchor.kind === 'coffee' ? 0xe4eee6 : 0xfff1d0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.NormalBlending,
        toneMapped: false,
      });
      const sprite = new THREE.Sprite(mat);
      const p = {
        sprite,
        mat,
        anchor,
        life: 3.0 + rand() * 2.4,
        age: rand() * 3.5,
        x: anchor.x + (rand() - 0.5) * 0.08,
        z: anchor.z + (rand() - 0.5) * 0.08,
        rise: 0.45 + rand() * 0.45,
        drift: (rand() - 0.5) * 0.1,
        phase: rand() * Math.PI * 2,
      };
      sprite.position.set(p.x, anchor.y, p.z);
      sprite.scale.set(0.08, 0.13, 1);
      steamRoot.add(sprite);
      steamPuffs.push(p);
    }
  }

  /* ---------------- tiny wet-street haze ---------------- */
  const hazeSprites = [];
  for (let i = 0; i < 4; i++) {
    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      color: i % 2 ? 0x7cbbc8 : 0xd8b987,
      transparent: true,
      opacity: 0.04 + rand() * 0.022,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const sp = new THREE.Sprite(mat);
    sp.position.set(-4.8 + i * 3.1, 0.65 + rand() * 0.6, 0.5 + rand() * 3.5);
    sp.scale.set(4.5 + rand() * 2.8, 1.2 + rand() * 0.8, 1);
    weatherRoot.add(sp);
    hazeSprites.push({ sprite: sp, baseX: sp.position.x, phase: rand() * Math.PI * 2 });
  }

  /* ---------------- update ---------------- */
  let time = 0;
  let splashAccum = 0;
  let puddleAccum = 0;
  const glintBase = new Map();
  for (const mat of glints) {
    if (!mat || mat === signalReflection?.material) continue;
    glintBase.set(mat, mat.opacity);
  }

  function update(dt, elapsed) {
    time = elapsed;
    const wind = Math.sin(elapsed * 0.12) * 0.55 + Math.sin(elapsed * 0.037) * 0.35;
    const windZ = Math.cos(elapsed * 0.09) * 0.22;

    // rain geometry
    for (let i = 0; i < RAIN_COUNT; i++) {
      const s = rainState[i];
      s.y -= s.speed * dt;
      s.x += wind * dt * 0.32;
      s.z += windZ * dt * 0.12;
      if (s.y < 0.1 || s.x < -10.8 || s.x > 10.8 || s.z < -10.8 || s.z > 10.8) {
        spawnRain(s, false);
      }
      const idx = i * 6;
      const bx = s.x - wind * s.len * 0.18;
      const bz = s.z - windZ * s.len * 0.18;
      const bottom = s.y;
      const top = s.y + s.len;
      rainPositions[idx] = bx;
      rainPositions[idx + 1] = bottom;
      rainPositions[idx + 2] = bz;
      rainPositions[idx + 3] = s.x;
      rainPositions[idx + 4] = top;
      rainPositions[idx + 5] = s.z;
      const alphaTop = s.bright * 0.28;
      const alphaBottom = s.bright;
      cTop.setRGB(alphaTop * 0.65, alphaTop * 0.8, alphaTop);
      cBottom.setRGB(alphaBottom * 0.7, alphaBottom * 0.87, alphaBottom);
      rainColors[idx] = cTop.r;
      rainColors[idx + 1] = cTop.g;
      rainColors[idx + 2] = cTop.b;
      rainColors[idx + 3] = cBottom.r;
      rainColors[idx + 4] = cBottom.g;
      rainColors[idx + 5] = cBottom.b;
    }
    rainGeometry.attributes.position.needsUpdate = true;
    rainGeometry.attributes.color.needsUpdate = true;

    // spontaneous pavement ripples
    splashAccum += dt;
    const splashTarget = 0.033;
    while (splashAccum > splashTarget) {
      splashAccum -= splashTarget;
      const p = randomGroundPoint();
      spawnSplash(p.x, p.y, p.z, 0.055 + rand() * 0.13);
      if (rand() < 0.3) {
        const p2 = randomGroundPoint();
        spawnSplash(p2.x, p2.y, p2.z, 0.035 + rand() * 0.06);
      }
    }
    updateRingField(splashField, dt);

    // puddle ripples
    puddleAccum += dt;
    while (puddleAccum > 0.075) {
      puddleAccum -= 0.075;
      if (rand() < 0.7) spawnPuddleRipple();
    }
    updateRingField(puddleRings, dt);

    // rain sliding on glass
    for (const drop of slidingDrops) {
      drop.y -= drop.speed * dt * 2.3;
      drop.x += Math.sin(elapsed * 0.7 + drop.wobble) * dt * 0.012;
      const half = drop.surface.height / 2;
      if (drop.y < -half - 0.05) {
        drop.y = half + rand() * 0.12;
        drop.x = (rand() - 0.5) * (drop.surface.width - 0.1);
        drop.speed = 0.035 + rand() * 0.08;
        drop.len = 0.12 + rand() * 0.2;
      }
      drop.mesh.position.set(drop.x, drop.y, 0.022);
      drop.mesh.scale.y = drop.len;
    }

    // canopy drips
    for (const d of drips) {
      if (d.wait > 0) {
        d.wait -= dt;
        d.sprite.visible = false;
        continue;
      }
      d.sprite.visible = true;
      d.y -= d.speed * dt;
      d.sprite.position.set(d.x + Math.sin(elapsed * 1.3 + d.timer) * 0.01, d.y, d.z);
      if (d.y < LAYOUT.sidewalkY + 0.02) {
        spawnSplash(d.x, LAYOUT.sidewalkY + 0.008, d.z, 0.08 + rand() * 0.07, 1.1, 0xc9eef5);
        d.wait = 0.12 + rand() * 1.6;
        d.y = d.yTop + rand() * 0.25;
        d.speed = 1.7 + rand() * 2.2;
        d.sprite.scale.set(0.016 + rand() * 0.01, 0.12 + rand() * 0.12, 1);
      }
    }

    // steam curls
    for (const p of steamPuffs) {
      p.age += dt;
      if (p.age > p.life) {
        p.age = rand() * 0.4;
        p.life = 3.0 + rand() * 2.4;
        p.rise = 0.55 + rand() * 0.6;
        p.x = p.anchor.x + (rand() - 0.5) * 0.1;
        p.z = p.anchor.z + (rand() - 0.5) * 0.1;
        p.phase = rand() * Math.PI * 2;
      }
      const t = p.age / p.life;
      const y = p.anchor.y + t * p.rise;
      const sway = Math.sin(time * 0.9 + p.phase) * 0.06 * (0.3 + t);
      p.sprite.position.set(p.x + sway + t * p.drift, y, p.z + Math.cos(time * 0.7 + p.phase) * 0.035 * t);
      const s = 0.07 + t * 0.2;
      p.sprite.scale.set(s, s * 1.5, 1);
      p.mat.opacity = Math.sin(Math.PI * clamp(t, 0, 1)) * 0.16;
    }

    // haze drift
    for (const h of hazeSprites) {
      h.sprite.position.x = h.baseX + Math.sin(time * 0.035 + h.phase) * 0.5;
    }

    // gentle shimmer in the fake ground reflections
    let gi = 0;
    for (const [mat, base] of glintBase) {
      const flick = 0.86 + Math.sin(time * (0.35 + (gi % 4) * 0.07) + gi * 1.9) * 0.09;
      mat.opacity = base * flick;
      gi++;
    }
  }

  return {
    root: weatherRoot,
    update,
    splashField,
    puddleRings,
    spawnSplash,
    rain,
    rainMaterial,
    slidingDrops,
  };
}
