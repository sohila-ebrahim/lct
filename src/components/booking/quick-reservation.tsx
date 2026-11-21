import { useEffect, useRef, useState } from "react";
import { BOOKING } from "@/lib/site-data";

/**
 * MyLimoBiz's own Quick Reservation form (service type, date, time, pickup,
 * drop-off, passengers, luggage). What a visitor enters goes into the
 * company's reservation system: "Select Vehicle" carries the trip to /book,
 * where the full MyLimoBiz booking continues with it filled in.
 *
 * Mirrors what MyLimoBiz's widget-loader.js does for
 * `data-ores-widget="quickres"` (read directly from book.mylimobiz.com):
 * an iframe on `<alias>/widget/quickReservation?redirectUrl=<site>/book`,
 * sized by their iframeResizer, the one-time Safari cookie hop, and a
 * top-level navigation to the URL the form posts back (it carries
 * `widget-booking-data`). Done here rather than through the loader because
 * the loader scans the page only once and never sees a form that appears
 * after it ran (in-site navigation).
 *
 * tone="glass": shown inverted and see-through, for the hero photo
 * (.qr-frame). tone="plain": MyLimoBiz's own ivory look (.qr-frame-plain).
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

export function QuickReservation({ tone = "plain" }: { tone?: "glass" | "plain" }) {
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
    void loadResizer().then((resize) => {
      if (resize && frameRef.current) {
        resize({ checkOrigin: false, heightCalculationMethod: "lowestElement" }, frameRef.current);
      }
    });
  };

  return (
    <div className="relative overflow-hidden rounded-[14px]">
      {!loaded ? (
        <div
          className={`absolute inset-0 grid place-items-center text-sm ${
            tone === "glass" ? "text-white/70" : "text-[#45474d]"
          }`}
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
        className={`${tone === "glass" ? "qr-frame" : "qr-frame-plain"} block h-[640px] w-full border-0`}
      />
    </div>
  );
}
