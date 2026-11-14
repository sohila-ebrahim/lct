import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Phone, Plane, Wine } from "lucide-react";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { typeHeadline } from "@/lib/typing";

const PATHS = [
  { to: "/airport", title: "Airport transfers", line: "DFW and Love Field", Icon: Plane },
  { to: "/corporate", title: "Corporate accounts", line: "Roadshows, VIP guests", Icon: Briefcase },
  { to: "/events", title: "Events & hourly", line: "Galas, stadiums, weddings", Icon: Wine },
] as const;

/** The intro plays once per full page load (not on in-site navigation back home). */
let introPlayed = false;

function canRunIntro() {
  if (introPlayed || prefersReducedMotion()) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !conn?.saveData;
}

/**
 * Cinematic hero. When the site opens, the fleet's real black Escalade (a
 * studio photograph with the background removed, src/lib/drive-by-photo.ts)
 * drives fast across the page itself from right to left; as it clears the
 * middle, the headline types in (caret, then letter by letter) in the
 * logo's gold. The quick paths are styled as car key fobs. Reduced motion
 * and Save-Data get the finished hero straight away.
 */
export function CinematicHero() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hero = IMAGES.hero;
  const heroMobile = IMAGES.heroMobile;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) return;
    if (prefersReducedMotion()) {
      void typeHeadline(title);
      return;
    }
    const { gsap } = ensureGsap();
    let cancelDrive: (() => void) | null = null;
    let layer: HTMLDivElement | null = null;
    let fallback = 0;
    let typeTimer = 0;
    let disposed = false;
    let started = false;

    const ctx = gsap.context(() => {
      gsap.set(title, { autoAlpha: 0 });
      gsap.set(".hero-rise", { autoAlpha: 0, y: 24 });
      gsap.fromTo(
        ".hero-photo-img",
        { scale: 1.08 },
        { scale: 1, duration: 6, ease: "power1.out" },
      );
    }, root);

    const begin = () => {
      if (started || disposed) return;
      started = true;
      introPlayed = true;
      gsap.set(title, { autoAlpha: 1 });
      void typeHeadline(title);
      ctx.add(() => {
        gsap.to(".hero-rise", {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.08,
          delay: 0.5,
          ease: EASE,
        });
      });
    };

    const dropLayer = () => {
      layer?.parentNode?.removeChild(layer);
      layer = null;
    };

    if (!canRunIntro()) {
      begin();
    } else {
      // Never hold the hero back: if the photo is slow to arrive, skip the car.
      fallback = window.setTimeout(begin, 3000);
      import("@/lib/drive-by-photo")
        .then(async ({ preloadDriveByCar, runPhotoDriveBy }) => {
          const ready = await preloadDriveByCar(2500);
          if (disposed || started) return;
          if (!ready) return begin();
          window.clearTimeout(fallback);
          // Marked only once the car really starts (dev StrictMode runs this
          // effect twice; the first, cancelled run must not use up the intro).
          introPlayed = true;
          layer = document.createElement("div");
          layer.setAttribute("aria-hidden", "true");
          layer.style.cssText = "position:fixed;inset:0;z-index:45;pointer-events:none";
          document.body.appendChild(layer);
          // The headline starts typing as the car clears the middle.
          typeTimer = window.setTimeout(begin, 1000);
          cancelDrive = runPhotoDriveBy(layer, {
            onDone: () => {
              dropLayer();
              begin();
            },
          });
        })
        .catch(begin);
    }

    return () => {
      disposed = true;
      window.clearTimeout(fallback);
      window.clearTimeout(typeTimer);
      cancelDrive?.();
      dropLayer();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="band-dark relative isolate min-h-[100svh] overflow-hidden bg-[color:var(--band)]"
    >
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 767px)" srcSet={heroMobile.src} />
          <img
            src={hero.src}
            alt={hero.alt}
            className="hero-photo-img absolute inset-0 h-full w-full object-cover [object-position:var(--hero-pos-m)] md:[object-position:var(--hero-pos-d)]"
            style={
              {
                "--hero-pos-m": heroMobile.objectPositionMobile,
                "--hero-pos-d": hero.objectPositionDesktop,
              } as CSSProperties
            }
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-[2] mx-auto flex min-h-[100svh] max-w-[var(--container-max)] flex-col justify-end px-[var(--page-gutter)] pb-8 pt-32 md:pb-12">
        <p className="hero-rise text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Executive chauffeured transportation · Dallas–Fort Worth
        </p>
        <h1
          ref={titleRef}
          data-no-type
          className="mt-5 max-w-5xl font-display text-[clamp(3.2rem,9.5vw,9.5rem)] leading-[0.88] tracking-[-0.05em]"
        >
          One fleet.
          <br />
          Every occasion.
        </h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="hero-rise max-w-md text-lg leading-[1.6] text-white/75">
            Executive sedans, SUVs, Sprinters and coaches with professional chauffeurs, dispatched
            around the clock from our Irving office.
          </p>
          <div className="hero-rise flex flex-wrap items-center gap-3">
            <Link
              to="/book"
              className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-gold-gradient px-6 text-base font-semibold transition-opacity duration-200 hover:opacity-90"
            >
              Book your ride
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href={CONTACT.phoneTel}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-base font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>

        {/* Quick paths as car key fobs: a pressable button, an engraved
            label and an LED that lights amber on hover. */}
        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {PATHS.map(({ to, title, line, Icon }, i) => (
            <li key={to} className="hero-rise">
              <Link
                to={to}
                className="fob group relative flex items-center gap-4 rounded-[28px] py-3 pl-3 pr-5 ring-1 ring-[color:var(--gold-light)]/30 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold-light)]"
              >
                <span className="fob-btn grid h-14 w-14 shrink-0 place-items-center rounded-full ring-1 ring-white/10">
                  <Icon className="h-5 w-5 text-[color:var(--gold-light)]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/40">
                    LCT · 0{i + 1}
                  </span>
                  <span className="block truncate text-base font-semibold text-white">{title}</span>
                  <span className="block truncate text-xs text-white/55">{line}</span>
                </span>
                <span className="fob-led h-2 w-2 shrink-0 rounded-full" aria-hidden />
                {/* Key ring */}
                <span
                  className="absolute -right-2 top-1/2 h-5 w-3 -translate-y-1/2 rounded-r-full border-2 border-l-0 border-[color:var(--gold-light)]/50"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
