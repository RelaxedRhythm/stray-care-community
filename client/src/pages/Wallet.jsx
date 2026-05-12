import { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(window.Razorpay);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function Wallet() {
  const { refreshUser } = useAuth();
  const [balance, setBalance] = useState(null);
  const [tx, setTx] = useState([]);
  const [amount, setAmount] = useState('');
  const [keyId, setKeyId] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [b, t, cfg] = await Promise.all([
      api.get('/wallet/balance'),
      api.get('/wallet/transactions'),
      api.get('/payments/config'),
    ]);
    setBalance(b.data.balance);
    setTx(t.data);
    setKeyId(cfg.data.keyId);
  };

  useEffect(() => {
    load().catch(() => setMsg('Could not load wallet.'));
  }, []);

  const topup = async (e) => {
    e.preventDefault();
    setMsg('');
    const rupees = Number(amount);
    if (!rupees || rupees < 1) return;
    if (!keyId) {
      setMsg('Razorpay is not configured on the server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
      return;
    }
    try {
      await loadRazorpay();
      const { data: order } = await api.post('/payments/create-order', { amount: rupees });
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'PawCircle Wallet',
        description: 'Wallet top-up',
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', response);
            await refreshUser();
            await load();
            setAmount('');
            setMsg('Payment successful. Your wallet is updated.');
          } catch {
            setMsg('Verification failed. Contact support with your payment ID.');
          }
        },
        theme: { color: '#1fa774' },
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Payment could not start');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Digital wallet</h1>
      <p className="mt-2 text-slate-600">Add money with Razorpay (cards, netbanking, UPI where enabled in dashboard).</p>
      <div className="mt-8 rounded-3xl border border-paw-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Available balance</p>
        <p className="text-4xl font-semibold text-paw-900">{balance == null ? '—' : `₹${balance}`}</p>
        <form onSubmit={topup} className="mt-6 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Add (₹)</label>
            <input
              type="number"
              min="1"
              step="1"
              className="mt-1 block w-36 rounded-xl border border-slate-200 px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button type="submit" className="rounded-full bg-paw-600 px-5 py-2 text-sm font-semibold text-white hover:bg-paw-700">
            Pay with Razorpay
          </button>
        </form>
        {msg && <p className="mt-4 text-sm text-paw-900">{msg}</p>}
      </div>
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-paw-950">Transaction history</h2>
        <ul className="mt-4 space-y-2">
          {tx.map((t) => (
            <li key={t._id} className="flex justify-between rounded-2xl border border-paw-50 bg-white px-4 py-3 text-sm">
              <span className="text-slate-600">{t.description || t.type}</span>
              <span className={t.type === 'wallet_topup' ? 'font-semibold text-green-700' : 'font-semibold text-paw-900'}>
                {t.type === 'wallet_topup' ? '+' : '−'}₹{t.amount}
              </span>
            </li>
          ))}
        </ul>
        {!tx.length && <p className="mt-4 text-slate-500">No transactions yet.</p>}
      </section>
    </div>
  );
}
