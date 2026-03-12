import { jwtDecode } from 'jwt-decode';

type JWTPayload = {
  role: 'admin' | 'employee';
  exp: number;
};

const TOKEN_KEY = 'token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
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
    return decoded.role;
  } catch {
    return null;
  }
}
