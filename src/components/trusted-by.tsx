import { PARTNERS, TRUST_BADGES } from "@/lib/site-data";

/**
 * "Trusted by": the airline and corporate partners in one calm row of
 * logos (muted, in colour on hover), with the accreditations underneath.
 * Always on a light band so every logo reads in its own colours, in light
 * and dark mode alike.
 */

/** Same visual weight for wide wordmarks and tall emblems. */
function logoWidth(w: number, h: number) {
  const ar = w / h;
  const lw = Math.sqrt(3000 * ar);
  return Math.round(lw * Math.min(1, 150 / lw, 48 / (lw / ar)));
}

const BADGE_TEXT: Record<string, string> = {
  "BBB Accredited Business": "BBB Accredited Business",
  "GNET Member": "GNET Member",
  "NLA Member": "NLA Member",
};

export function TrustedBy() {
  return (
    <section
      aria-labelledby="trusted-by-title"
      className="band-light border-y border-black/[0.06] bg-white py-[clamp(2.5rem,5vw,4rem)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        <p
          id="trusted-by-title"
          className="text-center text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[#45474d] md:text-xs"
        >
          Trusted by{" "}
          <strong className="font-semibold text-[#0d0e10]">airlines &amp; companies</strong>
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-8 md:mt-10 md:gap-x-12">
          {PARTNERS.map((p) => (
            <li key={p.name} className="flex h-14 w-[28%] items-center justify-center md:w-auto">
              <img
                src={p.logo}
                alt={p.name}
                width={p.w}
                height={p.h}
                loading="lazy"
                decoding="async"
                className="h-auto max-h-12 max-w-full object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                style={{ width: logoWidth(p.w, p.h) }}
              />
            </li>
          ))}
        </ul>

        <ul className="mx-auto mt-9 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-black/[0.06] pt-7">
          {TRUST_BADGES.map((b) => (
            <li key={b.name} className="flex items-center gap-2.5">
              <img
                src={b.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-9 w-9 object-contain"
              />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#45474d]">
                {BADGE_TEXT[b.name] ?? b.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
