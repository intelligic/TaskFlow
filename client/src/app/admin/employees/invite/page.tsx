'use client';

export default function InviteEmployeePage() {
  return (
    <div className="max-w-lg bg-white border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Add Employee</h2>

      <form className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mt-1 text-sm"
            placeholder="Employee name"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mt-1 text-sm"
            placeholder="employee@company.com"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded text-sm hover:opacity-90"
        >
          Send Invite
        </button>
      </form>
    </div>
  );
}