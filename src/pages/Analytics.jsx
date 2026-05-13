import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, Zap, CheckCircle2, AlertCircle, Clock, Users, BarChart2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import NavBar from '@/components/NavBar';
import EmptyState from '@/components/EmptyState';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const INTENT_LABELS = {
  send_email: 'Send Email',
  schedule_meeting: 'Schedule Meeting',
  create_task: 'Create Task',
  log_crm: 'Log CRM',
  generate_document: 'Generate Doc',
  other: 'Other'
};

export default function Analytics() {
  const [range, setRange] = useState('30');

  const { data: commands = [] } = useQuery({
    queryKey: ['analytics-commands'],
    queryFn: () => base44.entities.Command.list('-created_date', 500),
    initialData: []
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['analytics-clients'],
    queryFn: () => base44.entities.Client.list(),
    initialData: []
  });

  // Filter by range
  const cutoff = subDays(new Date(), parseInt(range));
  const filtered = commands.filter(c => new Date(c.created_date) >= cutoff);

  // Daily volume
  const dailyMap = {};
  filtered.forEach(c => {
    const day = format(new Date(c.created_date), 'MMM dd');
    if (!dailyMap[day]) dailyMap[day] = { day, total: 0, completed: 0, failed: 0 };
    dailyMap[day].total++;
    if (c.status === 'completed') dailyMap[day].completed++;
    if (c.status === 'failed') dailyMap[day].failed++;
  });
  const dailyData = Object.values(dailyMap).slice(-parseInt(range));

  // Intent distribution
  const intentMap = {};
  filtered.forEach(c => {
    const intent = c.detected_intent || 'other';
    intentMap[intent] = (intentMap[intent] || 0) + 1;
  });
  const intentData = Object.entries(intentMap).map(([name, value]) => ({
    name: INTENT_LABELS[name] || name,
    value
  }));

  // Success rate
  const completed = filtered.filter(c => c.status === 'completed').length;
  const failed = filtered.filter(c => c.status === 'failed').length;
  const successRate = filtered.length > 0 ? Math.round((completed / filtered.length) * 100) : 0;

  // Avg processing time
  const withTime = filtered.filter(c => c.processing_time_ms > 0);
  const avgTime = withTime.length > 0
    ? Math.round(withTime.reduce((s, c) => s + c.processing_time_ms, 0) / withTime.length)
    : 0;

  // Per-client usage
  const clientUsage = clients.map(cl => {
    const cmds = filtered.filter(c => c.client_id === cl.id);
    return {
      name: cl.company_name,
      commands: cmds.length,
      success: cmds.filter(c => c.status === 'completed').length
    };
  }).filter(c => c.commands > 0).sort((a, b) => b.commands - a.commands);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-500 mt-1">Command performance and usage insights</p>
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Zap className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{filtered.length}</p>
                  <p className="text-xs text-slate-500">Total Commands</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{successRate}%</p>
                  <p className="text-xs text-slate-500">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><Clock className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{avgTime > 0 ? `${(avgTime/1000).toFixed(1)}s` : '—'}</p>
                  <p className="text-xs text-slate-500">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg"><AlertCircle className="w-5 h-5 text-orange-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{failed}</p>
                  <p className="text-xs text-slate-500">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {commands.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                icon={BarChart2}
                iconColor="text-blue-400"
                iconBg="bg-blue-50"
                title="No analytics data yet"
                description="Once voice commands start flowing in, you'll see detailed performance charts and insights here."
                actionLabel="Go to Dashboard"
                actionHref="/dashboard"
                secondaryLabel="Test Widget"
                secondaryHref="/widget-test"
              />
            </CardContent>
          </Card>
        )}

        {/* Charts — only when data exists */}
        {commands.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Command Volume Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#d1fae5" name="Completed" />
                      <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#fee2e2" name="Failed" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Intent Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={intentData} cx="50%" cy="45%" outerRadius={80} dataKey="value" label={({ name, percent }) => percent > 0.08 ? `${Math.round(percent*100)}%` : ''}>
                        {intentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(val, name) => [val, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-2">
                    {intentData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {clientUsage.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Commands by Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={clientUsage} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="commands" fill="#3b82f6" name="Total" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="success" fill="#10b981" name="Success" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      </div>
    </div>
  );
}