import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Zap, Loader2, CheckCircle2, AlertCircle, Mic } from 'lucide-react';
import NavBar from '@/components/NavBar';
import CommandStatusTracker from '@/components/CommandStatusTracker';

export default function CommandManagement() {
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState({});

  const { data: commands = [] } = useQuery({
    queryKey: ['commands'],
    queryFn: () => base44.entities.Command.list('-created_date', 100),
    initialData: [],
    refetchInterval: 2000
  });

  useEffect(() => {
    const unsubscribe = base44.entities.Command.subscribe((event) => {
      if (event.type === 'update') {
        setLiveUpdates(prev => ({ ...prev, [event.id]: event.data }));
        // Auto-update selected command if it's being viewed
        setSelectedCommand(prev => prev?.id === event.id ? event.data : prev);
      }
    });
    return unsubscribe;
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'executing': return 'bg-blue-100 text-blue-800';
      case 'reasoning': return 'bg-purple-100 text-purple-800';
      case 'transcribing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (['transcribing', 'reasoning', 'executing'].includes(status)) return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    return <Zap className="w-4 h-4 text-slate-400" />;
  };

  const INTENT_LABELS = {
    send_email: '📧 Send Email',
    schedule_meeting: '📅 Schedule Meeting',
    create_task: '✅ Create Task',
    log_crm: '📊 Log CRM',
    generate_document: '📄 Generate Doc',
    other: '💬 Other'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Voice Commands</h1>
          <p className="text-slate-500 mt-1">Live command processing with real-time status updates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commands List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Live Commands
                  <span className="ml-auto text-xs text-slate-400 font-normal">Auto-updating</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commands.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No commands yet. Use the widget to record.</p>
                  ) : (
                    commands.map((cmd) => {
                      const live = liveUpdates[cmd.id] || cmd;
                      const isActive = ['transcribing', 'reasoning', 'executing'].includes(live.status);
                      return (
                        <div
                          key={cmd.id}
                          onClick={() => setSelectedCommand(live)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedCommand?.id === cmd.id
                              ? 'border-blue-300 bg-blue-50'
                              : isActive
                              ? 'border-blue-200 bg-blue-50/50 animate-pulse'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                {getStatusIcon(live.status)}
                                <span className="font-medium text-sm text-slate-900 truncate">
                                  {live.detected_intent
                                    ? INTENT_LABELS[live.detected_intent] || live.detected_intent
                                    : isActive ? 'Processing...' : 'Command'}
                                </span>
                                <Badge className={`${getStatusColor(live.status)} text-xs ml-auto flex-shrink-0`}>
                                  {live.status}
                                </Badge>
                              </div>

                              {isActive && (
                                <CommandStatusTracker status={live.status} compact />
                              )}

                              {live.transcription && (
                                <p className="text-xs text-slate-500 mt-1.5 truncate">
                                  "{live.transcription?.substring(0, 80)}{live.transcription?.length > 80 ? '...' : ''}"
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-400">
                                  {formatDistanceToNow(new Date(live.created_date), { addSuffix: true })}
                                </p>
                                {live.processing_time_ms > 0 && (
                                  <span className="text-xs text-slate-400">{(live.processing_time_ms / 1000).toFixed(1)}s</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedCommand ? (
              <div className="space-y-3 sticky top-20">
                {/* Live Status */}
                {['transcribing', 'reasoning', 'executing'].includes(selectedCommand.status) && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <CommandStatusTracker status={selectedCommand.status} />
                    </CardContent>
                  </Card>
                )}

                {/* Transcription */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">🎙 Transcription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      {selectedCommand.transcription || 'Transcribing...'}
                    </p>
                  </CardContent>
                </Card>

                {/* Reasoning */}
                {selectedCommand.claude_reasoning && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">🧠 AI Reasoning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedCommand.claude_reasoning}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Result */}
                {selectedCommand.execution_result && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">⚡ Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-slate-100 p-3 rounded-lg overflow-auto max-h-64 leading-relaxed">
                        {JSON.stringify(selectedCommand.execution_result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Error */}
                {selectedCommand.error_message && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-red-900">❌ Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-red-700">{selectedCommand.error_message}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="sticky top-20">
                <CardContent className="pt-10 pb-10 text-center text-slate-400 text-sm">
                  <Zap className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  Select a command to see details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}