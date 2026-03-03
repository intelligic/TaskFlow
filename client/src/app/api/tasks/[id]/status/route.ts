import { NextResponse } from 'next/server';
import type { TaskStatus } from '@/types/task';
import { updateTaskStatus } from '@/lib/mock-task-store';

type Params = {
  params: Promise<{ id: string }>;
};

type Body = {
  status?: TaskStatus;
};

const validStatuses: TaskStatus[] = ['PENDING', 'COMPLETED', 'CLOSED'];

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as Body;

  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json({ message: 'Invalid task status' }, { status: 400 });
  }

  const task = updateTaskStatus(id, body.status);
  if (!task) {
    return NextResponse.json({ message: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}
