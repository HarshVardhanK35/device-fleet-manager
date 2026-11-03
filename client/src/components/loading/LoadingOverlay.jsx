import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import BrandLoader from "./BrandLoader.jsx";

const SLOW_AFTER_MS = 15000;
const SLOW_MESSAGE = "Still working…";

// Full-screen blurred loading state with the animated CastWise logo, for the
// busy actions: app start / session check, sign in, register and forgot
// password, create / add / save / publish / delete / remove, take over, pairing.
// - It appears after `delay` ms (0 by default) and, once shown, stays at least
//   `minShow` ms, so a fast action still shows it long enough to see.
// - It blocks clicks behind it and sits above every modal (z-[100]).
// - After `slowAfter` ms (15 s) it adds a line, "Still working…" or `slowMessage`.
// Render unconditionally and control it with `show`. The busy button keeps
// its text label ("Deleting…") but no second spinner of its own.
// Used by: App.jsx (HomeRoute), ProtectedRoute.jsx, Login.jsx, Register.jsx,
// ForgotPassword.jsx, PublishModal.jsx, ConfirmDeleteModal.jsx,
// RemoveConfirmModal.jsx, TakeOverModal.jsx, ContentPickerModal.jsx,
// EditPlaylistModal.jsx, AssignmentCard.jsx, Playlists.jsx, PlayerSlots.jsx.
function LoadingOverlay({ show, delay = 0, minShow = 600, slowAfter = SLOW_AFTER_MS, slowMessage = SLOW_MESSAGE }) {
  const [visible, setVisible] = useState(false);
  const [shownAt, setShownAt] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let t;
    if (show && !visible) {
      t = setTimeout(() => {
        setShownAt(new Date().getTime());
        setVisible(true);
      }, delay);
    } else if (!show && visible) {
      const left = Math.max(0, minShow - (new Date().getTime() - shownAt));
      t = setTimeout(() => setVisible(false), left);
    }
    return () => clearTimeout(t);
  }, [show, visible, shownAt, delay, minShow]);

  useEffect(() => {
    if (!visible) return undefined;
    const t = setTimeout(() => setSlow(true), slowAfter);
    return () => {
      clearTimeout(t);
      setSlow(false);
    };
  }, [visible, slowAfter]);

  if (!visible) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="cw-overlay-in fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-bg-primary/60 backdrop-blur-md"
    >
      <BrandLoader size={88} label="Loading" />
      {slow && <p className="m-0 px-6 text-center text-sm text-text-muted">{slowMessage}</p>}
    </div>,
    document.body,
  );
}

export default LoadingOverlay;
