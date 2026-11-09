// Helpers for the "session ending" warning and the return-to-page after sign-in.

// The moment (ms since 1970) a JWT access token expires, or null.
export function tokenExpiry(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
}

// How many minutes a token lasts (from its issue time to its expiry), or null.
export function tokenMinutes(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp, iat } = JSON.parse(atob(payload));
    return exp && iat ? Math.round((exp - iat) / 60) : null;
  } catch {
    return null;
  }
}

const RETURN_KEY = "castwise:return-to";

// Only an in-app path is ever accepted, never another site or the auth pages.
const isSafePath = (p) =>
  typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/login") && p !== "/";

export function saveReturnTo(path) {
  if (isSafePath(path)) sessionStorage.setItem(RETURN_KEY, path);
}

// The page to open after signing in (once), or "/".
export function takeReturnTo(fromState) {
  const stored = sessionStorage.getItem(RETURN_KEY);
  sessionStorage.removeItem(RETURN_KEY);
  if (isSafePath(fromState)) return fromState;
  return isSafePath(stored) ? stored : "/";
}

// Used by: api/apiClient.js, components/auth/SessionExpiryWarning.jsx,
// components/auth/ProtectedRoute.jsx, pages/Login.jsx.
