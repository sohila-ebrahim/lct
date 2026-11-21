import { ArrowUpRight, Mail } from "lucide-react";
import { IoCall } from "react-icons/io5";
import { SiWhatsapp } from "react-icons/si";
import { CONTACT } from "@/lib/site-data";

/**
 * Direct ways to reach dispatch: call, WhatsApp and email. Every one of them
 * lands with the company itself, nothing is stored on the way.
 *
 * layout="tiles": the main content of a section (Contact, Corporate).
 * layout="row": a quiet line under a reservation form.
 * `subject` pre-fills the email subject so the team can sort requests.
 */
export function ContactOptions({
  layout = "tiles",
  subject = "Website enquiry",
  note,
}: {
  layout?: "tiles" | "row";
  subject?: string;
  note?: string;
}) {
  const mail = `${CONTACT.emailMailto}?subject=${encodeURIComponent(subject)}`;
  const options = [
    {
      key: "call",
      label: "Call dispatch",
      detail: `${CONTACT.phoneDisplay} · 24/7`,
      href: CONTACT.phoneTel,
      icon: <IoCall className="h-5 w-5 text-[#c9a24f]" aria-hidden />,
      external: false,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      detail: "Message us, we reply fast",
      href: CONTACT.whatsappUrl,
      icon: <SiWhatsapp className="h-5 w-5 text-[#25d366]" aria-hidden />,
      external: true,
    },
    {
      key: "email",
      label: "Email",
      detail: CONTACT.email,
      href: mail,
      icon: <Mail className="h-5 w-5 text-[#c9a24f]" aria-hidden />,
      external: false,
    },
  ];

  if (layout === "row") {
    return (
      <div className="mt-6 text-center">
        {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
        <ul className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {options.map((o) => (
            <li key={o.key}>
              <a
                href={o.href}
                {...(o.external ? { target: "_blank", rel: "noreferrer" } : {})}
                data-track-label={`contact_${o.key}`}
                className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-foreground ring-1 ring-border transition-colors duration-200 hover:ring-[#c9a24f]"
              >
                {o.icon}
                {o.key === "call" ? CONTACT.phoneDisplay : o.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      {note ? <p className="mb-6 text-base leading-relaxed text-muted-foreground">{note}</p> : null}
      <ul className="grid gap-3">
        {options.map((o) => (
          <li key={o.key}>
            <a
              href={o.href}
              {...(o.external ? { target: "_blank", rel: "noreferrer" } : {})}
              data-track-label={`contact_${o.key}`}
              className="group flex items-center gap-4 rounded-[18px] p-4 ring-1 ring-border transition-colors duration-200 hover:ring-[#c9a24f] md:p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-[#c9a24f]/50">
                {o.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl text-foreground md:text-2xl">
                  {o.label}
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                  {o.detail}
                </span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-[#c9a24f]"
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
