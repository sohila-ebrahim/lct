import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { IoCall } from "react-icons/io5";
import { SiWhatsapp } from "react-icons/si";
import { CONTACT } from "@/lib/site-data";

/**
 * The hero's booking card. Every way it offers ends at the company directly:
 * "Book online" opens the MyLimoBiz reservation system on /book (the same
 * system dispatch works from), and call and WhatsApp reach dispatch. It
 * deliberately collects nothing itself, so no booking can stop half-way in
 * a separate inbox.
 */

const SERVICES = ["Airport transfers", "Point to point", "Hourly"];

export function HeroBooking() {
  return (
    <div className="hero-booking relative w-full overflow-hidden rounded-[20px] bg-[#0d0e10]/75 p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] ring-1 ring-[#c9a24f]/30 backdrop-blur-xl max-md:p-5 md:p-8">
      <span
        className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e2c27a] to-transparent"
        aria-hidden
      />
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[color:var(--gold-light)]">
        Reservations
      </p>
      <p className="mt-2 font-display text-[1.3rem] font-normal leading-tight tracking-[-0.01em] text-white md:text-[1.6rem]">
        Book your ride in under 60 seconds.
      </p>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="What you can book">
        {SERVICES.map((s) => (
          <li
            key={s}
            className="rounded-full px-3 py-1 text-[0.7rem] font-medium text-white/75 ring-1 ring-white/15"
          >
            {s}
          </li>
        ))}
      </ul>

      <Link
        to="/book"
        data-track-label="hero_book_online"
        className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ecd6a0_0%,#c9a24f_100%)] text-xs font-semibold uppercase tracking-[0.2em] text-[#0d0e10] transition-opacity duration-200 hover:opacity-90"
      >
        Book online
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden
        />
      </Link>
      <p className="mt-2 text-center text-xs text-white/55">
        Opens our secure online reservation system.
      </p>

      <div className="mt-5 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.24em] text-white/45">
        <span className="h-px flex-1 bg-white/15" aria-hidden />
        or talk to dispatch, 24/7
        <span className="h-px flex-1 bg-white/15" aria-hidden />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <a
          href={CONTACT.phoneTel}
          data-track-label="hero_call"
          className="flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white ring-1 ring-[#c9a24f]/50 transition-colors duration-200 hover:bg-white/10"
        >
          <IoCall className="h-4 w-4 text-[#e2b24c]" aria-hidden />
          Call
        </a>
        <a
          href={CONTACT.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          data-track-label="hero_whatsapp"
          className="flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white ring-1 ring-white/20 transition-colors duration-200 hover:bg-white/10"
        >
          <SiWhatsapp className="h-4 w-4 text-[#25d366]" aria-hidden />
          WhatsApp
        </a>
      </div>
      <p className="mt-3 text-center text-xs text-white/55">{CONTACT.phoneDisplay}</p>
    </div>
  );
}
