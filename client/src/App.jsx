import { BrowserRouter, Routes, Route } from "react-router-dom";

// all pages here
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Content from "./pages/Content.jsx";
import Assignments from "./pages/Assignments.jsx";
import Playlists from "./pages/Playlists.jsx";
import Player from "./pages/Player.jsx";
import PlayerSlots from "./pages/PlayerSlots.jsx";
import Screens from "./pages/Screens.jsx";
import Landing from "./pages/Landing.jsx";
import LoadingOverlay from "./components/LoadingOverlay.jsx";
import { useAuth } from "./context/useAuth.js";

// "/" is the dashboard for signed-in users and the public landing page for
// everyone else (same URL, no redirect). Waits for the silent refresh so a
// signed-in user never sees the landing page flash.
function HomeRoute() {
  const { token, loading } = useAuth();
  if (loading) return <LoadingOverlay show />;
  if (!token) return <Landing />;
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/player/:token" element={<Player />} />
        <Route path="/screens" element={<Screens />} />

        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/content"
          element={
            <ProtectedRoute>
              <Layout>
                <Content />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <Layout>
                <Assignments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <Layout>
                <Playlists />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/player"
          element={
            <ProtectedRoute>
              <Layout>
                <PlayerSlots />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
