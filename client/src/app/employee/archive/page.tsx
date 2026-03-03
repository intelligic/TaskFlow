'use client';

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

export default function EmployeeArchivePage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1 items-start justify-start">      
        <h2 className="text-2xl font-bold text-black tracking-wide">Employee Task Archive</h2>
        <p className="text-sm font-medium text-gray-500 text-semibold tracking-wide">A Text only Historical record of your complete and close tasks.</p>
      </div>


      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-3 border-b border-b-gray-100 text-[16px] opacity-70 bg-gray-100 text-black text-center uppercase tracking-wide font-semibold">
          <span>Task</span>
          <span>Completed On</span>
          <span>Closed On</span>
        </div>

        {archivedTasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-3 px-4 py-3 border-b border-b-gray-100 last:border-b-0 text-sm font-semibold text-black text-center"
          >
            <span>{task.title}</span>
            <span>{task.completedAt}</span>
            <span>{task.closedAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}