import { apiFetch, getAccessToken, API_BASE } from "./apiClient.js";

export async function getContent() {
  return apiFetch(`${API_BASE}/content`);
}

export async function createContent(data) {
  return apiFetch(`${API_BASE}/content`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// fetch() has no upload-progress event, so this uses XMLHttpRequest instead
// — needed for the Uploading... modal's progress bar and cancel button.
export function uploadFile(file, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAccessToken();

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () =>
      reject(new DOMException("Upload cancelled", "AbortError"));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
      } else {
        signal.addEventListener("abort", () => xhr.abort());
      }
    }

    xhr.send(formData);
  });
}

export async function updateContent(id, data) {
  return apiFetch(`${API_BASE}/content/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteContent(id) {
  return apiFetch(`${API_BASE}/content/${id}`, {
    method: "DELETE",
  });
}
