import { useEffect, useState } from 'react';
import api from '../api.js';

const typeLabel = {
  wallet_topup: 'Wallet top-up',
  donate_case: 'Case donation',
  donate_community: 'Community fund',
  community_payout: 'Community payout',
};

export default function Ledger() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get('/ledger').then((r) => setRows(r.data));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Public donation ledger</h1>
      <p className="mt-2 text-slate-600">
        A living record of wallet activity on the platform. Names are shown to keep the network human—payment IDs are
        withheld.
      </p>
      <div className="mt-8 overflow-hidden rounded-3xl border border-paw-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-paw-50 text-xs font-semibold uppercase tracking-wide text-paw-900">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Supporter</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t._id} className="border-t border-paw-50">
                <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{t.userId?.name || 'Member'}</td>
                <td className="px-4 py-3 text-slate-600">{typeLabel[t.type] || t.type}</td>
                <td className="px-4 py-3 font-semibold text-paw-800">₹{t.amount}</td>
                <td className="px-4 py-3 text-slate-500">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="p-8 text-center text-slate-500">No public transactions yet.</p>}
      </div>
    </div>
  );
}
