import { NextResponse } from 'next/server';
import { getMyTasks } from '@/lib/mock-task-store';

export async function GET() {
  return NextResponse.json(getMyTasks());
}
