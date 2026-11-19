import { useEffect, useRef, useState } from "react";
import { IoCall } from "react-icons/io5";
import { SiWhatsapp } from "react-icons/si";
import { BOOKING, CONTACT } from "@/lib/site-data";

/**
 * The hero's reservation card: MyLimoBiz's own Quick Reservation form (shown
 * inverted and see-through on the hero photo, see .qr-frame), so
 * what a visitor enters goes into the company's reservation system, not a
 * separate inbox. Service type, date, time, pickup, drop-off, passengers and
 * luggage are filled in here; "Select Vehicle" carries them to /book, where
 * the full MyLimoBiz booking continues with them already filled in.
 *
 * Mirrors what MyLimoBiz's widget-loader.js does for
 * `data-ores-widget="quickres"` (read directly from book.mylimobiz.com):
 * an iframe on `<alias>/widget/quickReservation?redirectUrl=<page>`, sized by
 * their iframeResizer, and a top-level navigation to the URL the form posts
 * back (it carries `widget-booking-data`). Done here rather than through the
 * loader because the loader scans the page only once and never sees a form
 * that appears after it ran (in-site navigation back to the home page).
 */

/** "https://book.mylimobiz.com/v4", the part of the booking URL before the alias. */
const ORES_ROOT = BOOKING.url.slice(0, BOOKING.url.lastIndexOf("/"));
const RESIZER_SRC = `${ORES_ROOT}/Scripts/iframeResizer/iframeResizer.min.js`;

type Resize = (options: Record<string, unknown>, target: HTMLIFrameElement) => void;
declare global {
  interface Window {
    iFrameResize?: Resize;
  }
}

let resizer: Promise<Resize | null> | null = null;
function loadResizer(): Promise<Resize | null> {
  if (window.iFrameResize) return Promise.resolve(window.iFrameResize);
  resizer ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = RESIZER_SRC;
    s.async = true;
    s.onload = () => resolve(window.iFrameResize ?? null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return resizer;
}

export function HeroBooking() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [src] = useState(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://lctuniversal.com";
    return `${BOOKING.url}/widget/quickReservation?redirectUrl=${origin}/book`;
  });

  // Safari blocks the form's cookies inside an iframe until MyLimoBiz has set
  // them once at top level: the same one-time hop to their _safari_fix page
  // and back that widget-loader.js makes for every widget (cookie-gated, so
  // once per browser; /book already does it).
  useEffect(() => {
    if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) return;
    if (/(^|;\s*)safari_fix_applied=/.test(document.cookie)) return;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 10);
    document.cookie = `safari_fix_applied=${new Date().toISOString()};expires=${expires.toUTCString()};path=/`;
    window.top!.location.href = `${ORES_ROOT}/Widgets/_safari_fix.html?redirect=${encodeURIComponent(window.location.href)}`;
  }, []);

  // "Select Vehicle": the form posts back the /book URL with the trip in
  // `widget-booking-data`; follow it, as widget-loader.js does (only to this
  // site or to MyLimoBiz).
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (typeof event.data !== "string" || !event.data.includes("widget-booking-data")) return;
      let next: URL;
      try {
        next = new URL(event.data, window.location.href);
      } catch {
        return;
      }
      const ours = next.origin === window.location.origin;
      const theirs = next.protocol === "https:" && next.hostname.endsWith(".mylimobiz.com");
      if (!ours && !theirs) return;
      window.location.assign(next.href);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const onLoad = () => {
    setLoaded(true);
    const frame = frameRef.current;
    if (!frame) return;
    void loadResizer().then((resize) => {
      if (resize && frameRef.current) {
        resize({ checkOrigin: false, heightCalculationMethod: "lowestElement" }, frameRef.current);
      }
    });
  };

  return (
    <div className="hero-booking relative w-full overflow-hidden rounded-[20px] bg-[#0d0e10]/20 p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.5)] ring-1 ring-[#c9a24f]/30 backdrop-blur-[3px] md:p-6">
      <span
        className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e2c27a] to-transparent"
        aria-hidden
      />
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[color:var(--gold-light)]">
        Reservations
      </p>
      <p className="mt-2 font-display text-[1.15rem] font-normal leading-tight tracking-[-0.01em] text-white md:text-[1.25rem]">
        Reserve in under 60 seconds.
      </p>

      <div className="relative mt-4 overflow-hidden rounded-[14px]">
        {!loaded ? (
          <div
            className="absolute inset-0 grid place-items-center text-sm text-white/70"
            aria-hidden
          >
            Loading reservations…
          </div>
        ) : null}
        <iframe
          ref={frameRef}
          src={src}
          title="Quick reservation"
          onLoad={onLoad}
          scrolling="no"
          allow="geolocation"
          className="qr-frame block h-[640px] w-full border-0"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/60">
        <span>Prefer to talk? Dispatch 24/7</span>
        <span className="flex items-center gap-2">
          <a
            href={CONTACT.phoneTel}
            aria-label={`Call ${CONTACT.phoneDisplay}`}
            data-track-label="hero_call"
            className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-[#c9a24f]/50 transition-colors duration-200 hover:bg-white/10"
          >
            <IoCall className="h-4 w-4 text-[#e2b24c]" aria-hidden />
          </a>
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Message us on WhatsApp"
            data-track-label="hero_whatsapp"
            className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-white/20 transition-colors duration-200 hover:bg-white/10"
          >
            <SiWhatsapp className="h-4 w-4 text-[#25d366]" aria-hidden />
          </a>
        </span>
      </div>
    </div>
  );
}
