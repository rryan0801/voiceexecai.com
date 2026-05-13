import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Zap, Shield, BarChart3, CheckCircle, ArrowRight, Star, Code2, Globe, Users } from 'lucide-react';

const BENEFITS = [
  {
    icon: <Mic className="w-6 h-6 text-blue-500" />,
    title: 'Voice-to-Action in Seconds',
    desc: 'Convert spoken commands into real CRM updates, emails, and task creation — without touching a keyboard.'
  },
  {
    icon: <Zap className="w-6 h-6 text-purple-500" />,
    title: 'Drop-In Integration',
    desc: 'One component, any React app. Plug VoiceExecAI into your existing stack in under 5 minutes.'
  },
  {
    icon: <Shield className="w-6 h-6 text-green-500" />,
    title: 'Enterprise-Grade & Secure',
    desc: 'GDPR, CCPA & SOC2 compliant. All audio is encrypted in transit and never stored permanently.'
  }
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for developers evaluating the platform.',
    features: [
      '500 voice commands/month',
      '1 active client',
      'Core intent parsing',
      'Community support',
      'Widget embed'
    ],
    cta: 'Get Started Free',
    highlight: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For teams shipping voice-powered products.',
    features: [
      '25,000 voice commands/month',
      'Up to 10 clients',
      'CRM integrations (HubSpot, Salesforce)',
      'Email + SMS routing',
      'Priority support',
      'Analytics dashboard'
    ],
    cta: 'Start Pro Trial',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large teams with custom workflows and SLAs.',
    features: [
      'Unlimited commands',
      'Unlimited clients',
      'Custom intent models',
      'Dedicated infrastructure',
      'SLA & uptime guarantee',
      'Onboarding & success team'
    ],
    cta: 'Contact Sales',
    highlight: false
  }
];

const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    role: 'VP of Sales, Fintech startup',
    quote: 'Our reps log calls 3x faster. VoiceExecAI paid for itself in the first week.',
    stars: 5
  },
  {
    name: 'Priya K.',
    role: 'Lead Developer, SaaS platform',
    quote: 'I integrated it in an afternoon. The portability architecture is genuinely brilliant.',
    stars: 5
  },
  {
    name: 'James R.',
    role: 'Founder, HealthTech app',
    quote: 'We use it for voice meal logging. The LLM intent parsing handles everything our users throw at it.',
    stars: 5
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">VoiceExecAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#benefits" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" /> Now powering 500+ voice-enabled apps
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Add Voice Commands to<br />
            <span className="text-blue-600">Any App in Minutes</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            VoiceExecAI is the drop-in voice-to-action framework for developers. One component. 
            Any React app. Real CRM updates, email routing, and task creation — hands-free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-lg shadow-lg shadow-blue-200"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="flex items-center gap-2 px-8 py-4 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-colors text-lg"
            >
              See Pricing
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-4">No credit card required · Free tier available · Setup in 5 minutes</p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 border-y border-slate-100 bg-white px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /><strong className="text-slate-800">500+</strong> apps powered</div>
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-purple-500" /><strong className="text-slate-800">2M+</strong> voice commands processed</div>
          <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-green-500" /><strong className="text-slate-800">99.9%</strong> uptime SLA</div>
          <div className="flex items-center gap-2"><Code2 className="w-4 h-4 text-orange-500" /><strong className="text-slate-800">&lt;5 min</strong> average integration time</div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why developers choose VoiceExecAI</h2>
            <p className="text-lg text-slate-500">Built for speed, designed for portability, trusted by teams worldwide.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {BENEFITS.map((b, i) => (
              <div key={i} className="p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-5">
                  {b.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{b.title}</h3>
                <p className="text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg text-slate-500 mb-16">Three steps from zero to voice-enabled.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Install the widget', desc: 'Drop `<VoiceWidget />` into your React component. Configure with your API key.' },
              { step: '02', title: 'User speaks a command', desc: '"Log a call with Acme Corp, strong interest, follow up Friday." — that\'s it.' },
              { step: '03', title: 'Actions execute automatically', desc: 'CRM updated, task created, follow-up email queued. All without a single click.' }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-600 text-white text-xl font-bold rounded-2xl flex items-center justify-center mb-5">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-500">Start free. Scale when you're ready. No surprises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 border-2 flex flex-col ${
                  plan.highlight
                    ? 'border-blue-500 shadow-xl shadow-blue-100 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full border-2 border-white">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={plan.highlight ? 'text-blue-50' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dashboard"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by builders</h2>
            <p className="text-lg text-slate-500">Here's what teams say after going live.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to go voice-first?</h2>
          <p className="text-blue-100 text-lg mb-10">Join hundreds of teams shipping smarter apps with VoiceExecAI.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-xl"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">No credit card · Free tier · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Mic className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-white">VoiceExecAI</span>
          </div>
          <p>© 2026 VoiceExecAI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}