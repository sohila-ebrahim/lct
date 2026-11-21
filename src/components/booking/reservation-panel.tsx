import { QuickReservation } from "@/components/booking/quick-reservation";
import { ContactOptions } from "@/components/contact-options";

/**
 * A page's reservation block: MyLimoBiz's Quick Reservation in its own ivory
 * look (so the trip goes straight into the company's booking system), with
 * call, WhatsApp and email underneath for quotes and questions.
 */
export function ReservationPanel({
  subject,
  note = "Need a quote, a Sprinter or a coach? Talk to dispatch directly.",
}: {
  subject?: string;
  note?: string;
}) {
  return (
    <div>
      <div className="rounded-[20px] bg-[#fcf9f6] p-3 ring-1 ring-[#c9a24f]/30 md:p-4">
        <QuickReservation tone="plain" />
      </div>
      <ContactOptions layout="row" subject={subject} note={note} />
    </div>
  );
}
