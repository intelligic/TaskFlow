"use client";

import { useEffect, useState } from "react";

import { createProject, getProjects, type Project } from "@/lib/api/projectApi";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const loadProjects = async () => {
    try {
      setError(false);
      setLoading(true);
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createProject({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      await loadProjects();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div className="flex flex-col gap-1 items-start justify-start">
          <h2 className="text-lg font-bold text-black tracking-wide font-heading">
            Projects
          </h2>
          <p className="text-[12px] font-semibold text-gray-500 tracking-wider">
            Create and manage projects.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
          Failed to load projects
        </p>
      )}

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b border-b-gray-100 px-4 py-3">
          <h3 className="text-[15px] font-bold text-slate-800">Create Project</h3>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 p-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Project Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Revamp"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details about the project..."
              className="h-24 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b border-b-gray-100 px-4 py-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-slate-800">All Projects</h3>
          <button
            type="button"
            onClick={loadProjects}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm font-semibold text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project._id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-bold text-slate-900">{project.name}</p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">
                      Created: {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  {project.description || "—"}
                </p>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="text-sm font-semibold text-gray-600">
                No projects yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
