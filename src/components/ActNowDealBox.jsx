import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DEAL_TEXT } from '@/lib/actNowDeal';

// Display only. The checkout (base44/functions/createStripeCheckout) applies the deal.
export default function ActNowDealBox({ showButton = false, className = '' }) {
  return (
    <div className={`rounded-xl bg-blue-600 text-white p-6 text-center shadow-lg ${className}`}>
      <p className="text-lg md:text-xl font-bold">{DEAL_TEXT}</p>
      <p className="mt-2 text-xs text-white/90">Applied automatically at checkout on the monthly Pro plan. No code needed.</p>
      {showButton && (
        <Link
          to="/pricing"
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-all"
        >
          See prices <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
