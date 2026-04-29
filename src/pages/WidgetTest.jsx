import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WidgetTest() {
  const apiKey = 'test_widget_key'; // Replace with real test key from dashboard

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Widget v2 Test</h1>
          <p className="text-slate-600 mt-1">Real-time streaming voice commands</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Setup</h3>
                <p className="text-sm text-slate-600">
                  Create a test client in the Dashboard, copy the API key
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Record</h3>
                <p className="text-sm text-slate-600">
                  Click the 🎤 button, enter optional context, record your command
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Watch Streaming</h3>
                <p className="text-sm text-slate-600">
                  See transcription, reasoning, and result appear in real-time
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Monitor</h3>
                <p className="text-sm text-slate-600">
                  Go to /commands page to see all recorded commands with details
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Example Commands</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• "Send follow-up email to John"</li>
                  <li>• "Create task: review Q2 proposal"</li>
                  <li>• "Schedule meeting with marketing team"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-80 font-mono">
                {`<script src="https://yourdomain.com/voicerep-widget-v2.js" 
  data-api-key="${apiKey}">
</script>`}
              </pre>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<script src="https://yourdomain.com/voicerep-widget-v2.js" data-api-key="${apiKey}"></script>`
                  );
                }}
                className="w-full mt-4"
              >
                Copy Embed Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Widget Area */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Widget Preview (Live Below)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              The widget appears in the bottom-right corner. Open DevTools to see function calls.
            </p>
            <div style={{ height: '300px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              {/* Widget will appear here via script injection */}
            </div>
          </CardContent>
        </Card>

        {/* Inject Widget Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Load widget v2 (use real domain in production)
              const script = document.createElement('script');
              script.src = '/voicerep-widget-v2.js';
              script.setAttribute('data-api-key', '${apiKey}');
              script.setAttribute('data-api-url', window.location.origin);
              document.body.appendChild(script);
            `
          }}
        />
      </div>
    </div>
  );
}