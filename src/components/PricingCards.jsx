import React, { useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { PLANS, SUPPORT_EMAIL } from '@/lib/plans';
import { dealPrice, fmtMoney } from '@/lib/actNowDeal';

// Shared plan cards for the home page and /pricing. Paid plans only.
export default function PricingCards() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const choose = async (plan) => {
    setError('');
    if (!plan.checkout) {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('VoiceExecAI Enterprise')}`;
      return;
    }
    if (window.self !== window.top) {
      setError('Checkout only works on the published site.');
      return;
    }
    const signedIn = await base44.auth.isAuthenticated().catch(() => false);
    if (!signedIn) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    setLoading(plan.name);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', { price_id: plan.priceId, plan_name: plan.name });
      if (res.data?.url) window.location.href = res.data.url;
      else setError(res.data?.error || 'Could not start checkout. Please try again.');
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PLANS.map((plan) => {
          const sale = plan.checkout ? dealPrice(plan.price) : null;
          return (
            <div key={plan.name} className={`rounded-2xl p-8 border-2 flex flex-col bg-white ${plan.checkout ? 'border-blue-500 shadow-xl' : 'border-slate-200'}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
              {sale !== null ? (
                <div className="mb-2">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl line-through text-slate-400 mb-1">${fmtMoney(plan.price)}</span>
                    <span className="text-5xl font-extrabold text-slate-900">${fmtMoney(sale)}</span>
                    <span className="text-sm text-slate-500 mb-1.5">{plan.period}</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-700 mt-1">
                    ${fmtMoney(sale)}/mo for your first 3 months, then ${fmtMoney(plan.price)}/mo
                  </p>
                </div>
              ) : (
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-extrabold text-slate-900">${fmtMoney(plan.price)}</span>
                  <span className="text-sm text-slate-500 mb-1.5">{plan.period}</span>
                </div>
              )}
              <p className="text-sm text-slate-500 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(plan)}
                disabled={loading !== null}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-70 ${plan.checkout ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {loading === plan.name ? 'Loading...' : <>{plan.cta} <ArrowRight className="w-4 h-4 inline" /></>}
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="text-center text-sm text-red-600 mt-6">{error}</p>}
      <p className="text-center text-slate-500 text-sm mt-8 max-w-2xl mx-auto">
        Paid plans only. Billed monthly by Stripe. To cancel, email {SUPPORT_EMAIL} before your next billing date.
        Refunds are handled case by case — email us.
      </p>
    </div>
  );
}
