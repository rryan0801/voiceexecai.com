import React, { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DownloadGuide() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      const response = await base44.functions.invoke('generateImplementationPDF', {});
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'VoiceExecAI_Implementation_Guide.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-white p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-xs font-medium mb-4 shadow-sm">
            <FileText className="w-3 h-3" />
            <span className="font-semibold">Professional PDF Document</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Implementation Guide
          </h1>
          <p className="text-xl text-slate-500 mb-2">
            VoiceExecAI Production Deployment Instructions
          </p>
          <p className="text-sm text-slate-400">
            For Manus Development Team
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-2 border-blue-200 shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Download Your Guide
            </CardTitle>
            <CardDescription className="text-blue-100">
              Complete step-by-step instructions (3-4 hours to complete)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* What's Inside */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">📋 What's Inside:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    '🎨 Part 1: Brand Assets (45 min)',
                    '🔍 Part 2: SEO & Analytics (30 min)',
                    '💳 Part 3: Stripe Payments (30 min)',
                    '📧 Part 4: Email Automation (30 min)',
                    '🧪 Part 5: Testing (60 min)',
                    '✅ Part 6: Final Checklist (30 min)',
                    '🔧 Troubleshooting Guide',
                    '📞 Support Resources'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">✨ Features:</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Beautiful professional design with VoiceExecAI branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Step-by-step instructions anyone can follow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Checkboxes for tracking progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Troubleshooting section for common problems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Completion checklist and report template</span>
                  </li>
                </ul>
              </div>

              {/* Download Button */}
              <div className="pt-4 border-t border-slate-200">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating PDF...
                    </>
                  ) : downloaded ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Download Started!
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Implementation Guide (PDF)
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  ~8-10 pages | Professional quality | Ready to share
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">⏱️ Time Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">3-4 hours</p>
              <p className="text-xs text-slate-500 mt-1">Following all steps</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📊 Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">Beginner</p>
              <p className="text-xs text-slate-500 mt-1">Step-by-step instructions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">✅ Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-violet-600">Ready</p>
              <p className="text-xs text-slate-500 mt-1">Production-tested</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-400">
          <p>Last Updated: June 29, 2026</p>
          <p className="mt-1">VoiceExecAI - Production-Ready Deployment Guide</p>
        </div>
      </div>
    </div>
  );
}