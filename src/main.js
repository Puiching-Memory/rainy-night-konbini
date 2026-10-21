import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createBase } from './base.js';
import { createStore } from './store.js';
import { createProps } from './props.js';
import { createNeighborhood } from './neighborhood.js';
import { createWeather } from './weather.js';
import { LAYOUT } from './layout.js';
import {
  canvasTexture,
  glowTex,
  softShadowTex,
  clamp,
  lerp,
  smoothstep,
  mulberry32,
  outlineMaterial,
} from './utils.js';

const WIDTH = () => window.innerWidth;
const HEIGHT = () => window.innerHeight;

/* ------------------------------------------------------------------ *
 *  Renderer / camera / controls
 * ------------------------------------------------------------------ */
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance',
  stencil: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(WIDTH(), HEIGHT());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0x05090f, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'stage';
renderer.domElement.setAttribute('aria-hidden', 'true');
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x08111a, 0.0062);
scene.background = null;

const camera = new THREE.PerspectiveCamera(35, WIDTH() / HEIGHT(), 0.1, 140);
const TARGET = new THREE.Vector3(0.0, 1.3, -0.2);
const START_POS = new THREE.Vector3(18.2, 14.0, 25.2);
camera.position.copy(START_POS);
camera.lookAt(TARGET);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.062;
controls.enablePan = false;
controls.rotateSpeed = 0.65;
controls.zoomSpeed = 0.82;
controls.minDistance = 5.0;
controls.maxDistance = 53;
controls.minPolarAngle = 0.18;
controls.maxPolarAngle = 1.44;
controls.autoRotate = false;
controls.update();
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

/* ------------------------------------------------------------------ *
 *  Backdrop
 * ------------------------------------------------------------------ */
const skyUniforms = { uTime: { value: 0 } };
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(90, 48, 32),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: skyUniforms,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorld;
      uniform float uTime;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 23.345);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.55;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = p * 2.03 + vec2(3.1, 1.7);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 d = normalize(vWorld);
        float h = d.y;
        vec3 top = vec3(0.006, 0.012, 0.026);
        vec3 mid = vec3(0.019, 0.045, 0.068);
        vec3 low = vec3(0.044, 0.078, 0.098);
        float band = smoothstep(-0.04, 0.56, h);
        vec3 col = mix(mid, top, band);
        col = mix(vec3(0.007, 0.011, 0.018), col, smoothstep(-0.38, 0.015, h));
        // distant city glow around the lower horizon
        float hz = smoothstep(0.42, -0.02, abs(h - 0.035));
        col += vec3(0.075, 0.065, 0.052) * hz * 0.55;
        // warm pool of light behind the little world
        vec3 warmDir = normalize(vec3(-0.42, 0.06, 1.0));
        float warm = pow(max(dot(d, warmDir), 0.0), 9.0);
        col += vec3(0.10, 0.046, 0.016) * warm;
        vec3 coolDir = normalize(vec3(1.0, 0.02, -0.4));
        float cool = pow(max(dot(d, coolDir), 0.0), 13.0);
        col += vec3(0.014, 0.04, 0.06) * cool;
        // high rain clouds — broad soft shapes
        float clouds = fbm(d.xz * 3.3 + vec2(uTime * 0.0015, -uTime * 0.001));
        clouds = smoothstep(0.32, 0.9, clouds) * smoothstep(-0.02, 0.4, h);
        col += vec3(0.018, 0.028, 0.044) * clouds;
        float veil = fbm(d.xz * 7.5 - vec2(0.4, uTime * 0.002));
        col += vec3(0.006, 0.012, 0.018) * smoothstep(0.4, 0.9, veil) * smoothstep(0.1, 0.8, h);
        // subtle grain to avoid pure flat gradients
        float grain = hash(gl_FragCoord.xy + uTime * 0.4);
        col += (grain - 0.5) * 0.004;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }),
);
scene.add(sky);

// a soft, floating contact shadow underneath the collectible plinth
const underShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 22),
  new THREE.MeshBasicMaterial({
    map: softShadowTex,
    color: 0x010408,
    transparent: true,
    opacity: 0.56,
    depthWrite: false,
    toneMapped: false,
  }),
);
underShadow.rotation.x = -Math.PI / 2;
underShadow.position.set(0.5, -1.17, 0.2);
underShadow.renderOrder = 1;
scene.add(underShadow);
const underAmbient = new THREE.Mesh(
  new THREE.PlaneGeometry(23, 18),
  new THREE.MeshBasicMaterial({
    map: glowTex,
    color: 0x193b4b,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }),
);
underAmbient.rotation.x = -Math.PI / 2;
underAmbient.position.set(0, -1.12, 0);
scene.add(underAmbient);

// a few very soft motes that ride the rain — barely-there atmosphere
function addDust() {
  const n = 170;
  const pos = new Float32Array(n * 3);
  const rand = mulberry32(90013);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (rand() * 2 - 1) * 9;
    pos[i * 3 + 1] = 0.4 + rand() * 7.5;
    pos[i * 3 + 2] = (rand() * 2 - 1) * 9;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x9fc2ce,
    size: 0.018,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });
  mat.fog = false;
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
  return points;
}
const motes = addDust();

/* ------------------------------------------------------------------ *
 *  Environment reflection map for wet puddles and glass
 * ------------------------------------------------------------------ */
function buildEnvironment() {
  const tex = canvasTexture(1024, 512, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#040a14');
    sky.addColorStop(0.43, '#0e1e2c');
    sky.addColorStop(0.58, '#203846');
    sky.addColorStop(0.7, '#0a141b');
    sky.addColorStop(1, '#03070b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // low horizon glow
    const glow = ctx.createRadialGradient(w * 0.68, h * 0.57, 4, w * 0.68, h * 0.57, w * 0.35);
    glow.addColorStop(0, 'rgba(255,184,99,.18)');
    glow.addColorStop(0.35, 'rgba(242,135,63,.075)');
    glow.addColorStop(1, 'rgba(242,135,63,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    // shopfront: warm strip with vertical panes
    ctx.save();
    ctx.shadowColor = 'rgba(255,190,108,.5)';
    ctx.shadowBlur = 45;
    ctx.fillStyle = 'rgba(255,207,143,.78)';
    ctx.fillRect(w * 0.53, h * 0.52, w * 0.28, h * 0.1);
    ctx.shadowColor = 'transparent';
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(255,${188 + (i % 3) * 13},${104 + i * 8},${0.32 + (i % 3) * .1})`;
      ctx.fillRect(w * (0.54 + i * 0.046), h * 0.54, w * 0.022, h * 0.065);
    }
    ctx.restore();
    // cool vending machines
    ctx.fillStyle = 'rgba(84,193,221,.35)';
    ctx.fillRect(w * 0.43, h * 0.55, w * 0.06, h * 0.065);
    ctx.fillStyle = 'rgba(225,111,94,.24)';
    ctx.fillRect(w * 0.48, h * 0.555, w * 0.045, h * 0.06);
    // pink rear neon
    ctx.fillStyle = 'rgba(255,101,147,.28)';
    ctx.fillRect(w * 0.12, h * 0.47, w * 0.018, h * 0.14);
    // cool streetlamp streaks
    ctx.fillStyle = 'rgba(190,231,225,.45)';
    ctx.fillRect(w * 0.86, h * 0.36, w * 0.009, h * 0.23);
    ctx.fillStyle = 'rgba(196,232,226,.15)';
    ctx.fillRect(w * 0.85, h * 0.34, w * 0.028, h * 0.3);
    // window reflections in the wet world
    ctx.fillStyle = 'rgba(255,214,158,.18)';
    ctx.fillRect(w * 0.56, h * 0.62, w * 0.18, h * 0.2);
    // subtle cloud bands
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = `rgba(96,127,145,${0.015 + (i % 4) * 0.008})`;
      ctx.beginPath();
      ctx.ellipse((i * 91) % w, h * (0.16 + (i % 5) * 0.055), 155 + (i % 3) * 70, 12 + (i % 4) * 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // wrap-ish seam
    ctx.fillStyle = 'rgba(11,24,35,.4)';
    ctx.fillRect(0, 0, 5, h);
    ctx.fillRect(w - 5, 0, 5, h);
  }, { key: 'scene-environment' });
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromEquirectangular(tex);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.9;
  tex.dispose();
  pmrem.dispose();
}
buildEnvironment();

/* ------------------------------------------------------------------ *
 *  Lighting
 * ------------------------------------------------------------------ */
const hemi = new THREE.HemisphereLight(0x789cc2, 0x201b16, 0.5);
scene.add(hemi);
const ambient = new THREE.AmbientLight(0x30465a, 0.29);
scene.add(ambient);

const moon = new THREE.DirectionalLight(0xa9c9e4, 1.15);
moon.position.set(-10.5, 17.0, 11.5);
moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024);
moon.shadow.camera.left = -11.5;
moon.shadow.camera.right = 11.5;
moon.shadow.camera.top = 13;
moon.shadow.camera.bottom = -12;
moon.shadow.camera.near = 1;
moon.shadow.camera.far = 48;
moon.shadow.bias = -0.0004;
moon.shadow.normalBias = 0.025;
moon.target.position.set(0, 1.2, 0);
scene.add(moon, moon.target);

const fill = new THREE.DirectionalLight(0x4f7691, 0.36);
fill.position.set(13, 8, 16);
scene.add(fill);
const backRim = new THREE.DirectionalLight(0x9a7958, 0.25);
backRim.visible = false;
backRim.position.set(-8, 6, -14);
scene.add(backRim);

/* ------------------------------------------------------------------ *
 *  The miniature itself
 * ------------------------------------------------------------------ */
const base = createBase(scene);
const store = createStore(scene);
const props = createProps(scene);
const neighborhood = createNeighborhood(scene);



// patch the animated door's rain drops onto its moving glass
// (the door panels are nested groups; a tiny hand full of beads makes
// the automatic door feel just as wet as the fixed panes)
const doorDrops = [];
if (store.animated.door) {
  const dropTex = canvasTexture(24, 96, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(220,245,255,0)');
    g.addColorStop(0.7, 'rgba(220,245,255,.12)');
    g.addColorStop(0.95, 'rgba(235,250,255,.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h * 0.86);
    ctx.stroke();
  }, { key: 'door-slide-drop' });
  const mat = new THREE.MeshBasicMaterial({
    map: dropTex,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  for (const [panel, side] of [[store.animated.door.left, -1], [store.animated.door.right, 1]]) {
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      const meshData = {
        mesh,
        x: -0.2 + i * 0.17,
        y: 1.2 + i * 0.25,
        speed: 0.06 + i * 0.025,
        len: 0.16 + i * 0.04,
      };
      mesh.scale.set(0.018, meshData.len, 1);
      mesh.position.set(meshData.x, meshData.y, 0.059);
      panel.add(mesh);
      doorDrops.push(meshData);
    }
  }
}

const weather = createWeather(scene, {
  glassSurfaces: store.glassSurfaces,
  dripPoints: store.animated.dripPoints,
  puddles: base.puddles,
  steamAnchors: store.animated.steamAnchors,
  glints: base.info.glints,
  signalReflection: base.info.signalReflection,
});

// ---- performance: frozen sun shadows + no shadow work for tiny/emissive pieces ----
const scaleTmp = new THREE.Vector3();
scene.traverse((o) => {
  if (!o.isMesh) return;
  const mats = Array.isArray(o.material) ? o.material : [o.material];
  if (mats.some((mat) => mat && (mat.transparent || mat.type === 'MeshBasicMaterial'))) o.castShadow = false;
  if (o.geometry) {
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    o.getWorldScale(scaleTmp);
    const s = Math.max(scaleTmp.x, scaleTmp.y, scaleTmp.z);
    if ((o.geometry.boundingSphere?.radius ?? 0) * s < 0.22) o.castShadow = false;
  }
});
store.animated.interior.group.traverse((o) => {
  if (o.isMesh) o.castShadow = false;
});
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;

// prune ink outlines from tiny objects to keep the graphic line weight
// readable without paying for hundreds of invisible extra draws
const prune = [];
scene.traverse((o) => {
  if (!o.isMesh || !o.userData?.hasOutline) return;
  if (!o.geometry) return;
  if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
  o.getWorldScale(scaleTmp);
  const s = Math.max(scaleTmp.x, scaleTmp.y, scaleTmp.z);
  if ((o.geometry.boundingSphere?.radius ?? 0) * s < 0.09) prune.push(o);
});
for (const o of prune) {
  const child = o.children.find((c) => c.userData?.noOutline);
  if (child) o.remove(child);
}


// add a couple of slow water trails to the cafe window, too
const cafeTrailTex = canvasTexture(24, 128, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,245,220,0)');
  g.addColorStop(0.6, 'rgba(255,245,220,.02)');
  g.addColorStop(0.92, 'rgba(240,250,245,.18)');
  g.addColorStop(1, 'rgba(240,250,245,0)');
  ctx.strokeStyle = g;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.bezierCurveTo(w * 0.55, h * 0.35, w * 0.43, h * 0.65, w * 0.52, h);
  ctx.stroke();
}, { key: 'cafe-trail' });
// Not a full pane group here; cafe window has its own art, so leave it calm.

/* ------------------------------------------------------------------ *
 *  Merge the static inverted-hull outlines into one ink layer.
 *  The original look is preserved, but hundreds of tiny draw calls
 *  collapse into a single pass; animated parts keep their own outlines.
 * ------------------------------------------------------------------ */
function mergeStaticInk() {
  scene.updateMatrixWorld(true);
  const dynamicRoots = new Set();
  if (store.animated.door) {
    dynamicRoots.add(store.animated.door.left);
    dynamicRoots.add(store.animated.door.right);
  }
  for (const h of store.animated.interior?.hangingSigns || []) dynamicRoots.add(h.group);
  for (const s of store.animated.interior?.screens || []) dynamicRoots.add(s.parent);
  const isDynamic = (obj) => {
    let p = obj;
    while (p) {
      if (dynamicRoots.has(p)) return true;
      p = p.parent;
    }
    return false;
  };
  const geos = [];
  const pairs = [];
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const ink = o.children.find((c) => c.userData?.noOutline);
    if (!ink || isDynamic(o)) return;
    let g = ink.geometry.clone();
    if (g.index) g = g.toNonIndexed();
    g.applyMatrix4(ink.matrixWorld);
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
    }
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    g.clearGroups();
    geos.push(g);
    pairs.push([o, ink]);
  });
  for (const [o, ink] of pairs) o.remove(ink);
  if (!geos.length) return;
  const merged = mergeGeometries(geos, false);
  for (const g of geos) g.dispose();
  if (!merged) return;
  const mesh = new THREE.Mesh(merged, outlineMaterial(0.0115, 0x040a11));
  mesh.name = 'static-ink-outline-layer';
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  scene.add(mesh);
}
mergeStaticInk();

/* ------------------------------------------------------------------ *
 *  Post-processing
 * ------------------------------------------------------------------ */
const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
composer.setSize(WIDTH(), HEIGHT());
composer.renderTarget1.samples = 2;
composer.renderTarget2.samples = 2;

composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(WIDTH(), HEIGHT()), 0.5, 0.48, 1.08);
composer.addPass(bloom);

const finalShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(WIDTH(), HEIGHT()) },
    uExposure: { value: 1.01 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uExposure;

    vec3 acesFilm(vec3 x) {
      const float a = 2.51;
      const float b = 0.03;
      const float c = 2.43;
      const float d = 0.59;
      const float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }
    float hash(vec2 p) {
      p = fract(p * vec2(443.897, 441.423));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }
    void main() {
      vec2 uv = vUv;
      vec2 c = uv - 0.5;
      float d = length(c);
      // tiny lens fringe, strongest at the corners
      vec2 ca = c * d * 0.0018;
      vec3 color;
      color.r = texture2D(tDiffuse, uv + ca).r;
      color.g = texture2D(tDiffuse, uv).g;
      color.b = texture2D(tDiffuse, uv - ca).b;

      color *= uExposure;
      color = acesFilm(color);
      // toon-friendly teal shadows / warm highlights
      float lum = dot(color, vec3(0.299, 0.587, 0.114));
      float shadowMask = 1.0 - smoothstep(0.02, 0.44, lum);
      float highMask = smoothstep(0.38, 0.97, lum);
      color = mix(vec3(lum), color, 1.28);
      color *= mix(vec3(0.84, 0.95, 1.12), vec3(1.05, 1.0, 0.94), highMask);
      color += vec3(0.021, 0.008, -0.002) * highMask;
      color += vec3(-0.012, -0.002, 0.022) * shadowMask;
      // very soft S-curve
      color = clamp(color, 0.0, 1.0);
      color = color * color * (3.0 - 2.0 * color) * 0.28 + color * 0.72;
      // display gamma
      color = pow(max(color, 0.0), vec3(1.0 / 2.2));
      // cinematic vignette
      float vig = smoothstep(0.98, 0.24, d);
      color *= mix(0.69, 1.0, vig);
      // fine filmic grain
      float grain = hash(uv * uResolution + vec2(uTime * 2.3, -uTime * 1.7));
      color += (grain - 0.5) * 0.013;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
const finalPass = new ShaderPass(finalShader);
finalPass.renderToScreen = true;
composer.addPass(finalPass);

/* ------------------------------------------------------------------ *
 *  Animation state
 * ------------------------------------------------------------------ */
const clock = new THREE.Clock();
let time = 0;
let frameCount = 0;

const trafficBase = props.signalLamp.signal;
let trafficPhase = 0; // 0 green, 1 yellow, 2 red
let trafficTimer = 0;
const trafficDuration = [8.4, 2.1, 9.2];
const lampGlowBase = props.signalLamp.lamp.halo.material.opacity;
const lampLightBase = props.signalLamp.lamp.light.intensity;

const signBaseColor = new THREE.Color(1.16, 1.12, 1.02);
const signBaseLight = store.animated.cornerSign?.light.intensity ?? 26;
let flickerNext = 3.4 + Math.random() * 4.0;
let flickerEnd = 0;
let flickerSeed = 1;

const door = store.animated.door;
let nextDoorTime = 6.4;
let doorAnimation = 0;
let doorHold = 0;
let doorOpening = false;
let doorClosing = false;

// precompute local top parts for the noren swell
const noren = neighborhood.cafe?.noren;
const norenBase = noren ? noren.geometry.attributes.position.array.slice() : null;

const rand = mulberry32(0x1a31c8);

function easeInOutSine(x) {
  return -(Math.cos(Math.PI * clamp(x, 0, 1)) - 1) / 2;
}

function updateTraffic(dt, t) {
  trafficTimer += dt;
  const idx = trafficPhase;
  if (trafficTimer > trafficDuration[idx]) {
    trafficTimer = 0;
    trafficPhase = (trafficPhase + 1) % 3;
  }
  const activeColors = [new THREE.Color(0x61eab0), new THREE.Color(0xf5ce62), new THREE.Color(0xff6d69)];
  for (let i = 0; i < 3; i++) {
    const active = i === trafficPhase;
    trafficBase.mats[i].color.copy(active ? activeColors[i].clone().multiplyScalar(1.65) : new THREE.Color(0x18211f));
    trafficBase.glows[i].opacity = active ? 0.36 : 0.0;
    trafficBase.glows[i].color.copy(activeColors[i]);
  }
  trafficBase.light.color.copy(activeColors[trafficPhase]);
  trafficBase.light.intensity = 1.8;
  if (base.info.signalReflection) {
    base.info.signalReflection.material.color.copy(activeColors[trafficPhase]).multiplyScalar(0.7);
    base.info.signalReflection.material.opacity = trafficPhase === 1 ? 0.16 : 0.22;
  }
  // pedestrian light: red while cars are moving; green at the end of a red phase
  const walk = trafficPhase === 2 && trafficTimer > 4.0;
  const pedMat = trafficBase.pedLower.material;
  pedMat.color.copy(walk ? new THREE.Color(0x63f0c0) : new THREE.Color(0xe05f58)).multiplyScalar(walk ? 1.35 : 0.9);
  trafficBase.pedGlow.material.opacity = walk ? 0.2 : 0.1;
  trafficBase.pedGlow.material.color.copy(walk ? new THREE.Color(0x63f0c0) : new THREE.Color(0xe05f58));
  if (trafficBase.pedLower.material !== pedMat) trafficBase.pedLower.material = pedMat;
}

function updateFlicker(dt, t) {
  if (!store.animated.cornerSign) return;
  const sign = store.animated.cornerSign;
  if (t > flickerNext && flickerEnd === 0) {
    flickerEnd = t + 0.35 + rand() * 0.55;
    flickerNext = t + 5.5 + rand() * 7.5;
    flickerSeed = rand() * 100;
  }
  let intensity = 1;
  if (t < flickerEnd) {
    const n = Math.sin((t + flickerSeed) * 43.0) * Math.sin((t + flickerSeed) * 17.3);
    intensity = n > 0.25 ? 0.42 : 0.9 + 0.1 * Math.sin(t * 80);
  } else if (flickerEnd !== 0) {
    flickerEnd = 0;
  }
  sign.frontMat.color.copy(signBaseColor).multiplyScalar(intensity);
  sign.light.intensity = signBaseLight * (0.6 + 0.4 * intensity);
  sign.halo.material.opacity = 0.22 * (0.52 + 0.48 * intensity);
}

function updateDoor(dt, t) {
  if (!door) return;
  if (!doorOpening && !doorClosing && t > nextDoorTime) {
    doorOpening = true;
    doorHold = 0;
  }
  if (doorOpening) {
    doorAnimation += dt / 1.05;
    if (doorAnimation >= 1) {
      doorAnimation = 1;
      doorHold += dt;
      if (doorHold > 2.4) {
        doorOpening = false;
        doorClosing = true;
      }
    }
  } else if (doorClosing) {
    doorAnimation -= dt / 1.25;
    if (doorAnimation <= 0) {
      doorAnimation = 0;
      doorClosing = false;
      nextDoorTime = t + 8.2 + rand() * 8.0;
    }
  }
  const amt = easeInOutSine(doorAnimation);
  const offset = 0.285 * amt;
  door.left.position.x = -0.305 - offset;
  door.right.position.x = 0.305 + offset;
  const led = door.led;
  if (doorOpening || doorClosing) {
    led.color.setHex(Math.sin(t * 14) > 0 ? 0xffc679 : 0x5fe9c2);
  } else {
    led.color.setHex(0x5fe9c2);
  }
  if (store.animated.entranceLight) store.animated.entranceLight.intensity = 5.2 + amt * 1.3;
}

function updateNoren(dt, t) {
  if (!noren || !norenBase) return;
  const pos = noren.geometry.attributes.position;
  const arr = pos.array;
  for (let i = 0; i < pos.count; i++) {
    const x = norenBase[i * 3];
    const y = norenBase[i * 3 + 1];
    const edge = clamp((y + 0.27) / 0.54, 0, 1);
    const s = Math.sin(t * 1.1 + x * 9.0 + y * 5.0) * 0.012 * edge + Math.sin(t * 0.43) * 0.004;
    arr[i * 3 + 2] = s;
  }
  pos.needsUpdate = true;
}

function updateHangingSigns(t) {
  const list = store.animated.interior?.hangingSigns || [];
  for (const h of list) {
    h.group.rotation.z = Math.sin(t * 0.55 + h.phase) * 0.006;
    h.group.rotation.x = Math.sin(t * 0.41 + h.phase * 1.7) * 0.004;
  }
}

function updateScreens(t) {
  const screens = store.animated.interior?.screens || [];
  for (let i = 0; i < screens.length; i++) {
    const mat = screens[i].material;
    if (mat?.color) {
      const pulse = 0.97 + Math.sin(t * 0.8 + i) * 0.03;
      mat.color.setScalar(pulse);
    }
  }
}

function updateVendingPulse(t) {
  props.vending.forEach((v, idx) => {
    if (v.light) v.light.intensity = 2.0 + Math.sin(t * 0.43 + idx * 2.2) * 0.16;
    if (v.halo) v.halo.material.opacity = 0.16 + Math.sin(t * 0.23 + idx) * 0.012;
  });
}

function updateLampFlicker(t) {
  const lamp = props.signalLamp.lamp;
  const base = 0.97 + Math.sin(t * 1.7) * 0.01 + Math.sin(t * 8.3) * 0.006;
  lamp.mat.color.setRGB(1.3 * base, 1.56 * base, 1.76 * base);
  lamp.light.intensity = lampLightBase * base;
  lamp.halo.material.opacity = lampGlowBase * base;
}

function updateDoorRain(dt) {
  for (const d of doorDrops) {
    d.y -= d.speed * dt * 2.2;
    if (d.y < 0.35) {
      d.y = 1.65 + Math.random() * 0.25;
      d.x = -0.2 + Math.random() * 0.38;
    }
    d.mesh.position.y = d.y;
    d.mesh.position.x = d.x;
  }
}

function updateMotes(dt, t) {
  const p = motes.geometry.attributes.position;
  const arr = p.array;
  for (let i = 0; i < p.count; i++) {
    arr[i * 3 + 1] -= dt * (0.06 + (i % 5) * 0.012);
    arr[i * 3] += Math.sin(t * 0.1 + i) * dt * 0.009;
    if (arr[i * 3 + 1] < 0.3) arr[i * 3 + 1] = 6.5;
  }
  p.needsUpdate = true;
}

function renderFrame(dt, t) {
  controls.update();
  weather.update(dt, t);
  updateTraffic(dt, t);
  updateFlicker(dt, t);
  updateDoor(dt, t);
  updateNoren(dt, t);
  updateHangingSigns(t);
  updateScreens(t);
  updateVendingPulse(t);
  updateLampFlicker(t);
  updateDoorRain(dt);
  updateMotes(dt, t);
  skyUniforms.uTime.value = t;
  finalPass.uniforms.uTime.value = t;
  finalPass.uniforms.uExposure.value = 1.01 + Math.sin(t * 0.12) * 0.006;
  composer.render();
}

function animate() {
  if (window.innerWidth !== lastW || window.innerHeight !== lastH) {
    onResize();
  }
  const dt = Math.min(clock.getDelta(), 0.1);
  time += dt;
  renderFrame(dt, time);
  frameCount++;
}
renderer.setAnimationLoop(animate);

// Render one frame synchronously so opening the file never shows a blank canvas.
renderFrame(0.016, 0);

/* ------------------------------------------------------------------ *
 *  Resize
 * ------------------------------------------------------------------ */
let lastW = window.innerWidth;
let lastH = window.innerHeight;
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  lastW = w;
  lastH = h;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  composer.setSize(w, h);
  bloom.setSize(w, h);
  finalPass.uniforms.uResolution.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
}
window.addEventListener('resize', onResize);
if ('ResizeObserver' in window) {
  new ResizeObserver(() => {
    if (window.innerWidth !== lastW || window.innerHeight !== lastH) onResize();
  }).observe(document.documentElement);
}


// If the page is opened with ?still=1, pause the animation loop so a screenshot
// can be captured deterministically. It is a development affordance only and
// changes nothing in the visible composition.
const params = new URLSearchParams(window.location.search);
if (params.get('still') === '1') {
  renderer.setAnimationLoop(null);
  renderFrame(0.016, 2.2);
}
