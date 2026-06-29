import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Download, Star, Zap, Shield, Cloud, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppStoreBadges from '@/components/AppStoreBadges';

export default function MobileApp() {
  const features = [
    { icon: <Zap className="w-6 h-6" />, title: 'Lightning Fast', desc: 'Native app performance with instant load times' },
    { icon: <Cloud className="w-6 h-6" />, title: 'Works Offline', desc: 'Access your data even without internet' },
    { icon: <Shield className="w-6 h-6" />, title: 'Secure & Private', desc: 'Enterprise-grade encryption for all your data' },
    { icon: <Smartphone className="w-6 h-6" />, title: 'Native Experience', desc: 'Feels like a native app on any device' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-xs font-medium mb-8 shadow-sm"
          >
            <Download className="w-3 h-3" />
            <span className="font-semibold">Now available on iOS & Android</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6"
          >
            VoiceExecAI<br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">In Your Pocket</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10"
          >
            Download the mobile app and take voice-powered sales automation anywhere. 
            Available on iPhone, iPad, and Android devices.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <AppStoreBadges />
            <p className="text-sm text-slate-400">
              Or <Link to="/dashboard" className="text-blue-600 hover:underline font-medium">use the web app</Link> — same great experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Phone Mockup Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative mx-auto w-72">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-violet-600 rounded-[3rem] transform rotate-6 scale-105 opacity-20 blur-xl"></div>
                <div className="relative bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800">
                  <div className="bg-slate-800 rounded-[2rem] overflow-hidden">
                    <img
                      src="https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/febdeec7e_generated_image.png"
                      alt="VoiceExecAI Mobile App"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Everything you love, now mobile
              </h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                The full VoiceExecAI experience optimized for your phone. Voice commands, 
                CRM updates, deal tracking, and SEO automation — all in your pocket.
              </p>

              <div className="grid gap-4 mb-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                      <p className="text-sm text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free to download • No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why download the app?
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Enhanced features and native performance that make voice automation even better.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Push Notifications',
                desc: 'Get instant alerts for important deals, mentions, and SEO wins',
                icon: '🔔',
                gradient: 'from-orange-500 to-red-600'
              },
              {
                title: 'Offline Mode',
                desc: 'Access your data and draft commands even without internet',
                icon: '📶',
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                title: 'Faster Performance',
                desc: 'Native app caching means instant load times',
                icon: '⚡',
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                title: 'Home Screen Access',
                desc: 'One tap from your home screen — no browser needed',
                icon: '🏠',
                gradient: 'from-green-500 to-emerald-600'
              },
              {
                title: 'Better Voice Recognition',
                desc: 'Optimized mobile microphone access for clearer commands',
                icon: '🎤',
                gradient: 'from-indigo-500 to-blue-600'
              },
              {
                title: 'Background Sync',
                desc: 'Your data stays updated even when the app is closed',
                icon: '🔄',
                gradient: 'from-pink-500 to-rose-600'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to go mobile?
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Download VoiceExecAI today and take voice-powered automation everywhere.
          </p>
          <div className="flex flex-col items-center gap-6">
            <AppStoreBadges />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all text-lg shadow-2xl"
            >
              Try Web App Instead <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            Free to download • Works on iOS 14+ and Android 8+ • 4.9★ rating
          </p>
        </div>
      </section>
    </div>
  );
}