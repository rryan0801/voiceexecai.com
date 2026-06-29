import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await base44.entities.BuyerLead.create({
        name: email.split('@')[0],
        email,
        phone: 'n/a',
        vertical: 'other',
        city: 'Unknown',
        state: 'Unknown',
        source: 'landing_email_capture',
        submitted_at: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-violet-700">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-xs font-semibold mb-6">
          <Mail className="w-3 h-3" />
          Early Access — Limited Spots
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Get early access & developer tips
        </h2>
        <p className="text-blue-100 mb-8 text-lg">
          Join 2,000+ developers building voice-first apps. Get integration guides, release notes, and exclusive deals.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 text-white text-lg font-semibold">
            <CheckCircle className="w-6 h-6 text-green-300" />
            You're in! We'll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-xl text-slate-900 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all whitespace-nowrap shadow-lg disabled:opacity-70"
            >
              {loading ? 'Joining...' : (<>Join Free <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>
        )}
        {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
        <p className="text-blue-200 text-xs mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}