import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      nav('/');
    } catch {
      setErr('Invalid email or password.');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Welcome back</h1>
      <p className="mt-2 text-slate-600">Log in to manage your wallet and donations.</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-paw-600 py-3 text-sm font-semibold text-white hover:bg-paw-700"
        >
          Log in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{' '}
        <Link to="/register" className="font-semibold text-paw-700 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
