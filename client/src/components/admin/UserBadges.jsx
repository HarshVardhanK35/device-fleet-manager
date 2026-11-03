const BADGE = "inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-xs font-medium whitespace-nowrap";

export function RoleBadge({ role }) {
  return role === "admin" ? (
    <span className={`${BADGE} bg-accent-blue/15 text-accent-blue ring-1 ring-inset ring-accent-blue/35`}>Admin</span>
  ) : (
    <span className={`${BADGE} text-text-muted ring-1 ring-inset ring-border-muted`}>User</span>
  );
}

// `short` gives "Yes" / "No" for the details panel; the list says
// "Verified" / "Not verified".
export function VerifiedBadge({ verified, short = false }) {
  return (
    <span
      className={`${BADGE} ${
        verified ? "bg-accent-green/15 text-accent-green" : "bg-accent-amber/15 text-accent-amber"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${verified ? "bg-accent-green" : "bg-accent-amber"}`} />
      {verified ? (short ? "Yes" : "Verified") : short ? "No" : "Not verified"}
    </span>
  );
}

// Used by: components/admin/UserList.jsx, components/admin/UserDetails.jsx.
