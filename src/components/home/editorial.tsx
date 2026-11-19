import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CONTACT, FLEET_VEHICLES, PARTNERS, SERVICE_AREA_GROUPS } from "@/lib/site-data";
import { IMAGES, type ImageKey } from "@/lib/image-map";
import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/motion";

/*
 * Shared scroll sections for the 2026-11 editorial redesign. Native
 * scrolling throughout (no pinning, no smooth-scroll library):
 *
 * - StatsBand: real figures count up once when they enter the view.
 * - ServiceStories: a sticky photo beside scrolling text; the photo
 *   cross-fades to match the story being read.
 *
 * Everything renders complete and readable without JavaScript or with
 * reduced motion; the effects only add movement.
 */

const CITY_COUNT = SERVICE_AREA_GROUPS.reduce((n, g) => n + g.cities.length, 0);
export type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  /** Top of the dial; defaults to a round number above the value. */
  max?: number;
};

const STATS: Stat[] = [
  { value: 24, suffix: "/7", label: "Dispatch, every day of the year", max: 24 },
  { value: FLEET_VEHICLES.length, suffix: "", label: "Vehicle classes, sedan to motor coach" },
  { value: CITY_COUNT, suffix: "", label: "Dallas–Fort Worth communities served" },
  { value: PARTNERS.length, suffix: "", label: "Airline and corporate partners" },
];

// Dial geometry: a 270° sweep from bottom-left, clockwise, to bottom-right.
const DIAL = { cx: 100, cy: 104, r: 78, start: 135, sweep: 270 };
const ARC_LEN = (Math.PI * 2 * DIAL.r * DIAL.sweep) / 360;

function polar(angle: number, r: number) {
  const a = (angle * Math.PI) / 180;
  return { x: DIAL.cx + r * Math.cos(a), y: DIAL.cy + r * Math.sin(a) };
}
const ARC_PATH = (() => {
  const a = polar(DIAL.start, DIAL.r);
  const b = polar(DIAL.start + DIAL.sweep, DIAL.r);
  return `M ${a.x} ${a.y} A ${DIAL.r} ${DIAL.r} 0 1 1 ${b.x} ${b.y}`;
})();

function dialMax(s: Stat) {
  if (s.max) return s.max;
  if (s.value >= 1900) return s.value; // a year: full sweep
  return [10, 24, 60, 80, 100, 150, 200, 500, 1000].find((m) => m >= s.value * 1.15) ?? s.value;
}

/**
 * Figures as car instrument-cluster gauges: a gold arc fills and a needle
 * sweeps to the value while the number counts up, once, when the band
 * enters view. Pages pass their own real numbers; the home set is the
 * default. Without motion the dials simply show their final reading.
 */
export function StatsBand({ stats = STATS }: { stats?: Stat[] }) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>(".gauge").forEach((g, i) => {
        const count = g.querySelector<HTMLElement>("[data-count]");
        const arc = g.querySelector<SVGPathElement>(".gauge-value");
        const needle = g.querySelector<SVGGElement>(".gauge-needle");
        const ratio = Number(g.dataset.ratio);
        const end = Number(count?.dataset.count ?? 0);
        const box = { p: 0 };
        const apply = () => {
          if (count) count.textContent = String(Math.round(end * box.p));
          arc?.setAttribute("stroke-dashoffset", String(ARC_LEN * (1 - ratio * box.p)));
          needle?.setAttribute(
            "transform",
            `rotate(${DIAL.start + DIAL.sweep * ratio * box.p} ${DIAL.cx} ${DIAL.cy})`,
          );
        };
        apply();
        gsap.to(box, {
          p: 1,
          duration: 1.8,
          delay: i * 0.12,
          ease: EASE,
          onUpdate: apply,
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="band-dark bg-[color:var(--band)] py-[var(--section-space)]">
      <dl className="mx-auto grid max-w-[var(--container-max)] grid-cols-2 gap-x-4 gap-y-7 px-[var(--page-gutter)] md:gap-x-8 md:gap-y-14 lg:grid-cols-4">
        {stats.map((s) => {
          const max = dialMax(s);
          const ratio = Math.min(1, s.value / max);
          const ticks = Array.from({ length: 11 }, (_, k) => DIAL.start + (DIAL.sweep * k) / 10);
          return (
            <div
              key={s.label}
              className="gauge flex flex-col items-center text-center"
              data-ratio={ratio}
            >
              <dt className="sr-only">{s.label}</dt>
              <dd className="relative w-full max-w-[120px] md:max-w-[240px]">
                <svg viewBox="0 0 200 180" className="w-full" aria-hidden>
                  <defs>
                    <linearGradient id="gauge-gold" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#b8862b" />
                      <stop offset="55%" stopColor="#f2d27e" />
                      <stop offset="100%" stopColor="#fff1c9" />
                    </linearGradient>
                  </defs>
                  <path
                    d={ARC_PATH}
                    fill="none"
                    stroke="rgb(255 255 255 / 0.1)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    className="gauge-value"
                    d={ARC_PATH}
                    fill="none"
                    stroke="url(#gauge-gold)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ARC_LEN}
                    strokeDashoffset={ARC_LEN * (1 - ratio)}
                  />
                  {ticks.map((a, k) => {
                    const p1 = polar(a, DIAL.r - 14);
                    const p2 = polar(a, DIAL.r - (k % 5 === 0 ? 24 : 19));
                    return (
                      <line
                        key={k}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="rgb(255 255 255 / 0.45)"
                        strokeWidth={k % 5 === 0 ? 2 : 1.2}
                        strokeLinecap="round"
                      />
                    );
                  })}
                  <text
                    x={polar(DIAL.start, DIAL.r).x + 4}
                    y="172"
                    fontSize="10"
                    fill="rgb(255 255 255 / 0.45)"
                  >
                    0
                  </text>
                  <text
                    x={polar(DIAL.start + DIAL.sweep, DIAL.r).x - 4}
                    y="172"
                    fontSize="10"
                    textAnchor="end"
                    fill="rgb(255 255 255 / 0.45)"
                  >
                    {max}
                  </text>
                  <g
                    className="gauge-needle"
                    transform={`rotate(${DIAL.start + DIAL.sweep * ratio} ${DIAL.cx} ${DIAL.cy})`}
                  >
                    <line
                      x1={DIAL.cx - 10}
                      y1={DIAL.cy}
                      x2={DIAL.cx + DIAL.r - 26}
                      y2={DIAL.cy}
                      stroke="#f2d27e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                  <circle
                    cx={DIAL.cx}
                    cy={DIAL.cy}
                    r="7"
                    fill="#0d0e10"
                    stroke="#f2d27e"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute inset-x-0 top-[83%] -translate-y-1/2 font-display text-[clamp(1.1rem,2.6vw,2.25rem)] font-medium leading-none tracking-[-0.03em] text-white">
                  {s.prefix}
                  <span data-count={s.value}>{s.value}</span>
                  <span className="text-[0.55em] text-[color:var(--gold-light)]">{s.suffix}</span>
                </div>
              </dd>
              <dd
                aria-hidden
                className="mt-1 max-w-[15rem] text-xs leading-snug text-muted-foreground md:mt-2 md:text-base"
              >
                {s.label}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

export type Story = { title: string; copy: string; imageKey: ImageKey; to?: string };

const STORIES: Story[] = [
  {
    title: "Airport transfers",
    copy: `Flight monitoring, luggage assistance and calm arrivals across ${CONTACT.serviceRegion}. Curbside or meet-and-greet, ready when you land.`,
    imageKey: "airport",
    to: "/airport",
  },
  {
    title: "Corporate travel",
    copy: "Executive transfers for meetings, roadshows and VIP guests. Punctuality, privacy, and a chauffeur who represents your standard.",
    imageKey: "corporateStory",
    to: "/corporate",
  },
  {
    title: "Events",
    copy: "Coordinated vehicles for stadium nights, galas and private occasions, planned to the minute.",
    imageKey: "events",
    to: "/events",
  },
  {
    title: "Groups",
    copy: "Sprinters and coaches for teams, weddings and conferences, with one point of contact for the whole group.",
    imageKey: "groupCoachStory",
    to: "/services",
  },
];

/** Sticky photo beside scrolling text. Pages pass their own steps or use cases. */
export function ServiceStories({
  stories = STORIES,
  eyebrow = "What we do",
  id = "stories",
}: {
  stories?: Story[];
  eyebrow?: string;
  id?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".story-block", root).forEach((block, i) => {
        ScrollTrigger.create({
          trigger: block,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id={id} className="bg-background py-[var(--section-space)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        <p className="eyebrow">{eyebrow}</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {stories.map((s, i) => {
              const img = IMAGES[s.imageKey];
              return (
                <article
                  key={s.title}
                  className={`story-block border-t border-border py-10 transition-opacity duration-500 lg:flex lg:min-h-[62svh] lg:flex-col lg:justify-center lg:py-0 ${
                    active === i ? "lg:opacity-100" : "lg:opacity-35"
                  }`}
                >
                  <p className="text-sm font-semibold text-muted-foreground">0{i + 1}</p>
                  <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.85rem)] leading-[0.92] tracking-[-0.045em] text-foreground">
                    {s.title}
                  </h2>
                  <p className="mt-5 max-w-md text-lg leading-[1.6] text-muted-foreground">
                    {s.copy}
                  </p>
                  {s.to && (
                    <Link
                      to={s.to}
                      className="group mt-6 inline-flex items-center gap-2 font-semibold text-foreground"
                    >
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  )}
                  {/* Phones: the photo sits with its story. */}
                  <div className="relative mt-8 aspect-[4/3] overflow-hidden lg:hidden">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: img.objectPositionMobile }}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop: one sticky frame; photos cross-fade with the story in view. */}
          <div className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-height)+2rem)] h-[calc(100svh-var(--header-height)-4rem)] overflow-hidden">
              {stories.map((s, i) => {
                const img = IMAGES[s.imageKey];
                const on = active === i;
                return (
                  <img
                    key={s.title}
                    src={img.src}
                    alt={on ? img.alt : ""}
                    aria-hidden={!on}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none"
                    style={{
                      objectPosition: img.objectPositionDesktop,
                      opacity: on ? 1 : 0,
                      transform: on ? "scale(1)" : "scale(1.06)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
