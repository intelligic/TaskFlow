"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

export default function Column({
  id,
  title,
  tasks,
}: {
  id: string;
  title: string;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[180px] flex-1 space-y-3 p-3 transition-colors ${
          isOver ? "bg-blue-50" : "bg-white"
        }`}
      >
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed px-3 py-4 text-center text-xs font-semibold text-slate-400">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} columnId={id} />
          ))
        )}
      </div>
    </div>
  );
}
