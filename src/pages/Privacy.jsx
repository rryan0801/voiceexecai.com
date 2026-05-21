import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, CheckCircle } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-slate-600">Last updated: May 20, 2026</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
              <p className="leading-relaxed">
                VoiceExec AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our voice-to-action platform and related services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-slate-900">Personal Information</h3>
                  <p className="text-sm">We collect information you provide directly: name, email address, company name, phone number, and payment information.</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Usage Data</h3>
                  <p className="text-sm">We automatically collect information about how you use VoiceExec AI, including API requests, features used, and interaction patterns.</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Audio Data</h3>
                  <p className="text-sm">We process audio recordings to provide transcription and analysis services. Audio is processed securely and not stored unless explicitly configured.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide, maintain, and improve our services</li>
                <li>To process transactions and send related information</li>
                <li>To send technical notices and support messages</li>
                <li>To communicate with you about products, services, and events</li>
                <li>To monitor and analyze trends, usage, and activities</li>
                <li>To detect, investigate, and prevent fraudulent transactions</li>
                <li>To personalize your experience and deliver relevant content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-3">
                We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> We share data with trusted third-party providers (Stripe for payments, Twilio for communications, OpenAI/Claude for AI processing) who assist us in operating our business.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures including encryption in transit and at rest, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Cookies and Tracking</h2>
              <p className="leading-relaxed mb-3">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our platform</li>
                <li>Personalize your experience</li>
                <li>Analyze traffic and usage patterns</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You can control cookie settings through your browser. Disabling cookies may limit your ability to use certain features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Your Rights (GDPR/CCPA)</h2>
              <p className="leading-relaxed mb-3">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data ("right to be forgotten")</li>
                <li>Data portability</li>
                <li>Opt-out of marketing communications</li>
                <li>Restriction of processing</li>
              </ul>
              <p className="leading-relaxed mt-3">
                To exercise these rights, contact us at <a href="mailto:support@voiceexec.ai" className="text-blue-600 hover:underline">support@voiceexec.ai</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. You can request deletion of your data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Children's Privacy</h2>
              <p className="leading-relaxed">
                VoiceExec AI is not intended for children under 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Contact Us</h2>
              <p className="leading-relaxed">
                For questions about this Privacy Policy or our data practices, contact us at:<br />
                <strong>Email:</strong> <a href="mailto:support@voiceexecai.com" className="text-blue-600 hover:underline">support@voiceexecai.com</a><br />
                <strong>Website:</strong> <a href="https://voiceexecai.com" className="text-blue-600 hover:underline">voiceexecai.com</a>
              </p>
            </section>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>This policy complies with GDPR, CCPA, and Stripe's requirements</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}