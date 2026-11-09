// What the /screens page keeps in this browser (localStorage).

// This browser's memory of its own pairing — once a physical screen pairs
// successfully, it shouldn't have to re-pair from scratch every time the
// tab reloads or playback is stopped. Scoped to this one browser/device,
// same as how real signage hardware remembers its own setup.
const STORAGE_KEY = "dfm.screen.pairing";

export function readStoredPairing() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.screenToken ? parsed : null;
  } catch {
    return null;
  }
}

export function storePairing(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private browsing / storage disabled — the screen just won't
    // remember itself across reloads; pairing still works either way.
  }
}

export function clearStoredPairing() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// When the server said it would give codes again (ms since 1970). Kept in the
// browser so a reload doesn't ask again too early; gone once the time passes.
const RETRY_KEY = "dfm.screen.codes-retry-at";

export function readRetryAt() {
  try {
    const until = Number(localStorage.getItem(RETRY_KEY));
    return until > Date.now() ? until : null;
  } catch {
    return null;
  }
}

export function storeRetryAt(until) {
  try {
    localStorage.setItem(RETRY_KEY, String(until));
  } catch {
    // storage disabled: the screen just retries from the page's own timer
  }
}

// Used by: hooks/usePairing.js, pages/Screens.jsx.
