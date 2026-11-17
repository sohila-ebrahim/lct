import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Phone } from "lucide-react";
import { HeroBooking } from "@/components/home/hero-booking";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { typeHeadline } from "@/lib/typing";

/**
 * Cinematic hero: the headline types in (caret, then letter by letter) in
 * the logo's gold and the booking card rises in beside it. Reduced motion
 * gets the finished hero straight away.
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

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-photo-img",
        { scale: 1.08 },
        { scale: 1, duration: 6, ease: "power1.out" },
      );
      gsap.from(".hero-rise", {
        autoAlpha: 0,
        y: 24,
        duration: 1,
        stagger: 0.08,
        delay: 0.4,
        ease: EASE,
      });
    }, root);
    void typeHeadline(title);

    return () => ctx.revert();
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

      <div className="relative z-[2] mx-auto grid min-h-[100svh] max-w-[var(--container-max)] items-end gap-6 px-[var(--page-gutter)] pb-[calc(env(safe-area-inset-bottom)+5.5rem)] pt-24 md:gap-10 md:pb-10 md:pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(360px,430px)] lg:items-center lg:gap-14 lg:pb-16">
        <div>
          <p className="hero-rise hidden text-[0.7rem] font-medium uppercase tracking-[0.3em] text-[color:var(--gold-light)] md:block">
            Executive chauffeured transportation · Dallas–Fort Worth
          </p>
          <h1
            ref={titleRef}
            data-no-type
            className="font-display text-[clamp(2.3rem,7.4vw,7.6rem)] font-normal leading-[0.92] tracking-[-0.04em] md:mt-5"
          >
            One fleet.
            <br />
            Every occasion.
          </h1>
          <p className="hero-rise mt-6 hidden max-w-md text-lg leading-[1.6] text-white/75 md:block">
            Sedans, SUVs, Sprinters and coaches with professional chauffeurs, dispatched around the
            clock from our Irving office.
          </p>
          <a
            href={CONTACT.phoneTel}
            className="hero-rise mt-6 hidden items-center gap-2 text-base md:inline-flex font-semibold text-white/85 transition-colors duration-200 hover:text-[color:var(--gold-light)]"
          >
            <Phone className="h-4 w-4 text-[color:var(--gold-light)]" aria-hidden />
            {CONTACT.phoneDisplay} · 24/7
          </a>
        </div>

        <div className="hero-rise">
          <HeroBooking />
        </div>
      </div>
    </section>
  );
}
