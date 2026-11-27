import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { IMAGES, type ImageKey } from "@/lib/image-map";
import { FLEET_VEHICLES } from "@/lib/site-data";
import { useParallax } from "@/lib/parallax";

/**
 * "The showroom": one vehicle at a time under a spotlight on a black floor,
 * the class name set large, the facts on a single gold-hairline row. Every
 * figure comes straight from FLEET_VEHICLES (verified against the booking
 * system), nothing is restated here.
 */

// The branded black-and-gold coach photo is the stronger showroom picture for
// the Mini Coach than its daylight side profile.
const SHOWROOM_IMAGE: Partial<Record<string, ImageKey>> = {
  coachMini: "pillarFleetCoach",
};

const pad = (n: number) => String(n).padStart(2, "0");

export function Showroom() {
  const [i, setIndex] = useState(0);
  const [prev, setPrev] = useState(-1);
  const ref = useRef<HTMLElement>(null);
  useParallax(ref);

  const total = FLEET_VEHICLES.length;
  const v = FLEET_VEHICLES[i];
  const setI = (n: number) => {
    if (n === i) return;
    setPrev(i);
    setIndex(n);
  };
  const go = (d: number) => setI((i + d + total) % total);

  return (
    <section
      ref={ref}
      aria-label="The showroom"
      className="band-dark relative isolate overflow-hidden bg-[#060708] py-[clamp(4rem,8vw,7rem)] text-white"
    >
      {/* Spotlight cone + floor glow */}
      <div className="showroom-spot pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="section-index">02 · The showroom</p>
            <h2
              data-no-type
              className="mt-5 font-display text-[clamp(1.9rem,3.4vw,3.2rem)] font-normal leading-[0.95] tracking-[-0.02em]"
            >
              One vehicle.
              <br />
              <span className="italic text-[color:var(--gold-light)]">Every detail lit.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="numeral-gold text-lg tabular-nums" aria-live="polite">
              {pad(i + 1)} <span className="text-white/35">/ {pad(total)}</span>
            </span>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous vehicle"
              className="showroom-arrow"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next vehicle"
              className="showroom-arrow"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Stage */}
        <div className="showroom-stage relative mt-10 aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/9]">
          <div className="absolute inset-0 overflow-hidden">
            <div data-parallax="10" className="absolute inset-[-6%_0]">
              {FLEET_VEHICLES.map((x, n) => {
                // Only the current photo and the one fading out are mounted,
                // so the stage never holds seven full-size layers at once.
                if (n !== i && n !== prev) return null;
                const img = IMAGES[SHOWROOM_IMAGE[x.id] ?? x.imageKey];
                return (
                  <img
                    key={x.id}
                    src={img.src}
                    alt={n === i ? `${x.name}, ${x.model}` : ""}
                    aria-hidden={n !== i}
                    loading="lazy"
                    decoding="async"
                    className={`showroom-photo absolute inset-0 h-full w-full object-cover ${
                      n === i ? "is-on" : ""
                    }`}
                    style={{ objectPosition: img.objectPositionDesktop }}
                  />
                );
              })}
            </div>
          </div>
          {/* Name, set large across the lower edge of the stage */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 md:p-10">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.32em] text-[color:var(--gold-light)]">
              {v.model}
            </p>
            <p
              key={v.id}
              className="showroom-name mt-2 font-display text-[clamp(2.4rem,7vw,6.5rem)] font-light leading-[0.9] tracking-[-0.03em]"
            >
              {v.name}
            </p>
          </div>
        </div>

        {/* Specs on one hairline row */}
        <dl className="showroom-specs mt-8 grid grid-cols-2 md:grid-cols-4">
          <div>
            <dt>Passengers</dt>
            <dd className="numeral-gold">{v.pax}</dd>
          </div>
          <div>
            <dt>Luggage</dt>
            <dd className="numeral-gold">{v.bags ?? "—"}</dd>
          </div>
          <div>
            <dt>Rate</dt>
            <dd className="numeral-gold">{v.priceLabel}</dd>
          </div>
          <div>
            <dt>In the cabin</dt>
            <dd className="!font-sans !text-sm !leading-relaxed text-white/75">
              {v.features.slice(0, 2).join(" · ")}
            </dd>
          </div>
        </dl>

        {/* Class picker */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
          <ol className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Vehicle classes">
            {FLEET_VEHICLES.map((x, n) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-current={n === i || undefined}
                  className={`showroom-tab ${n === i ? "is-on" : ""}`}
                >
                  {x.name}
                </button>
              </li>
            ))}
          </ol>
          <Link
            to="/book"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold-gradient px-6 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
          >
            {v.status === "quote_only" ? "Request a quote" : `Reserve the ${v.name}`}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
