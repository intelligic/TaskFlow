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
  return token || null;
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  if (typeof window === 'undefined') return;
  try {
    const normalizeApiBase = (base?: string) => {
      if (!base) return base;
      const trimmed = base.replace(/\/+$/, '');
      return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    };
    const base = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
    if (base) {
      fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    }
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
  }
}

export function logoutSilent() {
  if (typeof window === 'undefined') return;
  const normalizeApiBase = (base?: string) => {
    if (!base) return base;
    const trimmed = base.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  };
  const base = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
  const url = base ? `${base}/auth/logout` : '';
  try {
    if (navigator.sendBeacon) {
      if (url) {
        navigator.sendBeacon(url, new Blob([], { type: 'application/json' }));
        return;
      }
    }
  } catch {
    // ignore
  }
  if (url) {
    fetch(url, { method: 'POST', credentials: 'include', keepalive: true }).catch(() => {});
  }
}

export function getUserRole(_token: string): 'admin' | 'employee' | null {
  try {
    const decoded = jwtDecode<JWTPayload>(_token);
    return decoded?.role || null;
  } catch {
    return null;
  }
}

