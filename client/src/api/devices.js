export async function getDevices() {
  const res = await fetch("http://localhost:5000/devices");
  const data = await res.json();
  return data;
}