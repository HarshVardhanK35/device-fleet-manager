import { useEffect, useState } from "react";

import { getMe, refreshAccessToken, logout as logoutApi } from "../api/auth.js";
import { setAccessToken } from "../api/apiClient.js";
import { AuthContext } from "./authContextInstance.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      // On every fresh page load there's no access token in memory yet —
      // try to silently mint one from the httpOnly refresh cookie before
      // assuming the user is logged out.
      const res = await refreshAccessToken();
      if (res.token) {
        setAccessToken(res.token);
        setToken(res.token);
        const me = await getMe();
        if (me && !me.message) {
          setUser(me);
        }
      }
      setLoading(false);
    }
    bootstrap();
  }, []);

  function login(newToken, newUser) {
    setAccessToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    try {
      await logoutApi();
    } catch {
      // clear local state regardless of whether the network call succeeded
    }
    setAccessToken(null);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// In-memory auth state (no localStorage — that's the XSS fix). On mount,
// silently exchanges the httpOnly refresh cookie for a fresh access token
// so a page reload doesn't log the user out; apiClient.js does the same
// exchange again transparently whenever a request 401s mid-session.
// Used by: App.jsx (wraps everything), ProtectedRoute.jsx, Layout.jsx,
// Login.jsx.
