import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import NavBar from '@/components/NavBar';

export default function CoachingCenter() {
  const [copiedId, setCopiedId] = useState(null);

  const { data: feedback = [] } = useQuery({
    queryKey: ['coaching-feedback'],
    queryFn: () => base44.entities.CoachingFeedback.list('-delivered_at', 100),
    initialData: [],
    refetchInterval: 5000
  });

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerIcons = {
    sentiment_shift: '📉',
    objection_detected: '🛑',
    positive_signal: '🎉',
    silence: '💬',
    closing_opportunity: '🏁'
  };

  const urgencyColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800'
  };

  const activeFeedback = feedback.filter(f => !f.acted_upon);
  const actedUpon = feedback.filter(f => f.acted_upon);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Real-Time Coaching</h1>
          </div>
          <p className="text-slate-500 ml-13">Live guidance during your calls</p>
        </div>

        {/* Active Coaching */}
        {activeFeedback.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Active Coaching ({activeFeedback.length})
              </h2>

              <div className="space-y-3">
                {activeFeedback.map(f => (
                  <Card key={f.id} className={`border-2 ${
                    f.urgency === 'high' ? 'border-red-200 bg-red-50' :
                    f.urgency === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-orange-200'
                  }`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{triggerIcons[f.trigger_type]}</span>
                          <h3 className="font-bold text-slate-900">{f.feedback_title}</h3>
                        </div>
                        <Badge className={urgencyColors[f.urgency]}>
                          {f.urgency}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-700 mb-4">{f.feedback_content}</p>

                      <div className="bg-white rounded-lg p-3 mb-3 border-l-4 border-blue-500">
                        <p className="text-xs text-slate-500 mb-1">Say this:</p>
                        <p className="text-sm font-medium text-slate-900 italic">
                          "{f.suggested_response}"
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(f.suggested_response, f.id)}
                        className="gap-2"
                      >
                        {copiedId === f.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Response
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Acted Upon */}
        {actedUpon.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Coaching History</h2>
            <div className="space-y-2 opacity-60">
              {actedUpon.slice(0, 5).map(f => (
                <div key={f.id} className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{triggerIcons[f.trigger_type]}</span>
                      <p className="text-sm text-slate-700">{f.feedback_title}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(f.delivered_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeFeedback.length === 0 && actedUpon.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center text-slate-400">
              <Lightbulb className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p>No coaching tips right now. Keep up the great work!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}