import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileCheck, Server, CheckCircle, Globe } from 'lucide-react';

export default function Security() {
  const securityFeatures = [
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: 'Encrypted Connection',
      desc: 'All audio and data travel over an encrypted HTTPS connection.'
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'Your Privacy Rights',
      desc: 'You can ask us to see, export, or delete your data at any time. See our Privacy Policy.'
    },
    {
      icon: <FileCheck className="w-6 h-6 text-purple-600" />,
      title: 'Secure Payments',
      desc: 'Card payments are handled by Stripe. We never see or store your full card number.'
    },
    {
      icon: <Server className="w-6 h-6 text-orange-600" />,
      title: 'Managed Hosting',
      desc: 'The app runs on managed cloud hosting, so servers are patched and maintained for us.'
    }
  ];

  // Certification badges were removed (2026-11-04): we hold no certifications of our own.
  const complianceBadges = [];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium mb-4">
            <Shield className="w-3 h-3" /> Security
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Security & Compliance</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Here is how we protect your data.
          </p>
        </div>

        {/* Compliance Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {complianceBadges.map((badge, i) => (
            <span key={i} className={`px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>
              {badge.name}
            </span>
          ))}
        </div>

        {/* Security Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {securityFeatures.map((feature, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Data Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Voice commands are turned into text so they can be acted on</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Transcriptions are sent over encrypted HTTPS and kept with your account</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>You can ask us to delete your account and data</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Admin pages are limited to site admins</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Processors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="flex justify-between items-center py-2 border-b">
                <span>Payment Processing</span>
                <span className="font-medium">Stripe</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>AI Processing</span>
                <span className="font-medium">AI model providers</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Communications</span>
                <span className="font-medium">Email and SMS providers</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Infrastructure</span>
                <span className="font-medium">Base44</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Security Questions?</h3>
            <p className="text-sm text-slate-700 mb-4">
              For security inquiries, data processing agreements, or compliance documentation, contact our security team:
            </p>
            <a href="mailto:richy@voiceexecai.com" className="text-blue-600 hover:underline font-medium">
              richy@voiceexecai.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}