import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/mock-auth-store';

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
  }

  const existingUser = getUserByEmail(email);

  if (existingUser) {
    return NextResponse.json({ message: 'User already exists with this email' }, { status: 409 });
  }

  const user = createUser({ name, email, password });

  return NextResponse.json(
    {
      message: 'Registration successful. Please login.',
      roleAssigned: user.role,
    },
    { status: 201 },
  );
}
