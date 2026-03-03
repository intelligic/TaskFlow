'use client';

import { useState } from 'react';

export default function CreateTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags = ['Urgent', 'Internal', 'Finance', 'Backend'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
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
    <div className="flex justify-center">
      <div className="w-full max-w-2xl bg-white border rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Create New Task</h2>

        {/* Task Title */}
        <div className="mb-4">
          <label className="text-sm font-medium">Task Title</label>
          <input
            type="text"
            placeholder="e.g. Q4 Financial Reporting"
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-sm font-medium">Description</label>
          <textarea
            placeholder="Describe the task requirements and goals..."
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm h-24 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Assign + Due Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">Assign To</label>
            <select
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="">Select employee</option>
              <option value="1">Aman</option>
              <option value="2">Ravi</option>
              <option value="3">Neha</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Due Date</label>
            <input
              type="date"
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:opacity-90 text-sm"
          >
            + Create Task
          </button>

          <button
            type="button"
            className="text-sm text-gray-500 hover:text-black"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}