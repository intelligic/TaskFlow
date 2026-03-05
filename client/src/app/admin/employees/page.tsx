import Link from 'next/link';
import EmployeeList from '@/components/dashboard/EmployeeList';

export default function AdminEmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black tracking-wide">All Employees</h2>

        {/* Add Employee (Invite flow yahin se) */}
        {/* <Link
          href="/admin/employees/invite"
          className="bg-black text-white px-4 py-2 rounded text-sm hover:opacity-90"
        >
          + Add Employee
        </Link> */}
      </div>

      <div className="bg-white">
        <EmployeeList />
      </div>
    </div>
  );
}