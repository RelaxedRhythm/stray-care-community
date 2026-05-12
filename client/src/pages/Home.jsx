import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-paw-100 via-white to-warm-100">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-paw-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-warm-200/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paw-800 ring-1 ring-paw-100">
              Community powered
            </p>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-paw-950 md:text-5xl">
              Small gifts. Big relief for animals on the street.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              PawCircle connects neighbors, volunteers, and a transparent community fund so rescue, treatment, and
              feeding happen faster—with receipts you can trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/cases"
                className="rounded-full bg-paw-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-paw-600/25 hover:bg-paw-700"
              >
                Browse cases
              </Link>
              <Link
                to="/ledger"
                className="rounded-full border border-paw-200 bg-white px-6 py-3 text-sm font-semibold text-paw-800 hover:bg-paw-50"
              >
                View public ledger
              </Link>
            </div>
            {!user && (
              <p className="mt-6 text-sm text-slate-500">
                New here?{' '}
                <Link className="font-semibold text-paw-700 underline-offset-2 hover:underline" to="/register">
                  Create a free account
                </Link>{' '}
                to fund your wallet and donate.
              </p>
            )}
          </div>
          <div className="grid gap-4">
            {[
              { t: 'Digital wallet', d: 'Top up with Razorpay / UPI, donate to cases or the shared pool.' },
              { t: 'Volunteer verified', d: 'Cases and fund releases are reviewed before going live or paying out.' },
              { t: 'Open books', d: 'A public ledger lists contributions so the community stays accountable.' },
            ].map((x) => (
              <div key={x.t} className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
                <h3 className="font-display text-lg font-semibold text-paw-900">{x.t}</h3>
                <p className="mt-2 text-sm text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
