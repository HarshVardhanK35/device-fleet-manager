import { useEffect } from "react";

const DURATION = 320;
const STEP = 70;
const MAX_INDEX = 6;
const EASING = "cubic-bezier(.2,.8,.2,1)";

// "Fade & rise" for the landing sections: opacity 0 -> 1 and translateY(24px)
// -> 0, items 70ms apart, played once, never looped.
// - [data-reveal="load"] plays on mount; other [data-reveal] sections play
//   once their top edge passes 90% of the viewport height.
// - Items are each direct child of the section's .wrap; a child marked
//   [data-grid] reveals its own children one by one instead.
// - Reduced motion: opacity only. Without Web Animations / IntersectionObserver
//   (or in a hidden tab) everything is simply visible.
// Used by: pages/Landing.jsx (rootRef = the landing wrapper).
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (!("animate" in Element.prototype) || !("IntersectionObserver" in window)) return undefined;
    if (document.visibilityState === "hidden") return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keyframes = reduce
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }];

    const all = [];
    const pending = new Map();

    const revealItems = (section) => {
      const wrap = section.querySelector(":scope > .wrap");
      const items = [];
      Array.from(wrap ? wrap.children : []).forEach((child) => {
        if (child.getAttribute("aria-hidden") === "true") return;
        if (child.hasAttribute("data-grid")) items.push(...child.children);
        else items.push(child);
      });
      return items.map((el, i) => {
        const anim = el.animate(keyframes, {
          duration: DURATION,
          delay: Math.min(i, MAX_INDEX) * STEP,
          easing: EASING,
          fill: "backwards",
        });
        anim.pause();
        anim.currentTime = 0;
        all.push(anim);
        return anim;
      });
    };

    const play = (anims) => anims.forEach((a) => a.play());

    root.querySelectorAll("[data-reveal]").forEach((section) => {
      const anims = revealItems(section);
      if (section.getAttribute("data-reveal") === "load") play(anims);
      else pending.set(section, anims);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          play(pending.get(entry.target) || []);
          pending.delete(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    pending.forEach((_, section) => io.observe(section));

    // Safety net for jump-scrolls and embedded frames.
    let ticking = false;
    let timer;
    const check = () => {
      ticking = false;
      const line = window.innerHeight * 0.9;
      pending.forEach((anims, section) => {
        if (section.getBoundingClientRect().top < line) {
          play(anims);
          pending.delete(section);
          io.unobserve(section);
        }
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      timer = setTimeout(check, 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    check();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      all.forEach((a) => a.cancel());
    };
  }, [rootRef]);
}
