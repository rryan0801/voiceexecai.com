import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Zap, Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function TeamLeaderboard() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: leaderboard = [], refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.TeamLeaderboard.list('-win_rate', 50),
    initialData: [],
    refetchInterval: 60000
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await base44.functions.invoke('calculateTeamLeaderboard', { client_id: 'default' });
      setTimeout(() => refetch(), 1000);
    } finally {
      setRefreshing(false);
    }
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Team Leaderboard</h1>
            </div>
            <p className="text-slate-500 ml-13">Real-time rankings by performance metrics</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-yellow-600 hover:bg-yellow-700 gap-2"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {leaderboard.map((rep, i) => (
            <Card key={rep.id} className={i < 3 ? 'border-amber-200 bg-amber-50' : ''}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{medals[i] || `#${i + 1}`}</span>
                    <div>
                      <p className="font-bold text-lg text-slate-900">{rep.rep_name}</p>
                      <p className="text-xs text-slate-500">{rep.rep_email}</p>
                    </div>
                  </div>
                  <Badge className={rep.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                    {rep.trend === 'up' ? '📈 Up' : rep.trend === 'down' ? '📉 Down' : '→ Stable'}
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-slate-500">Win Rate</p>
                    <p className="text-lg font-bold text-slate-900">{rep.win_rate}%</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-slate-500">Deals Won</p>
                    <p className="text-lg font-bold text-green-600">{rep.deals_won}</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-slate-500">Pipeline</p>
                    <p className="text-lg font-bold text-slate-900">${(rep.total_pipeline_value / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-slate-500">Expected</p>
                    <p className="text-lg font-bold text-blue-600">${(rep.weighted_expected / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-slate-500">DNA Str.</p>
                    <p className="text-lg font-bold text-purple-600">{rep.dna_strength}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}