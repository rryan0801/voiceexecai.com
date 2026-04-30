import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Zap, TrendingUp, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function CallAnalysisDashboard() {
  const [transcript, setTranscript] = useState('');
  const [prospectName, setProspectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [analyzing, setAnalyzing] = useState(null);
  const [callAnalysis, setCallAnalysis] = useState(null);
  const [dealFields, setDealFields] = useState(null);
  const [coaching, setCoaching] = useState(null);

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;

    setAnalyzing('all');
    setCallAnalysis(null);
    setDealFields(null);
    setCoaching(null);

    try {
      // Parallel analysis
      const [analysisRes, fieldsRes, coachingRes] = await Promise.all([
        base44.functions.invoke('analyzeCallTranscript', {
          transcript,
          prospect_name: prospectName,
          company_name: companyName
        }),
        base44.functions.invoke('extractDealFieldsFromCall', {
          transcript,
          current_deal_data: {}
        }),
        base44.functions.invoke('generateAICoachingTip', {
          transcript,
          rep_name: 'Sales Rep',
          call_outcome: 'completed'
        })
      ]);

      setCallAnalysis(analysisRes.data);
      setDealFields(fieldsRes.data);
      setCoaching(coachingRes.data);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(null);
    }
  };

  const exampleTranscript = `Rep: Hi Sarah, thanks for taking my call. I wanted to discuss how we could help TechCorp optimize your infrastructure costs.
Prospect: Sure, we're always looking to reduce spend.
Rep: Great. We've helped similar companies save about 30% on cloud infrastructure. What are your main pain points right now?
Prospect: Well, our current provider is expensive and we're not getting much support.
Rep: That's common. We provide 24/7 support and our customers typically see ROI in 6 months.
Prospect: How much would it cost?
Rep: For your size, probably around $50,000 per year, but with the savings you'd see, it pays for itself.
Prospect: That sounds interesting. What's the next step?
Rep: I'd like to set up a technical assessment call. How does next Tuesday at 2 PM work?
Prospect: Perfect, I'll get my team together.
Rep: Excellent. I'll send the meeting link and an agenda. Looking forward to it.`;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Phase 3: Call Intelligence</h1>
          </div>
          <p className="text-slate-500 ml-13">Transcription analysis, sentiment tracking, and AI coaching</p>
        </div>

        <Tabs defaultValue="input" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="coaching">Coaching</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Paste Call Transcript</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Prospect Name</label>
                    <input
                      type="text"
                      value={prospectName}
                      onChange={(e) => setProspectName(e.target.value)}
                      placeholder="e.g., Sarah"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Company</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., TechCorp"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Transcript</label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste the call transcript here..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm h-64"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setProspectName('Sarah');
                      setCompanyName('TechCorp');
                      setTranscript(exampleTranscript);
                    }}
                    className="mt-2"
                  >
                    Load Example
                  </Button>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !transcript.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {analyzing ? 'Analyzing...' : 'Analyze Call'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6 mt-6">
            {callAnalysis && callAnalysis.analysis ? (
              <>
                {/* Sentiment & Engagement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={`text-lg px-4 py-2 ${
                        callAnalysis.analysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        callAnalysis.analysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {callAnalysis.analysis.sentiment}
                      </Badge>
                      <p className="text-sm text-slate-600 mt-3">
                        Engagement: <span className="font-bold">{callAnalysis.analysis.engagement_level}/10</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Closing Readiness: <span className="font-bold">{callAnalysis.analysis.closing_readiness}/10</span>
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Deal Signals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {callAnalysis.analysis.deal_signals?.map((signal, i) => (
                          <Badge key={i} className="bg-green-100 text-green-800">
                            {signal}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Insights */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Call Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{callAnalysis.analysis.summary}</p>
                  </CardContent>
                </Card>

                {/* Topics & Objections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Key Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {callAnalysis.analysis.key_topics?.map((topic, i) => (
                          <div key={i} className="text-sm text-slate-700">✓ {topic}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Objections Raised</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {callAnalysis.analysis.objections_raised?.map((objection, i) => (
                          <div key={i} className="text-sm text-slate-700">
                            <AlertCircle className="w-3 h-3 inline mr-1" /> {objection}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Next Steps */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {callAnalysis.analysis.recommended_actions?.map((action, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : analyzing ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                  <p className="text-slate-600">Analyzing call...</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-500">
                  Paste a transcript and click "Analyze Call" to see sentiment, signals, and insights
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="coaching" className="space-y-6 mt-6">
            {coaching && coaching.coaching ? (
              <>
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Overall Rep Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-700 mb-2">
                      {coaching.coaching.overall_score}/10
                    </div>
                    <p className="text-sm text-blue-600">{coaching.coaching.best_moment}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {coaching.coaching.strengths?.map((strength, i) => (
                          <div key={i} className="text-sm text-green-700 flex items-start gap-2">
                            <span className="text-lg">✓</span> {strength}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Areas to Improve</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {coaching.coaching.areas_for_improvement?.map((area, i) => (
                          <div key={i} className="text-sm text-amber-700 flex items-start gap-2">
                            <span className="text-lg">!</span> {area}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Coaching Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {coaching.coaching.specific_coaching_tips?.map((tip, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-900">{tip.moment}</p>
                        <p className="text-sm text-red-600 mt-1">Issue: {tip.issue}</p>
                        <p className="text-sm text-green-600 mt-1">Try: {tip.suggested_approach}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Next Call Focus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{coaching.coaching.next_call_focus}</p>
                  </CardContent>
                </Card>
              </>
            ) : analyzing ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                  <p className="text-slate-600">Generating coaching tips...</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-500">
                  AI-generated coaching tips will appear here after analysis
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}