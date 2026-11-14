import { PARTNERS, TRUST_BADGES } from "@/lib/site-data";

/**
 * Partners and accreditations as two crossing ribbons (an X): a gold ribbon
 * of partner logos on white plates running left, and a black ribbon of
 * accreditation badges and partner names in gold running right. Both loop
 * seamlessly (each track holds its list twice and moves by half its width),
 * pause on hover, and stand still with reduced motion.
 */

/** Same visual weight for wide wordmarks and tall emblems. */
function logoWidth(w: number, h: number) {
  const ar = w / h;
  const lw = Math.sqrt(4200 * ar);
  return Math.round(lw * Math.min(1, 160 / lw, 50 / (lw / ar)));
}

const BADGE_TEXT: Record<string, string> = {
  "BBB Accredited Business": "BBB Accredited Business",
  "GNET Member": "GNET Proud Member",
  "NLA Member": "NLA Proud Member",
};

function LogoRun({ copy = false }: { copy?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-3 pr-3 md:gap-4 md:pr-4"
      aria-hidden={copy || undefined}
    >
      {PARTNERS.map((p) => (
        <li key={p.name} className="ribbon-plate">
          <img
            src={p.logo}
            alt={copy ? "" : p.name}
            width={p.w}
            height={p.h}
            loading="lazy"
            decoding="async"
            className="h-auto max-w-full object-contain"
            style={{ width: logoWidth(p.w, p.h) }}
          />
        </li>
      ))}
    </ul>
  );
}

function WordRun({ copy = false }: { copy?: boolean }) {
  const items: { key: string; badge?: string; text: string }[] = [
    ...TRUST_BADGES.map((b) => ({ key: b.name, badge: b.src, text: BADGE_TEXT[b.name] ?? b.name })),
    ...PARTNERS.map((p) => ({ key: p.name, text: p.name })),
  ];
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={copy || undefined}>
      {items.map((it) => (
        <li key={it.key} className="flex items-center">
          {it.badge && (
            <span className="ribbon-badge">
              <img
                src={it.badge}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </span>
          )}
          <span className="ribbon-word">{it.text}</span>
          <span className="ribbon-star" aria-hidden>
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

/*
 * Each track is two identical halves and moves by exactly one half, so the
 * loop is seamless. A half holds the list several times so it is always
 * wider than the widest screen — the ribbon never runs out and shows a gap
 * before it repeats. Only the first list is exposed to assistive tech.
 */
const LOGO_RUNS_PER_HALF = 3;
const WORD_RUNS_PER_HALF = 2;

export function PartnerRibbons() {
  return (
    <section aria-label="Our partners and accreditations" className="ribbons">
      <div className="ribbon ribbon-a">
        <div className="ribbon-track">
          {Array.from({ length: LOGO_RUNS_PER_HALF * 2 }, (_, i) => (
            <LogoRun key={i} copy={i > 0} />
          ))}
        </div>
      </div>
      <div className="ribbon ribbon-b">
        <div className="ribbon-track ribbon-track--right">
          {Array.from({ length: WORD_RUNS_PER_HALF * 2 }, (_, i) => (
            <WordRun key={i} copy={i > 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
