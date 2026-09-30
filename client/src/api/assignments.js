export async function getAssignments() {
  const res = await fetch("http://localhost:5000/assignments");
  const data = await res.json();
  return data;
}
