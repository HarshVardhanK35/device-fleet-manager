// "OFFLINE" strip across the top of a screen that has lost its connection.
// DevicePlayback shows it only after the screen has been offline for a few
// seconds, so a short network blip never flashes it; it pulses softly until the
// connection is back (the .cw-offline-pulse animation in index.css).
// `online` turns it into the green "ONLINE" strip shown once, for a few seconds,
// when a screen that had been showing OFFLINE gets its connection back (no pulse).
function OfflineBanner({ online = false }) {
  return (
    <div
      role="status"
      className={online ? undefined : "cw-offline-pulse"}
      style={{
        position: "fixed",
        top: "2vmin",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        padding: "0.8vmin 3vmin",
        borderRadius: 999,
        background: online ? "#238636" : "#da3633",
        color: "#fff",
        fontSize: "max(14px, 2.4vmin)",
        fontWeight: 700,
        letterSpacing: "0.18em",
        pointerEvents: "none",
      }}
    >
      {online ? "ONLINE" : "OFFLINE"}
    </div>
  );
}

export default OfflineBanner;

// Used by: components/screens/DevicePlayback.jsx.
