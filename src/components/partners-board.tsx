import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Pause, Play } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ALL_PARTNER_KINDS, PARTNERS, type PartnerKind } from "@/lib/site-data";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Corporate & Airline Partners — shown as an airport departures board.
 *
 * Each partner is a row: the logo on an ivory flap tile, the name on
 * split-flap letters. On first view the tiles drop in and every letter
 * runs through the character drum until it lands, the way a real board
 * updates; after that one row re-flips every few seconds while the
 * section is on screen. The Dallas clock is real local time.
 *
 * Progressive enhancement: the markup renders the final names and visible
 * logos, so crawlers, no-JS and reduced-motion visitors get a still board.
 * Motion pauses on hover/focus, with the Pause button, when the tab is
 * hidden and when the section is off screen.
 */

const COLS = 16;
const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-&:";
const TICK_MS = 62;
const IDLE_MS = 3400;

// Tile geometry (CSS keeps the same 2:1 ratio at every size, logos are sized
// in % of tile width so they scale with it).
const TILE_W = 180;
const TILE_H = 90;
const TILE_PAD = 11;
const LOGO_AREA = 4300;

/** Equal visual weight for wide wordmarks and tall emblems alike. */
function logoWidthPct(w: number, h: number) {
  const ar = w / h;
  const lh = Math.sqrt(LOGO_AREA / ar);
  const lw = lh * ar;
  const s = Math.min(1, (TILE_W - 2 * TILE_PAD) / lw, (TILE_H - 2 * TILE_PAD) / lh);
  return ((lw * s) / TILE_W) * 100;
}

const FLIP_KEYFRAMES: Keyframe[] = [
  { transform: "scaleY(1)" },
  { transform: "scaleY(0.08)", offset: 0.45 },
  { transform: "scaleY(1)" },
];

type Job = { el: HTMLElement; pos: number; target: number };

/** One shared ticker drives every letter on the board. */
function useFlapTicker() {
  const jobs = useRef(new Map<HTMLElement, Job>());
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  }, []);

  const tick = useCallback(() => {
    jobs.current.forEach((job, el) => {
      job.pos = (job.pos + 1) % DRUM.length;
      el.textContent = DRUM[job.pos];
      el.animate(FLIP_KEYFRAMES, { duration: TICK_MS - 6, easing: "ease-in-out" });
      if (job.pos === job.target) jobs.current.delete(el);
    });
    if (jobs.current.size === 0) stop();
  }, [stop]);

  /** Flip `el` through `steps` drum positions, landing on `char`. */
  const flipTo = useCallback(
    (el: HTMLElement, char: string, steps: number) => {
      const target = DRUM.indexOf(char);
      if (target < 0 || steps <= 0) {
        el.textContent = char;
        jobs.current.delete(el);
        return;
      }
      const pos = (target - steps + DRUM.length * 4) % DRUM.length;
      el.textContent = DRUM[pos];
      jobs.current.set(el, { el, pos, target });
      if (timer.current === null) timer.current = window.setInterval(tick, TICK_MS);
    },
    [tick],
  );

  useEffect(() => stop, [stop]);
  return flipTo;
}

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

function FlapStrip({
  text,
  cols,
  cellsRef,
  className = "",
}: {
  text: string;
  cols: number;
  cellsRef?: (els: HTMLSpanElement[]) => void;
  className?: string;
}) {
  // `cols` is the grid width; longer text wraps onto further rows of cells.
  const chars = text.toUpperCase().padEnd(cols, " ").split("");
  const refs = useRef<HTMLSpanElement[]>([]);
  useEffect(() => {
    cellsRef?.(refs.current);
  }, [cellsRef]);
  return (
    <div className={`flap-strip ${className}`} style={{ ["--cols" as string]: cols }} aria-hidden>
      {chars.map((c, i) => (
        <span key={i} className="flap-cell">
          <span
            ref={(el) => {
              if (el) refs.current[i] = el;
            }}
            className="flap-char"
          >
            {c}
          </span>
        </span>
      ))}
    </div>
  );
}

type Partner = (typeof PARTNERS)[number];

/** A strip's cells and the exact text (one char per cell) it lands on. */
type StripHandle = { cells: HTMLSpanElement[]; text: string };
type RowHandle = { tile: HTMLDivElement | null; strips: StripHandle[] };

const PHONE_COLS = 8;

/**
 * Phones: the name wraps onto two 8-cell lines beside the logo
 * ("SHERWIN-" / "WILLIAMS"), so each row stays one tile high instead of
 * stacking a 16-cell line under the logo.
 */
function twoLine(name: string) {
  const tokens = name.split(" ").flatMap((w) => w.split(/(?<=-)/));
  const lines: string[] = [""];
  for (const t of tokens) {
    const cur = lines[lines.length - 1];
    const joined = cur ? (cur.endsWith("-") ? cur + t : `${cur} ${t}`) : t;
    if (joined.length <= PHONE_COLS) lines[lines.length - 1] = joined;
    else lines.push(t);
  }
  return lines
    .slice(0, 2)
    .map((l) => l.slice(0, PHONE_COLS).padEnd(PHONE_COLS, " "))
    .join("")
    .padEnd(PHONE_COLS * 2, " ");
}

function Board({
  title,
  partners,
  register,
}: {
  title: string;
  partners: readonly Partner[];
  register: (rows: RowHandle[]) => void;
}) {
  const rows = useRef<RowHandle[]>(
    partners.map((p) => ({
      tile: null,
      strips: [
        { cells: [], text: twoLine(p.board) },
        { cells: [], text: p.board.padEnd(COLS, " ") },
      ],
    })),
  );

  useEffect(() => {
    register(rows.current);
  }, [register]);

  return (
    <div className="partners-board rounded-sm border border-border/70 bg-[#0d0c0a] p-4 sm:p-5">
      <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-3">
        <h3 className="font-display text-2xl leading-none text-off-white">{title}</h3>
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-champagne/80">
          {String(partners.length).padStart(2, "0")} partners
        </span>
      </div>
      <ul className="mt-1 divide-y divide-border/40">
        {partners.map((p, i) => (
          <li key={p.name} className="flex items-center gap-3 py-3 sm:gap-4 sm:py-3.5">
            <div
              ref={(el) => {
                rows.current[i].tile = el;
              }}
              className="flap-tile w-[112px] shrink-0 sm:w-[132px] md:w-[180px] lg:w-[150px] xl:w-[170px]"
            >
              <img
                src={p.logo}
                alt={p.name}
                width={p.w}
                height={p.h}
                loading="lazy"
                decoding="async"
                className="relative z-[1] h-auto"
                style={{ width: `${logoWidthPct(p.w, p.h).toFixed(1)}%` }}
              />
            </div>
            {/* The wrapper divs switch the strips; `.flap-strip` sets its
                own display, so the breakpoint classes live on the wrappers. */}
            <div className="min-w-0 flex-1 sm:hidden">
              <FlapStrip
                text={rows.current[i].strips[0].text}
                cols={PHONE_COLS}
                cellsRef={(els) => {
                  rows.current[i].strips[0].cells = els;
                }}
              />
            </div>
            <div className="hidden min-w-0 flex-1 sm:block">
              <FlapStrip
                text={rows.current[i].strips[1].text}
                cols={COLS}
                cellsRef={(els) => {
                  rows.current[i].strips[1].cells = els;
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useDallasTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

function DallasClock({
  flipTo,
  animate,
}: {
  flipTo: ReturnType<typeof useFlapTicker>;
  animate: boolean;
}) {
  const time = useDallasTime();
  const cells = useRef<HTMLSpanElement[]>([]);
  const shown = useRef<string>("");
  const setCells = useCallback((els: HTMLSpanElement[]) => {
    cells.current = els;
  }, []);

  useEffect(() => {
    if (!time) return;
    const prev = shown.current.padEnd(8, " ");
    const next = time.padEnd(8, " ");
    cells.current.forEach((el, i) => {
      if (prev[i] === next[i]) return;
      if (animate && prev.trim()) flipTo(el, next[i], rand(1, 4));
      else el.textContent = next[i];
    });
    shown.current = next;
  }, [time, flipTo, animate]);

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <span className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Dallas–Fort Worth · local time
      </span>
      {/* Letters are written by the effect above (never by React), so a
          minute change can flip only the cells that changed. */}
      <FlapStrip text="" cols={8} className="w-[184px]" cellsRef={setCells} />
      {time && <span className="sr-only">Local time in Dallas–Fort Worth: {time}</span>}
    </div>
  );
}

export function PartnersBoard({
  kinds = ALL_PARTNER_KINDS,
  tone = "onyx",
}: {
  /** Must be a stable array (module constant), not an inline literal. */
  kinds?: readonly PartnerKind[];
  /** Section background, to alternate with the neighbouring sections. */
  tone?: "onyx" | "black";
}) {
  const rootRef = useRef<HTMLElement>(null);
  const flipTo = useFlapTicker();
  const boards = useRef(new Map<PartnerKind, RowHandle[]>());
  const [motion, setMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const hovering = useRef(false);
  const visible = useRef(false);
  const entered = useRef(false);

  const registerFor = useCallback(
    (kind: PartnerKind) => (rows: RowHandle[]) => {
      boards.current.set(kind, rows);
    },
    [],
  );
  const registerAirline = useCallback(
    (rows: RowHandle[]) => registerFor("airline")(rows),
    [registerFor],
  );
  const registerCorporate = useCallback(
    (rows: RowHandle[]) => registerFor("corporate")(rows),
    [registerFor],
  );

  const allRows = useCallback(() => kinds.flatMap((k) => boards.current.get(k) ?? []), [kinds]);

  const flipRow = useCallback(
    (row: RowHandle, delay: number, enter: boolean) => {
      window.setTimeout(() => {
        for (const strip of row.strips) {
          // Only the strip on screen at this breakpoint flips; the other
          // one just gets its final letters.
          const live = strip.cells[0]?.offsetParent != null;
          strip.cells.forEach((el, i) => {
            const ch = strip.text[i] ?? " ";
            const blank = ch === " ";
            let steps = 0;
            if (live && enter) steps = blank ? rand(0, 3) : rand(5, 14);
            else if (live && !blank) steps = rand(2, 6);
            flipTo(el, ch, steps);
          });
        }
        const tile = row.tile;
        if (!tile) return;
        if (enter) {
          tile.style.opacity = "";
          tile.animate(
            [
              { transform: "perspective(600px) rotateX(-100deg)", opacity: 0 },
              { transform: "perspective(600px) rotateX(10deg)", opacity: 1, offset: 0.7 },
              { transform: "perspective(600px) rotateX(0deg)", opacity: 1 },
            ],
            { duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
        } else {
          tile.animate(
            [
              { transform: "perspective(600px) rotateX(0deg)" },
              { transform: "perspective(600px) rotateX(-90deg)", offset: 0.42 },
              { transform: "perspective(600px) rotateX(90deg)", offset: 0.42 },
              { transform: "perspective(600px) rotateX(0deg)" },
            ],
            { duration: 560, easing: "ease-in-out" },
          );
        }
      }, delay);
    },
    [flipTo],
  );

  // Hide letters/tiles until the board arrives (motion only; the static
  // markup above is the no-JS / reduced-motion state).
  useEffect(() => {
    if (prefersReducedMotion()) return;
    setMotion(true);
    const rows = allRows();
    rows.forEach((r) => {
      r.strips.forEach((s) => s.cells.forEach((el) => (el.textContent = " ")));
      if (r.tile) r.tile.style.opacity = "0";
    });

    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting && !entered.current) {
          entered.current = true;
          allRows().forEach((r, i) => flipRow(r, 120 + i * 140, true));
        }
      },
      { threshold: 0.25 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [allRows, flipRow]);

  // Idle: one row re-flips every few seconds, round-robin across boards.
  useEffect(() => {
    if (!motion || paused) return;
    let next = 0;
    const id = window.setInterval(() => {
      if (!entered.current || !visible.current || hovering.current || document.hidden) return;
      const rows = allRows();
      if (!rows.length) return;
      // Interleave airline/corporate so consecutive flips alternate boards.
      const half = Math.ceil(rows.length / 2);
      const order =
        rows.length > 3
          ? Array.from({ length: rows.length }, (_, i) => (i % 2 ? half + (i >> 1) : i >> 1))
          : rows.map((_, i) => i);
      flipRow(rows[order[next % order.length]], 0, false);
      next++;
    }, IDLE_MS);
    return () => window.clearInterval(id);
  }, [motion, paused, allRows, flipRow]);

  const show = (k: PartnerKind) => kinds.includes(k);
  const single = kinds.length === 1;

  return (
    <section
      ref={rootRef}
      id="partners"
      aria-label="Corporate and airline partners"
      className={`relative border-t border-border py-[var(--section-space)] ${tone === "onyx" ? "bg-onyx" : "bg-[color:var(--surface-black)]"}`}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      onFocusCapture={() => (hovering.current = true)}
      onBlurCapture={() => (hovering.current = false)}
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--page-gutter)]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Partners"
            title={single && show("airline") ? "Airline Partners" : "Corporate & Airline Partners"}
            description={
              single && show("airline")
                ? "Airlines that trust LCT Universal with ground transportation at DFW International and Dallas Love Field."
                : "The airlines and companies that trust LCT Universal with their ground transportation in Dallas–Fort Worth."
            }
          />
          <DallasClock flipTo={flipTo} animate={motion} />
        </div>

        <div className={`mt-12 grid gap-5 ${single ? "mx-auto max-w-3xl" : "lg:grid-cols-2"}`}>
          {show("airline") && (
            <Board
              title="Airline partners"
              partners={PARTNERS.filter((p) => p.kind === "airline")}
              register={registerAirline}
            />
          )}
          {show("corporate") && (
            <Board
              title="Corporate partners"
              partners={PARTNERS.filter((p) => p.kind === "corporate")}
              register={registerCorporate}
            />
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Setting up travel for your company or crew?{" "}
            <Link
              to="/corporate"
              hash="corporate-inquiry"
              className="group inline-flex items-center gap-1.5 font-semibold text-champagne transition hover:text-gold-soft"
            >
              Open a corporate account
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </p>
          {motion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="inline-flex min-h-[44px] items-center gap-2 self-start text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground transition hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? "Resume board" : "Pause board"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
