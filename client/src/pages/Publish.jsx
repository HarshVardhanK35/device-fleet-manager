import { useState, useEffect } from "react";
import { getDevices } from "../api/devices";
import { getPlaylists } from "../api/playlists";
import { createAssignment } from "../api/assignments";

function Publish() {
  const [devices, setDevices] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [beginDT, setBeginDT] = useState("");
  const [endDT, setEndDT] = useState("");

  useEffect(() => {
    async function fetchData() {
      const deviceData = await getDevices();
      const playlistData = await getPlaylists();
      setDevices(deviceData);
      setPlaylists(playlistData);
    }
    fetchData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    await createAssignment({
      deviceId: deviceId,
      playlistId: playlistId,
      beginDT: beginDT,
      endDT: endDT,
    });

    setDeviceId("");
    setPlaylistId("");
    setBeginDT("");
    setEndDT("");
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <select
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          required
        >
          <option value="">Select device</option>
          {devices.map((device) => {
            return (
              <option key={device._id} value={device._id}>
                {device.name}
              </option>
            );
          })}
        </select>

        <select
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
          required
        >
          <option value="">Select playlist</option>
          {playlists.map((playlist) => (
            <option key={playlist._id} value={playlist._id}>
              {playlist.name}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={beginDT}
          onChange={(e) => setBeginDT(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={endDT}
          onChange={(e) => setEndDT(e.target.value)}
          required
        />

        <button type="submit">Publish</button>
      </form>
    </>
  );
}

export default Publish;
