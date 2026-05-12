import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Volunteer() {
  const { user, refreshUser, isVolunteer, isAdmin, volunteerPending } = useAuth();
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [mine, setMine] = useState([]);
  const [reqs, setReqs] = useState([]);

  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    requiredFunds: '',
  });

  const [fundForm, setFundForm] = useState({ category: 'rescue', amount: '', narrative: '' });

  const loadMine = () => {
    if (isVolunteer || isAdmin)
      Promise.all([api.get('/cases/mine'), api.get('/community/requests/mine')]).then(([c, r]) => {
        setMine(c.data);
        setReqs(r.data);
      });
  };

  useEffect(() => {
    loadMine();
  }, [isVolunteer, isAdmin]);

  const apply = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/volunteers/apply', { message: note });
      await refreshUser();
      setMsg('Application submitted. An admin will review it soon.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not apply');
    }
  };

  const submitCase = async (e) => {
    e.preventDefault();
    setMsg('');
    const fd = new FormData();
    Object.entries(caseForm).forEach(([k, v]) => fd.append(k, v));
    const files = e.currentTarget.images.files;
    if (files?.length) for (const f of files) fd.append('images', f);
    try {
      await api.post('/cases', fd);
      setCaseForm({ title: '', description: '', address: '', lat: '', lng: '', requiredFunds: '' });
      setMsg('Case submitted for admin approval.');
      loadMine();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not create case');
    }
  };

  const submitFund = async (e) => {
    e.preventDefault();
    setMsg('');
    const fd = new FormData();
    fd.append('category', fundForm.category);
    fd.append('amount', fundForm.amount);
    fd.append('narrative', fundForm.narrative);
    const files = e.currentTarget.proof.files;
    if (files?.length) for (const f of files) fd.append('proof', f);
    try {
      await api.post('/community/requests', fd);
      setFundForm({ category: 'rescue', amount: '', narrative: '' });
      setMsg('Fund request submitted.');
      loadMine();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Request failed');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Volunteer hub</h1>
      <p className="mt-2 text-slate-600">
        Trusted volunteers post cases, share proof, and request community pool support after admin approval.
      </p>

      {!isVolunteer && !isAdmin && !volunteerPending && (
        <form onSubmit={apply} className="mt-8 rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-paw-900">Apply to volunteer</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tell us briefly about your experience with animals or local rescue groups.
          </p>
          <textarea
            className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="I feed a colony near… / I work with a shelter…"
          />
          <button type="submit" className="mt-4 rounded-full bg-paw-600 px-5 py-2 text-sm font-semibold text-white">
            Submit application
          </button>
        </form>
      )}

      {volunteerPending && (
        <p className="mt-8 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your volunteer profile is awaiting approval.
        </p>
      )}

      {msg && <p className="mt-6 rounded-2xl bg-paw-50 px-4 py-3 text-sm text-paw-900">{msg}</p>}

      {(isVolunteer || isAdmin) && (
        <>
          <section className="mt-12 rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-paw-950">Post a stray case</h2>
            <p className="text-sm text-slate-500">Cases go live only after admin review.</p>
            <form onSubmit={submitCase} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Title"
                className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2"
                value={caseForm.title}
                onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
              />
              <textarea
                required
                placeholder="Description"
                className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2"
                rows={3}
                value={caseForm.description}
                onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
              />
              <input
                placeholder="Location / address"
                className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2"
                value={caseForm.address}
                onChange={(e) => setCaseForm({ ...caseForm, address: e.target.value })}
              />
              <input
                placeholder="Latitude (optional, for map)"
                className="rounded-xl border border-slate-200 px-3 py-2"
                value={caseForm.lat}
                onChange={(e) => setCaseForm({ ...caseForm, lat: e.target.value })}
              />
              <input
                placeholder="Longitude"
                className="rounded-xl border border-slate-200 px-3 py-2"
                value={caseForm.lng}
                onChange={(e) => setCaseForm({ ...caseForm, lng: e.target.value })}
              />
              <input
                required
                type="number"
                min="1"
                placeholder="Required funds (₹)"
                className="rounded-xl border border-slate-200 px-3 py-2"
                value={caseForm.requiredFunds}
                onChange={(e) => setCaseForm({ ...caseForm, requiredFunds: e.target.value })}
              />
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">Photos</label>
                <input name="images" type="file" accept="image/*" multiple className="mt-1 block w-full text-sm" />
              </div>
              <button
                type="submit"
                className="rounded-full bg-paw-600 px-5 py-2 text-sm font-semibold text-white sm:col-span-2"
              >
                Submit case
              </button>
            </form>
          </section>

          <section className="mt-10 rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-paw-950">Request community funds</h2>
            <p className="text-sm text-slate-500">Attach receipts or photos when possible.</p>
            <form onSubmit={submitFund} className="mt-4 grid gap-3 sm:grid-cols-2">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2"
                value={fundForm.category}
                onChange={(e) => setFundForm({ ...fundForm, category: e.target.value })}
              >
                <option value="rescue">Rescue</option>
                <option value="treatment">Treatment</option>
                <option value="feeding">Feeding</option>
                <option value="other">Other</option>
              </select>
              <input
                required
                type="number"
                min="1"
                placeholder="Amount (₹)"
                className="rounded-xl border border-slate-200 px-3 py-2"
                value={fundForm.amount}
                onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
              />
              <textarea
                required
                placeholder="What will the funds cover?"
                className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2"
                rows={3}
                value={fundForm.narrative}
                onChange={(e) => setFundForm({ ...fundForm, narrative: e.target.value })}
              />
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">Proof (images)</label>
                <input name="proof" type="file" accept="image/*" multiple className="mt-1 block w-full text-sm" />
              </div>
              <button
                type="submit"
                className="rounded-full bg-paw-600 px-5 py-2 text-sm font-semibold text-white sm:col-span-2"
              >
                Submit request
              </button>
            </form>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-paw-950">Your cases</h2>
            <ul className="mt-3 space-y-2">
              {mine.map((c) => (
                <li key={c._id} className="flex justify-between rounded-2xl border border-paw-50 bg-white px-4 py-3 text-sm">
                  <Link className="font-medium text-paw-800 hover:underline" to={`/cases/${c._id}`}>
                    {c.title}
                  </Link>
                  <span className="text-slate-500">{c.status}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-paw-950">Your fund requests</h2>
            <ul className="mt-3 space-y-2">
              {reqs.map((r) => (
                <li key={r._id} className="rounded-2xl border border-paw-50 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-paw-900">
                    ₹{r.amount} · {r.category}{' '}
                    <span className="text-slate-500">({r.status})</span>
                  </p>
                  <p className="text-slate-600">{r.narrative}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
