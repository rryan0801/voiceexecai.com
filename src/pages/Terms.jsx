import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

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
          <p className="text-slate-600">Last updated: November 7, 2026</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                VoiceExecAI (the "Service") is provided by Richard Ryan LLC, 555 5th Avenue #1910, Des Moines, Iowa 50309 ("we", "us"). By accessing or using the Service, you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
              <p className="leading-relaxed mb-3">
                VoiceExecAI is a voice assistant. When you give it a spoken or typed command, it can:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Draft an email and send it from your connected Outlook account</li>
                <li>Book a meeting on your connected Outlook calendar</li>
                <li>Create a follow-up task</li>
                <li>Draft a proposal document</li>
              </ul>
              <p className="leading-relaxed mt-3">
                The Service does not answer or make phone calls. AI output can be wrong; you are responsible for checking what is sent in your name.
              </p>
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
                <li>Fees are billed monthly in advance through Stripe</li>
                <li>There is no free plan and no free trial</li>
                <li>Special pricing for new members: 50% off your first 3 months. We may end or change this offer at any time.</li>
                <li>Failed payments may result in suspension of service</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>You can cancel by emailing richy@voiceexecai.com before your next billing date; access continues through the end of the paid period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Refund and Cancellation Policy</h2>
              <p className="leading-relaxed mb-3">
                <strong>Cancellation:</strong> Email richy@voiceexecai.com before your next billing date. Cancellations take effect at the end of the current paid period.
              </p>
              <p className="leading-relaxed mb-3">
                <strong>Refunds:</strong> Refunds are handled case by case — email us.
              </p>
              <p className="leading-relaxed">
                <strong>Your data:</strong> You can ask us to export or delete your data at any time.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>Tips:</strong> An optional "Buy us a coffee" tip is a one-time payment. It is not a donation and does not include a plan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Intellectual Property Rights</h2>
              <p className="leading-relaxed mb-3">
                <strong>Our Property:</strong> VoiceExec AI, including its features, code, designs, and content, is owned by Richard Ryan LLC and protected by intellectual property laws.
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
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RICHARD RYAN LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUES, DATA, OR USE, INCURRED BY YOU OR ANY THIRD PARTY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM YOUR ACCESS TO OR USE OF THE SERVICE.
              </p>
              <p className="leading-relaxed mt-3">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless Richard Ryan LLC from any claims, liabilities, damages, losses, or expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
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
                These Terms are governed by the laws of the State of Iowa, without regard to its conflict of law rules. Any dispute will be handled in the state or federal courts located in Polk County, Iowa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">15. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms, please contact us at:<br />
                <strong>Business:</strong> Richard Ryan LLC, 555 5th Avenue #1910, Des Moines, Iowa 50309<br />
                <strong>Email:</strong> <a href="mailto:richy@voiceexecai.com" className="text-blue-600 hover:underline">richy@voiceexecai.com</a><br />
                <strong>Website:</strong> <a href="https://voiceexecai.com" className="text-blue-600 hover:underline">voiceexecai.com</a>
              </p>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}