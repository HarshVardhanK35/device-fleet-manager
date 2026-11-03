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
};

const PAGE_BY_PATH = {
  "/": "dashboard",
  "/content": "content",
  "/playlists": "playlists",
  "/assignments": "assignments",
  "/player": "playerSlots",
};

export function prefetchRoute(path) {
  const key = PAGE_BY_PATH[path];
  if (key) pageLoaders[key]();
}
