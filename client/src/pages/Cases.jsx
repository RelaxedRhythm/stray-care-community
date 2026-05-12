import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { assetUrl } from '../config.js';

const statusLabel = {
  open: 'Open',
  funded: 'Funded',
  completed: 'Completed',
};

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/cases/public')
      .then((r) => setCases(r.data))
      .catch(() => setErr('Could not load cases.'));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Stray animal cases</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Each case is posted by a vetted volunteer after admin review. Your wallet donations go straight to the goal.
      </p>
      {err && <p className="mt-4 text-red-600">{err}</p>}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <Link
            key={c._id}
            to={`/cases/${c._id}`}
            className="group overflow-hidden rounded-3xl border border-paw-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-[4/3] bg-paw-50">
              {c.images?.[0] ? (
                <img src={assetUrl(c.images[0])} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl">🐕</div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-paw-950 group-hover:text-paw-700">{c.title}</h2>
                <span className="rounded-full bg-paw-50 px-2 py-0.5 text-xs font-medium text-paw-800">
                  {statusLabel[c.status] || c.status}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{c.description}</p>
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-paw-100">
                  <div
                    className="h-full rounded-full bg-paw-500"
                    style={{ width: `${Math.min(100, (c.raisedFunds / c.requiredFunds) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  ₹{c.raisedFunds} raised of ₹{c.requiredFunds}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!cases.length && !err && <p className="mt-8 text-slate-500">No published cases yet.</p>}
    </div>
  );
}
