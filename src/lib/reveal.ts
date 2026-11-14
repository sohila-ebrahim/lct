/**
 * Shared reveal presets for the editorial redesign, one implementation per
 * technique so every page moves the same way:
 *
 * - Headings are typed in sitewide by src/lib/typing.ts (caret, then the
 *   line letter by letter); revealLines() is kept as a no-op for callers.
 * - Images open like a film still: a slow fade with a gentle zoom-out of the
 *   photo inside its frame. No clip wipes, no parallax.
 * - Lists rise a short distance in sequence.
 *
 * All on the house curve (EASE in motion.ts). Every preset is a no-op under
 * prefers-reduced-motion: elements keep their normal, fully visible styling.
 */
import { EASE, ensureGsap, prefersReducedMotion } from "@/lib/motion";

type Target = Element | Element[] | NodeListOf<Element> | string | null;

function hasTarget(t: Target) {
  if (!t) return false;
  if (typeof t === "string") return true;
  if (Array.isArray(t) || t instanceof NodeList) return t.length > 0;
  return true;
}

function firstElement(t: Target): Element | null {
  if (!t) return null;
  if (typeof t === "string") return document.querySelector(t);
  if (Array.isArray(t) || t instanceof NodeList) return (t as ArrayLike<Element>)[0] ?? null;
  return t;
}

/**
 * Heading settle. The signature is kept from the previous preset (callers
 * pass a `type`/`stagger` and call `.revert()` on the result); the heading
 * now moves as one block, so the return value is a no-op handle — the
 * caller's own gsap.context() cleanup reverts the tween.
 */
export function revealLines(
  el: Element | null,
  opts: { type?: "lines" | "words" | "chars"; stagger?: number; start?: string } = {},
): { revert: () => void } | null {
  // Headings now type in sitewide (src/lib/typing.ts); kept as a no-op so
  // existing callers need no changes.
  void el;
  return null;
}

/**
 * Film-still image reveal: the frame fades in and the photo inside it eases
 * back from a slight zoom. `edge`/`angle`/`duration` are accepted for
 * compatibility with existing callers; the direction no longer applies.
 */
export function revealClipImage(
  el: Target,
  opts: { edge?: string; start?: string; duration?: number; angle?: number } = {},
) {
  if (!hasTarget(el) || prefersReducedMotion()) return;
  const { gsap } = ensureGsap();
  const frame = firstElement(el);
  if (!frame) return;
  const photo = frame.tagName === "IMG" ? frame : (frame.querySelector("img") ?? frame);
  const trigger = { trigger: frame, start: opts.start ?? "top 85%", once: true };

  gsap.fromTo(
    frame,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.9, ease: "none", scrollTrigger: trigger },
  );
  gsap.fromTo(
    photo,
    { scale: 1.08 },
    { scale: 1, duration: opts.duration ?? 1.8, ease: EASE, scrollTrigger: trigger },
  );
}

/** Sequenced short rise for grids and lists. `from`/`distance` kept for callers. */
export function revealStagger(
  els: Target,
  opts: {
    from?: string;
    amount?: number;
    start?: string;
    duration?: number;
    trigger?: Target;
    distance?: number;
  } = {},
) {
  if (!hasTarget(els) || prefersReducedMotion()) return;
  const { gsap } = ensureGsap();
  const trigger = opts.trigger ? firstElement(opts.trigger) : firstElement(els);
  gsap.from(els, {
    y: 24,
    autoAlpha: 0,
    duration: opts.duration ?? 1,
    stagger: opts.amount ?? 0.08,
    ease: EASE,
    scrollTrigger: {
      trigger: trigger as gsap.DOMTarget,
      start: opts.start ?? "top 85%",
      once: true,
    },
  });
}

/** Stroke draw for SVG route lines (DrawSVGPlugin). */
export function drawLine(el: Target, opts: { start?: string; duration?: number } = {}) {
  if (!hasTarget(el)) return;
  const { gsap } = ensureGsap();
  if (prefersReducedMotion()) {
    gsap.set(el, { drawSVG: "100%" });
    return;
  }
  gsap.fromTo(
    el,
    { drawSVG: "0%" },
    {
      drawSVG: "100%",
      duration: opts.duration ?? 1.4,
      ease: EASE,
      scrollTrigger: { trigger: el as gsap.DOMTarget, start: opts.start ?? "top 85%", once: true },
    },
  );
}
