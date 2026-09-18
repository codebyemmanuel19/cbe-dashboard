// One place that knows about the token.
// Every dashboard request goes through this file.

export const API_BASE_URL = "https://cbe-quicksite-backend.onrender.com";

const TOKEN_KEY = "cbe-token";
const USER_KEY = "cbe-user";

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Same as fetch, but attaches the token and handles an expired session
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  // Token missing or expired — send them back to the login screen
  if (res.status === 401) {
    clearSession();
    window.location.reload();
    return { success: false, error: "Session expired. Please log in again." };
  }

  return res.json();
}