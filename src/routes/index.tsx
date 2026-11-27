import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { SiteLayout } from "@/components/site-layout";
import { CinematicHero } from "@/components/home/cinematic-hero";
import { TrustedBy } from "@/components/trusted-by";
import { Capabilities } from "@/components/home/capabilities";
import { PillarsSlider } from "@/components/home/pillars-slider";
import { Showroom } from "@/components/home/showroom";
import { IMAGES } from "@/lib/image-map";
import { CONTACT } from "@/lib/site-data";
import { ensureGsap, prefersReducedMotion, refreshScrollTriggers } from "@/lib/motion";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => {
    const meta = pageMeta({
      title: "LCT Universal — Executive Transportation in Dallas–Fort Worth",
      description: `Premium chauffeured transportation in ${CONTACT.serviceRegion}. Airport transfers, corporate travel, and VIP service. Available 24/7.`,
      path: "/",
    });
    return {
      ...meta,
      links: [
        ...meta.links,
        // Split by breakpoint so mobile never pays to download the desktop
        // hero image it will never display (and vice versa) — matching the
        // `<picture>` source swap in CinematicHero.
        {
          rel: "preload",
          as: "image",
          href: IMAGES.heroMobile.src,
          media: "(max-width: 767px)",
          fetchPriority: "high" as never,
        },
        {
          rel: "preload",
          as: "image",
          href: IMAGES.hero.src,
          media: "(min-width: 768px)",
          fetchPriority: "high" as never,
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  useLayoutEffect(() => {
    ensureGsap();
    if (prefersReducedMotion()) return;
    const onLoad = () => refreshScrollTriggers();
    window.addEventListener("load", onLoad);
    const t = window.setTimeout(() => refreshScrollTriggers(), 400);
    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <SiteLayout>
      <CinematicHero />
      <TrustedBy />
      <Capabilities />
      <Showroom />
      <PillarsSlider />
    </SiteLayout>
  );
}
