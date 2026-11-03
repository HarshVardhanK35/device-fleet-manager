import ErrorPage from "../components/error/ErrorPage.jsx";
import Layout from "../components/layout/Layout.jsx";
import LoadingOverlay from "../components/loading/LoadingOverlay.jsx";
import { useAuth } from "../context/useAuth.js";

// The catch-all route: any address that matches no page. Signed in, it sits
// inside the app shell; signed out, it is a full-screen page.
// Used by: App.jsx (path="*").
function NotFound() {
  const { token, loading } = useAuth();
  if (loading) return <LoadingOverlay show />;
  if (!token) return <ErrorPage kind="notFound" fullScreen />;
  return (
    <Layout>
      <ErrorPage kind="notFound" signedIn />
    </Layout>
  );
}

export default NotFound;
