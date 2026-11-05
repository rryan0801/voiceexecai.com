import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { dealIsOn } from '@/lib/actNowDeal';

// Display only. The checkout (base44/functions/createStripeCheckout) is what applies
// the deal; this box hides itself with the same end-date backstop in src/lib/actNowDeal.js.
export default function ActNowDealBox({ showButton = false, className = '' }) {
  if (!dealIsOn()) return null;
  return (
    <div className={`rounded-xl bg-red-600 text-white p-6 text-center shadow-lg ${className}`}>
      <p className="text-xl md:text-2xl font-black tracking-wide">LIMITED-TIME DEAL: 50% OFF YOUR FIRST 3 MONTHS</p>
      <p className="mt-2 text-sm md:text-base font-semibold">
        Act now: this price is below our profit goal, so this deal can end at any time without notice. It may not be here next time you visit.
      </p>
      <p className="mt-2 text-xs text-white/90">Applied automatically at checkout on monthly paid plans. No code needed.</p>
      {showButton && (
        <Link
          to="/pricing"
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 transition-all"
        >
          See deal prices <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
