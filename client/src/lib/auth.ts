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

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  if (!isTokenValid(token)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/login';
}

export function getUserRole(token: string): 'admin' | 'employee' | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!decoded?.exp || decoded.exp <= nowSeconds) return null;
    return decoded.role;
  } catch {
    return null;
  }
}
