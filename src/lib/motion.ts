import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";

/**
 * House easing for the 2026-11 redesign: a weighted slow-out curve
 * (cubic-bezier(0.625, 0.05, 0, 1)) — motion settles like a slow zoom on a
 * film still instead of springing. "lct-quick" is the 0.2s state change.
 */
export const EASE = "lct";
export const EASE_QUICK = "lct-quick";

let registered = false;

export function ensureGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin, DrawSVGPlugin, CustomEase);
    CustomEase.create(EASE, "0.625, 0.05, 0, 1");
    CustomEase.create(EASE_QUICK, "0.25, 0.46, 0.45, 0.94");
    registered = true;
  }
  return { gsap, ScrollTrigger, SplitText, MotionPathPlugin, DrawSVGPlugin };
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isDesktopMotion() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(min-width: 1024px)").matches &&
    window.matchMedia("(pointer: fine)").matches &&
    !prefersReducedMotion()
  );
}

export function refreshScrollTriggers() {
  ensureGsap();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
