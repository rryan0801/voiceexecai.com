import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, Zap, Shield, BarChart3, CheckCircle, ArrowRight, Star, Code2,
  Globe, Users, ChevronDown, Menu, X, Brain, Phone, Mail, Target,
  TrendingUp, Clock, Lock, Cpu, MessageSquare
} from 'lucide-react';

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
  },
  {
    icon: <Brain className="w-6 h-6 text-orange-500" />,
    title: 'AI-Powered Intent Parsing',
    desc: 'State-of-the-art LLMs understand natural language — slang, abbreviations, and complex instructions.'
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
    title: 'Real-Time Analytics',
    desc: 'Track command usage, success rates, and rep performance in a live analytics dashboard.'
  },
  {
    icon: <Target className="w-6 h-6 text-red-500" />,
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

const FAQS = [
  {
    q: 'How long does integration really take?',
    a: 'Most developers are live in under 5 minutes. Drop in the <VoiceWidget /> component, pass your API key, and it works. No backend changes required.'
  },
  {
    q: 'Which CRMs and tools does it support?',
    a: 'Out of the box: HubSpot, Salesforce, Pipedrive, Slack, Outlook, Gmail, Twilio SMS, and LinkedIn. Custom integrations can be added via our webhook router.'
  },
  {
    q: 'Is my audio data stored or shared?',
    a: 'No. Audio is transcribed in real-time and immediately discarded. We never store raw audio. Transcriptions are encrypted and tied to your account only.'
  },
  {
    q: 'Can I customize the voice commands it understands?',
    a: 'Yes. You can define custom intents, command templates, and routing logic for your specific workflow. Pro and Enterprise plans include full playbook customization.'
  },
  {
    q: 'What happens if a command fails?',
    a: 'Every command is logged with its status. Failed commands surface in your analytics dashboard with error context, making debugging fast and transparent.'
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'Yes — the Pro plan comes with a 14-day free trial. No credit card required to start.'
  }
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
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
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

  return (
    <div className="min-h-screen bg-white text-slate-900 scroll-smooth">

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
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
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
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile menu */}
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
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-lg shadow-lg shadow-blue-200 w-full sm:w-auto justify-center"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="flex items-center gap-2 px-8 py-4 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-colors text-lg w-full sm:w-auto justify-center"
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
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /><strong className="text-slate-800">&lt;5 min</strong> average integration time</div>
          <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-slate-500" /><strong className="text-slate-800">SOC2</strong> compliant</div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
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
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-7 left-1/6 right-1/6 h-0.5 bg-blue-200 z-0" style={{left:'16.5%', right:'16.5%'}} />
            {[
              { step: '01', title: 'Install the widget', desc: 'Drop <VoiceWidget /> into your React component. Configure with your API key.', icon: <Code2 className="w-5 h-5 text-white" /> },
              { step: '02', title: 'User speaks a command', desc: '"Log a call with Acme Corp, strong interest, follow up Friday." — that\'s it.', icon: <Mic className="w-5 h-5 text-white" /> },
              { step: '03', title: 'Actions execute automatically', desc: 'CRM updated, task created, follow-up email queued. All without a single click.', icon: <Zap className="w-5 h-5 text-white" /> }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className="w-14 h-14 bg-blue-600 text-white text-xl font-bold rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Snippet / Developer Section */}
      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium mb-6">
                <Cpu className="w-3 h-3" /> Developer-first
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Integrate in 3 lines of code</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                No complex setup. No new infrastructure. Just drop in the component and you're live.
                Works with any React app — from solo projects to enterprise platforms.
              </p>
              <div className="space-y-3">
                {['TypeScript support included', 'Full event hooks & callbacks', 'Customizable UI & branding', 'Webhook-ready for any backend'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
              >
                View Docs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 font-mono text-sm overflow-x-auto">
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
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Connects to your existing stack</h2>
          <p className="text-lg text-slate-500 mb-12">Out-of-the-box integrations with the tools your team already uses.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {INTEGRATIONS.map((item, i) => (
              <span key={i} className={`px-4 py-2 rounded-full text-sm font-medium ${item.color}`}>
                {item.name}
              </span>
            ))}
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-500">
              + Custom webhooks
            </span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
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
          <p className="text-center text-slate-400 text-sm mt-8">All plans include a 14-day free trial on paid tiers. No credit card required.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by builders</h2>
            <p className="text-lg text-slate-500">Here's what teams say after going live.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
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

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently asked questions</h2>
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
              <Link to="/dashboard" className="text-blue-600 hover:underline font-medium">
                Reach out to our team →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-violet-600">
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
      <footer className="py-12 px-6 bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white text-base">VoiceExecAI</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                The drop-in voice-to-action framework for React developers. Trusted by 500+ apps worldwide.
              </p>
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
            <p>© 2026 VoiceExecAI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}