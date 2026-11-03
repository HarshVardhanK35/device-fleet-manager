const KEY = "castwise-had-session";

// A harmless "this browser had a session" flag, so the app can skip asking a
// sleeping backend whether a session exists when nobody was ever signed in. It
// holds no token and no user data (the access token stays in memory only).
// Used by: context/AuthContext.jsx.
export function hasSessionHint() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    // Storage blocked: ask the backend, as before.
    return true;
  }
}

export function setSessionHint() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* the hint just isn't remembered */
  }
}

export function clearSessionHint() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
