import ChatBox from '@/components/chat/ChatBox';
import { getEmployeeById } from '@/lib/mock-employees';

type Props = {
  params: Promise<{
    employeeId: string;
  }>;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function AdminChatPage({ params }: Props) {
  const { employeeId } = await params;
  const employee =
    getEmployeeById(employeeId) || {
      id: employeeId,
      name: `Employee ${employeeId}`,
      role: 'Team Member',
      email: '',
      pending: 0,
      completed: 0,
      lastActive: 'Unknown',
      isOnline: false,
      status: 'Invited' as const,
    };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {getInitials(employee.name)}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Chat with {employee.name}</h2>
          <p className="text-xs text-gray-500">
            {employee.role}
            <span className="mx-2">|</span>
            <span className={employee.isOnline ? 'text-green-600' : 'text-gray-500'}>
              {employee.isOnline ? 'Online' : 'Offline'}
            </span>
          </p>
        </div>
      </div>
      <ChatBox />
    </div>
  );
}
