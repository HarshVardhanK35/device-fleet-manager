import { useState, useEffect } from "react";

import { getDevices } from "../api/devices.js";
import { timeAgo } from "../utils/timeAgo.js";

function Dashboard() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function fetchDevices() {
      const devices = await getDevices();
      // console.log(devices);
      setDevices(devices);
    }
    fetchDevices();

    const intervalId = setInterval(fetchDevices, 10000);
    return() => clearInterval(intervalId)
  }, []);

  return (
    <ul>
      {devices.map((device) => (
        <li key={device._id}>
          {device.name} —{" "}
          <span
            style={{
              color: device.status === "online" ? "green" : "gray",
              fontWeight: "bold",
            }}
          >
            {device.status}
          </span>{" "}
          — {timeAgo(device.lastSeenAt)}
        </li>
      ))}
    </ul>
  );
}

export default Dashboard;
