/**
 * Site-opening drive-by with a real photograph: the fleet's black Escalade
 * (studio shot, background removed — public/assets/fleet-cutouts/
 * escalade.webp, the floor shadow kept as real transparency) crosses the
 * page from right to left over the site itself.
 *
 * Fast in, a short ease past the middle, fast out; two trailing ghost
 * copies and light streaks give the speed, the headlamps flare, and the
 * body rides a little. Web Animations only, no libraries.
 */
export const DRIVE_BY_CAR = {
  src: "/assets/fleet-cutouts/escalade.webp",
  width: 1059,
  height: 476,
  /** Near-side LED headlamp, as fractions of the image. */
  lamp: { x: 0.315, y: 0.47 },
  /** Far-side headlamp. */
  lamp2: { x: 0.03, y: 0.43 },
} as const;

/** Resolves true once the photo is decoded, false if it takes too long. */
export function preloadDriveByCar(timeoutMs = 2500): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = DRIVE_BY_CAR.src;
    const t = window.setTimeout(() => resolve(false), timeoutMs);
    img
      .decode()
      .then(() => {
        window.clearTimeout(t);
        resolve(true);
      })
      .catch(() => {
        window.clearTimeout(t);
        resolve(false);
      });
  });
}

export function runPhotoDriveBy(
  layer: HTMLElement,
  opts: { duration?: number; onDone?: () => void } = {},
): () => void {
  const duration = opts.duration ?? 1700;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const carW = Math.round(Math.min(vw < 640 ? vw * 1.05 : vw * 0.58, 980));
  const carH = Math.round((carW * DRIVE_BY_CAR.height) / DRIVE_BY_CAR.width);
  const bottom = Math.round(vh * (vw < 640 ? 0.2 : 0.1));

  const rig = document.createElement("div");
  rig.style.cssText = `position:absolute;left:0;bottom:${bottom}px;width:${carW}px;height:${carH}px;will-change:transform`;

  const makeCar = (opacity: number, blur: number, offset: number) => {
    const img = document.createElement("img");
    img.src = DRIVE_BY_CAR.src;
    img.alt = "";
    img.decoding = "sync";
    img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;opacity:${opacity};transform:translateX(${offset}px);${
      blur ? `filter:blur(${blur}px);` : ""
    }`;
    return img;
  };
  const ghostFar = makeCar(0.14, 3, Math.round(carW * 0.16));
  const ghostNear = makeCar(0.28, 1.5, Math.round(carW * 0.07));
  const car = makeCar(1, 0, 0);

  // Speed streaks behind the car.
  const streaks = document.createElement("div");
  streaks.style.cssText =
    "position:absolute;left:62%;top:0;width:90%;height:100%;pointer-events:none";
  [0.32, 0.5, 0.64, 0.8].forEach((y, i) => {
    const s = document.createElement("i");
    s.style.cssText = `position:absolute;left:0;top:${y * 100}%;height:${i % 2 ? 2 : 3}px;width:${70 + i * 12}%;border-radius:2px;background:linear-gradient(90deg,rgba(255,244,222,.75),rgba(200,173,134,0));`;
    streaks.appendChild(s);
  });

  // Headlamp flares.
  const flare = (x: number, y: number, size: number) => {
    const f = document.createElement("i");
    f.style.cssText = `position:absolute;left:${x * 100}%;top:${y * 100}%;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px;border-radius:50%;background:radial-gradient(circle,rgba(255,250,238,.95) 0%,rgba(255,244,220,.45) 28%,rgba(255,244,220,0) 70%);mix-blend-mode:screen;pointer-events:none`;
    return f;
  };
  const lampSize = Math.round(carW * 0.16);

  rig.append(
    streaks,
    ghostFar,
    ghostNear,
    car,
    flare(DRIVE_BY_CAR.lamp.x, DRIVE_BY_CAR.lamp.y, lampSize),
    flare(DRIVE_BY_CAR.lamp2.x, DRIVE_BY_CAR.lamp2.y, Math.round(lampSize * 0.7)),
  );
  layer.appendChild(rig);

  const startX = vw + carW * 0.15;
  const midX = (vw - carW) / 2;
  const endX = -carW * 1.35;
  const drive = rig.animate(
    [
      { transform: `translate3d(${startX}px,0,0)`, easing: "cubic-bezier(0.2,0.6,0.35,1)" },
      { transform: `translate3d(${midX + carW * 0.05}px,0,0)`, offset: 0.42, easing: "linear" },
      {
        transform: `translate3d(${midX - carW * 0.05}px,0,0)`,
        offset: 0.58,
        easing: "cubic-bezier(0.55,0,0.85,0.4)",
      },
      { transform: `translate3d(${endX}px,0,0)` },
    ],
    { duration, fill: "forwards" },
  );
  // Ghosts and streaks show the speed, and thin out while the car eases.
  const speedFade: Keyframe[] = [
    { opacity: 1 },
    { opacity: 0.15, offset: 0.45 },
    { opacity: 0.15, offset: 0.55 },
    { opacity: 1 },
  ];
  [ghostFar, ghostNear, streaks].forEach((el) =>
    el.animate(speedFade, { duration, fill: "forwards" }),
  );
  // A little ride on the suspension.
  car.animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(-2px)" },
      { transform: "translateY(1px)" },
      { transform: "translateY(0)" },
    ],
    { duration: 260, iterations: Math.ceil(duration / 260) },
  );

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    drive.cancel();
    rig.parentNode?.removeChild(rig);
    opts.onDone?.();
  };
  drive.onfinish = finish;
  return finish;
}
