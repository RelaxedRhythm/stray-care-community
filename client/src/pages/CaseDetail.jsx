import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { assetUrl } from '../config.js';

export default function CaseDetail() {
  const { id } = useParams();
  const { user, refreshUser, isVolunteer, isAdmin } = useAuth();
  const [c, setC] = useState(null);
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [updateBody, setUpdateBody] = useState('');

  const load = () => api.get(`/cases/public/${id}`).then((r) => setC(r.data));

  useEffect(() => {
    load().catch(() => setMsg('Case not found.'));
  }, [id]);

  const donate = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/wallet/donate-case', { caseId: id, amount: Number(amount) });
      setAmount('');
      await refreshUser();
      await load();
      setMsg('Thank you—your wallet donation was applied.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Donation failed');
    }
  };

  const postUpdate = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData();
    fd.append('body', updateBody);
    const inp = form.elements.namedItem('media');
    if (inp && 'files' in inp && inp.files?.length) for (const f of inp.files) fd.append('media', f);
    try {
      await api.post(`/cases/${id}/updates`, fd);
      setUpdateBody('');
      await load();
      setMsg('Update posted.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to post update');
    }
  };

  const markComplete = async () => {
    await api.patch(`/cases/${id}/status`, { status: 'completed' });
    await load();
  };

  if (!c) return <div className="p-10 text-center text-slate-500">{msg || 'Loading…'}</div>;

  const canDonate = user && c.status === 'open' && c.raisedFunds < c.requiredFunds;
  const isOwner = user && String(c.volunteerId?._id || c.volunteerId) === String(user._id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/cases" className="text-sm font-medium text-paw-700 hover:underline">
        ← All cases
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-paw-950">{c.title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Posted by {c.volunteerId?.name || 'Volunteer'}
        {c.location?.address && ` · ${c.location.address}`}
      </p>
      {msg && <p className="mt-4 rounded-2xl bg-paw-50 px-4 py-3 text-sm text-paw-900">{msg}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(c.images || []).map((url) => (
          <img key={url} src={assetUrl(url)} alt="" className="h-40 w-full rounded-2xl object-cover ring-1 ring-paw-100" />
        ))}
      </div>
      <p className="mt-6 whitespace-pre-wrap text-slate-700">{c.description}</p>
      <div className="mt-6 rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Progress</p>
            <p className="text-2xl font-semibold text-paw-900">
              ₹{c.raisedFunds}{' '}
              <span className="text-base font-normal text-slate-500">/ ₹{c.requiredFunds}</span>
            </p>
            <div className="mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-paw-100">
              <div
                className="h-full rounded-full bg-paw-500"
                style={{ width: `${Math.min(100, (c.raisedFunds / c.requiredFunds) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Status: {c.status}</p>
          </div>
          {canDonate && (
            <form onSubmit={donate} className="flex flex-wrap items-end gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-500">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-32 rounded-xl border border-slate-200 px-3 py-2"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-paw-600 px-5 py-2 text-sm font-semibold text-white hover:bg-paw-700"
              >
                Donate from wallet
              </button>
            </form>
          )}
        </div>
        {!user && (
          <p className="mt-4 text-sm text-slate-500">
            <Link className="font-semibold text-paw-700" to="/login">
              Log in
            </Link>{' '}
            and add funds to your wallet to donate.
          </p>
        )}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-paw-950">Rescue updates</h2>
        <p className="text-sm text-slate-500">Photos and notes from volunteers on the ground.</p>
        <div className="mt-4 space-y-4">
          {(c.updates || []).map((u) => (
            <article key={u._id} className="rounded-2xl border border-paw-100 bg-white p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{u.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(u.media || []).map((m) =>
                  m.kind === 'video' ? (
                    <video key={m.url} src={assetUrl(m.url)} controls className="h-36 rounded-lg" />
                  ) : (
                    <img key={m.url} src={assetUrl(m.url)} alt="" className="h-36 rounded-lg object-cover" />
                  )
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">{new Date(u.createdAt).toLocaleString()}</p>
            </article>
          ))}
          {!c.updates?.length && <p className="text-slate-500">No updates yet.</p>}
        </div>
        {(isOwner || isAdmin) && (isVolunteer || isAdmin) && c.status !== 'completed' && (
          <form onSubmit={postUpdate} className="mt-6 space-y-3 rounded-2xl border border-dashed border-paw-200 p-4">
            <label className="block text-sm font-medium text-slate-700">Add update</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              rows={3}
              value={updateBody}
              onChange={(e) => setUpdateBody(e.target.value)}
              placeholder="What happened today? Medication given, rescue complete, etc."
            />
            <input name="media" type="file" accept="image/*,video/*" multiple className="text-sm" />
            <button
              type="submit"
              className="rounded-full bg-paw-600 px-4 py-2 text-sm font-semibold text-white hover:bg-paw-700"
            >
              Post update
            </button>
          </form>
        )}
        {(isOwner || isAdmin) && ['open', 'funded'].includes(c.status) && (
          <button
            type="button"
            onClick={markComplete}
            className="mt-4 text-sm font-semibold text-paw-800 underline"
          >
            Mark case as completed
          </button>
        )}
      </section>
    </div>
  );
}
