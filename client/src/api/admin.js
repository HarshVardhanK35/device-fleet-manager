import { apiFetch, API_BASE } from "./apiClient.js";

// Admin-only endpoints (the server rejects anyone who isn't an admin).
export async function getAdminUsers({ page = 1, limit = 20, search = "" } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  return apiFetch(`${API_BASE}/admin/users?${params}`);
}

export async function getAdminUserScreens(id) {
  return apiFetch(`${API_BASE}/admin/users/${id}/screens`);
}

export async function deleteAdminUser(id) {
  return apiFetch(`${API_BASE}/admin/users/${id}`, { method: "DELETE" });
}
