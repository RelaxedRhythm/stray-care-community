import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await register(form);
      nav('/');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Join PawCircle</h1>
      <p className="mt-2 text-slate-600">Create an account to fund cases and follow transparent updates.</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
        {err && <p className="text-sm text-red-600">{err}</p>}
        {['name', 'email', 'phone', 'password'].map((f) => (
          <div key={f}>
            <label className="text-sm font-medium capitalize text-slate-700">{f === 'phone' ? 'Phone (optional)' : f}</label>
            <input
              type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'}
              required={f !== 'phone'}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form[f]}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full rounded-full bg-paw-600 py-3 text-sm font-semibold text-white hover:bg-paw-700"
        >
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        The first account on a fresh database becomes admin for setup convenience.
      </p>
      <p className="mt-2 text-center text-sm text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-paw-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
