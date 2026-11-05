// The small button set the Feedback screens share (spec: Direction A).
const BASE =
  "inline-flex items-center justify-center gap-1.5 h-11 md:h-9 px-3.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-45 disabled:cursor-not-allowed";

const VARIANTS = {
  primary: "bg-[#1f6feb] text-white hover:bg-[#388bfd]",
  secondary: "bg-bg-panel border border-border-muted text-text-primary hover:bg-bg-hover",
  danger: "bg-[#da3633] text-white hover:bg-[#e5534b]",
  ghostDanger: "text-[#ff7b72] hover:bg-bg-hover",
};

export function FbButton({ variant = "secondary", className = "", ...props }) {
  return <button type="button" className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

// Phone footer: the buttons share the width. Tablet and up use FooterRight.
export function FooterSplit({ children, single = false }) {
  return (
    <div className={`md:hidden grid ${single ? "grid-cols-1" : "grid-cols-2"} gap-2 px-4 pt-3 pb-4 border-t border-border-muted`}>
      {children}
    </div>
  );
}

export function FooterRight({ children }) {
  return <div className="hidden md:flex items-center justify-end gap-2 px-5 py-3 border-t border-border-muted">{children}</div>;
}

// Used by: components/feedback/*.jsx.
