import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  Hourglass,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { submitFormClient } from "@/lib/forms/submissions.client";
import { errorMessageFor, randomToken } from "@/lib/forms/form-helpers";
import { CONTACT } from "@/lib/site-data";
import { track } from "@/lib/tracking";

/**
 * The hero's reservation card: trip first (date, time, pickup, and the
 * drop-off or the hours), then who is travelling. It sends a "booking"
 * request through the same pipeline as every other site form (Supabase
 * form_submissions + the lead-notify email to reservations), so nothing new
 * runs on the server. Visitors who want to book and pay themselves have the
 * MyLimoBiz booking page one click away.
 */

const MODES = ["One way", "Hourly"] as const;
type Mode = (typeof MODES)[number];
const HOURS = ["2", "3", "4", "5", "6", "8", "10", "12"];

type Values = {
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  hours: string;
  name: string;
  email: string;
  phone: string;
};

const EMPTY: Values = {
  date: "",
  time: "",
  pickup: "",
  dropoff: "",
  hours: "3",
  name: "",
  email: "",
  phone: "",
};

function todayLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function HeroBooking() {
  const clientToken = useMemo(() => randomToken(), []);
  const [mode, setMode] = useState<Mode>("One way");
  const [step, setStep] = useState<1 | 2>(1);
  const [v, setV] = useState<Values>(EMPTY);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (k: keyof Values) => (e: { target: { value: string } }) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  const checkTrip = () => {
    const errs: typeof errors = {};
    if (!v.date) errs.date = "Choose a date";
    if (!v.time) errs.time = "Choose a time";
    if (v.pickup.trim().length < 3) errs.pickup = "Enter a pickup address or airport";
    if (mode === "One way" && v.dropoff.trim().length < 3) errs.dropoff = "Enter a drop-off";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const checkContact = () => {
    const errs: typeof errors = {};
    if (v.name.trim().length < 2) errs.name = "Enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) errs.email = "Enter a valid email";
    if (v.phone.replace(/\D/g, "").length < 7) errs.phone = "Enter a phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      if (checkTrip()) setStep(2);
      return;
    }
    if (state === "submitting" || !checkContact()) return;
    setState("submitting");
    setMessage("");
    try {
      const res = await submitFormClient({
        formType: "booking",
        clientToken,
        website,
        customerName: v.name,
        customerEmail: v.email,
        phone: v.phone,
        tripType: mode === "Hourly" ? `Hourly · ${v.hours} hours` : "One way",
        pickupDateTime: `${v.date}T${v.time}`,
        pickupAddress: v.pickup,
        dropoffAddress: mode === "One way" ? v.dropoff : undefined,
        sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      if (res.ok) {
        setState("success");
        track.leadSubmitSuccess("booking");
      } else {
        setState("error");
        setMessage(errorMessageFor(res.error));
        if (res.fieldErrors) {
          const map: Record<string, keyof Values> = {
            customerName: "name",
            customerEmail: "email",
            phone: "phone",
            pickupAddress: "pickup",
            dropoffAddress: "dropoff",
          };
          const errs: typeof errors = {};
          for (const [k, msg] of Object.entries(res.fieldErrors)) if (map[k]) errs[map[k]] = msg;
          setErrors(errs);
        }
      }
    } catch {
      setState("error");
      setMessage(errorMessageFor(undefined));
    }
  };

  if (state === "success") {
    return (
      <Card>
        <div role="status" className="flex flex-col items-start gap-4 py-2">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-gradient">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </span>
          <p className="font-display text-2xl font-normal leading-tight text-white">
            Request received.
          </p>
          <p className="text-sm leading-relaxed text-white/75">
            Our reservations team will contact you shortly to confirm your ride and the rate. Your
            reservation is confirmed only once we contact you.
          </p>
          <a
            href={CONTACT.phoneTel}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--gold-light)] hover:underline"
          >
            <Phone className="h-4 w-4" aria-hidden />
            Need it sooner? {CONTACT.phoneDisplay}
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[color:var(--gold-light)]">
        Reservations
      </p>
      <p className="mt-2 font-display text-[1.3rem] font-normal leading-tight tracking-[-0.01em] text-white md:text-[1.6rem]">
        Reserve in under 60 seconds.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-4 md:mt-5">
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        {step === 1 ? (
          <>
            <div
              role="radiogroup"
              aria-label="Trip type"
              className="grid grid-cols-2 gap-1 rounded-full bg-white/[0.07] p-1 ring-1 ring-white/10"
            >
              {MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={`h-10 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    mode === m ? "bg-gold-gradient" : "text-white/60 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 md:mt-5 md:gap-y-4">
              <Field
                id="hb-date"
                label="Date"
                icon={<Calendar />}
                error={errors.date}
                input={
                  <input
                    id="hb-date"
                    type="date"
                    min={todayLocal()}
                    value={v.date}
                    onChange={set("date")}
                    aria-invalid={!!errors.date}
                    className="hb-input"
                  />
                }
              />
              <Field
                id="hb-time"
                label="Time"
                icon={<Clock />}
                error={errors.time}
                input={
                  <input
                    id="hb-time"
                    type="time"
                    value={v.time}
                    onChange={set("time")}
                    aria-invalid={!!errors.time}
                    className="hb-input"
                  />
                }
              />
              <Field
                id="hb-pickup"
                label="Pickup"
                icon={<MapPin />}
                error={errors.pickup}
                wide
                input={
                  <input
                    id="hb-pickup"
                    type="text"
                    placeholder="Address, hotel or airport"
                    value={v.pickup}
                    onChange={set("pickup")}
                    aria-invalid={!!errors.pickup}
                    autoComplete="off"
                    className="hb-input"
                  />
                }
              />
              {mode === "One way" ? (
                <Field
                  id="hb-dropoff"
                  label="Drop-off"
                  icon={<Flag />}
                  error={errors.dropoff}
                  wide
                  input={
                    <input
                      id="hb-dropoff"
                      type="text"
                      placeholder="Where are you going?"
                      value={v.dropoff}
                      onChange={set("dropoff")}
                      aria-invalid={!!errors.dropoff}
                      autoComplete="off"
                      className="hb-input"
                    />
                  }
                />
              ) : (
                <Field
                  id="hb-hours"
                  label="Hours"
                  icon={<Hourglass />}
                  wide
                  input={
                    <select
                      id="hb-hours"
                      value={v.hours}
                      onChange={set("hours")}
                      className="hb-input"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {h} hours
                        </option>
                      ))}
                    </select>
                  }
                />
              )}
            </div>
          </>
        ) : (
          <div className="grid gap-y-4">
            <p className="text-sm text-white/65">
              {mode === "Hourly" ? `Hourly · ${v.hours} hours` : "One way"} · {v.date} · {v.time}
              <br />
              <span className="text-white/85">{v.pickup}</span>
              {mode === "One way" && v.dropoff ? (
                <span className="text-white/85"> → {v.dropoff}</span>
              ) : null}
            </p>
            <Field
              id="hb-name"
              label="Full name"
              icon={<User />}
              error={errors.name}
              wide
              input={
                <input
                  id="hb-name"
                  type="text"
                  autoComplete="name"
                  value={v.name}
                  onChange={set("name")}
                  aria-invalid={!!errors.name}
                  className="hb-input"
                />
              }
            />
            <Field
              id="hb-email"
              label="Email"
              icon={<Mail />}
              error={errors.email}
              wide
              input={
                <input
                  id="hb-email"
                  type="email"
                  autoComplete="email"
                  value={v.email}
                  onChange={set("email")}
                  aria-invalid={!!errors.email}
                  className="hb-input"
                />
              }
            />
            <Field
              id="hb-phone"
              label="Phone"
              icon={<Phone />}
              error={errors.phone}
              wide
              input={
                <input
                  id="hb-phone"
                  type="tel"
                  autoComplete="tel"
                  value={v.phone}
                  onChange={set("phone")}
                  aria-invalid={!!errors.phone}
                  className="hb-input"
                />
              }
            />
          </div>
        )}

        {state === "error" ? (
          <p role="alert" className="mt-4 rounded-xl bg-red-500/15 p-3 text-xs text-red-100">
            {message}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3 md:mt-6">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep(1);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Trip
            </button>
          ) : (
            <Link
              to="/book"
              className="text-sm font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              Book & pay online
            </Link>
          )}
          <button
            type="submit"
            disabled={state === "submitting"}
            aria-busy={state === "submitting"}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold-gradient px-7 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity duration-200 hover:opacity-90 disabled:opacity-70"
          >
            {state === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending
              </>
            ) : step === 1 ? (
              <>
                Reserve
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </>
            ) : (
              "Send request"
            )}
          </button>
        </div>
      </form>
    </Card>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="hero-booking relative w-full overflow-hidden rounded-[20px] bg-[#0d0e10]/75 p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] ring-1 ring-[#c9a24f]/30 backdrop-blur-xl max-md:p-5 md:p-8">
      <span
        className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e2c27a] to-transparent"
        aria-hidden
      />
      {children}
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  input,
  error,
  wide,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  input: ReactNode;
  error?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/55 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:text-[color:var(--gold-light)]"
      >
        {icon}
        {label}
      </label>
      {input}
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
