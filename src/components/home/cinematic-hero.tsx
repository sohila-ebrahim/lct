import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { shouldUse3D } from "@/lib/three/capability";

const SESSION_KEY = "lct-driveby";

const PATHS = [
  { to: "/airport", title: "Airport transfers", line: "DFW and Love Field, flights tracked" },
  { to: "/corporate", title: "Corporate accounts", line: "Roadshows, VIP guests, one invoice" },
  { to: "/events", title: "Events & hourly", line: "Galas, stadium nights, weddings" },
] as const;

/**
 * Cinematic hero. On the first visit of a session a black SUV, built in
 * three.js (src/lib/three/drive-by.ts), drives across from right to left
 * and the fleet photograph is revealed in its wake; then the headline
 * settles and the quick paths rise in. Later visits, reduced motion and
 * devices without capable WebGL get the finished hero straight away.
 */
export function CinematicHero() {
  const rootRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hero = IMAGES.hero;
  const heroMobile = IMAGES.heroMobile;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const photo = photoRef.current;
    const stage = stageRef.current;
    if (!root || !photo || !stage || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    let cancelDrive: (() => void) | null = null;
    let fallback = 0;
    let disposed = false;

    const ctx = gsap.context(() => {
      gsap.set(".hero-word", { autoAlpha: 0, y: 40, letterSpacing: "0.01em" });
      gsap.set(".hero-rise", { autoAlpha: 0, y: 24 });
    }, root);

    const settle = () =>
      ctx.add(() => {
        gsap
          .timeline({ defaults: { ease: EASE } })
          .to(".hero-word", {
            autoAlpha: 1,
            y: 0,
            letterSpacing: "-0.05em",
            duration: 1.4,
            stagger: 0.12,
          })
          .to(".hero-rise", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07 }, 0.35)
          .fromTo(
            ".hero-photo-img",
            { scale: 1.08 },
            { scale: 1, duration: 6, ease: "power1.out" },
            0,
          );
      });

    const reveal = () => {
      photo.style.clipPath = "";
      settle();
    };

    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* storage blocked */
    }

    if (played || !shouldUse3D()) {
      reveal();
    } else {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* storage blocked */
      }
      photo.style.clipPath = "inset(0 0 0 100%)";
      // Never hold the hero back: if the 3D code is slow to arrive, skip it.
      fallback = window.setTimeout(() => {
        if (!cancelDrive) reveal();
      }, 2500);
      import("@/lib/three/drive-by")
        .then(({ runDriveBy }) => {
          if (disposed || photo.style.clipPath === "") return;
          window.clearTimeout(fallback);
          cancelDrive = runDriveBy(stage, {
            onProgress: (rearX) => {
              photo.style.clipPath = `inset(0 0 0 ${(rearX * 100).toFixed(2)}%)`;
            },
            onDone: () => {
              if (!disposed) reveal();
            },
          });
        })
        .catch(reveal);
    }

    return () => {
      disposed = true;
      window.clearTimeout(fallback);
      cancelDrive?.();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="band-dark relative isolate min-h-[100svh] overflow-hidden bg-[color:var(--band)]"
    >
      <div ref={photoRef} className="absolute inset-0">
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

      <div ref={stageRef} className="pointer-events-none absolute inset-0 z-[1]" aria-hidden />

      <div className="relative z-[2] mx-auto flex min-h-[100svh] max-w-[var(--container-max)] flex-col justify-end px-[var(--page-gutter)] pb-8 pt-32 md:pb-12">
        <p className="hero-rise text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Executive chauffeured transportation · Dallas–Fort Worth
        </p>
        <h1 className="mt-5 font-display text-[clamp(3.2rem,9.5vw,9.5rem)] leading-[0.86] tracking-[-0.05em] text-white">
          <span className="hero-word block">One fleet.</span>
          <span className="hero-word block text-[color:var(--gold-light)]">Every occasion.</span>
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

        <ul className="mt-10 grid border-t border-white/15 sm:grid-cols-3">
          {PATHS.map((p, i) => (
            <li key={p.to} className="hero-rise">
              <Link
                to={p.to}
                className={`group flex items-center justify-between gap-4 border-white/15 py-5 transition-colors duration-200 hover:bg-white/[0.04] sm:px-5 ${
                  i < PATHS.length - 1 ? "border-b sm:border-b-0 sm:border-r" : ""
                } ${i === 0 ? "sm:pl-0" : ""}`}
              >
                <span>
                  <span className="text-xs font-semibold text-white/50">0{i + 1}</span>
                  <span className="mt-1 block text-lg font-semibold text-white">{p.title}</span>
                  <span className="block text-sm text-white/60">{p.line}</span>
                </span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-white/60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--gold-light)]"
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
