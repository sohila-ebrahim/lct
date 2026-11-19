import { ReactNode, useLayoutEffect, useRef, type CSSProperties } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { FloatingActions } from "./floating-actions";
import { MobileBookBar } from "./mobile-book-bar";
import { ScrollProgress } from "./luxury/scroll-progress";
import { ConciergeLauncher } from "./concierge/concierge-launcher";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { revealLines, revealClipImage } from "@/lib/reveal";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)] text-foreground lg:pb-0">
      <ScrollProgress />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      <FloatingActions />
      <MobileBookBar />
      <ConciergeLauncher />
    </div>
  );
}

type PageHeroEdge = "left" | "right" | "up" | "down" | "diagonal" | "diagonal-reverse";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imagePosition,
  imagePositionMobile,
  imageEdge = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
  /** Desktop (`md:` and up) object-position. */
  imagePosition?: string;
  /** Below-`md` object-position — falls back to `imagePosition` when omitted, never a bare default center crop. */
  imagePositionMobile?: string;
  imageEdge?: PageHeroEdge;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { gsap } = ensureGsap();
    const reduce = prefersReducedMotion();
    let split: ReturnType<typeof revealLines> = null;

    const ctx = gsap.context(() => {
      if (reduce) return;
      const img = root.querySelector(".pagehero-media");
      if (img) revealClipImage(img, { edge: imageEdge, start: "top 90%" });

      gsap.from(".pagehero-eyebrow", {
        autoAlpha: 0,
        y: 12,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 85%" },
      });

      const titleEl = root.querySelector(".pagehero-title");
      split = revealLines(titleEl, { start: "top 85%" });

      gsap.from(".pagehero-desc", {
        autoAlpha: 0,
        y: 16,
        duration: 0.7,
        delay: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 85%" },
      });
    }, root);

    return () => {
      split?.revert();
      ctx.revert();
    };
  }, [imageEdge]);

  return (
    <section
      ref={rootRef}
      className="relative bg-background pt-[calc(var(--header-height)+3rem)] md:pt-[calc(var(--header-height)+4.5rem)]"
    >
      <div className="mx-auto grid max-w-[var(--container-max)] gap-6 px-[var(--page-gutter)] lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-8">
          <p className="pagehero-eyebrow eyebrow">{eyebrow}</p>
          <h1 className="pagehero-title mt-4 font-display text-[clamp(2rem,3.8vw,3.6rem)] leading-[0.92] tracking-[-0.045em] text-foreground">
            {title}
          </h1>
        </div>
        {description && (
          <p className="pagehero-desc text-lg leading-[1.6] text-muted-foreground lg:col-span-4 lg:pb-2">
            {description}
          </p>
        )}
      </div>
      {image ? (
        <div className="relative mt-8 h-[26svh] min-h-[170px] overflow-hidden md:mt-14 md:h-[60svh] md:min-h-[260px]">
          <img
            src={image}
            alt=""
            className="pagehero-media absolute inset-0 h-full w-full object-cover [object-position:var(--pagehero-pos-m)] md:[object-position:var(--pagehero-pos-d)]"
            style={
              imagePosition || imagePositionMobile
                ? ({
                    "--pagehero-pos-m": imagePositionMobile ?? imagePosition,
                    "--pagehero-pos-d": imagePosition ?? imagePositionMobile,
                  } as CSSProperties)
                : undefined
            }
          />
        </div>
      ) : (
        <div className="pb-14 md:pb-20" aria-hidden />
      )}
    </section>
  );
}
