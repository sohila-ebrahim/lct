import { CONTACT } from "@/lib/site-data";

/** What a visitor reads when a form submission is refused or fails. */
export function errorMessageFor(code: string | undefined): string {
  switch (code) {
    case "duplicate_submission":
      return "It looks like this request was already submitted. If you don't hear back soon, please call us directly.";
    case "rate_limited":
      return "Please wait a moment before submitting again.";
    case "validation_failed":
      return "Please check the highlighted fields and try again.";
    default:
      return `We could not save your request right now. Please try again shortly or call ${CONTACT.phoneDisplay}.`;
  }
}

/** One random token per form instance, used to drop duplicate submissions. */
export function randomToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
