"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Task } from "@/types/task";

const priorityClasses: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function TaskCard({ task, columnId }: { task: Task; columnId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { columnId },
  });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [canExpandDescription, setCanExpandDescription] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assigneeName =
    typeof task.assignedTo === "object"
      ? task.assignedTo?.name || task.assignedTo?.email
      : task.assignee;

  const measureDescription = () => {
    if (!descriptionRef.current) return;
    const el = descriptionRef.current;
    const hadClamp = el.classList.contains("line-clamp-2");
    if (!hadClamp) {
      el.classList.add("line-clamp-2");
    }
    const isOverflowing = el.scrollHeight > el.clientHeight + 1;
    setCanExpandDescription(isOverflowing);
    if (!hadClamp && isDescriptionExpanded) {
      el.classList.remove("line-clamp-2");
    }
  };

  useLayoutEffect(() => {
    measureDescription();
  }, [task.description]);

  useEffect(() => {
    const handleResize = () => measureDescription();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-lg border bg-white p-3 shadow-sm transition hover:shadow-md ${
        isDragging ? "opacity-80" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{task.title}</h4>
        {task.priority && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              priorityClasses[task.priority] || "bg-slate-100 text-slate-700"
            }`}
          >
            {task.priority}
          </span>
        )}
      </div>

      {task.description && (
        <div
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            setIsDescriptionExpanded((current) => !current);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsDescriptionExpanded((current) => !current);
            }
          }}
          className="mt-2 cursor-pointer"
          title={isDescriptionExpanded ? "Click to collapse" : "Click to expand"}
        >
          <p
            ref={descriptionRef}
            className={`text-xs text-slate-600 ${
              isDescriptionExpanded ? "" : "line-clamp-2"
            }`}
          >
            {task.description}
          </p>
          {canExpandDescription && (
            <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-blue-600">
              {isDescriptionExpanded ? "Show less" : "Read more"}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>{assigneeName || "Unassigned"}</span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
      </div>
    </div>
  );
}
