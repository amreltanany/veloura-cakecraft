import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Lenis smooth scroll synced with GSAP ScrollTrigger, plus fade-up reveals for
 * every element marked `data-reveal`. Returns the Lenis instance ref so callers
 * can pause it (e.g. while a dialog is open) and scroll to anchors.
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors (#cakes, #custom…) glide instead of jumping.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (!hash || hash.length < 2 || !document.querySelector(hash)) return;
      event.preventDefault();
      lenis.scrollTo(hash, { offset: -16 });
    };
    document.addEventListener("click", onClick);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      // Scaled up slightly so the drifting image never shows a gap inside its frame.
      gsap.fromTo("[data-parallax]", { yPercent: -4, scale: 1.1 }, {
        yPercent: 4,
        scale: 1.1,
        ease: "none",
        scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: true },
      });
    });

    return () => {
      ctx.revert();
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
