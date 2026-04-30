import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, TrendingUp, Award, Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function ConversationAnalytics() {
  const [selectedRep, setSelectedRep] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: reps = [] } = useQuery({
    queryKey: ['reps'],
    queryFn: () => base44.entities.Rep.list('-updated_date', 100),
    initialData: []
  });

  const { data: patterns = [] } = useQuery({
    queryKey: ['patterns', selectedRep],
    queryFn: () => {
      if (!selectedRep) return [];
      return base44.entities.RepPattern.filter({ rep_email: selectedRep }, '-created_date', 50);
    },
    initialData: [],
    enabled: !!selectedRep
  });

  const handleAnalyze = async (repEmail, clientId) => {
    setAnalyzing(true);
    try {
      await base44.functions.invoke('analyzeRepPatterns', {
        rep_email: repEmail,
        client_id: clientId
      });
      setTimeout(() => {
        // Refetch patterns
        setSelectedRep(repEmail);
      }, 1000);
    } finally {
      setAnalyzing(false);
    }
  };

  const closingPatterns = patterns.filter(p => p.pattern_type === 'closing_phrase');
  const tonePatterns = patterns.filter(p => p.pattern_type === 'tone');
  const keywordPatterns = patterns.filter(p => p.pattern_type === 'success_keyword');

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Conversation Analytics</h1>
          </div>
          <p className="text-slate-500 ml-13">Uncover winning patterns in your team's communication</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rep List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Team Reps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reps.length === 0 ? (
                  <p className="text-slate-400 text-sm">No reps found</p>
                ) : (
                  reps.map(rep => (
                    <div
                      key={rep.email}
                      onClick={() => setSelectedRep(rep.email)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRep === rep.email
                          ? 'border-cyan-300 bg-cyan-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold text-sm text-slate-900">{rep.full_name}</p>
                      <p className="text-xs text-slate-500">{rep.email}</p>
                      <div className="mt-2 text-xs text-slate-600">
                        <p>📧 {rep.emails_sent} emails sent</p>
                        <p>📅 {rep.meetings_booked} meetings booked</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyze(rep.email, rep.client_id);
                        }}
                        disabled={analyzing}
                        className="w-full mt-2"
                      >
                        {analyzing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Analyze
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patterns */}
          <div className="lg:col-span-2 space-y-4">
            {selectedRep ? (
              <>
                {/* Closing Patterns */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      🎯 Closing Phrases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {closingPatterns.length === 0 ? (
                      <p className="text-slate-400 text-sm">Run analysis to see patterns</p>
                    ) : (
                      <div className="space-y-2">
                        {closingPatterns.map((p, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium text-sm text-slate-900 italic">
                              "{p.pattern_value}"
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {p.success_rate}% win rate
                              </Badge>
                              <span className="text-xs text-slate-500">Used {p.frequency}x</span>
                            </div>
                            {p.recommendation && (
                              <p className="text-xs text-slate-600 mt-2">{p.recommendation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Success Keywords */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      💡 Winning Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {keywordPatterns.length === 0 ? (
                      <p className="text-slate-400 text-sm">Run analysis to see patterns</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {keywordPatterns.map((p, i) => (
                          <Badge
                            key={i}
                            className="bg-blue-100 text-blue-800 px-3 py-2"
                          >
                            {p.pattern_value} ({p.frequency}x)
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tone Profile */}
                <Card className="border-cyan-200 bg-cyan-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      🎤 Tone Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Formality Level</span>
                        <Badge>Semi-Professional</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Urgency</span>
                        <Badge>Moderate</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Personal Touch</span>
                        <Badge className="bg-green-100 text-green-800">High</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-400">
                  <Award className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  Select a rep and click Analyze to see their winning patterns
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}