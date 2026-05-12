import { useEffect, useState } from 'react';
import api from '../api.js';
import { assetUrl } from '../config.js';

export default function Admin() {
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [vols, setVols] = useState([]);
  const [cases, setCases] = useState([]);
  const [funds, setFunds] = useState([]);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');

  const load = async () => {
    const [s, v, c, f] = await Promise.all([
      api.get('/admin/summary'),
      api.get('/volunteers/pending'),
      api.get('/cases/pending'),
      api.get('/community/requests/pending'),
    ]);
    setSummary(s.data);
    setVols(v.data);
    setCases(c.data);
    setFunds(f.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  useEffect(() => {
    if (tab !== 'users') return;
    api.get('/admin/users', { params: { q } }).then((r) => setUsers(r.data));
  }, [tab, q]);

  const reviewVolunteer = async (id, action) => {
    await api.patch(`/volunteers/${id}/review`, { action });
    await load();
  };

  const reviewCase = async (id, action, adminNote = '') => {
    await api.patch(`/cases/${id}/review`, { action, adminNote });
    await load();
  };

  const reviewFund = async (id, action, adminNote = '') => {
    await api.patch(`/community/requests/${id}/review`, { action, adminNote });
    await load();
  };

  const patchUser = async (id, body) => {
    await api.patch(`/admin/users/${id}`, body);
    if (tab === 'users') api.get('/admin/users', { params: { q } }).then((r) => setUsers(r.data));
  };

  const tabs = [
    ['summary', 'Overview'],
    ['volunteers', 'Volunteers'],
    ['cases', 'Cases'],
    ['funds', 'Fund requests'],
    ['users', 'Users'],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Admin dashboard</h1>
      <p className="mt-2 text-slate-600">Approve people, cases, and payouts—keep the circle safe and honest.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === id ? 'bg-paw-600 text-white' : 'bg-white text-slate-600 ring-1 ring-paw-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'summary' && summary && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Registered users', summary.users],
            ['Volunteer applications', summary.volunteersPending],
            ['Cases awaiting review', summary.casesPending],
            ['Fund requests', summary.fundRequestsPending],
            ['Community pool (₹)', summary.pool],
            ['Tracked donations (₹)', summary.totalTrackedDonations],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-paw-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{k}</p>
              <p className="mt-1 text-2xl font-semibold text-paw-900">{v}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'volunteers' && (
        <ul className="mt-8 space-y-4">
          {vols.map((u) => (
            <li key={u._id} className="rounded-2xl border border-paw-100 bg-white p-4">
              <p className="font-semibold text-paw-950">{u.name}</p>
              <p className="text-sm text-slate-600">{u.email}</p>
              <p className="mt-2 text-sm text-slate-500">{u.volunteerNote}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => reviewVolunteer(u._id, 'approve')}
                  className="rounded-full bg-paw-600 px-4 py-1.5 text-sm font-semibold text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => reviewVolunteer(u._id, 'reject')}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-700"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
          {!vols.length && <p className="text-slate-500">No pending volunteers.</p>}
        </ul>
      )}

      {tab === 'cases' && (
        <ul className="mt-8 space-y-4">
          {cases.map((c) => (
            <li key={c._id} className="rounded-2xl border border-paw-100 bg-white p-4">
              <p className="font-semibold text-paw-950">{c.title}</p>
              <p className="text-sm text-slate-600">By {c.volunteerId?.name}</p>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{c.description}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => reviewCase(c._id, 'approve')}
                  className="rounded-full bg-paw-600 px-4 py-1.5 text-sm font-semibold text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => reviewCase(c._id, 'reject', 'Does not meet guidelines')}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-700"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
          {!cases.length && <p className="text-slate-500">No cases pending.</p>}
        </ul>
      )}

      {tab === 'funds' && (
        <ul className="mt-8 space-y-4">
          {funds.map((r) => (
            <li key={r._id} className="rounded-2xl border border-paw-100 bg-white p-4">
              <p className="font-semibold text-paw-950">
                ₹{r.amount} · {r.category}
              </p>
              <p className="text-sm text-slate-600">{r.volunteerId?.name}</p>
              <p className="mt-2 text-sm text-slate-700">{r.narrative}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(r.proofUrls || []).map((url) => (
                  <img key={url} src={assetUrl(url)} alt="" className="h-20 rounded-lg object-cover" />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => reviewFund(r._id, 'approve')}
                  className="rounded-full bg-paw-600 px-4 py-1.5 text-sm font-semibold text-white"
                >
                  Approve & pay to wallet
                </button>
                <button
                  type="button"
                  onClick={() => reviewFund(r._id, 'reject')}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-700"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
          {!funds.length && <p className="text-slate-500">No fund requests.</p>}
        </ul>
      )}

      {tab === 'users' && (
        <div className="mt-8">
          <input
            placeholder="Search name or email"
            className="w-full max-w-sm rounded-xl border border-slate-200 px-3 py-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <ul className="mt-4 space-y-2">
            {users.map((u) => (
              <li key={u._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-paw-50 bg-white px-4 py-3 text-sm">
                <div>
                  <span className="font-medium">{u.name}</span> <span className="text-slate-500">{u.email}</span>
                  <span className="ml-2 rounded-full bg-paw-50 px-2 py-0.5 text-xs">{u.role}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-paw-700"
                    onClick={() => patchUser(u._id, { role: 'admin' })}
                  >
                    Make admin
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-slate-600"
                    onClick={() => patchUser(u._id, { role: 'user', volunteerStatus: 'none' })}
                  >
                    Reset to user
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
