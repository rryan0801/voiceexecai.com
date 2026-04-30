import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { Users, Award, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NavBar from '@/components/NavBar';

const INTENT_MAP = {
  send_email: { label: 'Email', icon: '📧', field: 'emails_sent' },
  schedule_meeting: { label: 'Meeting', icon: '📅', field: 'meetings_booked' },
  create_task: { label: 'Task', icon: '✅', field: 'tasks_created' },
  log_crm: { label: 'CRM Log', icon: '📊', field: 'crm_logs' },
  generate_document: { label: 'Doc', icon: '📄', field: 'docs' },
};

// Estimate minutes saved per action type
const MINUTES_SAVED = { send_email: 8, schedule_meeting: 12, create_task: 4, log_crm: 6, generate_document: 20 };

export default function TeamView() {
  const [selectedRep, setSelectedRep] = useState(null);

  const { data: commands = [] } = useQuery({
    queryKey: ['team-commands'],
    queryFn: () => base44.entities.Command.list('-created_date', 500),
    initialData: [],
    refetchInterval: 30000
  });

  const { data: prospects = [] } = useQuery({
    queryKey: ['team-prospects'],
    queryFn: () => base44.entities.Prospect.list('-updated_date', 200),
    initialData: []
  });

  // Build rep profiles from command data grouped by created_by
  const repMap = {};
  commands.forEach(cmd => {
    const key = cmd.created_by || 'unknown';
    if (!repMap[key]) {
      repMap[key] = {
        email: key,
        name: key.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        total: 0, completed: 0, failed: 0, emails: 0, meetings: 0, tasks: 0, crm: 0, docs: 0,
        minutesSaved: 0, lastActive: null, commands: []
      };
    }
    const r = repMap[key];
    r.total++;
    r.commands.push(cmd);
    if (cmd.status === 'completed') r.completed++;
    if (cmd.status === 'failed') r.failed++;
    const intent = cmd.detected_intent;
    if (intent === 'send_email') r.emails++;
    if (intent === 'schedule_meeting') r.meetings++;
    if (intent === 'create_task') r.tasks++;
    if (intent === 'log_crm') r.crm++;
    if (intent === 'generate_document') r.docs++;
    r.minutesSaved += MINUTES_SAVED[intent] || 3;
    if (!r.lastActive || new Date(cmd.created_date) > new Date(r.lastActive)) {
      r.lastActive = cmd.created_date;
    }
  });

  const reps = Object.values(repMap).sort((a, b) => b.total - a.total);

  // Team totals
  const teamTotals = reps.reduce((acc, r) => ({
    total: acc.total + r.total,
    emails: acc.emails + r.emails,
    meetings: acc.meetings + r.meetings,
    tasks: acc.tasks + r.tasks,
    minutesSaved: acc.minutesSaved + r.minutesSaved
  }), { total: 0, emails: 0, meetings: 0, tasks: 0, minutesSaved: 0 });

  // Daily activity for last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayStr = format(d, 'MMM d');
    const dayCommands = commands.filter(c => format(new Date(c.created_date), 'MMM d') === dayStr);
    return {
      day: dayStr,
      commands: dayCommands.length,
      completed: dayCommands.filter(c => c.status === 'completed').length
    };
  });

  const selectedRepData = selectedRep ? repMap[selectedRep] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Team Performance</h1>
          <p className="text-slate-500 mt-1">Manager view — all rep activity in one place</p>
        </div>

        {/* Team KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Commands', value: teamTotals.total, emoji: '⚡', bg: 'bg-blue-100' },
            { label: 'Emails Sent', value: teamTotals.emails, emoji: '📧', bg: 'bg-green-100' },
            { label: 'Meetings Booked', value: teamTotals.meetings, emoji: '📅', bg: 'bg-purple-100' },
            { label: 'Tasks Created', value: teamTotals.tasks, emoji: '✅', bg: 'bg-orange-100' },
            { label: 'Hours Saved', value: `${Math.round(teamTotals.minutesSaved / 60)}h`, emoji: '⏱️', bg: 'bg-teal-100' },
          ].map(({ label, value, emoji, bg }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-lg ${bg}`}>{emoji}</div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rep Leaderboard */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="w-4 h-4 text-amber-500" /> Rep Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reps.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">No rep activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {reps.map((rep, i) => (
                      <div
                        key={rep.email}
                        onClick={() => setSelectedRep(selectedRep === rep.email ? null : rep.email)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedRep === rep.email
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-slate-300'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{rep.name}</p>
                            <p className="text-xs text-slate-400 truncate">{rep.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{rep.total}</p>
                            <p className="text-xs text-slate-400">cmds</p>
                          </div>
                        </div>

                        {/* Mini stats */}
                        <div className="flex gap-3 mt-2 text-xs text-slate-500">
                          <span>📧 {rep.emails}</span>
                          <span>📅 {rep.meetings}</span>
                          <span>✅ {rep.tasks}</span>
                          <span className="ml-auto text-green-600 font-medium">
                            ~{Math.round(rep.minutesSaved / 60)}h saved
                          </span>
                        </div>

                        {rep.lastActive && (
                          <p className="text-xs text-slate-400 mt-1">
                            Active {formatDistanceToNow(new Date(rep.lastActive), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* 7-Day Activity Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4" /> Team Activity — Last 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={last7}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="commands" fill="#e2e8f0" name="Total" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Selected Rep Detail */}
            {selectedRepData ? (
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    {selectedRepData.name} — Drill Down
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Emails', value: selectedRepData.emails, emoji: '📧' },
                      { label: 'Meetings', value: selectedRepData.meetings, emoji: '📅' },
                      { label: 'Tasks', value: selectedRepData.tasks, emoji: '✅' },
                      { label: 'Hrs Saved', value: `${Math.round(selectedRepData.minutesSaved / 60)}h`, emoji: '⏱️' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-lg">{s.emoji}</p>
                        <p className="text-xl font-bold text-slate-900">{s.value}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Recent Commands</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedRepData.commands.slice(0, 10).map(cmd => (
                      <div key={cmd.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{INTENT_MAP[cmd.detected_intent]?.icon || '🎤'}</span>
                          <div>
                            <p className="text-xs font-medium text-slate-800">
                              {INTENT_MAP[cmd.detected_intent]?.label || 'Command'}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">
                              {cmd.transcription?.substring(0, 50)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`text-xs ${cmd.status === 'completed' ? 'bg-green-100 text-green-800' : cmd.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {cmd.status}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(cmd.created_date), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-10 pb-10 text-center text-slate-400 text-sm">
                  <Users className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  Click a rep to see their full activity breakdown
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}