import { apiFetch, API_BASE } from "./apiClient.js";

// The server answers an error with just { message }, never throws, so each
// helper below hands back the parsed JSON and the caller checks for the field
// it expects (see `failed` in the pages).

// ----- the signed-in user -----
export const createFeedback = (data) =>
  apiFetch(`${API_BASE}/feedback`, { method: "POST", body: JSON.stringify(data) });

export const getMyFeedback = ({ page = 1 } = {}) =>
  apiFetch(`${API_BASE}/feedback/mine?page=${page}&limit=20`);

export const markFeedbackRead = () =>
  apiFetch(`${API_BASE}/feedback/mine/read`, { method: "POST" });

export const deleteMyFeedback = (id) =>
  apiFetch(`${API_BASE}/feedback/${id}`, { method: "DELETE" });

// What the red dots need: { unread } and, for admins, { adminOpen }.
export const getFeedbackIndicator = () => apiFetch(`${API_BASE}/feedback/indicator`);

// ----- the admin -----
export const getInboxFeedback = ({ status = "", page = 1 } = {}) => {
  const params = new URLSearchParams({ page, limit: 20 });
  if (status) params.set("status", status);
  return apiFetch(`${API_BASE}/admin/feedback?${params}`);
};

export const updateInboxFeedback = (id, data) =>
  apiFetch(`${API_BASE}/admin/feedback/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteInboxFeedback = (id) =>
  apiFetch(`${API_BASE}/admin/feedback/${id}`, { method: "DELETE" });
