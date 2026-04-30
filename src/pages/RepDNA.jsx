import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function RepDNA() {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedRep, setSelectedRep] = useState(null);

  const { data: reps = [] } = useQuery({
    queryKey: ['reps-dna'],
    queryFn: () => base44.entities.Rep.list('-updated_date', 50),
    initialData: []
  });

  const { data: dnaBases = [] } = useQuery({
    queryKey: ['dna-bases', selectedRep],
    queryFn: () => selectedRep ? base44.entities.RepConversationDNA.filter({ rep_email: selectedRep }) : [],
    initialData: [],
    enabled: !!selectedRep
  });

  const handleBuildDNA = async (repEmail, clientId) => {
    setAnalyzing(true);
    try {
      await base44.functions.invoke('buildRepConversationDNA', {
        rep_email: repEmail,
        client_id: clientId
      });
      setTimeout(() => setSelectedRep(repEmail), 1000);
    } finally {
      setAnalyzing(false);
    }
  };

  const dna = dnaBases[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Rep Conversation DNA</h1>
          </div>
          <p className="text-slate-500 ml-13">Winning phrases, tone signature, and closing triggers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rep List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sales Reps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reps.map(rep => (
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuildDNA(rep.email, rep.client_id);
                      }}
                      disabled={analyzing}
                      className="w-full mt-2"
                    >
                      {analyzing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      Build DNA
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* DNA Details */}
          {dna ? (
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    DNA Strength
                    <Badge className={dna.dna_strength > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {dna.dna_strength}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Analyzed {dna.deal_count_analyzed} closed deals</p>
                </CardContent>
              </Card>

              {/* Winning Phrases */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">💬 Winning Phrases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dna.winning_phrases?.map((p, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-sm text-slate-900 italic">"{p.phrase}"</p>
                      <div className="flex justify-between mt-1 text-xs text-slate-600">
                        <span>Used {p.usage_count}x</span>
                        <span className="text-green-600 font-semibold">{p.close_rate_when_used}% close rate</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tone Signature */}
              {dna.tone_signature && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🎤 Tone Signature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-slate-600">Style</span>
                        <Badge className="bg-blue-100 text-blue-800">{dna.tone_signature.formality}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-slate-600">Confidence</span>
                        <span className="font-bold">{dna.tone_signature.confidence_level}/100</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-slate-600">Listening Ratio</span>
                        <span className="font-bold">{dna.tone_signature.listening_ratio}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Question Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">❓ Question Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dna.question_patterns?.map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-700">{q.pattern}</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {q.success_rate}% success
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="lg:col-span-2">
              <CardContent className="pt-12 pb-12 text-center text-slate-400">
                Select a rep and build their DNA
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}