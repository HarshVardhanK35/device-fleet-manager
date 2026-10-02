import { apiFetch } from "./apiClient";

export async function getContent() {
  return apiFetch("http://localhost:5000/content");
}

export async function createContent(data) {
  return apiFetch("http://localhost:5000/content", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:5000/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return res.json();
}
