// A screen's name (or type) is shown whole on one line, so a list card keeps its two-line height:
// the longer the name, the smaller its font and the status text beside it (a short name keeps the
// full sizes). cqw is the card's own width (the `@container` class on the card); the status column
// needs about 10 x its font size in px, plus the 12px gap, so the rest is left to the name.

// Font size (px) of the status text for a screen with this name: 12, 11 or 10, never smaller, so the
// status and last-seen text stay easy to read even beside a long name.
export const statusFont = (name) => {
  const length = String(name).length;
  return length <= 14 ? 12 : length <= 22 ? 11 : 10;
};

// CSS font-size for `text`, given the status font size; `glyph` is the text's average character
// width in em, `min` / `max` the size limits in px.
export const fitFont = (text, status, glyph, min, max) =>
  `clamp(${min}px, calc((100cqw - 12px - ${Math.round(status * 10)}px) / ${Math.max(String(text).length, 1) * glyph}), ${max}px)`;

// Used by: components/screens/slots/SlotRail.jsx, pages/Assignments.jsx.
