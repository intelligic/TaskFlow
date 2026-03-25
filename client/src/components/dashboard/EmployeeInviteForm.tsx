'use client';

import { useState } from 'react';
import { inviteEmployee } from '@/lib/api/employeeApi';
import { getApiErrorMessage } from '@/lib/api';

export default function EmployeeInviteForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      const res = await inviteEmployee(name.trim(), email.trim());
      if (!res) {
        setError('Failed to send invite');
        return;
      }
      setName('');
      setEmail('');
      setSuccess('Invite sent successfully');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send invite'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Employee Name"
        className="border rounded px-3 py-2 flex-1"
        required
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Employee Email"
        className="border rounded px-3 py-2 flex-1"
        required
      />
      <button className="bg-black text-white px-4 py-2 rounded disabled:opacity-60" disabled={loading}>
        {loading ? 'Sending...' : 'Invite'}
      </button>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      {success && <p className="text-xs font-semibold text-green-600">{success}</p>}
    </form>
  );
}
