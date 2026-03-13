"use client";

import KanbanBoard from "@/components/board/KanbanBoard";

export default function AdminBoardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900">Board</h1>
        <p className="text-sm text-slate-500">
          Drag tasks between columns to update status.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
