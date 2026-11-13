import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ConnectionBanner from "./components/error/ConnectionBanner.jsx";
import RouteErrorBoundary from "./components/error/ErrorBoundary.jsx";
import Layout from "./components/layout/Layout.jsx";
import LoadingOverlay from "./components/loading/LoadingOverlay.jsx";
import SessionExpiryWarning from "./components/auth/SessionExpiryWarning.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import RouteFallback from "./components/loading/RouteFallback.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastProvider.jsx";
import { useAuth } from "./context/useAuth.js";
import { pageLoaders } from "./pageLoaders.js";
import { lazyRetry } from "./utils/app/lazyRetry.js";
import { usePageTitle } from "./utils/app/usePageTitle.js";

// Every page is loaded on demand (its own file in the build), so a visitor on
// the landing page or sign-in doesn't download the whole app first.
const Login = lazyRetry(pageLoaders.login);
const Register = lazyRetry(pageLoaders.register);
const ForgotPassword = lazyRetry(pageLoaders.forgotPassword);
const ResetPassword = lazyRetry(pageLoaders.resetPassword);
const VerifyEmail = lazyRetry(pageLoaders.verifyEmail);
const Dashboard = lazyRetry(pageLoaders.dashboard);
const Content = lazyRetry(pageLoaders.content);
const Assignments = lazyRetry(pageLoaders.assignments);
const Playlists = lazyRetry(pageLoaders.playlists);
const Player = lazyRetry(pageLoaders.player);
const PlayerSlots = lazyRetry(pageLoaders.playerSlots);
const Screens = lazyRetry(pageLoaders.screens);
const Landing = lazyRetry(pageLoaders.landing);
const NotFound = lazyRetry(pageLoaders.notFound);
const Help = lazyRetry(pageLoaders.help);
const Legal = lazyRetry(pageLoaders.legal);
const AdminUsers = lazyRetry(pageLoaders.adminUsers);
const Feedback = lazyRetry(pageLoaders.feedback);
const AdminInbox = lazyRetry(pageLoaders.adminInbox);

// A signed-in page: the app shell stays on screen while the page itself loads.
function AppPage({ children }) {
  return (
    <ProtectedRoute>
      <Layout>
        <RouteErrorBoundary>
          <Suspense fallback={<RouteFallback />}>{children}</Suspense>
        </RouteErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

// Admin-only page: everyone else sees the normal 404. The role arrives with
// the user record just after the token, so wait for it before deciding.
function AdminPage({ children }) {
  const { user } = useAuth();
  return (
    <AppPage>
      {!user ? <RouteFallback /> : user.role === "admin" ? children : <NotFound />}
    </AppPage>
  );
}

// "/" is the dashboard for signed-in users and the public landing page for
// everyone else (same URL, no redirect). Waits for the silent refresh so a
// signed-in user never sees the landing page flash.
function HomeRoute() {
  const { token, loading } = useAuth();
  if (loading) return <LoadingOverlay show slowAfter={4000} slowMessage="Waking up the server, this can take a minute…" />;
  if (!token) return <Landing />;
  return (
    <Layout>
      <RouteErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Dashboard />
        </Suspense>
      </RouteErrorBoundary>
    </Layout>
  );
}

// Keeps the browser tab title in step with the page.
function TitleSync() {
  usePageTitle();
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <TitleSync />
        <ConnectionBanner />
        <SessionExpiryWarning />
        <RouteErrorBoundary fullScreen>
        <Suspense fallback={<RouteFallback fullScreen />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/player/:token" element={<RouteErrorBoundary device><Player /></RouteErrorBoundary>} />
            <Route path="/screens" element={<RouteErrorBoundary device><Screens /></RouteErrorBoundary>} />
            <Route path="/help" element={<Help />} />
            <Route path="/terms" element={<Legal doc="terms" />} />
            <Route path="/acceptable-use" element={<Legal doc="acceptable-use" />} />
            <Route path="/privacy" element={<Legal doc="privacy" />} />

            <Route path="/" element={<HomeRoute />} />
            <Route path="/content" element={<AppPage><Content /></AppPage>} />
            <Route path="/assignments" element={<AppPage><Assignments /></AppPage>} />
            <Route path="/playlists" element={<AppPage><Playlists /></AppPage>} />
            <Route path="/player" element={<AppPage><PlayerSlots /></AppPage>} />
            <Route path="/admin/users" element={<AdminPage><AdminUsers /></AdminPage>} />
            <Route path="/admin/inbox" element={<AdminPage><AdminInbox /></AdminPage>} />
            <Route path="/feedback" element={<AppPage><Feedback /></AppPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </RouteErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
