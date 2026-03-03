'use client';

const summary = {
  totalAssigned: 42,
  completed: 38,
};

const tasks = [
  {
    id: '1',
    title: 'Update Security Protocols',
    desc: 'Review and update firewall rules.',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Q2 Performance Audit',
    desc: 'Audit weekly performance logs.',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Initial Workspace Setup',
    desc: 'Configure dev environment.',
    status: 'pending',
  },
];

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard title="Total Assigned Tasks" value={summary.totalAssigned} />
        <SummaryCard title="Completed Tasks" value={summary.completed} />
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-gray-500">{task.desc}</p>

            <div className="flex items-center gap-2">
              <StatusButton active={task.status === 'pending'} color="red">
                Pending
              </StatusButton>
              <StatusButton active={task.status === 'completed'} color="blue">
                Completed
              </StatusButton>
              <StatusButton active={false} color="green">
                Close
              </StatusButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function StatusButton({
  children,
  active,
  color,
}: {
  children: string;
  active: boolean;
  color: 'red' | 'blue' | 'green';
}) {
  const colors: any = {
    red: active ? 'bg-red-600 text-white' : 'bg-red-100 text-red-400',
    blue: active ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-400',
    green: active ? 'bg-green-600 text-white' : 'bg-green-100 text-green-400',
  };

  return (
    <button className={`px-3 py-1 rounded text-xs ${colors[color]}`}>
      {children}
    </button>
  );
}