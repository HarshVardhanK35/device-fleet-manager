export async function getAssignments() {
  const res = await fetch("http://localhost:5000/assignments");
  const data = await res.json();
  return data;
}

// publish flow
export async function createAssignment(data) {
  const res = await fetch("http://localhost:5000/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}
