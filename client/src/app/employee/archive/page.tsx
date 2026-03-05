'use client';

import { useMemo, useState } from 'react';

const archivedTasks = [
  {
    id: '1',
    title: 'Update Security Protocols',
    completedAt: '2024-02-20',
    closedAt: '2024-02-21',
  },
  {
    id: '2',
    title: 'Initial Workspace Setup',
    completedAt: '2024-02-15',
    closedAt: '2024-02-16',
  },
  {
    id: '3',
    title: 'Initial Workspace Setup',
    completedAt: '2024-02-15',
    closedAt: '2024-02-16',
  },
];

const ITEMS_PER_PAGE = 13;

export default function EmployeeArchivePage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(archivedTasks.length / ITEMS_PER_PAGE));

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return archivedTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

  const startItem = archivedTasks.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, archivedTasks.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 items-start justify-start">      
        <h2 className="text-2xl font-bold text-black tracking-wide">Employee Task Archive</h2>
        <p className="text-[12px] font-normal text-gray-500">A Text only Historical record of your complete and close tasks.</p>
      </div>


      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-3 border-b border-b-gray-100 text-[14px] opacity-70 bg-gray-100 text-black text-center uppercase tracking-wide font-semibold">
          <span>Task</span>
          <span>Completed On</span>
          <span>Closed On</span>
        </div>

        {paginatedTasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-3 px-4 py-3 border-b border-b-gray-100 last:border-b-0 text-[12px] font-semibold text-black text-center"
          >
            <span>{task.title}</span>
            <span className='opacity-65'>{task.completedAt}</span>
            <span className='opacity-65'>{task.closedAt}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 bg-white px-4 py-2 text-sm md:flex-row md:items-center md:justify-between border rounded-lg">
        <p className="text-black text-[14px] font-bold">
          Showing {startItem}-{endItem} of {archivedTasks.length} tasks
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            const active = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded border px-3 py-1.5 ${
                  active ? 'border-blue-600 bg-blue-600 text-white' : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
