'use client';

const archivedTasks = [
  {
    id: '1',
    title: 'Prepare monthly report',
    employee: 'Jane Doe',
    completedAt: '2024-02-20',
    closedAt: '2024-02-21',
  },
  {
    id: '2',
    title: 'Fix login bug',
    employee: 'Sam Miller',
    completedAt: '2024-02-18',
    closedAt: '2024-02-18',
  },
];

export default function AdminArchivePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Archived Tasks</h2>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-3 border-b text-sm text-gray-500">
          <span>Task</span>
          <span>Employee</span>
          <span>Completed On</span>
          <span>Closed On</span>
        </div>

        {archivedTasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-4 px-4 py-3 border-b last:border-b-0 text-sm"
          >
            <span>{task.title}</span>
            <span>{task.employee}</span>
            <span>{task.completedAt}</span>
            <span>{task.closedAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}