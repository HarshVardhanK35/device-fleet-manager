import { Navigate } from "react-router-dom";

import { useAuth } from "../context/useAuth.js";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    // AuthContext is still trying to silently refresh from the httpOnly
    // cookie — wait for that before deciding, otherwise a logged-in user
    // would flash-redirect to /login on every page reload.
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

// Guards every authenticated route. Token now lives in AuthContext
// (in-memory only, no localStorage) — a logged-out tab finds out on its
// next API call (which 401s and fails the silent-refresh retry in
// apiClient.js), not instantly via a storage event, since there's no
// localStorage key to watch anymore.
// Used by: App.jsx, wrapping Dashboard/Content/Assignments/Playlists/Publish.
