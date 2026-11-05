import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { getFeedbackIndicator } from "../api/feedback.js";
import { useAuth } from "../context/useAuth.js";

const CHANGED = "castwise:feedback-changed";

// Pages call this after anything that can change a red dot (a message sent or
// deleted, the Feedback page opened, an inbox status changed).
export function notifyFeedbackChanged() {
  window.dispatchEvent(new Event(CHANGED));
}

// The numbers behind the red dots on the Feedback / Inbox links:
//   unread    the user's messages the admin has changed since they last looked
//   adminOpen (admins) messages still Sent or Seen
// Checked when the shell loads, after each page change and when a page says
// something changed. No timer, nothing live.
// Used by: components/layout/Layout.jsx.
export function useFeedbackIndicator() {
  const { token, user } = useAuth();
  const { pathname } = useLocation();
  const [indicator, setIndicator] = useState({ unread: 0, adminOpen: 0 });

  useEffect(() => {
    if (!token || !user) return undefined;
    let cancelled = false;
    function load() {
      getFeedbackIndicator()
        .then((res) => {
          if (!cancelled && typeof res?.unread === "number") {
            setIndicator({ unread: res.unread, adminOpen: res.adminOpen || 0 });
          }
        })
        .catch(() => {});
    }
    load();
    window.addEventListener(CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(CHANGED, load);
    };
  }, [token, user, pathname]);

  return indicator;
}
