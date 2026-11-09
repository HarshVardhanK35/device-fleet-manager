import { useSyncExternalStore } from "react";

import { THEME } from "../components/screens/stage/stageTheme.js";

// The /screens page and the player's messages size everything from the screen
// with CSS container-query units (cqmin, cqw, cqh), clamp(), min(), max() and
// color-mix(). A TV's built-in browser is often several years old (a 2022
// Samsung runs Chromium 85, older ones far less) and drops a whole declaration
// it does not understand, so the text came out tiny and unstyled.
//
// `useStageCss()` returns css(value): it works the same value out in plain
// pixels and rgba() colours from the real screen size, so any browser can use
// the result. The stage always fills the screen, so a container unit is just a
// share of the window. It re-renders on resize / rotation.

const MIN_SPEC = /(clamp|min|max)\(([^()]*)\)/;
const CALC_SPEC = /calc\(([^()]*)\)/;
const UNIT_SPEC = /(-?\d*\.?\d+)(cqmin|cqmax|cqw|cqh|cqi|cqb|vmin|vmax)/g;

function subscribe(onChange) {
  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
  };
}

// One stable string per size, so React only re-renders when the size changes.
const getSize = () => `${window.innerWidth}x${window.innerHeight}`;

function px(text) {
  return parseFloat(String(text).replace("px", ""));
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function toRgb(color) {
  let c = String(color).trim();
  const variable = c.match(/^var\((--[\w-]+)\)$/);
  if (variable) c = THEME[variable[1]] || "#000000";
  if (c === "transparent") return [0, 0, 0, 0];
  const hex = c.replace("#", "");
  const full = hex.length === 3 ? hex.replace(/./g, "$&$&") : hex;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).concat(1);
}

// color-mix(in srgb, A p%, B) -> rgba(), for A and B a #hex, var(--theme-colour)
// or transparent (all this app uses).
function mixColors(args) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of args) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  const [, first, second] = parts; // parts[0] is "in srgb"
  const match = first.match(/^(.*\S)\s+(\d+(?:\.\d+)?)%$/);
  const amount = match ? parseFloat(match[2]) / 100 : 0.5;
  const a = toRgb(match ? match[1] : first);
  const b = toRgb(second);
  const alpha = a[3] * amount + b[3] * (1 - amount);
  const channel = (i) =>
    alpha === 0 ? 0 : Math.round((a[i] * a[3] * amount + b[i] * b[3] * (1 - amount)) / alpha);
  return `rgba(${channel(0)}, ${channel(1)}, ${channel(2)}, ${round(alpha)})`;
}

function replaceColorMix(value) {
  for (;;) {
    const start = value.indexOf("color-mix(");
    if (start === -1) return value;
    let depth = 0;
    let end = -1;
    for (let i = start + "color-mix".length; i < value.length; i += 1) {
      if (value[i] === "(") depth += 1;
      if (value[i] === ")") {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) return value;
    const inner = value.slice(start + "color-mix(".length, end);
    value = value.slice(0, start) + mixColors(inner) + value.slice(end + 1);
  }
}

// Works one CSS value out for a stage of width x height pixels.
export function resolveCss(value, width, height) {
  if (typeof value !== "string") return value;
  let out = replaceColorMix(value);
  const unit = {
    cqw: width / 100,
    cqi: width / 100,
    cqh: height / 100,
    cqb: height / 100,
    cqmin: Math.min(width, height) / 100,
    vmin: Math.min(width, height) / 100,
    cqmax: Math.max(width, height) / 100,
    vmax: Math.max(width, height) / 100,
  };
  out = out.replace(UNIT_SPEC, (_, n, u) => `${round(parseFloat(n) * unit[u])}px`);
  // innermost function first: clamp / min / max, then calc (only a * b is used)
  for (let guard = 0; guard < 20; guard += 1) {
    if (MIN_SPEC.test(out)) {
      out = out.replace(MIN_SPEC, (_, fn, list) => {
        const n = list.split(",").map(px);
        if (fn === "min") return `${round(Math.min(...n))}px`;
        if (fn === "max") return `${round(Math.max(...n))}px`;
        return `${round(Math.min(Math.max(n[1], n[0]), n[2]))}px`;
      });
    } else if (CALC_SPEC.test(out)) {
      out = out.replace(CALC_SPEC, (_, expr) => {
        const product = expr.split("*").reduce((acc, term) => acc * px(term), 1);
        return `${round(product)}px`;
      });
    } else {
      break;
    }
  }
  return out;
}

export function useStageCss() {
  const size = useSyncExternalStore(subscribe, getSize);
  const [width, height] = size.split("x").map(Number);
  return (value) => resolveCss(value, width, height);
}

// Used by: pages/Screens.jsx, components/screens/stage/*.jsx,
// components/screens/OfflineBanner.jsx.
