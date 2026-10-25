// Parsing/formatting for the Content Details panel's "Custom" duration
// field — accepts a plain number (read against whatever unit is currently
// selected), a number with an explicit unit suffix ("5m", "90s", "2h"), or
// mm:ss shorthand ("1:30"). Used alongside the unit-toggle badge (s/min/h).

export const DURATION_UNIT_SECONDS = { s: 1, min: 60, h: 3600 };
export const DURATION_UNIT_CYCLE = ["s", "min", "h"];
export const MIN_DURATION_SECONDS = 1;
export const MAX_DURATION_SECONDS = 24 * 3600;

// `currentUnit` is only used when `raw` is a bare number with no suffix —
// an explicit suffix or mm:ss always wins over whatever unit was selected.
export function parseDurationInput(raw, currentUnit) {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  const colonMatch = trimmed.match(/^(\d+):([0-5]?\d)$/);
  if (colonMatch) {
    const minutes = Number(colonMatch[1]);
    const seconds = Number(colonMatch[2]);
    return { seconds: minutes * 60 + seconds, unit: "s" };
  }

  const suffixMatch = trimmed.match(
    /^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)?$/,
  );
  if (!suffixMatch) return null;

  const value = Number(suffixMatch[1]);
  const suffix = suffixMatch[2];
  let unit = currentUnit;
  if (suffix) {
    unit = suffix.startsWith("h") ? "h" : suffix.startsWith("m") ? "min" : "s";
  }

  return { seconds: value * DURATION_UNIT_SECONDS[unit], unit };
}

export function isDurationInRange(seconds) {
  return (
    Number.isFinite(seconds) &&
    seconds >= MIN_DURATION_SECONDS &&
    seconds <= MAX_DURATION_SECONDS
  );
}

// "90" -> "1 min 30 s (90 s)". Drops zero-value components (e.g. 60 ->
// "1 min (60 s)", not "1 min 0 s (60 s)").
export function formatDurationHuman(totalSeconds) {
  const whole = Math.round(totalSeconds);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;

  const parts = [];
  if (h) parts.push(`${h} h`);
  if (m) parts.push(`${m} min`);
  if (s || parts.length === 0) parts.push(`${s} s`);

  return `${parts.join(" ")} (${whole} s)`;
}

// Seconds -> the display string for a given unit, e.g. (90, "min") -> "1.5".
// Trims to at most 2 decimals and drops a trailing ".0"/".00".
export function secondsToUnitDisplay(totalSeconds, unit) {
  const value = totalSeconds / DURATION_UNIT_SECONDS[unit];
  return String(Math.round(value * 100) / 100);
}
