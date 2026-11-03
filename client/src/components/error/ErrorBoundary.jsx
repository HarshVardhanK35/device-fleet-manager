import { Component } from "react";
import { useLocation } from "react-router-dom";

import ErrorPage, { DeviceUnavailable } from "./ErrorPage.jsx";
import { useAuth } from "../../context/useAuth.js";

// A page file that failed to download (usually after a new deploy).
function isChunkError(error) {
  const message = String(error?.message || "");
  return (
    error?.name === "ChunkLoadError" ||
    /dynamically imported module|importing a module script failed|loading chunk/i.test(message)
  );
}

class Boundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[CastWise] page error:", error, info?.componentStack);
  }

  // Moving to another page clears the error.
  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.device) return <DeviceUnavailable />;
    return (
      <ErrorPage
        kind={isChunkError(error) ? "chunk" : "crash"}
        error={error}
        signedIn={this.props.signedIn}
        fullScreen={this.props.fullScreen}
      />
    );
  }
}

// Catches a crash in the pages below it and shows a friendly page instead of a
// white screen. Use `fullScreen` for pages without the app shell, nothing for
// pages inside it (the shell stays), and `device` for the unattended screens.
// Used by: App.jsx.
function RouteErrorBoundary({ children, fullScreen = false, device = false }) {
  const { pathname } = useLocation();
  const { token } = useAuth();
  return (
    <Boundary resetKey={pathname} fullScreen={fullScreen} device={device} signedIn={Boolean(token)}>
      {children}
    </Boundary>
  );
}

export default RouteErrorBoundary;
