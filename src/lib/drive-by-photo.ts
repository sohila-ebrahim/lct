/**
 * Site-opening drive-by with a real photograph: the fleet's black Escalade
 * (studio shot, background removed — public/assets/fleet-cutouts/
 * escalade.webp, the floor shadow kept as real transparency), small, along
 * a thin gold road at the bottom of the hero, from right to left.
 *
 * The road draws in, the car drives its length with light trails and a
 * lit headlamp, the road fades out. Web Animations only, no libraries.
 */
export const DRIVE_BY_CAR = {
  src: "/assets/fleet-cutouts/escalade.webp",
  width: 1059,
  height: 476,
  /** Near-side LED headlamp, as fractions of the image. */
  lamp: { x: 0.315, y: 0.47 },
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
  const duration = opts.duration ?? 3400;
  const vw = layer.clientWidth || window.innerWidth;
  const carW = Math.round(Math.max(150, Math.min(vw * 0.17, 260)));
  const carH = Math.round((carW * DRIVE_BY_CAR.height) / DRIVE_BY_CAR.width);
  const roadY = 18;

  // A thin gold road along the bottom edge; it draws in, the car drives on
  // it, and it fades away again.
  const road = document.createElement("i");
  road.style.cssText = `position:absolute;left:0;right:0;bottom:${roadY}px;height:1px;transform-origin:right center;background:linear-gradient(90deg,rgba(201,162,79,0),rgba(220,190,120,.85) 18%,rgba(220,190,120,.85) 82%,rgba(201,162,79,0))`;

  const rig = document.createElement("div");
  rig.style.cssText = `position:absolute;left:0;bottom:${roadY - Math.round(carH * 0.06)}px;width:${carW}px;height:${carH}px;will-change:transform`;

  const car = document.createElement("img");
  car.src = DRIVE_BY_CAR.src;
  car.alt = "";
  car.decoding = "sync";
  car.style.cssText = "position:absolute;inset:0;width:100%;height:100%";

  // Two short light trails behind the car.
  const streaks = document.createElement("div");
  streaks.style.cssText =
    "position:absolute;left:70%;top:0;width:70%;height:100%;pointer-events:none";
  [0.45, 0.62].forEach((y, i) => {
    const t = document.createElement("i");
    t.style.cssText = `position:absolute;left:0;top:${y * 100}%;height:${i ? 1 : 2}px;width:${80 - i * 20}%;border-radius:2px;background:linear-gradient(90deg,rgba(255,244,222,.6),rgba(200,173,134,0))`;
    streaks.appendChild(t);
  });

  // Headlamp glow.
  const lampSize = Math.round(carW * 0.2);
  const lamp = document.createElement("i");
  lamp.style.cssText = `position:absolute;left:${DRIVE_BY_CAR.lamp.x * 100}%;top:${DRIVE_BY_CAR.lamp.y * 100}%;width:${lampSize}px;height:${lampSize}px;margin:-${lampSize / 2}px 0 0 -${lampSize / 2}px;border-radius:50%;background:radial-gradient(circle,rgba(255,250,238,.95) 0%,rgba(255,244,220,.4) 30%,rgba(255,244,220,0) 70%);mix-blend-mode:screen;pointer-events:none`;

  rig.append(streaks, car, lamp);
  layer.append(road, rig);

  road.animate(
    [
      { transform: "scaleX(0)", opacity: 0 },
      { transform: "scaleX(1)", opacity: 1 },
    ],
    {
      duration: 500,
      easing: "cubic-bezier(0.625,0.05,0,1)",
      fill: "forwards",
    },
  );
  const drive = rig.animate(
    [
      { transform: `translate3d(${vw + 20}px,0,0)` },
      { transform: `translate3d(${-carW - 40}px,0,0)` },
    ],
    { duration, delay: 250, easing: "cubic-bezier(0.4,0.1,0.6,0.9)", fill: "both" },
  );
  // A little ride on the suspension.
  car.animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(-1px)" },
      { transform: "translateY(0.5px)" },
      { transform: "translateY(0)" },
    ],
    { duration: 300, iterations: Math.ceil((duration + 250) / 300) },
  );

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    drive.cancel();
    rig.remove();
    road.remove();
    opts.onDone?.();
  };
  drive.onfinish = () => {
    road
      .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: "forwards" })
      .finished.then(finish, finish);
  };
  return finish;
}
