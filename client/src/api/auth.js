import { apiFetch } from "./apiClient.js";

export async function register(data) {
  const res = await fetch("http://localhost:5000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login(data) {
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return res.json();
}

export async function refreshAccessToken() {
  const res = await fetch("http://localhost:5000/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function logout() {
  const res = await fetch("http://localhost:5000/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function getMe() {
  return apiFetch("http://localhost:5000/auth/me");
}

export async function forgotPassword(data) {
  const res = await fetch("http://localhost:5000/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function resetPassword(data) {
  const res = await fetch("http://localhost:5000/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function verifyEmail(token) {
  const res = await fetch(
    `http://localhost:5000/auth/verify-email?token=${token}`,
  );
  return res.json();
}

export async function resendVerification(data) {
  const res = await fetch("http://localhost:5000/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
