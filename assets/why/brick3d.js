// Kill Dull · WHY — the brick. A real three-dimensional, worn brick (three.js), turned by scroll.
// Also carries the page's small layout jobs (brick plane size/offset, lede square, review deep-links).
(async () => {
if (typeof document === 'undefined' || !document.getElementById('world') || !document.getElementById('cv')) return;
// Placeholder: a snapshot of this same 3D brick in its opening pose, shown at once until the live brick is ready.
const ph = document.createElement('img'); const dark = getComputedStyle(document.getElementById('world')).color === 'rgb(255, 255, 255)';
ph.src = dark ? 'assets/why/snap-dark.png' : 'assets/why/snap-light.png'; ph.alt = '';
ph.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;transition:opacity .5s ease';
document.getElementById('world').querySelector('.plane').appendChild(ph);
const THREE = await import(new URL('assets/why/three.module.js', document.baseURI).href);

const $ = id => document.getElementById(id);
const world = $('world'), plane = world.querySelector('.plane'), old = $('cv');
const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: /[?&](p|s|shot)=/.test(location.search) });
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;opacity:0;transition:opacity .6s ease';
let texReady = false;
old.replaceWith(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(24, 1, .1, 100);

// ---------- worn brick geometry ----------
// Brick 215 × 65 × 102.5 mm → units: x length, y height, z width.
const HX = 1.075, HY = .325, HZ = .5125, R = .022;
// Small deterministic value noise.
const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x, y, z) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (i, j, k) => hash(xi + i, yi + j, zi + k);
  return l(l(l(c(0,0,0), c(1,0,0), u), l(c(0,1,0), c(1,1,0), u), v), l(l(c(0,0,1), c(1,0,1), u), l(c(0,1,1), c(1,1,1), u), v), w);
};
const fbm = (x, y, z) => vnoise(x, y, z) * .55 + vnoise(x * 2.1, y * 2.1, z * 2.1) * .28 + vnoise(x * 4.3, y * 4.3, z * 4.3) * .17;

const geo = new THREE.BoxGeometry(HX * 2, HY * 2, HZ * 2, 160, 50, 76);
const pos = geo.attributes.position, P = new THREE.Vector3(), I = new THREE.Vector3(), N = new THREE.Vector3();
for (let i = 0; i < pos.count; i++) {
  P.fromBufferAttribute(pos, i);
  // Rounded arrises: pull every point onto a box with radius-R edges and corners.
  I.set(THREE.MathUtils.clamp(P.x, -HX + R, HX - R), THREE.MathUtils.clamp(P.y, -HY + R, HY - R), THREE.MathUtils.clamp(P.z, -HZ + R, HZ - R));
  N.subVectors(P, I); const len = N.length() || 1; N.divideScalar(len);
  P.copy(I).addScaledVector(N, R);
  // How close to an edge: the second-smallest distance to the three face planes.
  const d = [HX - Math.abs(P.x), HY - Math.abs(P.y), HZ - Math.abs(P.z)].sort((a, b) => a - b)[1];
  const edge = 1 - THREE.MathUtils.smoothstep(d, 0, R * 2.2);
  // Chips and wear along the edges, a soft unevenness over the faces, and fine grit everywhere.
  // Edges stay essentially straight: only small, sharp-sided nicks along the arrises, and very fine grit.
  const chip = Math.max(0, fbm(P.x * 9, P.y * 9, P.z * 9) - .55) * 2.2;
  const off = -edge * chip * .03 + (vnoise(P.x * 80, P.y * 80, P.z * 80) - .5) * .0025;
  P.addScaledVector(N, off);
  pos.setXYZ(i, P.x, P.y, P.z);
}
// Smooth normals across the six faces (BoxGeometry keeps faces separate; merge by position).
{
  const nrm = new Float32Array(pos.count * 3), acc = new Map(), idx = geo.index.array, key = i => (Math.round(pos.getX(i) * 4000) * 73856093) ^ (Math.round(pos.getY(i) * 4000) * 19349663) ^ (Math.round(pos.getZ(i) * 4000) * 83492791);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), fn = new THREE.Vector3();
  for (let t = 0; t < idx.length; t += 3) {
    a.fromBufferAttribute(pos, idx[t]); b.fromBufferAttribute(pos, idx[t + 1]); c.fromBufferAttribute(pos, idx[t + 2]);
    fn.subVectors(c, b).cross(a.clone().sub(b));
    for (let k = 0; k < 3; k++) { const kk = key(idx[t + k]); const v = acc.get(kk) || [0, 0, 0]; v[0] += fn.x; v[1] += fn.y; v[2] += fn.z; acc.set(kk, v); }
  }
  for (let i = 0; i < pos.count; i++) { const v = acc.get(key(i)), m = Math.hypot(...v) || 1; nrm[i * 3] = v[0] / m; nrm[i * 3 + 1] = v[1] / m; nrm[i * 3 + 2] = v[2] / m; }
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
}

// ---------- materials: the supplied photograph's own faces ----------
// Nothing is shown until every face is loaded — an untextured brick renders black.
const manager = new THREE.LoadingManager(() => { texReady = true; render(); requestAnimationFrame(() => { renderer.domElement.style.opacity = '1'; ph.style.opacity = '0'; setTimeout(() => ph.remove(), 700); }); });
const loader = new THREE.TextureLoader(manager);
const tex = k => { const t = loader.load('assets/why/face-' + k + '.jpg'); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const bump = k => loader.load('assets/why/face-' + k + '.jpg');
// The long face is the sharpest part of the photograph, so it also dresses the top and back (flipped so it never reads as a repeat).
const mat = (k, fx, fy) => { const m = tex(k), b = bump(k); [m, b].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(fx ? -1 : 1, fy ? -1 : 1); }); return new THREE.MeshStandardMaterial({ map: m, bumpMap: b, bumpScale: .6, roughness: .96, metalness: 0 }); };
// Visible sides come straight from the photograph; hidden sides are quilted from it, so no two sides share the same marks.
const mFront = mat('front'), mBack = mat('back'), mTop = mat('top2'), mBot = mat('bottom'), mEnd = mat('end'), mEnd2 = mat('end2');
// BoxGeometry groups: +x, -x, +y, -y, +z, -z
const brick = new THREE.Mesh(geo, [mEnd2, mEnd, mTop, mBot, mFront, mBack]);
brick.castShadow = true; brick.receiveShadow = false;
const rig = new THREE.Group(); rig.add(brick); scene.add(rig);

// ---------- light and ground ----------
scene.add(new THREE.HemisphereLight(0xffffff, 0x4a4650, 1.35));
const key = new THREE.DirectionalLight(0xfff6ee, 1.55);
key.position.set(-2.6, 6.5, 3.4); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 26; key.shadow.blurSamples = 25; key.shadow.bias = -.0006;
Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .5, far: 20 });
scene.add(key);
const fill = new THREE.DirectionalLight(0xf0f2ff, .45); fill.position.set(4, 2, 3); scene.add(fill);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: getComputedStyle(world).color === 'rgb(255, 255, 255)' ? .42 : .22 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -HY - .004; ground.receiveShadow = true; scene.add(ground);

// ---------- layout ----------
let Wc = 0, Hc = 0;
const size = () => {
  const mob = innerWidth <= 760;
  if (!mob) {
    const w0 = plane.getBoundingClientRect().width, L0 = Math.min(w0 * .75, innerHeight * .9 / .8);
    plane.style.setProperty('--ph', Math.round(L0 * 1.1) + 'px');
    const cp = $('copy'), p1 = cp.querySelector('p'); plane.style.setProperty('--mt', Math.round(p1.offsetTop - L0 * .25) + 'px');
    const lp = cp.querySelector('p:last-of-type'); cp.style.setProperty('--pb', Math.round(L0 * .35) + 'px');
  } else { plane.style.removeProperty('--ph'); plane.style.removeProperty('--mt'); $('copy').style.removeProperty('--pb'); }
  const r = plane.getBoundingClientRect(); Wc = r.width; Hc = r.height;
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(Wc, Hc, false);
  camera.aspect = Wc / Hc; camera.updateProjectionMatrix();
};

// ---------- scroll → one slow full turn ----------
// Tweakable (window.WHY_TWEAKS, set by the page's Tweaks panel).
const TW = () => window.WHY_TWEAKS || {};
const EASE = {
  Even: t => t,
  Gentle: t => .5 - .5 * Math.cos(Math.PI * t),
  Settle: t => 1 - Math.pow(1 - t, 2.2),
};
const ease = t => (EASE[TW().easing] || EASE.Even)(t);
let mx = 0, my = 0, shown = null;
function progress() {
  if (rm) return 0;
  const vh = innerHeight, top = world.getBoundingClientRect().top + scrollY, lp = document.querySelector('#copy p:last-of-type'), mob = innerWidth <= 760;
  const Lpx = Math.min(Wc * .75, Hc * 1.5);
  const brickY = mob ? plane.getBoundingClientRect().height + 24 + lp.offsetHeight / 2 : vh / 2 + Lpx * .2 - lp.offsetHeight / 2;
  const endY = lp.getBoundingClientRect().top + scrollY + lp.offsetHeight / 2 - brickY, startY = top - vh * (TW().start ?? .6);
  return Math.max(0, Math.min(1, (scrollY - startY) / Math.max(1, endY - startY)));
}
function render() {
  if (!Wc || !texReady) return;
  // Smoothing: the brick follows scroll with a little inertia, so it never snaps into or out of the turn.
  const target = progress(), k = TW().smoothing ?? .12;
  shown = shown === null || k <= 0 ? target : shown + (target - shown) * Math.min(1, 1 - k);
  if (Math.abs(target - shown) > .0005) tick(); else shown = target;
  const p = shown;
  // The brick turns about its own vertical axis; the camera's elevation breathes a little. It never tumbles.
  rig.rotation.y = (25 + (TW().turn ?? 360) * ease(p) + mx * 2) * Math.PI / 180;
  const el = (21 + (TW().tilt ?? 7) * Math.sin(Math.PI * p) - my * 1.5) * Math.PI / 180;
  // Frame so the brick spans ~75% of the plane width (as before).
  const rad = Math.hypot(HX, HY, HZ) * 1.06, vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect), dist = rad / Math.sin(Math.min(vf, hf));
  camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist); camera.lookAt(0, -.06, 0);
  renderer.render(scene, camera);
}
let raf = 0; function tick() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); }
addEventListener('scroll', tick, { passive: true });
addEventListener('resize', () => { size(); fitLede(); render(); });
if (!rm && matchMedia('(hover: hover)').matches) addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; tick(); }, { passive: true });

// ---------- lede square (same rule as the WHAT lede) ----------
const lede = $('lede'), ls = lede && lede.querySelector('span');
function fitLede() {
  if (!lede || !getComputedStyle(lede, '::before').content || getComputedStyle(lede, '::before').content === 'none') return;
  const cs = getComputedStyle(lede), lh = parseFloat(cs.lineHeight), gap = parseFloat(cs.columnGap) || 0, Wd = lede.clientWidth; let hh = 2 * lh;
  for (let n = 2; n <= 5; n++) { const tw = Wd - n * lh - gap; if (tw < 200) break; ls.style.flex = '0 0 ' + tw + 'px'; if (Math.round(ls.offsetHeight / lh) === n) { hh = n * lh; break; } }
  ls.style.flex = ''; lede.style.setProperty('--h', hh + 'px');
}
if (document.fonts) document.fonts.ready.then(() => { size(); fitLede(); render(); });
new ResizeObserver(() => { size(); render(); }).observe(plane);
size(); fitLede(); render();
window.__why = { frame: () => { shown = null; render(); } };
addEventListener('why-tweaks', () => { shown = null; render(); });

// ---------- review deep-links: ?p=0..1 | ?s=intro|outro ----------
const q = new URLSearchParams(location.search);
const go = () => { const vh = innerHeight, top = world.getBoundingClientRect().top + scrollY; let y = null;
  if (q.has('p')) y = top - vh * .35 + (+q.get('p')) * (world.offsetHeight - vh + vh * .35);
  else if (q.get('s') === 'intro') y = 0; else if (q.get('s') === 'outro' && $('outro')) y = $('outro').offsetTop;
  if (y !== null) { window.scrollTo(0, y); render(); } };
if (q.has('p') || q.has('s')) { requestAnimationFrame(go); if (document.fonts) document.fonts.ready.then(go); }
})();
