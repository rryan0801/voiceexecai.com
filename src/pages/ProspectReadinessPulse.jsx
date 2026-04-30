import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Heart } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function ProspectReadinessPulse() {
  const [analyzing, setAnalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(new Set());

  const { data: pulses = [], refetch } = useQuery({
    queryKey: ['readiness-pulses'],
    queryFn: () => base44.entities.ProspectReadinessPulse.list('-readiness_score', 100),
    initialData: [],
    refetchInterval: 30000
  });

  const handleCalculate = async (prospectId) => {
    setRefreshing(new Set([...refreshing, prospectId]));
    try {
      await base44.functions.invoke('calculateProspectReadiness', {
        prospect_id: prospectId,
        client_id: 'default'
      });
      setTimeout(() => refetch(), 1000);
    } finally {
      setRefreshing(prev => {
        const next = new Set(prev);
        next.delete(prospectId);
        return next;
      });
    }
  };

  const pulseEmoji = { critical: '❤️‍🔥', peak: '❤️', rising: '📈', flatline: '➖', declining: '📉' };
  const pulseColor = {
    critical: 'bg-red-100 border-red-300',
    peak: 'bg-green-100 border-green-300',
    rising: 'bg-blue-100 border-blue-300',
    flatline: 'bg-slate-100 border-slate-300',
    declining: 'bg-yellow-100 border-yellow-300'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Prospect Readiness Pulse</h1>
          </div>
          <p className="text-slate-500 ml-13">Real-time "are they ready to buy?" signal</p>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-slate-900">{pulses.length}</p>
              <p className="text-xs text-slate-500">Total Tracked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-red-600">❤️‍🔥 {pulses.filter(p => p.pulse_status === 'critical').length}</p>
              <p className="text-xs text-slate-500">Ready to Close</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-green-600">❤️ {pulses.filter(p => p.pulse_status === 'peak').length}</p>
              <p className="text-xs text-slate-500">At Peak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-yellow-600">📉 {pulses.filter(p => p.pulse_status === 'declining').length}</p>
              <p className="text-xs text-slate-500">Declining</p>
            </CardContent>
          </Card>
        </div>

        {/* Pulse List */}
        <div className="space-y-3">
          {pulses.map(pulse => (
            <Card key={pulse.id} className={`border-2 ${pulseColor[pulse.pulse_status]}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{pulseEmoji[pulse.pulse_status]}</span>
                      <h3 className="font-bold text-slate-900">{pulse.prospect_name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900">{pulse.readiness_score}%</div>
                    <Badge className={`text-xs ${
                      pulse.pulse_status === 'critical' ? 'bg-red-200 text-red-800' :
                      pulse.pulse_status === 'peak' ? 'bg-green-200 text-green-800' :
                      'bg-slate-200 text-slate-800'
                    }`}>
                      {pulse.pulse_status}
                    </Badge>
                  </div>
                </div>

                {/* Readiness bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pulse.readiness_score > 80 ? 'bg-red-500' :
                      pulse.readiness_score > 60 ? 'bg-green-500' :
                      pulse.readiness_score > 40 ? 'bg-blue-500' :
                      'bg-slate-400'
                    }`}
                    style={{ width: `${pulse.readiness_score}%` }}
                  />
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">
                    Action: {pulse.recommended_action}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCalculate(pulse.prospect_id)}
                    disabled={refreshing.has(pulse.prospect_id)}
                  >
                    {refreshing.has(pulse.prospect_id) ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Recalc'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}