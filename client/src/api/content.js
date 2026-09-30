export async function getContent() {
  const res = await fetch("http://localhost:5000/content");
  const data = await res.json();
  return data;
}

export async function createContent(data) {
  const res = await fetch("http://localhost:5000/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}
