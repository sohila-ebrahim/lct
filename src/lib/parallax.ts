import { useLayoutEffect, type RefObject } from "react";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Slow scroll parallax for large photographs. Every element inside `root`
 * marked `data-parallax` drifts vertically while its section crosses the
 * viewport (`data-parallax="12"` sets the drift in percent, default 8).
 * The element should be oversized (e.g. `scale-[1.15]` / `inset-[-8%]`) so
 * the drift never shows an edge. Off for reduced motion and touch-only
 * phones, where scrubbed transforms feel like lag rather than depth.
 */
export function useParallax(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((node) => {
        const amount = Number(node.dataset.parallax) || 8;
        gsap.fromTo(
          node,
          { yPercent: -amount / 2 },
          {
            yPercent: amount / 2,
            ease: "none",
            scrollTrigger: {
              trigger: node.parentElement ?? node,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, [root]);
}
