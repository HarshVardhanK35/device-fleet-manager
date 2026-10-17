import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { getCachedResults, setCachedResults } from "./geocodeCache.js";

const MIN_CHARS = 4;
const DEBOUNCE_MS = 600;

// Open-Meteo's weather API needs real coordinates, not a city name — this
// turns what the user types into that. Debounced (only searches after they
// pause typing) and cached (see geocodeCache.js), so typing "New York"
// doesn't fire a network call on every single keystroke.
async function searchLocations(query) {
  const cached = getCachedResults(query);
  if (cached) return cached;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed");
  const data = await res.json();

  const results = (data.results || []).map((r) => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    lat: r.latitude,
    lon: r.longitude,
  }));

  setCachedResults(query, results);
  return results;
}

// `value` is either null (nothing picked yet) or a resolved location object
// { name, country, admin1, lat, lon }. `onChange` is called with that full
// object only once the user actually picks a result from the dropdown —
// typing alone doesn't count as a valid location yet.
function LocationSearchField({ value, onChange }) {
  const [query, setQuery] = useState(value ? `${value.name}, ${value.country}` : "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  // -1 = nothing highlighted (mouse-only mode). Arrow keys move this;
  // Enter picks whichever result it's currently pointing at.
  const [highlighted, setHighlighted] = useState(-1);
  const boxRef = useRef(null);
  // One ref per result row, so the highlighted one can be scrolled into
  // view when arrow-key navigation moves past what's currently visible.
  const itemRefs = useRef([]);

  useEffect(() => {
    // All state updates happen inside the timer callback, not the effect
    // body itself — calling setState synchronously in an effect body can
    // cascade into extra renders, which React (and our lint rules) flag.
    // `cancelled` guards against a stale response landing after the user
    // has already typed something new (the effect re-ran before this one
    // finished).
    let cancelled = false;
    const trimmed = query.trim();

    const timer = setTimeout(async () => {
      if (trimmed.length < MIN_CHARS) {
        if (!cancelled) {
          setResults([]);
          setError(null);
        }
        return;
      }
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
      try {
        const matches = await searchLocations(trimmed);
        if (!cancelled) {
          setResults(matches);
          setOpen(true);
          setHighlighted(-1);
          setError(matches.length === 0 ? "No matching locations found." : null);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setError("Couldn't search locations right now — check your connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Keyboard navigation can move the highlight to a row that's scrolled
  // out of view (clipped by the dropdown's max-height) — this brings it
  // back into view, same as how a native <select> behaves.
  useEffect(() => {
    if (highlighted < 0) return;
    itemRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function pick(result) {
    onChange(result);
    setQuery(`${result.name}, ${result.country}`);
    setOpen(false);
  }

  // Lets the dropdown be used entirely from the keyboard — Down/Up move a
  // highlight through the results, Enter picks whatever's highlighted,
  // Escape closes without picking.
  function handleKeyDown(e) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      pick(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleType(e) {
    setQuery(e.target.value);
    setError(null);
    // Typing invalidates whatever was previously picked — the saved
    // location must always be a real geocoded result, never free text.
    if (value) onChange(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div ref={boxRef} className="relative">
        <MapPin
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          value={query}
          onChange={handleType}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. New York"
          className="w-full bg-bg-primary border border-border-muted rounded-lg pl-8 pr-8 h-9 text-sm text-text-primary outline-none focus-visible:border-accent-blue"
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted animate-spin"
          />
        )}
        {open && results.length > 0 && (
          <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-bg-panel border border-border-muted rounded-lg shadow-[0_8px_24px_rgba(1,4,9,0.55)] max-h-48 overflow-y-auto dark-scrollbar">
            {results.map((r, i) => (
              <button
                key={`${r.name}-${r.lat}-${i}`}
                ref={(el) => (itemRefs.current[i] = el)}
                type="button"
                onClick={() => pick(r)}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex flex-col w-full text-left px-3 py-2 transition-colors ${
                  highlighted === i ? "bg-bg-hover" : "hover:bg-bg-hover"
                }`}
              >
                <span className="text-sm text-text-primary">{r.name}</span>
                <span className="text-xs text-text-muted">
                  {[r.admin1, r.country].filter(Boolean).join(", ")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-accent-red font-medium m-0">{error}</p>}
    </div>
  );
}

export default LocationSearchField;
