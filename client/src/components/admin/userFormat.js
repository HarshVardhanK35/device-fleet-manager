// Small helpers for showing a user in the admin list and details.
// Used by: pages/AdminUsers.jsx and the other files in components/admin/.

export const fullName = (u) => `${u.firstName} ${u.lastName || ""}`.trim();

// Accounts created before usernames existed have none: show the name instead.
export const displayUsername = (u) => u.username || fullName(u);

// "3 Nov 2026"
export const formatJoined = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
