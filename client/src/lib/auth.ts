import { jwtDecode } from 'jwt-decode';

type JWTPayload = {
  role: 'admin' | 'employee';
  exp: number;
};

const TOKEN_KEY = 'token';

export function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded?.exp) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return decoded.exp > nowSeconds;
  } catch {
    return false;
  }
}

// Legacy token helpers kept to gracefully clear old storage-based sessions.
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  localStorage.removeItem(TOKEN_KEY);
  return null;
}

export function setToken(_token: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function logout() {
  if (typeof window === 'undefined') return;
  try {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
    fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
  }
}

export function logoutSilent() {
  if (typeof window === 'undefined') return;
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
  const url = `${base}/auth/logout`;
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([], { type: 'application/json' }));
      return;
    }
  } catch {
    // ignore
  }
  fetch(url, { method: 'POST', credentials: 'include', keepalive: true }).catch(() => {});
}

export function getUserRole(_token: string): 'admin' | 'employee' | null {
  return null;
}
