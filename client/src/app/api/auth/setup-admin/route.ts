import { NextResponse } from 'next/server';
import { getAdminUser, setAdminUser } from '@/lib/mock-auth-store';

type SetupAdminBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const existingAdmin = getAdminUser();
  if (existingAdmin) {
    return NextResponse.json({ message: 'Admin already exists' }, { status: 409 });
  }

  const body = (await request.json()) as SetupAdminBody;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
  }

  setAdminUser({ name, email, password });
  return NextResponse.json({ message: 'Admin created successfully' }, { status: 201 });
}
