import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { IMAGES, type ImageKey } from "@/lib/image-map";
import { FLEET_VEHICLES, PARTNERS, SERVICE_AREA_GROUPS } from "@/lib/site-data";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * "Our capabilities": the services as photo tiles in a bento grid, with one
 * tile of figures that turns over by itself (count-up, then the next one).
 * Every figure comes from site data or published policy.
 */

type Tile = {
  kicker: string;
  title: string;
  line: string;
  to: string;
  imageKey: ImageKey;
  wide?: boolean;
};

const TILES: Tile[] = [
  {
    kicker: "DFW · Love Field",
    title: "Airport transfers",
    line: "Flights tracked, 60 minutes of waiting included",
    to: "/airport",
    imageKey: "airport",
    wide: true,
  },
  {
    kicker: "Accounts",
    title: "Corporate travel",
    line: "Roadshows, VIP guests, one invoice",
    to: "/corporate",
    imageKey: "corporateStory",
  },
  {
    kicker: "Occasions",
    title: "Events",
    line: "Weddings, galas, stadium nights",
    to: "/events",
    imageKey: "events",
  },
  {
    kicker: "Sprinter · Coach",
    title: "Groups",
    line: "Sprinters and coaches up to 56 seats",
    to: "/services",
    imageKey: "groupCoachStory",
  },
];

const CITY_COUNT = SERVICE_AREA_GROUPS.reduce((n, g) => n + g.cities.length, 0);

const FIGURES: { value: number; suffix?: string; label: string }[] = [
  { value: 24, suffix: "/7", label: "Dispatch, every day of the year" },
  { value: 60, suffix: " min", label: "Free waiting on airport pickups" },
  { value: FLEET_VEHICLES.length, label: "Vehicle classes, sedan to coach" },
  { value: CITY_COUNT, label: "Communities served across DFW" },
  { value: PARTNERS.length, label: "Airline and corporate partners" },
];

const TURN_MS = 3200;

function FigureTile() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(FIGURES[0].value);
  const [live, setLive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const still = useRef(false);

  // Turn over only while the tile is on screen.
  useEffect(() => {
    still.current = prefersReducedMotion();
    const el = ref.current;
    if (!el || still.current) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % FIGURES.length), TURN_MS);
    return () => window.clearInterval(t);
  }, [live]);

  // Count up to the current figure.
  useEffect(() => {
    const target = FIGURES[i].value;
    if (still.current) return setShown(target);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 900);
      setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i]);

  const f = FIGURES[i];
  return (
    <div
      ref={ref}
      className="relative flex min-h-[140px] flex-col items-center justify-center overflow-hidden rounded-[20px] md:min-h-[220px] bg-[#0d0e10] p-6 text-center ring-1 ring-[#c9a24f]/45"
    >
      <p
        key={i}
        className="cap-figure bg-[image:var(--logo-gradient)] bg-clip-text font-display text-[clamp(2.4rem,6vw,5.5rem)] font-light leading-none tracking-[-0.03em] text-transparent tabular-nums"
        aria-live="off"
      >
        {shown}
        {f.suffix}
      </p>
      <p
        key={`l${i}`}
        className="cap-figure mt-4 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white/60"
      >
        {f.label}
      </p>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:bottom-5">
        {FIGURES.map((x, n) => (
          <button
            key={x.label}
            type="button"
            onClick={() => setI(n)}
            aria-label={`${x.value}${x.suffix ?? ""} ${x.label}`}
            aria-current={n === i || undefined}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              n === i ? "w-6 bg-[#c9a24f]" : "w-1.5 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PhotoTile({ t }: { t: Tile }) {
  const img = IMAGES[t.imageKey];
  return (
    <Link
      to={t.to}
      className={`group relative isolate block min-h-[150px] overflow-hidden rounded-[20px] md:min-h-[220px] bg-[#111215] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold-light)] ${
        t.wide ? "md:col-span-2" : ""
      }`}
    >
      <img
        src={img.src}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ objectPosition: img.objectPositionDesktop }}
      />
      <span
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        aria-hidden
      />
      <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 md:inset-x-6 md:bottom-6">
        <span>
          <span className="block text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[#e2c27a]">
            {t.kicker}
          </span>
          <span className="mt-2 block font-display text-2xl font-normal tracking-[-0.01em] text-white md:text-[1.7rem]">
            {t.title}
          </span>
          <span className="mt-1 block text-sm text-white/70">{t.line}</span>
        </span>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#e2c27a] ring-1 ring-[#e2c27a]/60 transition-colors duration-300 group-hover:bg-[#e2c27a] group-hover:text-[#0d0e10]"
          aria-hidden
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </span>
    </Link>
  );
}

export function Capabilities() {
  const [first, ...rest] = TILES;
  return (
    <section className="py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        <div className="flex items-stretch gap-4">
          <span className="w-[3px] rounded-full bg-[color:var(--gold-light)]" aria-hidden />
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.75rem)] font-normal leading-[0.95]">
            Our capabilities.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:auto-rows-[minmax(240px,30vh)] md:gap-5">
          <PhotoTile t={first} />
          <FigureTile />
          {rest.map((t) => (
            <PhotoTile key={t.title} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
