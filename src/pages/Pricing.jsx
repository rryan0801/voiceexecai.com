import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import NavBar from '@/components/NavBar';
import ActNowDealBox from '@/components/ActNowDealBox';
import PricingCards from '@/components/PricingCards';
import TipBox from '@/components/TipBox';
import { SUPPORT_EMAIL } from '@/lib/plans';

const FAQS = [
  { q: 'Is there a free plan or free trial?', a: 'No. VoiceExecAI has paid plans only.' },
  { q: 'What is the new-member price?', a: 'Special pricing for new members: 50% off your first 3 months. We may end or change this offer at any time. It is applied automatically at checkout on the monthly Pro plan.' },
  { q: 'Does VoiceExecAI answer my phone calls?', a: 'No. It does not answer or make phone calls. It acts when you give it a voice or typed command.' },
  { q: 'Does it send emails or book meetings for me?', a: 'Not yet. It drafts the email or the meeting details, and you send or book them yourself. It does not log anything into your CRM.' },
  { q: 'Can I change plans later?', a: `Yes. Email ${SUPPORT_EMAIL} and we will switch your plan.` },
  { q: 'How do I cancel?', a: `Email ${SUPPORT_EMAIL} before your next billing date and we will cancel your plan.` },
  { q: 'What about refunds?', a: 'Refunds are handled case by case — email us.' },
  { q: 'How do I pay?', a: 'By card through Stripe. We never see your full card number.' },
];

export default function Pricing() {
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get('canceled') === 'true';
  const needsPlan = searchParams.get('needs_plan') === '1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <ActNowDealBox className="max-w-4xl mx-auto mb-10" />
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4">Choose your plan</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Paid plans only. No surprises.</p>
          {needsPlan && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
              <AlertCircle className="w-4 h-4" /> You are signed in, but you do not have a plan yet. Pick a plan below to start using VoiceExecAI.
            </div>
          )}
          {canceled && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              <AlertCircle className="w-4 h-4" /> Checkout was canceled. You were not charged.
            </div>
          )}
        </div>

        <PricingCards />

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{f.q}</h3>
                <p className="text-slate-500 text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h2>
          <Link to="/contact" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg inline-flex items-center gap-2">
            Contact us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <TipBox />
    </div>
  );
}
