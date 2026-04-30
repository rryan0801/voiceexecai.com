import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, AlertCircle, Trophy, MessageCircle, Mail, Target } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function ActionDashboard() {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState(null);

  const handleGetActions = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const res = await base44.functions.invoke('getActionableInsights', {
        client_id: 'default',
        rep_email: user.email
      });
      setActions(res.data);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  const typeIcons = {
    high_value_action: Trophy,
    at_risk: AlertCircle,
    engagement: MessageCircle,
    signal: Target
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">What Should I Do Now?</h1>
          </div>
          <p className="text-slate-500 ml-13">Prioritized actions based on your deal pipeline</p>
        </div>

        {!actions ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-6">Get your top actions for right now</p>
              <Button
                onClick={handleGetActions}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Generate Actions
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{actions.total_actions}</p>
                      <p className="text-xs text-slate-500">Total Actions</p>
                    </div>
                    <Zap className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{actions.critical_count}</p>
                      <p className="text-xs text-slate-500">Critical Priority</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 pb-4 flex items-center justify-center">
                  <p className="text-center text-lg font-semibold text-slate-700">{actions.summary}</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions List */}
            <div className="space-y-3">
              {actions.actions.map((action, i) => {
                const Icon = typeIcons[action.type] || Zap;
                return (
                  <Card key={i} className={`border-l-4 ${
                    action.urgency === 'critical' ? 'border-l-red-500 bg-red-50' :
                    action.urgency === 'high' ? 'border-l-orange-500 bg-orange-50' :
                    'border-l-yellow-500 bg-yellow-50'
                  }`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            action.urgency === 'critical' ? 'bg-red-200' :
                            action.urgency === 'high' ? 'bg-orange-200' :
                            'bg-yellow-200'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{action.prospect}</h3>
                              {action.deal_probability && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  {action.deal_probability}% win
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{action.action}</p>
                            {action.channel && (
                              <p className="text-xs text-slate-500 mt-1">via {action.channel}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={urgencyColors[action.urgency]}>
                          {action.urgency}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              onClick={handleGetActions}
              variant="outline"
              className="w-full mt-8 gap-2"
            >
              <Loader2 className="w-4 h-4" /> Refresh Actions
            </Button>
          </>
        )}
      </div>
    </div>
  );
}