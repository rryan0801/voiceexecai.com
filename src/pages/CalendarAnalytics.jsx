import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import NavBar from '@/components/NavBar';

export default function CalendarAnalytics() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [daysRange, setDaysRange] = useState(90);

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => base44.entities.CalendarEvent.list('-started_at', 200),
    initialData: []
  });

  const handleSyncCalendar = async () => {
    setAnalyzing(true);
    try {
      await base44.functions.invoke('syncCalendarEvents', { client_id: 'default' });
      setTimeout(() => refetchEvents(), 1000);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke('analyzeCalendarPatterns', {
        client_id: 'default',
        days: daysRange
      });
      setAnalysis(res.data);
    } finally {
      setAnalyzing(false);
    }
  };

  // Meeting type distribution for chart
  const typeChartData = analysis
    ? Object.entries(analysis.meeting_types || {}).map(([type, count]) => ({
        name: type.replace(/_/g, ' '),
        count
      }))
    : [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const outcomeData = analysis ? [
    { name: 'Completed', value: analysis.outcomes?.completed || 0 },
    { name: 'No-Show', value: analysis.outcomes?.no_show || 0 },
    { name: 'Rescheduled', value: analysis.outcomes?.rescheduled || 0 }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Calendar Analytics</h1>
            </div>
            <p className="text-slate-500 ml-13">Meeting patterns, velocity, and sales impact</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSyncCalendar}
              disabled={analyzing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              Sync Calendar
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Analyze
            </Button>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex gap-2 mb-6">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setDaysRange(days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                daysRange === days
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        {analysis ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{analysis.total_meetings}</div>
                  <p className="text-xs text-slate-500 mt-1">Last {daysRange} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">No-Show Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${analysis.no_show_rate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {analysis.no_show_rate}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{analysis.outcomes?.no_show || 0} no-shows</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Deal Moving</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{analysis.deal_progressing_meetings}</div>
                  <p className="text-xs text-slate-500 mt-1">Stage advances</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Avg per Deal Move</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{analysis.meetings_per_deal_move}</div>
                  <p className="text-xs text-slate-500 mt-1">meetings needed</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Meeting Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {typeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={typeChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-400 text-center py-12">No data</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Meeting Outcomes</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  {outcomeData.some(d => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={outcomeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {outcomeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-400">No data</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-slate-700">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p>Sync your calendar and analyze to see patterns</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}