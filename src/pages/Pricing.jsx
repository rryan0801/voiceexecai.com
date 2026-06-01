import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Sparkles, ArrowRight, Zap, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    priceId: 'price_1TdN8qPn68JNcWlrf0QG1uUx',
    description: 'Perfect for developers evaluating the platform.',
    features: [
      '500 voice commands/month',
      '1 active client',
      'Core intent parsing',
      'Community support',
      'Widget embed'
    ],
    cta: 'Get Started Free',
    highlight: false,
    popular: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    priceId: 'price_1TdN8qPn68JNcWlrad7GTriQ',
    description: 'For teams shipping voice-powered products.',
    features: [
      '25,000 voice commands/month',
      'Up to 10 clients',
      'CRM integrations (HubSpot, Salesforce)',
      'Email + SMS routing',
      'Priority support',
      'Analytics dashboard',
      '14-day free trial'
    ],
    cta: 'Start Pro Trial',
    highlight: true,
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$999',
    period: '/month',
    priceId: 'price_1TdN8pPn68JNcWlrtEjedi85',
    description: 'For large teams with custom workflows and SLAs.',
    features: [
      'Unlimited commands',
      'Unlimited clients',
      'Custom intent models',
      'Dedicated infrastructure',
      'SLA & uptime guarantee',
      'Onboarding & success team',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    highlight: false,
    popular: false
  }
];

export default function Pricing() {
  const [searchParams] = useSearchParams();
  const [isInIframe, setIsInIframe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['stripe-subscription'],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('checkStripeSubscription', {});
        return res.data;
      } catch {
        return { subscribed: false };
      }
    }
  });

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  const handleCheckout = async (priceId, planName) => {
    if (isInIframe) {
      alert('⚠️ Checkout only works in the published app.\n\nPlease open this page in a new tab from your published app URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', {
        price_id: priceId,
        plan_name: planName
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canceled = searchParams.get('canceled') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-xs font-medium mb-6 shadow-sm cursor-default"
          >
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold">Simple, transparent pricing</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Start free. Scale when you're ready. No surprises.
          </p>

          {canceled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              Checkout was canceled. Ready to try again?
            </motion.div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className={`relative rounded-2xl p-8 border-2 flex flex-col transition-all overflow-hidden ${
                plan.highlight
                  ? 'border-blue-500 shadow-2xl shadow-blue-200 bg-gradient-to-br from-blue-600 to-violet-600 text-white'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-lg z-10"
                >
                  ⭐ MOST POPULAR
                </motion.div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-5xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <motion.li 
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + j * 0.05 }}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                    <span className={plan.highlight ? 'text-blue-50' : 'text-slate-600'}>{f}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => handleCheckout(plan.priceId, plan.name)}
                  disabled={loading || (plan.name === 'Free' && subscription?.subscribed)}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all relative overflow-hidden ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                      : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                  } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : subscription?.subscribed && plan.name === 'Free' ? (
                    'Current Plan'
                  ) : (
                    <>
                      {plan.cta} <ArrowRight className="w-4 h-4 inline" />
                    </>
                  )}
                </Button>
              </motion.div>

              {subscription?.subscribed && subscription.plan_name === plan.name && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-center text-xs text-green-600 font-medium"
                >
                  ✓ Your current plan
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg"
        >
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            What's Included in Every Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Sub-second response times for all voice commands' },
              { icon: Shield, title: 'Enterprise Security', desc: 'SOC2, GDPR, CCPA compliant with end-to-end encryption' },
              { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track usage, success rates, and performance metrics' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Can I change plans later?', a: 'Yes! You can upgrade or downgrade your plan at any time from your dashboard.' },
              { q: 'What happens if I exceed my quota?', a: 'We will notify you when you are approaching your limit. You can upgrade anytime or we will throttle requests until next billing cycle.' },
              { q: 'Is there a free trial?', a: 'Yes! The Pro plan includes a 14-day free trial. No credit card required to start.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. Enterprise plans can also pay via invoice.' }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-200 transition-colors"
              >
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-500 text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-slate-500 mb-6">
            Our team is here to help you choose the perfect plan.
          </p>
          <Link to="/contact">
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg">
              Contact Sales <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}