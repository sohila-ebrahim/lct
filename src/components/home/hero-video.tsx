import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A black Suburban gliding past a locked-off camera (client footage
 * IMG_0299.MOV, 4K/60fps, 0-4.9s, before a second vehicle enters). Graded
 * darker and cooler, slowed to exactly half speed (every 60fps source frame
 * shown once at 30fps, so the motion stays even), with a fade
 * in and out so the loop reads as one continuous shot. A wide detail crop
 * for desktop, a 9:16 crop for phones. It sits over the hero photo and only
 * fades in once it can play; reduced motion and Save-Data keep the photo.
 */
const SOURCES = {
  desktop: {
    src: "/assets/video/hero-suburban-desktop.mp4",
    poster: "/assets/video/hero-suburban-desktop.jpg",
  },
  mobile: {
    src: "/assets/video/hero-suburban-mobile.mp4",
    poster: "/assets/video/hero-suburban-mobile.jpg",
  },
};

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<(typeof SOURCES)["desktop"] | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    // Start loading only once the page has settled, so the video never
    // competes with the first paint, the booking widget or early scrolling.
    const start = () => setSource(mobile ? SOURCES.mobile : SOURCES.desktop);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number };
    let t = 0;
    const kick = () => {
      t = window.setTimeout(
        () => (w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 2000 }) : start()),
        800,
      );
    };
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", kick);
    };
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !source) return;
    let inView = true;
    let scrolling = false;
    let idle = 0;
    const play = () => {
      if (inView && !scrolling && !document.hidden) void v.play().catch(() => {});
    };
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) play();
        else v.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(v);
    // Hold the video still while the page is being scrolled and pick it up
    // again a moment after scrolling stops: decoding video under the booking
    // widget while scrolling is what made the page stutter.
    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        v.pause();
      }
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        scrolling = false;
        play();
      }, 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Native `loop` wraps seamlessly; this is only a fallback for mobile
    // browsers that stop a muted loop at the wrap-around.
    const onEnded = () => {
      v.currentTime = 0;
      play();
    };
    const onPause = () => {
      if (inView && !scrolling && !document.hidden) window.setTimeout(play, 120);
    };
    v.addEventListener("ended", onEnded);
    v.addEventListener("pause", onPause);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("pause", onPause);
    };
  }, [source]);

  if (!source) return null;

  return (
    <video
      ref={ref}
      src={source.src}
      poster={source.poster}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      onPlaying={() => setReady(true)}
      className={`absolute inset-0 h-full w-full bg-black object-cover transition-opacity duration-[1400ms] ease-out ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
