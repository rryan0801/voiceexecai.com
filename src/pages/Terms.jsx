import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Shield, CheckCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          </div>
          <p className="text-slate-600">Last updated: May 20, 2026</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using VoiceExec AI ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
              <p className="leading-relaxed mb-3">
                VoiceExec AI provides a voice-to-action platform that enables users to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transcribe and analyze audio conversations</li>
                <li>Automate sales workflows and follow-ups</li>
                <li>Generate AI-powered insights and coaching</li>
                <li>Integrate with CRM systems and communication platforms</li>
                <li>Track and analyze sales performance metrics</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. User Accounts</h2>
              <p className="leading-relaxed mb-3">To use VoiceExec AI, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We reserve the right to terminate accounts at our discretion, especially for violations of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Acceptable Use</h2>
              <p className="leading-relaxed mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Upload audio containing hate speech, harassment, or illegal content</li>
                <li>Attempt to gain unauthorized access to our systems or data</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Resell, rent, or sublicense the Service without permission</li>
                <li>Use the Service to build a competing product</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Payment Terms</h2>
              <p className="leading-relaxed mb-3">
                <strong>Billing:</strong> VoiceExec AI operates on a subscription basis. You agree to pay all fees at the rates then in effect.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fees are billed in advance on a monthly or annual basis</li>
                <li>All payments are processed through Stripe and are non-refundable except as required by law</li>
                <li>Failed payments may result in suspension of service</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>You can cancel your subscription at any time; access continues through the end of the billing period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Refund and Cancellation Policy</h2>
              <p className="leading-relaxed mb-3">
                <strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings or by contacting support.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>No refunds are provided for partial billing periods</li>
                <li>Data retention: We retain your data for 30 days after cancellation, after which it is permanently deleted</li>
                <li>Export your data before cancellation if you wish to keep it</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Intellectual Property Rights</h2>
              <p className="leading-relaxed mb-3">
                <strong>Our Property:</strong> VoiceExec AI, including its features, code, designs, and content, is owned by VoiceExec AI and protected by intellectual property laws.
              </p>
              <p className="leading-relaxed mb-3">
                <strong>Your Content:</strong> You retain ownership of your audio recordings, transcripts, and data. By using the Service, you grant us a license to process and store this content solely for providing the Service.
              </p>
              <p className="leading-relaxed">
                <strong>Feedback:</strong> Any suggestions or feedback you provide may be used by us without compensation or attribution.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Disclaimer of Warranties</h2>
              <p className="leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Limitation of Liability</h2>
              <p className="leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, VOICEEXEC AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUES, DATA, OR USE, INCURRED BY YOU OR ANY THIRD PARTY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM YOUR ACCESS TO OR USE OF THE SERVICE.
              </p>
              <p className="leading-relaxed mt-3">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless VoiceExec AI from any claims, liabilities, damages, losses, or expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Privacy Policy</h2>
              <p className="leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy, available at <a href="/privacy" className="text-blue-600 hover:underline">/privacy</a>. By using VoiceExec AI, you consent to the collection, use, and disclosure of your information as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on this page and updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">13. Termination</h2>
              <p className="leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">14. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of [Your State/Country], without regard to its conflict of law provisions. Any disputes shall be resolved in the courts located in [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">15. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms, please contact us at:<br />
                <strong>Email:</strong> <a href="mailto:support@voiceexec.ai" className="text-blue-600 hover:underline">support@voiceexec.ai</a><br />
                <strong>Address:</strong> VoiceExec AI, [Your Business Address]
              </p>
            </section>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>These terms comply with Stripe's requirements and standard SaaS practices</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}