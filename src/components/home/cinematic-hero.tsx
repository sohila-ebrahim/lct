import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Editorial hero: a very large two-line headline in ink on the white canvas,
 * copy and actions beside it, and the fleet photograph below as a
 * hard-edged panel that opens to the full width as the page scrolls.
 *
 * Motion: the headline settles on load (fades in as its tracking tightens)
 * and the panel fades up; on scroll the panel's side margins close and the
 * photo eases out of a slight zoom. Reduced motion shows the final state.
 */
export function CinematicHero() {
  const rootRef = useRef<HTMLElement>(null);
  const hero = IMAGES.hero;
  const heroMobile = IMAGES.heroMobile;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = ensureGsap();

    const ctx = gsap.context(() => {
      // Load: the headline settles (fades in while its tracking tightens),
      // copy and actions follow, and the photo panel fades up.
      gsap.set(".hero-word", { autoAlpha: 0, y: 24, letterSpacing: "0.01em" });
      gsap.set([".hero-copy", ".hero-cta"], { autoAlpha: 0, y: 16 });
      gsap.set(".hero-reveal", { autoAlpha: 0 });
      // The outer panel keeps a side margin until the page scrolls.
      const side = Math.round(Math.min(40, Math.max(20, window.innerWidth * 0.04)));
      gsap.set(".hero-panel", { clipPath: `inset(0px ${side}px 0px ${side}px)` });
      gsap.set(".hero-photo", { scale: 1.12 });

      gsap
        .timeline({ defaults: { ease: EASE } })
        .to(
          ".hero-word",
          { autoAlpha: 1, y: 0, letterSpacing: "-0.05em", duration: 1.4, stagger: 0.12 },
          0.1,
        )
        .to(".hero-copy", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06 }, 0.5)
        .to(".hero-cta", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06 }, 0.65)
        .to(".hero-reveal", { autoAlpha: 1, duration: 1.2, ease: "none" }, 0.4);

      // Scroll: the panel opens to full bleed while the photo eases out of
      // its zoom, like a slow pull-back on a film still.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".hero-panel",
            start: "top 85%",
            end: "bottom 35%",
            scrub: true,
          },
        })
        .to(".hero-panel", { clipPath: "inset(0px 0px 0px 0px)", ease: "none" }, 0)
        .to(".hero-photo", { scale: 1, ease: "none" }, 0);
    }, root);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative bg-background pt-[calc(var(--header-height)+2.5rem)] md:pt-[calc(var(--header-height)+4rem)]"
    >
      <div className="mx-auto grid max-w-[var(--container-max)] gap-8 px-[var(--page-gutter)] lg:grid-cols-12 lg:items-end lg:gap-10">
        <h1 className="font-display text-[clamp(3.1rem,7.4vw,7.75rem)] leading-[0.86] tracking-[-0.05em] text-foreground lg:col-span-8">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="hero-word inline-block">One fleet.</span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="hero-word inline-block text-gold-gradient">Every occasion.</span>
          </span>
        </h1>

        <div className="lg:col-span-4 lg:pb-3">
          <p className="hero-copy eyebrow">Dallas–Fort Worth · Irving, Texas</p>
          <p className="hero-copy mt-4 max-w-md text-lg leading-[1.6] text-muted-foreground">
            Executive sedans, SUVs, Sprinters and coaches for airport transfers, corporate travel,
            events and groups across Dallas–Fort Worth. Available 24/7.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="hero-cta">
              <Link
                to="/book"
                className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-gold-gradient px-6 py-3 text-[0.95rem] font-semibold transition hover:opacity-90"
              >
                Book your ride
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="hero-cta">
              <button
                type="button"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-[0.95rem] font-semibold text-foreground transition duration-200 hover:border-foreground hover:bg-foreground hover:text-background"
                onClick={() =>
                  document.getElementById("fleet-journey")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore the fleet
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-panel relative mt-10 h-[56svh] min-h-[340px] overflow-hidden md:mt-14 md:h-[78svh]">
        <div className="hero-reveal absolute inset-0">
          <picture>
            {/* Below `md`: a real cropped derivative (see `heroMobile` in image-map.ts). */}
            <source media="(max-width: 767px)" srcSet={heroMobile.src} />
            <img
              src={hero.src}
              alt={hero.alt}
              className="hero-photo absolute inset-0 h-full w-full object-cover [object-position:var(--hero-pos-m)] md:[object-position:var(--hero-pos-d)]"
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
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[var(--container-max)] items-end justify-between gap-4 px-[var(--page-gutter)] pb-6 text-sm text-white md:pb-8">
            <span className="font-semibold">Dispatch 24 hours · 7 days</span>
            <a
              href={CONTACT.phoneTel}
              className="hidden items-center gap-2 font-semibold transition hover:opacity-80 sm:inline-flex"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
