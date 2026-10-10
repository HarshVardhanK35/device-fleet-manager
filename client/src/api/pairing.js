import { apiFetch } from "./apiClient.js";

// Public/unauthenticated — same reasoning as Player.jsx's own /connect
// call: these run on pages with no logged-in user (Screens.jsx), so they
// must NOT go through apiFetch, which attaches a stale/null token and
// redirects to /login on a 401 that would never legitimately happen here.
export async function generatePairingCode() {
  const res = await fetch("http://localhost:5000/pairing/generate", {
    method: "POST",
  });
  return res.json();
}

export async function getPairingStatus(code) {
  const res = await fetch(`http://localhost:5000/pairing/${code}/status`);
  return res.json();
}

// Authenticated — called from PlayerSlots.jsx, inside the logged-in app
// shell, so this one does need apiFetch's Bearer token attachment.
export async function claimPairingCode(code, data) {
  return apiFetch(`http://localhost:5000/pairing/${code}/claim`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Error responses from the pairing endpoints are always { message }; a
// successful claim returns the created Device (no `message` field) — same
// success/error shape convention already used by api/auth.js's callers
// (see pages/Login.jsx's `response.message` checks).
