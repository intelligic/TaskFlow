import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/mock-auth-store';

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const admin = getAdminUser();

  if (!admin) {
    return NextResponse.json({ message: 'Admin account is not set up yet' }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  if (email !== admin.email || password !== admin.password) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const header = Buffer.from(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    }),
  ).toString('base64url');

  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }),
  ).toString('base64url');
  const token = `${header}.${payload}.signature`;

  return NextResponse.json({
    token,
    role: 'admin',
  });
}
