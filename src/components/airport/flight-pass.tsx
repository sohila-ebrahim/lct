import { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A boarding-pass card that plays one sample airport pickup through its four
 * states. It is an illustration of the service (labelled as such), not live
 * flight data: the flight, times and city are invented examples.
 */

const STATES = [
  {
    key: "scheduled",
    label: "Scheduled",
    note: "Booking confirmed with your flight number",
    progress: 0,
  },
  {
    key: "enroute",
    label: "En route",
    note: "Flight tracked; pickup moves with the actual landing time",
    progress: 0.55,
  },
  {
    key: "landed",
    label: "Landed",
    note: "Your chauffeur heads inside to baggage claim",
    progress: 1,
  },
  {
    key: "waiting",
    label: "Chauffeur waiting",
    note: "Name placard at claim · 60 minutes of waiting included",
    progress: 1,
  },
] as const;

const STEP_MS = 2600;

export function FlightPass() {
  const [s, setS] = useState(0);
  const [live, setLive] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setS(STATES.length - 1);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live) return;
    const t = window.setTimeout(
      () => setS((n) => (n + 1) % STATES.length),
      s === STATES.length - 1 ? STEP_MS * 1.6 : STEP_MS,
    );
    return () => window.clearTimeout(t);
  }, [live, s]);

  const st = STATES[s];

  return (
    <figure ref={ref} className="flight-pass">
      <div className="flight-pass__main">
        <div className="flex items-center justify-between gap-4">
          <span className="section-index !text-[0.62rem]">Sample pickup</span>
          <span className="text-[0.68rem] uppercase tracking-[0.24em] text-white/45">AA 1742</span>
        </div>

        <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-end gap-4">
          <div>
            <p className="flight-pass__code">ORD</p>
            <p className="flight-pass__city">Chicago</p>
          </div>
          <div className="relative mb-5 h-px bg-white/15" aria-hidden>
            <span
              className="absolute inset-y-0 left-0 bg-[color:var(--gold-light)] transition-[width] duration-[1600ms] ease-out"
              style={{ width: `${st.progress * 100}%` }}
            />
            <Plane
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 fill-[color:var(--gold-light)] text-[color:var(--gold-light)] transition-[left] duration-[1600ms] ease-out"
              style={{ left: `${st.progress * 100}%` }}
            />
          </div>
          <div className="text-right">
            <p className="flight-pass__code">DFW</p>
            <p className="flight-pass__city">Terminal D</p>
          </div>
        </div>

        <dl className="flight-pass__facts mt-6 grid grid-cols-3">
          <div>
            <dt>Scheduled</dt>
            <dd>6:40 PM</dd>
          </div>
          <div>
            <dt>Landing</dt>
            <dd>{s === 0 ? "6:40 PM" : "6:58 PM"}</dd>
          </div>
          <div>
            <dt>Pickup</dt>
            <dd>{s === 0 ? "6:55 PM" : "7:13 PM"}</dd>
          </div>
        </dl>
      </div>

      <div className="flight-pass__stub">
        <p className="text-[0.62rem] uppercase tracking-[0.28em] text-white/45">Status</p>
        <p key={st.key} className="flight-pass__status mt-2">
          {st.label}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/60">{st.note}</p>
        <ol className="mt-5 flex gap-1.5" aria-hidden>
          {STATES.map((x, n) => (
            <li
              key={x.key}
              className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${
                n <= s ? "bg-[color:var(--gold-light)]" : "bg-white/15"
              }`}
            />
          ))}
        </ol>
        <div className="flight-pass__barcode mt-5" aria-hidden />
      </div>

      <figcaption className="sr-only">
        Illustration of an airport pickup: the flight is tracked, the pickup time follows the actual
        landing, and the chauffeur waits at baggage claim.
      </figcaption>
    </figure>
  );
}
