import { Link, useRouterState } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { IoCall } from "react-icons/io5";
import { SiWhatsapp } from "react-icons/si";
import { CONTACT } from "@/lib/site-data";
import { dockShownOn, OPEN_CONCIERGE_EVENT } from "@/lib/mobile-dock";
import {
  getMobileMenuOpenServerSnapshot,
  getMobileMenuOpenSnapshot,
  subscribeMobileMenuOpen,
} from "@/lib/mobile-menu-state";

/**
 * Phone dock: one floating capsule at the bottom of the screen with
 * WhatsApp, call and the concierge as icons and "Book now" as the main
 * button, in place of separate floating circles and a full-width bar.
 * Below the lg breakpoint only; hidden on /book (see src/lib/mobile-dock.ts)
 * and while the menu is open.
 */
export function MobileBookBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const menuOpen = useSyncExternalStore(
    subscribeMobileMenuOpen,
    getMobileMenuOpenSnapshot,
    getMobileMenuOpenServerSnapshot,
  );
  if (!dockShownOn(pathname) || menuOpen) return null;

  const icon =
    "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-200 active:scale-95";

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 flex items-center gap-1.5 rounded-full bg-[#0d0e10]/90 p-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.65)] ring-1 ring-[#c9a24f]/35 backdrop-blur-xl lg:hidden"
    >
      <a
        href={CONTACT.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Message us on WhatsApp"
        data-track-label="dock_whatsapp_button"
        className={`${icon} text-[#25d366] hover:bg-white/10`}
      >
        <SiWhatsapp className="h-5 w-5" aria-hidden />
      </a>
      <a
        href={CONTACT.phoneTel}
        aria-label={`Call ${CONTACT.phoneDisplay}`}
        data-track-label="dock_call_button"
        className={`${icon} text-[#e2b24c] hover:bg-white/10`}
      >
        <IoCall className="h-5 w-5" aria-hidden />
      </a>
      <button
        type="button"
        aria-label="Open AI Concierge"
        onClick={() => window.dispatchEvent(new Event(OPEN_CONCIERGE_EVENT))}
        className={`${icon} text-white/80 hover:bg-white/10`}
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
      </button>
      <Link
        to="/book"
        data-cursor="book"
        className="ml-auto flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ecd6a0_0%,#c9a24f_100%)] px-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#0d0e10]"
      >
        Book now
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </nav>
  );
}
