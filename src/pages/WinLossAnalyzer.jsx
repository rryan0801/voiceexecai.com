import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function WinLossAnalyzer() {
  const { data: analyses = [] } = useQuery({
    queryKey: ['win-loss'],
    queryFn: () => base44.entities.WinLossAnalysis.list('-closed_date', 100),
    initialData: []
  });

  const won = analyses.filter(a => a.outcome === 'won').length;
  const lost = analyses.filter(a => a.outcome === 'lost').length;
  const winRate = analyses.length > 0 ? Math.round((won / analyses.length) * 100) : 0;

  const reasons = {};
  analyses.forEach(a => {
    const cat = a.reason_category || 'other';
    reasons[cat] = (reasons[cat] || 0) + 1;
  });

  const pieData = Object.entries(reasons).map(([name, value]) => ({ name, value }));
  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  const byRep = {};
  analyses.forEach(a => {
    const rep = a.rep_email || 'Unknown';
    if (!byRep[rep]) byRep[rep] = { won: 0, lost: 0 };
    if (a.outcome === 'won') byRep[rep].won++;
    else byRep[rep].lost++;
  });

  const repData = Object.entries(byRep).map(([rep, data]) => ({
    rep: rep.split('@')[0],
    won: data.won,
    lost: data.lost,
    rate: Math.round((data.won / (data.won + data.lost)) * 100)
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Win/Loss Analysis</h1>
          </div>
          <p className="text-slate-500 ml-13">Pattern analysis by reason, industry, competitor, and rep</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-slate-900">{winRate}%</p>
              <p className="text-sm text-slate-500">Win Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-green-600">{won}</p>
              <p className="text-sm text-slate-500">Won Deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-red-600">{lost}</p>
              <p className="text-sm text-slate-500">Lost Deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-slate-900">{analyses.length}</p>
              <p className="text-sm text-slate-500">Total Analyzed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loss Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Losses by Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={{ position: 'insideBottomLeft', offset: -5 }} outerRadius={100} fill="#8884d8" dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By Rep */}
          <Card>
            <CardHeader>
              <CardTitle>Win Rate by Rep</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rep" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="won" fill="#10b981" name="Won" />
                  <Bar dataKey="lost" fill="#ef4444" name="Lost" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deals */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Closed Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyses.slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{a.prospect_name}</p>
                    <p className="text-xs text-slate-500">{a.win_loss_reason}</p>
                  </div>
                  <Badge className={a.outcome === 'won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {a.outcome.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}