/**
 * The phone dock (src/components/mobile-book-bar.tsx) gathers WhatsApp,
 * call, the concierge and "Book now" into one bar at the bottom of the
 * screen. /book, the booking page itself, keeps the separate floating
 * buttons instead. (/fleet's vehicle bar shows from desktop widths only.)
 */
const PAGES_WITHOUT_DOCK = new Set(["/book"]);

export function dockShownOn(pathname: string) {
  return !PAGES_WITHOUT_DOCK.has(pathname);
}

/** Fired by the dock's chat button; the concierge launcher opens on it. */
export const OPEN_CONCIERGE_EVENT = "lct:open-concierge";
