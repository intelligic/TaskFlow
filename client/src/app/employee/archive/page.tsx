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
];

export default function EmployeeArchivePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Employee Task Archive</h2>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-3 border-b text-sm text-gray-500">
          <span>Task</span>
          <span>Completed On</span>
          <span>Closed On</span>
        </div>

        {archivedTasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-3 px-4 py-3 border-b last:border-b-0 text-sm"
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