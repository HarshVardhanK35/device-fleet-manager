import { useParams } from "react-router-dom";

import DevicePlayback from "../components/DevicePlayback.jsx";

function Player() {
  const { token } = useParams();
  return <DevicePlayback screenToken={token} />;
}

export default Player;

// Unauthenticated, device-facing playback page — what a real paired
// screen's browser tab runs. The actual connect/heartbeat/MQTT/render
// logic lives in components/DevicePlayback.jsx (shared with
// pages/Screens.jsx's "playing" phase); this page is just that component
// wired to the :token route param.
//
// The URL param is a long random Device.accessToken, not the real Mongo
// _id (Phase 3 fix, 2026-10-12) — unguessable and revocable, since this
// route is fully public/unauthenticated. DevicePlayback resolves the real
// _id internally (via the /connect response) for MQTT topics only; the
// real _id is never exposed here.
