import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/mock-auth-store';

type LoginBody = {
  email?: string;
  password?: string;
};

function createToken(role: 'admin' | 'employee'): string {
  const header = Buffer.from(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    }),
  ).toString('base64url');

  const payload = Buffer.from(
    JSON.stringify({
      role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }),
  ).toString('base64url');

  return `${header}.${payload}.signature`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const user = getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ message: 'Account not found. Please register first.' }, { status: 401 });
  }

  if (user.password !== password) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const token = createToken(user.role);

  return NextResponse.json({
    token,
    role: user.role,
  });
}
