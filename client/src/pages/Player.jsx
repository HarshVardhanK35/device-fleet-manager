import { useParams } from "react-router-dom";

import DevicePlayback from "../components/DevicePlayback.jsx";

function Player() {
  const { deviceId } = useParams();
  return <DevicePlayback deviceId={deviceId} />;
}

export default Player;

// Unauthenticated, device-facing playback page — what a real paired
// screen's browser tab runs. The actual connect/heartbeat/MQTT/render
// logic lives in components/DevicePlayback.jsx (shared with
// pages/Screens.jsx's "playing" phase); this page is just that component
// wired to the :deviceId route param.
