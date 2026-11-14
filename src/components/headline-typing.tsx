import { useEffect } from "react";
import { startHeadlineTyping } from "@/lib/typing";

/** Mounts the sitewide headline typing (see src/lib/typing.ts). */
export function HeadlineTyping() {
  useEffect(() => startHeadlineTyping(), []);
  return null;
}
