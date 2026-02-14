/** Auto-detect environment: local dev → localhost:4000, production → env or same origin */
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE = isLocal
  ? "http://localhost:4000"
  : (import.meta.env.VITE_API_URL || "");

/** Auto-append user identity query params for data isolation */
function appendIdentity(path: string): string {
  const user = localStorage.getItem("erp_user") || "";
  const role = localStorage.getItem("erp_role") || "";
  const dept = localStorage.getItem("erp_dept") || "";
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}_user=${encodeURIComponent(user)}&_role=${encodeURIComponent(role)}&_dept=${encodeURIComponent(dept)}`;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("erp_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const fullPath = appendIdentity(path);
  const res = await fetch(`${BASE}${fullPath}`, { ...opts, headers });
  if (res.status === 204) return undefined as unknown as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? res.statusText);
  }
  return res.json();
}

export function get<T>(path: string) {
  return request<T>(path);
}

export function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function put<T>(path: string, body: unknown) {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function del(path: string) {
  return request(path, { method: "DELETE" });
}
