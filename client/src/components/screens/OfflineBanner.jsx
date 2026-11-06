// "OFFLINE" strip across the top of a screen that has lost its connection.
// DevicePlayback shows it only after the screen has been offline for a few
// seconds, so a short network blip never flashes it; it pulses softly until the
// connection is back (the .cw-offline-pulse animation in index.css).
function OfflineBanner() {
  return (
    <div
      role="status"
      className="cw-offline-pulse"
      style={{
        position: "fixed",
        top: "2vmin",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        padding: "0.8vmin 3vmin",
        borderRadius: 999,
        background: "#da3633",
        color: "#fff",
        fontSize: "max(14px, 2.4vmin)",
        fontWeight: 700,
        letterSpacing: "0.18em",
        pointerEvents: "none",
      }}
    >
      OFFLINE
    </div>
  );
}

export default OfflineBanner;

// Used by: components/screens/DevicePlayback.jsx.
