import React, { useState } from 'react';
import { Coffee } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { TIP_AMOUNTS } from '@/lib/plans';

// "Buy us a coffee" tip box. Amounts are fixed on the server ($5/$10/$25).
// A tip is a tip: it is not a donation and it never unlocks a plan.
export default function TipBox({ className = '' }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const tip = async (amt) => {
    setError('');
    if (window.self !== window.top) {
      setError('Tips only work on the published site.');
      return;
    }
    setLoading(amt);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', { mode: 'payment', amount: amt * 100 });
      if (res.data?.url) window.location.href = res.data.url;
      else setError('Could not start the tip checkout. Please try again.');
    } catch (_e) {
      setError('Could not start the tip checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className={`py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 rounded-full text-amber-700 text-xs font-semibold mb-6 shadow-sm">
          <Coffee className="w-3 h-3" /> Tip
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Buy us a coffee</h2>
        <p className="text-slate-500 mb-8">
          A one-time tip if VoiceExecAI helped you. It is a tip, not a donation, and it does not include a plan.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {TIP_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => tip(amt)}
              disabled={loading !== null}
              className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-800 font-bold rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {loading === amt ? '...' : `$${amt}`}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        <p className="text-xs text-slate-400 mt-6">Paid securely through Stripe.</p>
      </div>
    </section>
  );
}
