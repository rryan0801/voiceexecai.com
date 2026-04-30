import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle2, AlertCircle, Zap, MessageSquare } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function CRMAndCommsHub() {
  const [voiceCommand, setVoiceCommand] = useState('');
  const [userCRM, setUserCRM] = useState('salesforce');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('demo');

  const handleCommandSubmit = async () => {
    if (!voiceCommand.trim()) return;

    setProcessing(true);
    setResult(null);

    try {
      const res = await base44.functions.invoke('detectIntentAndRoute', {
        voice_command: voiceCommand,
        user_crm_type: userCRM
      });

      setResult(res.data);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  const exampleCommands = [
    {
      crm: 'salesforce',
      cmd: 'Create an opportunity for Acme Corp valued at $50,000 with John Smith as the contact'
    },
    {
      crm: 'pipedrive',
      cmd: 'Create a deal called Enterprise Software License for TechCorp worth 25000'
    },
    {
      crm: 'hubspot',
      cmd: 'Log a call activity for the Global Solutions deal'
    },
    {
      crm: 'any',
      cmd: 'Send a text to 415-555-1234 saying Check in on the proposal we discussed'
    },
    {
      crm: 'any',
      cmd: 'Send a Slack message to sales-team about the new Acme deal'
    },
    {
      crm: 'any',
      cmd: 'Post a Teams message saying Q2 sales target is on track'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Phase 1 & 2: CRM + Communications</h1>
          </div>
          <p className="text-slate-500 ml-13">Universal intent detection routing to CRM & messaging channels</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="coverage">Coverage Map</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-6 mt-6">
            {/* Command Input */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Voice Command Detector
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Your CRM System</label>
                  <select
                    value={userCRM}
                    onChange={(e) => setUserCRM(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="salesforce">Salesforce</option>
                    <option value="pipedrive">Pipedrive</option>
                    <option value="hubspot">HubSpot</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Voice Command</label>
                  <textarea
                    value={voiceCommand}
                    onChange={(e) => setVoiceCommand(e.target.value)}
                    placeholder="Type what you'd say... e.g., 'Create a deal for Acme Corp worth $50k'"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCommandSubmit}
                  disabled={processing || !voiceCommand.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {processing ? 'Detecting Intent...' : 'Process Command'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {result.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Success
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" /> Error
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.intent && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Detected Intent</p>
                      <Badge className="bg-blue-100 text-blue-800">{result.intent}</Badge>
                      {result.confidence && (
                        <span className="text-xs text-slate-500 ml-2">
                          (Confidence: {Math.round(result.confidence * 100)}%)
                        </span>
                      )}
                    </div>
                  )}

                  {result.reasoning && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Reasoning</p>
                      <p className="text-sm text-slate-700">{result.reasoning}</p>
                    </div>
                  )}

                  {result.result && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Result</p>
                      <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.error && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Error Details</p>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Example Commands */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Try These Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {exampleCommands.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setUserCRM(example.crm === 'any' ? userCRM : example.crm);
                      setVoiceCommand(example.cmd);
                    }}
                    className="w-full p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <p className="text-sm font-medium text-slate-900">{example.cmd}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {example.crm === 'any' ? 'Works with any CRM' : example.crm}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coverage" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CRM Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Salesforce', features: ['Create Opportunity', 'Log Activity'] },
                    { name: 'Pipedrive', features: ['Create Deal', 'Update Status'] },
                    { name: 'HubSpot', features: ['Create Deal', 'Associate Company'] }
                  ].map((crm, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-sm text-slate-900">{crm.name}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {crm.features.map(f => (
                          <Badge key={f} className="bg-blue-100 text-blue-800 text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Communication Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'SMS', ready: true },
                    { name: 'Slack', ready: true },
                    { name: 'Microsoft Teams', ready: true },
                    { name: 'Email', ready: true },
                    { name: 'WhatsApp', ready: true }
                  ].map((channel, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-sm text-slate-900">{channel.name}</span>
                      {channel.ready && <Badge className="bg-green-100 text-green-800">Ready</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="architecture" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-auto font-mono leading-relaxed">
{`detectIntentAndRoute (Main Handler)
│
├─► Claude Intent Detection
│   ├─ Parse: company, contact, amount, action
│   ├─ Confidence scoring
│   └─ Extract parameters
│
├─ Route to CRM Router
│   ├─ createSalesforceOpportunity
│   ├─ createPipedriveDeal
│   ├─ createHubspotDeal
│   ├─ logSalesforceActivity
│   └─ updatePipedriveStatus
│
├─ Route to Comms Router
│   ├─ sendSMSMessage
│   ├─ sendSlackMessage
│   ├─ sendTeamsMessage
│   ├─ sendEmailViaOutlook
│   └─ sendWhatsAppMessage
│
└─ Return unified response
    ├─ Intent detected
    ├─ Confidence score
    ├─ Execution result
    └─ Error handling`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}