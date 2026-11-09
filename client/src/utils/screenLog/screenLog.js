// A screen's own log: what the player did and why, kept on the screen so the owner can
// pull it later from the Player page ("Pull logs"). Works with no internet.
//
//   logEvent("play", "Next item: 3 of 8 ...", { reason: "timer" })   a line in the log
//   logWarn / logError                                              the same, louder
//   installScreenLog()                                              once, on the player pages:
//        - also records every console.log / warn / error (the [video], [offline] ... lines)
//        - records uncaught errors and unhandled promise rejections
//        - brings back what the page logged before a reload or a restart
//   readLogText()                                                   the whole log as plain text
//
// The log keeps the last 60 minutes, at most about 2 MB (the oldest lines go first). A copy
// of the newest ~1 MB is saved to this browser's storage a few seconds after a line is added,
// so a reload, a crash or a power cut loses only the last few seconds.

const MAX_AGE_MS = 60 * 60 * 1000;
const MAX_BYTES = 2 * 1024 * 1024;
const SAVE_BYTES = 1024 * 1024;
const SAVE_DELAY_MS = 4000;
const MAX_LINE = 1500; // one line is cut after this many characters
const STORAGE_KEY = "cw-screen-log-v1";

// entries: { t (epoch ms), level, line, count }
let entries = [];
let bytes = 0;
let saveTimer = null;
let installed = false;
const original = {};

const pad = (n, size = 2) => String(n).padStart(size, "0");

// 2026-11-09 21:40:12.345 (the device's own clock)
function stamp(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

// A screen's token and anything that looks like a secret must never end up in a log.
// `function` replacements, so a "$" in the text can't be misread.
export function redact(text) {
  return String(text)
    .replace(/\/(devices|player)\/([A-Za-z0-9_-]{16,})/g, (_, where, token) => `/${where}/…${token.slice(-6)}`)
    .replace(/([?&](?:token|key|password|secret|auth)=)[^&\s"']+/gi, (_, head) => `${head}…`);
}

function describe(value) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function trim(now) {
  while (entries.length > 0 && (entries[0].t < now - MAX_AGE_MS || bytes > MAX_BYTES)) {
    bytes -= entries[0].line.length + 30;
    entries.shift();
  }
}

function add(level, line) {
  const now = Date.now();
  let text = redact(line);
  if (text.length > MAX_LINE) text = `${text.slice(0, MAX_LINE)} …(cut)`;

  const last = entries[entries.length - 1];
  if (last && last.level === level && last.line === text) {
    last.count += 1; // the same line again: counted, not repeated
    last.last = now;
  } else {
    entries.push({ t: now, level, line: text, count: 1, last: now });
    bytes += text.length + 30;
    trim(now);
  }
  scheduleSave();
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(save, SAVE_DELAY_MS);
}

function save() {
  saveTimer = null;
  try {
    // the newest lines that fit in SAVE_BYTES
    let size = 0;
    let from = entries.length;
    while (from > 0 && size + entries[from - 1].line.length + 30 <= SAVE_BYTES) {
      from -= 1;
      size += entries[from].line.length + 30;
    }
    const rows = entries.slice(from).map((e) => [e.t, e.level, e.line, e.count, e.last]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // storage full or unavailable: the in-memory log still works
  }
}

function restore() {
  try {
    const rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const cutoff = Date.now() - MAX_AGE_MS;
    entries = rows
      .filter((r) => Array.isArray(r) && r[0] >= cutoff)
      .map((r) => ({ t: r[0], level: r[1], line: r[2], count: r[3] || 1, last: r[4] || r[0] }));
    bytes = entries.reduce((sum, e) => sum + e.line.length + 30, 0);
    return entries.length;
  } catch {
    entries = [];
    bytes = 0;
    return 0;
  }
}

// The one way to write a line. `details` (optional) is added as JSON after the message.
export function logEvent(area, message, details, level = "info") {
  const line = details === undefined ? `[${area}] ${message}` : `[${area}] ${message} ${describe(details)}`;
  add(level, line);
  const out = original[level === "info" ? "log" : level] || console[level === "info" ? "log" : level];
  out.call(console, `[${area}] ${message}`, ...(details === undefined ? [] : [details]));
}

export const logWarn = (area, message, details) => logEvent(area, message, details, "warn");
export const logError = (area, message, details) => logEvent(area, message, details, "error");

// A line written by something else (a widget in its iframe, the service worker): recorded
// as it arrived, without printing it to the console a second time.
export function logForeign(area, level, message) {
  add(level, `[${area}] ${message}`);
}

export function readLogText() {
  const now = Date.now();
  trim(now);
  return entries
    .map((e) => {
      const tag = e.level === "info" ? "INFO " : e.level === "warn" ? "WARN " : "ERROR";
      const repeat = e.count > 1 ? `  (x${e.count}, last at ${stamp(e.last).slice(11)})` : "";
      return `${stamp(e.t)} ${tag} ${e.line}${repeat}`;
    })
    .join("\n");
}

export const logSummary = () => ({
  lines: entries.length,
  approxKB: Math.round(bytes / 1024),
  oldest: entries[0] ? stamp(entries[0].t) : null,
  newest: entries.length ? stamp(entries[entries.length - 1].last) : null,
});

export function installScreenLog() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const restored = restore();

  for (const method of ["log", "info", "warn", "error"]) {
    original[method] = console[method];
    console[method] = (...args) => {
      add(method === "warn" ? "warn" : method === "error" ? "error" : "info", args.map(describe).join(" "));
      original[method].apply(console, args);
    };
  }

  window.addEventListener("error", (event) => {
    add(
      "error",
      `[page] uncaught error: ${event.message} at ${redact(event.filename || "?")}:${event.lineno || 0}:${event.colno || 0}`,
    );
  });
  window.addEventListener("unhandledrejection", (event) => {
    add("error", `[page] unhandled promise rejection: ${describe(event.reason)}`);
  });
  window.addEventListener("online", () => logEvent("network", "The browser says: online"));
  window.addEventListener("offline", () => logWarn("network", "The browser says: offline"));
  // Save at once when the page is hidden or closed.
  window.addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", () => {
    logEvent("page", `Page is now ${document.visibilityState}`);
    if (document.visibilityState === "hidden") save();
  });

  logEvent("page", `Page started (${restored} lines restored from before the reload)`, {
    path: redact(window.location.pathname),
  });
}

// Used by: main.jsx (install), everything that logs, utils/screenLog/screenLogPull.js (read).
