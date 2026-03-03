import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/mock-task-store';

export async function GET() {
  return NextResponse.json(getTasks());
}
