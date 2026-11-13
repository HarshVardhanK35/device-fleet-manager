// One dynamic import per page, so the build makes a separate file for each and
// a visitor downloads a page only when they open it. The same loaders power
// prefetchRoute: hovering a side-navbar link starts the download early, so the
// page is usually already there by the time it is clicked.
// Used by: App.jsx (through lazyRetry), components/Layout.jsx (prefetchRoute).
export const pageLoaders = {
  landing: () => import("./pages/Landing.jsx"),
  login: () => import("./pages/Login.jsx"),
  register: () => import("./pages/Register.jsx"),
  forgotPassword: () => import("./pages/ForgotPassword.jsx"),
  resetPassword: () => import("./pages/ResetPassword.jsx"),
  verifyEmail: () => import("./pages/VerifyEmail.jsx"),
  dashboard: () => import("./pages/Dashboard.jsx"),
  content: () => import("./pages/Content.jsx"),
  playlists: () => import("./pages/Playlists.jsx"),
  assignments: () => import("./pages/Assignments.jsx"),
  playerSlots: () => import("./pages/PlayerSlots.jsx"),
  screens: () => import("./pages/Screens.jsx"),
  player: () => import("./pages/Player.jsx"),
  notFound: () => import("./pages/NotFound.jsx"),
  help: () => import("./pages/Help.jsx"),
  legal: () => import("./pages/Legal.jsx"),
  adminUsers: () => import("./pages/AdminUsers.jsx"),
  feedback: () => import("./pages/Feedback.jsx"),
  adminInbox: () => import("./pages/AdminInbox.jsx"),
};

const PAGE_BY_PATH = {
  "/": "dashboard",
  "/content": "content",
  "/playlists": "playlists",
  "/assignments": "assignments",
  "/player": "playerSlots",
  "/admin/users": "adminUsers",
  "/feedback": "feedback",
  "/admin/inbox": "adminInbox",
};

export function prefetchRoute(path) {
  const key = PAGE_BY_PATH[path];
  if (key) pageLoaders[key]();
}

// Once the app shell is on screen: fetch the main pages one by one while the browser is idle, so
// the "Loading page" mark rarely shows (a phone has no hover to start a download early).
export function prefetchMainPages() {
  const queue = ["/content", "/playlists", "/assignments", "/player", "/"];
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
  const next = () => {
    const path = queue.shift();
    if (!path) return;
    prefetchRoute(path);
    idle(next);
  };
  idle(next);
}
