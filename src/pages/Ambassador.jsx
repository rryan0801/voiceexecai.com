import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, DollarSign, TrendingUp, Users, ArrowRight, Sparkles, Gift, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import NavBar from '@/components/NavBar';
import { toast } from 'sonner';

const TIERS = [
  {
    name: 'Advocate',
    referrals: '1–4',
    commission: '20%',
    color: 'from-blue-500 to-cyan-500',
    icon: Gift,
    benefits: ['20% recurring commission', '90-day cookie window', 'Monthly payouts', 'Affiliate dashboard']
  },
  {
    name: 'Champion',
    referrals: '5–19',
    commission: '25%',
    color: 'from-violet-500 to-purple-500',
    icon: TrendingUp,
    benefits: ['25% recurring commission', 'All Advocate benefits', 'Priority support', 'Early access to features']
  },
  {
    name: 'Legend',
    referrals: '20+',
    commission: '30%',
    color: 'from-amber-500 to-orange-500',
    icon: Crown,
    benefits: ['30% recurring commission', 'All Champion benefits', '1-on-1 onboarding calls', 'Co-marketing opportunities']
  }
];

const EXAMPLE_EARNINGS = [
  { referrals: 5, plan: 'Pro', monthly: '$122.50', yearly: '$1,470' },
  { referrals: 10, plan: 'Pro', monthly: '$245', yearly: '$2,940' },
  { referrals: 20, plan: 'Pro', monthly: '$490', yearly: '$5,880' },
  { referrals: 50, plan: 'Pro', monthly: '$1,225', yearly: '$14,700' }
];

export default function Ambassador() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    audience: '',
    platform: '',
    why: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In production: send to backend function
    console.log('Ambassador application:', formData);
    setSubmitted(true);
    toast.success('Application submitted! We\'ll review within 48 hours.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
      <NavBar />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-xs font-medium mb-6 shadow-sm cursor-default"
          >
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold">Earn 30% recurring commission</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4">
            VoiceExecAI Ambassador Program
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Share VoiceExecAI with your audience. Earn recurring revenue every month.
            Help others reach inbox zero. Get paid for it.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { icon: DollarSign, value: '30%', label: 'Max commission rate', color: 'text-green-600' },
            { icon: TrendingUp, value: 'Recurring', label: 'Earn every month', color: 'text-blue-600' },
            { icon: Users, value: '90 days', label: 'Cookie window', color: 'text-violet-600' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Earning Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-8 mb-16 text-white shadow-xl"
        >
          <h2 className="text-3xl font-bold mb-2">Quick Math</h2>
          <p className="text-blue-100 mb-6">Here's what you could earn referring people to the Pro plan ($49/mo):</p>
          
          <div className="grid md:grid-cols-4 gap-4">
            {EXAMPLE_EARNINGS.map((example, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="text-sm text-blue-200 mb-1">{example.referrals} referrals</div>
                <div className="text-2xl font-bold mb-1">{example.monthly}/mo</div>
                <div className="text-xs text-blue-200">{example.yearly}/year</div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-blue-200 text-sm mt-6">
            * Based on 30% commission tier. Actual earnings vary based on referral count and plan types.
          </p>
        </motion.div>

        {/* Commission Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Commission Tiers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TIERS.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative rounded-2xl p-8 border-2 bg-white flex flex-col overflow-hidden"
              >
                {tier.name === 'Legend' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-lg z-10">
                    ⭐ TOP TIER
                  </div>
                )}
                
                <div className={`w-14 h-14 bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <tier.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{tier.name}</h3>
                <div className="text-sm text-slate-500 mb-3">{tier.referrals} referrals</div>
                
                <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-4">
                  {tier.commission}
                </div>
                <div className="text-sm text-slate-500 mb-6">recurring commission</div>
                
                <ul className="space-y-3 flex-1">
                  {tier.benefits.map((benefit, j) => (
                    <motion.li 
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + j * 0.05 }}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Apply', desc: 'Fill out the application below. Takes 2 minutes.' },
              { step: '02', title: 'Get Approved', desc: 'We review within 48 hours. Most are approved.' },
              { step: '03', title: 'Share Your Link', desc: 'Get your unique affiliate link. Share everywhere.' },
              { step: '04', title: 'Earn Recurring', desc: 'Get paid monthly. Earn for as long as they stay.' }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 text-white text-2xl font-bold rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Apply Now</h2>
            <p className="text-slate-500 mb-6">Takes 2 minutes. We approve within 48 hours.</p>
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
                <p className="text-slate-500">We'll review your application and get back to you within 48 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company / Platform</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Your company, newsletter, YouTube channel, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Describe Your Audience *</label>
                  <Textarea
                    required
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    placeholder="Size, demographics, interests (e.g., '5,000 productivity-focused professionals on LinkedIn')"
                    className="h-24"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Primary Platform</label>
                  <Input
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    placeholder="LinkedIn, Twitter, YouTube, Newsletter, Podcast, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Why do you want to partner with VoiceExecAI? *</label>
                  <Textarea
                    required
                    value={formData.why}
                    onChange={(e) => setFormData({...formData, why: e.target.value})}
                    placeholder="Tell us why you're excited about VoiceExecAI and how you plan to promote it"
                    className="h-32"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                >
                  Submit Application <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <p className="text-xs text-slate-400 text-center">
                  By submitting, you agree to our Ambassador Program Terms. We'll review your application within 48 hours.
                </p>
              </form>
            )}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto mt-16"
        >
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'When do I get paid?', a: 'Payouts are processed monthly on the 15th. Minimum payout is $50 via PayPal or bank transfer.' },
              { q: 'How long does the cookie last?', a: '90 days. If someone clicks your link and signs up within 90 days, you get credit.' },
              { q: 'Can I promote on paid ads?', a: 'Yes! But you cannot bid on VoiceExecAI trademarked terms. Check our full guidelines after approval.' },
              { q: 'What if someone upgrades their plan?', a: 'You earn commission on their total monthly spend. If they upgrade from Pro to Enterprise, your commission increases.' },
              { q: 'Do you provide marketing materials?', a: 'Yes! Approved ambassadors get access to email templates, social posts, banners, and landing pages.' }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="bg-white rounded-xl p-6 border border-slate-200"
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
          transition={{ delay: 0.7 }}
          className="text-center mt-16 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Questions before applying?
          </h2>
          <p className="text-slate-500 mb-6">
            We're here to help. Reach out anytime.
          </p>
          <a 
            href="mailto:hello@voiceexecai.com?subject=Ambassador Program Question"
            className="inline-flex items-center gap-2 px-8 py-4 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-all hover:bg-slate-50"
          >
            Email Us <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}