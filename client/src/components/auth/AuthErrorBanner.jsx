// `tone`: "red" (default — Login, Register, ForgotPassword) or "amber"
// (ResetPassword's expired-token case).
function AuthErrorBanner({ icon: Icon, tone = "red", children }) {
  const toneClass =
    tone === "amber"
      ? "bg-accent-amber/10 border-accent-amber/35 text-accent-amber"
      : "bg-accent-red/10 border-accent-red/35 text-accent-red";

  return (
    <div
      className={`flex gap-2.5 items-start px-3 py-2.5 rounded-lg border text-[13px] ${toneClass}`}
    >
      <Icon size={17} className="flex-none mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export default AuthErrorBanner;

// Inline form error banner — same box/icon/text layout was duplicated in
// Login.jsx, Register.jsx, ForgotPassword.jsx (red) and ResetPassword.jsx
// (amber). `children` carries any extra inline content (Login's "Resend
// verification email" link, ResetPassword's "Request a new one" link).
// Used by: pages/Login.jsx, pages/Register.jsx, pages/ForgotPassword.jsx,
// pages/ResetPassword.jsx.
