'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Plus, Tag } from 'lucide-react';
import { getTagClasses, TASK_TAGS } from '@/lib/task-tags';
import { useRouter } from 'next/navigation';
import { MdOutlineAddTask } from "react-icons/md";


export default function CreateTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    const raw = localStorage.getItem('adminCreatedTasks');
    const parsed = raw ? JSON.parse(raw) : [];
    const nextTask = {
      id: Date.now().toString(),
      title: title.trim(),
      desc: description.trim(),
      status: 'pending',
      tags: selectedTags,
    };

    localStorage.setItem('adminCreatedTasks', JSON.stringify([nextTask, ...parsed]));

    console.log({
      title,
      description,
      assignee,
      dueDate,
      selectedTags,
    });

    alert('Task Created (Dummy)');
  };

  return (
    <div className="mx-auto w-full max-w-190">
      <div className='space-y-3'>
      <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">Create New Task</h1>
      <p className="w-160 text-md text-slate-500 font-medium">Set up a new project task and assign it to a team member.</p>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Task Title</label>
          <input
            type="text"
            placeholder="e.g. Q4 Financial Reporting"
            className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
          <textarea
            placeholder="Describe the task requirements and goals..."
            className="h-28 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Assign To</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 pr-10 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Select employee</option>
                <option value="1">Aman</option>
                <option value="2">Ravi</option>
                <option value="3">Neha</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Due Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-3 pr-10 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Calendar size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Tags</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TASK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                  selectedTags.includes(tag)
                    ? getTagClasses(tag, 'selected')
                    : getTagClasses(tag, 'unselected')
                }`}
              >
                <Tag size={12} />
                {tag}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
            >
              <Plus size={12} />
              Add New
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
          <button
            onClick={handleSubmit}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg tracking-wide bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <MdOutlineAddTask className="text-lg"  />
            Create Task
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs font-medium text-slate-400">
        Notifications will be sent to the assigned employee automatically.
      </p>
    </div>
  );
}
