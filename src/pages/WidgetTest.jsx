import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';

export default function WidgetTest() {
  const [copied, setCopied] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-widget'],
    queryFn: () => base44.entities.Client.filter({ status: 'active' }),
    initialData: []
  });

  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0]);
    }
  }, [clients]);

  const apiKey = selectedClient?.api_key || 'YOUR_API_KEY';
  const apiUrl = window.location.origin;

  const embedCode = `<script src="${apiUrl}/voicerep-widget-v2.js" 
  data-api-key="${apiKey}"
  data-api-url="${apiUrl}">
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadWidget = () => {
    // Remove old widget if exists
    const old = document.getElementById('voicerep-widget-container');
    if (old) old.remove();

    const script = document.createElement('script');
    script.src = '/voicerep-widget-v2.js';
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-api-url', apiUrl);
    document.body.appendChild(script);
    setWidgetLoaded(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Widget Integration</h1>
          <p className="text-slate-500 mt-1">Test and embed the VoiceRep widget on any website</p>
        </div>

        {/* Client Selector */}
        {clients.length > 1 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {clients.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  selectedClient?.id === c.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                {c.company_name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Embed Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto font-mono leading-relaxed">
                {embedCode}
              </pre>
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
                <Button onClick={loadWidget} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2">
                  {widgetLoaded ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  {widgetLoaded ? 'Widget Active' : 'Test Widget'}
                </Button>
              </div>
              {widgetLoaded && (
                <p className="text-xs text-green-600 font-medium">✅ Widget loaded! Look for the 🎤 button in the bottom-right corner.</p>
              )}
            </CardContent>
          </Card>

          {/* How to Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { step: '1', title: 'Click "Test Widget"', desc: 'The widget will appear in the bottom-right corner.' },
                { step: '2', title: 'Click the 🎤 button', desc: 'Enter optional prospect/company context.' },
                { step: '3', title: 'Hold to Record', desc: 'Speak your command clearly. Release when done.' },
                { step: '4', title: 'Watch it execute', desc: 'See the result appear in real-time.' },
              ].map(item => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t">
                <p className="text-xs font-semibold text-slate-700 mb-2">Try saying:</p>
                <div className="space-y-1">
                  {[
                    '"Send a follow-up email to John at Acme"',
                    '"Schedule a demo meeting for tomorrow at 2pm"',
                    '"Create a task to review the Q2 proposal"',
                    '"Generate a proposal for Sarah at TechCorp"',
                  ].map(cmd => (
                    <p key={cmd} className="text-xs text-slate-500 italic">{cmd}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-white">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Smartphone className="w-10 h-10 text-white/80" />
                <div>
                  <h3 className="font-bold text-lg">Mobile Voice App</h3>
                  <p className="text-blue-100 text-sm">Full-screen voice interface optimized for sales reps on the go</p>
                </div>
              </div>
              <Link to="/mobile">
                <Button variant="secondary" className="gap-2 bg-white text-blue-700 hover:bg-blue-50">
                  Open Mobile View <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}