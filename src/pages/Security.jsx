import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileCheck, Server, CheckCircle, Globe } from 'lucide-react';

export default function Security() {
  const securityFeatures = [
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: 'End-to-End Encryption',
      desc: 'All audio and data transmitted over TLS 1.3. Data encrypted at rest using AES-256.'
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'GDPR Compliant',
      desc: 'Full GDPR compliance with data processing agreements, user rights, and data portability.'
    },
    {
      icon: <FileCheck className="w-6 h-6 text-purple-600" />,
      title: 'CCPA Ready',
      desc: 'California Consumer Privacy Act compliant with opt-out mechanisms and disclosure requirements.'
    },
    {
      icon: <Server className="w-6 h-6 text-orange-600" />,
      title: 'SOC 2 Type II',
      desc: 'Infrastructure hosted on SOC 2 Type II certified providers with regular third-party audits.'
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: 'Data Residency',
      desc: 'Choose your data region (US, EU, UK). Data never leaves your selected geographic boundary.'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      title: '99.9% Uptime SLA',
      desc: 'Enterprise-grade infrastructure with automatic failover and disaster recovery.'
    }
  ];

  const complianceBadges = [
    { name: 'GDPR', color: 'bg-blue-100 text-blue-700' },
    { name: 'CCPA', color: 'bg-green-100 text-green-700' },
    { name: 'SOC 2 Type II', color: 'bg-purple-100 text-purple-700' },
    { name: 'ISO 27001', color: 'bg-orange-100 text-orange-700' },
    { name: 'HIPAA Ready', color: 'bg-blue-100 text-blue-800' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium mb-4">
            <Shield className="w-3 h-3" /> Enterprise-Grade Security
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Security & Compliance</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your data is protected by industry-leading security measures and compliance certifications.
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
                <span>Audio processed in real-time, never stored permanently</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Transcriptions encrypted and tied to your account only</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Regular security audits and penetration testing</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Role-based access control (RBAC) for team members</span>
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
                <span className="font-medium">Stripe (PCI DSS Level 1)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>AI Processing</span>
                <span className="font-medium">OpenAI, Anthropic (SOC 2)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Communications</span>
                <span className="font-medium">Twilio (SOC 2, ISO 27001)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Infrastructure</span>
                <span className="font-medium">Base44 (SOC 2 Type II)</span>
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
            <a href="mailto:security@voiceexecai.com" className="text-blue-600 hover:underline font-medium">
              security@voiceexecai.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}