import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/mock-auth-store';

export async function GET() {
  const admin = getAdminUser();
  return NextResponse.json({ exists: Boolean(admin) });
}
