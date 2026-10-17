// Caches geocoding search results in localStorage, keyed by the search
// text typed (lowercased/trimmed). Unlike weather data, a place's
// coordinates never go stale — "New York" is always the same lat/lon — so
// there's no time-based expiry here. The only real concern is the cache
// growing forever, so it's capped at MAX_ENTRIES: once full, the
// least-recently-used entry is dropped to make room for a new one.
const STORAGE_KEY = "dfm_geocode_cache_v1";
const MAX_ENTRIES = 50;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full/unavailable (private browsing, etc.) — the cache is
    // just a call-saving optimization, so fail silently rather than break
    // the search.
  }
}

export function getCachedResults(query) {
  const cache = readCache();
  const entry = cache[query];
  if (!entry) return null;

  // Reading counts as "using" it — bump lastUsed so it doesn't get evicted
  // just for being old, as long as it keeps getting searched for.
  entry.lastUsed = Date.now();
  cache[query] = entry;
  writeCache(cache);
  return entry.results;
}

export function setCachedResults(query, results) {
  const cache = readCache();
  cache[query] = { results, lastUsed: Date.now() };

  const keys = Object.keys(cache);
  if (keys.length > MAX_ENTRIES) {
    const oldestKey = keys.reduce((a, b) => (cache[a].lastUsed < cache[b].lastUsed ? a : b));
    delete cache[oldestKey];
  }

  writeCache(cache);
}
