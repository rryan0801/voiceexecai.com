import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import InteractiveDemo from '@/components/InteractiveDemo';
import { base44 } from '@/api/base44Client';
import {
  CheckCircle, ArrowRight,
  Menu, X, TrendingUp, Sparkles, ArrowUp, Heart,
  Phone, Calendar, Mail
} from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    priceId: 'price_1TdNAuIcky2cOtqjyd0qZIht',
    description: 'Start running your sales day by voice.',
    features: [
      '500 voice commands/month',
      '1 sales rep',
      'Update deals & tasks by voice',
      'Email + Slack routing',
      'Community support'
    ],
    cta: 'Try it free',
    highlight: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    priceId: 'price_1TdNAuIcky2cOtqj5Yz6Xu82',
    description: 'For reps who live on the phone and in the car.',
    features: [
      '25,000 voice commands/month',
      'Up to 10 reps',
      'CRM integrations (HubSpot, Salesforce, Pipedrive)',
      '14-day free trial — no card required',
      'Analytics dashboard',
      'Priority support'
    ],
    cta: 'Start Pro Trial',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: '$999',
    period: '/month',
    priceId: 'price_1TdNAuIcky2cOtqjatRzvOYi',
    description: 'For sales teams with custom workflows and SLAs.',
    features: [
      'Unlimited commands',
      'Unlimited reps',
      'Custom intent models',
      'Dedicated infrastructure',
      'SLA & uptime guarantee',
      'Onboarding & success team'
    ],
    cta: 'Contact Sales',
    highlight: false
  }
];

const TIP_AMOUNTS = [5, 10, 25];

const VOICE_EXAMPLES = [
  { icon: <TrendingUp className="w-5 h-5" />, text: '"Move Acme Corp to Negotiation, strong interest."' },
  { icon: <Calendar className="w-5 h-5" />, text: '"Schedule a follow-up call with Priya for Friday."' },
  { icon: <Mail className="w-5 h-5" />, text: '"Send the pricing deck to James at Globex."' },
  { icon: <Phone className="w-5 h-5" />, text: '"Log a call with Beta Inc — they want a demo."' }
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [tipLoading, setTipLoading] = useState(null);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const alertIframe = () =>
    alert('Checkout only works in the published app.\n\nPlease open this page from your published app URL.');

  const handleCheckout = async (plan) => {
    if (isInIframe) return alertIframe();
    if (plan.name === 'Free') {
      window.location.href = '/dashboard';
      return;
    }
    if (plan.name === 'Enterprise') {
      window.location.href = '/contact';
      return;
    }
    setLoadingPlan(plan.name);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', {
        price_id: plan.priceId,
        plan_name: plan.name,
        trial_days: 14
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleTip = async (amount) => {
    if (isInIframe) return alertIframe();
    setTipLoading(amount);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', {
        mode: 'payment',
        amount: amount * 100,
        tip_name: 'Tip'
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (error) {
      console.error('Tip checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setTipLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/7cf925e7b_generated_image.png"
              alt="VoiceExec AI logo"
              className="w-8 h-8"
            />
            <span className="font-bold text-lg text-slate-900">VoiceExec<span className="text-blue-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md"
            >
              Try it free
            </Link>
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4 flex flex-col gap-3 text-sm">
            <a href="#how-it-works" className="px-2 py-1.5 text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#pricing" className="px-2 py-1.5 text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="px-2 py-1.5 text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <Link to="/dashboard" className="mt-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg text-center font-semibold">Try it free</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-blue-50 via-violet-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-xs font-medium mb-8 shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold">The voice-first sales assistant</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6"
          >
            Real-Time Brand Sentiment<br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">& Reputation Management</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10"
          >
            Update deals, log calls, and send follow-ups — all by voice. VoiceExecAI is the
            voice-to-action assistant for sales reps who close, not click.
          </motion.p>

          {/* Voice examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-2xl mx-auto mb-10 grid sm:grid-cols-2 gap-3 text-left"
          >
            {VOICE_EXAMPLES.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <span className="text-blue-500 flex-shrink-0">{ex.icon}</span>
                <span className="text-sm text-slate-700 font-medium">{ex.text}</span>
              </div>
            ))}
          </motion.div>

          {/* ONE clear CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(37,99,235,0.4)', '0 0 0 14px rgba(37,99,235,0)'] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all text-lg shadow-xl shadow-blue-200 w-full sm:w-auto justify-center"
              >
                Try it free <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <a
              href="#demo"
              className="flex items-center gap-2 px-8 py-5 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-all text-lg hover:bg-slate-50 w-full sm:w-auto justify-center"
            >
              See it in action
            </a>
          </motion.div>
          <p className="text-xs text-slate-400 mt-6">Free forever plan · No credit card required · Setup in minutes</p>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="bg-white">
        <InteractiveDemo />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">How VoiceExec AI works</h2>
            <p className="text-lg text-slate-500">Monitor, analyze, and respond — all on autopilot.</p>
          </div>

          {/* 1. Monitor */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Monitor Online Sentiment in Real Time</h2>
            <p className="text-slate-500 mb-6 max-w-2xl">VoiceExec AI continuously scans reviews, social media, and forums to capture what people are saying about your brand the moment they say it.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Track mentions across every channel</h3>
                <p className="text-sm text-slate-500">Reviews, Twitter, Reddit, Google, and industry forums unified into one live sentiment feed.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Instant alerts on sentiment shifts</h3>
                <p className="text-sm text-slate-500">Get notified the moment sentiment spikes positive or negative so you can act before a story breaks.</p>
              </div>
            </div>
          </div>

          {/* 2. Analyze */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Analyze Customer Feedback Trends</h2>
            <p className="text-slate-500 mb-6 max-w-2xl">Turn thousands of scattered comments into clear, actionable trends that show what's driving your reputation.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Spot emerging issues before they escalate</h3>
                <p className="text-sm text-slate-500">AI clusters recurring complaints so you can fix root causes before they become a crisis.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Benchmark sentiment over time</h3>
                <p className="text-sm text-slate-500">Track week-over-week and month-over-month sentiment to measure the impact of every change you make.</p>
              </div>
            </div>
          </div>

          {/* 3. Respond */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">AI-Generated Professional Responses</h2>
            <p className="text-slate-500 mb-6 max-w-2xl">Reply to reviews and mentions in seconds with on-brand, AI-drafted responses your team can review and send.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Reply in your brand voice instantly</h3>
                <p className="text-sm text-slate-500">VoiceExec AI learns your tone and drafts responses that sound like they came from your team — not a bot.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Turn negative feedback into trust</h3>
                <p className="text-sm text-slate-500">Thoughtful, timely AI responses convert unhappy customers into loyal advocates and protect your public image.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Simple pricing</h2>
            <p className="text-lg text-slate-500">Start free. Upgrade when your pipeline grows.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 border-2 flex flex-col transition-all ${
                  plan.highlight
                    ? 'border-blue-500 shadow-2xl shadow-blue-200 bg-gradient-to-br from-blue-600 to-violet-600 text-white'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:shadow-xl'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-lg z-10">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-5xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={plan.highlight ? 'text-blue-50' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingPlan === plan.name}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  } ${loadingPlan === plan.name ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loadingPlan === plan.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>{plan.cta} <ArrowRight className="w-4 h-4 inline" /></>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm mt-8">
            All plans billed securely via Stripe. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Tip */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-pink-200 rounded-full text-pink-600 text-xs font-medium mb-6 shadow-sm">
            <Heart className="w-3 h-3" />
            <span className="font-semibold">Found it useful?</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Leave a tip</h2>
          <p className="text-slate-500 mb-8">No subscription needed — a one-time tip keeps VoiceExecAI growing.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {TIP_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => handleTip(amt)}
                disabled={tipLoading === amt}
                className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-pink-400 hover:bg-pink-50 text-slate-800 font-bold rounded-xl transition-all shadow-sm disabled:opacity-60"
              >
                {tipLoading === amt ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  </span>
                ) : (
                  <>${amt}</>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to close by talking?</h2>
          <p className="text-blue-100 text-lg mb-10">Join reps who update deals without ever opening a keyboard.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-12 py-5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all text-lg shadow-2xl"
          >
            Try it free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-6">Free forever · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-slate-300 text-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/7cf925e7b_generated_image.png"
                  alt="VoiceExec AI logo"
                  className="w-7 h-7"
                />
                <span className="font-bold text-white text-base">VoiceExecAI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                The voice-first sales assistant. Run your sales day by talking.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Product</h4>
              <div className="space-y-2">
                <a href="#how-it-works" className="block hover:text-white transition-colors">How it works</a>
                <a href="#pricing" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#faq" className="block hover:text-white transition-colors">FAQ</a>
                <Link to="/dashboard" className="block hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Company</h4>
              <div className="space-y-2">
                <Link to="/contact" className="block hover:text-white transition-colors">Contact</Link>
                <Link to="/pricing" className="block hover:text-white transition-colors">Plans</Link>
                <Link to="/privacy" className="block hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="block hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">More from our network</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="https://heyrichyai.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-xs">Hey Richy AI — AI Sales Partner</a>
              <a href="https://richyryanofficial.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-xs">Richy Ryan — Tech & AI</a>
              <a href="https://wordforge.games" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-xs">WordForge — Daily Word Game</a>
              <a href="https://richyryan.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-xs">Richy Ryan — Faith & Culture</a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500">© 2026 VoiceExecAI (voiceexecai.com). All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/security" className="hover:text-white transition-colors">Security</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-blue-300/50 transition-shadow"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}