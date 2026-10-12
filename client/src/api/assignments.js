import { apiFetch, API_BASE } from "./apiClient.js";

export async function getAssignments() {
  return apiFetch(`${API_BASE}/assignments`);
}

// publish flow
export async function createAssignment(data) {
  return apiFetch(`${API_BASE}/assignments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAssignment(id, data) {
  return apiFetch(`${API_BASE}/assignments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAssignment(id) {
  return apiFetch(`${API_BASE}/assignments/${id}`, {
    method: "DELETE",
  });
}
