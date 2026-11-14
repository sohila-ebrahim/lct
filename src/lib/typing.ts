/**
 * Headline typing: a caret blinks at the start of the line, then the
 * headline types out letter by letter and the caret rests at the end for a
 * moment before the finished heading takes over.
 *
 * The animation runs on an aria-hidden copy laid exactly over the heading
 * (same box, so the same line breaks); the real heading — the node React
 * owns — is never rewritten, only hidden while the copy types, so screen
 * readers always get the full text and React's text nodes stay intact.
 *
 * `startHeadlineTyping()` types every `main h1, main h2` (except
 * [data-no-type]) the first time it scrolls into view, including headings
 * added by later page changes. Reduced motion: nothing is hidden or typed.
 */
import { prefersReducedMotion } from "@/lib/motion";

const CARET_LEAD_MS = 520;
const CARET_TAIL_MS = 900;

function splitIntoChars(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  const chars: HTMLSpanElement[] = [];
  for (const t of texts) {
    const frag = document.createDocumentFragment();
    for (const ch of t.data) {
      const s = document.createElement("span");
      s.className = "tc";
      s.textContent = ch;
      frag.appendChild(s);
      chars.push(s);
    }
    t.replaceWith(frag);
  }
  return chars;
}

/** Type one heading now. Resolves when the real heading is back in place. */
export function typeHeadline(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    el.classList.add("typed");
    if (prefersReducedMotion() || el.dataset.typing === "1") return resolve();
    el.dataset.typing = "1";

    const clone = document.createElement("span");
    clone.className = "type-clone";
    clone.setAttribute("aria-hidden", "true");
    clone.innerHTML = el.innerHTML;
    // Drop any earlier copy and per-element animation state.
    clone.querySelectorAll(".type-clone").forEach((n) => n.remove());
    clone.querySelectorAll<HTMLElement>("[style]").forEach((n) => {
      n.style.opacity = "";
      n.style.visibility = "";
      n.style.transform = "";
    });
    const chars = splitIntoChars(clone);
    const caret = document.createElement("span");
    caret.className = "type-caret";
    clone.insertBefore(caret, clone.firstChild);

    el.classList.add("is-typing");
    el.appendChild(clone);

    const step = Math.max(16, Math.min(55, 1100 / Math.max(1, chars.length)));
    let i = 0;
    const timers: number[] = [];
    const finish = () => {
      timers.forEach((t) => window.clearTimeout(t));
      clone.remove();
      el.classList.remove("is-typing");
      delete el.dataset.typing;
      resolve();
    };

    const typeNext = () => {
      if (!el.isConnected) return finish();
      const c = chars[i++];
      if (c) {
        c.classList.add("on");
        c.after(caret);
        timers.push(window.setTimeout(typeNext, c.textContent === " " ? step * 0.5 : step));
      } else {
        timers.push(window.setTimeout(finish, CARET_TAIL_MS));
      }
    };
    timers.push(window.setTimeout(typeNext, CARET_LEAD_MS));
  });
}

export function startHeadlineTyping(): () => void {
  if (typeof window === "undefined" || prefersReducedMotion()) return () => {};
  const root = document.documentElement;
  root.classList.add("lct-type");
  const SELECTOR = "main h1:not([data-no-type]), main h2:not([data-no-type])";

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        void typeHeadline(e.target as HTMLElement);
      }
    },
    { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
  );

  // Per-run set (not a DOM flag): a cancelled run (dev StrictMode mounts
  // twice) must not leave headings marked as watched by a dead observer.
  const watched = new WeakSet<Element>();
  const scan = (node: ParentNode) => {
    node.querySelectorAll<HTMLElement>(SELECTOR).forEach((h) => {
      if (h.classList.contains("typed") || watched.has(h)) return;
      watched.add(h);
      io.observe(h);
    });
  };
  scan(document);

  const mo = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        const el = n as HTMLElement;
        if (el.matches?.(SELECTOR)) scan(el.parentElement ?? document);
        else if (el.querySelector?.("h1, h2")) scan(el);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
    root.classList.remove("lct-type");
  };
}
