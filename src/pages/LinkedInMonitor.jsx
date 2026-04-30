import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import NavBar from '@/components/NavBar';

const SIGNAL_ICONS = {
  job_change: '💼',
  company_growth: '📈',
  profile_view: '👁️',
  connection_request: '🤝',
  message: '💬',
  content_engagement: '👍',
  headline_change: '📝',
  endorsement: '⭐'
};

const SIGNAL_COLORS = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800'
};

export default function LinkedInMonitor() {
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [filterStrength, setFilterStrength] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: signals = [], refetch } = useQuery({
    queryKey: ['linkedin-signals'],
    queryFn: () => base44.entities.LinkedInSignal.list('-occurred_at', 300),
    initialData: [],
    refetchInterval: 60000
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Calculate metrics
  const criticalSignals = signals.filter(s => s.signal_strength === 'critical').length;
  const highSignals = signals.filter(s => s.signal_strength === 'high').length;
  const avgBuyingIntent = signals.length > 0
    ? Math.round(signals.reduce((a, s) => a + (s.buying_intent_score || 0), 0) / signals.length)
    : 0;

  // Filter signals
  const filteredSignals = filterStrength === 'all'
    ? signals
    : signals.filter(s => s.signal_strength === filterStrength);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl flex items-center justify-center text-lg">
                in
              </div>
              <h1 className="text-3xl font-bold text-slate-900">LinkedIn Monitoring</h1>
            </div>
            <p className="text-slate-500 ml-13">Buying signals and prospect activity tracking</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{signals.length}</p>
                  <p className="text-xs text-slate-500">Total Signals</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{criticalSignals}</p>
                  <p className="text-xs text-slate-500">Critical</p>
                </div>
                <Zap className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{highSignals}</p>
                  <p className="text-xs text-slate-500">High Intent</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{avgBuyingIntent}</p>
                  <p className="text-xs text-slate-500">Avg Intent Score</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'critical', 'high', 'medium', 'low'].map(strength => (
            <button
              key={strength}
              onClick={() => setFilterStrength(strength)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize ${
                filterStrength === strength
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
              }`}
            >
              {strength}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signal List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredSignals.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No signals detected</p>
                  ) : (
                    filteredSignals.map(signal => (
                      <div
                        key={signal.id}
                        onClick={() => setSelectedSignal(signal)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedSignal?.id === signal.id
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-lg mt-1 flex-shrink-0">
                              {SIGNAL_ICONS[signal.signal_type] || '📌'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-900">
                                {signal.prospect_name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{signal.company_name}</p>
                              <p className="text-xs text-slate-600 mt-1">
                                {signal.signal_detail}
                              </p>
                            </div>
                          </div>
                          <Badge className={`flex-shrink-0 ml-2 ${SIGNAL_COLORS[signal.signal_strength]}`}>
                            {signal.signal_strength}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs mt-2">
                          <span className="text-slate-500">
                            Intent: {signal.buying_intent_score}%
                          </span>
                          <span className="text-slate-400">
                            {formatDistanceToNow(new Date(signal.occurred_at), { addSuffix: true })}
                          </span>
                        </div>

                        {/* Intent score bar */}
                        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full transition-all"
                            style={{ width: `${signal.buying_intent_score}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          {selectedSignal ? (
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Signal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Prospect</p>
                  <p className="text-sm text-slate-900">{selectedSignal.prospect_name}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Company</p>
                  <p className="text-sm text-slate-900">{selectedSignal.company_name}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Signal Type</p>
                  <Badge className={SIGNAL_COLORS[selectedSignal.signal_strength]}>
                    {selectedSignal.signal_type.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="pt-3 border-t space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-600">Signal Strength</span>
                    <span className="font-bold text-sm capitalize">{selectedSignal.signal_strength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-600">Buying Intent</span>
                    <span className="font-bold text-sm">{selectedSignal.buying_intent_score}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Details</p>
                  <p className="text-sm text-slate-700">{selectedSignal.signal_detail}</p>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Detected</p>
                  <p className="text-sm text-slate-900">
                    {format(new Date(selectedSignal.occurred_at), 'MMM d, h:mm a')}
                  </p>
                </div>

                <div className="pt-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                    Take Action
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-10 pb-10 text-center text-slate-400 text-sm">
                <Zap className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                Select a signal to see details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}