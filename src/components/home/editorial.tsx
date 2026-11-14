import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CONTACT, FLEET_VEHICLES, PARTNERS, SERVICE_AREA_GROUPS } from "@/lib/site-data";
import { IMAGES, type ImageKey } from "@/lib/image-map";
import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/motion";

/*
 * Home page scroll sections for the 2026-11 editorial redesign. Native
 * scrolling throughout (no pinning, no smooth-scroll library):
 *
 * - PartnersMarquee: one slow 45s logo loop (CSS, pauses on hover).
 * - StatsBand: real figures count up once when they enter the view.
 * - FleetStack: vehicle cards are sticky and stack; each new card slides
 *   over the previous one, which recedes and dims.
 * - ServiceStories: a sticky photo beside scrolling text; the photo
 *   cross-fades to match the story being read.
 *
 * Everything renders complete and readable without JavaScript or with
 * reduced motion; the effects only add movement.
 */

/** Equal visual weight: wide wordmarks and tall emblems get the same area. */
function logoWidth(w: number, h: number) {
  const ar = w / h;
  const lw = Math.sqrt(3400 * ar);
  return Math.round(lw * Math.min(1, 168 / lw, 60 / (lw / ar)));
}

function MarqueeRow({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className={`flex ${duplicate ? "marquee-dup" : ""}`} aria-hidden={duplicate || undefined}>
      {PARTNERS.map((p) => (
        <li
          key={p.name}
          className="flex h-20 w-48 shrink-0 items-center justify-center px-6 md:w-60"
        >
          <img
            src={p.logo}
            alt={duplicate ? "" : p.name}
            width={p.w}
            height={p.h}
            loading="lazy"
            decoding="async"
            className="h-auto max-w-full object-contain"
            style={{ width: logoWidth(p.w, p.h) }}
          />
        </li>
      ))}
    </ul>
  );
}

export function PartnersMarquee() {
  return (
    <section
      aria-label="Airline and corporate partners"
      className="border-b border-border bg-background py-10"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        <p className="eyebrow">Trusted by airline and corporate partners</p>
      </div>
      <div className="marquee mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="marquee-track">
          <MarqueeRow />
          {/* Second copy for the seamless loop; hidden from assistive tech. */}
          <MarqueeRow duplicate />
        </div>
      </div>
    </section>
  );
}

const CITY_COUNT = SERVICE_AREA_GROUPS.reduce((n, g) => n + g.cities.length, 0);
const STATS = [
  { value: 24, suffix: "/7", label: "Dispatch, every day of the year" },
  { value: FLEET_VEHICLES.length, suffix: "", label: "Vehicle classes, sedan to motor coach" },
  { value: CITY_COUNT, suffix: "", label: "Dallas–Fort Worth communities served" },
  { value: PARTNERS.length, suffix: "", label: "Airline and corporate partners" },
];

export function StatsBand() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el, i) => {
        const end = Number(el.dataset.count);
        const box = { v: 0 };
        el.textContent = "0";
        gsap.to(box, {
          v: end,
          duration: 1.6,
          delay: i * 0.08,
          ease: EASE,
          onUpdate: () => {
            el.textContent = String(Math.round(box.v));
          },
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="bg-[color:var(--bone)] py-[var(--section-space)]">
      <dl className="mx-auto grid max-w-[var(--container-max)] gap-x-10 gap-y-12 px-[var(--page-gutter)] sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="border-t border-foreground pt-5">
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.9] tracking-[-0.05em] text-foreground">
              <span data-count={s.value}>{s.value}</span>
              {s.suffix}
            </dd>
            <dd
              aria-hidden
              className="mt-3 max-w-[16rem] text-base leading-snug text-muted-foreground"
            >
              {s.label}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const vehicle = (id: string) => FLEET_VEHICLES.find((v) => v.id === id)!;
const FLEET_CARDS: { id: string; title: string; desc: string; meta: string; imageKey: ImageKey }[] =
  [
    {
      id: "sedan",
      title: "Executive Sedan",
      desc: "Mercedes-Benz S-Class for discreet business travel and private arrivals.",
      meta: `${vehicle("sedan").pax} passengers · ${vehicle("sedan").bags} bags · ${vehicle("sedan").priceLabel}`,
      imageKey: "fleetSedan",
    },
    {
      id: "suv",
      title: "Executive SUV",
      desc: "Cadillac Escalade with captain seating, extended legroom and room for luggage.",
      meta: `${vehicle("suv").pax} passengers · ${vehicle("suv").bags} bags · ${vehicle("suv").priceLabel}`,
      imageKey: "fleetSuv",
    },
    {
      id: "sprinter",
      title: "Executive Sprinter",
      desc: "Mercedes-Benz Sprinter for corporate groups, delegations and VIP parties.",
      meta: `${vehicle("sprinter").pax} passengers · ${vehicle("sprinter").bags} bags · ${vehicle("sprinter").priceLabel}`,
      imageKey: "fleetSprinter",
    },
    {
      id: "coach",
      title: "Executive Mini Coach",
      desc: "Right-sized group transportation for weddings, shuttles and corporate parties.",
      meta: `${vehicle("coachMini").pax} passengers · ${vehicle("coachMini").priceLabel}`,
      imageKey: "fleetCoachJourney",
    },
  ];

export function FleetStack() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card", root);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        // As the next card slides up over this one, this one recedes.
        gsap
          .timeline({
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true },
          })
          .to(card.querySelector(".stack-inner"), { scale: 0.92, ease: "none" }, 0)
          .to(card.querySelector(".stack-dim"), { opacity: 0.6, ease: "none" }, 0);
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="fleet-journey"
      className="relative bg-[color:var(--surface-black)] pb-[var(--section-space)] pt-[var(--section-space)]"
    >
      <div className="mx-auto mb-12 flex max-w-[var(--container-max)] flex-col gap-6 px-[var(--page-gutter)] md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-[clamp(2.75rem,6.5vw,6rem)] leading-[0.9] tracking-[-0.05em] text-foreground">
          The fleet.
          <span className="block text-gold-gradient">Chosen for the trip.</span>
        </h2>
        <Link
          to="/fleet"
          className="group inline-flex min-h-[48px] items-center gap-2 self-start rounded-full border border-foreground/25 px-6 py-3 text-[0.95rem] font-semibold text-foreground transition-colors duration-200 hover:border-foreground md:self-auto"
        >
          See every vehicle
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      <ol className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        {FLEET_CARDS.map((c, i) => {
          const img = IMAGES[c.imageKey];
          return (
            <li
              key={c.id}
              className="stack-card sticky mb-6 h-[min(76svh,720px)] last:mb-0"
              style={{ top: `calc(var(--header-height) + 1rem + ${i * 14}px)` }}
            >
              <div className="stack-inner relative h-full origin-top overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: img.objectPositionDesktop }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent"
                  aria-hidden
                />
                <div
                  className="stack-dim pointer-events-none absolute inset-0 bg-black opacity-0"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 grid gap-4 p-6 text-white md:grid-cols-[1fr_auto] md:items-end md:p-10">
                  <div>
                    <p className="text-sm font-semibold text-white/70">
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(FLEET_CARDS.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.92] tracking-[-0.045em]">
                      {c.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
                      {c.desc}
                    </p>
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--gold-light)]">
                    {c.meta}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const STORIES: { title: string; copy: string; imageKey: ImageKey; to: string }[] = [
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

export function ServiceStories() {
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
    <section ref={rootRef} id="stories" className="bg-background py-[var(--section-space)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        <p className="eyebrow">What we do</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {STORIES.map((s, i) => {
              const img = IMAGES[s.imageKey];
              return (
                <article
                  key={s.title}
                  className={`story-block border-t border-border py-10 transition-opacity duration-500 lg:flex lg:min-h-[62svh] lg:flex-col lg:justify-center lg:py-0 ${
                    active === i ? "lg:opacity-100" : "lg:opacity-35"
                  }`}
                >
                  <p className="text-sm font-semibold text-muted-foreground">0{i + 1}</p>
                  <h2 className="mt-3 font-display text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[0.92] tracking-[-0.045em] text-foreground">
                    {s.title}
                  </h2>
                  <p className="mt-5 max-w-md text-lg leading-[1.6] text-muted-foreground">
                    {s.copy}
                  </p>
                  <Link
                    to={s.to}
                    className="group mt-6 inline-flex items-center gap-2 font-semibold text-foreground"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
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
              {STORIES.map((s, i) => {
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
