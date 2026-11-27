import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { IMAGES, type ImageKey } from "@/lib/image-map";
import { prefersReducedMotion } from "@/lib/motion";
import { useParallax } from "@/lib/parallax";

/**
 * One full-screen band with four slides (the fleet, the chauffeur, the
 * hours, the standard). The photo cross-fades, the words rise in, a numbered
 * rail shows where you are and how long until the next slide. It turns by
 * itself only while it is on screen and nobody is pointing at it; reduced
 * motion keeps it still. Replaces four separate long sections.
 */

type Slide = {
  kicker: string;
  title: [string, string];
  copy: string;
  cta: { label: string; to: string };
  imageKey: ImageKey;
};

const SLIDES: Slide[] = [
  {
    kicker: "The fleet",
    title: ["Seven classes.", "One standard."],
    copy: "From the Executive Sedan to the 56-seat motor coach, every vehicle is maintained and prepared before dispatch.",
    cta: { label: "Explore the fleet", to: "/fleet" },
    imageKey: "pillarFleetCoach",
  },
  {
    kicker: "The chauffeur",
    title: ["Presence", "without noise."],
    copy: "Formal presentation, white-glove door service and a cabin prepared before you arrive.",
    cta: { label: "About LCT", to: "/about" },
    imageKey: "chauffeur",
  },
  {
    kicker: "Always on",
    title: ["Around", "the clock."],
    copy: "Dispatch answers day and night: early departures, late arrivals and last-minute changes.",
    cta: { label: "Book a ride", to: "/book" },
    imageKey: "rearview",
  },
  {
    kicker: "Peace of mind",
    title: ["Quiet exactness.", "Every mile."],
    copy: "Flights tracked, 60 minutes of free airport waiting, and one point of contact for every booking.",
    cta: { label: "Our services", to: "/services" },
    imageKey: "valueCabinExperience",
  },
];

const SLIDE_MS = 6000;

export function PillarsSlider() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const [inView, setInView] = useState(false);
  const [hold, setHold] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const still = useRef(false);
  useParallax(ref);

  useEffect(() => {
    still.current = prefersReducedMotion();
    const el = ref.current;
    if (!el || still.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const go = inView && !hold && !still.current;
    setRunning(go);
    if (!go) return;
    const t = window.setTimeout(() => setActive((n) => (n + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [inView, hold, active]);

  return (
    <section
      ref={ref}
      aria-roledescription="carousel"
      aria-label="Why LCT Universal"
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
      className="band-dark relative isolate flex min-h-[480px] overflow-hidden md:min-h-[min(100svh,860px)] bg-[#0d0e10]"
    >
      <div data-parallax="10" className="absolute inset-x-0 inset-y-[-7%] -z-20">
        {SLIDES.map((s, i) => {
          const img = IMAGES[s.imageKey];
          return (
            <img
              key={s.imageKey}
              src={img.src}
              alt=""
              loading="lazy"
              decoding="async"
              className={`pillar-photo absolute inset-0 h-full w-full object-cover ${
                i === active ? "is-on" : ""
              }`}
              style={{ objectPosition: img.objectPositionDesktop }}
            />
          );
        })}
      </div>
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/55 to-black/10 max-md:bg-gradient-to-t max-md:from-black/95 max-md:via-black/60 max-md:to-black/20"
        aria-hidden
      />

      <div className="mx-auto flex w-full max-w-[var(--container-max)] items-end gap-6 px-[var(--page-gutter)] py-14 md:items-center md:gap-12 md:py-20">
        {/* Numbered rail */}
        <ol className="hidden shrink-0 flex-col gap-4 md:flex" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <li key={s.kicker}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${i + 1}: ${s.kicker}`}
                aria-current={i === active || undefined}
                className={`flex items-center gap-3 text-sm font-bold tabular-nums transition-colors duration-200 ${
                  i === active
                    ? "text-[color:var(--gold-light)]"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                0{i + 1}
                <span className="relative h-px w-10 overflow-hidden bg-white/20" aria-hidden>
                  {i === active ? (
                    <span
                      key={`${active}-${running}`}
                      className={`pillar-progress absolute inset-0 bg-[color:var(--gold-light)] ${
                        running ? "is-running" : ""
                      }`}
                      style={{ animationDuration: `${SLIDE_MS}ms` }}
                    />
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="relative grid w-full max-w-2xl">
          {SLIDES.map((s, i) => (
            <div
              key={s.kicker}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}`}
              aria-hidden={i !== active}
              inert={i !== active}
              className={`pillar-copy [grid-area:1/1] ${i === active ? "is-on" : ""}`}
            >
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-[color:var(--gold-light)]">
                {s.kicker}
              </p>
              <h2
                data-no-type
                className="mt-4 font-display text-[clamp(1.9rem,3.6vw,3.4rem)] font-normal leading-[0.95] tracking-[-0.025em]"
              >
                {s.title[0]}
                <br />
                {s.title[1]}
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
                {s.copy}
              </p>
              <Link
                to={s.cta.to}
                className="group mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-gold-gradient px-6 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
              >
                {s.cta.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          ))}

          {/* Phone dots */}
          <div className="mt-8 flex gap-2 md:hidden">
            {SLIDES.map((s, i) => (
              <button
                key={s.kicker}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${i + 1}: ${s.kicker}`}
                aria-current={i === active || undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-8 bg-[color:var(--gold-light)]" : "w-3 bg-white/35"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
