import { useRouterState } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { IoCall } from "react-icons/io5";
import { SiWhatsapp } from "react-icons/si";
import { CONTACT } from "@/lib/site-data";
import {
  getMobileMenuOpenServerSnapshot,
  getMobileMenuOpenSnapshot,
  subscribeMobileMenuOpen,
} from "@/lib/mobile-menu-state";

/**
 * Floating WhatsApp and call actions: the standard WhatsApp chat button
 * (official mark from simple-icons, white on WhatsApp green), and a gold
 * handset alone that gives a small ring every few seconds (Ionicons). Icons
 * via react-icons. Uses centralized CONTACT numbers only.
 */
export function FloatingActions() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const menuOpen = useSyncExternalStore(
    subscribeMobileMenuOpen,
    getMobileMenuOpenSnapshot,
    getMobileMenuOpenServerSnapshot,
  );
  // /fleet has its own 64px sticky conversion bar — sit above it there.
  const onFleet = pathname === "/fleet";

  if (menuOpen) return null;

  return (
    <div
      className={
        onFleet
          ? "fixed right-3 bottom-[calc(64px+env(safe-area-inset-bottom)+0.75rem)] z-40 flex flex-col items-center gap-2 lg:right-5 lg:bottom-[calc(64px+0.75rem)]"
          : "fixed right-3 bottom-[calc(52px+env(safe-area-inset-bottom)+0.75rem)] z-40 flex flex-col items-center gap-2 lg:right-5 lg:bottom-6"
      }
    >
      <a
        href={CONTACT.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Message us on WhatsApp"
        data-track-label="floating_whatsapp_button"
        className="fab fab-wa"
      >
        <SiWhatsapp aria-hidden className="h-[54%] w-[54%]" />
      </a>
      <a
        href={CONTACT.phoneTel}
        aria-label={`Call ${CONTACT.phoneDisplay}`}
        data-track-label="floating_call_button"
        className="fab fab-call"
      >
        <IoCall aria-hidden className="h-[78%] w-[78%]" />
      </a>
    </div>
  );
}
