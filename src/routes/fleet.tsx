import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { SectionHeading } from "@/components/section-heading";
import { CheckCircle2, ArrowRight, Phone } from "lucide-react";
import { FLEET_VEHICLES, CONTACT, type FleetVehicle } from "@/lib/site-data";
import { IMAGES } from "@/lib/image-map";
import { ReservationPanel } from "@/components/booking/reservation-panel";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { pageMeta } from "@/lib/seo";
import { track } from "@/lib/tracking";
import { StatsBand } from "@/components/home/editorial";
import { FLEET_STATS } from "@/lib/page-editorial";
import { TrustedBy } from "@/components/trusted-by";

const FLEET_INQUIRY_ID = "fleet-inquiry";

/** Exact CTA copy per vehicle, per the approved conversion-flow spec — not a generic template. */
const CTA_LABEL: Record<string, string> = {
  sedan: "Book This Vehicle",
  firstClassSedan: "Book This Vehicle",
  suv: "Book This Vehicle",
  luxurySuv: "Book This Vehicle",
  sprinter: "Request a Sprinter Quote",
  coachMini: "Request a Mini Coach Quote",
  coachLarge: "Request a Coach Quote",
};

/** Short supporting line per vehicle, placed right under the name — approved copy, not paragraphs. */
const VEHICLE_BLURB: Record<string, string> = {
  sedan: "Refined point-to-point travel for executives, airport transfers and private rides.",
  firstClassSedan: "The same S-Class, elevated — priority white-glove service for two.",
  suv: "Premium space for families, executives and luggage-heavy airport travel.",
  luxurySuv: "The Escalade at our premium service tier, for clients who want the very best.",
  sprinter: "Private group transportation with executive comfort and flexible capacity.",
  coachMini: "Right-sized group transportation for weddings, shuttles and corporate parties.",
  coachLarge: "Built for conventions, large weddings and coordinated large-scale group travel.",
};

function ctaLabel(v: FleetVehicle) {
  return (
    CTA_LABEL[v.id] ?? (v.status === "bookable" ? "Book This Vehicle" : `Request a ${v.name} Quote`)
  );
}

/**
 * Shared CTA behavior for both the in-chapter buttons and the sticky bar.
 * Bookable vehicles go straight to /book (MyLimoBiz). Quote-only vehicles
 * never claim to be directly bookable — they scroll to the on-page
 * reservation block, which also offers call, WhatsApp and email for quotes.
 */
function useVehicleQuote() {
  return (v: FleetVehicle) => {
    track.fleetVehicleQuoteClick(v.id);
    document
      .getElementById(FLEET_INQUIRY_ID)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };
}

/**
 * TanStack Router's `<Link>` composes a user-supplied `onClick` with its own
 * internal navigation handler — but empirically (verified with a Playwright
 * repro on this exact page) that composed handler silently never invokes the
 * caller's `onClick` here, while `onClick` on a plain `<button>`/`<a>`
 * elsewhere on this same page fires normally. `onMouseDown` isn't part of
 * Link's composed prop set at all, so it passes straight through untouched
 * and fires reliably — used here specifically to guarantee the
 * `fleet_vehicle_book_click` event actually reaches analytics.
 */
function trackBookMouseDown(v: FleetVehicle) {
  return (e: ReactMouseEvent) => {
    if (e.button !== 0) return; // primary button only — not right/middle-click
    track.fleetVehicleBookClick(v.id);
  };
}

export const Route = createFileRoute("/fleet")({
  head: () =>
    pageMeta({
      title: "Fleet — Sedans, SUVs, Sprinters & Coaches — LCT Universal",
      description:
        "Executive Sedan, First Class Sedan, Executive SUV, Luxury SUV, Mercedes-Benz Sprinter, Executive Mini Coach and Executive Coach. Verified capacities and live rates from LCT Universal in Dallas–Fort Worth.",
      ogTitle: "Fleet — LCT Universal",
      ogDescription: "Executive vehicles with verified capacities.",
      path: "/fleet",
    }),
  component: Fleet,
});

function VehicleCta({
  v,
  onQuote,
  showDispatchCall,
}: {
  v: FleetVehicle;
  onQuote: (vehicle: FleetVehicle) => void;
  /** Only the Coach chapter gets the secondary "Call Dispatch" action, per the approved spec. */
  showDispatchCall?: boolean;
}) {
  const bookable = v.status === "bookable";
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      {bookable ? (
        <Link
          to="/book"
          data-cursor="book"
          onMouseDown={trackBookMouseDown(v)}
          className="group inline-flex w-fit items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-semibold transition"
        >
          {ctaLabel(v)}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      ) : (
        <button
          type="button"
          data-cursor="explore"
          onClick={() => onQuote(v)}
          className="group inline-flex w-fit items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-semibold transition"
        >
          {ctaLabel(v)}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </button>
      )}
      {showDispatchCall && (
        <a
          href={CONTACT.phoneTel}
          onClick={() => track.fleetCallDispatchClick()}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-champagne/40 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-champagne hover:text-champagne"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call Dispatch
        </a>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 py-3">
      <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-xl text-gold-gradient">{value}</span>
    </div>
  );
}

/**
 * Restrained sticky conversion bar — desktop and mobile — that updates to
 * the vehicle currently in view. Replaces the generic sitewide MobileBookBar
 * on this page (see `MobileBookBar`'s own /fleet check) rather than stacking
 * a second bottom bar; `FloatingActions` shifts up to clear it (see that
 * component's own /fleet check) so it never overlaps the WhatsApp/phone FABs.
 */
function FleetConversionBar({
  vehicle,
  onQuote,
}: {
  vehicle: FleetVehicle;
  onQuote: (v: FleetVehicle) => void;
}) {
  const bookable = vehicle.status === "bookable";
  // Compact label — the vehicle name is already shown beside it, so the full
  // "Request a Sprinter Quote" would be redundant here.
  const label = bookable ? "Book This Vehicle" : "Request a Quote";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] max-lg:hidden"
      style={{ boxShadow: "0 -8px 24px -8px rgba(0,0,0,0.35)" }}
    >
      <div className="mx-auto flex h-16 max-w-[var(--container-max)] items-center justify-between gap-3 px-4 lg:px-10">
        <div className="min-w-0">
          <div className="truncate font-display text-sm text-foreground md:text-base">
            {vehicle.name}
          </div>
          <div className="truncate text-[0.7rem] text-muted-foreground">
            {vehicle.pax} passengers · {vehicle.priceLabel}
          </div>
        </div>
        {bookable ? (
          <Link
            to="/book"
            data-cursor="book"
            onMouseDown={trackBookMouseDown(vehicle)}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-gold-gradient px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {label}
          </Link>
        ) : (
          <button
            type="button"
            data-cursor="explore"
            onClick={() => onQuote(vehicle)}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-gold-gradient px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {label}
          </button>
        )}
      </div>
    </div>
  );
}

function Fleet() {
  const heroImg = IMAGES.fleetHero;

  const handleQuote = useVehicleQuote();

  const [activeId, setActiveId] = useState<string>(FLEET_VEHICLES[0].id);
  const rootRef = useRef<HTMLOListElement>(null);

  // Active-vehicle tracking for the sticky conversion bar — functional, not
  // decorative, so it runs identically regardless of reduced-motion.
  useLayoutEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-vehicle-chapter]"));
    if (!cards.length) return;
    // Sticky cards stay on screen underneath the one stacked on top, so the
    // active vehicle is simply the last card whose top has reached the
    // middle of the viewport — correct in both scroll directions.
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let active = cards[0];
      for (const c of cards) if (c.getBoundingClientRect().top <= mid) active = c;
      const id = active.getAttribute("data-vehicle-chapter");
      if (id) setActiveId(id);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Desktop: cards are sticky and stack; as the next one slides over, the
  // previous recedes and dims (same motion as the home page fleet).
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".fleet-card", root);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap
          .timeline({
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 25%", scrub: true },
          })
          .to(card.querySelector(".stack-inner"), { scale: 0.93, ease: "none" }, 0)
          .to(card.querySelector(".stack-dim"), { opacity: 0.55, ease: "none" }, 0);
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="The Fleet"
        title="Seven classes. One standard."
        description="Every LCT Universal vehicle is maintained and prepared before dispatch, from the Executive Sedan to the 56-seat motor coach."
        image={heroImg.src}
        imagePosition={heroImg.objectPositionDesktop}
        imagePositionMobile={heroImg.objectPositionMobile}
      />

      <StatsBand stats={FLEET_STATS} />

      <section className="band-dark bg-[color:var(--band)] pb-[var(--section-space)] pt-[var(--section-space)]">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8 px-[var(--page-gutter)] lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-display text-[clamp(1.9rem,3.4vw,3.1rem)] leading-[0.95]">
            Choose your vehicle.
          </h2>
          <nav
            aria-label="Jump to a vehicle"
            className="scrollbar-none -mx-[var(--page-gutter)] flex gap-2 overflow-x-auto px-[var(--page-gutter)] max-lg:[&>a]:shrink-0 max-lg:[&>a]:whitespace-nowrap lg:mx-0 lg:flex-wrap lg:px-0"
          >
            {FLEET_VEHICLES.map((v) => (
              <a
                key={v.id}
                href={`#vehicle-${v.id}`}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  activeId === v.id
                    ? "border-[color:var(--gold-light)] bg-[color:var(--gold-light)] text-[#0d0e10]"
                    : "border-white/20 text-white/80 hover:border-white/60 hover:text-white"
                }`}
              >
                {v.name}
              </a>
            ))}
          </nav>
        </div>

        <ol
          ref={rootRef}
          className="mx-auto mt-12 max-w-[var(--container-max)] space-y-6 px-[var(--page-gutter)]"
        >
          {FLEET_VEHICLES.map((v, i) => {
            const img = IMAGES[v.imageKey];
            const bookable = v.status === "bookable";
            return (
              <li
                key={v.id}
                id={`vehicle-${v.id}`}
                data-vehicle-chapter={v.id}
                className="fleet-card scroll-mt-[calc(var(--header-height)+1.5rem)] lg:sticky"
                style={{ top: `calc(var(--header-height) + 1rem + ${i * 12}px)` } as CSSProperties}
              >
                <div className="stack-inner relative grid origin-top overflow-hidden rounded-[28px] bg-[#111215] ring-1 ring-white/10 lg:h-[min(80svh,740px)] lg:grid-cols-[1.45fr_1fr]">
                  <div className="relative aspect-[2/1] md:aspect-[16/10] lg:aspect-auto">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: img.objectPositionDesktop }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
                      aria-hidden
                    />
                    <span className="absolute left-5 top-5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(FLEET_VEHICLES.length).padStart(2, "0")}
                    </span>
                    <span
                      className={`absolute right-5 top-5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        bookable
                          ? "bg-[#25d366] text-[#06210f]"
                          : "bg-[color:var(--gold-light)] text-[#0d0e10]"
                      }`}
                    >
                      {bookable ? "Book online" : "Quote only"}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center p-7 md:p-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                      {v.model}
                    </p>
                    <h3 className="mt-3 font-display text-[clamp(1.6rem,2.5vw,2.4rem)] font-normal leading-[0.95] tracking-[-0.02em] text-[#f4efe6]">
                      {v.name}
                    </h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
                      {VEHICLE_BLURB[v.id]}
                    </p>
                    <dl className="mt-7 grid grid-cols-3 gap-3">
                      {[
                        { k: "Passengers", val: v.pax },
                        { k: "Luggage", val: v.bags ?? "Ask us" },
                        { k: "Rate", val: v.priceLabel },
                      ].map((s) => (
                        <div
                          key={s.k}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                        >
                          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/50">
                            {s.k}
                          </dt>
                          <dd className="mt-1 text-sm font-bold text-white md:text-base">
                            {s.val}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {v.features.length > 0 && (
                      <ul className="mt-6 hidden gap-2 text-sm text-white/75 md:grid">
                        {v.features.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-light)]"
                              aria-hidden
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <VehicleCta v={v} onQuote={handleQuote} showDispatchCall={!bookable} />
                  </div>
                  <div
                    className="stack-dim pointer-events-none absolute inset-0 bg-black opacity-0"
                    aria-hidden
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <TrustedBy />

      <section id={FLEET_INQUIRY_ID} className="scroll-mt-24 border-t border-border py-24">
        <div className="mx-auto max-w-3xl px-[var(--page-gutter)]">
          <SectionHeading
            align="center"
            eyebrow="Reservations"
            title="Reserve a vehicle."
            description="Start here and choose your vehicle on the next step. For Sprinters and coaches, talk to dispatch for a quote."
          />
          <div className="mt-12">
            <ReservationPanel subject="Fleet enquiry" />
          </div>
        </div>
      </section>

      <FleetConversionBar
        vehicle={FLEET_VEHICLES.find((v) => v.id === activeId) ?? FLEET_VEHICLES[0]}
        onQuote={handleQuote}
      />
    </SiteLayout>
  );
}
