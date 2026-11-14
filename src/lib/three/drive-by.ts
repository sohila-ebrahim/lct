import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Hero intro: a black full-size SUV (modelled after the fleet's Escalade —
 * built from a side profile in code, no model file) drives fast across the
 * screen from right to left, easing slightly as it passes the middle.
 *
 * `onProgress` receives the car's rear edge as a fraction of the screen
 * width (1 → 0) every frame so the hero can reveal its photo in the car's
 * wake. Everything is disposed when the run ends or is cancelled.
 */
export type DriveByOptions = {
  onProgress?: (rearX: number) => void;
  onDone?: () => void;
  duration?: number;
};

const L = 5.1; // body length (units ≈ metres)

function bodyShape() {
  const s = new THREE.Shape();
  const r = 0.47; // wheel-arch radius
  const fx = 1.62; // axle offset from centre
  s.moveTo(2.55, 0.42);
  s.lineTo(fx + r, 0.42);
  s.absarc(fx, 0.42, r, 0, Math.PI, false);
  s.lineTo(-fx + r, 0.42);
  s.absarc(-fx, 0.42, r, 0, Math.PI, false);
  s.lineTo(-2.55, 0.42);
  s.lineTo(-2.58, 1.0);
  s.lineTo(-2.5, 1.72);
  s.quadraticCurveTo(-2.45, 1.86, -2.25, 1.88);
  s.lineTo(1.0, 1.88);
  s.quadraticCurveTo(1.18, 1.87, 1.28, 1.76);
  s.lineTo(1.62, 1.26);
  s.lineTo(2.42, 1.16);
  s.quadraticCurveTo(2.58, 1.12, 2.6, 0.96);
  s.lineTo(2.58, 0.42);
  return s;
}

function glassShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.4, 1.28);
  s.lineTo(-2.34, 1.74);
  s.lineTo(1.0, 1.76);
  s.lineTo(1.5, 1.27);
  s.lineTo(-2.4, 1.28);
  return s;
}

function glowTexture(inner: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.25, inner.replace(/[\d.]+\)$/, "0.45)"));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function streakTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 8;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, "rgba(255,240,210,0.95)");
  grad.addColorStop(1, "rgba(200,173,134,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 8);
  return new THREE.CanvasTexture(c);
}

function buildCar() {
  const car = new THREE.Group();
  const W = 2.0;

  const paint = new THREE.MeshPhysicalMaterial({
    color: 0x0b0b0d,
    metalness: 0.55,
    roughness: 0.26,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x050607,
    metalness: 0.9,
    roughness: 0.05,
  });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd9d9de, metalness: 1, roughness: 0.18 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.85 });
  const head = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff4dc,
    emissiveIntensity: 3,
  });
  const tail = new THREE.MeshStandardMaterial({
    color: 0x3a0000,
    emissive: 0xff1a1a,
    emissiveIntensity: 2.5,
  });

  const bevel = {
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.08,
    bevelSegments: 4,
    curveSegments: 28,
  };
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bodyShape(), { depth: W - 0.18, ...bevel }),
    paint,
  );
  body.position.z = -(W - 0.18) / 2;
  car.add(body);

  const glassMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(glassShape(), {
      depth: W + 0.02,
      bevelEnabled: false,
      curveSegments: 4,
    }),
    glass,
  );
  glassMesh.position.z = -(W + 0.02) / 2;
  car.add(glassMesh);

  // Pillars and the chrome belt line, both sides.
  for (const z of [W / 2 + 0.02, -W / 2 - 0.02]) {
    for (const x of [-1.05, 0.05]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.02), paint);
      p.position.set(x, 1.52, z);
      car.add(p);
    }
    const belt = new THREE.Mesh(new THREE.BoxGeometry(3.95, 0.035, 0.02), chrome);
    belt.position.set(-0.45, 1.25, z);
    car.add(belt);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.03), chrome);
    sill.position.set(0, 0.5, z);
    car.add(sill);
  }

  // Front: large chrome grille, vertical LED lamps. Rear: vertical red lamps.
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 1.25), chrome);
  grille.position.set(2.69, 0.78, 0);
  car.add(grille);
  const headGlow = glowTexture("rgba(255,246,225,1)");
  const tailGlow = glowTexture("rgba(255,40,30,1)");
  for (const z of [0.82, -0.82]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.07), head);
    h.position.set(2.69, 0.86, z);
    car.add(h);
    const hg = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: headGlow,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    hg.scale.set(1.3, 1.3, 1);
    hg.position.set(2.8, 0.86, z);
    car.add(hg);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.62, 0.08), tail);
    t.position.set(-2.69, 1.3, z);
    car.add(t);
    const tg = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tailGlow,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    tg.scale.set(0.9, 1.1, 1);
    tg.position.set(-2.72, 1.3, z);
    car.add(tg);
  }

  // Wheels: tyre, chrome rim and five spokes; spun by distance travelled.
  const wheels: THREE.Group[] = [];
  const tyreGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.34, 32);
  const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.36, 32);
  const spokeGeo = new THREE.BoxGeometry(0.05, 0.5, 0.37);
  for (const x of [1.62, -1.62]) {
    for (const z of [W / 2 - 0.12, -(W / 2 - 0.12)]) {
      const w = new THREE.Group();
      const tyre = new THREE.Mesh(tyreGeo, rubber);
      tyre.rotation.x = Math.PI / 2;
      w.add(tyre);
      const rim = new THREE.Mesh(rimGeo, chrome);
      rim.rotation.x = Math.PI / 2;
      w.add(rim);
      for (let k = 0; k < 5; k++) {
        const sp = new THREE.Mesh(spokeGeo, rubber);
        sp.rotation.z = (k / 5) * Math.PI;
        w.add(sp);
      }
      w.position.set(x, 0.42, z);
      car.add(w);
      wheels.push(w);
    }
  }

  // Soft contact shadow.
  const sc = document.createElement("canvas");
  sc.width = 256;
  sc.height = 64;
  const sg = sc.getContext("2d")!;
  const grad = sg.createRadialGradient(128, 32, 4, 128, 32, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.65)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 256, 64);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(L * 1.35, W * 1.7),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(sc),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  car.add(shadow);

  return { car, wheels };
}

export function runDriveBy(container: HTMLElement, opts: DriveByOptions = {}): () => void {
  const duration = opts.duration ?? 1.9;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.6));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
  key.position.set(4, 8, 6);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const { car, wheels } = buildCar();
  car.rotation.y = Math.PI; // nose points left (direction of travel)
  scene.add(car);

  // Gold light streaks trailing the car.
  const streakMat = new THREE.MeshBasicMaterial({
    map: streakTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const streaks = [0.5, 0.9, 1.35, 0.75].map((y, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.05 + i * 0.01), streakMat);
    m.position.set(0, y, 1.05 + i * 0.05);
    scene.add(m);
    return m;
  });

  const resize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Frame a lane about 1.6 car-lengths tall on any aspect ratio.
    const narrow = w / h < 1;
    camera.position.set(0, narrow ? 2.4 : 2.2, narrow ? 26 : 19);
    camera.lookAt(0, narrow ? 1.6 : 1.4, 0);
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  // Travel span: fully off screen on both sides at the car's depth.
  const halfSpan = () => {
    const d = camera.position.z;
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d * camera.aspect;
    return halfW + L;
  };

  const v = new THREE.Vector3();
  let raf = 0;
  let done = false;
  const t0 = performance.now();

  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => {
        (m as THREE.MeshBasicMaterial).map?.dispose();
        m.dispose();
      });
    });
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    opts.onDone?.();
  };

  const frame = (now: number) => {
    const t = Math.min(1, (now - t0) / 1000 / duration);
    const span = halfSpan();
    // Fast in, a breath as it crosses the middle, fast out.
    const x = span - 2 * span * t - span * 0.22 * Math.sin(2 * Math.PI * t);
    const prevX = car.position.x;
    car.position.x = x;
    const dist = Math.abs(prevX - x);
    wheels.forEach((w) => (w.rotation.z += dist / 0.42));

    const speed = Math.min(1, dist / 0.9);
    streaks.forEach((s, i) => {
      const len = 2 + speed * (7 + i * 2);
      s.scale.x = len;
      s.position.x = x + L / 2 + len / 2 - 0.2;
      (s.material as THREE.MeshBasicMaterial).opacity = 0.35 + speed * 0.65;
    });

    renderer.render(scene, camera);

    // Rear edge of the car on screen, as a 0..1 fraction of the width.
    v.set(x + L / 2, 1, 0).project(camera);
    opts.onProgress?.(Math.min(1, Math.max(0, (v.x + 1) / 2)));

    if (t < 1) raf = requestAnimationFrame(frame);
    else finish();
  };
  raf = requestAnimationFrame(frame);

  return finish;
}
