import { createPortal } from "react-dom";

function LoadingOverlay({ show }) {
  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm">
      <div className="flex gap-2.5">
        <span
          className="w-3 h-3 rounded-full bg-white dot-pulse"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="w-3 h-3 rounded-full bg-white dot-pulse"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="w-3 h-3 rounded-full bg-white dot-pulse"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </div>,
    document.body,
  );
}

export default LoadingOverlay;

// Full-screen blurred loading state for async auth actions (register,
// forgot-password, etc.) where the request can take several seconds
// (e.g. waiting on SMTP). Three dots cycle white -> accent-blue in
// sequence via staggered animationDelay. Render unconditionally and
// control visibility with the `show` prop.
// Used by: pages/Register.jsx.
