import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic, Zap, Shield, CheckCircle, ArrowRight, Star, Code2,
  Globe, Users, ChevronDown, Menu, X, Brain, Mail, Target,
  TrendingUp, Clock, Lock, Cpu, Sparkles, ArrowUp
} from 'lucide-react';

const BENEFITS = [
  {
    icon: <Mic className="w-7 h-7 text-blue-500" />,
    title: 'Voice-to-Action in Seconds',
    desc: 'Convert spoken commands into real CRM updates, emails, and task creation — without touching a keyboard.'
  },
  {
    icon: <Zap className="w-7 h-7 text-purple-500" />,
    title: 'Drop-In Integration',
    desc: 'One component, any React app. Plug VoiceExecAI into your existing stack in under 5 minutes.'
  },
  {
    icon: <Shield className="w-7 h-7 text-green-500" />,
    title: 'Enterprise-Grade & Secure',
    desc: 'GDPR, CCPA & SOC2 compliant. All audio is encrypted in transit and never stored permanently.'
  },
  {
    icon: <Brain className="w-7 h-7 text-orange-500" />,
    title: 'AI-Powered Intent Parsing',
    desc: 'State-of-the-art LLMs understand natural language — slang, abbreviations, and complex instructions.'
  },
  {
    icon: <TrendingUp className="w-7 h-7 text-blue-500" />,
    title: 'Real-Time Analytics',
    desc: 'Track command usage, success rates, and rep performance in a live analytics dashboard.'
  },
  {
    icon: <Target className="w-7 h-7 text-red-500" />,
    title: 'CRM & Tool Routing',
    desc: 'Auto-routes actions to HubSpot, Salesforce, Pipedrive, Slack, email, SMS, and more.'
  }
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for developers evaluating the platform.',
    features: ['500 voice commands/month', '1 active client', 'Core intent parsing', 'Community support', 'Widget embed'],
    cta: 'Get Started Free',
    highlight: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For teams shipping voice-powered products.',
    features: ['25,000 voice commands/month', 'Up to 10 clients', 'CRM integrations (HubSpot, Salesforce)', 'Email + SMS routing', 'Priority support', 'Analytics dashboard'],
    cta: 'Start Pro Trial',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large teams with custom workflows and SLAs.',
    features: ['Unlimited commands', 'Unlimited clients', 'Custom intent models', 'Dedicated infrastructure', 'SLA & uptime guarantee', 'Onboarding & success team'],
    cta: 'Contact Sales',
    highlight: false
  }
];

const TESTIMONIALS = [
  { name: 'Marcus T.', role: 'VP of Sales, Fintech startup', quote: 'Our reps log calls 3x faster. VoiceExecAI paid for itself in the first week.', stars: 5 },
  { name: 'Priya K.', role: 'Lead Developer, SaaS platform', quote: 'I integrated it in an afternoon. The portability architecture is genuinely brilliant.', stars: 5 },
  { name: 'James R.', role: 'Founder, HealthTech app', quote: 'We use it for voice meal logging. The LLM intent parsing handles everything our users throw at it.', stars: 5 }
];

const FAQS = [
  { q: 'How long does integration really take?', a: 'Most developers are live in under 5 minutes. Drop in the <VoiceWidget /> component, pass your API key, and it works. No backend changes required.' },
  { q: 'Which CRMs and tools does it support?', a: 'Out of the box: HubSpot, Salesforce, Pipedrive, Slack, Outlook, Gmail, Twilio SMS, and LinkedIn. Custom integrations can be added via our webhook router.' },
  { q: 'Is my audio data stored or shared?', a: 'No. Audio is transcribed in real-time and immediately discarded. We never store raw audio. Transcriptions are encrypted and tied to your account only.' },
  { q: 'Can I customize the voice commands it understands?', a: 'Yes. You can define custom intents, command templates, and routing logic for your specific workflow. Pro and Enterprise plans include full playbook customization.' },
  { q: 'What happens if a command fails?', a: 'Every command is logged with its status. Failed commands surface in your analytics dashboard with error context, making debugging fast and transparent.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes — the Pro plan comes with a 14-day free trial. No credit card required to start.' }
];

const INTEGRATIONS = [
  { name: 'HubSpot', color: 'bg-orange-100 text-orange-700' },
  { name: 'Salesforce', color: 'bg-blue-100 text-blue-700' },
  { name: 'Pipedrive', color: 'bg-green-100 text-green-700' },
  { name: 'Slack', color: 'bg-purple-100 text-purple-700' },
  { name: 'Outlook', color: 'bg-blue-100 text-blue-800' },
  { name: 'Gmail', color: 'bg-red-100 text-red-700' },
  { name: 'Twilio SMS', color: 'bg-pink-100 text-pink-700' },
  { name: 'LinkedIn', color: 'bg-blue-100 text-blue-600' },
  { name: 'WhatsApp', color: 'bg-green-100 text-green-700' },
  { name: 'Microsoft Teams', color: 'bg-indigo-100 text-indigo-700' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-900 pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">VoiceExec<span className="text-blue-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#integrations" className="hover:text-blue-600 transition-colors">Integrations</a>
            <Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Get Started Free
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
            <a href="#features" className="px-2 py-1.5 text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#integrations" className="px-2 py-1.5 text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Integrations</a>
            <a href="#pricing" className="px-2 py-1.5 text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="px-2 py-1.5 text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <Link to="/dashboard" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-medium">Get Started Free</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-blue-50 via-violet-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-xs font-medium mb-8 shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold">Now powering 500+ voice-enabled apps</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6"
          >
            Add Voice Commands to<br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Any App in Minutes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10"
          >
            VoiceExecAI is the drop-in voice-to-action framework for developers. One component.
            Any React app. Real CRM updates, email routing, and task creation — hands-free.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all text-lg shadow-xl shadow-blue-200 w-full sm:w-auto justify-center"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-2 px-8 py-4 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-all text-lg hover:bg-slate-50 w-full sm:w-auto justify-center"
            >
              See Pricing
            </Link>
          </motion.div>
          <p className="text-xs text-slate-400 mt-6">No credit card required · Free tier available · Setup in 5 minutes</p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-10 border-y border-slate-100 bg-slate-50 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-10 text-sm">
          {[
            { icon: Users, value: '500+', label: 'apps powered', color: 'text-blue-500' },
            { icon: Zap, value: '2M+', label: 'commands processed', color: 'text-purple-500' },
            { icon: Globe, value: '99.9%', label: 'uptime SLA', color: 'text-green-500' },
            { icon: Clock, value: '<5 min', label: 'integration time', color: 'text-orange-500' },
            { icon: Lock, value: 'SOC2', label: 'compliant', color: 'text-slate-500' }
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <strong className="text-slate-900 text-base">{stat.value}</strong>
              <span className="text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why developers choose VoiceExecAI</h2>
            <p className="text-lg text-slate-500">Built for speed, designed for portability, trusted by teams worldwide.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {BENEFITS.map((b, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all bg-gradient-to-br from-white to-slate-50">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
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
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg text-slate-500 mb-16">Three steps from zero to voice-enabled.</p>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-blue-300 via-violet-300 to-blue-300 z-0" />
            {[
              { step: '01', title: 'Install the widget', desc: 'Drop <VoiceWidget /> into your React component. Configure with your API key.' },
              { step: '02', title: 'User speaks a command', desc: '"Log a call with Acme Corp, strong interest, follow up Friday." — that\'s it.' },
              { step: '03', title: 'Actions execute automatically', desc: 'CRM updated, task created, follow-up email queued. All without a single click.' }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 text-white text-xl font-bold rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-medium mb-6">
                <Cpu className="w-3 h-3" />
                <span className="font-semibold">Developer-first</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Integrate in 3 lines of code</h2>
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                No complex setup. No new infrastructure. Just drop in the component and you're live.
              </p>
              <div className="space-y-3 mb-8">
                {['TypeScript support included', 'Full event hooks & callbacks', 'Customizable UI & branding', 'Webhook-ready for any backend'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-slate-300 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg">
                View Docs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 font-mono text-sm overflow-x-auto shadow-2xl">
              <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">{`import { VoiceWidget } from 'voiceexec-ai';

export default function MyApp() {
  return (
    <VoiceWidget
      apiKey="your_api_key"
      clientId="acme_corp"
      onSuccess={(result) => {
        console.log('Action executed:', result);
      }}
    />
  );
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Connects to your existing stack</h2>
          <p className="text-lg text-slate-500 mb-12">Out-of-the-box integrations with the tools your team already uses.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {INTEGRATIONS.map((item, i) => (
              <span key={i} className={`px-5 py-2.5 rounded-full text-sm font-medium ${item.color} shadow-sm`}>
                {item.name}
              </span>
            ))}
            <span className="px-5 py-2.5 rounded-full text-sm font-medium bg-slate-100 text-slate-500 shadow-sm">
              + Custom webhooks
            </span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Loved by builders</h2>
            <p className="text-lg text-slate-500">Here's what teams say after going live.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-lg hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                <p className="text-slate-400 text-xs">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-500">Start free. Scale when you're ready. No surprises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 border-2 flex flex-col transition-all hover:-translate-y-2 ${
                  plan.highlight
                    ? 'border-blue-500 shadow-2xl shadow-blue-200 bg-gradient-to-br from-blue-600 to-violet-600 text-white'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:shadow-xl'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-lg z-10">
                    ⭐ MOST POPULAR
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
                <Link
                  to="/pricing"
                  className={`block text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm mt-8">
            All plans include a 14-day free trial on paid tiers. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Frequently asked questions</h2>
            <p className="text-lg text-slate-500">Everything you need to know before getting started.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-slate-500 text-sm">
              Still have questions?{' '}
              <Link to="/contact" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                Reach out to our team <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to go voice-first?</h2>
          <p className="text-blue-100 text-lg mb-10">Join hundreds of teams shipping smarter apps with VoiceExecAI.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-12 py-5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all text-lg shadow-2xl"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-6">No credit card · Free tier · Cancel anytime</p>
        </div>
      </section>

      {/* Contractor CTA Banner */}
      <section className="py-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h3 className="text-2xl font-bold mb-1">Are you a contractor or service business?</h3>
            <p className="text-green-100">Get leads in your area — roofing, plumbing, HVAC, electrical, and more.</p>
          </div>
          <Link
            to="/get-leads"
            className="flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg whitespace-nowrap"
          >
            Get Leads in My Area <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-slate-300 text-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white text-base">VoiceExecAI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mb-3">
                The drop-in voice-to-action framework for React developers. Trusted by 500+ apps worldwide.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3 h-3" />
                <a href="mailto:support@voiceexecai.com" className="hover:text-white transition-colors">support@voiceexecai.com</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#integrations" className="block hover:text-white transition-colors">Integrations</a>
                <a href="#pricing" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#faq" className="block hover:text-white transition-colors">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Platform</h4>
              <div className="space-y-2">
                <Link to="/dashboard" className="block hover:text-white transition-colors">Dashboard</Link>
                <Link to="/analytics" className="block hover:text-white transition-colors">Analytics</Link>
                <Link to="/playbooks" className="block hover:text-white transition-colors">Playbooks</Link>
              </div>
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

      {/* Scroll to Top */}
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