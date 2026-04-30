import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Bot, Play, Pause, Plus, Trash2, Mail, CheckSquare,
  Clock, ArrowRight, Zap, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import NavBar from '@/components/NavBar';

const STEP_ICONS = { send_email: '📧', create_task: '✅', wait: '⏱️' };
const CONDITION_LABELS = { always: 'Always', if_no_reply: 'If no reply', if_replied: 'If replied' };

export default function AutoPilot() {
  const [expanded, setExpanded] = useState(null);
  const [creatingFor, setCreatingFor] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: sequences = [], refetch } = useQuery({
    queryKey: ['sequences'],
    queryFn: () => base44.entities.FollowUpSequence.list('-created_date', 50),
    initialData: [],
    refetchInterval: 15000
  });

  const { data: prospects = [] } = useQuery({
    queryKey: ['autopilot-prospects'],
    queryFn: () => base44.entities.Prospect.list('-updated_date', 100),
    initialData: []
  });

  const toggleSequence = async (seq) => {
    const newStatus = seq.status === 'active' ? 'paused' : 'active';
    await base44.entities.FollowUpSequence.update(seq.id, { status: newStatus });
    refetch();
  };

  const cancelSequence = async (id) => {
    await base44.entities.FollowUpSequence.update(id, { status: 'cancelled' });
    refetch();
  };

  const triggerAutoPilot = async (prospectId) => {
    setLoading(true);
    const prospect = prospects.find(p => p.id === prospectId);
    if (!prospect) return;

    // Create a 3-step follow-up sequence via AI
    const res = await base44.functions.invoke('runAutoPilot', {
      prospect_id: prospectId,
      prospect_name: prospect.prospect_name,
      prospect_email: prospect.email,
      company_name: prospect.company_name,
      client_id: prospect.client_id
    });

    setLoading(false);
    setCreatingFor(null);
    refetch();
  };

  const activeSeqs = sequences.filter(s => s.status === 'active');
  const pausedSeqs = sequences.filter(s => s.status === 'paused');
  const completedSeqs = sequences.filter(s => ['completed', 'cancelled'].includes(s.status));

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">AutoPilot</h1>
              <Badge className="bg-violet-100 text-violet-700 border-violet-200">Beta</Badge>
            </div>
            <p className="text-slate-500 ml-13">Autonomous follow-up sequences — the AI works while you sleep</p>
          </div>
          <Button
            onClick={() => setCreatingFor('select')}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Plus className="w-4 h-4" /> New Sequence
          </Button>
        </div>

        {/* How it works */}
        <Card className="mb-8 bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200">
          <CardContent className="pt-6 pb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-600" /> How AutoPilot Works
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
              {[
                '🎤 Voice command sets off sequence',
                '→',
                '🤖 AI drafts follow-up emails',
                '→',
                '📬 Waits for reply detection',
                '→',
                '📧 Sends next step if no reply',
                '→',
                '✅ Books meeting or closes loop'
              ].map((step, i) => (
                <span key={i} className={step === '→' ? 'text-slate-400 font-bold' : 'px-2 py-1 bg-white rounded border border-violet-100'}>
                  {step}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New sequence picker */}
        {creatingFor === 'select' && (
          <Card className="mb-6 border-violet-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select a prospect to start AutoPilot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto mb-4">
                {prospects.filter(p => p.email).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setCreatingFor(p.id)}
                    className="text-left p-3 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-all"
                  >
                    <p className="font-medium text-slate-900 text-sm">{p.prospect_name}</p>
                    <p className="text-xs text-slate-500">{p.company_name} · {p.email}</p>
                  </button>
                ))}
                {prospects.filter(p => p.email).length === 0 && (
                  <div className="col-span-2 text-center py-8 text-slate-400 text-sm">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    No prospects with email addresses. Add emails on the Prospects page first.
                  </div>
                )}
              </div>
              {creatingFor !== 'select' && typeof creatingFor === 'string' && (
                <Button
                  onClick={() => triggerAutoPilot(creatingFor)}
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {loading ? '⏳ Generating sequence...' : '🤖 Generate AI Sequence'}
                </Button>
              )}
              <Button variant="ghost" onClick={() => setCreatingFor(null)} className="ml-2">Cancel</Button>
            </CardContent>
          </Card>
        )}

        {/* When a prospect is selected in creatingFor */}
        {creatingFor && creatingFor !== 'select' && (
          <Card className="mb-6 border-violet-300 bg-violet-50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-700 mb-4">
                Ready to create a 3-step AI follow-up sequence for <strong>{prospects.find(p => p.id === creatingFor)?.prospect_name}</strong>. The AI will draft personalized emails based on their interaction history.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => triggerAutoPilot(creatingFor)}
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {loading ? '⏳ Generating...' : '🤖 Launch AutoPilot'}
                </Button>
                <Button variant="outline" onClick={() => setCreatingFor(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{activeSeqs.length}</p>
                  <p className="text-xs text-slate-500">Active Sequences</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {sequences.reduce((a, s) => a + (s.completed_steps || 0), 0)}
                  </p>
                  <p className="text-xs text-slate-500">Steps Executed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {sequences.filter(s => s.reply_detected).length}
                  </p>
                  <p className="text-xs text-slate-500">Replies Detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sequences */}
        {activeSeqs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active ({activeSeqs.length})
            </h2>
            <div className="space-y-3">
              {activeSeqs.map(seq => (
                <SequenceCard
                  key={seq.id}
                  seq={seq}
                  expanded={expanded === seq.id}
                  onToggleExpand={() => setExpanded(expanded === seq.id ? null : seq.id)}
                  onPause={() => toggleSequence(seq)}
                  onCancel={() => cancelSequence(seq.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Paused */}
        {pausedSeqs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-3">Paused ({pausedSeqs.length})</h2>
            <div className="space-y-3">
              {pausedSeqs.map(seq => (
                <SequenceCard
                  key={seq.id}
                  seq={seq}
                  expanded={expanded === seq.id}
                  onToggleExpand={() => setExpanded(expanded === seq.id ? null : seq.id)}
                  onPause={() => toggleSequence(seq)}
                  onCancel={() => cancelSequence(seq.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedSeqs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-400 mb-3">Completed / Cancelled ({completedSeqs.length})</h2>
            <div className="space-y-2 opacity-60">
              {completedSeqs.map(seq => (
                <SequenceCard key={seq.id} seq={seq} compact />
              ))}
            </div>
          </div>
        )}

        {sequences.length === 0 && !creatingFor && (
          <div className="text-center py-20">
            <Bot className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <h3 className="text-xl font-semibold text-slate-500 mb-2">No sequences yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              Create your first AutoPilot sequence and let the AI handle your follow-ups automatically.
            </p>
            <Button onClick={() => setCreatingFor('select')} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" /> Create First Sequence
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SequenceCard({ seq, expanded, onToggleExpand, onPause, onCancel, compact = false }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-slate-100 text-slate-600'
  };

  const steps = seq.steps || [];
  const progress = seq.total_steps > 0
    ? Math.round((seq.completed_steps / seq.total_steps) * 100)
    : 0;

  return (
    <Card className={`transition-all ${seq.status === 'active' ? 'border-green-200' : ''}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-slate-900">{seq.prospect_name || 'Unknown Prospect'}</p>
              <Badge className={`text-xs ${statusColors[seq.status]}`}>{seq.status}</Badge>
              {seq.reply_detected && (
                <Badge className="text-xs bg-blue-100 text-blue-800">💬 Reply detected</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {seq.completed_steps || 0} of {seq.total_steps || 0} steps done
              {seq.next_step_date && seq.status === 'active' && (
                <> · Next: {format(new Date(seq.next_step_date), 'MMM d, h:mm a')}</>
              )}
            </p>

            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden w-48">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!compact && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {seq.status === 'active' && (
                <Button size="sm" variant="outline" onClick={onPause} className="h-8 gap-1">
                  <Pause className="w-3 h-3" /> Pause
                </Button>
              )}
              {seq.status === 'paused' && (
                <Button size="sm" variant="outline" onClick={onPause} className="h-8 gap-1 text-green-700 border-green-300">
                  <Play className="w-3 h-3" /> Resume
                </Button>
              )}
              {['active', 'paused'].includes(seq.status) && (
                <Button size="sm" variant="ghost" onClick={onCancel} className="h-8 text-red-500 hover:text-red-700">
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
              {steps.length > 0 && (
                <Button size="sm" variant="ghost" onClick={onToggleExpand} className="h-8">
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Step detail */}
        {expanded && steps.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className={`flex items-start gap-3 p-2 rounded-lg ${
                  step.status === 'executed' ? 'bg-green-50' :
                  step.status === 'skipped' ? 'bg-slate-50 opacity-50' : 'bg-blue-50'
                }`}>
                  <span className="text-lg leading-none mt-0.5">{STEP_ICONS[step.action] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-900">
                        Step {step.step_number}: {step.action?.replace(/_/g, ' ')}
                      </p>
                      <Badge variant="outline" className="text-xs">{CONDITION_LABELS[step.condition]}</Badge>
                      {step.delay_days > 0 && (
                        <span className="text-xs text-slate-400">+{step.delay_days}d</span>
                      )}
                    </div>
                    {step.subject && <p className="text-xs text-slate-600 truncate">{step.subject}</p>}
                    {step.task_title && <p className="text-xs text-slate-600">{step.task_title}</p>}
                    {step.executed_at && (
                      <p className="text-xs text-green-600">
                        ✅ Executed {formatDistanceToNow(new Date(step.executed_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <Badge className={`text-xs flex-shrink-0 ${
                    step.status === 'executed' ? 'bg-green-100 text-green-800' :
                    step.status === 'skipped' ? 'bg-slate-100 text-slate-500' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}