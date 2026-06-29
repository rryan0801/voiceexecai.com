import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Mic, CheckCircle, MapPin, Phone, Mail, Briefcase, User, ArrowRight, Star, Zap } from 'lucide-react';

const VERTICALS = [
  { value: 'roofing', label: '🏠 Roofing' },
  { value: 'plumbing', label: '🔧 Plumbing' },
  { value: 'hvac', label: '❄️ HVAC' },
  { value: 'electrical', label: '⚡ Electrical' },
  { value: 'landscaping', label: '🌿 Landscaping' },
  { value: 'cleaning', label: '🧹 Cleaning' },
  { value: 'painting', label: '🎨 Painting' },
  { value: 'general_contractor', label: '🔨 General Contractor' },
  { value: 'pest_control', label: '🐛 Pest Control' },
  { value: 'solar', label: '☀️ Solar' },
  { value: 'other', label: '📋 Other' }
];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function GetLeads() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', vertical: '', city: '', state: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const lead = await base44.entities.BuyerLead.create({
        ...form,
        submitted_at: new Date().toISOString(),
        source: 'landing_page',
        stage: 'new'
      });
      // Trigger welcome email (fire and forget — no auth needed via public invoke)
      base44.functions.invoke('sendLeadWelcomeSequence', { lead_id: lead.id, email_type: 'welcome' }).catch(() => {});
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-10 shadow-2xl max-w-md w-full text-center border border-slate-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">You're in! 🎉</h2>
          <p className="text-slate-500 mb-2">We're matching you with buyers in <strong>{form.city}, {form.state}</strong>.</p>
          <p className="text-slate-500 mb-6 text-sm">Check your inbox — a welcome email is on its way to <strong>{form.email}</strong>.</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
            📬 Expect a sample lead in your inbox within 24 hours.
          </div>
          <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">← Back to homepage</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">VoiceExec<span className="text-blue-600">AI</span></span>
          </Link>
          <Link to="/pricing" className="text-sm text-blue-600 font-medium hover:underline">View Pricing</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-start">
        {/* Left: Value prop */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" /> Local leads delivered to your inbox
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Get More Customers<br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">In Your Area</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            We match buyers actively searching for your services with contractors ready to work. 
            No subscriptions. No upfront cost. Pay only for the leads you want.
          </p>
          <div className="space-y-4 mb-8">
            {[
              { icon: '✅', text: 'Pre-qualified buyers with confirmed budgets' },
              { icon: '📍', text: 'Matched by city and service vertical' },
              { icon: '⚡', text: 'Delivered within minutes of buyer submitting' },
              { icon: '💬', text: 'Full contact info — name, phone, email, project' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-slate-700"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
          {/* Social proof */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-100">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-slate-700 text-sm italic mb-2">"First lead I received turned into a $14k roofing job. Closed it in 3 days."</p>
            <p className="text-xs text-slate-500 font-semibold">— Marcus T., Roofing Contractor, DFW</p>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Get Leads in Your Area</h2>
            <p className="text-slate-500 text-sm mb-6">Free to sign up. No credit card required.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                    placeholder="John Smith"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="john@yourbusiness.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel" required value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="(555) 555-5555"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" value={form.company} onChange={e => update('company', e.target.value)}
                    placeholder="Smith Roofing LLC"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Vertical *</label>
                <select
                  required value={form.vertical} onChange={e => update('vertical', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select your service...</option>
                  {VERTICALS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text" required value={form.city} onChange={e => update('city', e.target.value)}
                      placeholder="Dallas"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">State *</label>
                  <select
                    required value={form.state} onChange={e => update('state', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">State</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Get My Leads <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-center text-xs text-slate-400">No spam · Unsubscribe anytime · Your info is never sold</p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 px-6 text-center text-xs text-slate-400">
        © 2026 VoiceExecAI ·{' '}
        <Link to="/privacy" className="hover:text-slate-600">Privacy Policy</Link> ·{' '}
        <Link to="/terms" className="hover:text-slate-600">Terms</Link>
      </footer>
    </div>
  );
}