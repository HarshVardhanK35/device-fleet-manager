import { useState, useEffect } from "react";
import { getDevices } from "../api/devices.js";

function Dashboard() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function fetchDevices() {
      const devices = await getDevices();
      // console.log(devices);
      setDevices(devices);
    }
    fetchDevices();
  }, []);


  return (
    <ul>
      {devices.map((device) => (
        <li key={device._id}>
          {device.name} — {device.status} — {device.lastSeenAt}
        </li>
      ))}
    </ul>
  );
}

export default Dashboard;
