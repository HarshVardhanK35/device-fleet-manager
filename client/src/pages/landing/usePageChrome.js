import { useEffect } from "react";

const PAGE_TITLE = "CastWise · Turn any screen into something people read";
const BODY_BG = { dark: "#0d1117", light: "#ffffff" };

// The landing page's changes outside its own wrapper, all undone on leave:
// the tab title, smooth anchor scrolling (below the sticky header), and the
// <body> background so overscroll matches the chosen theme.
// Used by: pages/Landing.jsx.
export function usePageChrome(theme) {
  useEffect(() => {
    const html = document.documentElement;
    const prevTitle = document.title;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.title = PAGE_TITLE;
    html.style.scrollBehavior = reduce ? "auto" : "smooth";
    html.style.scrollPaddingTop = "80px";
    return () => {
      document.title = prevTitle;
      html.style.scrollBehavior = "";
      html.style.scrollPaddingTop = "";
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = BODY_BG[theme];
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, [theme]);
}
