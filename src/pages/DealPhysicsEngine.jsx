import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Activity, Zap } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function DealPhysicsEngine() {
  const [analyzing, setAnalyzing] = useState(false);

  const { data: physics = [], refetch } = useQuery({
    queryKey: ['deal-physics'],
    queryFn: () => base44.entities.DealPhysics.list('-momentum', 200),
    initialData: []
  });

  const handleCalculate = async () => {
    setAnalyzing(true);
    try {
      const deals = await base44.entities.DealScore.list('-win_probability', 50);
      for (const deal of deals.slice(0, 10)) {
        await base44.functions.invoke('calculateDealPhysics', {
          deal_id: deal.id,
          prospect_id: deal.prospect_id,
          client_id: deal.client_id
        });
      }
      setTimeout(() => refetch(), 1000);
    } finally {
      setAnalyzing(false);
    }
  };

  const stageColors = {
    hyperdrive: 'bg-green-100 text-green-800',
    accelerating: 'bg-blue-100 text-blue-800',
    moderate: 'bg-slate-100 text-slate-800',
    slow: 'bg-yellow-100 text-yellow-800',
    stalled: 'bg-red-100 text-red-800'
  };

  const stageEmoji = {
    hyperdrive: '🚀',
    accelerating: '📈',
    moderate: '→',
    slow: '🐢',
    stalled: '⛔'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Deal Physics Engine</h1>
            </div>
            <p className="text-slate-500 ml-13">Velocity, momentum, and predicted close dates</p>
          </div>
          <Button
            onClick={handleCalculate}
            disabled={analyzing}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Calculate Physics
          </Button>
        </div>

        <div className="space-y-4">
          {physics.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-slate-400">
                <Activity className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>Run calculation to analyze deal momentum</p>
              </CardContent>
            </Card>
          ) : (
            physics.map(p => (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">{p.prospect_name}</h3>
                      <p className="text-sm text-slate-500">Close predicted: {p.predicted_close_date}</p>
                    </div>
                    <Badge className={stageColors[p.acceleration_stage]}>
                      {stageEmoji[p.acceleration_stage]} {p.acceleration_stage}
                    </Badge>
                  </div>

                  {/* Physics metrics */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="text-xs text-slate-500">Velocity</p>
                      <p className="text-lg font-bold text-slate-900">{p.velocity.toFixed(2)}</p>
                      <p className="text-xs text-slate-400">interactions/day</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="text-xs text-slate-500">Momentum</p>
                      <p className={`text-lg font-bold ${p.momentum > 0 ? 'text-green-600' : p.momentum < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {p.momentum > 0 ? '+' : ''}{p.momentum.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">acceleration</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="text-xs text-slate-500">Confidence</p>
                      <p className="text-lg font-bold text-slate-900">{p.close_confidence}%</p>
                      <p className="text-xs text-slate-400">in prediction</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="text-xs text-slate-500">Friction Points</p>
                      <p className="text-lg font-bold text-slate-900">{p.friction_points?.length || 0}</p>
                      <p className="text-xs text-slate-400">factors</p>
                    </div>
                  </div>

                  {/* Friction points */}
                  {p.friction_points && p.friction_points.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-xs font-semibold text-red-800 mb-2">⚠️ Friction Points</p>
                      <div className="space-y-1">
                        {p.friction_points.map((f, i) => (
                          <div key={i} className="text-xs text-red-700 flex items-center justify-between">
                            <span>{f.factor}</span>
                            <span className="font-bold">{f.impact}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}