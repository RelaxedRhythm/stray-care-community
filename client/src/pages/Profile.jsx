import { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    api.get('/users/donations').then((r) => setDonations(r.data)).catch(() => {});
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    await api.patch('/users/profile', { name, phone });
    await refreshUser();
    setMsg('Profile saved.');
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Your profile</h1>
      <form onSubmit={save} className="mt-8 space-y-4 rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
        {msg && <p className="text-sm text-paw-800">{msg}</p>}
        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Phone</label>
          <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <p className="text-sm text-slate-500">Email: {user.email}</p>
        <p className="text-sm text-slate-500">
          Role: {user.role} {user.volunteerStatus && user.role === 'volunteer' && `(${user.volunteerStatus})`}
        </p>
        <button type="submit" className="rounded-full bg-paw-600 px-5 py-2 text-sm font-semibold text-white">
          Save changes
        </button>
      </form>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-paw-950">Donation history</h2>
        <div className="mt-4 space-y-3">
          {donations.map((d) => (
            <div key={d._id} className="rounded-2xl border border-paw-100 bg-white p-4 text-sm">
              <p className="font-medium text-paw-900">
                ₹{d.amount} · {d.type === 'donate_case' ? 'Case' : 'Community'}
              </p>
              <p className="text-slate-500">{d.description}</p>
              <p className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {!donations.length && <p className="text-slate-500">No donations yet.</p>}
        </div>
      </section>
    </div>
  );
}
