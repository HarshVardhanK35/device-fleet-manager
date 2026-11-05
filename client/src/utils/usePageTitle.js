import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth.js";

// Browser tab title per page. The landing page ("/" signed out) sets its own
// title (pages/landing/usePageChrome.js) and restores this one on leave.
const TITLES = {
  "/": "Dashboard",
  "/content": "Content",
  "/playlists": "Playlists",
  "/assignments": "Assignments",
  "/player": "Screens",
  "/admin/users": "Users",
  "/admin/inbox": "Inbox",
  "/feedback": "Feedback",
  "/screens": "Pair this screen",
  "/login": "Sign in",
  "/register": "Create account",
  "/forgot-password": "Forgot password",
  "/reset-password": "Reset password",
  "/verify-email": "Verify email",
};

// Used by: App.jsx (TitleSync).
export function usePageTitle() {
  const { pathname } = useLocation();
  const { token } = useAuth();
  useEffect(() => {
    if (pathname === "/" && !token) return; // the landing page sets its own
    let page = TITLES[pathname];
    if (!page && pathname.startsWith("/player/")) page = "Screen";
    document.title = page ? `${page} · CastWise` : "CastWise";
  }, [pathname, token]);
}
