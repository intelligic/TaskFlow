export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  pending: number;
  completed: number;
  lastActive: string;
  isOnline: boolean;
  status: 'Active' | 'Invited';
};

export const employees: Employee[] = [
  {
    id: '1',
    name: 'Jane Doe',
    role: 'Product Designer',
    email: 'jane@test.com',
    pending: 12,
    completed: 45,
    lastActive: '2 hours ago',
    isOnline: true,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Sam Miller',
    role: 'Backend Engineer',
    email: 'sam@test.com',
    pending: 18,
    completed: 32,
    lastActive: '10:45 AM',
    isOnline: false,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Alex Hunter',
    role: 'Support Specialist',
    email: 'alex@test.com',
    pending: 15,
    completed: 12,
    lastActive: 'Yesterday',
    isOnline: true,
    status: 'Active',
  },
  {
    id: '4',
    name: 'Linda Blair',
    role: 'Project Manager',
    email: 'intelligicsolutionss@gmail.com',
    pending: 15,
    completed: 89,
    lastActive: 'Oct 24, 2023',
    isOnline: false,
    status: 'Invited',
  },
  {
    id: '5',
    name: 'Marcus Chen',
    role: 'Fullstack Developer',
    email: 'vikrampal039@gmail.com',
    pending: 21,
    completed: 15,
    lastActive: 'Just now',
    isOnline: true,
    status: 'Active',
  },
];

export function getEmployeeById(id: string) {
  return employees.find((emp) => emp.id === id);
}
