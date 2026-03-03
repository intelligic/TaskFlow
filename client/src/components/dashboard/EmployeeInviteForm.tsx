'use client';

import { useState } from 'react';

export default function EmployeeInviteForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only: API baad me connect hoga
    console.log({ name, email });
    setName('');
    setEmail('');
    alert('Invite sent (UI only)');
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
      <button className="bg-black text-white px-4 py-2 rounded">
        Invite
      </button>
    </form>
  );
}