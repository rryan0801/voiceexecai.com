import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Coffee } from 'lucide-react';
import { PLANS, SUPPORT_EMAIL } from '@/lib/plans';
import { dealPrice, fmtMoney } from '@/lib/actNowDeal';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const isTip = searchParams.get('tip') === 'true';
  const planName = searchParams.get('plan') || 'Pro';
  const plan = PLANS.find((p) => p.name === planName && p.checkout) || PLANS[0];

  if (isTip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center px-6">
        <div className="max-w-lg text-center bg-white rounded-2xl p-10 border border-slate-200 shadow-lg">
          <Coffee className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Thank you for the coffee!</h1>
          <p className="text-slate-600 mb-6">Your tip went through. A tip does not include or change a plan.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
            Back to home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full bg-white rounded-2xl p-10 border border-slate-200 shadow-lg">
        <div className="text-center mb-8">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment received</h1>
          <p className="text-slate-600">Welcome to VoiceExecAI {plan.name}.</p>
          <p className="text-sm text-slate-500 mt-2">
            New-member price: ${fmtMoney(dealPrice(plan.price))}/month for your first 3 months, then ${fmtMoney(plan.price)}/month.
          </p>
        </div>
        <h2 className="font-semibold text-slate-900 mb-3">What your plan includes</h2>
        <ul className="space-y-2 mb-8">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500 mb-6">
          It can take a minute for your plan to show as active. Stripe emails your receipt. Questions: {SUPPORT_EMAIL}
        </p>
        <Link to="/dashboard" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
          Go to dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
