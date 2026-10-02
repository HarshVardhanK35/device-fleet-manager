import { apiFetch } from "./apiClient";

export async function getAssignments() {
  return apiFetch("http://localhost:5000/assignments");
}

// publish flow
export async function createAssignment(data) {
  return apiFetch("http://localhost:5000/assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
