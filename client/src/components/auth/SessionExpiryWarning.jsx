import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Clock } from "lucide-react";

import { refreshAccessToken } from "../../api/auth.js";
import { getAccessToken, setAccessToken, subscribeToken } from "../../api/apiClient.js";
import { useAuth } from "../../context/useAuth.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { saveReturnTo, tokenExpiry, tokenMinutes } from "../../utils/sessionExpiry.js";
import Button from "../ui/Button.jsx";

const WARN_SECONDS = 5 * 60; // the warning opens this long before the session ends

const formatLeft = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// "Your session ends in m:ss": opens 5 minutes before the access token expires.
// Stay signed in renews it with the refresh cookie; at 0:00 the user is sent to
// the sign-in page with the reason. Checks the real clock every second and when
// a hidden tab comes back (hidden tabs slow their timers down).
function SessionWatcher() {
  const { logout } = useAuth();
  const [expiry, setExpiry] = useState(() => tokenExpiry(getAccessToken()));
  const [left, setLeft] = useState(null); // seconds, null while there is no warning
  const [error, setError] = useState("");
  const [minutes, setMinutes] = useState(() => tokenMinutes(getAccessToken()));
  const ending = useRef(false);

  useEffect(
    () =>
      subscribeToken((token) => {
        setExpiry(tokenExpiry(token));
        setMinutes(tokenMinutes(token));
      }),
    [],
  );

  useEffect(() => {
    if (!expiry) return undefined;
    function check() {
      const seconds = Math.ceil((expiry - Date.now()) / 1000);
      setLeft(seconds > WARN_SECONDS ? null : Math.max(seconds, 0));
    }
    const id = setInterval(check, 1000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, [expiry]);

  function endSession() {
    if (ending.current) return;
    ending.current = true;
    saveReturnTo(window.location.pathname + window.location.search);
    window.location.href = "/login?expired=1";
  }

  useEffect(() => {
    if (left === 0) endSession();
  }, [left]);

  const [stay, staying] = useAsyncAction(async () => {
    setError("");
    try {
      const res = await refreshAccessToken();
      if (!res?.token) {
        endSession();
        return;
      }
      setAccessToken(res.token);
      setLeft(null);
    } catch {
      setError("Couldn't reach the server. Try again.");
    }
  });

  const open = expiry !== null && left !== null;

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed inset-0 z-[90] m-auto h-fit w-[440px] max-w-[calc(100vw-32px)] rounded-xl border border-border-muted bg-bg-panel outline-none"
        >
          <div className="flex items-start gap-3 px-6 pt-6 pb-5">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[rgba(227,179,65,.15)] text-[#e3b341]">
              <Clock size={18} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
              <Dialog.Title className="m-0 text-lg font-bold leading-tight text-text-primary">
                Your session ends in {formatLeft(left ?? 0)}
              </Dialog.Title>
              <Dialog.Description className="m-0 text-sm text-text-muted">
                For your security, sessions last {minutes ?? "a few"} minutes. Stay signed in to keep working.
              </Dialog.Description>
              {error && (
                <p role="alert" className="m-0 pt-1 text-[13px] text-[#ff7b72]">
                  {error}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border-muted px-6 py-4">
            <button
              type="button"
              onClick={logout}
              disabled={staying}
              className="h-10 rounded-lg border border-border-muted px-4 text-sm font-semibold text-text-muted transition-colors hover:border-border-hover hover:bg-bg-hover hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
            >
              Sign out now
            </button>
            <Button onClick={stay} disabled={staying}>
              {staying ? "Renewing…" : "Stay signed in"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Device screens (/screens and /player/<token>) are never signed in as a person
// and must never be sent to the sign-in page, so the warning is off there.
// (/player, the page in the app where you manage screens, keeps it.)
function SessionExpiryWarning() {
  const { pathname } = useLocation();
  if (pathname === "/screens" || pathname.startsWith("/player/")) return null;
  return <SessionWatcher />;
}

export default SessionExpiryWarning;

// Opens 5 minutes before the access token expires (15 min sessions).
// Used by: App.jsx.
