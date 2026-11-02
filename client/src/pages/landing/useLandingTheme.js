import { useEffect, useState } from "react";

const THEME_KEY = "castwise-theme";

function readSaved() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

// Landing-page theme: the saved choice, else the system preference (followed
// live until the visitor clicks the toggle). Scoped to the landing wrapper,
// never touches the app's own theme. Returns [theme, toggle].
// Used by: pages/Landing.jsx.
export function useLandingTheme() {
  const [theme, setTheme] = useState(() => readSaved() || systemTheme());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e) => {
      if (readSaved()) return;
      setTheme(e.matches ? "light" : "dark");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  };

  return [theme, toggle];
}
