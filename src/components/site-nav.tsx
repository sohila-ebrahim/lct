import { Link, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Phone, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MyLimoBizLoginPopover } from "@/components/booking/mylimobiz-login-popover";
import { CONTACT } from "@/lib/site-data";
import { IMAGES, type ImageKey } from "@/lib/image-map";
import { setMobileMenuOpen } from "@/lib/mobile-menu-state";
import { useDallasTime } from "@/hooks/use-dallas-time";

/*
 * Site header: a floating capsule that hides while reading down the page
 * and returns on the way up, with a live dispatch chip, the theme switch and
 * the booking action. "Menu" opens a full-screen index: large numbered links
 * with a photo preview per destination, contact details and client login.
 */

const QUICK_LINKS = [
  { to: "/fleet", label: "Fleet" },
  { to: "/services", label: "Services" },
  { to: "/airport", label: "Airport" },
  { to: "/corporate", label: "Corporate" },
  { to: "/contact", label: "Contact" },
] as const;

const MENU_MAIN: { to: string; label: string; image: ImageKey }[] = [
  { to: "/", label: "Home", image: "hero" },
  { to: "/fleet", label: "Fleet", image: "fleetSuv" },
  { to: "/services", label: "Services", image: "groupCoachStory" },
  { to: "/airport", label: "Airport transfers", image: "airport" },
  { to: "/corporate", label: "Corporate travel", image: "corporateStory" },
  { to: "/events", label: "Events", image: "events" },
  { to: "/about", label: "About", image: "chauffeur" },
  { to: "/contact", label: "Contact", image: "rearview" },
];

const MENU_MORE = [
  { to: "/rates", label: "Rates & pricing" },
  { to: "/reviews", label: "Reviews" },
  { to: "/service-areas", label: "Service areas" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
  { to: "/join-our-team", label: "Join our team" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/cancellation-policy", label: "Cancellation" },
  { to: "/zero-tolerance", label: "Zero tolerance" },
];

function LiveChip() {
  const time = useDallasTime();
  return (
    <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground xl:inline-flex">
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Dispatch online
      {time && <span className="font-medium text-muted-foreground">· Dallas {time}</span>}
    </span>
  );
}

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [preview, setPreview] = useState<ImageKey>("hero");
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setOpen(false), []);

  // Hide while scrolling down, show on the way up (and always near the top).
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      setHidden(y > 160 && y > lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Menu open: lock page scroll, trap focus, Escape closes, focus returns.
  useEffect(() => {
    setMobileMenuOpen(open);
    if (!open) return;
    const panel = menuRef.current;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const button = menuButtonRef.current;
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  useEffect(() => () => setMobileMenuOpen(false), []);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
      <header
        className={`site-header fixed inset-x-3 top-3 z-50 transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] md:inset-x-5 md:top-4 ${
          hidden && !open ? "-translate-y-[140%]" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-[60px] max-w-[1240px] items-center justify-between gap-3 rounded-full border border-border bg-background/80 pl-4 pr-2 backdrop-blur-xl">
          <Logo priority imgClassName="h-10 w-auto md:h-11" className="shrink-0" />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {QUICK_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 hover:bg-muted ${
                      isActive(l.to)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                    {isActive(l.to) && (
                      <span
                        className="absolute inset-x-0 -bottom-0.5 mx-auto h-1 w-1 rounded-full bg-[color:var(--gold)]"
                        aria-hidden
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LiveChip />
            <ThemeToggle />
            <a
              href={CONTACT.phoneTel}
              aria-label={`Call ${CONTACT.phoneDisplay}`}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-muted md:inline-flex"
            >
              <Phone className="h-4 w-4" aria-hidden />
            </a>
            <Link
              to="/book"
              className="hidden h-10 items-center rounded-full bg-gold-gradient px-5 text-sm font-semibold transition-opacity duration-200 hover:opacity-90 sm:inline-flex"
            >
              Book now
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls={menuId}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-opacity duration-200 hover:opacity-85"
            >
              Menu
              <span className="flex flex-col gap-[3px]" aria-hidden>
                <span className="block h-[1.5px] w-4 bg-current" />
                <span className="block h-[1.5px] w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id={menuId}
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="band-dark site-menu fixed inset-0 z-[70] overflow-y-auto bg-[color:var(--band)]"
      >
        <div className="mx-auto flex min-h-full max-w-[1240px] flex-col px-[var(--page-gutter)] pb-10 pt-5">
          <div className="flex items-center justify-between">
            <Logo imgClassName="h-11 w-auto" onClick={closeMenu} />
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-white/10"
            >
              Close
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mt-10 grid flex-1 gap-12 lg:mt-14 lg:grid-cols-[1.2fr_1fr]">
            <nav aria-label="Site">
              <ol className="site-menu-list">
                {MENU_MAIN.map((m, i) => (
                  <li key={m.to} style={{ "--i": i } as CSSProperties}>
                    <Link
                      to={m.to}
                      onClick={closeMenu}
                      onMouseEnter={() => setPreview(m.image)}
                      onFocus={() => setPreview(m.image)}
                      className={`group flex items-baseline gap-4 border-b border-border py-2.5 transition-[padding,color] duration-300 hover:pl-3 md:py-3 ${
                        isActive(m.to) ? "text-[color:var(--gold)]" : "text-foreground"
                      }`}
                    >
                      <span className="w-7 shrink-0 text-xs font-semibold text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[clamp(2rem,5.2vw,4.25rem)] leading-[0.95] tracking-[-0.045em]">
                        {m.label}
                      </span>
                      <ArrowUpRight
                        className="ml-auto h-6 w-6 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="flex flex-col gap-8">
              <div className="relative hidden aspect-[4/3] overflow-hidden lg:block">
                {MENU_MAIN.map((m) => {
                  const img = IMAGES[m.image];
                  return (
                    <img
                      key={m.to}
                      src={img.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.625,0.05,0,1)]"
                      style={{
                        objectPosition: img.objectPositionDesktop,
                        opacity: preview === m.image ? 1 : 0,
                        transform: preview === m.image ? "scale(1)" : "scale(1.06)",
                      }}
                    />
                  );
                })}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="eyebrow">Reservations, 24/7</p>
                  <a
                    href={CONTACT.phoneTel}
                    className="mt-2 block text-xl font-semibold text-foreground"
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                  <a
                    href={CONTACT.emailMailto}
                    className="mt-1 block break-all text-sm text-muted-foreground hover:text-foreground"
                  >
                    {CONTACT.email}
                  </a>
                </div>
                <div>
                  <p className="eyebrow">Office</p>
                  <a
                    href={CONTACT.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-sm leading-relaxed text-foreground hover:text-[color:var(--gold)]"
                  >
                    {CONTACT.streetAddress}, {CONTACT.addressLine2}
                    <br />
                    {CONTACT.locationLine}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/book"
                  onClick={closeMenu}
                  className="inline-flex h-12 items-center rounded-full bg-gold-gradient px-6 text-base font-semibold"
                >
                  Book your ride
                </Link>
                <MyLimoBizLoginPopover
                  panelAlign="left"
                  triggerClassName="inline-flex h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-white/10"
                />
              </div>
            </div>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
            {MENU_MORE.map((m) => (
              <li key={m.to}>
                <Link
                  to={m.to}
                  onClick={closeMenu}
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
