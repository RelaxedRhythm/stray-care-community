import { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Community() {
  const { user, refreshUser } = useAuth();
  const [pool, setPool] = useState(null);
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => api.get('/community/pool').then((r) => setPool(r.data));

  useEffect(() => {
    load();
  }, []);

  const donate = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/wallet/donate-community', { amount: Number(amount) });
      setAmount('');
      await refreshUser();
      await load();
      setMsg('Thank you—your contribution is now in the shared pool.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not donate');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Collective community fund</h1>
      <p className="mt-4 text-slate-600">
        This pool backs urgent rescues, treatment, and feeding when volunteers request support. Admins review each
        request before funds move to an approved volunteer wallet.
      </p>
      {pool && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Pool balance</p>
            <p className="mt-1 text-3xl font-semibold text-paw-900">₹{pool.totalCommunityPool}</p>
          </div>
          <div className="rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">All-time raised for cases (tracked)</p>
            <p className="mt-1 text-3xl font-semibold text-paw-900">₹{pool.totalCasesRaised}</p>
          </div>
        </div>
      )}
      {user ? (
        <form onSubmit={donate} className="mt-8 rounded-3xl border border-dashed border-paw-200 bg-paw-50/50 p-6">
          <h2 className="font-semibold text-paw-900">Donate from your wallet</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Amount (₹)</label>
              <input
                type="number"
                min="1"
                className="mt-1 block w-40 rounded-xl border border-slate-200 px-3 py-2"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-paw-600 px-5 py-2 text-sm font-semibold text-white hover:bg-paw-700"
            >
              Add to community pool
            </button>
          </div>
          {msg && <p className="mt-4 text-sm text-paw-900">{msg}</p>}
        </form>
      ) : (
        <p className="mt-8 text-sm text-slate-500">Log in and top up your wallet to contribute to the pool.</p>
      )}
    </div>
  );
}
