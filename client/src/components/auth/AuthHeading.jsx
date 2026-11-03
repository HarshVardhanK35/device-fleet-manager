// Optional circular icon badge (ForgotPassword, ResetPassword) + title +
// subtitle — Login/Register omit `icon`.
function AuthHeading({ icon: Icon, title, subtitle }) {
  return (
    <>
      {Icon && (
        <span className="w-11 h-11 rounded-xl bg-accent-blue/10 border border-accent-blue/25 text-accent-blue flex items-center justify-center">
          <Icon size={22} />
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl md:text-[26px] font-medium tracking-tight text-text-primary m-0">
          {title}
        </h1>
        <p className="text-text-muted m-0 text-pretty">{subtitle}</p>
      </div>
    </>
  );
}

export default AuthHeading;

// Title+subtitle header block (with an optional icon badge above it) — was
// duplicated near-identically across all 4 non-standalone auth pages.
// Renders as a fragment, so it drops straight into each page's existing
// `flex flex-col` form wrapper.
// Used by: pages/Login.jsx, pages/Register.jsx, pages/ForgotPassword.jsx,
// pages/ResetPassword.jsx.
