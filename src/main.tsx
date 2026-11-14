import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
// Self-hosted fonts (bundled into dist/assets, same origin) instead of a
// render-blocking <link> to fonts.googleapis.com in index.html. A business
// firewall that silently drops Google Fonts used to block first paint and
// delay this module script until that request timed out — reproduced as a
// fully blank page in headless Chromium with fonts.googleapis.com dropped.
// Montserrat (display headlines) + Inter (body), one variable file
// each, Latin subsets loaded on demand by unicode-range.
import "@fontsource-variable/montserrat/wght.css";
import "@fontsource-variable/inter/wght.css";
import "./styles.css";
import { forwardMyLimoBizReturnToBook } from "./lib/mylimobiz-return-routing";
import { STATIC_HEAD_ATTR } from "./lib/site-head";

// Before the router reads the URL — see the module for why.
forwardMyLimoBizReturnToBook();

// The static title/meta/JSON-LD written into index.html for non-JS crawlers
// (see src/lib/site-head.ts). <HeadContent/> appends its own copies rather
// than replacing them, so drop the static ones before it renders.
document.querySelectorAll(`[${STATIC_HEAD_ATTR}]`).forEach((el) => el.remove());

const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// The first-load waiting arrows (index.html) go once the site has painted,
// after at least three blinks (about 2s from the start of the page load).
requestAnimationFrame(() =>
  window.setTimeout(
    () => document.getElementById("boot-signal")?.remove(),
    Math.max(0, 1980 - performance.now()),
  ),
);
