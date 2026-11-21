import { IoCall } from "react-icons/io5";
import { SiWhatsapp } from "react-icons/si";
import { QuickReservation } from "@/components/booking/quick-reservation";
import { CONTACT } from "@/lib/site-data";

/**
 * The hero's reservation card: MyLimoBiz's Quick Reservation, shown inverted
 * and see-through on the hero photo, with call and WhatsApp underneath.
 */
export function HeroBooking() {
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

      <div className="mt-4">
        <QuickReservation tone="glass" />
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
