import axios, { type AxiosError } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<{ detail?: string }>) => {
    const original = err.config;
    if (err.response?.status === 401 && original && !(original as { _retry?: boolean })._retry) {
      (original as { _retry?: boolean })._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post<{ access_token: string }>(
            `${API_BASE}/auth/refresh`,
            { refresh_token: refresh }
          );
          localStorage.setItem("access_token", data.access_token);
          original!.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original!);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      } else if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export function setTokens(access: string, refresh: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}
