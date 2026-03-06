import ChatBox from '@/components/chat/ChatBox';
import { getEmployeeById } from '@/lib/mock-employees';

type Props = {
  params: {
    employeeId: string;
  };
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminChatPage({ params }: Props) {
  const { employeeId } = params;
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
    <div className="flex h-[calc(100vh-10rem)] min-h-0 flex-col gap-6 overflow-hidden">
      <div className="flex items-center gap-3 rounded-lg bg-white">
        <div className="flex h-10 w-10 items-center  text-[22px] justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {getInitials(employee.name)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-black">Chat with {employee.name}</h2>
          <p className="text-[12px] font-semibold tracking-wide text-gray-500">
            {employee.role}
            <span className="mx-2">|</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                employee.isOnline
                  ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                  : 'bg-red-100 text-red-700 ring-1 ring-red-200'
              }`}
            >
              {employee.isOnline ? 'Online' : 'Offline'}
            </span>
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ChatBox conversationKey={`employee-${employeeId}`} />
      </div>
    </div>
  );
}
