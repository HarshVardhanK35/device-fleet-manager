import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { getCachedResults, setCachedResults } from "./geocodeCache.js";

const MIN_CHARS = 3;
const DEBOUNCE_MS = 550;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function contextText(context, idPrefix) {
  return context?.find((c) => c.id.startsWith(idPrefix))?.text ?? null;
}

// Mapbox's own Geocoding API does real server-side fuzzy/prefix matching
// (unlike Open-Meteo's geocoding, which only ever matches from the start of
// a name) — "new y" correctly resolves to New York, and a misspelling like
// "visha" still gets a reasonable match. That's what lets this field do
// live-as-you-type search safely, debounced, instead of only searching on
// Enter.
async function searchLocations(query) {
  const cached = getCachedResults(query);
  if (cached) return cached;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_TOKEN}&types=place,locality&limit=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed");
  const data = await res.json();

  const results = (data.features || []).map((f) => ({
    name: f.text,
    country: contextText(f.context, "country"),
    admin1: contextText(f.context, "region"),
    lat: f.center[1],
    lon: f.center[0],
  }));

  setCachedResults(query, results);
  return results;
}

// `value` is either null (nothing picked yet) or a resolved location object
// { name, country, admin1, lat, lon }. `onChange` is called with that full
// object only once the user actually picks a result from the dropdown —
// typing alone doesn't count as a valid location yet.
// `showHint` (default true) renders the "Start typing to search for a
// location." line above the field. Set to false when several of these
// fields are rendered together (e.g. 3 city fields in a row) and the
// caller shows that same hint once, above the whole group, instead of
// repeating it per field.
function LocationSearchField({ value, onChange, showHint = true }) {
  const [query, setQuery] = useState(value ? `${value.name}, ${value.country}` : "");
  // Tracks the last `value` this component itself produced (via pick() or
  // the "typing invalidates it" path in handleType) — lets the effect below
  // tell "value changed because of something I did" apart from "value
  // changed because the parent reassigned it externally" (e.g. removing a
  // middle city from a multi-city list reindexes the array, handing this
  // same mounted instance a different city's data under the same key).
  // Only the second case should overwrite what's currently in the input.
  const lastEmittedValue = useRef(value);
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
  const debounceRef = useRef(null);
  // Guards against an OLDER search resolving after a NEWER one (fast
  // typing can fire requests that don't resolve in the order they were
  // sent) — only the latest-issued search's result is ever applied.
  const latestRequestId = useRef(0);

  useEffect(() => {
    function handleOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (highlighted < 0) return;
    itemRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  // Resyncs the displayed text only when `value` changed externally (see
  // lastEmittedValue above) — e.g. a sibling city's removal shifted this
  // slot's data. Never fires for changes this component made itself, so it
  // can't fight normal typing (which nulls `value` on every keystroke once
  // something was previously picked).
  useEffect(() => {
    if (value === lastEmittedValue.current) return;
    lastEmittedValue.current = value;
    setQuery(value ? `${value.name}, ${value.country}` : "");
  }, [value]);

  // Clears any pending debounced search on unmount so it can't call
  // setState after the component is gone.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function pick(result) {
    lastEmittedValue.current = result;
    onChange(result);
    setQuery(`${result.name}, ${result.country}`);
    setOpen(false);
  }

  async function runSearch(text) {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    try {
      const matches = await searchLocations(text);
      if (requestId !== latestRequestId.current) return; // superseded by a newer search
      setResults(matches);
      setOpen(true);
      setHighlighted(-1);
      setError(matches.length === 0 ? "No matching locations found." : null);
    } catch {
      if (requestId !== latestRequestId.current) return;
      setResults([]);
      setError("Couldn't search locations right now — check your connection.");
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown" && open && results.length > 0) {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && open && results.length > 0) {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && results[highlighted]) pick(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Debounced live search — waits for a pause in typing before calling the
  // API, so a fast typist only triggers one request, not one per
  // keystroke.
  function handleType(e) {
    const text = e.target.value;
    setQuery(text);
    setError(null);
    // Typing invalidates whatever was previously picked — the saved
    // location must always be a real geocoded result, never free text.
    if (value) {
      lastEmittedValue.current = null;
      onChange(null);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = text.trim();
    if (trimmed.length < MIN_CHARS) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => runSearch(trimmed), DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {showHint && (
        <p className="text-xs text-text-muted m-0">Start typing to search for a location.</p>
      )}
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
