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
  const lw = Math.sqrt(2600 * ar);
  return Math.round(lw * Math.min(1, 132 / lw, 40 / (lw / ar)));
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

export function PartnerRibbons() {
  return (
    <section aria-label="Our partners and accreditations" className="ribbons">
      <div className="ribbon ribbon-a">
        <div className="ribbon-track">
          <LogoRun />
          <LogoRun copy />
        </div>
      </div>
      <div className="ribbon ribbon-b">
        <div className="ribbon-track ribbon-track--right">
          <WordRun />
          <WordRun copy />
        </div>
      </div>
    </section>
  );
}
