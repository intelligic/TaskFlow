import { jwtDecode } from 'jwt-decode';

type JWTPayload = {
  role: 'admin' | 'employee';
  exp: number;
};

export function getUserRole(token: string): 'admin' | 'employee' | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.role;
  } catch {
    return null;
  }
}
