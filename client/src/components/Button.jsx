function Button({
  variant = "primary",
  icon: Icon,
  children,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-0 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1f6feb]";

  const variantClasses = {
    primary:
      "bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white",
    outline:
      "border border-accent-blue text-accent-blue hover:bg-accent-blue/10 bg-transparent",
  };

  return (
    <button
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

export default Button;

// Shared button matching the app's standard dimensions/colors exactly
// (40px min-height, 16px horizontal padding, #1f6feb fill — pulled from
// DevTools computed values on the original mock, not guessed). Two variants:
// "primary" (solid blue, default) and "outline" (transparent, blue border).
// Pass `icon` as a lucide-react component (not a rendered element).
// Only for single/whole buttons — NOT for the green split-button pattern
// (Upload, Add a playlist), which is a different style family.
// Used by: pages/Assignments.jsx, pages/Content.jsx, pages/Playlists.jsx.
