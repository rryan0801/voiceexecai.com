import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Users, BarChart3, Clock, Lock, ArrowRight } from 'lucide-react';
import NavBar from '@/components/NavBar';

const PLAN_BENEFITS = {
  Free: {
    price: '$0',
    features: [
      '500 voice commands/month',
      '1 active client',
      'Core intent parsing',
      'Community support',
      'Widget embed'
    ],
    color: 'from-slate-500 to-slate-600'
  },
  Pro: {
    price: '$49',
    features: [
      '25,000 voice commands/month',
      'Up to 10 clients',
      'CRM integrations (HubSpot, Salesforce)',
      'Email + SMS routing',
      'Priority support',
      'Analytics dashboard',
      '14-day free trial'
    ],
    color: 'from-blue-600 to-violet-600'
  },
  Enterprise: {
    price: '$999',
    features: [
      'Unlimited commands',
      'Unlimited clients',
      'Custom intent models',
      'Dedicated infrastructure',
      'SLA & uptime guarantee',
      'Onboarding & success team',
      'Custom integrations'
    ],
    color: 'from-purple-600 to-pink-600'
  }
};

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const planName = searchParams.get('plan') || 'Pro';
  const plan = PLAN_BENEFITS[planName] || PLAN_BENEFITS.Pro;

  useEffect(() => {
    // Auto-redirect to dashboard after 10 seconds if no session ID
    if (!sessionId) {
      const timer = setTimeout(() => navigate('/dashboard'), 10000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
      <NavBar />
      
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            Payment Successful! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-slate-600 mb-2"
          >
            Welcome to the VoiceExecAI {planName} plan
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-slate-500 mb-8"
          >
            {sessionId && `Session ID: ${sessionId.slice(0, 12)}...`}
          </motion.p>
        </motion.div>

        {/* Benefits Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={`bg-gradient-to-br ${plan.color} rounded-2xl p-10 text-white shadow-2xl mb-10`}
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{planName} Plan</h2>
              <p className="text-white/90 text-lg">{plan.price}/month</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              ⭐
            </motion.div>
          </div>

          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Your Benefits
          </h3>

          <ul className="space-y-3">
            {plan.features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
                className="flex items-start gap-3 text-white/95"
              >
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Clock, label: 'Instant Access', desc: 'Start using all features immediately' },
            { icon: Lock, label: 'Secure Billing', desc: 'Your payment is encrypted and safe' },
            { icon: Users, label: 'Support Ready', desc: 'Contact us anytime if you need help' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-md text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{item.label}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-8 py-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl transition-all hover:bg-slate-50"
          >
            ← Back to Home
          </motion.button>
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          A confirmation email has been sent to your registered email address.
        </motion.p>
      </div>
    </div>
  );
}