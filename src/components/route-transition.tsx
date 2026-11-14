import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page changes cross-fade with the View Transitions API (animation in
 * styles.css, "Page transitions"). They are enabled here, after the first
 * render and only while the page is visible: a transition started in a
 * hidden tab (a link opened in the background) is aborted by the browser,
 * and on the initial load that held back the first render.
 *
 * Also routes plain same-origin <a href> clicks through the router so they
 * get the same transition and keep ?query and #hash.
 * Router <Link>s already navigate this way (they prevent the default first,
 * so this listener skips them); back/forward are left to the browser and the
 * router's scroll restoration.
 */
export function RouteTransition() {
  const router = useRouter();

  useEffect(() => {
    const supported = "startViewTransition" in document;
    const sync = () =>
      Object.assign(router.options, {
        defaultViewTransition: supported && !document.hidden && !prefersReducedMotion(),
      });
    sync();
    document.addEventListener("visibilitychange", sync);

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented)
        return;
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search)
        return;

      e.preventDefault();
      router.navigate({ href: url.pathname + url.search + url.hash });
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [router]);

  return null;
}
