import { useEffect } from "react";
import { CloudOff, FileQuestion, LockKeyhole, RefreshCw, TriangleAlert } from "lucide-react";

import BrandLoader from "../loading/BrandLoader.jsx";
import Logo from "../layout/Logo.jsx";

const KINDS = {
  notFound: {
    Icon: FileQuestion,
    title: "This page doesn't exist",
    text: "The link may be mistyped, or the page was moved.",
  },
  crash: {
    Icon: TriangleAlert,
    title: "Something went wrong",
    text: "This page hit a problem. Reloading usually fixes it.",
  },
  chunk: {
    Icon: RefreshCw,
    title: "This page couldn't load",
    text: "A newer version of CastWise may be available. Reload to get it.",
  },
  server: {
    Icon: CloudOff,
    title: "Can't reach the server",
    text: "It may be waking up, or your connection dropped. Try again in a moment.",
  },
  session: {
    Icon: LockKeyhole,
    title: "Your session has ended",
    text: "Sign in again to continue.",
  },
};

const PRIMARY =
  "inline-flex items-center justify-center h-10 px-4 rounded-lg bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white text-sm font-semibold transition-colors";
const SECONDARY =
  "inline-flex items-center justify-center h-10 px-4 rounded-lg border border-border-muted text-text-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary text-sm font-semibold transition-colors";

function reload() {
  window.location.reload();
}

// Plain links, not router links, on purpose: a full navigation also clears
// whatever broke, and this page must work even if the router is the problem.
function Actions({ kind, signedIn, onRetry }) {
  const home = "/";
  const homeLabel = signedIn ? "Go to dashboard" : "Back to home";

  if (kind === "notFound") {
    return (
      <a className={PRIMARY} href={home}>
        {homeLabel}
      </a>
    );
  }
  if (kind === "session") {
    return (
      <a className={PRIMARY} href="/login">
        Sign in
      </a>
    );
  }
  if (kind === "server") {
    return (
      <button type="button" className={PRIMARY} onClick={onRetry || reload}>
        Try again
      </button>
    );
  }
  return (
    <>
      <button type="button" className={PRIMARY} onClick={reload}>
        Reload
      </button>
      {kind === "crash" && (
        <a className={SECONDARY} href={home}>
          {homeLabel}
        </a>
      )}
    </>
  );
}

// A friendly page for things that go wrong: a mistyped URL (notFound), a page
// that crashed (crash), a page file that failed to load after a deploy
// (chunk), the server being unreachable (server) and an ended session
// (session). `fullScreen` for pages without the app shell; otherwise it fills
// the content area and the header and side navbar stay usable. Technical
// details (`error`) are hidden behind "Show details".
// Used by: components/ErrorBoundary.jsx, pages/NotFound.jsx.
function ErrorPage({ kind = "crash", error, signedIn = false, fullScreen = false, onRetry }) {
  const { Icon, title, text } = KINDS[kind] || KINDS.crash;
  const details = error ? String(error?.stack || error?.message || error) : "";

  return (
    <div
      className={`${fullScreen ? "min-h-screen bg-bg-primary" : "min-h-[60vh]"} flex items-center justify-center px-5 py-10`}
    >
      <div className="w-full max-w-[420px] flex flex-col items-center text-center gap-5">
        <Logo size={44} />
        <span className="w-12 h-12 rounded-full bg-bg-panel border border-border-muted flex items-center justify-center text-text-muted">
          <Icon size={22} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-2xl font-semibold text-text-primary">{title}</h1>
          <p className="m-0 text-text-muted">{text}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Actions kind={kind} signedIn={signedIn} onRetry={onRetry} />
        </div>
        {details && (
          <details className="w-full text-left">
            <summary className="cursor-pointer text-center text-[13px] text-text-muted hover:text-text-primary">
              Show details
            </summary>
            <pre className="mt-3 max-h-48 overflow-auto rounded-lg border border-border-muted bg-bg-panel p-3 text-xs text-text-muted whitespace-pre-wrap break-words">
              {details}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// For the screens that run unattended (the pairing page and the device
// player): no buttons, big text, and an automatic reload every 15 seconds
// until it comes back.
export function DeviceUnavailable() {
  useEffect(() => {
    const t = setTimeout(reload, 15000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#0d1117] text-center text-[#e6edf3] px-6">
      <Logo size={72} />
      <h1 className="m-0 text-3xl font-semibold">This screen is temporarily unavailable</h1>
      <div className="flex items-center gap-3 text-lg text-[#8b949e]">
        <BrandLoader size={28} label={null} />
        Reconnecting…
      </div>
    </div>
  );
}

export default ErrorPage;
