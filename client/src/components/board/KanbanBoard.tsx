"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { getTasks, updateTaskStatus, type Task } from "@/lib/api/taskApi";
import Column from "./Column";

const COLUMNS = [
  { id: "pending", title: "Pending" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
  { id: "closed", title: "Closed" },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

const statusToColumn = (status?: string, isArchived?: boolean): ColumnId => {
  if (isArchived) return "closed";
  const value = String(status || "").toLowerCase();
  if (value === "closed") return "closed";
  if (value === "completed" || value === "done") return "completed";
  if (value === "in_progress" || value === "in-progress" || value === "review") return "in-progress";
  if (value === "pending" || value === "todo") return "pending";
  return "pending";
};

const columnToStatus = (columnId: ColumnId) => {
  if (columnId === "in-progress") return "in-progress";
  return columnId;
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadTasks = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await getTasks();
      const list = Array.isArray(res) ? res : (res as { tasks: Task[] }).tasks;
      setTasks(Array.isArray(list) ? list : []);
    } catch {
      setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const tasksByColumn = useMemo(() => {
    const map = new Map<ColumnId, Task[]>();
    COLUMNS.forEach((c) => map.set(c.id, []));
    tasks.forEach((task) => {
      const col = statusToColumn(task.status, task.isArchived);
      map.get(col)?.push(task);
    });
    return map;
  }, [tasks]);

  const updateTaskInState = (taskId: string, nextColumn: ColumnId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task._id === taskId
          ? {
              ...task,
              status: columnToStatus(nextColumn),
              isArchived: nextColumn === "closed",
            }
          : task,
      ),
    );
  };

  const reorderWithinColumn = (columnId: ColumnId, activeId: string, overId: string) => {
    setTasks((prev) => {
      const columnTasks = prev.filter((task) => statusToColumn(task.status, task.isArchived) === columnId);
      const oldIndex = columnTasks.findIndex((t) => t._id === activeId);
      const newIndex = columnTasks.findIndex((t) => t._id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      const reorderedIds = new Set(reordered.map((t) => t._id));
      const copy = [...reordered];

      return prev.map((task) => {
        if (!reorderedIds.has(task._id)) return task;
        return copy.shift() || task;
      });
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumn = active.data.current?.columnId as ColumnId | undefined;
    const overColumn =
      (over.data.current?.columnId as ColumnId | undefined) ||
      (COLUMNS.find((c) => c.id === overId)?.id as ColumnId | undefined);

    if (!activeColumn || !overColumn) return;
    if (activeColumn === overColumn) return;

    updateTaskInState(activeId, overColumn);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeColumn = active.data.current?.columnId as ColumnId | undefined;
    const overColumn =
      (over.data.current?.columnId as ColumnId | undefined) ||
      (COLUMNS.find((c) => c.id === overId)?.id as ColumnId | undefined);

    if (!activeColumn || !overColumn) return;

    if (activeColumn === overColumn && activeId !== overId) {
      reorderWithinColumn(activeColumn, activeId, overId);
      return;
    }

    if (activeColumn !== overColumn) {
      const previousTasks = tasks;
      updateTaskInState(activeId, overColumn);

      try {
        await updateTaskStatus(activeId, columnToStatus(overColumn));
      } catch {
        setTasks(previousTasks);
      }
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm font-semibold text-gray-600">Loading...</div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => (
            <SortableContext
              key={column.id}
              items={(tasksByColumn.get(column.id) || []).map((task) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <Column id={column.id} title={column.title} tasks={tasksByColumn.get(column.id) || []} />
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
